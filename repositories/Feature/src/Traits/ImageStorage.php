<?php

namespace Feature\Traits;

trait ImageStorage
{
    public function getStorage()
    {
        return \Storage::disk('local');
    }

    public function getImagePath($path, $location = 'images') {
        $storage = $this->getStorage();
        if($path && $storage->exists("$location/$path")) {
            return $storage->path("$location/$path");
        }
        return null;
    }

    public function getImageUrl($path, $location = 'images') {
        $storage = $this->getStorage();
        if($path && $storage->exists("$location/$path")) {
            return $storage->url("$location/$path");
        }
        return null;
    }
}