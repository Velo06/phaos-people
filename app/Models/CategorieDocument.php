<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategorieDocument extends Model
{
    protected $table = 'categorie_document';
    public $timestamps = false;

    protected $fillable = ['libelle'];

    public function typesDocument()
    {
        return $this->hasMany(TypeDocument::class, 'id_categorie');
    }
}
