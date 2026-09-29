<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaRole extends Model
{
    use HasFactory;

    protected $table = 'ma_roles';

    protected $fillable = [
        'name',
    ];


    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    public function permissions()
    {
        return $this->belongsToMany(MaPermission::class, 'ma_role_permissions', 'role_id', 'permission_id')
                    ->withPivot('can_create', 'can_update', 'can_delete', 'scope')
                    ->withTimestamps();
    }
}