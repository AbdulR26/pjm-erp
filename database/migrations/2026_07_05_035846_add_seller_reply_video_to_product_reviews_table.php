<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->text('seller_reply')->nullable()->after('comment');
            $table->timestamp('seller_reply_at')->nullable()->after('seller_reply');
            $table->unsignedInteger('likes_count')->default(0)->after('seller_reply_at');
            $table->string('video_path')->nullable()->after('photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropColumn(['seller_reply', 'seller_reply_at', 'likes_count', 'video_path']);
        });
    }
};
