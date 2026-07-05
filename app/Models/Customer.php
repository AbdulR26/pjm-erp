<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Scaffolding\Traits\ScaffoldingModel;

class Customer extends Model
{
    use ScaffoldingModel {
        initializeScaffoldingModel as parentInitialize;
    }

    protected $table = 'customers';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'postal_code',
        'latitude',
        'longitude',
        'social_provider',
        'social_id',
        'avatar',
        'password',
    ];

    protected $hidden = [
        'password',
        'social_provider',
        'social_id',
        'avatar',
        'latitude',
        'longitude',
    ];

    public function chatMessages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function notifications()
    {
        return $this->hasMany(CustomerNotification::class)->orderBy('created_at', 'desc');
    }

    public function wishlist()
    {
        return $this->belongsToMany(Product::class, 'wishlists', 'customer_id', 'product_id')->withTimestamps();
    }
}
