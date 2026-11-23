<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoriqueContrat extends Model
{
    protected $table = 'historique_contrat';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_type_contrat',
        'duree_contrat',
        'date_debut',
        'date_fin',
    ];

    public function typeContrat(): BelongsTo
    {
        return $this->belongsTo(TypeContrat::class, 'id_type_contrat');
    }
}
