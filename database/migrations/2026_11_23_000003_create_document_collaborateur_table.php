<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_collaborateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')
                  ->constrained('personnel')
                  ->onDelete('cascade');
            $table->foreignId('id_type_document')
                  ->constrained('type_document')
                  ->onDelete('cascade');
            $table->string('chemin_fichier', 255)->nullable();
            $table->timestamp('date_soumission')->useCurrent();
            $table->text('observation')->nullable();

            // Un seul document actif par type pour un collaborateur donné
            $table->unique(['id_personnel', 'id_type_document']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_collaborateur');
    }
};
