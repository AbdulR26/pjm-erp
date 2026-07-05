<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop existing tables to avoid duplicate errors in local development
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('payment_histories');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('order_histories');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('webhook_logs');
        Schema::dropIfExists('order_statuses');

        // 1. Order Statuses master table
        Schema::create('order_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Webhook logs table (for Midtrans & Biteship callbacks)
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('provider'); // 'midtrans' or 'biteship'
            $table->string('event')->nullable();
            $table->json('payload');
            $table->string('status')->default('pending'); // pending, processed, failed
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        // 3. Orders table
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->foreignId('status_id')->constrained('order_statuses')->onDelete('restrict');

            // Pricing columns
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);

            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Order histories table
        Schema::create('order_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('status_id')->constrained('order_statuses')->onDelete('restrict');
            $table->text('description')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        // 5. Order items table (references products directly)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('restrict');
            $table->string('product_name');       // snapshot product name
            $table->string('sku');                // snapshot SKU
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2); // price at time of order
            $table->decimal('total_price', 12, 2);
            $table->decimal('weight', 8, 2)->default(1000); // in grams, snapshot
            $table->timestamps();
        });

        // 6. Payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('payment_method')->nullable();
            $table->string('status')->default('waiting_payment');
            $table->decimal('amount', 12, 2);

            // Midtrans fields
            $table->string('snap_token')->nullable();
            $table->string('payment_url')->nullable();
            $table->string('midtrans_transaction_id')->nullable();
            $table->string('midtrans_payment_type')->nullable();
            $table->string('midtrans_va_number')->nullable();
            $table->string('midtrans_fraud_status')->nullable();
            $table->json('midtrans_raw_response')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();
        });

        // 7. Payment status history log table
        Schema::create('payment_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
            $table->string('status', 50);
            $table->json('raw_response')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        // 8. Shipments table
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');

            // Courier info
            $table->string('courier_company');
            $table->string('courier_service');
            $table->string('courier_service_name')->nullable();
            $table->string('etd')->nullable();
            $table->decimal('cost', 12, 2)->default(0);

            // Biteship integration
            $table->string('biteship_order_id')->nullable();
            $table->string('waybill_id')->nullable();

            $table->string('status')->default('draft');

            // Origin
            $table->string('origin_contact_name')->nullable();
            $table->string('origin_contact_phone')->nullable();
            $table->text('origin_address')->nullable();
            $table->string('origin_postal_code')->nullable();

            // Destination
            $table->string('destination_contact_name');
            $table->string('destination_contact_phone');
            $table->text('destination_address');
            $table->string('destination_postal_code')->nullable();
            $table->decimal('destination_latitude', 10, 7)->nullable();
            $table->decimal('destination_longitude', 10, 7)->nullable();

            $table->string('proof_of_delivery')->nullable();
            $table->json('tracking_history')->nullable();

            $table->timestamp('picked_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('payment_histories');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('order_histories');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('webhook_logs');
        Schema::dropIfExists('order_statuses');
    }
};
