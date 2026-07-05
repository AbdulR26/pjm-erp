<?php

namespace Qollam\Product\Http\Resources;

use Feature\Support\ResourceCollection;

class ProductResourceCollection extends ResourceCollection
{
    public $collects = ProductResource::class;
}
