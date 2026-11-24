<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModeleDocumentEntreprise extends Model
{
    protected $table = 'modele_document_entreprise';
    public $timestamps = false;

    protected $fillable = [
        'id_type_document',
        'nom_fichier_original',
        'chemin_fichier',
        'modifie_par',
        'date_modification',
    ];

    public function typeDocument(): BelongsTo
    {
        return $this->belongsTo(TypeDocument::class, 'id_type_document');
    }

    public function auteurModification(): BelongsTo
    {
        return $this->belongsTo(User::class, 'modifie_par');
    }
}
