<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserManager;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    // Login a user
    public function login(Request $request) {
        $validated = $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        // Attempt to find the user by username
        $user = UserManager::where('username', $validated['username'])->first();
        // $user->password = Hash::make($validated['password']);
        // $user->save();

        // Check if user exists and password is correct
        if ($user && Hash::check($validated['password'], $user->password)) {
            // Create a token for the user
            $token = $user->createToken('Flink')->plainTextToken;

            return response()->json(['token' => $token]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Logout the user
    public function logout(Request $request) {
        $request->user()->tokens->each(function ($token) {
            $token->delete();
        });

        return response()->json(['message' => 'Logged out successfully']);
    }

    // Get authenticated user
    public function user(Request $request) {
        return response()->json($request->user());
    }


    public function index() {
        $users = UserManager::with('role')->get(); 

        return response()->json([
            'status' => 'success',
            'data'   => $users
        ], 200);
    }

public function register(Request $request) {
        $validated = $request->validate([
            'username'   => 'required|string|unique:manager_users,username|max:255',
            'password'   => 'required|string|min:6',
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:manager_users,email|max:255',
            'role_id'    => 'required|exists:ma_roles,id',
        ]);

        $user = UserManager::create([
            'username'   => $validated['username'],
            'password'   => Hash::make($validated['password']),
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'role_id'    => $validated['role_id'],
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'User created successfully',
            'data'    => $user
        ], 201);
    }

public function destroy($id) {
        $user = UserManager::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'User deleted successfully'
        ], 200);
}

    public function edit($id) {
        $user = UserManager::with('role')->find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $roles = \App\Models\MaRole::select('id', 'name')->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'user'  => $user,
                'roles' => $roles
            ]
        ], 200);
    }

    public function update(Request $request, $id) {
        $user = UserManager::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $validated = $request->validate([
            'username'   => 'required|string|max:255|unique:manager_users,username,' . $id,
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|max:255|unique:manager_users,email,' . $id,
            'role_id'    => 'required|exists:ma_roles,id',
            'password'   => 'nullable|string|min:6',
        ]);

        $updateData = [
            'username'   => $validated['username'],
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'role_id'    => $validated['role_id'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return response()->json([
            'status'  => 'success',
            'message' => 'User updated successfully',
            'data'    => $user->load('role')
        ], 200);
    }

    /**
     * Mise à jour du profil de l'utilisateur connecté.
     *
     * Seuls le nom, le téléphone et le mot de passe sont modifiables :
     * l'email sert d'identifiant et reste inchangé.
     *
     * Les longueurs reprennent celles de la table `manager_users`
     * (varchar(50) pour first_name / last_name, varchar(20) pour telephone),
     * MySQL tournant en mode STRICT_TRANS_TABLES.
     */
    public function updateProfile(Request $request) {
        /** @var \App\Models\UserManager $user */
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nom_complet'      => 'required|string|max:100',
            'telephone'        => 'nullable|string|max:20',
            // Image base64, chaîne vide (suppression) ou URL déjà enregistrée.
            'avatar'           => 'nullable|string',
            'current_password' => 'required_with:password|string',
            'password'         => 'nullable|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Changement de mot de passe : on vérifie l'ancien. Le jeton seul ne
        // suffit pas à autoriser l'opération.
        if ($request->filled('password') && !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation',
                'errors'  => [
                    'current_password' => ['Le mot de passe actuel est incorrect.'],
                ],
            ], 422);
        }

        try {
            $parts = explode(' ', trim($request->nom_complet), 2);

            $data = [
                'first_name' => mb_substr($parts[0] ?? '', 0, 50),
                'last_name'  => mb_substr($parts[1] ?? '', 0, 50),
                'telephone'  => $request->telephone,
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            [$avatarAChanger, $nouvelAvatar] = $this->resoudreAvatar(
                $request->has('avatar'),
                $request->input('avatar'),
                $user->avatar
            );

            if ($avatarAChanger) {
                $data['avatar'] = $nouvelAvatar;
            }

            $user->update($data);

            return response()->json([
                'status'  => 'success',
                'message' => 'Profil mis à jour avec succès',
                'data'    => [
                    'id'         => $user->id,
                    'first_name' => $user->first_name,
                    'last_name'  => $user->last_name,
                    'email'      => $user->email,
                    'telephone'  => $user->telephone,
                    'username'   => $user->username,
                    'avatar'     => $user->avatar,
                ],
            ], 200);

        } catch (\Throwable $e) {
            Log::error('Profil - echec mise a jour', [
                'user_id'   => $user->id,
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Une erreur est survenue lors de la mise a jour du profil',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function userProfile(Request $request) {
        /** @var \App\Models\UserManager $user */
        $user = $request->user()->load('role.permissions');

        $allowedRoutes = $user->role ? $user->role->permissions->pluck('slug')->filter()->values()->toArray() : [];

        return response()->json([
            'status' => 'success',
            'data'   => [
                'id'             => $user->id,
                'username'       => $user->username,
                'first_name'     => $user->first_name,
                'last_name'      => $user->last_name,
                'email'          => $user->email,
                'telephone'      => $user->telephone,
                'avatar'         => $user->avatar,
                'role'           => $user->role ? $user->role->name : null,
                'permissions'    => $user->role ? $user->role->permissions->pluck('name')->toArray() : [],
                'allowed_routes' => $allowedRoutes,

                'detailed_permissions' => $user->role ? $user->role->permissions->map(function ($p) {
                return [
                    'id'         => $p->id,
                    'name'       => $p->name,
                    'slug'       => $p->slug,
                    'can_update' => $p->pivot->can_update ?? 0, 
                ];
                }) : [],
            ]
        ], 200);
    }

    // -------------------------------------------------------------------------
    // Avatar
    //
    // Ces helpers sont volontairement gardés dans ce contrôleur plutôt que dans
    // un trait partagé : le déploiement se fait par copie de fichiers, et un
    // fichier supplémentaire oublié provoque une erreur fatale sur toute la
    // classe. MembreController possède sa propre copie pour la même raison.
    // -------------------------------------------------------------------------

    /**
     * Décide quoi écrire dans la colonne `avatar` selon ce qu'envoie le front :
     *   - image base64 « data:image/... » -> nouvel upload
     *   - chaîne vide / null              -> suppression demandée
     *   - URL déjà enregistrée            -> on ne touche à rien
     *
     * @return array{0:bool,1:string|null} [faut-il écrire ?, nouvelle valeur]
     */
    private function resoudreAvatar(bool $champPresent, ?string $valeur, ?string $avatarActuel): array
    {
        if (!$champPresent) {
            return [false, null];
        }

        if ($valeur && str_starts_with($valeur, 'data:image')) {
            $this->deleteAvatarFile($avatarActuel);
            return [true, $this->uploadAvatar($valeur)];
        }

        if (!$valeur) {
            $this->deleteAvatarFile($avatarActuel);
            return [true, null];
        }

        return [false, null];
    }

    /** Supprime le fichier du disque, en ignorant les avatars distants. */
    private function deleteAvatarFile(?string $avatar): void
    {
        if ($avatar && !str_starts_with($avatar, 'http') && File::exists(public_path($avatar))) {
            File::delete(public_path($avatar));
        }
    }

    /** Enregistre une image base64 et renvoie son chemin public. */
    private function uploadAvatar(?string $base64Image): ?string
    {
        if (!$base64Image || !str_starts_with($base64Image, 'data:image')) {
            return null;
        }

        $imageParts = explode(';base64,', $base64Image);
        $imageTypeAux = explode('image/', $imageParts[0]);
        $imageType = $imageTypeAux[1] ?? 'png';
        $imageBase64 = base64_decode($imageParts[1]);

        $destinationPath = public_path('uploads/avatars');

        if (!File::isDirectory($destinationPath)) {
            File::makeDirectory($destinationPath, 0777, true, true);
        }

        $fileName = 'avatar_' . uniqid() . '_' . time() . '.' . $imageType;
        file_put_contents($destinationPath . '/' . $fileName, $imageBase64);

        return '/uploads/avatars/' . $fileName;
    }
}

