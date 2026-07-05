<?php

namespace Feature\Support;

use Illuminate\Support\ServiceProvider as LaravelServiceProvider;
use Route;

class ServiceProvider extends LaravelServiceProvider
{

    /**
     * @var Module
     */
    protected $module;

    /**
     * Initialize module.
     *
     * @param Module $module
     * @return void
     */
    public function init(Module $module)
    {
        $this->module = $module;
        $alias = $this->module->alias();

        $this->app->singleton($alias, function () {
            return $this->module;
        });
    }

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $alias = $this->module->alias();

        /** @var Module $instance */
        $instance = app($alias);

        #load views
        if(file_exists($instance->resourcePath('views'))) {
            $this->loadViewsFrom($instance->resourcePath('views'), $alias);
        }

        #load migrations
        if($instance->config('autoload.migration')) {
            $this->loadMigrationsFrom($instance->databasePath('migrations'));
        }

        #publish assets
        if(file_exists($instance->databasePath('migrations'))) {
            $this->publishes([
                $instance->databasePath('migrations') => database_path("migrations/vendor/$alias"),
            ], "$alias.migrations");
        }
        if(file_exists($instance->resourcePath('assets'))) {
            $this->publishes([
                $instance->resourcePath('assets') => public_path("vendors/$alias"),
            ], "$alias.assets");
        }

        #load routes
        if ($instance->config('autoload.route')) {
            $this->mapWebRoutes();
            $this->mapApiRoutes();
        }
    }

    /**
     * Define the "web" routes.
     *
     * @return void
     */
    protected function mapWebRoutes()
    {
        $path = 'routes/web.php';
        if(!file_exists($this->module->basePath($path))) return;
        $namespace = (new \ReflectionClass($this->module))->getNamespaceName();
        Route::middleware('web')
            ->namespace($namespace . '\Http\Controllers')
            ->group($this->module->basePath($path));
    }

    /**
     * Define the "api" routes for the application.
     *
     * These routes are typically stateless.
     *
     * @return void
     */
    protected function mapApiRoutes()
    {
        $path = 'routes/api.php';
        if(!file_exists($this->module->basePath($path))) return;
        $namespace = (new \ReflectionClass($this->module))->getNamespaceName();
        Route::prefix('api')
            ->middleware(['api', 'throttle:' . env('API_LIMIT_REQUEST', '60') . ',1',])
            ->namespace($namespace . '\Http\Controllers')
            ->group($this->module->basePath($path));
    }
}
