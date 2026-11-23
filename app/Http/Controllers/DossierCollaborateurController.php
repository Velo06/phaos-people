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
    public function index(Request $request)
    {
        $user = auth()->user();

        if (!$this->estRh($user)) {
            abort(403, 'Accès réservé aux responsables RH.');
        }

        $typesObligatoires = TypeDocument::where('est_obligatoire', true)->get();
        $totalRequis = $typesObligatoires->sum(fn ($t) => max(1, (int) ($t->nombre_requis ?? 1)));

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

        $collaborateurs = $query->get()->map(function ($personnel) use ($typesObligatoires, $totalRequis) {
            $docsParType = $personnel->documents->groupBy('id_type_document');
            $totalFourni = 0;

            foreach ($typesObligatoires as $typeDoc) {
                $requis = max(1, (int) ($typeDoc->nombre_requis ?? 1));
                $existants = ($docsParType[$typeDoc->id] ?? collect())->count();
                $totalFourni += min($existants, $requis);
            }

            $pourcentage = $totalRequis > 0 ? (int) round(($totalFourni / $totalRequis) * 100) : 100;

            return [
                'id' => $personnel->id,
                'matricule' => $personnel->matricule,
                'nom' => $personnel->nom,
                'prenom' => $personnel->prenom,
                'email' => $personnel->email ?? $personnel->email_professionnel ?? null,
                'poste' => $personnel->posteActuel?->libelle ?? 'Non défini',
                'departement' => $personnel->departement?->libelle ?? 'Non défini',
                'date_entree' => $personnel->date_entree,
                'statut' => $personnel->statut ?? 'Actif',
                'completude' => [
                    'totalRequis' => $totalRequis,
                    'totalFourni' => $totalFourni,
                    'pourcentage' => $pourcentage,
                    'estComplet' => $totalRequis > 0 && $totalFourni >= $totalRequis,
                ],
            ];
        });

        return Inertia::render('Collaborateurs/Index', [
            'collaborateurs' => $collaborateurs,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

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

        // Complétude globale calculée sur l'ensemble des pièces obligatoires du dossier
        $totalRequis = 0;
        $totalFourni = 0;

        foreach ($toutesCategories as $cat) {
            foreach ($cat->typesDocument as $typeDoc) {
                if ((bool) $typeDoc->est_obligatoire) {
                    $requis = max(1, (int) ($typeDoc->nombre_requis ?? 1));
                    $existants = ($documentsExistants[$typeDoc->id] ?? collect())->count();
                    $totalRequis += $requis;
                    $totalFourni += min($existants, $requis);
                }
            }
        }

        $pourcentage = $totalRequis > 0 ? (int) round(($totalFourni / $totalRequis) * 100) : 100;

        // Filtrage des blocs selon le rôle :
        // - RH : uniquement les documents d'origine 'entreprise'
        // - Collaborateur : uniquement les documents d'origine 'collaborateur'
        $origineCible = $estRh ? 'entreprise' : 'collaborateur';

        $categoriesFiltrees = $toutesCategories
            ->map(function ($cat) use ($origineCible) {
                $catClone = clone $cat;
                $catClone->setRelation(
                    'typesDocument',
                    $cat->typesDocument
                        ->filter(fn ($doc) => strtolower(trim((string) $doc->origine)) === $origineCible)
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
            'completude' => [
                'totalRequis' => $totalRequis,
                'totalFourni' => $totalFourni,
                'pourcentage' => $pourcentage,
                'estComplet' => $totalRequis > 0 && $totalFourni >= $totalRequis,
            ],
            'permissions' => [
                'peutUploaderCollaborateur' => $estProprietaire,
                'peutGenererEntreprise' => $estRh,
                'estRh' => $estRh,
            ],
        ]);
    }

    public function store(Request $request, $idPersonnel)
    {
        $idPersonnel = (int) $idPersonnel;
        $user = auth()->user();

        if ((int) ($user->id_personnel ?? 0) !== $idPersonnel) {
            abort(403, 'Action réservée au collaborateur propriétaire pour ses propres documents.');
        }

        $personnel = Personnel::findOrFail($idPersonnel);

        $request->validate([
            'fichiers' => 'nullable|array',
            'fichiers.*' => 'nullable|array',
            'fichiers.*.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'observations.*' => 'nullable|string|max:500',
        ]);

        $nbInseres = 0;

        DB::transaction(function () use ($request, $personnel, &$nbInseres) {
            $fichiersParType = $request->file('fichiers', []);

            if (is_array($fichiersParType)) {
                foreach ($fichiersParType as $idTypeDocument => $files) {
                    $listeFichiers = array_values(array_filter(is_array($files) ? $files : [$files]));

                    if (empty($listeFichiers)) {
                        continue;
                    }

                    $typeDoc = TypeDocument::find((int) $idTypeDocument);
                    if (!$typeDoc) {
                        continue;
                    }

                    if (strtolower(trim((string) $typeDoc->origine)) !== 'collaborateur') {
                        continue;
                    }

                    $obs = $request->input("observations.{$idTypeDocument}");

                    $anciensDocs = DocumentCollaborateur::where('id_personnel', $personnel->id)
                        ->where('id_type_document', $typeDoc->id)
                        ->get();

                    foreach ($anciensDocs as $ancien) {
                        if ($ancien->chemin_fichier && Storage::disk('public')->exists($ancien->chemin_fichier)) {
                            Storage::disk('public')->delete($ancien->chemin_fichier);
                        }
                        $ancien->delete();
                    }

                    $maxFiles = max(1, (int) ($typeDoc->nombre_requis ?? 1));
                    $filesToStore = array_slice($listeFichiers, 0, $maxFiles);

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
            }

            if ($request->has('observations') && is_array($request->input('observations'))) {
                foreach ($request->input('observations') as $idTypeDocument => $obs) {
                    $typeDoc = TypeDocument::find((int) $idTypeDocument);
                    if (!$typeDoc || strtolower(trim((string) $typeDoc->origine)) !== 'collaborateur') {
                        continue;
                    }

                    $aDesFichiers = !empty($fichiersParType[$idTypeDocument]);
                    if (!$aDesFichiers) {
                        DocumentCollaborateur::where('id_personnel', $personnel->id)
                            ->where('id_type_document', $typeDoc->id)
                            ->update(['observation' => $obs]);
                    }
                }
            }
        });

        if ($nbInseres === 0) {
            return back()->with('error', 'Aucun document n\'a été inséré. Vérifiez les fichiers sélectionnés ou la colonne origine.');
        }

        return back()->with('success', "{$nbInseres} document(s) enregistré(s) avec succès.");
    }

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
