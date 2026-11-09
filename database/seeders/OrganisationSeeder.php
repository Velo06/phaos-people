<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganisationSeeder extends Seeder
{
    public function run(): void
    {
        // Départements types pour PHAOS
        DB::table('departement')->insert([
            ['libelle' => 'Direction Générale'],
            ['libelle' => 'Ressources Humaines'],
            ['libelle' => 'Ingénierie & Énergie'],
            ['libelle' => 'Projet'],
        ]);

        // Postes types
        DB::table('poste')->insert([
            ['libelle' => 'Directeur Général'],
            ['libelle' => 'Responsable RH'],
            ['libelle' => 'Ingénieur Consultant'],
            ['libelle' => 'Développeur Full-Stack'],
        ]);
    }
}
