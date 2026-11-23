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

        $roleCode = strtoupper((string) ($user->role?->code ?? $user->role?->libelle ?? ''));
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
                if ($typeDoc->est_obligatoire) {
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
                    $cat->typesDocument->where('origine', $origineCible)->values()
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
                'peutUploaderCollaborateur' => $estProprietaire && !$estRh,
                'peutGenererEntreprise' => $estRh,
                'estRh' => $estRh,
            ],
        ]);
    }

    public function store(Request $request, $idPersonnel)
    {
        $idPersonnel = (int) $idPersonnel;
        $user = auth()->user();

        if ((int) ($user->id_personnel ?? 0) !== $idPersonnel || $this->estRh($user)) {
            abort(403, 'Action réservée au collaborateur pour ses propres documents.');
        }

        $personnel = Personnel::findOrFail($idPersonnel);

        $request->validate([
            'fichiers.*.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'observations.*' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $personnel) {
            if ($request->hasFile('fichiers')) {
                foreach ($request->file('fichiers') as $idTypeDocument => $files) {
                    if (!is_array($files) || empty($files)) {
                        continue;
                    }

                    $typeDoc = TypeDocument::findOrFail($idTypeDocument);

                    if ($typeDoc->origine !== 'collaborateur') {
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
                    $filesToStore = array_slice($files, 0, $maxFiles);

                    foreach ($filesToStore as $file) {
                        $chemin = $file->store("dossiers_collaborateurs/{$personnel->id}", 'public');

                        DocumentCollaborateur::create([
                            'id_personnel' => $personnel->id,
                            'id_type_document' => $typeDoc->id,
                            'chemin_fichier' => $chemin,
                            'date_soumission' => now(),
                            'observation' => $obs,
                        ]);
                    }
                }
            }

            if ($request->has('observations') && is_array($request->input('observations'))) {
                foreach ($request->input('observations') as $idTypeDocument => $obs) {
                    $typeDoc = TypeDocument::find($idTypeDocument);
                    if (!$typeDoc || $typeDoc->origine !== 'collaborateur') {
                        continue;
                    }

                    if (!$request->hasFile("fichiers.{$idTypeDocument}")) {
                        DocumentCollaborateur::where('id_personnel', $personnel->id)
                            ->where('id_type_document', $typeDoc->id)
                            ->update(['observation' => $obs]);
                    }
                }
            }
        });

        return back()->with('success', 'Vos documents ont bien été enregistrés.');
    }

    public function genererDocumentEntreprise($idPersonnel, $idTypeDocument)
    {
        $user = auth()->user();

        if (!$this->estRh($user)) {
            abort(403, 'Seuls les RH peuvent générer les documents de l\'entreprise.');
        }

        $personnel = Personnel::with(['posteActuel', 'departement'])->findOrFail((int) $idPersonnel);
        $typeDoc = TypeDocument::findOrFail((int) $idTypeDocument);

        if ($typeDoc->origine !== 'entreprise') {
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
