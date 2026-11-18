<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoldeConge extends Model
{
    protected $table = 'solde_conge';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'annee',
        'solde_acquis',
        'solde_pris',
        'reliquat_precedent',
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'id_personnel');
    }

    // Accesseur pratique : $solde->solde_restant
    public function getSoldeRestantAttribute(): float
    {
        return round(($this->reliquat_precedent + $this->solde_acquis) - $this->solde_pris, 2);
    }
}
