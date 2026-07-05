<?php

namespace Feature\Traits;

use Feature\Events\JsonReturned;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Feature\Support\Cache;
use Feature\Support\ResourceCollection;

trait ApiResource
{
    protected $cache = false;

    protected $exception = null;

    protected $hooks = [
        'each' => null,
        'additionalData' => null,
    ];

    /**
     * @param \Closure $closure
     * @return mixed|static
     */
    public static function render(\Closure $closure)
    {
        $class = new \ReflectionClass(self::class);
        $newInstance = $class->newInstanceWithoutConstructor();
        if(!$newInstance instanceof JsonResource) return $newInstance;
        $newInstance = new static($newInstance instanceof ResourceCollection ? new Collection() : null);
        try {
            return call_user_func($closure, $newInstance);
//            return $closure->call($newInstance);
        } catch (\Exception $e) {
//            dd($e);
            $newInstance->exception = $e;
//            if($class->hasProperty('exception')) {
//                $newInstance->exception = $e;
//            }
        }
        return $newInstance;
    }

    /**
     * Set resource instance.
     *
     * @param mixed $resource
     * @return mixed
     */
    public function setResource($resource)
    {
        $class = new \ReflectionClass($this);
        if($class->hasProperty('resource')) {
            if($this instanceof ResourceCollection) {
                $this->resource = $this->collectResource($resource);
            } else {
                $this->resource = $resource;
            }
        }
        return $this;
    }

    /**
     * Get any additional data that should be returned with the resource array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function with($request)
    {
        if(!$this instanceof JsonResource) return [];
        $status = 'SUCCESS';
        $message = '';
        $errors = [];
        if($this->exception instanceof ValidationException){
            $message = $this->exception->getMessage();
            $errors = $this->exception->errors();
            $status = 'INVALID';
        } else if($this->exception instanceof AuthenticationException) {
            $status = 'UNAUTHORIZED';
            $message = $this->exception->getMessage();
        } else if($this->exception instanceof \Exception) {
            $status = 'ERROR';
            $message = $this->exception->getMessage();
        }
        /** @var \Illuminate\Http\Resources\Json\JsonResource $this */
        $data = [
            'status' => $status,
        ];
        if($message) $data['message'] = $message;
        if($errors) $data['errors'] = $errors;
        return $data;
    }

    /**
     * Customize the response for a request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Illuminate\Http\JsonResponse $response
     * @return void
     * @throws \Exception
     */
    public function withResponse($request, $response)
    {
        if($this instanceof JsonResource) {
            $code = 200;
            if ($this->exception instanceof ValidationException) {
                $code = $this->exception->status;
            } else if ($this->exception instanceof \Exception) {
                $code = is_http_status($this->exception->getCode()) ? $this->exception->getCode() : 400;
            }
            $response->setStatusCode($code);
        }
        $data = $response->getData(true);
        if($this->resource instanceof LengthAwarePaginator) {
            unset($data['meta']['path']);
            unset($data['links']);
            $data['meta']['more'] = $this->resource->hasMorePages();
        }
        if(!Arr::get($data, 'data')) {
            unset($data['data']);
        }
        $data['elapsed'] = elapsed();
        $response->setData($data);
        event(new JsonReturned($response, $this->resource, $request));
    }

    public function toResponse($request)
    {
        $response = parent::toResponse($request);
        if($this->cache) {
            return Cache::render(function() use ($response){
//                $cacheKey = request()->fullUrlWithQuery(request()->all());
//                $cacheExpiry = env('CACHE_EXPIRY');
//                if(request()->has('cache_expiry')) {
//                    $cacheExpiry = request('cache_expiry');
//                }
//                ee($cacheKey, $cacheExpiry, Cache::has($cacheKey), $response);
                return $response;
            });
        } else {
            return $response;
        }
    }
}