<?php

namespace App\Http\Controllers\tags;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    /**
     * Recalculate total_pub_compteur for all tags.
     * Uses a recursive CTE to include all descendants.
     * Only counts publications with status = 1.
     */
    private function recalcTotalPubCompteur(): void
    {
        DB::statement( 'DROP TEMPORARY TABLE IF EXISTS temp_tag_counts' );

        DB::statement( "
            CREATE TEMPORARY TABLE temp_tag_counts AS
            WITH RECURSIVE tag_tree AS (
                SELECT id AS root_id, id AS tag_id
                FROM tags_flink
                UNION ALL
                SELECT tt.root_id, t.id
                FROM tag_tree tt
                JOIN tags_flink t ON t.master = tt.tag_id
            ),
            counts AS (
                SELECT tt.root_id, COUNT(DISTINCT pt.publication_id) AS cnt
                FROM tag_tree tt
                LEFT JOIN publications_tags_flink pt ON pt.tag_id = tt.tag_id
                LEFT JOIN publications_flink p ON p.id = pt.publication_id
                WHERE pt.publication_id IS NULL OR p.status = 1
                GROUP BY tt.root_id
            )
            SELECT root_id, cnt FROM counts
        " );

        DB::statement( "
            UPDATE tags_flink t
            LEFT JOIN temp_tag_counts c ON c.root_id = t.id
            SET t.total_pub_compteur = COALESCE(c.cnt, 0)
        " );

        DB::statement( 'DROP TEMPORARY TABLE IF EXISTS temp_tag_counts' );
    }
    /**
     * Build parent hierarchy for a tag
     * Returns array of parent tags from root to immediate parent
     */
    private function buildParentHierarchy( $tag, $allTags = null )
    {
        $parents = [];
        $currentTag = $tag;
        $visited = []; // Prevent circular references

        if ($allTags === null) {
            $allTags = Tag::all()->keyBy( 'id' );
        }

        while ($currentTag) {
            // Check if current tag has a master - use is_null() to be explicit
            $masterValue = $currentTag->master;

            // Exit ONLY if master is explicitly null (ID 1 is valid!)
            if (is_null( $masterValue )) {
                break;
            }

            // Convert to integer - this handles ID 1 correctly
            $masterId = (int) $masterValue;
            $currentTagId = (int) $currentTag->id;

            // Skip if master ID is 0 (invalid) or if tag is its own master
            if ($masterId === 0 || $masterId === $currentTagId) {
                break;
            }

            // Prevent circular references
            if (in_array( $masterId, $visited, true )) {
                break;
            }

            $visited[] = $masterId;

            // ALWAYS fetch from database first to ensure ID 1 works correctly
            $parentTag = Tag::find( $masterId );

            // If found, add it to the collection for future lookups
            if ($parentTag && $allTags instanceof \Illuminate\Support\Collection) {
                $allTags->put( $masterId, $parentTag );
            }

            // If parent not found, stop traversal
            if (!$parentTag) {
                break;
            }

            // Verify we got the correct parent
            $parentTagId = (int) $parentTag->id;
            if ($parentTagId !== $masterId) {
                break; // Parent ID mismatch, stop traversal
            }

            // Add parent to beginning of array (root first)
            array_unshift( $parents, [
                'id' => $parentTag->id,
                'name' => $parentTag->name,
                'slug' => $parentTag->slug,
                'master' => $parentTag->master,
            ] );

            $currentTag = $parentTag;
        }
        return $parents;
    }

    public function tags( Request $request )
    {
        $searchTerm = $request->query( 'search' );
        try {
            // Build the base query to get tags - only return tags where mngr_is_index is 1 or 2
            $query = Tag::select( 'id', 'name', 'slug', 'master', 'status', 'compteur_publications', 'compteur_search', 'mngr_is_index', 'canonical_parent' )
                ->whereIn( 'mngr_is_index', [1, 2] );

            // Apply the search filter if a search term is provided
            if ($searchTerm) {
                $trimmedSearchTerm = trim( $searchTerm );
                $query->where( function ( $query ) use ( $trimmedSearchTerm ) {
                    $query->where( 'name', 'like', '%' . $trimmedSearchTerm . '%' )
                        ->orWhere( 'slug', 'like', '%' . $trimmedSearchTerm . '%' );
                } );

                // Add priority ordering: exact matches first (highest priority), then prefix matches, then partial matches
                // Exact matches are always first regardless of length or other factors
                // Within each priority, sort by length difference (closest to search term length first)
                // Then sort by compteur_publications as final sort
                $searchTermLength = strlen( $trimmedSearchTerm );
                $query->orderByRaw( "
                    CASE 
                        WHEN name = ? THEN 0
                        WHEN slug = ? THEN 0
                        WHEN name LIKE ? THEN 1
                        WHEN slug LIKE ? THEN 1
                        ELSE 2
                    END ASC,
                    LEAST(
                        ABS(LENGTH(name) - ?),
                        ABS(LENGTH(slug) - ?)
                    ) ASC,
                    compteur_publications DESC
                ", [
                    $trimmedSearchTerm,
                    $trimmedSearchTerm,
                    $trimmedSearchTerm . '%',
                    $trimmedSearchTerm . '%',
                    $searchTermLength,
                    $searchTermLength
                ] );
            } else {
                // If no search term, order by compteur_publications
                $query->orderBy( 'compteur_publications', 'desc' );
            }

            // Fetch the tags with the search filter applied
            $tags = $query->limit( 5 )->get();

            // If no tags are found, remove the search filter and fetch all indexed tags (1 or 2)
            if ($tags->isEmpty() && $searchTerm) {
                $tags = Tag::select( 'id', 'name', 'slug', 'master', 'status', 'compteur_publications', 'compteur_search', 'mngr_is_index', 'canonical_parent' )
                    ->whereIn( 'mngr_is_index', [1, 2] )
                    ->where( 'status', 1 )
                    ->orderBy( 'compteur_publications', 'desc' )
                    ->limit( 5 )
                    ->get();
            }

            // Get all tags for hierarchy building (to avoid N+1 queries)
            $allTags = Tag::all()->keyBy( 'id' );

            // Build parent hierarchy for each tag
            $tagsWithParents = $tags->map( function ( $tag ) use ( $allTags ) {
                $tagArray = $tag->toArray();
                $tagArray['parents'] = $this->buildParentHierarchy( $tag, $allTags );

                // Add master tag information (name, slug, and mngr_is_index) directly to the tag response
                // ALWAYS fetch from database to ensure ID 1 works correctly
                $masterValue = $tag->master;

                // Only check if master is NOT null (ID 1 is valid!)
                if (!is_null( $masterValue )) {
                    $masterId = (int) $masterValue;
                    $currentTagId = (int) $tag->id;

                    // Skip if master ID is 0 (invalid) or if tag is its own master
                    if ($masterId !== 0 && $masterId !== $currentTagId) {
                        // ALWAYS fetch directly from database - this ensures ID 1 works
                        $masterTag = Tag::find( $masterId );

                        // Verify we got the correct master tag
                        if ($masterTag && (int) $masterTag->id === $masterId) {
                            $tagArray['master_tag'] = [
                                'id' => $masterTag->id,
                                'name' => $masterTag->name,
                                'slug' => $masterTag->slug,
                                'mngr_is_index' => $masterTag->mngr_is_index ?? 0,
                            ];

                            // Add to collection for future lookups
                            if ($allTags instanceof \Illuminate\Support\Collection) {
                                $allTags->put( $masterId, $masterTag );
                            }
                        } else {
                            $tagArray['master_tag'] = null;
                        }
                    } else {
                        $tagArray['master_tag'] = null;
                    }
                } else {
                    $tagArray['master_tag'] = null;
                }

                return $tagArray;
            } );

            // Return the response with the fetched data
            return response()->json( ['status' => 201, 'data' => $tagsWithParents->values()->all()] );

        } catch (\Exception $e) {
            return response()->json( ['status' => 500, 'error' => 'An error occurred: ' . $e->getMessage()] );
        }
    }

    public function getAllTags( Request $request )
    {
        $order = $request->query( 'order' );
        $status = $request->query( 'status' );
        $search = $request->query( 'search' );
        $exact = $request->query( 'exact' ); // Check if exact search mode is enabled
        try {
            // Apply search filter first if a search term is provided
            if ($search && trim( $search ) !== '') {
                $searchTerm = trim( $search );
                $tags = Tag::where( function ( $query ) use ( $searchTerm ) {
                    $query->where( 'name', 'like', '%' . $searchTerm . '%' )
                        ->orWhere( 'slug', 'like', '%' . $searchTerm . '%' );
                } );

                // If exact mode is enabled, use priority ordering (exact matches first, then prefix, then partial)
                if ($exact == '1' || $exact === 'true' || $exact === true) {
                    // Add priority ordering: exact matches first (highest priority), then prefix matches, then partial matches
                    // Exact matches are always first regardless of length or other factors
                    // Within each priority, sort by length difference (closest to search term length first)
                    // Then sort by compteur_publications as final sort
                    $searchTermLength = strlen( $searchTerm );
                    $tags = $tags->orderByRaw( "
                        CASE 
                            WHEN name = ? THEN 0
                            WHEN slug = ? THEN 0
                            WHEN name LIKE ? THEN 1
                            WHEN slug LIKE ? THEN 1
                            ELSE 2
                        END ASC,
                        LEAST(
                            ABS(LENGTH(name) - ?),
                            ABS(LENGTH(slug) - ?)
                        ) ASC,
                        compteur_publications DESC
                    ", [
                        $searchTerm,
                        $searchTerm,
                        $searchTerm . '%',
                        $searchTerm . '%',
                        $searchTermLength,
                        $searchTermLength
                    ] );
                } else {
                    // When searching without exact mode, order by search count (highest first)
                    $tags = $tags->orderByDesc( 'compteur_search' );
                }
            } else {
                // Apply order only when not searching
                if ($order == "old")
                    $tags = Tag::orderBy( 'created_at' );
                else if ($order == "high-search")
                    $tags = Tag::orderByDesc( 'compteur_search' );
                else if ($order == "high-publications")
                    $tags = Tag::orderByDesc( 'compteur_publications' );
                else
                    $tags = Tag::orderByDesc( 'created_at' );
            }

            if ($status == "1")
                $tags = $tags->where( 'status', 1 );
            else if ($status == "0")
                $tags = $tags->where( 'status', 0 );

            $tags = $tags->paginate( 20 );

            // Optimize: Only get tags needed for hierarchy building (from current page and their parents)
            $tagIds = $tags->getCollection()->pluck( 'id' )->map( function ( $id ) {
                return (int) $id;
            } )->toArray();
            // Explicitly filter for non-null master IDs (including ID 1) and cast to integers
            // Note: We keep 0 if it exists as a valid master ID, but typically NULL is used for "no master"
            $parentIds = $tags->getCollection()->pluck( 'master' )->filter( function ( $value ) {
                return $value !== null && $value !== '';
            } )->map( function ( $id ) {
                return (int) $id;
            } )->unique()->toArray();

            // Get all needed tags in one query
            $allNeededIds = array_unique( array_merge( $tagIds, $parentIds ) );
            // Ensure we have at least one ID to avoid empty whereIn clause
            if (empty( $allNeededIds )) {
                $allTags = collect();
            } else {
                $allTags = Tag::whereIn( 'id', $allNeededIds )->get()->keyBy( 'id' );
            }

            // If parents have parents, get them too (one level deep should be enough for most cases)
            if (!empty( $parentIds )) {
                $grandParentIds = Tag::whereIn( 'id', $parentIds )
                    ->whereNotNull( 'master' )
                    ->pluck( 'master' )
                    ->filter( function ( $value ) {
                        return $value !== null && $value !== '';
                    } )
                    ->map( function ( $id ) {
                        return (int) $id;
                    } )
                    ->unique()
                    ->toArray();
            } else {
                $grandParentIds = [];
            }

            if (!empty( $grandParentIds )) {
                $grandParents = Tag::whereIn( 'id', $grandParentIds )->get()->keyBy( 'id' );
                $allTags = $allTags->merge( $grandParents );
            }

            // Build parent hierarchy for each tag in paginated results
            $tags->getCollection()->transform( function ( $tag ) use ( $allTags ) {
                $tagArray = $tag->toArray();
                $tagArray['parents'] = $this->buildParentHierarchy( $tag, $allTags );

                // Add master tag information (name, slug, and mngr_is_index) directly to the tag response
                // ALWAYS fetch from database to ensure ID 1 works correctly
                $masterValue = $tag->master;

                // Only check if master is NOT null (ID 1 is valid!)
                if (!is_null( $masterValue )) {
                    $masterId = (int) $masterValue;
                    $currentTagId = (int) $tag->id;

                    // Skip if master ID is 0 (invalid) or if tag is its own master
                    if ($masterId !== 0 && $masterId !== $currentTagId) {
                        // ALWAYS fetch directly from database - this ensures ID 1 works
                        $masterTag = Tag::find( $masterId );

                        // Verify we got the correct master tag
                        if ($masterTag && (int) $masterTag->id === $masterId) {
                            $tagArray['master_tag'] = [
                                'id' => $masterTag->id,
                                'name' => $masterTag->name,
                                'slug' => $masterTag->slug,
                                'mngr_is_index' => $masterTag->mngr_is_index ?? 0,
                            ];

                            // Add to collection for future lookups
                            if ($allTags instanceof \Illuminate\Support\Collection) {
                                $allTags->put( $masterId, $masterTag );
                            }
                        } else {
                            $tagArray['master_tag'] = null;
                        }
                    } else {
                        $tagArray['master_tag'] = null;
                    }
                } else {
                    // No master - set to null
                    $tagArray['master_tag'] = null;
                }

                // Ensure the master tag is explicitly included in parents array if it exists
                // This helps the frontend display the master tag correctly in the sidebar
                // Use strict comparison to ensure master ID 1 is handled correctly
                $masterValue = $tag->master;
                if ($masterValue !== null && $masterValue !== 0 && $masterValue !== '') {
                    $masterId = (int) $masterValue;
                    $currentTagId = (int) $tag->id;

                    // Ensure master is not the tag itself (safety check)
                    if ($masterId !== $currentTagId) {
                        $masterTag = null;

                        // Check if collection is not empty
                        if ($allTags && $allTags->count() > 0) {
                            // Try to get from collection (try both int and string keys)
                            if ($allTags->has( $masterId )) {
                                $masterTag = $allTags->get( $masterId );
                            } elseif ($allTags->has( (string) $masterId )) {
                                $masterTag = $allTags->get( (string) $masterId );
                            }
                            // Try to find by iterating (in case keyBy didn't work as expected)
                            else {
                                $masterTag = $allTags->first( function ( $item ) use ( $masterId ) {
                                    return (int) $item->id === $masterId;
                                } );
                            }
                        }

                        // If not found, ALWAYS fetch from database (this ensures ID 1 is always found)
                        if (!$masterTag) {
                            $masterTag = Tag::find( $masterId );
                            // Add to collection for future lookups
                            if ($masterTag && $allTags instanceof \Illuminate\Support\Collection) {
                                $allTags->put( $masterId, $masterTag );
                            }
                        }

                        // Verify we got the correct master tag
                        if ($masterTag && (int) $masterTag->id === $masterId) {
                            // Check if master tag is already in parents array (should be last item)
                            $masterInParents = false;
                            if (!empty( $tagArray['parents'] )) {
                                $lastParent = end( $tagArray['parents'] );
                                if ($lastParent && isset( $lastParent['id'] ) && (int) $lastParent['id'] === $masterId) {
                                    $masterInParents = true;
                                }
                            }

                            // If master tag is not in parents array, add it
                            // This ensures the frontend can always find the master tag
                            if (!$masterInParents) {
                                $tagArray['parents'][] = [
                                    'id' => $masterTag->id,
                                    'name' => $masterTag->name,
                                    'slug' => $masterTag->slug,
                                    'master' => $masterTag->master,
                                ];
                            }
                        }
                    }
                }

                return $tagArray;
            } );

            // Return the response with the fetched data
            return response()->json( ['status' => 201, 'data' => $tags] );

        } catch (\Exception $e) {
            return response()->json( ['status' => 500, 'error' => 'An error occurred: ' . $e->getMessage()] );
        }
    }

    public function updateTag( Request $request )
    {
        $tagId = $request->get( 'tagId' );
        $status = $request->get( 'status' );
        $master = $request->get( 'master' ); // Parent tag ID (null if no parent)
        $name = $request->get( 'name' );
        $slug = $request->get( 'slug' );
        try {
            $tag = Tag::find( $tagId );
            if ($tag) {
                $previousMaster = $tag->master;
                // Prevent setting itself as parent
                if ($master !== null && (int) $master === (int) $tagId) {
                    return response()->json( [
                        'success' => false,
                        'message' => 'A tag cannot be its own parent',
                    ], 400 );
                }

                // Prevent circular references (check if master is a descendant)
                if ($master !== null) {
                    $masterTag = Tag::find( $master );
                    if ($masterTag) {
                        $visited = [];
                        $current = $masterTag;
                        while ($current && $current->master !== null && $current->master !== 0) {
                            $currentMasterId = (int) $current->master;
                            // Prevent tag from being its own master
                            if ($currentMasterId === (int) $current->id) {
                                break; // Tag cannot be its own master
                            }
                            if ($currentMasterId === (int) $tagId) {
                                return response()->json( [
                                    'success' => false,
                                    'message' => 'Circular reference detected. Cannot set this tag as parent.',
                                ], 400 );
                            }
                            if (in_array( $currentMasterId, $visited ))
                                break;
                            $visited[] = $currentMasterId;
                            $current = Tag::find( $currentMasterId );
                            if (!$current)
                                break;
                        }
                    }
                }

                $tag->name = $name;
                $tag->slug = $slug;
                $tag->status = $status;
                $tag->master = ( $master !== null && $master !== '' && $master !== '0' ) ? (int) $master : null;

                // Handle mngr_is_index and canonical_parent fields
                if ($request->has( 'mngr_is_index' )) {
                    $mngrVal = (int) $request->get( 'mngr_is_index' );
                    $tag->mngr_is_index = in_array( $mngrVal, [0, 1, 2] ) ? $mngrVal : ( $mngrVal ? 1 : 0 );
                }
                if ($request->has( 'canonical_parent' )) {
                    $tag->canonical_parent = $request->get( 'canonical_parent' ) == '1' || $request->get( 'canonical_parent' ) == 1 ? 1 : 0;
                }

                $tag->save();

                if ($previousMaster !== $tag->master) {
                    $this->recalcTotalPubCompteur();
                }

                // Build parent hierarchy for the updated tag
                $allTags = Tag::all()->keyBy( 'id' );
                $tagArray = $tag->toArray();
                $tagArray['parents'] = $this->buildParentHierarchy( $tag, $allTags );

                // Add master tag information (name, slug, and mngr_is_index) directly to the tag response
                // ALWAYS fetch from database to ensure ID 1 works correctly
                $masterValue = $tag->master;

                // Only check if master is NOT null (ID 1 is valid!)
                if (!is_null( $masterValue )) {
                    $masterId = (int) $masterValue;
                    $currentTagId = (int) $tag->id;

                    // Skip if master ID is 0 (invalid) or if tag is its own master
                    if ($masterId !== 0 && $masterId !== $currentTagId) {
                        // ALWAYS fetch directly from database - this ensures ID 1 works
                        $masterTag = Tag::find( $masterId );

                        // Verify we got the correct master tag
                        if ($masterTag && (int) $masterTag->id === $masterId) {
                            $tagArray['master_tag'] = [
                                'id' => $masterTag->id,
                                'name' => $masterTag->name,
                                'slug' => $masterTag->slug,
                                'mngr_is_index' => $masterTag->mngr_is_index ?? 0,
                            ];

                            // Add to collection for future lookups
                            if ($allTags instanceof \Illuminate\Support\Collection) {
                                $allTags->put( $masterId, $masterTag );
                            }
                        } else {
                            $tagArray['master_tag'] = null;
                        }
                    } else {
                        $tagArray['master_tag'] = null;
                    }
                } else {
                    $tagArray['master_tag'] = null;
                }

                return response()->json( [
                    'success' => true,
                    'data' => $tagArray,
                ], 200 );
            } else {
                return response()->json( [
                    'message' => 'Une erreur est survenue Tag not Found',
                ], 500 );
            }
        } catch (\Throwable $e) {
            return response()->json( [
                'message' => 'Une erreur est survenue: ' . $e->getMessage(),
            ], 500 );
        }
    }

    public function toggleTagField( Request $request )
    {
        $tagId = $request->get( 'tagId' );
        $field = $request->get( 'field' ); // 'mngr_is_index' or 'canonical_parent'
        $value = $request->get( 'value' ); // 0 or 1

        try {
            // Validate field name
            if (!in_array( $field, ['mngr_is_index', 'canonical_parent'] )) {
                return response()->json( [
                    'success' => false,
                    'message' => 'Invalid field name. Must be "mngr_is_index" or "canonical_parent"',
                ], 400 );
            }

            $tag = Tag::find( $tagId );
            if (!$tag) {
                return response()->json( [
                    'success' => false,
                    'message' => 'Tag not found',
                ], 404 );
            }

            // Set the field value
            if ($field === 'mngr_is_index') {
                $mngrVal = (int) $value;
                $tag->mngr_is_index = in_array( $mngrVal, [0, 1, 2] ) ? $mngrVal : ( $mngrVal ? 1 : 0 );
            } else {
                $tag->$field = $value == '1' || $value == 1 ? 1 : 0;
            }
            $tag->save();

            // Build parent hierarchy for the updated tag
            $allTags = Tag::all()->keyBy( 'id' );
            $tagArray = $tag->toArray();
            $tagArray['parents'] = $this->buildParentHierarchy( $tag, $allTags );

            // Add master tag information (name, slug, and mngr_is_index) directly to the tag response
            // ALWAYS fetch from database to ensure ID 1 works correctly
            $masterValue = $tag->master;

            // Only check if master is NOT null (ID 1 is valid!)
            if (!is_null( $masterValue )) {
                $masterId = (int) $masterValue;
                $currentTagId = (int) $tag->id;

                // Skip if master ID is 0 (invalid) or if tag is its own master
                if ($masterId !== 0 && $masterId !== $currentTagId) {
                    // ALWAYS fetch directly from database - this ensures ID 1 works
                    $masterTag = Tag::find( $masterId );

                    // Verify we got the correct master tag
                    if ($masterTag && (int) $masterTag->id === $masterId) {
                        $tagArray['master_tag'] = [
                            'id' => $masterTag->id,
                            'name' => $masterTag->name,
                            'slug' => $masterTag->slug,
                            'mngr_is_index' => $masterTag->mngr_is_index ?? 0,
                        ];

                        // Add to collection for future lookups
                        if ($allTags instanceof \Illuminate\Support\Collection) {
                            $allTags->put( $masterId, $masterTag );
                        }
                    } else {
                        $tagArray['master_tag'] = null;
                    }
                } else {
                    $tagArray['master_tag'] = null;
                }
            } else {
                $tagArray['master_tag'] = null;
            }

            return response()->json( [
                'success' => true,
                'data' => $tagArray,
                'message' => ucfirst( str_replace( '_', ' ', $field ) ) . ' updated successfully',
            ], 200 );

        } catch (\Throwable $e) {
            return response()->json( [
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage(),
            ], 500 );
        }
    }

    public function deleteTag( $tagId )
    {
        try {
            $tag = Tag::find( $tagId );
            $tag->delete();
            $this->recalcTotalPubCompteur();

            return response()->json( [
                'success' => true,
                'data' => $tag,
            ], 200 );
        } catch (\Throwable $e) {
            return response()->json( [
                'message' => 'Une erreur est survenue',
            ], 500 );
        }
    }
}
