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
        // Récupération dynamique depuis la base de données (valeurs distinctes existantes)
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

    // Endpoints AJAX pour l'ajout direct via les boutons (+)
    public function storeDiplomeQuick(Request $request) {
        $val = $request->validate(['value' => 'required|string|max:100'])['value'];
        $item = Diplome::create(['libelle' => $val]);
        return response()->json($item);
    }

    public function storeFiliereQuick(Request $request) {
        $val = $request->validate(['value' => 'required|string|max:100'])['value'];
        $item = Filiere::create(['libelle' => $val]);
        return response()->json($item);
    }

    public function storeLangueQuick(Request $request) {
        $val = $request->validate(['value' => 'required|string|max:20'])['value'];
        $item = Langue::create(['libelle' => $val]);
        return response()->json($item);
    }

    public function storeCompetenceQuick(Request $request) {
        $val = $request->validate(['value' => 'required|string|max:250'])['value'];
        $item = Competence::create(['descri' => $val]);
        return response()->json($item);
    }

    public function store(Request $request)
    {
        $contactsUrgenceFormates = !empty($request->contacts_urgence)
            ? json_encode($request->contacts_urgence, JSON_UNESCAPED_UNICODE)
            : null;

        $validated = $request->validate([
            // Identité & Contact
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'lieu_naissance' => 'nullable|string|max:150',
            'sexe' => 'required|string|max:1',
            'situation_matrimoniale' => 'nullable|string|max:50',
            'enfants_a_charge' => 'nullable|integer|min:0',
            'cin_numero' => 'nullable|string|max:50',
            'cin_date_delivrance' => 'nullable|date',
            'cin_lieu_delivrance' => 'nullable|string|max:100',
            'adresse_1' => 'nullable|string|max:255',
            'adresse_2' => 'nullable|string|max:255',
            'email_perso' => 'nullable|email',
            'email_pro' => 'required|email|unique:personnel,email_pro',
            'contact_perso' => 'nullable|string',
            'contact_pro' => 'nullable|string',

            // Contrat & Affectation
            'id_departement' => 'required|exists:departement,id',
            'id_poste_actuel' => 'required|exists:poste,id',
            'id_chef_hierarchique' => 'nullable|exists:personnel,id',
            'date_entree' => 'required|date',
            'type_contrat' => 'required|string',
            'duree_contrat' => 'nullable|string',
            'date_fin_contrat' => 'nullable|date',

            // Compte Utilisateur
            'login' => 'required|string|unique:utilisateur,login',
            'password' => 'required|string|min:8',
            'id_role' => 'required|exists:role,id',

            // Listes
            'diplomes' => 'array',
            'competences' => 'array',
            'langues' => 'array',
        ]);

        DB::transaction(function () use ($validated, $request, $contactsUrgenceFormates) {
            $annee = date('Y');
            $dernierId = Personnel::max('id') + 1;
            $matriculeGenere = 'PH-' . $annee . '-' . str_pad($dernierId, 4, '0', STR_PAD_LEFT);

            $personnel = Personnel::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'date_naissance' => $validated['date_naissance'],
                'lieu_naissance' => $validated['lieu_naissance'] ?? null,
                'sexe' => $validated['sexe'],
                'situation_matrimoniale' => $validated['situation_matrimoniale'] ?? null,
                'enfants_a_charge' => $validated['enfants_a_charge'] ?? 0,
                'cin_numero' => $validated['cin_numero'] ?? null,
                'cin_date_delivrance' => $validated['cin_date_delivrance'] ?? null,
                'cin_lieu_delivrance' => $validated['cin_lieu_delivrance'] ?? null,
                'adresse_1' => $validated['adresse_1'] ?? null,
                'adresse_2' => $validated['adresse_2'] ?? null,
                'email_perso' => $validated['email_perso'] ?? null,
                'email_pro' => $validated['email_pro'],
                'contact_perso' => $validated['contact_perso'] ?? null,
                'contact_pro' => $validated['contact_pro'] ?? null,
                'contact_urgence' => $contactsUrgenceFormates,
                'matricule' => $matriculeGenere,
                'id_departement' => $validated['id_departement'],
                'id_poste_actuel' => $validated['id_poste_actuel'],
                'id_chef_hierarchique' => $validated['id_chef_hierarchique'] ?? null,
                'date_entree' => $validated['date_entree'],
                'type_contrat' => $validated['type_contrat'],
                'duree_contrat' => $validated['duree_contrat'] ?? null,
                'date_fin_contrat' => $validated['date_fin_contrat'] ?? null,
                'statut' => 'actif',
            ]);

            Utilisateur::create([
                'id_personnel' => $personnel->id,
                'id_role' => $validated['id_role'],
                'login' => $validated['login'],
                'mdp' => Hash::make($validated['password']),
                'date_validation' => null,
            ]);

            if (!empty($request->diplomes)) {
                foreach ($request->diplomes as $dip) {
                    if (!empty($dip['id_diplome'])) {
                        DiplomeCollaborateur::create([
                            'id_personnel' => $personnel->id,
                            'id_diplome' => $dip['id_diplome'],
                            'etablissement' => $dip['etablissement'],
                            'id_filiere' => $dip['id_filiere'] ?? null,
                            'annee' => $dip['annee'],
                        ]);
                    }
                }
            }

            if (!empty($request->competences)) {
                foreach ($request->competences as $comp) {
                    if (!empty($comp['id_competence'])) {
                        CompetenceCollaborateur::create([
                            'id_personnel' => $personnel->id,
                            'id_competence' => $comp['id_competence'],
                            'niveau' => $comp['niveau'],
                        ]);
                    }
                }
            }

            if (!empty($request->langues)) {
                foreach ($request->langues as $lg) {
                    if (!empty($lg['id_langue'])) {
                        LangueCollaborateur::create([
                            'id_personnel' => $personnel->id,
                            'id_langue' => $lg['id_langue'],
                            'niveau' => $lg['niveau'],
                        ]);
                    }
                }
            }
        });

        return redirect()->route('rh.collaborateur.creer')->with('success', 'Collaborateur et compte enregistrés avec succès.');
    }
}
