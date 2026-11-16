<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Personnel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DirectionController extends Controller
{
    // Liste des comptes en attente de validation
    public function index()
    {
        // Récupère les utilisateurs non validés avec les relations du personnel
        $utilisateursEnAttente = Utilisateur::with([
                'personnel.departement',
                'personnel.posteActuel',
                'role'
            ])
            ->whereNull('date_validation')
            ->get();

        return Inertia::render('Direction/ComptesAValider', [
            'utilisateursEnAttente' => $utilisateursEnAttente,
        ]);
    }

    // Valider le compte et activer le personnel
    public function valider($id)
    {
        DB::transaction(function () use ($id) {
            $utilisateur = Utilisateur::with('personnel')->findOrFail($id);

            // 1. Mettre à jour la date de validation dans la table utilisateur
            $utilisateur->update([
                'date_validation' => now(),
            ]);

            // 2. Mettre à jour le statut du personnel à 'actif'
            if ($utilisateur->personnel) {
                $utilisateur->personnel->update([
                    'statut' => 'actif',
                ]);
            }
        });

        return back()->with('success', 'Le compte a été validé avec succès. Le personnel est désormais actif.');
    }
}
