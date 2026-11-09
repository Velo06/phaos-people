<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historique_poste', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_poste')->constrained('poste');
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
        });

        DB::statement('ALTER TABLE historique_poste ADD CONSTRAINT chk_dates_poste CHECK (date_fin IS NULL OR date_fin >= date_debut)');
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_poste');
    }
};
