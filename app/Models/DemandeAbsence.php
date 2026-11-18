<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeAbsence extends Model
{
    protected $table = 'demande_absence';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_type_absence',
        'id_type_permission',
        'date_debut',
        'date_fin',
        'heure_debut',
        'heure_fin',
        'nombre_jours',
        'id_interim',
        'date_heure_demande',
        'id_statut',
        'motif',
        'piece_jointe',
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'id_personnel');
    }

    public function typeAbsence()
    {
        return $this->belongsTo(TypeAbsence::class, 'id_type_absence');
    }

    public function typePermission()
    {
        return $this->belongsTo(TypePermission::class, 'id_type_permission');
    }

    public function interim()
    {
        return $this->belongsTo(Personnel::class, 'id_interim');
    }

    public function statut()
    {
        return $this->belongsTo(StatutAbsence::class, 'id_statut');
    }
}
