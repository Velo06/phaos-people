<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('situation_matrimoiniale', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 20)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('situation_matrimoiniale');
    }
};
