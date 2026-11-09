<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Departement extends Model
{
    protected $table = 'departement';
    public $timestamps = false;

    protected $fillable = ['libelle'];

    public function personnels(): HasMany
    {
        return $this->hasMany(Personnel::class, 'id_departement');
    }
}
