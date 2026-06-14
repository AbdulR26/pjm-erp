<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'courier_company',
        'courier_service',
        'courier_service_name',
        'etd',
        'cost',
        'biteship_order_id',
        'waybill_id',
        'status',
        'origin_contact_name',
        'origin_contact_phone',
        'origin_address',
        'origin_postal_code',
        'destination_contact_name',
        'destination_contact_phone',
        'destination_address',
        'destination_postal_code',
        'destination_latitude',
        'destination_longitude',
        'proof_of_delivery',
        'tracking_history',
        'picked_at',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'cost'              => 'float',
        'destination_latitude'  => 'float',
        'destination_longitude' => 'float',
        'tracking_history'  => 'array',
        'picked_at'         => 'datetime',
        'shipped_at'        => 'datetime',
        'delivered_at'      => 'datetime',
    ];

    // Status constants (matching Biteship statuses)
    const STATUS_DRAFT              = 'draft';
    const STATUS_PICKUP_REQUESTED   = 'pickup_requested';
    const STATUS_PICKING_UP         = 'picking_up';
    const STATUS_PICKED             = 'picked';
    const STATUS_DROPPING_OFF       = 'dropping_off';
    const STATUS_IN_TRANSIT         = 'in_transit';
    const STATUS_DELIVERED          = 'delivered';
    const STATUS_RETURNED           = 'returned';
    const STATUS_CANCELLED          = 'cancelled';
    const STATUS_ON_HOLD            = 'on_hold';

    // Human-readable status labels
    const STATUS_LABELS = [
        'draft'             => 'Menunggu Booking',
        'pickup_requested'  => 'Pickup Dijadwalkan',
        'picking_up'        => 'Dalam Penjemputan',
        'picked'            => 'Barang Dijemput',
        'dropping_off'      => 'Dalam Pengantaran',
        'in_transit'        => 'Dalam Perjalanan',
        'delivered'         => 'Terkirim',
        'returned'          => 'Dikembalikan',
        'cancelled'         => 'Dibatalkan',
        'on_hold'           => 'Ditahan',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isDelivered(): bool
    {
        return $this->status === self::STATUS_DELIVERED;
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, [
            self::STATUS_DRAFT,
            self::STATUS_PICKUP_REQUESTED,
        ]);
    }
}
