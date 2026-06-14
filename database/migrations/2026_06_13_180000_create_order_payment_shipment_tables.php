<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Webhook logs table (for Midtrans & Biteship callbacks)
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('provider'); // 'midtrans' or 'biteship'
            $table->string('event')->nullable();
            $table->json('payload');
            $table->string('status')->default('pending'); // pending, processed, failed
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        // 2. Orders table (clean, separated concerns)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');

            // Pricing columns
            $table->string('customer_level')->default('retail'); // retail, bengkel, reseller
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);

            // Order status: pending, processing, shipping, completed, cancelled, failed
            $table->string('status')->default('pending');

            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Order items table
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_variant_id')->constrained('product_variants')->onDelete('restrict');
            $table->string('product_name');       // snapshot product name at time of order
            $table->string('variant_name');       // snapshot variant name
            $table->string('sku');                // snapshot SKU
            $table->integer('quantity');
            $table->decimal('unit_price', 12, 2); // price at time of order (based on customer level)
            $table->decimal('total_price', 12, 2);
            $table->decimal('weight', 8, 2)->default(1000); // in grams, snapshot
            $table->timestamps();
        });

        // 4. Payments table (separated from orders)
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');

            // Payment method selected by customer / admin
            // e.g. bank_transfer, credit_card, gopay, qris, indomaret, alfamart, shopeepay, ovo
            $table->string('payment_method')->nullable();

            // Status: waiting_payment, paid, expired, cancelled, failed, refunded, pending
            $table->string('status')->default('waiting_payment');

            $table->decimal('amount', 12, 2);

            // Midtrans fields
            $table->string('snap_token')->nullable();
            $table->string('payment_url')->nullable();
            $table->string('midtrans_transaction_id')->nullable();
            $table->string('midtrans_payment_type')->nullable();    // actual payment type from notification
            $table->string('midtrans_va_number')->nullable();       // virtual account number (if applicable)
            $table->string('midtrans_fraud_status')->nullable();    // accept / deny / challenge
            $table->json('midtrans_raw_response')->nullable();      // full JSON from Midtrans notification

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();
        });

        // 5. Shipments table (separated from orders)
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');

            // Courier info
            $table->string('courier_company');     // jne, jnt, sicepat, etc
            $table->string('courier_service');     // REG, YES, OKE, etc
            $table->string('courier_service_name')->nullable(); // display name
            $table->string('etd')->nullable();     // estimated time of delivery (e.g. "2-3 days")
            $table->decimal('cost', 12, 2)->default(0);

            // Biteship integration
            $table->string('biteship_order_id')->nullable();
            $table->string('waybill_id')->nullable();       // resi / airway bill

            // Status: draft, pickup_requested, picking_up, picked, dropping_off,
            //         in_transit, delivered, returned, cancelled, on_hold
            $table->string('status')->default('draft');

            // Origin (seller)
            $table->string('origin_contact_name')->nullable();
            $table->string('origin_contact_phone')->nullable();
            $table->text('origin_address')->nullable();
            $table->string('origin_postal_code')->nullable();

            // Destination (customer)
            $table->string('destination_contact_name');
            $table->string('destination_contact_phone');
            $table->text('destination_address');
            $table->string('destination_postal_code')->nullable();
            $table->decimal('destination_latitude', 10, 7)->nullable();
            $table->decimal('destination_longitude', 10, 7)->nullable();

            // Proof & tracking
            $table->string('proof_of_delivery')->nullable(); // image path
            $table->json('tracking_history')->nullable();    // cached tracking events

            $table->timestamp('picked_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('webhook_logs');
    }
};
