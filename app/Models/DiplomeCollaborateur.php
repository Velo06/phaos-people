<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiplomeCollaborateur extends Model
{
    protected $table = 'diplome_collaborateur';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_diplome',
        'etablissement',
        'id_filiere',
        'annee',
    ];

    public function diplome(): BelongsTo
    {
        return $this->belongsTo(Diplome::class, 'id_diplome');
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class, 'id_filiere');
    }
}
