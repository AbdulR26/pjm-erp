<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Scaffolding\Traits\ScaffoldingModel;

class OrderReturn extends Model
{
    use HasFactory, ScaffoldingModel;

    protected $fillable = [
        'return_number',
        'order_id',
        'customer_id',
        'reason_type',
        'customer_notes',
        'status',
        'return_courier_name',
        'return_waybill_id',
        'return_shipping_fee_paid_by',
        'deducted_shipping_fee',
        'total_refund_amount',
        'refund_method',
        'manual_transfer_proof',
        'admin_notes',
        'approved_at',
        'rejected_at',
        'refunded_at',
    ];

    protected $casts = [
        'deducted_shipping_fee' => 'float',
        'total_refund_amount'   => 'float',
        'approved_at'           => 'datetime',
        'rejected_at'           => 'datetime',
        'refunded_at'           => 'datetime',
    ];

    const REASON_MISSING_ITEM = 'missing_item';
    const REASON_DAMAGED_ITEM = 'damaged_item';
    const REASON_WRONG_ITEM   = 'wrong_item';
    const REASON_OTHER        = 'other';

    const REASON_LABELS = [
        'missing_item' => 'Barang Kurang / Qty Kurang',
        'damaged_item' => 'Barang Rusak / Cacat',
        'wrong_item'   => 'Barang Tidak Sesuai Pesanan',
        'other'        => 'Lainnya',
    ];

    const STATUS_PENDING                = 'pending';
    const STATUS_APPROVED               = 'approved';
    const STATUS_SHIPPING_BACK          = 'shipping_back';
    const STATUS_RECEIVED_AT_WAREHOUSE = 'received_at_warehouse';
    const STATUS_COMPLETED              = 'completed';
    const STATUS_REJECTED               = 'rejected';
    const STATUS_CANCELLED              = 'cancelled';

    const STATUS_LABELS = [
        'pending'                => 'Menunggu Peninjauan Admin',
        'approved'               => 'Disetujui (Kirim Barang Balik)',
        'shipping_back'          => 'Barang Dalam Pengembalian',
        'received_at_warehouse' => 'Barang Diterima di Gudang',
        'completed'              => 'Selesai (Refund Diproses)',
        'rejected'               => 'Ditolak Admin',
        'cancelled'              => 'Dibatalkan Pelanggan',
    ];

    public static function generateReturnNumber(): string
    {
        $prefix = 'RET';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(uniqid(), -5));
        return "{$prefix}-{$date}-{$random}";
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderReturnItem::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(OrderReturnMedia::class);
    }
}
