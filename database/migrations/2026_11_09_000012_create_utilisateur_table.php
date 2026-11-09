<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_personnel')->unique()->constrained('personnel')->onDelete('cascade');
            $table->foreignId('id_role')->constrained('role');
            $table->string('login', 100)->unique();
            $table->string('mdp', 255);
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_validation')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateur');
    }
};
