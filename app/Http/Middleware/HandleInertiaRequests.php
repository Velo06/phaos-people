<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {
            $user->loadMissing(['role', 'personnel']);
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'login' => $user->login,
                    'role' => $user->role ? $user->role->libelle : 'Collaborateur',
                    'personnel' => $user->personnel ? [
                        'nom' => $user->personnel->nom,
                        'prenom' => $user->personnel->prenom,
                        'email_pro' => $user->personnel->email_pro,
                    ] : null,
                ] : null,
            ],
        ]);
    }
}
