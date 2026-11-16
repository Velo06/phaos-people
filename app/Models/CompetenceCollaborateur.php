<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetenceCollaborateur extends Model
{
    protected $table = 'competence_collaborateur';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_competence',
        'niveau',
    ];

    public function competence(): BelongsTo
    {
        return $this->belongsTo(Competence::class, 'id_competence');
    }
}
