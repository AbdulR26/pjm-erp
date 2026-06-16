<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerNotification extends Model
{
    protected $fillable = [
        'customer_id',
        'title',
        'message',
        'is_read',
        'type',
        'link',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
