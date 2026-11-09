<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periode_evenement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_evenement')->constrained('evenements')->onDelete('cascade');
            $table->date('date_debut');
            $table->date('date_fin');
        });

        DB::statement('ALTER TABLE periode_evenement ADD CONSTRAINT chk_dates_periode CHECK (date_fin >= date_debut)');
    }

    public function down(): void
    {
        Schema::dropIfExists('periode_evenement');
    }
};
