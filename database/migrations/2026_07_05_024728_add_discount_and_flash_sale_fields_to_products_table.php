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
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('discount_percent')->default(0)->after('description');
            $table->boolean('is_flash_sale')->default(false)->after('discount_percent');
            $table->decimal('flash_sale_price', 15, 2)->nullable()->after('is_flash_sale');
            $table->integer('flash_sale_stock')->default(0)->after('flash_sale_price');
            $table->dateTime('flash_sale_start')->nullable()->after('flash_sale_stock');
            $table->dateTime('flash_sale_end')->nullable()->after('flash_sale_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'discount_percent',
                'is_flash_sale',
                'flash_sale_price',
                'flash_sale_stock',
                'flash_sale_start',
                'flash_sale_end'
            ]);
        });
    }
};
