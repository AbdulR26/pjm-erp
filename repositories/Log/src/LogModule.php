<?php

namespace Qollam\Log;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Feature\Support\Module;
use Route;
use DB;
use Qollam\Log\Models\ApiLog;
use Qollam\Log\Models\DataLog;
use Config;
use Qollam\Log\Models\JobLog;

class LogModule extends Module
{
    public static $alias = 'log-module';

    public static $configKey = 'data-log';

    protected $dontLog = [
        DataLog::class,
        ApiLog::class,
        JobLog::class,
    ];

    protected $forbiddenKeys = [
        'password',
        'password_confirmation',
        'token',
        'api_token',
        'remember_token',
        'access_token',
        'refresh_token',
    ];

    public function __construct()
    {
        $this->setBasePath(preg_replace('/src$/i', '', __DIR__));
    }

    public function isApiRequest()
    {
        $route = Route::current();
        return preg_match('/^api/i', $route ? $route->getPrefix() : '') > 0;
    }

    /**
     * @param $operation
     * @param $params
     * @return array
     */
    public function log($operation, array $params)
    {
        $logged = [];
        $dontLog = array_merge($this->dontLog, (array)Config::get('data-log.dont_log', []));
        foreach ((array)$params as $model) {
            $modelClass = get_class($model);
            if (!$model instanceof Model || in_array($modelClass, $dontLog)) continue;
            try {
                DB::beginTransaction();
                $preLog = $this->prepareAttributes($model, $operation);
                $logged[] = DataLog::create($preLog);
                DB::commit();
            } catch (\Exception $e) {
                dd($e);
            }
        }
        return $logged;
    }

    public function prepareAttributes(Model $model, $operation = null)
    {
        $request = request();
        $route = $request->route();
        $table = $model->getTable();
        $after = $model->getDirty();
        $modelClass = get_class($model);
        $before = [];
        $modelId = $model->id;
        if ($after && $modelId) {
//            dd($after, $model->getOriginal());
            foreach ($after as $key => $value) {
                if (is_string($value) && strcasecmp($model->getOriginal($key), $value) != 0)
                    $before[$key] = $model->getOriginal($key);
            }
        }
        if (!strcasecmp($operation, 'delete')) {
            $before = array_filter($model->getOriginal());
        }
        if (!strcasecmp($operation, 'create')) {
            $before = [];
            $after = array_filter($after);
            unset($after['created_at'], $after['updated_at']);
            if (!$modelId) {
                $tableStatus = \DB::select("SHOW TABLE STATUS LIKE '$table'");
                $modelId = $tableStatus[0]->Auto_increment ?? null;
            }
        }
        unset($before['id'], $after['id']);
        $attributes = [];
        if (!$operation || $before || $after) {
            $user = \Auth::user();
            $attributes = [
                'table' => $table,
                'model' => $modelClass,
                'key' => $modelId,
                'action' => $operation,
                'ip_address' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($request->getClientIp() ?: $request->ip()),
                'url' => $route ? $route->uri() : null,
                'method' => $request->method(),
                'before' => $before ? json_encode($before, JSON_UNESCAPED_UNICODE) : null,
                'after' => $after ? json_encode($after, JSON_UNESCAPED_UNICODE) : null,
                'model_created_by' => $user ? get_class($user) : null,
                'created_by' => $user->id ?? null,
                'elapsed' => elapsed(),
            ];
        }
        return $attributes;
    }

    /**
     * @param JsonResponse $response
     * @param mixed $resource
     * @param Request $request
     * @param bool $throwable
     * @return bool|ApiLog
     * @throws \Exception
     */
    public function logApi(JsonResponse $response, $resource = null, Request $request = null, $throwable = false)
    {
        $request = $request ?? request();
        $route = $request->route();
        $log = false;
        $preLog = [];
        if($resource) {
            $model = null;
            if($resource instanceof Model) {
                $model = $resource;
            } else if(is_iterable($resource)) {
                foreach ($resource as $r) {
                    if($r instanceof Model) {
                        $model = $resource;
                        break;
                    }
                }
            }
            $preLog = $model ? $this->prepareAttributes($model) : [];
        }
        $responseData = Collection::make($response->getData(true));
        $data = $responseData->get('data') ?: [];
        $message = $responseData->get('message') ?: '';
        $status = $responseData->get('status') ?: null;
        $code = $response->getStatusCode() ?: null;
        $errors = $responseData->get('errors') ?: [];
        $parameters = $request->all();
        $countParameter = count($parameters);
        if($countParameter == 1 && is_array(Arr::first($parameters))) {
            $countParameter = count(Arr::first($parameters));
        }
        $elapsed = $responseData->get('elapsed') ?: elapsed();
        $user = \Auth::user();
        $preLog = array_merge([
            'table' => null,
            'model' => null,
            'key' => null,
            'action' => null,
            'ip_address' => $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($request->getClientIp() ?: $request->ip()),
            'http_user_agent' => $request->userAgent(),
            'headers' => json_encode($this->_filterValues($request->headers->all()), JSON_UNESCAPED_UNICODE),
            'url' => $route ? $route->uri() : null,
            'method' => $request->method(),
            'parameter' => json_encode($this->_filterValues($parameters), JSON_UNESCAPED_UNICODE),
            'before' => null,
            'after' => null,
            'dirty' => null,
            'response' => json_encode($this->_filterValues($data ?: $responseData->toArray()), JSON_UNESCAPED_UNICODE),
            'status' => $status,
            'code' => $code,
            'message' => $message,
            'errors' => json_encode($this->_filterValues($errors), JSON_UNESCAPED_UNICODE),
            'model_created_by' => $user ? get_class($user) : null,
            'created_by' => $user->id ?? null,
            'count_parameter' => $countParameter,
            'elapsed' => $elapsed,
        ], $preLog);
        try {
            DB::beginTransaction();
            $log = ApiLog::create($preLog);
            DB::commit();
        } catch (\Exception $e) {
            if($throwable) {
                throw $e;
            }
        }
        return $log;
    }

    protected function _filterValues(Array $params)
    {
        foreach ($params as $key => $value) {
            if(in_array(strtolower($key), $this->forbiddenKeys) && is_string($value)) {
                $params[$key] = str_repeat('*', strlen($value));
            }
        }
        return $params;
    }

    /**
     * @param ShouldQueue $job
     * @param null $resource
     * @param bool $throwable
     * @return null|JobLog
     * @throws \Exception
     */
    public function job(ShouldQueue $job, $resource = null, $throwable = false)
    {
        $request = $request ?? request();
        $log = null;
        $preLog = [];
        if($resource) {
            $model = null;
            if($resource instanceof Model) {
                $model = $resource;
            } else if(is_iterable($resource)) {
                foreach ($resource as $r) {
                    if($r instanceof Model) {
                        $model = $resource;
                        break;
                    }
                }
            }
            $preLog = $model ? $this->prepareAttributes($model) : [];
        }
        $parameters = $request->all();
        $preLog = array_merge([
            'connection' => Config::get('queue.default'),
            'job' => get_class($job),
            'parameter' => json_encode($this->_filterValues($parameters), JSON_UNESCAPED_UNICODE),
        ], $preLog);
        try {
            DB::beginTransaction();
            $log = JobLog::create($preLog);
            DB::commit();
        } catch (\Exception $e) {
            if($throwable) {
                throw $e;
            }
        }
        return $log;
    }
}
