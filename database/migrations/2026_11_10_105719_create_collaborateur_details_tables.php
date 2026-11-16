<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table diplome_collaborateur
        Schema::create('diplome_collaborateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_diplome')->constrained('diplome')->onDelete('cascade');
            $table->string('etablissement', 100);
            $table->foreignId('id_filiere')->nullable()->constrained('filiere')->onDelete('cascade');
            $table->integer('annee');
        });

        // Table competence_collaborateur
        Schema::create('competence_collaborateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_competence')->constrained('competence')->onDelete('cascade');
            $table->decimal('niveau', 2, 1);
        });

        // Table langue_collaborateur
        Schema::create('langue_collaborateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_langue')->constrained('langue')->onDelete('cascade');
            $table->decimal('niveau', 2, 1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('langue_collaborateur');
        Schema::dropIfExists('competence_collaborateur');
        Schema::dropIfExists('diplome_collaborateur');
    }
};
