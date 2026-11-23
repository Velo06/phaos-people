<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoriquePoste extends Model
{
    protected $table = 'historique_poste';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_poste',
        'date_debut',
        'date_fin',
    ];

    public function poste(): BelongsTo
    {
        return $this->belongsTo(Poste::class, 'id_poste');
    }
}
