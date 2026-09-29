<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use App\Models\MaRole;

class UserManager extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = "manager_users";

    protected $fillable = [
        'username',
        'password',
        'first_name',
        'last_name',
        'email',
        'role_id',
        'telephone',
        'avatar',
        'ville_id',
        'equipe_id',
        'is_active',
        'is_chef',
        'capacite_max_leads',
        'nb_prospect_par_jour',
        'methode_affectation',
        'is_managing',
        'objectif_users_jour',
        'objectif_comptes_mois',
        'objectif_solde_an',
    ];
    
    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'is_managing' => 'boolean',
    ];

    public function role() {
        return $this->belongsTo(MaRole::class, 'role_id', 'id');
    }

    public function equipe(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(MaEquipe::class, 'equipe_id');
    }

    public function activites(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            Activite::class,
            'manager_user_activites',
            'manager_user_id',
            'activite_id'
        )->withTimestamps();
    }

    // =====================================================================
    // PERMISSIONS
    // =====================================================================

    /**
     * Rôles qui contournent les permissions. Même liste que le middleware
     * CheckPermissionSlug, pour qu'une route et son contrôleur tranchent
     * toujours de la même façon.
     */
    public const SUPER_ADMIN_ROLES = ['admin', 'super admin', 'super-admin', 'superadmin'];

    public function isSuperAdmin(): bool
    {
        $roleName = strtolower(trim($this->role?->name ?? ''));

        return in_array($roleName, self::SUPER_ADMIN_ROLES, true);
    }

    /**
     * Droits du rôle sur une permission, recherchée par slug exact
     * (« /equipe », « /membres »…).
     *
     * Super admin : tous les droits, scope « all ».
     * Permission absente : aucun droit, scope « own » (le plus restrictif).
     *
     * @return array{scope:string,can_create:bool,can_update:bool,can_delete:bool}
     */
    public function permissionFor(string $slug): array
    {
        if ($this->isSuperAdmin()) {
            return ['scope' => 'all', 'can_create' => true, 'can_update' => true, 'can_delete' => true];
        }

        $slug = '/' . ltrim($slug, '/');
        $permission = $this->role?->permissions->firstWhere('slug', $slug);

        return [
            'scope'      => $permission?->pivot->scope ?? 'own',
            'can_create' => (bool) ($permission?->pivot->can_create ?? false),
            'can_update' => (bool) ($permission?->pivot->can_update ?? false),
            'can_delete' => (bool) ($permission?->pivot->can_delete ?? false),
        ];
    }
}
