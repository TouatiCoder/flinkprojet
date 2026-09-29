<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ProspectProspectInteret extends Pivot
{
    protected $table = 'prospect_prospect_interet';

    protected $fillable = [
        'prospect_id',
        'prospect_interet_id',
    ];
}