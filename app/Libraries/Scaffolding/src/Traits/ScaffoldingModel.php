<?php
namespace Scaffolding\Traits;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Helpers\Helper;

trait ScaffoldingModel
{
    use ScaffoldingInit;

    /**
     * @var null|\Illuminate\Support\Collection
     */
    protected $fields = null;
    /**
     * @var null|\Illuminate\Support\Collection
     */
    protected $columns = null;
    /**
     * @var null|\Illuminate\Support\Collection
     */
    protected $layouts = null;

    public function initializeScaffoldingModel()
    {
        /** @var \Illuminate\Database\Eloquent\Model $this */
        $this->_initialize($this->getTable());
        // Set fillable model attribute
        if(!$this->fillable) {
            /** @var \Illuminate\Database\Eloquent\Model $this */
            $this->fillable($this->fields()->keys()->toArray());
        }
        $this->setColumns();
    }

    /**
     * @param string $tabelName
     * @return \Illuminate\Support\Collection
     */
    private function _initialize($tabelName)
    {
        // Parsing table description
        try {
            /** @var \Illuminate\Database\Eloquent\Model $this */
            $TB = \DB::connection($this->getConnectionName())->select('DESC ' . $tabelName);
            foreach ($TB as $column) {
                if (isset($column->Field) && !in_array($column->Field, ['id', 'created_at', 'updated_at'])) {
                    $type = 'text';
                    $length = null;
                    $options = [];
                    $class = ['validate'];
                    $foreign = preg_match('/unsigned/i', $column->Type) && $column->Key != 'KEY';
                    if (preg_match('/\((\d+)\)/i', $column->Type, $matches)) $length = $matches[1];
                    if (preg_match('/text/i', $column->Type)) $type = 'textarea';
                    if (preg_match('/^date$/i', $column->Type)) $class[] = 'date-picker';
                    if (preg_match('/datetime|timestamp/i', $column->Type)) $class[] = 'datetime-picker';
                    if (preg_match('/float|decimal|double/i', $column->Type)) $type = 'decimal';
                    if (preg_match('/integer/i', $column->Type)) $type = 'number';
                    if (preg_match('/enum\((.*)\)/i', $column->Type, $matches)) $options = explode(',', str_replace("'", '', $matches[1]));
                    if ($options || $foreign) $type = 'select';
                    $label = preg_replace('/(\b\w\b)( |\_)(\b\w\b)/i', '$1$3', Str::title(preg_replace(['/(\_|)(id)$/i', '/\_/'], [' $2', ' '], ctype_upper($column->Field) ? strtolower($column->Field) : Str::snake($column->Field))));
                    $this->fieldSet($column->Field, [
                        'label' => trim(preg_replace('/(\_|)id$|^id(\_|)/i', '', $label)),
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
        } catch (\Symfony\Component\Debug\Exception\FatalErrorException $e) {
            //
        } catch (\Exception $e) {
            //
        }
    }

    /**
     * @param $field
     * @param array $values
     * @return $this
     */
    public function fieldSet($field, $values = [])
    {
        if(!$this->fields) $this->fields = collect([]);
        if (is_string($field)) {
            $defaultKey = [
                'label' => str_replace(['_id', '_'], ['', ' '], Str::title($field)),
                'attributes' => ['class' => 'validate'],
                'containerAttributes' => ['class' => 'col-lg-6'],
                'type' => 'text',
                'length' => null,
                'required' => false,
                'unique' => false,
                'foreign' => false,
                'options' => [],
                'value' => null,
                'comment' => null,
                'display' => true,
                'formatter' => false,
            ];
            $fieldValues = $this->fields->get($field);
            $keys = $fieldValues ? $fieldValues : $defaultKey;
            if (isset($values['attributes']))
                $values['attributes'] = array_merge($defaultKey['attributes'], (array)$values['attributes']);
            $this->fields->put($field, array_merge($keys, (array)$values));
        } elseif (is_array($field) && !$values)
            foreach ($field as $key => $value)
                $this->fieldSet($key, $value);
        return $this;
    }

    /**
     * @param null $key
     * @param null $default
     * @return \Illuminate\Support\Collection|null
     */
    public function fields($key = null, $default = null)
    {
        if(!$this->fields) $this->fields = collect([]);
        if ($this->fields)
            return $this->fields->has($key) ? $this->fields->get($key, $default) : $this->fields;
        else
            return $default;
    }

    public function setColumns($cols = [])
    {
        $this->columns = $cols instanceof \Illuminate\Support\Collection ? 
        $cols : 
        collect($cols ? $cols : array_diff((array)$this->fillable, (array)$this->hidden));
    }

    public function getColumns()
    {
        return $this->columns;
    }
}