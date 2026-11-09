<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reponse_quizz', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_question')->constrained('question_quizz')->onDelete('cascade');
            $table->text('reponse');
            $table->integer('note')->default(0);
        });

        DB::statement('ALTER TABLE reponse_quizz ADD CONSTRAINT chk_note CHECK (note >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('reponse_quizz');
    }
};
