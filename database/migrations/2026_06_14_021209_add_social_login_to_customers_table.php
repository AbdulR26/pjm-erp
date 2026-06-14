<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('social_provider')->nullable()->after('address');
            $table->string('social_id')->nullable()->after('social_provider');
            $table->string('avatar')->nullable()->after('social_id');

            // Unique per provider + social_id pair (no duplicate accounts)
            $table->unique(['social_provider', 'social_id'], 'customers_social_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique('customers_social_unique');
            $table->dropColumn(['social_provider', 'social_id', 'avatar']);
        });
    }
};
