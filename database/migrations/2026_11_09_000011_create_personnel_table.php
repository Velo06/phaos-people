<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnel', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance', 50)->nullable();
            $table->string('adresse_principale', 100)->nullable();
            $table->string('adresse_secondaire', 100)->nullable();
            $table->string('CIN', 50)->unique()->nullable();
            $table->string('faite_a', 20)->nullable();
            $table->date('faite_le')->nullable();
            $table->enum('sexe', ['M', 'F'])->nullable();

            $table->foreignId('id_situation_matrimoiniale')->nullable()->constrained('situation_matrimoiniale');
            $table->foreignId('id_poste_actuel')->nullable()->constrained('poste');
            $table->foreignId('id_chef_hierarchique')->nullable()->constrained('personnel');
            $table->foreignId('id_departement')->nullable()->constrained('departement');

            $table->string('matricule', 50)->unique();
            $table->string('contact', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('contact_pro', 50)->nullable();
            $table->string('email_pro', 150)->nullable();
            $table->integer('nbr_pers_charge')->default(0);
            $table->enum('statut', ['actif', 'inactif', 'suspendu'])->default('actif');
            $table->timestamp('date_heure_creation_dossier')->useCurrent();
            $table->date('date_entree')->nullable();
        });

        // Contrainte métier pour empêcher un collaborateur d'être son propre chef
        DB::statement('ALTER TABLE personnel ADD CONSTRAINT chk_pas_son_propre_chef CHECK (id_chef_hierarchique <> id)');
        DB::statement('ALTER TABLE personnel ADD CONSTRAINT chk_nbr_pers_charge CHECK (nbr_pers_charge >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel');
    }
};
