<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

trait Select2Response
{
    /**
     * Generating select2 json response for any model
     *
     * @return \Illuminate\Http\JsonResponse
     */
    use Query;
    public function select2Response(Request $request)
    {
        try {
            $modelName = $request->modelName;
            $label = $request->label ?: 'name';
            $relations = $request->relations;
            $conditions = (array)$request->conditions;
            $scopes = array_filter((array)$request->scopes);
            $separator = $request->separator ?: ' - ';
            /** @var \Illuminate\Database\Eloquent\Model $model */
            try {
                $model = app('App\\' . Str::studly($modelName));
            } catch (\Exception $e) {
                $model = app('App\\Models\\' . Str::studly($modelName));
            }
            $table = $model->getTable();
            $model = $model->withoutGlobalScopes();
            // Attach model relationship
            if ($relations)
                $model = $model->with($relations);
            // Attach model scope
            if ($scopes) {
                foreach ((array)$scopes as $scope)
                    $model = $model->$scope();
            }
            // Add extra conditions
            if ($conditions && is_array($conditions)) {
                foreach ($conditions as $key => $value) {
                    foreach ($this->_select2ParseCondition($value, $key) as $k => $condition) {
                        extract($condition);
                        /**
                         * @var string $clause
                         * @var string $operator
                         * @var string $column
                         */
                        if ($value == null || $value == '') {
                            $clause = $clause . 'Raw';
                            $model = $model->$clause("($column IS " . (in_array($operator, ['', '=']) ? '' : 'NOT ') . "NULL OR $column " . (in_array($operator, ['', '=']) ? '=' : '!= ') . " '0')");
                        } elseif ($value == 'notNull') {
                            $clause = $clause . 'Raw';
                            $model = $model->$clause("($column IS NOT NULL)");
                        } elseif (is_array($value)) {
                            $clause = $operator == '=' ? 'whereIn' : 'whereNotIn';
                            $model = $model->$clause($column, $value);
                        } else
                            $model = $model->$clause($column, $operator, $value);
                    }
                }
            }
            // Filter query model
            if (preg_match('/\+/', $label)) { // support plus notation (for concat columns)
                $columns = explode('+', $label);
                $rawCondition = [];
                foreach ($columns as $col)
                    $rawCondition[] = "LOWER($col)";
                $model = $model
                    ->addSelect([$table . '.id', \DB::raw('CONCAT_WS("' . $separator . '", ' . (implode(', ', $columns)) . ') AS text')])
                    ->whereRaw('CONCAT_WS("' . $separator . '", ' . (implode(', ', $rawCondition)) . ') LIKE "%' . strtolower($request->s) . '%"')
                    ->orderBy($columns[0]);
            } else {
                $model = $model->addSelect(["$table.*", \DB::raw($label . ' AS text')])->where(\DB::raw($label), 'like', '%' . $request->s . '%')->orderBy(\DB::raw($label));
            }
            // Calculate pagination
            /**
             * @var \Illuminate\Database\Eloquent\Builder|\Illuminate\Database\Query\Builder $model
             * @var \Illuminate\Pagination\LengthAwarePaginator $paginations
             */
            $results = $this->_select2Result($model, $conditions);
        } catch (\Exception $e) {
            $results = [
                'error' => true,
                'messages' => $e->getMessage(),
                'data' => [],
                'pagination' => false
            ];
        }
        return \Response::json($results);
    }

    protected function _select2Result($model, $conditions = [])
    {
        $query = $this->compile_query($model);
        $paginations = $model->paginate(request('perPage', 25));
        $results = [
            "results" => $paginations->items(),
            "pagination" => [
                "more" => $paginations->hasMorePages(),
                //"table" => $table
            ],
            'conditions' => $conditions,
            'error' => false
        ];
        if (!\App::environment('production'))
            $results['query'] = $query;
        return $results;
    }

    /**
     * @param string $subject
     * @param string $column
     * @return \Illuminate\Support\Collection|static
     */
    protected function _select2ParseCondition($subject, $column)
    {
        preg_match_all('/\|([^|&]+)|\&([^|&]+)/', $subject, $matchesCase);
        $outFormat = ['clause', 'column', 'operator', 'value'];
        $cases = collect(collect($matchesCase)->first());
        $conditions = collect([]);
        $operator = '=';
        if ($cases->count() > 0) {
            $leftSubject = str_replace($cases->implode(''), '', $subject);
            if ($leftSubject)
                $conditions = $conditions->merge($this->_select2ParseCondition($leftSubject, $column)->toArray());

            foreach ($cases as $case) {
                $value = preg_replace('/\&|\|/', '', $case);
                $condition = $this->_select2ToClauseQuery(str_replace($value, '', $case));
                if ($slice = $this->_select2ParseOperator($value)) {
                    $operator = $slice->operator;
                    $value = $slice->value;
                }
                $conditions->push(array_combine($outFormat, [$condition, $column, $operator, $value]));
                //$conditions->push([$condition => [$column, $operator, $value]]);
            }
        } else {
            if ($slice = $this->_select2ParseOperator($subject)) {
                $operator = $slice->operator;
                $subject = preg_replace('/\&|\|/', '', $slice->value);
            }
            if (!$subject)
                $subject = null;
            $conditions->push(array_combine($outFormat, [$this->_select2ToClauseQuery('&'), $column, $operator, $subject]));
            //$conditions->push([$this->_toConditionQuery('&') => [$column, $operator, $subject]]);
        }

        return $conditions;
    }


    /**
     * @param string $value
     * @return null|object
     */
    protected function _select2ParseOperator($value)
    {
        $result = null;
        if (preg_match('/[<>]=?|[!=]?=/', $value, $matchesOperator)) {
            $operator = collect($matchesOperator)->first();
            $value = str_replace($operator, '', $value);
            $result = (object)compact('operator', 'value');
        } else if (preg_match('/^(\!?\[)([\w\s\,]+)(\])$/', $value, $matchesOperator)) {
            $operator = preg_match('/\!/', $matchesOperator[1]) ? '!=' : '=';
            $value = explode(',', preg_replace('/\s+/', '', $matchesOperator[2]));
            $result = (object)compact('operator', 'value');
        }
        return $result;
    }

    /**
     * @param string $char
     * @return mixed
     */
    protected function _select2ToClauseQuery($char)
    {
        $vocabsCondtion = [
            '/\&/' => 'where',
            '/\|/' => 'orWhere'
        ];
        return preg_replace(array_keys($vocabsCondtion), array_values($vocabsCondtion), $char);
    }
}