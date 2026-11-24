<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request)
    {
        $user =$request->user()->load([
            'role',
            'personnel.situationMatrimoniale',
            'personnel.posteActuel',
            'personnel.departement',
            'personnel.chefHierarchique',
            'personnel.contactsUrgence',
            'personnel.historiqueContrats.typeContrat',
            'personnel.historiquePostes.poste',
            'personnel.diplomes.diplome',
            'personnel.diplomes.filiere',
            'personnel.competences.competence',
            'personnel.langues.langue',
        ]);

        return Inertia::render('Profile/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', function ($attribute, $value, $fail) {
                // Vérification avec la colonne 'mdp' de votre table utilisateur
                if (!Hash::check($value, auth()->user()->mdp)) {
                    $fail('Le mot de passe actuel est incorrect.');
                }
            }],
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Mise à jour du mot de passe dans la colonne 'mdp'
        auth()->user()->update([
            'mdp' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Votre mot de passe a été mis à jour avec succès.');
    }
}
