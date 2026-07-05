<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'product_id',
        'order_id',
        'rating',
        'comment',
        'photo_path',
        'video_path',
        'seller_reply',
        'seller_reply_at',
        'likes_count',
    ];

    protected $casts = [
        'photo_path' => 'array',
        'seller_reply_at' => 'datetime',
    ];

    protected $appends = ['photo_urls', 'video_url'];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(ProductReviewLike::class, 'review_id');
    }

    /**
     * Get array of full photo URLs (handles both legacy string and new JSON array).
     */
    public function getPhotoUrlsAttribute(): array
    {
        $paths = $this->photo_path;
        if (empty($paths)) {
            return [];
        }
        // Legacy: single string stored as non-JSON
        if (is_string($paths)) {
            return [asset('storage/' . $paths)];
        }
        return collect($paths)->map(fn($p) => asset('storage/' . $p))->toArray();
    }

    /**
     * Legacy accessor for backward compat — returns first photo URL or null.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        $urls = $this->photo_urls;
        return $urls[0] ?? null;
    }

    public function getVideoUrlAttribute(): ?string
    {
        return $this->video_path ? asset('storage/' . $this->video_path) : null;
    }
}
