<div id="info-section">
    <hr class="mt-2 mb-3">
    
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="font-weight-bold text-primary mb-0">Discount & Flash Sale Configurations</h5>
        <small class="text-success font-weight-bold" id="discount-save-status" style="display:none; font-size: 13px;">✓ Saved successfully</small>
    </div>

    <div class="card border shadow-none" style="border-radius: 8px; border-color: #ebe9f1 !important; background: #fafafb;">
        <div class="card-body">
            <form id="discount-settings-form">
                @csrf
                <div class="row">
                    {{-- Regular Discount Percentage --}}
                    <div class="col-md-4 form-group">
                        <label for="disc_percent" class="form-label font-weight-bold">Regular Discount (%)</label>
                        <div class="input-group">
                            <input type="number" name="discount_percent" id="disc_percent" min="0" max="100" value="{{ $product->discount_percent ?? 0 }}" class="form-control" placeholder="0">
                            <div class="input-group-append">
                                <span class="input-group-text">%</span>
                            </div>
                        </div>
                        <small class="text-muted">Akan memotong harga normal produk sesuai persentase yang dimasukkan.</small>
                    </div>

                    {{-- Enable Flash Sale Switch --}}
                    <div class="col-md-4 form-group d-flex align-items-center mt-md-2">
                        <div class="custom-control custom-switch custom-control-primary">
                            <input type="checkbox" class="custom-control-input" id="disc_is_flash_sale" name="is_flash_sale" value="1" {{ $product->is_flash_sale ? 'checked' : '' }}>
                            <label class="custom-control-label font-weight-bold text-dark cursor-pointer" for="disc_is_flash_sale">Enable Flash Sale</label>
                        </div>
                    </div>
                </div>

                {{-- Flash Sale Details Box --}}
                <div id="disc-flash-sale-details" style="{{ $product->is_flash_sale ? '' : 'display: none;' }}">
                    <hr class="my-2" style="border-color: #ebe9f1;">
                    <div class="row">
                        {{-- Flash Sale Price --}}
                        <div class="col-md-4 form-group">
                            <label for="disc_flash_sale_price" class="form-label font-weight-bold">Flash Sale Price</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text">Rp</span>
                                </div>
                                <input type="number" step="0.01" name="flash_sale_price" id="disc_flash_sale_price" value="{{ $product->flash_sale_price }}" class="form-control" placeholder="0.00">
                            </div>
                            <small class="text-muted">Harga khusus produk selama masa promo Flash Sale berlangsung.</small>
                        </div>

                        {{-- Flash Sale Stock --}}
                        <div class="col-md-4 form-group">
                            <label for="disc_flash_sale_stock" class="form-label font-weight-bold">Flash Sale Stock</label>
                            <input type="number" name="flash_sale_stock" id="disc_flash_sale_stock" value="{{ $product->flash_sale_stock ?? 0 }}" class="form-control" placeholder="0">
                            <small class="text-muted">Kuota stok yang dialokasikan khusus untuk Flash Sale.</small>
                        </div>
                    </div>
                    <div class="row">
                        {{-- Flash Sale Start Date --}}
                        <div class="col-md-4 form-group">
                            <label for="disc_flash_sale_start" class="form-label font-weight-bold">Start Time</label>
                            <input type="datetime-local" name="flash_sale_start" id="disc_flash_sale_start" value="{{ $product->flash_sale_start ? \Carbon\Carbon::parse($product->flash_sale_start)->format('Y-m-d\TH:i') : '' }}" class="form-control">
                        </div>

                        {{-- Flash Sale End Date --}}
                        <div class="col-md-4 form-group">
                            <label for="disc_flash_sale_end" class="form-label font-weight-bold">End Time</label>
                            <input type="datetime-local" name="flash_sale_end" id="disc_flash_sale_end" value="{{ $product->flash_sale_end ? \Carbon\Carbon::parse($product->flash_sale_end)->format('Y-m-d\TH:i') : '' }}" class="form-control">
                        </div>
                    </div>
                </div>

                <div class="row mt-2">
                    <div class="col-md-12">
                        <button type="button" class="btn btn-primary btn-sm" id="btn-save-discount-settings" style="border-radius: 6px; padding: 10px 20px; font-weight: 600;">
                            Save Discount Settings
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
