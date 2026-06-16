<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'po_number',
        'supplier_id',
        'status', // draft, ordered, received, cancelled
        'order_date',
        'expected_delivery_date',
        'received_date',
        'subtotal',
        'tax',
        'shipping_cost',
        'grand_total',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'received_date' => 'date',
        'subtotal' => 'float',
        'tax' => 'float',
        'shipping_cost' => 'float',
        'grand_total' => 'float',
    ];

    protected static function booted()
    {
        static::creating(function ($po) {
            if (empty($po->po_number)) {
                $today = date('Ymd');
                // Calculate how many POs have been created today
                $count = static::whereDate('created_at', today())->count() + 1;
                $po->po_number = 'PO-' . $today . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }
}
