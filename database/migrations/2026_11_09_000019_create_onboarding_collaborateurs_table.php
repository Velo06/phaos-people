<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_collaborateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_etape_onboarding')->constrained('etape_onboarding');
            $table->integer('score')->default(0);
            $table->boolean('valide')->default(false);
            $table->timestamp('date_heure')->useCurrent();
        });

        DB::statement('ALTER TABLE onboarding_collaborateur ADD CONSTRAINT chk_score CHECK (score >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_collaborateur');
    }
};
