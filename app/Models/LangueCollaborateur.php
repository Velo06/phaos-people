<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LangueCollaborateur extends Model
{
    protected $table = 'langue_collaborateur';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_langue',
        'niveau',
    ];

    public function langue(): BelongsTo
    {
        return $this->belongsTo(Langue::class, 'id_langue');
    }
}
