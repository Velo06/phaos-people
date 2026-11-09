<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Personnel extends Model
{
    protected $table = 'personnel';
    public $timestamps = false; // Géré manuellement avec date_heure_creation_dossier

    protected $fillable = [
        'nom', 'prenom', 'date_naissance', 'lieu_naissance',
        'adresse_principale', 'adresse_secondaire', 'CIN',
        'faite_a', 'faite_le', 'sexe', 'id_situation_matrimoiniale',
        'id_poste_actuel', 'id_chef_hierarchique', 'id_departement',
        'matricule', 'contact', 'email', 'contact_pro', 'email_pro',
        'nbr_pers_charge', 'statut', 'date_entree'
    ];

    // Relations
    public function posteActuel(): BelongsTo
    {
        return $this->belongsTo(Poste::class, 'id_poste_actuel');
    }

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class, 'id_departement');
    }

    public function chefHierarchique(): BelongsTo
    {
        return $this->belongsTo(Personnel::class, 'id_chef_hierarchique');
    }

    public function subalternes(): HasMany
    {
        return $this->hasMany(Personnel::class, 'id_chef_hierarchique');
    }

    public function utilisateur(): HasOne
    {
        return $this->hasOne(Utilisateur::class, 'id_personnel');
    }
}
