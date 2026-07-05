<?php

namespace Qollam\Log;

use Config;
use Feature\Events\JsonReturned;
use Feature\Support\ServiceProvider;
use Event;

class LogServiceProvider extends ServiceProvider
{

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $alias = LogModule::$alias;
        $this->init(new LogModule());

        /** @var LogModule $instance */
        $instance = app($alias);

        # merge config
        $this->mergeConfigFrom($instance->configPath('data-log.php'), LogModule::$configKey);

        # merge database config
        Config::set("database.connections.$alias", Config::get(LogModule::$configKey . ".database"));

    }

    public function boot()
    {
        parent::boot();

        if (app()->runningUnitTests()) {
            return;
        }

        /** @var LogModule $instance */
        $instance = app(LogModule::$alias);

        # available eloquent events: creating, created, updating, updated, saving, saved, deleting, deleted, restoring, restored
        Event::listen('eloquent.saving:*', function ($name, $params) {
            //$instance->log('save', $name, $params);
        });
        Event::listen('eloquent.created:*', function ($name, $params) use ($instance) {
            $instance->log('create', $params);
        });
        Event::listen('eloquent.updating:*', function ($name, $params) use ($instance) {
            $instance->log('update', $params);
        });
        Event::listen('eloquent.deleting:*', function ($name, $params) use ($instance) {
            $instance->log('delete', $params);
        });

        # listen to api resource when returned json
        Event::listen(JsonReturned::class, function(JsonReturned $event) use ($instance) {
            $instance->logApi($event->response, $event->resource, $event->request);
        });
    }
}
