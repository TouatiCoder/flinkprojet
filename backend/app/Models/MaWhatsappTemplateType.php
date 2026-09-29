<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Type / usage d'un template WhatsApp (Bienvenue, Relance, Paiement…).
 *
 * Table de référence : les types s'ajoutent en base, sans migration.
 */
class MaWhatsappTemplateType extends Model
{
    protected $table = 'ma_whatsapp_template_types';

    protected $fillable = [
        'name',
        'slug',
        'color',
        'ordre',
    ];

    protected $casts = [
        'ordre' => 'integer',
    ];

    public function templates(): HasMany
    {
        return $this->hasMany(MaWhatsappTemplate::class, 'type_id');
    }
}
