@php
    $scaffolding = app('scaffolding');
    $prefix = $scaffolding->prefix();
    $title = $scaffolding->title();
@endphp
@if(\Route::getRoutes()->hasNamedRoute("{$prefix}.create"))
    <a href="{{$href ?? route("{$prefix}.create")}}" class="btn btn-gd-success btn-info mb-2 {{isset($modal) ? 'modal-trigger' : ''}}">
     Add {{\Str::title($title ?? $prefix)}}
    </a>
@endif
@if(!empty($extraButtons))
    @foreach($extraButtons as $btn)
        <a href="{{ $btn['href'] }}"  data-url="{{$btn['data-url']}}"
           class="btn {{ $btn['class'] }} mb-2">
            {{ $btn['label'] }}
        </a>
    @endforeach
    <div class="modal fade" id="globalImportModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <form id="globalImportForm" enctype="multipart/form-data">
                @csrf
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Import Excel</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <input type="file" name="excel" class="form-control" required>
                        <input type="hidden" name="import_url" id="globalImportUrl">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">
                            Close
                        </button>
                        <button type="submit" class="btn btn-primary">
                            Upload
                        </button>
                    </div>

                </div>
            </form>
        </div>
    </div>
    @push('script')
        <script>
            $(document).on('click', '.btn-import-global', function (e) {
                e.preventDefault();

                let url = $(this).data('import-url');

                $('#globalImportUrl').val(url);
                $('#globalImportModal').modal('show');
            });

        </script>
    @endpush
@endif

{{-- @if (auth()->user()->can("{$prefix}-search")) --}}
@include('scaffolding::index-toolbar-search')
{{-- @endif --}}
