<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Template de message WhatsApp envoyé manuellement depuis le CRM.
 */
class MaWhatsappTemplate extends Model
{
    protected $table = 'ma_whatsapp_templates';

    protected $fillable = [
        'nom',
        'description',
        'message',
        'type_id',
        'langue',
        'statut',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'type_id' => 'integer',
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(MaWhatsappTemplateType::class, 'type_id');
    }

    public function audiences(): HasMany
    {
        return $this->hasMany(MaWhatsappTemplateAudience::class, 'template_id');
    }

    public function auteur(): BelongsTo
    {
        return $this->belongsTo(UserManager::class, 'updated_by');
    }

    /**
     * Remplace les variables du message par les valeurs d'un destinataire.
     *
     * Les variables non fournies sont laissées telles quelles plutôt que
     * vidées : le commercial voit immédiatement ce qui reste à compléter avant
     * d'envoyer, au lieu d'un texte à trous silencieux.
     *
     * @param  array<string,string|null>  $valeurs  ex. ['nom' => 'Ahmed']
     */
    public function rendre(array $valeurs): string
    {
        $rendu = $this->message;

        foreach ($valeurs as $cle => $valeur) {
            if ($valeur === null || $valeur === '') {
                continue;
            }

            $rendu = str_replace('{{' . $cle . '}}', (string) $valeur, $rendu);
        }

        return $rendu;
    }
}
