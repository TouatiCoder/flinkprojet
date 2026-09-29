<?php

namespace App\Http\Controllers\publication;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Publication;
use Illuminate\Support\Facades\Storage;
use App\Models\Tag;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class PublicationController extends Controller
{
    public function getPublications(Request $request) {
        $order = $request->get('order');
        $status = $request->get('status');
        try {

            $publications = Publication::with('user', 'etablissement', 'tags');
            if($status != "") $publications = $publications->where('status', $status);

            if($order == 'new') $publications = $publications->orderByDesc('created_at');
            else if($order == 'old') $publications = $publications->orderBy('created_at');
            else $publications = $publications->orderByDesc('updated_at');
            
            $publications = $publications->paginate(25);

            return response()->json([
                'data' => $publications,
                'order' => $order,
                'status' => $status,
            ], 200);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Une erreur est survenue',
            ], 500);
        }
    }

    public function updatePublication(Request $request) {
        $publicationId = $request->get('publicationId');
        $status = $request->get('status');
        $rejectReason = $request->get('rejectReason');
        $isMarketplace = $request->get('isMarketplace');
        $tags = $request->get('tags');
        $tagIds = [];
        try {
            $publication = Publication::find($publicationId);
            $publication->status = $status;
            if($rejectReason) $publication->reason_rejection = $rejectReason;
            $publication->is_marketplace = $isMarketplace;
            foreach($tags as $tag) {
                if( array_key_exists('isCustom', $tag) && array_key_exists('name', $tag) ) {
                    $checkExistTag = Tag::where('name', $tag['name'])->first();
                    if(!$checkExistTag) {
                        $newTag = new Tag();
                        $newTag->name = $tag['name'];
                        $newTag->slug = $this->generateUniqueSlug($tag['name']);
                        $newTag->status = 1;
                        $newTag->compteur_publications = 1;
                        $newTag->save();
                        $NewTag = Tag::where('slug', $newTag->slug)->first();
                        $tagIds[] =  $NewTag->id;
                    } else {
                        $tagIds[] = $checkExistTag->id;
                        $checkExistTag->compteur_publications += 1;
                        $checkExistTag->save();
                    }
                } 
                else if(Tag::find($tag['id'])) {
                    $tagIds[] = $tag['id'];
                    $selectedTag = Tag::find($tag['id']);
                    $selectedTag->compteur_publications += 1;
                    $selectedTag->save();
                }
            }
            $publication->tags()->sync($tagIds);
            $publication->save();

            if($status == 1) {
                // Déclencher la notification vers l'API
                $response = Http::post('https://1azsq21dfsffs45ytuiooihgzgz.flink.ma/api/notifications/declanche_manager', [
                    'type' => 'publication_approved',
                    'publication_id' => $publication->id,
                ]);
            } else if($status == 2) {
                // Déclencher la notification vers l'API
                $response = Http::post('https://1azsq21dfsffs45ytuiooihgzgz.flink.ma/api/notifications/declanche_manager', [
                    'type' => 'publication_deleted',
                    'publication_id' => $publication->id,
                ]);
            } else if($status == 3) {
                // Déclencher la notification vers l'API
                $response = Http::post('https://1azsq21dfsffs45ytuiooihgzgz.flink.ma/api/notifications/declanche_manager', [
                    'type' => 'publication_rejected',
                    'publication_id' => $publication->id,
                ]);
            }

            return response()->json([
                'data' => $publication,
                'test' => $tagIds,
            ], 200);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Une erreur est survenue',
            ], 500);
        }
    }

    public function deletePublication($publicationId) {

        try {
            $publication = Publication::with('tags')->find($publicationId);
            // foreach($publication->tags as $tag) {
            //     $tag->compteur_publications -= 1;
            //     $tag->save();
            // }
            $this->deletePublicationFiles($publication);
            $publication->delete();

            return response()->json([
                'data' => $publication,
            ], 200);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Une erreur est survenue',
            ], 500);
        }
    }

    private function deletePublicationFiles($publication) {
        try {
            // Delete image_default if exists
            if ($publication->image_default) {
                Storage::disk('ftp')->delete($publication->image_default);
            }
            
            // Delete images if exists
            if ($publication->images) {
                foreach(json_decode($publication->images, true) as $imgUrl) {
                    Storage::disk('ftp')->delete($imgUrl);
                }
            }
            
            // Delete video_origine if exists
            if ($publication->video_origine) {
                Storage::disk('ftp')->delete($publication->video_origine);
            }

            // Delete video_compresse if exists
            if ($publication->video_compresse) {
                Storage::disk('ftp')->delete($publication->video_compresse);
            }

            // Delete maniature if exists
            if ($publication->miniature) {
                Storage::disk('ftp')->delete($publication->miniature);
            }
            
        } catch (\Exception $e) {
            // Log the file deletion error but don't stop the process
            \Log::error("Failed to delete files for publication {$publication->id}: " . $e->getMessage());
        }
    }

    private function generateUniqueSlug($name): string {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;
        
        while (Tag::where('slug', $originalSlug)->exists()) {
            $slug = Str::slug($originalSlug . '-' . $count);
            $count++;
        }
        
        return $slug;
    }
}
