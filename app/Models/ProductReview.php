<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $appends = ['photo_url'];

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

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? asset('storage/' . $this->photo_path) : null;
    }
}
