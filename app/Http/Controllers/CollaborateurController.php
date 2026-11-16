<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use App\Models\Utilisateur;
use App\Models\Departement;
use App\Models\Poste;
use App\Models\Role;
use App\Models\Diplome;
use App\Models\Filiere;
use App\Models\Langue;
use App\Models\Competence;
use App\Models\DiplomeCollaborateur;
use App\Models\CompetenceCollaborateur;
use App\Models\LangueCollaborateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CollaborateurController extends Controller
{
    public function create()
    {
        $situationsMatrimoniales = DB::table('situation_matrimoiniale')->get();

        $typesContrat = DB::table('type_contrat')->get();

        return Inertia::render('RH/CreationCollaborateur', [
            'departements' => Departement::all(),
            'postes' => Poste::all(),
            'chefs' => Personnel::select('id', 'nom', 'prenom')->get(),
            'roles' => Role::all(),
            'diplomesList' => Diplome::all(),
            'filieresList' => Filiere::all(),
            'languesList' => Langue::all(),
            'competencesList' => Competence::all(),
            'situationsMatrimoniales' => $situationsMatrimoniales,
            'typesContrat' => $typesContrat,
        ]);
    }

    // --- ENDPOINTS AJOUTS RAPIDES (+) ---
    public function storeDiplomeQuick(Request $request)
    {
        $val = $request->validate(['value' => 'required|string|max:100'])['value'];
        $item = Diplome::create(['libelle' => $val]);
        return response()->json($item);
    }

    public function storeFiliereQuick(Request $request)
    {
        $val = $request->validate(['value' => 'required|string|max:100'])['value'];
        $item = Filiere::create(['libelle' => $val]);
        return response()->json($item);
    }

    public function storeLangueQuick(Request $request)
    {
        $val = $request->validate(['value' => 'required|string|max:20'])['value'];
        $item = Langue::create(['libelle' => $val]);
        return response()->json($item);
    }

    public function storeCompetenceQuick(Request $request)
    {
        $val = $request->validate(['value' => 'required|string|max:250'])['value'];
        $item = Competence::create(['descri' => $val]);
        return response()->json($item);
    }

    // --- SAUVEGARDE COMPLÈTE EN BASE DE DONNÉES ---
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Identité & État Civil
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'lieu_naissance' => 'nullable|string|max:150',
            'sexe' => 'required|string|max:1',
            'id_situation_matrimoiniale' => 'nullable|integer',
            'nbr_pers_charge' => 'nullable|integer|min:0',
            'CIN' => 'nullable|string|max:50',
            'faite_le' => 'nullable|date',
            'faite_a' => 'nullable|string|max:100',
            'adresse_principale' => 'nullable|string|max:255',
            'adresse_secondaire' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'email_pro' => 'required|email|unique:personnel,email_pro',
            'contact' => 'nullable|string|max:50',
            'contact_pro' => 'nullable|string|max:50',

            // Affectation & Contrat
            'id_departement' => 'required|exists:departement,id',
            'id_poste_actuel' => 'required|exists:poste,id',
            'id_chef_hierarchique' => 'nullable|exists:personnel,id',
            'date_entree' => 'required|date',
            'id_type_contrat' => 'required|integer',
            'duree_contrat' => 'nullable|string|max:50',
            'date_fin' => 'nullable|date',

            // Compte Utilisateur
            'login' => 'required|string|unique:utilisateur,login',
            'mdp' => 'required|string|min:8',
            'id_role' => 'required|exists:role,id',

            // Tableaux dynamiques
            'contact_urgence' => 'array',
            'diplome' => 'array',
            'competence' => 'array',
            'langue' => 'array',
        ]);

        DB::transaction(function () use ($validated, $request) {
            // 1. Génération automatique du matricule (ex: PH-2026-0001)
            $annee = date('Y');
            $dernierId = (Personnel::max('id') ?? 0) + 1;
            $matriculeGenere = 'PH-' . $annee . '-' . str_pad($dernierId, 4, '0', STR_PAD_LEFT);

            // 2. Insertion dans `personnel` (statut en_attente de validation Direction)
            $personnel = Personnel::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'date_naissance' => $validated['date_naissance'],
                'lieu_naissance' => $validated['lieu_naissance'] ?? null,
                'sexe' => $validated['sexe'],
                'id_situation_matrimoiniale' => $validated['id_situation_matrimoiniale'] ?? null,
                'nbr_pers_charge' => $validated['nbr_pers_charge'] ?? 0,
                'CIN' => $validated['CIN'] ?? null,
                'faite_le' => $validated['faite_le'] ?? null,
                'faite_a' => $validated['faite_a'] ?? null,
                'adresse_principale' => $validated['adresse_principale'] ?? null,
                'adresse_secondaire' => $validated['adresse_secondaire'] ?? null,
                'email' => $validated['email'] ?? null,
                'email_pro' => $validated['email_pro'],
                'contact' => $validated['contact'] ?? null,
                'contact_pro' => $validated['contact_pro'] ?? null,
                'matricule' => $matriculeGenere,
                'id_departement' => $validated['id_departement'],
                'id_poste_actuel' => $validated['id_poste_actuel'],
                'id_chef_hierarchique' => $validated['id_chef_hierarchique'] ?? null,
                'date_entree' => $validated['date_entree'],
                'statut' => 'inactif',
            ]);

            // 3. Insertion dans `contact_urgence` (adapté aux colonnes de votre table)
            if (!empty($request->contact_urgence)) {
                foreach ($request->contact_urgence as $cu) {
                    if (!empty($cu['nom']) && !empty($cu['telephone'])) {
                        DB::table('contact_urgence')->insert([
                            'id_personnel' => $personnel->id,
                            'nom' => $cu['nom'],
                            'relation' => $cu['relation'] ?? null, // ou 'relation' selon le nom exact de votre colonne
                            'contact' => $cu['telephone'],     // ou 'telephone' selon le nom exact de votre colonne
                        ]);
                    }
                }
            }

            // 4. Insertion dans `historique_poste`
            DB::table('historique_poste')->insert([
                'id_personnel' => $personnel->id,
                'id_poste' => $validated['id_poste_actuel'],
                // 'id_departement' => $validated['id_departement'],
                'date_debut' => $validated['date_entree'],
                'date_fin' => null,
            ]);

            // 5. Insertion dans `historique_contrat`
            DB::table('historique_contrat')->insert([
                'id_personnel' => $personnel->id,
                'id_type_contrat' => $validated['id_type_contrat'],
                'date_debut' => $validated['date_entree'],
                'duree_contrat' => $validated['duree_contrat'] ?? null,
                'date_fin' => $validated['date_fin'] ?? null,
            ]);

            // 6. Insertion dans `utilisateur` (date_validation NULL = en attente Direction)
            Utilisateur::create([
                'id_personnel' => $personnel->id,
                'id_role' => $validated['id_role'],
                'login' => $validated['login'],
                'mdp' => Hash::make($validated['mdp']),
                'date_validation' => null,
            ]);

            // 7. Insertion dans `diplome_collaborateur`
            if (!empty($request->diplome)) {
                foreach ($request->diplome as $dip) {
                    if (!empty($dip['id_diplome'])) {
                        DiplomeCollaborateur::create([
                            'id_personnel' => $personnel->id,
                            'id_diplome' => $dip['id_diplome'],
                            'etablissement' => $dip['etablissement'] ?? '',
                            'id_filiere' => $dip['id_filiere'] ?: null,
                            'annee' => $dip['annee'] ?? date('Y'),
                        ]);
                    }
                }
            }

            // 8. Insertion dans `competence_collaborateur`
            if (!empty($request->competence)) {
                foreach ($request->competence as $comp) {
                    if (!empty($comp['id_competence'])) {
                        CompetenceCollaborateur::create([
                            'id_personnel' => $personnel->id,
                            'id_competence' => $comp['id_competence'],
                            'niveau' => $comp['niveau'] ?? 3.0,
                        ]);
                    }
                }
            }

            // 9. Insertion dans `langue_collaborateur`
            if (!empty($request->langue)) {
                foreach ($request->langue as $lg) {
                    if (!empty($lg['id_langue'])) {
                        LangueCollaborateur::create([
                            'id_personnel' => $personnel->id,
                            'id_langue' => $lg['id_langue'],
                            'niveau' => $lg['niveau'] ?? 3.0,
                        ]);
                    }
                }
            }
        });

        // return redirect()->route('rh.collaborateur.creer')
        //     ->with('success', 'Demande de création enregistrée. Le compte est en attente de validation par la Direction.');
        return back()->with('success', 'Compte enregistré avec succès. En attente de validation par la Direction.');
    }
}
