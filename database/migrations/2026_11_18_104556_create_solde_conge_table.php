<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solde_conge', function (Blueprint $table) {
            $table->id();

            // Clé étrangère vers la table personnel
            $table->foreignId('id_personnel')
                  ->constrained('personnel')
                  ->onDelete('cascade');

            $table->integer('annee');
            $table->decimal('solde_acquis', 5, 2)->default(0);
            $table->decimal('solde_pris', 5, 2)->default(0);
            $table->decimal('reliquat_precedent', 5, 2)->default(0);

            // Un seul enregistrement de solde par collaborateur et par année
            $table->unique(['id_personnel', 'annee']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solde_conge');
    }
};
