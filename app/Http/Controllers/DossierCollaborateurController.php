<?php

namespace App\Http\Controllers;

use App\Models\CategorieDocument;
use App\Models\DocumentCollaborateur;
use App\Models\Personnel;
use App\Models\TypeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DossierCollaborateurController extends Controller
{
    private function estRh($user): bool
    {
        if (!$user) {
            return false;
        }

        $roleCode = strtoupper(trim((string) ($user->role?->code ?? $user->role?->libelle ?? '')));
        return in_array($roleCode, ['RH', 'ADMIN', 'SUPERADMIN'], true);
    }

    private function autoriserConsultation($user, int $idPersonnel): void
    {
        $estProprietaire = (int) ($user->id_personnel ?? 0) === $idPersonnel;
        $estRh = $this->estRh($user);

        if (!$estProprietaire && !$estRh) {
            abort(403, 'Accès non autorisé à ce dossier collaborateur.');
        }
    }

    private function calculerCompletude(Personnel $personnel, $typesObligatoires = null): array
    {
        $typesObligatoires = $typesObligatoires ?? TypeDocument::where('est_obligatoire', true)->get();
        $docsParType = $personnel->documents->groupBy('id_type_document');

        $totalRequis = 0;
        $totalFourni = 0;

        foreach ($typesObligatoires as $typeDoc) {
            $requis = max(1, (int) ($typeDoc->nombre_requis ?? 1));
            $existants = ($docsParType[$typeDoc->id] ?? collect())->count();
            $totalRequis += $requis;
            $totalFourni += min($existants, $requis);
        }

        $pourcentage = $totalRequis > 0 ? (int) round(($totalFourni / $totalRequis) * 100) : 100;
        $estComplet = $totalRequis > 0 && $totalFourni >= $totalRequis;

        return [
            'totalRequis' => $totalRequis,
            'totalFourni' => $totalFourni,
            'pourcentage' => $pourcentage,
            'estComplet' => $estComplet,
        ];
    }

    /**
     * Portail RH : Liste de tous les collaborateurs avec leur taux de complétude
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        if (!$this->estRh($user)) {
            abort(403, 'Accès réservé aux responsables RH.');
        }

        $typesObligatoires = TypeDocument::where('est_obligatoire', true)->get();

        $query = Personnel::with(['posteActuel', 'departement', 'documents'])
            ->orderBy('nom')
            ->orderBy('prenom');

        if ($search = trim((string) $request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'ILIKE', "%{$search}%")
                  ->orWhere('prenom', 'ILIKE', "%{$search}%")
                  ->orWhere('matricule', 'ILIKE', "%{$search}%");
            });
        }

        $collaborateurs = $query->get()->map(function ($personnel) use ($typesObligatoires) {
            return [
                'id' => $personnel->id,
                'matricule' => $personnel->matricule,
                'nom' => $personnel->nom,
                'prenom' => $personnel->prenom,
                'email' => $personnel->email ?? $personnel->email_pro ?? null,
                'poste' => $personnel->posteActuel?->libelle ?? 'Non défini',
                'departement' => $personnel->departement?->libelle ?? 'Non défini',
                'date_entree' => $personnel->date_entree,
                'statut' => $personnel->statut ?? 'actif',
                'completude' => $this->calculerCompletude($personnel, $typesObligatoires),
            ];
        });

        return Inertia::render('Collaborateurs/Index', [
            'collaborateurs' => $collaborateurs,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Consultation et gestion du dossier numérique d'un collaborateur
     */
    public function show($idPersonnel)
    {
        $idPersonnel = (int) $idPersonnel;
        $user = auth()->user();

        $this->autoriserConsultation($user, $idPersonnel);

        $personnel = Personnel::with(['posteActuel', 'departement', 'documents.typeDocument'])
            ->findOrFail($idPersonnel);

        $toutesCategories = CategorieDocument::with(['typesDocument' => function ($query) {
            $query->orderBy('id');
        }])->orderBy('id')->get();

        $documentsExistants = $personnel->documents->groupBy('id_type_document');

        $estProprietaire = (int) ($user->id_personnel ?? 0) === $idPersonnel;
        $estRh = $this->estRh($user);

        $completude = $this->calculerCompletude($personnel);

        // Le RH voit toutes les catégories/types ; le collaborateur voit uniquement ses documents ('collaborateur')
        $categoriesFiltrees = $estRh
            ? $toutesCategories->filter(fn ($cat) => $cat->typesDocument->isNotEmpty())->values()
            : $toutesCategories
                ->map(function ($cat) {
                    $catClone = clone $cat;
                    $catClone->setRelation(
                        'typesDocument',
                        $cat->typesDocument
                            ->filter(fn ($doc) => strtolower(trim((string) $doc->origine)) === 'collaborateur')
                            ->values()
                    );
                    return $catClone;
                })
                ->filter(fn ($cat) => $cat->typesDocument->isNotEmpty())
                ->values();

        return Inertia::render('Collaborateurs/DossierDocuments', [
            'personnel' => $personnel,
            'categories' => $categoriesFiltrees,
            'documentsExistants' => $documentsExistants,
            'completude' => $completude,
            'permissions' => [
                'peutUploaderNouveauxCollaborateur' => $estProprietaire && !$estRh,
                'peutModifierExistantsRh' => $estRh,
                'peutGenererEntreprise' => $estRh,
                'estRh' => $estRh,
            ],
        ]);
    }

    /**
     * Collaborateur : ajoute UNIQUEMENT les documents 'collaborateur' non encore enregistrés
     * (ne peut jamais modifier/écraser un document déjà enregistré).
     */
    public function store(Request $request, $idPersonnel)
    {
        $idPersonnel = (int) $idPersonnel;
        $user = auth()->user();

        if ((int) ($user->id_personnel ?? 0) !== $idPersonnel || $this->estRh($user)) {
            abort(403, 'Action réservée au collaborateur propriétaire pour ses propres documents.');
        }

        $personnel = Personnel::with('documents')->findOrFail($idPersonnel);

        $request->validate([
            'fichiers' => 'nullable|array',
            'fichiers.*' => 'nullable|array',
            'fichiers.*.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'observations.*' => 'nullable|string|max:500',
        ]);

        $nbInseres = 0;
        $nbIgnoresDejaExistants = 0;

        DB::transaction(function () use ($request, $personnel, &$nbInseres, &$nbIgnoresDejaExistants) {
            $fichiersParType = $request->file('fichiers', []);
            if (!is_array($fichiersParType)) {
                return;
            }

            foreach ($fichiersParType as $idTypeDocument => $files) {
                $listeFichiers = array_values(array_filter(is_array($files) ? $files : [$files]));
                if (empty($listeFichiers)) {
                    continue;
                }

                $typeDoc = TypeDocument::find((int) $idTypeDocument);
                if (!$typeDoc || strtolower(trim((string) $typeDoc->origine)) !== 'collaborateur') {
                    continue;
                }

                $maxFiles = max(1, (int) ($typeDoc->nombre_requis ?? 1));
                $docsDejaEnregistres = DocumentCollaborateur::where('id_personnel', $personnel->id)
                    ->where('id_type_document', $typeDoc->id)
                    ->count();

                // Le collaborateur ne peut pas modifier ce qui existe déjà : uniquement les places restantes
                $placesRestantes = max(0, $maxFiles - $docsDejaEnregistres);
                if ($placesRestantes === 0) {
                    $nbIgnoresDejaExistants += count($listeFichiers);
                    continue;
                }

                if (count($listeFichiers) > $placesRestantes) {
                    $nbIgnoresDejaExistants += count($listeFichiers) - $placesRestantes;
                }

                $filesToStore = array_slice($listeFichiers, 0, $placesRestantes);
                $obs = $request->input("observations.{$idTypeDocument}");

                foreach ($filesToStore as $file) {
                    $chemin = $file->store("dossiers_collaborateurs/{$personnel->id}", 'public');

                    DocumentCollaborateur::create([
                        'id_personnel' => $personnel->id,
                        'id_type_document' => $typeDoc->id,
                        'chemin_fichier' => $chemin,
                        'date_soumission' => now(),
                        'observation' => $obs,
                    ]);

                    $nbInseres++;
                }
            }
        });

        if ($nbInseres === 0 && $nbIgnoresDejaExistants > 0) {
            return back()->with(
                'error',
                'Les documents déjà enregistrés ne peuvent plus être modifiés par le collaborateur.'
            );
        }

        if ($nbInseres === 0) {
            return back()->with('error', 'Aucun nouveau fichier n\'a été enregistré.');
        }

        return back()->with('success', "{$nbInseres} nouveau(x) document(s) enregistré(s) avec succès.");
    }

    /**
     * RH : modifie/remplace UN document d'origine 'collaborateur' DÉJÀ importé
     * (n'ajoute pas de nouveau document si aucune pièce n'a été importée par le collaborateur).
     */
    public function modifierDocumentCollaborateur(Request $request, $idPersonnel, $idDocument)
    {
        $user = auth()->user();

        if (!$this->estRh($user)) {
            abort(403, 'Action réservée aux responsables RH.');
        }

        $request->validate([
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'observation' => 'nullable|string|max:500',
        ]);

        $personnel = Personnel::findOrFail((int) $idPersonnel);
        $doc = DocumentCollaborateur::with('typeDocument')
            ->where('id_personnel', $personnel->id)
            ->findOrFail((int) $idDocument);

        if (strtolower(trim((string) ($doc->typeDocument?->origine ?? ''))) !== 'collaborateur') {
            return back()->with('error', 'Cette action est réservée aux documents importés par le collaborateur.');
        }

        DB::transaction(function () use ($request, $personnel, $doc) {
            if ($doc->chemin_fichier && Storage::disk('public')->exists($doc->chemin_fichier)) {
                Storage::disk('public')->delete($doc->chemin_fichier);
            }

            $nouveauChemin = $request->file('fichier')->store("dossiers_collaborateurs/{$personnel->id}", 'public');

            $doc->update([
                'chemin_fichier' => $nouveauChemin,
                'date_soumission' => now(),
                'observation' => $request->has('observation')
                    ? $request->input('observation')
                    : $doc->observation,
            ]);
        });

        return back()->with('success', 'Le document du collaborateur a bien été mis à jour par les RH.');
    }

    /**
     * RH : génération des documents internes d'engagement (origine = 'entreprise')
     */
    public function genererDocumentEntreprise($idPersonnel, $idTypeDocument)
    {
        $user = auth()->user();

        if (!$this->estRh($user)) {
            abort(403, 'Seuls les RH peuvent générer les documents de l\'entreprise.');
        }

        $personnel = Personnel::with(['posteActuel', 'departement'])->findOrFail((int) $idPersonnel);
        $typeDoc = TypeDocument::findOrFail((int) $idTypeDocument);

        if (strtolower(trim((string) $typeDoc->origine)) !== 'entreprise') {
            return back()->with('error', 'Ce type de document n\'est pas un document d\'origine entreprise.');
        }

        DB::transaction(function () use ($personnel, $typeDoc) {
            $anciensDocs = DocumentCollaborateur::where('id_personnel', $personnel->id)
                ->where('id_type_document', $typeDoc->id)
                ->get();

            foreach ($anciensDocs as $ancien) {
                if ($ancien->chemin_fichier && Storage::disk('public')->exists($ancien->chemin_fichier)) {
                    Storage::disk('public')->delete($ancien->chemin_fichier);
                }
                $ancien->delete();
            }

            $dossier = "dossiers_collaborateurs/{$personnel->id}";
            Storage::disk('public')->makeDirectory($dossier);

            $nomFichier = "{$dossier}/" . str()->slug($typeDoc->libelle) . '-' . now()->format('YmdHis') . '.txt';

            $contenu = implode(PHP_EOL, [
                '====================================================',
                'PHAOS - DOCUMENT D\'ENGAGEMENT INTERNE',
                '====================================================',
                'Document : ' . $typeDoc->libelle,
                'Date de génération : ' . now()->format('d/m/Y H:i'),
                '----------------------------------------------------',
                'Collaborateur : ' . ($personnel->prenom ?? '') . ' ' . ($personnel->nom ?? ''),
                'Matricule : ' . ($personnel->matricule ?? 'Non attribué'),
                'Poste : ' . ($personnel->posteActuel->libelle ?? 'Non défini'),
                'Département : ' . ($personnel->departement->libelle ?? 'Non défini'),
                'Date d\'entrée : ' . ($personnel->date_entree ?? 'Non définie'),
                '----------------------------------------------------',
                'Statut : Généré par les RH via PHAOS PEOPLE.',
            ]);

            Storage::disk('public')->put($nomFichier, $contenu);

            DocumentCollaborateur::create([
                'id_personnel' => $personnel->id,
                'id_type_document' => $typeDoc->id,
                'chemin_fichier' => $nomFichier,
                'date_soumission' => now(),
                'observation' => 'Généré par les RH',
            ]);
        });

        return back()->with('success', "Le document « {$typeDoc->libelle} » a été généré.");
    }
}
