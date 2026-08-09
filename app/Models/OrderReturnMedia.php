<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderReturnMedia extends Model
{
    use HasFactory;

    protected $table = 'order_return_media';

    protected $fillable = [
        'order_return_id',
        'file_path',
        'file_type',
        'file_name',
    ];

    public function orderReturn(): BelongsTo
    {
        return $this->belongsTo(OrderReturn::class);
    }
}
