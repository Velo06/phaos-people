<?php

namespace App\Http\Controllers;

use App\Models\ModeleDocumentEntreprise;
use App\Models\TypeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ModeleDocumentController extends Controller
{
    private function estRh($user): bool
    {
        if (!$user) {
            return false;
        }

        $roleCode = strtoupper(trim((string) ($user->role?->code ?? $user->role?->libelle ?? '')));
        return in_array($roleCode, ['RH', 'ADMIN', 'SUPERADMIN'], true);
    }

    public function index()
    {
        if (!$this->estRh(auth()->user())) {
            abort(403, 'Accès réservé aux responsables RH.');
        }

        $typesEntreprise = TypeDocument::with('modeleEntreprise')
            ->whereRaw("LOWER(TRIM(origine)) = 'entreprise'")
            ->orderBy('id')
            ->get();

        return Inertia::render('RH/ModelesDocuments', [
            'typesDocuments' => $typesEntreprise,
            'variablesDisponibles' => [
                '${nom}',
                '${prenom}',
                '${nom_complet}',
                '${matricule}',
                '${poste}',
                '${departement}',
                '${date_entree}',
                '${date_generation}',
            ],
        ]);
    }

    public function store(Request $request, $idTypeDocument)
    {
        if (!$this->estRh(auth()->user())) {
            abort(403, 'Accès réservé aux responsables RH.');
        }

        $request->validate([
            'modele' => 'required|file|mimes:docx|max:10240',
        ]);

        $typeDoc = TypeDocument::findOrFail((int) $idTypeDocument);

        if (strtolower(trim((string) $typeDoc->origine)) !== 'entreprise') {
            return back()->with('error', 'Ce type de document n\'est pas d\'origine entreprise.');
        }

        $file = $request->file('modele');
        $dossier = 'modeles_documents_entreprise';
        $nomStockage = 'type_' . $typeDoc->id . '_' . now()->format('YmdHis') . '.docx';
        $chemin = $file->storeAs($dossier, $nomStockage, 'local');

        $existant = ModeleDocumentEntreprise::where('id_type_document', $typeDoc->id)->first();
        if ($existant && $existant->chemin_fichier && Storage::disk('local')->exists($existant->chemin_fichier)) {
            Storage::disk('local')->delete($existant->chemin_fichier);
        }

        ModeleDocumentEntreprise::updateOrCreate(
            ['id_type_document' => $typeDoc->id],
            [
                'nom_fichier_original' => $file->getClientOriginalName(),
                'chemin_fichier' => $chemin,
                'modifie_par' => auth()->id(),
                'date_modification' => now(),
            ]
        );

        return back()->with('success', "Le modèle `.docx` pour « {$typeDoc->libelle} » a été enregistré.");
    }

    public function telecharger($idTypeDocument)
    {
        if (!$this->estRh(auth()->user())) {
            abort(403, 'Accès réservé aux responsables RH.');
        }

        $typeDoc = TypeDocument::with('modeleEntreprise')->findOrFail((int) $idTypeDocument);
        $modele = $typeDoc->modeleEntreprise;

        if (!$modele || !Storage::disk('local')->exists($modele->chemin_fichier)) {
            abort(404, 'Aucun fichier modèle enregistré pour ce type de document.');
        }

        return Storage::disk('local')->download(
            $modele->chemin_fichier,
            $modele->nom_fichier_original ?: ('modele_' . str()->slug($typeDoc->libelle) . '.docx')
        );
    }
}
