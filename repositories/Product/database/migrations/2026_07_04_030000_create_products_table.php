<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedInteger('product_type_id');
            $table->unsignedInteger('product_status_id');
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->string('sku', 100)->nullable()->unique();
            $table->decimal('price', 15, 2)->nullable()->default(0.00);
            $table->integer('stock')->nullable()->default(0);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('product_type_id')->references('id')->on('product_types')->onDelete('restrict');
            $table->foreign('product_status_id')->references('id')->on('product_statuses')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
