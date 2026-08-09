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
        if (!Schema::hasColumn('customers', 'is_active')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->boolean('is_active')->default(false)->after('email');
                $table->timestamp('email_verified_at')->nullable()->after('is_active');
            });
        }

        Schema::create('customer_otps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->string('email')->index();
            $table->string('otp_code', 6);
            $table->timestamp('expires_at');
            $table->integer('resend_count')->default(1);
            $table->timestamp('resend_blocked_until')->nullable();
            $table->integer('failed_attempts')->default(0);
            $table->timestamp('failed_blocked_until')->nullable();
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_otps');

        if (Schema::hasColumn('customers', 'is_active')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn(['is_active', 'email_verified_at']);
            });
        }
    }
};
