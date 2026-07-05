@extends(\Qollam\Log\LogModule::instance()->config('view.layout'))
@section('title', __('Job Logs'))
@section('content')
    <div class="breadcrumbs-dark pb-0 pt-4" id="breadcrumbs-wrapper">
        <div class="container">
            <div class="row">
                <div class="col s10 m6 l6">
                    <h5 class="breadcrumbs-title mt-0 mb-0">
                        <span>@lang('Job Logs')</span></h5>
                    <ol class="breadcrumbs mb-0">
                        <li class="breadcrumb-item"><a href="{{route('dashboard')}}">Home</a></li>
                        <li class="breadcrumb-item active">Job Logs</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <section class="section mt-0">
            <div class="card border-radius-4">
                <div class="card-content">
                    {!! Form::open(['method' => 'get', 'class' => 'mb-3']) !!}
                    <div class="row">
                        <div class="col s3 mb-3">
                            {!! Form::label('date_from', 'Date From' , ['class' => 'control-label']) !!}
                            <div class="input-group">
                                {!! Form::text('date_from', $dateFrom ? $dateFrom->format('d-m-Y H:i') : null, ['class' => 'form-control datetime-picker']) !!}
                                <div class="input-group-addon"><i class="fa fa-calendar"></i></div>
                            </div>
                        </div>
                        <div class="col s3 mb-3">
                            {!! Form::label('date_to', 'Date To' , ['class' => 'control-label']) !!}
                            <div class="input-group">
                                {!! Form::text('date_to', $dateTo ? $dateTo->format('d-m-Y H:i') : null, ['class' => 'form-control datetime-picker']) !!}
                                <div class="input-group-addon"><i class="fa fa-calendar"></i></div>
                            </div>
                        </div>
                        <div class="col s3 mb-3">
                            <div class="form-group">
                                {!! Form::label('job', 'Job' , ['class' => 'control-label']) !!}
                                {!! Form::select('job', \Qollam\Log\Models\JobLog::groupBy('job')->pluck('job', 'job')->prepend('All', ''), request('job'), ['class' => 'form-control']) !!}
                            </div>
                        </div>
                        <div class="col s3 mb-3">
                            {!! Form::label('connection', 'Connection' , ['class' => 'control-label']) !!}
                            {!! Form::select('connection', \Qollam\Log\Models\JobLog::groupBy('connection')->pluck('connection', 'connection')->prepend('All', ''), request('connection'), ['class' => 'form-control']) !!}
                        </div>
                        <div class="col s3 mb-3">
                            {!! Form::label('status', 'Status' , ['class' => 'control-label']) !!}
                            {!! Form::select('status', \Qollam\Log\Models\JobLog::groupBy('status')->pluck('status', 'status')->prepend('All', ''), request('status'), ['class' => 'form-control']) !!}
                        </div>
                        <div class="col s12 text-right">
                            @php //dump(compile_query($query)) @endphp
                            {!! link_to(request()->url(), '<i class="fa fa-clear"></i> Reset', ['class' => 'btn btn-default'], null, false) !!}
                            {!! Form::button('<i class="fa fa-filter"></i> Filter', ['class' => 'btn btn-primary', 'type' => 'submit']) !!}
                        </div>
                    </div>
                    {!! Form::close() !!}

                    <div class="table-responsive mb-2">
                        <table class="table table-condensed table-hover table-striped">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Job</th>
                                <th>Connection</th>
                                <th>Parameter</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Message</th>
                                <th>Elapsed</th>
                                <th>Logged At</th>
                                <th style="width: 1px"></th>
                            </tr>
                            </thead>
                            <tbody>
                            @forelse($paginate->items() as $i => $item)
                                <tr>
                                    <td>{{$item->id}}</td>
                                    <td>{{$item->job}}</td>
                                    <td>{{$item->connection}}</td>
                                    <td>
                                        @if($item->parameter->count())
                                            <ul style="max-width: 300px;max-height: 300px;overflow: auto">
                                                @foreach($item->parameter as $key => $value)
                                                    <li>{!! $key !!} : {!! $value !!}</li>
                                                @endforeach
                                            </ul>
                                        @endif
                                    </td>
                                    <td>
                                        @if($item->data->count())
                                            <ul style="max-width: 300px;max-height: 300px;overflow: auto">
                                                @foreach($item->data as $key => $value)
                                                    <li>{!! $key !!} : {!! $value !!}</li>
                                                @endforeach
                                            </ul>
                                        @endif
                                    </td>
                                    <td>{{$item->status}}</td>
                                    <td>{{$item->message}}</td>
                                    <td>{{$item->elapsed}} s</td>
                                    <td>{{$item->created_at->format('d/m/Y H:i')}}</td>
                                    <td>
                                        {!! Form::button('Detail', ['class' => 'btn btn-xs btn-primary btn-detail', 'data-url' => route('job-logs.detail', $item->id)]) !!}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="10">Data not available</td>
                                </tr>
                            @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="row">
                        <div class="col s6">
                            {!! $paginate->links()  !!}
                        </div>
                        <div class="col s6 text-right">
                            Showing {{$paginate->firstItem()}} to {{$paginate->lastItem()}} from {{$paginate->total()}}
                            records
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <div id="modal-detail" class="modal modal-fixed-footer">
        <div class="modal-content">
            <h4>Log Detail</h4>
            <div id="modal-detail-data">...</div>
        </div>
        <div class="modal-footer">
            <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
        </div>
    </div>
@endsection

@push('css-override')
    <style>
        table thead tr {
            white-space: nowrap
        }

        table td ul {
            padding-left: 20px;
            max-height: 200px;
            overflow-x: auto;
        }

        table tbody td {
            text-transform: none;
        }
    </style>
@endpush
@push('js')
    {!! Html::script('vendors/' . \Qollam\Log\LogModule::$alias . '/js/log.js') !!}
@endpush
