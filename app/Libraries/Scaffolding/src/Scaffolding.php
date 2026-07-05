<?php

namespace Scaffolding;

use App\Helpers\Helper;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Scaffolding\Models\ScaffoldingModel as Model;
use Scaffolding\Traits\ScaffoldingDatatable;
use Scaffolding\Traits\ScaffoldingPath;
use Illuminate\Support\Str;

class Scaffolding
{
    use ScaffoldingPath, ScaffoldingDatatable;

    /**
     * @var \Scaffolding\Models\InitModel
     */
    protected $model = null;

    /**
     * @var string
     */
    protected $prefix = '';
    protected $slug = '';
    protected $title = null;
    protected $url = null;

    protected $redirectTo = '';
    protected $redirectWith = [];

    protected $actions = ['view', 'edit', 'delete'];

    protected $actionIcons = [
        'view' => 'View',
        'edit' => 'Edit',
        'delete' => 'Hapus'
    ];
    protected $color = [
        'view' => 'gd-primary',
        'edit' => 'gd-warning',
        'delete' => 'gd-danger',
    ];

    protected $parameters = [];

    protected $events = [];
    protected $hooks = [];

    public function __construct($config = [])
    {
//        $this->setConfig($config);
    }

    public function setConfig($config = [])
    {
//        dd($config);
        foreach ($config as $prop => $value) {
            $prop = Str::camel($prop);
            $reflector = new \ReflectionClass(get_class($this));
            $dot = explode('.', $prop);
            if (count($dot) > 1)
                $prop = Str::camel($dot[0]);
            if ($reflector->hasProperty($prop)) {
                if ($reflector->getProperty($prop)->isPublic()) {
                    if (count($dot) > 1) {
                        unset($dot[0]);
                        eval('$this->' . $prop . '["' . implode('"]["', $dot) . '"] = $value;');
                    } else {
                        $this->$prop = $value;
                    }
                } else {
                    $reflection = new \ReflectionProperty(get_class($this), $prop);
                    $reflection->setAccessible(true);
                    if($prop == 'hooks' && is_array($value)) {
                        $value = array_merge_recursive_distinct($this->hooks, $value);
                    }
                    $reflection->setValue($this, $value);
                    if ($prop == 'model' && !$this->prefix) {
                        $this->prefix = Str::singular($this->model->getTable());
                    }
                    if ($prop == 'model' && !$this->slug) {
                        $this->slug = Str::singular($this->model->getTable());
                    }
                }
            }
        }
        $this->initHooks();
        $this->initDatatable(array_diff($this->model->getFillable(), $this->model->getHidden()));
    }

    protected function initHooks()
    {
        $default = [
            'onCreate',
            'onCreated',
            'onEdit',
            'onEdited',
            'onSave',
            'onSaved',
            'onDelete',
            'onDeleted',
            'redirectTo',
        ];
        foreach ($default as $hook) {
            if (!isset($this->hooks[$hook]) || !$this->hooks[$hook] instanceof \Closure) {
                $this->hooks[$hook] = function () {
                };
            }
        }
    }

    public function getActionButtons($model, $asString = false)
    {
        $buttons = [];
        $actionsRoute = $this->datatableConfig->get('actionsRoute');
        foreach ($this->datatableConfig->get('actions', []) as $action) {
            $routeName = isset($actionsRoute[$action]) ? $actionsRoute[$action] : "{$this->prefix}.{$action}";
            $route = Route::getRoutes()->getByName($routeName);
            if (!$route) continue;
            $buttons[$action] = '<a style="margin-right: 5px;" target="_blank" href="' . route($routeName, $model->id) . '" class="btn btn-sm btn-'.$this->color[$action].'">'.$this->actionIcons[$action].'</a>';
        }
        return $asString ? implode(PHP_EOL, $buttons) : $buttons;
    }

    public function getModel()
    {
        return $this->model;
    }

    public function setModel($model)
    {
        $this->model = $model;
        return $this;
    }

    public function prefix(): string
    {
        return $this->prefix;
    }

    public function slug(): string
    {
        return $this->slug;
    }

    public function title()
    {
        return $this->title;
    }

    public function url()
    {
        return $this->url;
    }

    public function parameters(): array
    {
        $scaffolding = $this;
        $model = $this->getModel();
        $prefix = $this->prefix();
        $slug = $this->slug();
        $title = $this->title();
        $url = $this->url();
        $parameters = [];
        foreach ($this->parameters as $key => $parameter) {
            $parameters[$key] = is_callable($parameter) ? call_user_func($parameter) : $parameter;
        }
        $definedVars = get_defined_vars();
        return array_merge_recursive_distinct($definedVars, $parameters);
    }

    /**
     * @param null $key
     * @return array|\Closure
     * @throws \Exception
     */
    public function hooks($key = null, $value = null)
    {
        if ($key) {
            if (isset($this->hooks[$key])) {
                if ($value instanceof \Closure) $this->hooks[$key] = $value;
                if (!$this->hooks[$key] instanceof \Closure) {
                    throw new \Exception('Invalid Hook');
                }
                return $this->hooks[$key];
            }
        }
        return $this->hooks;
    }

    /**
     * @return string
     */
    public function redirectPath($path = null, $with = []): string
    {
        $this->redirectWith = $with;
        if (is_string($path)) $this->redirectTo = $path;
        return $this->redirectTo;
    }

    public function redirectTo($path = null, $with = [])
    {
        $this->redirectPath($path, $with);
        try {
            call_user_func_array($this->hooks('redirectTo'), [$this]);
        } catch (\Exception $e) {
            dd($e);
        }
        return redirect($this->redirectTo)->with($this->redirectWith);
    }
}
