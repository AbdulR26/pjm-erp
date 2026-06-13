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
        // 1. Categories (Parent-Child)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 2. Products (With JSON dynamic attributes)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('main_image')->nullable();
            $table->string('badge')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('sold_count')->default(0);
            $table->boolean('is_flash_sale')->default(false);
            $table->integer('flash_sale_stock')->default(0);
            $table->json('attributes')->nullable(); // Stores dynamic key-value pairs (brand, viscosity, etc.)
            $table->timestamps();
        });

        // 3. Product Gallery Images
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('image_path');
            $table->timestamps();
        });

        // 4. Product Variants
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('name');
            $table->decimal('base_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->string('sku')->unique();
            $table->timestamps();
        });

        // 5. Tiered and Customer level pricing
        Schema::create('product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->string('level'); // 'retail', 'bengkel', 'reseller'
            $table->integer('min_qty')->default(1);
            $table->decimal('price', 12, 2);
            $table->timestamps();
        });

        // 6. Stock mutations log ledger
        Schema::create('stock_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['in', 'out']);
            $table->integer('quantity');
            $table->string('source'); // 'purchase', 'sale', 'adjustment', 'return'
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_mutations');
        Schema::dropIfExists('product_prices');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
