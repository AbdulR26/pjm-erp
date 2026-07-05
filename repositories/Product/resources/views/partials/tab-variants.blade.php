<div id="variants-section" style="display:none;">
    <hr class="mt-2 mb-3">
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="font-weight-bold text-primary mb-0">Variant List</h5>
        <a href="{{ route('product.create', ['parent_id' => $product->id, 'product_type_id' => 3]) }}" class="btn btn-primary btn-sm">
            Add Variant
        </a>
    </div>
    <div class="table-responsive">
        <table style="width: 100%" id="datatable_variants" class="table invoice-data-table white border-radius-4 pt-1 striped">
            <thead>
                <tr>
                    <th style="width:40px;"><input type="checkbox" id="select-all-variant-rows"></th>
                    <th>Variant Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th class="text-center" style="width: 180px;">Actions</th>
                </tr>
            </thead>
        </table>
    </div>
</div>
