<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_dossier_collab', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_type_dossier')->constrained('type_dossier');
            $table->text('piece_jointe');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_dossier_collab');
    }
};
