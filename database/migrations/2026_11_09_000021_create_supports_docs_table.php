<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_docs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_document')->constrained('document_onboarding')->onDelete('cascade');
            $table->text('support');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_docs');
    }
};
