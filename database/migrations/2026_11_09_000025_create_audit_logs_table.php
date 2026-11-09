<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->nullable()->constrained('personnel')->onDelete('set null');
            $table->string('action', 50);
            $table->string('model_type', 100);
            $table->integer('model_id');
            $table->string('adresse_ip', 50)->nullable();
            $table->timestamp('date_heure')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
