<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Etablissement;
use App\Models\Connexion;
use App\Models\Publication;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Models\Ville;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'users';
    public function publications(){
        return $this->hasMany(Publication::class, 'user_id');
    }
    public function ville(){
        return $this->belongsTo(Ville::class, 'ville_id');
    }
    // public function get_region(){
    //     return $this->belongsTo(Region::class, 'region_id');
    // }
    public function etablissements(){
        return $this->belongsToMany(Etablissement::class, 'user_etab_roles', 'user_id', 'etab_id');
    }
    // public function telephones(){
    //     return $this->hasMany(Telephone::class, 'user_id');
    // }
    public function connexions(){
        return $this->hasMany(Connexion::class, 'user_id');
    }
    public function latestConnexion() {
        return $this->hasOne(Connexion::class)->latest('created_at');
    }
    public function tags_filters(){
        return $this->belongsToMany(Tag::class, 'user_tags_filters_flink', 'user_id', 'tag_id')
        ->withPivot('compteur', 'region_id', 'ville_id', 'pays_id', 'created_at', 'updated_at');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_verified' => 'datetime',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function scopeForManager(Builder $query, $manager, string $permissionSlug = '/users'): Builder
    {
        if (!$manager) {
            return $query;
        }

        if ($manager->role?->name === 'super-admin' || $manager->is_super_admin) {
            return $query;
        }
        
        $userPermission = $manager->role?->permissions()
            ->where('slug', $permissionSlug)
            ->first();

        $scope = $userPermission?->pivot->scope ?? 'own';

        if ($scope === 'all') {
            return $query;
        }

        return $query->whereIn('users.id', function ($subQuery) use ($manager) {
        $subQuery->select('user_id')
                 ->from('manager_users_users')
                 ->where('manager_users_id', $manager->id);
        });
        // return $query->where('manager_users_id', $manager->id);
    }
}
