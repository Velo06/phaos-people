<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReferenceDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('diplome')->insertOrIgnore([
            ['id' => 1, 'libelle' => 'Licence / Bachelor'],
            ['id' => 2, 'libelle' => 'Master / Ingénieur'],
            ['id' => 3, 'libelle' => 'Doctorat'],
            ['id' => 4, 'libelle' => 'BACC'],
        ]);

        DB::table('filiere')->insertOrIgnore([
            ['id' => 1, 'libelle' => 'Informatique et Génie Logiciel'],
            ['id' => 2, 'libelle' => 'Génie Énergétique & Environnement'],
            ['id' => 3, 'libelle' => 'Gestion / RH / Administration'],
        ]);

        DB::table('langue')->insertOrIgnore([
            ['id' => 1, 'libelle' => 'Français'],
            ['id' => 2, 'libelle' => 'Anglais'],
            ['id' => 3, 'libelle' => 'Malagasy'],
        ]);

        DB::table('situation_matrimoiniale')->insertOrIgnore([
            ['id' => 1, 'libelle' => 'Celibataire'],
            ['id' => 2, 'libelle' => 'Veuf(ve)'],
            ['id' => 3, 'libelle' => 'Marie(e)'],
        ]);

        DB::table('competence')->insertOrIgnore([
            ['id' => 1, 'descri' => 'Calcul rapide'],
            ['id' => 2, 'descri' => 'Gestion de projet'],
            ['id' => 3, 'descri' => 'Communication'],
        ]);

        DB::table('type_contrat')->insertOrIgnore([
            ['id' => 1, 'libelle' => 'CDI'],
            ['id' => 2, 'libelle' => 'Stage'],
            ['id' => 3, 'libelle' => 'Alternance'],
        ]);
    }
}
