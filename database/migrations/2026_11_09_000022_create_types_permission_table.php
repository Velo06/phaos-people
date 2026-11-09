<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('type_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_type_absence')->constrained('type_absence')->onDelete('cascade');
            $table->string('libelle', 150);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('type_permission');
    }
};
