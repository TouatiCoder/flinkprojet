<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Publication;

class Etablissement extends Model
{
    use HasFactory;
    protected $table = 'etablissements';
    public function users() {
        return $this->belongsToMany(User::class, 'user_etab_roles', 'etab_id', 'user_id');
    }
    public function publications(){
        return $this->hasMany(Publication::class, 'etab_id');
    }
    // public function region(){
    //     return $this->belongsTo(Region::class, 'region_id');
    // }
    // public function ville(){
    //     return $this->belongsTo(Ville::class, 'ville_id');
    // }
    // public function telephones(){
    //     return $this->hasMany(Telephone::class, 'etab_id');
    // }
}
