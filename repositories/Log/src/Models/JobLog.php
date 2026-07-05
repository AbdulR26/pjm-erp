<?php

namespace Qollam\Log\Models;

use Illuminate\Database\Eloquent\Model;
use Qollam\Log\LogModule;
use Qollam\Log\Traits\CollectionAttribute;

class JobLog extends Model
{

    use CollectionAttribute;

    protected $fillable = [
        'connection',
        'parent_id',
        'job',
        'table',
        'model',
        'key',
        'action',
        'parameter',
        'data',
        'status',
        'message',
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
