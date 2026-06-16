<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = [
        'customer_id',
        'sender_type',
        'admin_id',
        'message',
        'is_read_by_customer',
        'is_read_by_admin',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
