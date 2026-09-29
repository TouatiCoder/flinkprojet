<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MaEquipe extends Model
{
    use HasFactory;

    protected $table = 'ma_equipes';

    protected $fillable = [
        'nom',
        'capacite_leads',
        'color',
        'status',
    ];

    protected $casts = [
        'capacite_leads' => 'integer',
    ];

    public function activites(): BelongsToMany
    {
        return $this->belongsToMany(
            Activite::class,
            'ma_equipe_activites',
            'equipe_id',
            'activite_id'
        )->withTimestamps();
    }

    public function managerUsers(): HasMany
    {
        return $this->hasMany(UserManager::class, 'equipe_id');
    }

    public function chef(): HasOne
    {
        return $this->hasOne(UserManager::class, 'equipe_id')->where('is_chef', 1);
    }

    public function membres(): HasMany
    {
        return $this->hasMany(UserManager::class, 'equipe_id')->where('is_chef', 0);
    }
}