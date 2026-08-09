<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerOtp extends Model
{
    use HasFactory;

    protected $table = 'customer_otps';

    protected $fillable = [
        'customer_id',
        'email',
        'otp_code',
        'expires_at',
        'resend_count',
        'resend_blocked_until',
        'failed_attempts',
        'failed_blocked_until',
    ];

    protected $casts = [
        'expires_at'           => 'datetime',
        'resend_blocked_until' => 'datetime',
        'failed_blocked_until' => 'datetime',
        'resend_count'         => 'integer',
        'failed_attempts'       => 'integer',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
