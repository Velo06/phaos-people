<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table diplome
        Schema::create('diplome', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 100);
        });

        // Table filiere
        Schema::create('filiere', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 100)->nullable();
        });

        // Table langue
        Schema::create('langue', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 20);
        });

        Schema::create('competence', function (Blueprint $table) {
            $table->id();
            $table->string('descri', 250);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('langue');
        Schema::dropIfExists('filiere');
        Schema::dropIfExists('diplome');
    }
};
