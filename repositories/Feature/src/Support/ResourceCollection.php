<?php

namespace Feature\Support;

use Illuminate\Http\Resources\Json\ResourceCollection as IlluminateResourceCollection;
use Feature\Traits\ApiResource;
use Closure;

class ResourceCollection extends IlluminateResourceCollection
{
    use ApiResource;

    public $collects = Resource::class;

    /**
     * Transform the resource into a JSON array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request = null)
    {
        if(!$request) $request = request();
        if($this->collection->has('created') || $this->collection->has('updated')) {
            $data = [];
            $i = 0;
            foreach ($this->collection as $key => $resource) {
                if(isset($this->hooks['map']) && $this->hooks['map'] instanceof Closure) {
                    $data[$key] = call_user_func($this->hooks['map'], $resource, $i);
                } else {
                    if (isset($this->hooks['each']) && $this->hooks['each'] instanceof Closure) {
                        call_user_func($this->hooks['each'], $resource, $i);
                    }
                    $data[$key] = $resource;
                }
                $i++;
            }
            return $data;
        } else if(isset($this->hooks['each']) && $this->hooks['each'] instanceof Closure) {
            $data = [];
            $i = 0;
            foreach ($this->collection as $key => $resource) {
                if($this->hooks['each'] instanceof Closure) {
                    call_user_func($this->hooks['each'], $resource, $i);
                }
                $data[$key] = $resource;
                $i++;
            }
            return $data;
        }  else if(isset($this->hooks['map']) && $this->hooks['map'] instanceof Closure) {
            $data = [];
            $i = 0;
            foreach ($this->collection as $key => $resource) {
                $data[$key] = call_user_func($this->hooks['map'], $resource, $i);
                $i++;
            }
            return $data;
        } else {
            return parent::toArray($request);
        }
    }

    public function each(Closure $closure)
    {
        $this->hooks['each'] = $closure;
        return $this;
    }

    public function map(Closure $closure)
    {
        $this->hooks['map'] = $closure;
        return $this;
    }
}
