<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentCollaborateur extends Model
{
    protected $table = 'document_collaborateur';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_type_document',
        'chemin_fichier',
        'date_soumission',
        'observation',
    ];

    public function typeDocument()
    {
        return $this->belongsTo(TypeDocument::class, 'id_type_document');
    }
}
