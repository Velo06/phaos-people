<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request)
    {
        // 1. Authentification standard (vérifie login/mdp)
        $request->authenticate();

        $request->session()->regenerate();

        // 2. Récupérer l'utilisateur connecté avec sa relation 'personnel'
        $user = auth()->user();
        $user->loadMissing('personnel');

        // 3. Vérification du statut du personnel
        // On suppose que le statut inactif correspond à 'inactif' (ou tout autre statut non autorisé)
        if ($user->personnel && $user->personnel->statut !== 'actif') {
            // Déconnexion immédiate de l'utilisateur
            auth()->guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Lancer une exception de validation avec votre message personnalisé
            throw ValidationException::withMessages([
                'login' => 'Vous êtes un personnel inactif.',
            ]);
        }

        // 4. (Optionnel) Vérification si le compte est validé par la direction (si ce n'est pas déjà géré ailleurs)
        // if (is_null($user->date_validation)) {
        //     auth()->guard('web')->logout();
        //     $request->session()->invalidate();
        //     $request->session()->regenerateToken();

        //     throw ValidationException::withMessages([
        //         'login' => 'Votre compte est en attente de validation par la Direction.',
        //     ]);
        // }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
