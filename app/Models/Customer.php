<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
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
}
