<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Courier extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'service_names',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
