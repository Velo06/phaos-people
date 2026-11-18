<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypePermission extends Model
{
    protected $table = 'type_permission';
    public $timestamps = false;

    protected $fillable = [
        'id_type_absence',
        'code',
        'libelle',
    ];

    public function typeAbsence()
    {
        return $this->belongsTo(TypeAbsence::class, 'id_type_absence');
    }
}
