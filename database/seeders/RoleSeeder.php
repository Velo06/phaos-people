<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('role')->insert([
            ['libelle' => 'Administrateur Système'],
            ['libelle' => 'RH'],
            ['libelle' => 'Direction'],
            ['libelle' => 'Chef Hiérarchique'],
            ['libelle' => 'Collaborateur'],
        ]);
    }
}
