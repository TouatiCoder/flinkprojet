<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnonceSignalers extends Model
{
    use HasFactory;

    protected $table = 'annonce_signalers';

    protected $fillable = [
        'user_id',
        'annonce_id',
        'message',
    ];

}