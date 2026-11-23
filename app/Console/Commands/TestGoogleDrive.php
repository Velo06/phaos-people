<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class TestGoogleDrive extends Command
{
    protected $signature = 'drive:test';
    protected $description = 'Test isolé écriture/lecture/suppression sur Google Drive';

    public function handle(): int
    {
        $chemin = 'test_connexion/hello_phaos_' . now()->format('His') . '.txt';
        $contenu = 'Test upload depuis PHAOS PEOPLE - ' . now()->toDateTimeString();

        $this->info('1. Envoi du fichier vers Google Drive...');
        $ok = Storage::disk('google')->put($chemin, $contenu);

        if (!$ok) {
            $this->error('Échec de l\'envoi.');
            return self::FAILURE;
        }
        $this->info("✔ Fichier créé : {$chemin}");

        $this->info('2. Lecture du contenu depuis Google Drive...');
        $lu = Storage::disk('google')->get($chemin);
        $this->line("Contenu lu : {$lu}");

        $this->info('3. Liste des fichiers dans test_connexion :');
        foreach (Storage::disk('google')->files('test_connexion') as $fichier) {
            $this->line(" - {$fichier}");
        }

        return self::SUCCESS;
    }
}
