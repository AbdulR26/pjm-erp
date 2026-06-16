<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'product_variant_id',
        'quantity',
        'quantity_received',
        'unit_cost',
        'total_cost',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_received' => 'integer',
        'unit_cost' => 'float',
        'total_cost' => 'float',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
