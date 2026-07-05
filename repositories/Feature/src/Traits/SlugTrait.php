<?php

namespace Feature\Traits;

use Illuminate\Support\Str;
use DB;

trait SlugTrait
{
    protected function checkSlug($value, $table = null, $primaryKey = 'id', $column = 'slug')
    {
        $exists = DB::table($table)->where($column, $value);
        if($this->$primaryKey) {
            $exists->where($primaryKey, '!=', $this->$primaryKey);
        }
        return $exists->count() == 0;
    }

    public function generateSlug($value)
    {
        if(!$value) return null;
        $slug = Str::slug($value);
        $i = 1;
        while (!$this->checkSlug($slug)) {
            $slug = Str::slug("{$value} {$i}");
            $i++;
        }
        return $slug;
    }
}