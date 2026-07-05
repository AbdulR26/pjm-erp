<?php
namespace Qollam\Chat;

use Feature\Support\Module;

class ChatModule extends Module
{
    public static $alias = 'chat-module';
    public static $configKey = 'chat';

    public function __construct()
    {
        $this->setBasePath(preg_replace('/src$/i', '', __DIR__));
    }
}
