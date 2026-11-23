<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeDocument extends Model
{
    protected $table = 'type_document';
    public $timestamps = false;

    protected $fillable = [
        'id_categorie',
        'libelle',
        'est_obligatoire',
        'origine', // 'collaborateur' ou 'entreprise'
        'nombre_requis',
    ];

    public function categorie()
    {
        return $this->belongsTo(CategorieDocument::class, 'id_categorie');
    }
}
