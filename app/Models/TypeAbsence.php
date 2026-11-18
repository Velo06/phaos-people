<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeAbsence extends Model
{
    protected $table = 'type_absence';
    public $timestamps = false;

    protected $fillable = [
        'code',
        'libelle',
    ];

    public function typesPermission()
    {
        return $this->hasMany(TypePermission::class, 'id_type_absence');
    }
}
