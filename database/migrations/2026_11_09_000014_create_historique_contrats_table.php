<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historique_contrat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_type_contrat')->constrained('type_contrat');
            $table->decimal('duree_contrat', 3, 1)->nullable();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
        });

        DB::statement('ALTER TABLE historique_contrat ADD CONSTRAINT chk_duree_contrat CHECK (duree_contrat >= 0)');
        DB::statement('ALTER TABLE historique_contrat ADD CONSTRAINT chk_dates_contrat CHECK (date_fin IS NULL OR date_fin >= date_debut)');
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_contrat');
    }
};
