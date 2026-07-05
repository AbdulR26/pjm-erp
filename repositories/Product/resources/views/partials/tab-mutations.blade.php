<div id="mutations-section" style="display:none;">
    <hr class="mt-2 mb-3">
    
    <div class="row">
        {{-- Left Column: Adjust Stock Form --}}
        <div class="col-md-4">
            <div class="card card-outline-primary border-primary mutation-form-card" style="border: 1px solid #ebe9f1; border-radius: 8px;">
                <div class="card-header bg-transparent py-3" style="border-bottom: 1px solid #ebe9f1;">
                    <h6 class="font-weight-bold text-primary mb-0">Adjust Product Stock</h6>
                </div>
                <div class="card-body py-3">
                    <form id="stock-adjustment-form">
                        @csrf
                        <div class="form-group mb-2">
                            <label class="form-label font-weight-bold text-muted small">Adjustment Type</label>
                            <select name="type" id="mutation-type" class="form-control" style="border-radius: 6px; height: 38px;">
                                <option value="in" class="text-success font-weight-bold">Stock In (+)</option>
                                <option value="out" class="text-danger font-weight-bold">Stock Out (-)</option>
                            </select>
                        </div>
                        <div class="form-group mb-2">
                            <label class="form-label font-weight-bold text-muted small">Quantity</label>
                            <input type="number" name="quantity" id="mutation-qty" class="form-control" min="1" value="1" required style="border-radius: 6px; height: 38px;">
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label font-weight-bold text-muted small">Notes / Description</label>
                            <textarea name="notes" id="mutation-notes" class="form-control" rows="3" placeholder="Reason for adjustment (e.g. Restock, damaged item)..." style="border-radius: 6px; resize: none;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="btn-submit-adjustment" style="border-radius: 6px; height: 38px;">
                            Apply Adjustment
                        </button>
                    </form>
                </div>
            </div>
        </div>

        {{-- Right Column: Mutation History Table --}}
        <div class="col-md-8">
            <div class="card" style="border: 1px solid #ebe9f1; border-radius: 8px; box-shadow: none;">
                <div class="card-header bg-transparent py-3 d-flex justify-content-between align-items-center" style="border-bottom: 1px solid #ebe9f1;">
                    <h6 class="font-weight-bold text-dark mb-0">Mutation History</h6>
                    <span class="badge badge-light-secondary" id="mutation-history-count">0 Records</span>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-hover mb-0" id="table-stock-mutations">
                            <thead class="thead-light">
                                <tr>
                                    <th style="padding: 10px 15px; font-size: 11px;">Date & Time</th>
                                    <th style="padding: 10px 15px; font-size: 11px;">Type</th>
                                    <th style="padding: 10px 15px; font-size: 11px; text-align: right;">Qty</th>
                                    <th style="padding: 10px 15px; font-size: 11px;">Source</th>
                                    <th style="padding: 10px 15px; font-size: 11px;">Notes</th>
                                </tr>
                            </thead>
                            <tbody id="mutations-history-tbody">
                                {{-- Loaded via Ajax --}}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@push('css')
<style>
    .mutation-form-card {
        background: #fafafa;
        transition: all 0.2s ease;
    }
    .mutation-form-card:hover {
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
    }
    #table-stock-mutations th {
        border-top: none;
        background-color: #f3f2f7;
        color: #5e5873;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    #table-stock-mutations td {
        padding: 12px 15px;
        font-size: 12.5px;
        vertical-align: middle;
        border-bottom: 1px solid #ebe9f1;
    }
</style>
@endpush
