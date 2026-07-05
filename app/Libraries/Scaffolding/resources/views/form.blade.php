@extends('layouts.app')
@section('title', $title)
@section('breadcrumb')
    @parent
@endsection

@section('content')
<div class="card">
    <div class="card-header">
        <!-- Header content here -->
    </div>

    <div class="card-body">
        <form id="scaffolding-form"
              method="{{ $model->id ? 'POST' : 'POST' }}"
              enctype="multipart/form-data"
              action="{{ $model->id ? route("{$prefix}.edit", $model->id) : route("{$prefix}.create") }}">
            @csrf
            @if($model->id)
                @method('PATCH')
            @else
                @method('PUT')
            @endif

            <div class="row">
                @php
                    $fields = $model->fields();
                    if (!isset($columns)) {
                        $columns = $model->getColumns();
                    } elseif (isset($columns) && is_array($columns)) {
                        $columns = collect($columns);
                    }
                    $cols = isset($cols) ? $cols : 2;
                    $count = $columns->count();
                    $chunk = ceil($cols <= $count ? $count / $cols : $count);
                    $sprintName = isset($sprintName) ? $sprintName : '%s';
                    $validate = isset($validate) ? $validate : true;
                    $hiddens = isset($hiddens) ? $hiddens : [];
                    $viewOnly = isset($viewOnly) ? $viewOnly : false;
                @endphp

                @foreach ($columns as $column)
                    @php
                        $fieldName = sprintf($sprintName, $column);
                        $fieldAttr = ['class' => 'form-control'];
                    @endphp
                    @if ($fields && ($field = $fields->get($column)))
                        @php
                            $field = (object) $field;
                            $fieldType = $field->type;
                            $fieldLabel = $field->label;
                            $fieldValue = old($fieldName, $model->$fieldName ?? $field->value);
                            $fieldRequired = $field->required ?? false;
                            $isReadonly = ($viewOnly || $action == 'View');
                            $options = $field->options ?? [];

                            if (method_exists($model, 'getFormField') && ($customField = $model->getFormField($column))) {
                                echo $customField;
                                continue;
                            }
                        @endphp

                        <div class="col-md-6 mb-3">
                            <label for="{{ $fieldName }}">
                                {!! $fieldLabel !!}
                                @if($fieldRequired)
                                    <span class="text-danger">*</span>
                                @endif
                            </label>

                            {{-- Tipe Select --}}
                            @if($fieldType == 'select')
                                <select name="{{ $fieldName }}" id="{{ $fieldName }}"
                                        class="form-control {{ $fieldRequired ? 'required' : '' }}"
                                        {{ $isReadonly ? 'disabled' : '' }}>
                                    <option value="">-- Pilih --</option>
                                    @foreach($options as $key => $val)
                                        <option value="{{ $key }}" {{ $key == $fieldValue ? 'selected' : '' }}>
                                            {{ $val }}
                                        </option>
                                    @endforeach
                                </select>

                            {{-- Tipe Textarea --}}
                            @elseif($fieldType == 'textarea')
                                <textarea name="{{ $fieldName }}"
                                          id="{{ $fieldName }}"
                                          rows="5"
                                          class="form-control {{ $fieldRequired ? 'required' : '' }}"
                                          {{ $isReadonly ? 'readonly' : '' }}>{{ $fieldValue }}</textarea>

                            {{-- Tipe File --}}
                            @elseif($fieldType == 'file')
                                <input type="file"
                                       name="{{ $fieldName }}"
                                       id="{{ $fieldName }}"
                                       class="form-control {{ $fieldRequired ? 'required' : '' }}"
                                       {{ $isReadonly ? 'disabled' : '' }}
                                       onchange="previewImage(this, 'preview-{{ $fieldName }}')">
                                <div class="mt-2" id="preview-{{ $fieldName }}">
                                    @if(!empty($fieldValue))
                                        <img src="{{ asset('storage/' . $fieldValue) }}" alt="Preview" class="img-thumbnail" style="max-height: 150px;">
                                    @endif
                                </div>

                            {{-- Default Input --}}
                            @else
                                <input type="{{ $fieldType == 'decimal' ? 'number' : $fieldType }}"
                                       step="{{ $fieldType == 'decimal' ? 'any' : null }}"
                                       name="{{ $fieldName }}"
                                       id="{{ $fieldName }}"
                                       value="{{ $fieldValue }}"
                                       class="form-control {{ $fieldRequired ? 'required' : '' }}"
                                       {{ $isReadonly ? 'readonly' : '' }}>
                            @endif

                            {{-- Error --}}
                            @if ($errors->has($fieldName))
                                <div class="text-danger small">{{ $errors->first($fieldName) }}</div>
                            @endif
                        </div>
                    @endif
                @endforeach

                {{-- Hidden Inputs --}}
                @foreach ($hiddens as $hidden)
                    <input type="hidden" name="{{ $hidden }}" value="{{ $model->$hidden }}">
                @endforeach
            </div>
        </form>
    </div>

    <div class="card-footer">
        <button class="btn btn-success scaffolding-submit" data-target="#scaffolding-form">Save</button>

        @if($model->id && Route::has("{$prefix}.delete"))
            <form id="scaffolding-form-delete"
                  action="{{ route("{$prefix}.delete", $model->id) }}"
                  method="POST"
                  class="d-inline">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger scaffolding-submit">Delete</button>
            </form>
        @endif
    </div>
