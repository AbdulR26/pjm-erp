<?php
namespace Qollam\Chat;

use Feature\Support\ServiceProvider;

class ChatServiceProvider extends ServiceProvider
{
    public function register()
    {
        $alias = ChatModule::$alias;
        $this->init(new ChatModule());
        $instance = app($alias);
        $this->mergeConfigFrom($instance->configPath('chat.php'), ChatModule::$configKey);
    }

    public function boot()
    {
        parent::boot();
    }
}
