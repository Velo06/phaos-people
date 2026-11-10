<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CollaborateurController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
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

require __DIR__.'/auth.php';
