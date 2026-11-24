<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modele_document_entreprise', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_type_document')->unique();
            $table->string('nom_fichier_original', 255);
            $table->string('chemin_fichier', 500);
            $table->unsignedBigInteger('modifie_par')->nullable();
            $table->timestamp('date_modification')->useCurrent();

            $table->foreign('id_type_document')
                ->references('id')
                ->on('type_document')
                ->onDelete('cascade');

            $table->foreign('modifie_par')
                ->references('id')
                ->on('utilisateur')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modele_document_entreprise');
    }
};
