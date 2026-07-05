{!! Form::model($log, ['id' => 'modal-detail-data']) !!}
<div class="row">
    <div class="col s6 mb-3">
        {!! Form::label('id', 'ID', ['class' => 'control-label']) !!}
        {!! Form::text('id', null, ['class' => 'form-control', 'readonly']) !!}
    </div>
    <div class="col s6 mb-3">
        {!! Form::label('status', 'Status', ['class' => 'control-label']) !!}
        {!! Form::text('status', null, ['class' => 'form-control', 'readonly']) !!}
    </div>
    <div class="col s12 mb-3">
        {!! Form::label('message', 'Message', ['class' => 'control-label']) !!}
        {!! Form::textarea('message', null, ['class' => 'materialize-textarea', 'readonly', 'rows' => 5]) !!}
    </div>
    <div class="col s6 mb-3">
        {!! Form::label('parameter', 'Parameters', ['class' => 'control-label']) !!}
        @if($log->parameter->count())
            @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->parameter])
        @endif
    </div>
    <div class="col s6 mb-3">
        {!! Form::label('data', 'Data', ['class' => 'control-label']) !!}
        @if($log->data->count())
            @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->data])
        @endif
    </div>
    <div class="col s12 mb-3">
        <hr>
    </div>
    <div class="col s6 mb-3">
        {!! Form::label('elapsed', 'Elapsed', ['class' => 'control-label']) !!}
        {!! Form::text('elapsed', null, ['class' => 'form-control', 'readonly']) !!}
    </div>
    <div class="col s6 mb-3">
        {!! Form::label('created_at', 'Logged At', ['class' => 'control-label']) !!}
        {!! Form::text('created_at', null, ['class' => 'form-control', 'readonly']) !!}
    </div>
</div>
{!! Form::close() !!}