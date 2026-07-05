@php
    try {
        /** @var \Scaffolding\Scaffolding $scaffolding */
        $scaffolding = app('scaffolding');
        $config = $scaffolding->datatable();
        $columns = $scaffolding->datatableColumns();
        $model = $scaffolding->getModel();
        $fields = $model->fields();
    } catch (\Exception $e) {
        dd($e);
    }
@endphp

<div style="display: none" class="card list-search-container-1">
    <div class="card-body">
        <form id="scaffolding-datatable-form" method="GET">
            <div class="row">
                @foreach ($columns as $column => $attributes)
                    @if ($attributes['searchable'])
                        @php
                            $searchAttributes = $attributes['searchAttributes'] ?? [];
                            $isSelect = $attributes['searchType'] == 'select';
                            $inputClass = trim(($attributes['className'] ?? '') . ' form-control');
                            $value = $attributes['value'] ?? request($column);
                        @endphp

                        <div class="col-xl-4 col-md-6 col-12">
                            <div class="form-group">
                                <label for="{{ $column }}" class="active">{{ $attributes['title'] ?? ucfirst($column) }}</label>

                                {{-- Jika ada searchFormatter --}}
                                @if ($attributes['searchFormatter'] instanceof \Closure)
                                    {!! call_user_func($attributes['searchFormatter'], $model) !!}

                                {{-- Jika select --}}
                                @elseif ($isSelect)
                                    @php
                                        $options = [];
                                        if (is_iterable($attributes['searchOptions'])) {
                                            $options = $attributes['searchOptions'];
                                        } elseif ($attributes['searchOptions'] instanceof \Closure) {
                                            $options = call_user_func($attributes['searchOptions']);
                                        }
                                        $methodOption = 'get' . \Str::studly($column) . 'Options';
                                        if (!$options && method_exists($model, $methodOption)) {
                                            $options = $model->$methodOption();
                                        }
                                    @endphp
                                    <select
                                        name="{{ $column }}"
                                        id="{{ $column }}"
                                        class="custom-select init-select2 browser-default {{ $inputClass }}"
                                        data-allow-clear="true"
                                        data-placeholder="All"
                                        @foreach($searchAttributes as $k => $v)
                                            {{ $k }}="{{ $v }}"
                                        @endforeach
                                    >
                                        <option value="">All</option>
                                        @foreach ($options as $key => $text)
                                            <option value="{{ $key }}" {{ $key == $value ? 'selected' : '' }}>
                                                {{ $text }}
                                            </option>
                                        @endforeach
                                    </select>

                                {{-- Default: input text --}}
                                @else
                                    <input
                                        type="text"
                                        name="{{ $column }}"
                                        id="{{ $column }}"
                                        value="{{ $value }}"
                                        placeholder="Search"
                                        class="{{ $inputClass }}"
                                        @foreach($searchAttributes as $k => $v)
                                            {{ $k }}="{{ $v }}"
                                        @endforeach
                                    >
                                @endif
                            </div>
                        </div>
                    @endif
                @endforeach
            </div>
        </form>
    </div>

    <div class="card-footer list-search-container-2">
        <div class="d-flex justify-content-end">
            <button type="submit" form="scaffolding-datatable-form" class="btn btn-gd-warning mr-1">
                <i data-feather="search"></i> Search
            </button>
            <button type="reset" form="scaffolding-datatable-form" class="btn btn-gd-dark">
                <i data-feather="refresh-ccw"></i> Reset
            </button>
        </div>
    </div>
</div>
