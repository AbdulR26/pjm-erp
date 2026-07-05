{!! Form::model($log, ['id' => 'modal-detail-data']) !!}
@php // dump_all($log) @endphp
<div class="row">
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('id', 'ID', ['class' => 'control-label']) !!}
            {!! Form::text('id', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('table', 'Data', ['class' => 'control-label']) !!}
            {!! Form::text('table', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('model', 'Model', ['class' => 'control-label']) !!}
            {!! Form::text('model', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('key', 'Key', ['class' => 'control-label']) !!}
            {!! Form::text('key', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('url', 'URI', ['class' => 'control-label']) !!}
            {!! Form::text('url', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('method', 'Method', ['class' => 'control-label']) !!}
            {!! Form::text('method', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('status', 'Status', ['class' => 'control-label']) !!}
            {!! Form::text('status', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('code', 'Status Code', ['class' => 'control-label']) !!}
            {!! Form::text('code', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-12">
        <div class="form-group">
            {!! Form::label('message', 'Message', ['class' => 'control-label']) !!}
            {!! Form::textarea('message', null, ['class' => 'form-control', 'readonly', 'rows' => 5]) !!}
        </div>
    </div>
    <div class="col-md-12">
        <hr>
        <div class="form-group">
            {!! Form::label('headers', 'Request Headers', ['class' => 'control-label']) !!}
            @if($log->headers->count())
                @php dump_all($log->headers->toArray()) @endphp
                {{--                @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->parameter])--}}
            @endif
        </div>
    </div>
    <div class="col-md-12">
        <hr>
        <div class="form-group">
            {!! Form::label('parameter', 'Request Parameters', ['class' => 'control-label']) !!}
            @if($log->parameter->count())
                @php dump_all($log->parameter->toArray()) @endphp
{{--                @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->parameter])--}}
            @endif
        </div>
    </div>
    <div class="col-md-12">
        <hr>
        <div class="form-group">
            {!! Form::label('response', 'Response', ['class' => 'control-label']) !!}
            @if($log->response->count())
                @php dump_all($log->response->toArray()) @endphp
{{--                @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->response])--}}
            @endif
        </div>
    </div>
    <div class="col-md-12">
        <hr>
        <div class="form-group">
            {!! Form::label('errors', 'Errors', ['class' => 'control-label']) !!}
            @if($log->errors->count())
                @php dump_all($log->errors->toArray()) @endphp
                {{--@include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->errors])--}}
            @endif
        </div>
    </div>
    <div class="col-md-12">
        <hr>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('before', 'Previous Data', ['class' => 'control-label']) !!}
            @if($log->before->count())
                @php dump_all($log->before->toArray()) @endphp
{{--                @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->before])--}}
            @endif
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('after', 'Data Changes', ['class' => 'control-label']) !!}
            @if($log->after->count())
                @php dump_all($log->after->toArray()) @endphp
{{--                @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->after])--}}
            @endif
        </div>
    </div>
    <div class="col-md-12">
        <hr>
    </div>
    @php
        $createdBy = null;
        try {
            $user = $log->model_created_by ? app($log->model_created_by) : null;
            if($user) $user = $user->find($log->created_by);
            if($user instanceof \App\User) {
                $createdBy = $user->name;
            }
        } catch (\Exception $e) {
            //
        }
    @endphp
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('created_by', 'Created By', ['class' => 'control-label']) !!}
            {!! Form::text('created_by', $createdBy, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="clearfix"></div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('ip_address', 'IP Address', ['class' => 'control-label']) !!}
            {!! Form::text('ip_address', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('http_user_agent', 'User Agent', ['class' => 'control-label']) !!}
            {!! Form::text('http_user_agent', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('elapsed', 'Elapsed', ['class' => 'control-label']) !!}
            {!! Form::text('elapsed', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-group">
            {!! Form::label('created_at', 'Logged At', ['class' => 'control-label']) !!}
            {!! Form::text('created_at', null, ['class' => 'form-control', 'readonly']) !!}
        </div>
    </div>
</div>
{!! Form::close() !!}