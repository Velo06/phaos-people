<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_collaborateur', function (Blueprint $table) {
            $table->dropUnique('document_collaborateur_id_personnel_id_type_document_unique');
        });
    }

    public function down(): void
    {
        Schema::table('document_collaborateur', function (Blueprint $table) {
            $table->unique(['id_personnel', 'id_type_document'], 'document_collaborateur_id_personnel_id_type_document_unique');
        });
    }
};
