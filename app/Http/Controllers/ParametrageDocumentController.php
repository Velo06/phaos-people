<?php

namespace App\Http\Controllers;

use App\Models\CategorieDocument;
use App\Models\DocumentCollaborateur;
use App\Models\TypeDocument;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ParametrageDocumentController extends Controller
{
    private function estRh($user): bool
    {
        if (!$user) {
            return false;
        }

        $roleCode = strtoupper(trim((string) ($user->role?->code ?? $user->role?->libelle ?? '')));
        return in_array($roleCode, ['RH', 'ADMIN', 'SUPERADMIN'], true);
    }

    private function verifierRh(): void
    {
        if (!$this->estRh(auth()->user())) {
            abort(403, 'Accès réservé aux responsables RH.');
        }
    }

    public function index()
    {
        $this->verifierRh();

        $categories = CategorieDocument::with(['typesDocument' => function ($query) {
            $query->withCount('documents')->orderBy('id');
        }])
            ->withCount('typesDocument')
            ->orderBy('id')
            ->get();

        $typesDocuments = TypeDocument::with('categorie')
            ->withCount('documents')
            ->orderBy('id')
            ->get();

        return Inertia::render('RH/ParametrageDocuments', [
            'categories' => $categories,
            'typesDocuments' => $typesDocuments,
        ]);
    }

    // ==================== CATÉGORIES ====================

    public function storeCategorie(Request $request)
    {
        $this->verifierRh();

        $validated = $request->validate([
            'libelle' => 'required|string|max:150|unique:categorie_document,libelle',
        ]);

        CategorieDocument::create([
            'libelle' => trim($validated['libelle']),
        ]);

        return back()->with('success', 'Catégorie de document ajoutée avec succès.');
    }

    public function updateCategorie(Request $request, $id)
    {
        $this->verifierRh();

        $categorie = CategorieDocument::findOrFail((int) $id);

        $validated = $request->validate([
            'libelle' => [
                'required',
                'string',
                'max:150',
                Rule::unique('categorie_document', 'libelle')->ignore($categorie->id),
            ],
        ]);

        $categorie->update([
            'libelle' => trim($validated['libelle']),
        ]);

        return back()->with('success', 'Catégorie mise à jour avec succès.');
    }

    public function destroyCategorie($id)
    {
        $this->verifierRh();

        $categorie = CategorieDocument::withCount('typesDocument')->findOrFail((int) $id);

        if ($categorie->types_document_count > 0) {
            return back()->with(
                'error',
                'Impossible de supprimer cette catégorie : des types de documents y sont encore rattachés.'
            );
        }

        $categorie->delete();

        return back()->with('success', 'Catégorie supprimée avec succès.');
    }

    // ==================== TYPES DE DOCUMENTS ====================

    public function storeTypeDocument(Request $request)
    {
        $this->verifierRh();

        $validated = $request->validate([
            'id_categorie_document' => 'required|integer|exists:categorie_document,id',
            'libelle' => 'required|string|max:180',
            'origine' => ['required', Rule::in(['collaborateur', 'entreprise'])],
            'est_obligatoire' => 'required|boolean',
            'nombre_requis' => 'required|integer|min:1|max:20',
        ]);

        TypeDocument::create([
            'id_categorie_document' => (int) $validated['id_categorie_document'],
            'libelle' => trim($validated['libelle']),
            'origine' => $validated['origine'],
            'est_obligatoire' => (bool) $validated['est_obligatoire'],
            'nombre_requis' => (int) $validated['nombre_requis'],
        ]);

        return back()->with('success', 'Type de document ajouté avec succès.');
    }

    public function updateTypeDocument(Request $request, $id)
    {
        $this->verifierRh();

        $typeDoc = TypeDocument::findOrFail((int) $id);

        $validated = $request->validate([
            'id_categorie_document' => 'required|integer|exists:categorie_document,id',
            'libelle' => 'required|string|max:180',
            'origine' => ['required', Rule::in(['collaborateur', 'entreprise'])],
            'est_obligatoire' => 'required|boolean',
            'nombre_requis' => 'required|integer|min:1|max:20',
        ]);

        $typeDoc->update([
            'id_categorie_document' => (int) $validated['id_categorie_document'],
            'libelle' => trim($validated['libelle']),
            'origine' => $validated['origine'],
            'est_obligatoire' => (bool) $validated['est_obligatoire'],
            'nombre_requis' => (int) $validated['nombre_requis'],
        ]);

        return back()->with('success', 'Type de document mis à jour avec succès.');
    }

    public function destroyTypeDocument($id)
    {
        $this->verifierRh();

        $typeDoc = TypeDocument::findOrFail((int) $id);

        $aDesDocuments = DocumentCollaborateur::where('id_type_document', $typeDoc->id)->exists();
        if ($aDesDocuments) {
            return back()->with(
                'error',
                'Impossible de supprimer ce type de document : des pièces sont déjà enregistrées dans des dossiers collaborateurs.'
            );
        }

        $typeDoc->delete();

        return back()->with('success', 'Type de document supprimé avec succès.');
    }
}
