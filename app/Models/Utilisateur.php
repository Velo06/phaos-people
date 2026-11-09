<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Utilisateur extends Authenticatable
{
    use Notifiable;

    protected $table = 'utilisateur';
    public $timestamps = false;

    protected $fillable = [
        'id_personnel',
        'id_role',
        'login',
        'mdp',
        'date_validation',
    ];

    protected $hidden = [
        'mdp',
    ];

    // Indique à Laravel d'utiliser 'mdp' comme mot de passe pour l'auth
    public function getAuthPassword()
    {
        return $this->mdp;
    }

    // Relations
    public function personnel(): BelongsTo
    {
        return $this->belongsTo(Personnel::class, 'id_personnel');
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'id_role');
    }
}
