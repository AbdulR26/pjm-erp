<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'customer_level',
        'voucher_id',
        'voucher_code',
        'subtotal',
        'discount',
        'shipping_cost',
        'grand_total',
        'status',
        'notes',
    ];

    protected $casts = [
        'subtotal'      => 'float',
        'discount'      => 'float',
        'shipping_cost' => 'float',
        'grand_total'   => 'float',
    ];

    // Status constants
    const STATUS_PENDING    = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPING   = 'shipping';
    const STATUS_COMPLETED  = 'completed';
    const STATUS_CANCELLED  = 'cancelled';
    const STATUS_FAILED     = 'failed';

    const CUSTOMER_LEVELS = ['retail', 'bengkel', 'reseller'];

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'PJM';
        $date   = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -5));
        return "{$prefix}-{$date}-{$random}";
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }
}
