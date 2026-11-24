<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('type_document', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_categorie')
                  ->constrained('categorie_document')
                  ->onDelete('cascade');
            $table->string('libelle', 150);
            $table->boolean('est_obligatoire')->default(true);
            $table->string('origine', 30)->default('collaborateur'); // 'collaborateur' ou 'entreprise'
            $table->integer('nombre_requis')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('type_document');
    }
};
