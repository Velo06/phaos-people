<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CollaborateurController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DirectionController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\DossierCollaborateurController;
use App\Http\Controllers\ModeleDocumentController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/conges/demande', [AbsenceController::class, 'create'])->name('conges.create');
    Route::post('/conges/demande', [AbsenceController::class, 'store'])->name('conges.store');
});

Route::middleware(['auth', 'role:RH,Administrateur Système'])->group(function () {
    Route::get('/rh/collaborateur/creer', [CollaborateurController::class, 'create'])->name('rh.collaborateur.creer');
    Route::post('/rh/collaborateur', [CollaborateurController::class, 'store'])->name('rh.collaborateur.store');

    // Quick Add AJAX
    Route::post('/rh/quick-add/diplome', [CollaborateurController::class, 'storeDiplomeQuick']);
    Route::post('/rh/quick-add/filiere', [CollaborateurController::class, 'storeFiliereQuick']);
    Route::post('/rh/quick-add/langue', [CollaborateurController::class, 'storeLangueQuick']);
    Route::post('/rh/quick-add/competence', [CollaborateurController::class, 'storeCompetenceQuick']);
});

Route::middleware(['auth', 'role:Direction,Administrateur Système'])->group(function () {
    Route::post('/dga/collaborateur/{id}/valider', [CollaborateurController::class, 'validerCompte'])->name('dga.collaborateur.valider');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/profil', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profil/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
});

Route::middleware(['auth', 'role:Direction,Administrateur Système'])->group(function () {
    Route::get('/direction/comptes-a-valider', [DirectionController::class, 'index'])->name('direction.comptes.index');
    Route::post('/direction/comptes/{id}/valider', [DirectionController::class, 'valider'])->name('direction.comptes.valider');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/collaborateurs', [DossierCollaborateurController::class, 'index'])
        ->name('collaborateurs.index');
    Route::get('/collaborateurs/{idPersonnel}/dossier', [DossierCollaborateurController::class, 'show'])
        ->name('collaborateurs.dossier.show');
    Route::post('/collaborateurs/{idPersonnel}/dossier', [DossierCollaborateurController::class, 'store'])
        ->name('collaborateurs.dossier.store');
    Route::post('/collaborateurs/{idPersonnel}/dossier/generer/{idTypeDocument}', [DossierCollaborateurController::class, 'genererDocumentEntreprise'])
        ->name('collaborateurs.dossier.generer');
    Route::post(
        '/collaborateurs/{idPersonnel}/documents/{idDocument}/modifier',
        [DossierCollaborateurController::class, 'modifierDocumentCollaborateur']
    )->name('collaborateurs.documents.modifier');
    Route::get(
        '/collaborateurs/{idPersonnel}/dossier/telecharger',
        [DossierCollaborateurController::class, 'telechargerDossier']
    )->name('collaborateurs.dossier.telecharger');
    Route::get('/rh/modeles-documents', [ModeleDocumentController::class, 'index'])
        ->name('rh.modeles-documents.index');
    Route::post('/rh/modeles-documents/{idTypeDocument}', [ModeleDocumentController::class, 'store'])
        ->name('rh.modeles-documents.store');
    Route::get('/rh/modeles-documents/{idTypeDocument}/telecharger', [ModeleDocumentController::class, 'telecharger'])
        ->name('rh.modeles-documents.telecharger');
});

require __DIR__.'/auth.php';
