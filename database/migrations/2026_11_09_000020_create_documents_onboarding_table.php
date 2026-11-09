<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_onboarding', function (Blueprint $table) {
            $table->id();
            $table->string('titre', 150);
            $table->text('description')->nullable();
            $table->foreignId('id_type')->constrained('type_docs');
            $table->foreignId('id_etape')->constrained('etape_onboarding')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_onboarding');
    }
};
