<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

use Scaffolding\Traits\ScaffoldingModel;

class Order extends Model
{
    use HasFactory, ScaffoldingModel;

    protected $fillable = [
        'order_number',
        'source',
        'ecommerce_platform',
        'customer_id',
        'status_id',
        'voucher_id',
        'voucher_code',
        'subtotal',
        'discount',
        'shipping_cost',
        'grand_total',
        'notes',
    ];

    protected $casts = [
        'subtotal'      => 'float',
        'discount'      => 'float',
        'shipping_cost' => 'float',
        'grand_total'   => 'float',
    ];

    protected $appends = ['status'];

    // Status constants
    const STATUS_PENDING    = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPING   = 'shipping';
    const STATUS_COMPLETED  = 'completed';
    const STATUS_CANCELLED  = 'cancelled';
    const STATUS_FAILED     = 'failed';

    const CUSTOMER_LEVELS = ['retail', 'bengkel', 'reseller'];

    public function getStatusAttribute(): ?string
    {
        return $this->status()->value('slug');
    }

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

    public function status(): BelongsTo
    {
        return $this->belongsTo(OrderStatus::class, 'status_id');
    }

    public function statusRelation(): BelongsTo
    {
        return $this->belongsTo(OrderStatus::class, 'status_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(OrderHistory::class);
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

    public function returns(): HasMany
    {
        return $this->hasMany(OrderReturn::class);
    }

    /**
     * Deduct stock for all items in the order and record stock mutations.
     */
    public static function deductStock($order)
    {
        // Prevent duplicate stock deductions
        $alreadyMutated = \App\Models\StockMutation::where('reference_type', 'Order')
            ->where('reference_id', $order->id)
            ->exists();

        if ($alreadyMutated) {
            return;
        }

        app(\App\Services\StockService::class)->recordPaymentDeduction($order);
    }
}
