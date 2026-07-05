<?php

namespace Scaffolding;

use Illuminate\Contracts\Support\DeferrableProvider;
use Illuminate\Support\ServiceProvider;

class ScaffoldingServiceProvider extends ServiceProvider/* implements DeferrableProvider*/
{
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        /** @var \Scaffolding\Scaffolding $instance */
        $instance = app('scaffolding');

        # Add view location path
        /** @var \Illuminate\View\Factory $view */
        $view = $this->app['view'];
        /** @var \Illuminate\View\FileViewFinder $finder */
        $finder = $view->getFinder();
        $finder->addNamespace('scaffolding', [
            $instance->resourcePath('views')
        ]);

        # Publish
        $this->publishes([
            $instance->resourcePath('assets') => public_path('vendors/scaffolding'),
        ], 'scaffolding');
    }

    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('scaffolding', function ($app) {
            return (new Scaffolding())->setBasePath(preg_replace('/src$/i', '', __DIR__));
        });
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return ['scaffolding'];
    }
}