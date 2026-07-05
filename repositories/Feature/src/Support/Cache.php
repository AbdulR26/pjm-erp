<?php

namespace Feature\Support;

use Cache as LaravelCache;
use Illuminate\Http\JsonResponse;

class Cache
{
    public static function render(\Closure $closure, $cacheExpiry = null)
    {
        $cacheKey = request()->fullUrlWithQuery(request()->all());
        $cacheKey = md5($cacheKey);
        if(is_null($cacheExpiry)) {
            $cacheExpiry = env('CACHE_EXPIRY');
        }
        if(request()->has('cache_expiry')) {
            $cacheExpiry = request('cache_expiry');
        }
        if(LaravelCache::has($cacheKey) && $cacheExpiry > 0) {
            $data = LaravelCache::get($cacheKey);
            $data['cache'] = true;
            return \Response::json($data);
        }
        try {
            $response =  call_user_func($closure);
            if($response instanceof JsonResponse) {
                $data = $response->getData(true);
                Cache::put($cacheKey, $data, $cacheExpiry);
            }/* else {
                ee($response);
            }*/
        } catch (\Exception $e) {
//            ee($e);
            $response = \Response::json([], 400);
        }
        return $response;
    }

    public static function put($key, $value, $minutes = null)
    {
        LaravelCache::put($key, $value, $minutes);
    }

    public static function get($key, $default = null)
    {
        return LaravelCache::get($key, $default);
    }

    public static function has($key)
    {
        return LaravelCache::has($key);
    }
}