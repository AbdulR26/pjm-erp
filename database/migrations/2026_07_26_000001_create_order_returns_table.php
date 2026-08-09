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
        Schema::create('order_returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('reason_type'); // missing_item, damaged_item, wrong_item, other
            $table->text('customer_notes')->nullable();
            $table->string('status')->default('pending'); // pending, approved, shipping_back, received_at_warehouse, completed, rejected, cancelled
            $table->string('return_courier_name')->nullable();
            $table->string('return_waybill_id')->nullable();
            $table->string('return_shipping_fee_paid_by')->default('customer');
            $table->decimal('deducted_shipping_fee', 12, 2)->default(0);
            $table->decimal('total_refund_amount', 12, 2)->default(0);
            $table->string('refund_method')->nullable(); // midtrans_api, manual_transfer
            $table->string('manual_transfer_proof')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_returns');
    }
};
