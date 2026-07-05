<?php
namespace Feature\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

trait SchemaTable
{
    public function initFillable(Model $model = null)
    {
        if(!$model && $this instanceof Model) {
            $model = $this;
        }
        /** @var \Illuminate\Database\Eloquent\Model $this */
        // Set fillable model attribute
        if($model && !$model->getfillable()) {
            $fillable = [];
            foreach ($this->getTableDescription() as $column) {
                if (isset($column->Field) && !in_array($column->Field, ['id', 'created_at', 'updated_at'])) {
                    $fillable[] = $column->Field;
                }
            }
            $model->fillable($fillable);
        }
    }

    public function getTableDescription($model = null)
    {
        if($model instanceof Model) {
            return \DB::connection($model->getConnectionName())->select('DESC ' . $model->getTable());
        } else if(!$model && $this instanceof Model) {
            return \DB::connection($this->getConnectionName())->select('DESC ' . $this->getTable());
        } else {
            return [];
        }
    }

    public function toFields($model = null)
    {
        $fields = Collection::make();
        if(!$model && $this instanceof Model) {
            $model = $this;
        }
        try {
            foreach ($this->getTableDescription($model) as $column) {
                if (isset($column->Field) && !in_array($column->Field, ['id', 'created_at', 'updated_at'])) {
                    $type = 'text';
                    $length = null;
                    $options = [];
                    $class = ['form-input w-full mt-2 rounded-md focus:border-indigo-600'];
                    $foreign = preg_match('/unsigned/i', $column->Type) && $column->Key != 'KEY';
                    if (preg_match('/\((\d+)\)/i', $column->Type, $matches)) $length = $matches[1];
                    if (preg_match('/text/i', $column->Type)) $type = 'textarea';
                    if (preg_match('/^date$/i', $column->Type)) $class[] = 'date-picker';
                    if (preg_match('/datetime|timestamp/i', $column->Type)) $class[] = 'datetime-picker';
                    if (preg_match('/float|decimal|double/i', $column->Type)) $type = 'decimal';
                    if (preg_match('/integer/i', $column->Type)) $type = 'number';
                    if (preg_match('/enum\((.*)\)/i', $column->Type, $matches)) $options = explode(',', str_replace("'", '', $matches[1]));
                    if ($options || $foreign) $type = 'select';
                    $label = Helper::toLabel($column->Field);
                    $fields->put($column->Field, [
                        'label' => $label,
                        'attributes' => ['class' => implode(' ', $class)],
                        'type' => $type,
                        'length' => $length,
                        'required' => !filter_var($column->Null, FILTER_VALIDATE_BOOLEAN),
                        'unique' => $column->Key == 'UNI',
                        'foreign' => $foreign,
                        'options' => $options,
                        'value' => $column->Default,
                    ]);
                }
            }
        } catch (\Illuminate\Database\QueryException $e) {
            //
        } catch (\Exception $e) {
            //
        }
        return $fields;
    }
}