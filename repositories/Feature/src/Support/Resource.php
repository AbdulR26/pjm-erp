<?php

namespace Feature\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;
use Feature\Traits\ApiResource;
use Closure;

class Resource extends JsonResource
{
    use ApiResource;

    protected $keyAliases = [];

    protected $hidden = [];

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request = null)
    {
        if(!$request) $request = request();
        if($this->resource instanceof Model) {
            return $this->modelToArray($this->resource);
        } else if(is_iterable($this->resource)){
            $data = [];
            foreach ($this->resource as $key => $resource) {
                if($resource instanceof JsonResource) {
                    $data[$key] = $resource;
                } else if($resource instanceof Model) {
                    $data[] = $this->modelToArray($resource);
                } else if(array_key_exists($key, $this->keyAliases)) {
                    $alias = $this->keyAliases[$key];
                    if(in_array($alias, $this->hidden)) continue;
                    $data[$alias] = $resource;
                } else if(array_search($key, $this->keyAliases)) {
                    $alias = $key;
                    if(in_array($alias, $this->hidden)) continue;
                    $data[$alias] = $resource;
                }
            }
            return $data;
        } else if(is_string($this->resource) || $this->resource instanceof JsonResource) {
            return $this->resource;
        } else {
            return parent::toArray($request);
        }
    }

    public function modelToArray(Model $model)
    {
        $data = [];
        foreach ($this->keyAliases as $key => $alias) {
            if(is_numeric($key)) {
                $key = $alias;
            }
            if(in_array($alias, $this->hidden)) continue;
            $data[$alias] = !is_null($model->$key) ? $model->$key : null;
        }
        foreach ($model->getAttributes() as $key => $value) {
            if(!$value instanceof JsonResource) continue;
            $data[$key] = $value;
        }
        if($this->hooks['additionalData'] instanceof Closure) {
            if($d = call_user_func($this->hooks['additionalData'], $model, $data)) {
                $data = $d;
            };
        }
        $this->transformData($model, $data);
        return $data;
    }

    public function toModelAttributes()
    {
        $data = [];
        foreach ($this->keyAliases as $key => $alias) {
            if (is_numeric($key)) {
                $data[$alias] = request($alias);
            } else {
                $data[$key] = request($alias);
            }
        }
        return $data;
    }

    protected function transformData(Model $model, array &$data)
    {
        //
    }

    public function additionalData(Closure $closure)
    {
        $this->hooks['additionalData'] = $closure;
        return $this;
    }

    /**
     * @param  array $data
     * @param bool $skipNull
     * @return array
     */
    public function fillable(array $data, $skipNull = true)
    {
        $attributes = [];
        $debug = [];
        if(method_exists($this->resource, 'getFillable')) {
            foreach ($this->resource->getFillable() as $key) {
                $keyAlias = null;
                foreach ($this->keyAliases as $k => $alias) {
                    if(is_numeric($k) && $alias == $key) {
                        $keyAlias = $alias;
                    } else if ($k == $key) {
                        $keyAlias = $k;
                    }
                    if($keyAlias) break;
                }
                $debug[] = "find keyAlias for $key => $keyAlias";
                if(!$keyAlias || !isset($data[$keyAlias])) {
                    $debug[] = "exists '$key' => " . in_array($key, array_keys($this->keyAliases));
                    $debug[] = collect($this->keyAliases);
                    $debug[] = "skip $key => $keyAlias";
                    continue;
                }
                if($skipNull && is_null($data[$keyAlias])) {
                    $debug[] = "null $key => $keyAlias";
                    continue;
                }
                $attributes[$key] = $data[$keyAlias];
            }
        }
//        throw new \Exception(collect($debug));
        return $attributes;
    }

    public function hide(...$key){
        $this->hidden = Arr::flatten($key);
        return $this;
    }

    public function only(...$keys)
    {
        $keys = Arr::flatten($keys);
        $keyAliases = array_values($this->keyAliases);
        $this->hidden = array_diff($keyAliases, $keys, $this->hidden);
        return $this;
    }
}
