<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Prospect extends Model
{
    use HasFactory;

    protected $table = 'prospects';

    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'email',
        'name_entreprise',
        'activite_id',
        'ville_id',
        'prospect_source_id',
        'manager_users_id',
        'note',
    ];


    public function interets(): BelongsToMany
    {
        return $this->belongsToMany(
            ProspectInteret::class,
            'prospect_prospect_interet',
            'prospect_id',
            'prospect_interet_id'
        )->withTimestamps();
    }

    public function ville(): BelongsTo
    {
        return $this->belongsTo(Ville::class, 'ville_id');
    }

    public function activite(): BelongsTo
    {
        return $this->belongsTo(Activite::class, 'activite_id');
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(ProspectSource::class, 'prospect_source_id');
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(ManagerUser::class, 'manager_users_id');
    }
}