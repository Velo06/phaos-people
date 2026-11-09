<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $table = 'role';
    public $timestamps = false; // Pas de created_at / updated_at sur cette table de référence

    protected $fillable = ['libelle'];

    public function utilisateurs(): HasMany
    {
        return $this->hasMany(Utilisateur::class, 'id_role');
    }
}
