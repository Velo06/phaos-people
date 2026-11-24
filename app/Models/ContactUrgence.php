<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactUrgence extends Model
{
    protected $table = 'contact_urgence';
    public $timestamps = false;
    protected $fillable = [
        'id_personnel',
        'nom',
        'relation',
        'contact',
    ];
}
