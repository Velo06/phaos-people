<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historique_statut_demande_absence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_demande')->constrained('demande_absence')->onDelete('cascade');
            $table->foreignId('id_statut')->constrained('statut_absence');
            $table->timestamp('date_heure')->useCurrent();
            $table->foreignId('id_responsable')->nullable()->constrained('personnel');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_statut_demande_absence');
    }
};
