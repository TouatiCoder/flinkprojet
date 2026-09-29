<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\MaRoute;
use App\Models\MaRole;

class MaPermission extends Model
{
    use HasFactory;

    protected $table = 'ma_permissions';

    protected $fillable = [
        'slug',
        'name',
    ];

    // public function managerRoute()
    // {
    //     return $this->belongsTo(MaRoute::class, 'manager_route_id');
    // }

    public function roles()
    {
        return $this->belongsToMany(MaRole::class, 'ma_role_permissions', 'permission_id', 'role_id')
                    ->withPivot('can_create', 'can_update', 'can_delete', 'scope')
                    ->withTimestamps();
    }
}