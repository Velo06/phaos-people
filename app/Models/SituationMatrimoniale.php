<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SituationMatrimoniale extends Model
{
    protected $table = 'situation_matrimoiniale';
    public $timestamps = false;
    protected $fillable = ['libelle'];
}
