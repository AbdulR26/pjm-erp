<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    protected $fillable = [
        'customer_id',
        'name',
        'phone',
        'province',
        'city',
        'district',
        'village',
        'address',
        'postal_code',
        'latitude',
        'longitude',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'latitude'   => 'float',
        'longitude'  => 'float',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
