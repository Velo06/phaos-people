<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_quizz', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_etape_onboarding')->constrained('etape_onboarding')->onDelete('cascade');
            $table->text('question');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_quizz');
    }
};
