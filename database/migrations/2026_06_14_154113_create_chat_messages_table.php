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
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->enum('sender_type', ['customer', 'admin']);
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('message');
            $table->boolean('is_read_by_customer')->default(false);
            $table->boolean('is_read_by_admin')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
