<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserEtabRoles extends Model
{
    use HasFactory;

    protected $table = 'user_etab_roles';

    protected $fillable = [
        'user_id',
        'etab_id',
        'role_id',
    ];

}