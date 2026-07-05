<?php

namespace Qollam\Log\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Qollam\Log\LogModule;
use Qollam\Log\Traits\CollectionAttribute;

class ApiLog extends Model
{

    use CollectionAttribute;

    protected $fillable = [
        'table',
        'model',
        'key',
        'method',
        'action',
        'ip_address',
        'http_user_agent',
        'headers',
        'url',
        'parameter',
        'before',
        'after',
        'dirty',
        'response',
        'status',
        'code',
        'message',
        'errors',
        'count_parameter',
        'elapsed',
        'model_confirmed_by',
        'confirmed_by',
        'confirmed_at',
        'model_created_by',
        'created_by',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setConnection(LogModule::$alias);
        parent::__construct($attributes);
    }
}
