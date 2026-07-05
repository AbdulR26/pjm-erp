<?php

namespace Scaffolding\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Scaffolding\Traits\ScaffoldingInit;

class ScaffoldingRequest extends FormRequest
{
    use ScaffoldingInit;

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */

    public function rules()
    {
        $rules = [];
        if(in_array(Str::lower($this->method()), ['put', 'patch'])) {
            $model = $this->scaffolding()->getModel();
            $prefix = $this->scaffolding()->prefix();
            $className = 'App\Http\Requests\\' . Str::studly("{$prefix}_request");
            if ($model && $fields = $model->fields()) {
                foreach ($fields as $field => $desc) {
                    if (in_array($field, $model->getHidden())) continue;
                    $rule = [];
                    if ($desc['required']) $rule[] = 'required';
                    if (($this->method() == 'PUT') && $desc['unique'] && $table = $model->getTable()) $rule[] = "unique:$table";
                    if ($rule) $rules[$field] = $rule;
                }
            }
            if ($class = class_exists($className)) {
                /** @var \Illuminate\Http\Request|mixed $request */
                $request = new $className;
                $request->server = $this->server;
                $request->request = $this->request;
                $newRules = $request->rules();
                $rules = array_merge_recursive_distinct($rules, $newRules);
            }
//            dd($rules, $this->method(), $this->all());
        }
        return $rules;
    }

    public function messages()
    {
        $messages = [];
        if(in_array(Str::lower($this->method()), ['put', 'patch'])) {
            $prefix = $this->scaffolding()->prefix();
            $className = 'App\Http\Requests\\' . Str::studly("{$prefix}_request");
            if ($class = class_exists($className)) {
                $request = app($className);
                $messages = $request->messages();
            }
        }
        return $messages;
    }
}
