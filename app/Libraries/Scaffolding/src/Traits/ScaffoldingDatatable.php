<?php

namespace Scaffolding\Traits;

use Illuminate\Support\Str;

trait ScaffoldingDatatable
{
    /**
     * @var \Illuminate\Support\Collection
     */
    protected $datatableConfig = [];

    /**
     * @var \Illuminate\Support\Collection
     */
    protected $datatableColumns = [];

    /**
     * @return \Illuminate\Support\Collection
     */
    public function datatableColumns()
    {
        return $this->datatableColumns;
    }

    protected function initDatatable($columns = [])
    {
        $columns = $this->datatableColumns();
        $this->datatableConfig = collect([
//            'ajax' => true,
            'data' => null,
            'processing' => false,
            'timestamp' => false,
            'paging' => true,
            'searching' => true,
            'ordering' => true,
            'state_save' => false,
            'server_side' => true,
//            'actions' => ['edit', 'delete', 'view'],
            'actions' => ['edit'],
            'dom' => null,
            'buttons' => [],
            'lengthMenu' => [],
            'actionsRoute' => [],
            'modal' => false,
            'checkbox' => false,
            'init' => true,
            'responsive' => true,
            'order' => [],
            'headerNumbering' => false,
            'nested' => false,
            'columnSearch' => false,
            'viewSearch' => view('scaffolding::index-search'),
            'viewToolbar' => view('scaffolding::index-toolbar'),
            'withQuery' => null,
            'viewBreadcrumbs' => false,
            'viewTitle' => false,
            'viewScript' => null,
            'viewStyle' => null,
            'filter' => null,
        ]);
        try {
            $this->datatableColumnSet($columns);
        } catch (\Exception $e) {
        }

        $this->datatable();
    }

    public function datatable($key = null)
    {
//        if (isset($this->datatableColumns) && $this->datatableColumns instanceof \Illuminate\Support\Collection)
//            $this->datatableConfig->put('column_defs', $this->datatableColumns->toArray());
        try {
            if ($this->datatableConfig->get('timestamp')) {
                if (!$this->datatableColumns->has('created_at')) $this->datatableColumnSet('created_at', ['title' => 'Created At', 'data' => 'created_at']);
                if (!$this->datatableColumns->has('updated_at')) $this->datatableColumnSet('updated_at', ['title' => 'Updated At', 'data' => 'updated_at']);
            }
            if ($this->datatableConfig->get('actions')) {
                if (!$this->datatableColumns->has('action')) $this->datatableColumnSet('action', ['title' => 'Action', 'data' => 'action', 'searchable' => false, 'orderable' => false]);
            }
            if ($this->datatableConfig->get('checkbox') === true) {
//                if (!$this->datatableColumns->has('checkbox')) $this->datatableColumns->prepend(['title' => '<input type="checkbox" class="cb-parent">', 'data' => 'checkbox', 'searchable' => false, 'orderable' => false], 'checkbox');
                $this->datatableConfig->offsetSet('columnDefs', [
                    [
                        'orderable' => false,
                        'targets' => 0,
                        'checkboxes' => ['selectRow' => true],
                        'defaultContent' => '',
                        'class' => 'dss',
                    ],
                ]);
            }
            if ($this->datatableConfig->get('headerNumbering') === true) {
                $this->datatableColumns->transform(function ($col, $colIndex) {
                    if(!preg_match('/^\[\d+\]/i', $col['title'])) $col['title'] = "[$colIndex]" . $col['title'];
                    return $col;
                });
            }
        } catch (\Exception $e) {
            dd($e);
        }

        return !is_null($key) ? $this->datatableConfig->get($key) : $this->datatableConfig;
    }

    public function datatableColumnUnset($columns = [], $reset = false)
    {
        if (!$this->datatableColumns || $reset) $this->datatableColumns = collect([]);
        $this->datatableColumns->forget($columns);
        return $this;
    }

    public function datatableColumnSet($column, $values = [])
    {
//        if (!isset($this->datatableColumns))
//            throw new \Exception('Illegal initialized trait datatable!');
        if (!$this->datatableColumns) $this->datatableColumns = collect([]);
        if (is_string($column)) {
            $defaultKey = [
                'className' => null,
                'title' => str_replace(['_id', '_'], ['', ' '], Str::title($column)),
                'visible' => true,
                'width' => null,
                'name' => $column,
                'data' => $column,
                'searchable' => true,
                'orderable' => true,
                'formatter' => null,
                'filter' => null,
                'searchType' => 'text',
                'searchOptions' => [],
                'searchAttributes' => [],
                'searchFormatter' => null,
                'value' => null
            ];
            foreach ($values as $key => $val) {
                if (!array_key_exists($key, $defaultKey))
                    unset($values[$key]);
            }
            $columnDefs = $this->datatableColumns->get($column);
            $keys = $columnDefs ? $columnDefs : $defaultKey;
            $this->datatableColumns->put($column, array_merge($keys, (array)$values));
        } elseif (is_array($column) && !$values)
            foreach ($column as $key => $value) {
                if (is_string($key) && is_array($value)) $this->datatableColumnSet($key, $value);
                else if (!is_string($key) && is_string($value)) $this->datatableColumnSet($value);
            }
        return $this;
    }

    public function datatableSet($optionKey, $values = null)
    {
        if (is_string($optionKey) && $this->datatableConfig->has($optionKey)) {
            $this->datatableConfig->put($optionKey, $values);
        } elseif (is_array($optionKey) && !$values)
            foreach ($optionKey as $key => $value)
                $this->datatableSet($key, $value);
        return $this;
    }
}
