<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Langue extends Model
{
    protected $table = 'langue';
    public $timestamps = false;
    protected $fillable = ['libelle'];
}
