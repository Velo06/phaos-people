<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demande_absence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_type_absence')->constrained('type_absence');
            $table->foreignId('id_type_permission')->nullable()->constrained('type_permission');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->decimal('nbr_jour', 5, 2);
            $table->foreignId('id_interim')->nullable()->constrained('personnel');
            $table->timestamp('date_heure_demande')->useCurrent();
            $table->foreignId('id_statut')->constrained('statut_absence');
            $table->text('motif')->nullable();
            $table->boolean('regularisation')->default(false);
        });

        DB::statement('ALTER TABLE demande_absence ADD CONSTRAINT chk_dates_absence CHECK (date_fin >= date_debut)');
        DB::statement('ALTER TABLE demande_absence ADD CONSTRAINT chk_heures_absence CHECK (heure_fin IS NULL OR heure_debut IS NULL OR heure_fin > heure_debut)');
        DB::statement('ALTER TABLE demande_absence ADD CONSTRAINT chk_pas_son_propre_interim CHECK (id_interim <> id_personnel)');
    }

    public function down(): void
    {
        Schema::dropIfExists('demande_absence');
    }
};
