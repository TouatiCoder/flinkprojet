<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Publication;
use App\Models\User;

class Tag extends Model
{
    use HasFactory;
    protected $table = 'tags_flink';

    public function publications(){
        return $this->belongsToMany(Publication::class, 'publications_tags_flink', 'tag_id', 'publication_id');
    }

    public function searched_users(){
        return $this->belongsToMany(User::class, 'user_tags_filters_flink', 'tag_id', 'user_id')
        ->withPivot('compteur', 'region_id', 'ville_id', 'pays_id', 'created_at', 'updated_at');
    }

    protected static function boot() {
        parent::boot();

        static::deleting(function ($tag) {
            // $tag->statistiques()->delete();// Delete hasMany relations
            // $tag->publications_booster()->delete();
            $tag->publications()->detach(); // Detach belongsToMany relations
            $tag->searched_users()->detach();
            // $tag->user_sauvgardes()->detach();
            // $tag->etab_sauvgardes()->detach();
        });
    }
}
