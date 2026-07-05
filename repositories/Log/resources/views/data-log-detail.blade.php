<form id="modal-detail-data">
    <div class="row">
        <div class="col-md-6">
            <div class="form-group">
                <label for="id" class="control-label">ID</label>
                <input type="text" name="id" id="id" value="{{ $log->id }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="table" class="control-label">Data</label>
                <input type="text" name="table" id="table" value="{{ $log->table }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="model" class="control-label">Model</label>
                <input type="text" name="model" id="model" value="{{ $log->model }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="key" class="control-label">Key</label>
                <input type="text" name="key" id="key" value="{{ $log->key }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="url" class="control-label">URI</label>
                <input type="text" name="url" id="url" value="{{ $log->url }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="action" class="control-label">Action</label>
                <input type="text" name="action" id="action" value="{{ $log->action }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="method" class="control-label">Method</label>
                <input type="text" name="method" id="method" value="{{ $log->method }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-12">
            <hr>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label class="control-label">Previous Data</label>
                @if($log->before->count())
                    @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->before])
                @endif
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label class="control-label">Data Changes</label>
                @if($log->after->count())
                    @include(\Qollam\Log\LogModule::$alias . '::array-to-ul', ['items' => $log->after])
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
                <label for="created_by" class="control-label">Created By</label>
                <input type="text" name="created_by" id="created_by" value="{{ $createdBy }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="ip_address" class="control-label">IP Address</label>
                <input type="text" name="ip_address" id="ip_address" value="{{ $log->ip_address }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="elapsed" class="control-label">Elapsed</label>
                <input type="text" name="elapsed" id="elapsed" value="{{ $log->elapsed }}" class="form-control" readonly>
            </div>
        </div>

        <div class="col-md-6">
            <div class="form-group">
                <label for="created_at" class="control-label">Logged At</label>
                <input type="text" name="created_at" id="created_at" value="{{ $log->created_at }}" class="form-control" readonly>
            </div>
        </div>
    </div>
</form>
