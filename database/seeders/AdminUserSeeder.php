<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Récupérer l'ID du rôle "Administrateur Système" ou "RH"
        $roleId = DB::table('role')->where('libelle', 'Administrateur Système')->value('id');
        $departementId = DB::table('departement')->where('libelle', 'Ressources Humaines')->value('id');
        $posteId = DB::table('poste')->where('libelle', 'Responsable RH')->value('id');

        // 2. Créer le profil personnel de l'admin
        $personnelId = DB::table('personnel')->insertGetId([
            'nom' => 'Admin',
            'prenom' => 'PHAOS',
            'matricule' => 'PHAOS-0001',
            'email_pro' => 'rh@phaos.mg',
            'statut' => 'actif',
            'id_departement' => $departementId,
            'id_poste_actuel' => $posteId,
            'date_entree' => now(),
        ]);

        // 3. Créer le compte utilisateur associé (pour l'authentification)
        DB::table('utilisateur')->insert([
            'id_personnel' => $personnelId,
            'id_role' => $roleId,
            'login' => 'admin.phaos',
            'mdp' => Hash::make('Password123!'), // Mot de passe par défaut modifiable
            'date_validation' => now(),
        ]);
    }
}
