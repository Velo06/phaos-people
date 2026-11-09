<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_urgence', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->string('nom', 50);
            $table->string('relation', 30);
            $table->string('contact', 30);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_urgence');
    }
};
