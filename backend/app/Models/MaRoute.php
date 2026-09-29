<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\MaPermission;

class MaRoute extends Model
{
    use HasFactory;

    protected $table = 'ma_routes';

    protected $fillable = [
        'name',
    ];


    public function permissions()
    {
        return $this->hasMany(MaPermission::class, 'manager_route_id');
    }
}