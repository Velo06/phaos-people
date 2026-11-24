<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompteCollaborateurController extends Controller
{
    private function estRh($user): bool
    {
        if (!$user) {
            return false;
        }

        $roleCode = strtoupper(trim((string) ($user->role?->code ?? $user->role?->libelle ?? '')));
        return in_array($roleCode, ['RH', 'ADMIN', 'SUPERADMIN'], true);
    }

    public function index(Request $request)
    {
        if (!$this->estRh(auth()->user())) {
            abort(403, 'Accès réservé aux responsables RH.');
        }

        $search = trim((string) $request->input('search', ''));
        $statutValidation = (string) $request->input('validation', 'tous'); // tous | valide | en_attente

        $query = Utilisateur::with([
            'role',
            'personnel.posteActuel',
            'personnel.departement',
        ])->orderByDesc('date_creation');

        if ($statutValidation === 'valide') {
            $query->whereNotNull('date_validation');
        } elseif ($statutValidation === 'en_attente') {
            $query->whereNull('date_validation');
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('login', 'ILIKE', "%{$search}%")
                    ->orWhereHas('personnel', function ($pq) use ($search) {
                        $pq->where('nom', 'ILIKE', "%{$search}%")
                            ->orWhere('prenom', 'ILIKE', "%{$search}%")
                            ->orWhere('matricule', 'ILIKE', "%{$search}%");
                    });
            });
        }

        $comptes = $query->get()->map(function ($u) {
            $estValide = !is_null($u->date_validation);

            return [
                'id' => $u->id,
                'id_personnel' => $u->id_personnel,
                'login' => $u->login,
                'role' => $u->role?->libelle ?? 'Collaborateur',
                'date_creation' => $u->date_creation,
                'date_validation' => $u->date_validation,
                'est_valide' => $estValide,
                'matricule' => $u->personnel?->matricule ?? '—',
                'nom' => $u->personnel?->nom ?? '',
                'prenom' => $u->personnel?->prenom ?? '',
                'poste' => $u->personnel?->posteActuel?->libelle ?? '—',
                'departement' => $u->personnel?->departement?->libelle ?? '—',
                'statut_personnel' => $u->personnel?->statut ?? '—',
            ];
        });

        $totalComptes = Utilisateur::count();
        $totalValides = Utilisateur::whereNotNull('date_validation')->count();
        $totalEnAttente = Utilisateur::whereNull('date_validation')->count();

        return Inertia::render('RH/ComptesCollaborateurs', [
            'comptes' => $comptes,
            'stats' => [
                'total' => $totalComptes,
                'valides' => $totalValides,
                'en_attente' => $totalEnAttente,
            ],
            'filters' => [
                'search' => $search,
                'validation' => $statutValidation,
            ],
        ]);
    }
}
