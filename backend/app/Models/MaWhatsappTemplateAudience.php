<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Audience visée par un template : prospect, user ou compte_pro.
 *
 * Table d'association sans identifiant propre (clé primaire composite) et sans
 * timestamps : elle ne porte qu'un lien.
 */
class MaWhatsappTemplateAudience extends Model
{
    protected $table = 'ma_whatsapp_template_audiences';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'template_id',
        'audience',
    ];

    protected $casts = [
        'template_id' => 'integer',
    ];
}
