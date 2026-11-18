<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatutAbsence extends Model
{
    protected $table = 'statut_absence';
    public $timestamps = false;

    protected $fillable = [
        'code',
        'libelle',
    ];
}