</div>
@endsection
@push('script')
    <script>
        window.dd = function() {
            window.console.log.apply(window.console, arguments);
        };
        $(document).ready(function() {
            var $form = $('#scaffolding-form');
            var $formDelete = $('#scaffolding-form-delete');
            $('select[required]').css({
                position: 'absolute',
                display: 'inline',
                height: 0,
                padding: 0,
                border: '1px solid rgba(255,255,255,0)',
                width: 0
            });
            $(document).off('click', '.scaffolding-submit').on('click', '.scaffolding-submit', function() {
                var $btn = $(this);
                var $form = $($btn.data('target'));
                $form.submit();
            });
            $form.validate({
                errorElement: 'div',
                errorPlacement: function(error, element) {
                    var placement = $(element).data('error'),
                        $inputField = element.closest('.input-field');
                    if (placement) {
                        $(placement).append(error)
                    } else {
                        $inputField.append(error)
                    }
                }
            });
            $form.on('submit', function(e) {
                e.preventDefault();
                if (!$form.valid()) return false;
                
                var formData = new FormData(this);
                $.ajax({
                    url: $(this).attr('action'),
                    type: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function(response) {
                        if(response.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: response.message,
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                if(response.redirect) window.location.href = response.redirect;
                            });
                        }
                    },
                    error: function(xhr) {
                        var err = xhr.responseJSON;
                        var msg = err.message || 'Terjadi kesalahan sistem.';
                        Swal.fire('Error', msg, 'error');
                    }
                });
            });

            $formDelete.submit(function(e) {
                e.preventDefault();
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        var formData = new FormData(this);
                        $.ajax({
                            url: $(this).attr('action'),
                            type: 'POST',
                            data: formData,
                            cache: false,
                            contentType: false,
                            processData: false,
                            success: function(response) {
                                if(response.success) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Deleted!',
                                        text: response.message,
                                        timer: 1500,
                                        showConfirmButton: false
                                    }).then(() => {
                                        if(response.redirect) window.location.href = response.redirect;
                                    });
                                }
                            },
                            error: function(xhr) {
                                Swal.fire('Error', 'Gagal menghapus data.', 'error');
                            }
                        });
                    }
                });
            });
            
            window.previewImage = function(input, previewId) {
                var previewContainer = document.getElementById(previewId);
                previewContainer.innerHTML = '';
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        if (input.files[0].type.startsWith('image/')) {
                            var img = document.createElement('img');
                            img.src = e.target.result;
                            img.className = 'img-thumbnail';
                            img.style.maxHeight = '150px';
                            previewContainer.appendChild(img);
                        } else {
                            previewContainer.innerHTML = '<span class="badge badge-info">File ready to upload</span>';
                        }
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            }
        });
    </script>
@endpush
