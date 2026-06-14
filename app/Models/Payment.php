<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_method',
        'status',
        'amount',
        'snap_token',
        'payment_url',
        'midtrans_transaction_id',
        'midtrans_payment_type',
        'midtrans_va_number',
        'midtrans_fraud_status',
        'midtrans_raw_response',
        'paid_at',
        'expired_at',
    ];

    protected $casts = [
        'amount'               => 'float',
        'midtrans_raw_response' => 'array',
        'paid_at'              => 'datetime',
        'expired_at'           => 'datetime',
    ];

    // Status constants
    const STATUS_WAITING    = 'waiting_payment';
    const STATUS_PAID       = 'paid';
    const STATUS_EXPIRED    = 'expired';
    const STATUS_CANCELLED  = 'cancelled';
    const STATUS_FAILED     = 'failed';
    const STATUS_REFUNDED   = 'refunded';
    const STATUS_PENDING    = 'pending'; // snap token created but payment not yet initiated

    // Payment method options
    const PAYMENT_METHODS = [
        'bank_transfer'  => 'Transfer Bank',
        'credit_card'    => 'Kartu Kredit/Debit',
        'gopay'          => 'GoPay',
        'qris'           => 'QRIS',
        'shopeepay'      => 'ShopeePay',
        'ovo'            => 'OVO',
        'indomaret'      => 'Indomaret',
        'alfamart'       => 'Alfamart',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isWaiting(): bool
    {
        return in_array($this->status, [self::STATUS_WAITING, self::STATUS_PENDING]);
    }
}
