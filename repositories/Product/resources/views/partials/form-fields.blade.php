{{-- Product Name --}}
<div class="col-md-6 form-group">
    <label for="name" class="form-label font-weight-bold">Product Name</label>
    <input type="text" name="name" id="name" value="{{ old('name', $product->name) }}" class="form-control @error('name') is-invalid @enderror" placeholder="Enter product name" required>
    @error('name')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

{{-- SKU --}}
<div class="col-md-6 form-group" id="sku_group">
    <label for="sku" class="form-label font-weight-bold">SKU (Stock Keeping Unit)</label>
    <input type="text" name="sku" id="sku" value="{{ old('sku', $product->sku) }}" class="form-control @error('sku') is-invalid @enderror" placeholder="Enter SKU">
    @error('sku')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

{{-- Product Type --}}
<div class="col-md-4 form-group">
    <label for="product_type_id" class="form-label font-weight-bold">Product Type</label>
    <select name="product_type_id" id="product_type_id" class="form-control @error('product_type_id') is-invalid @enderror" required>
        <option value="">-- Select Type --</option>
        @foreach($types as $type)
            <option value="{{ $type->id }}" data-name="{{ $type->name }}" {{ old('product_type_id', $product->product_type_id) == $type->id ? 'selected' : '' }}>
                {{ Str::title($type->name) }}
            </option>
        @endforeach
    </select>
    @error('product_type_id')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

{{-- Parent Product (shown only if variant type) --}}
<div class="col-md-4 form-group" id="parent_product_group" style="display: none;">
    <label for="parent_id" class="form-label font-weight-bold">Parent Product (Configurable)</label>
    <select name="parent_id" id="parent_id" class="form-control @error('parent_id') is-invalid @enderror">
        <option value="">-- Select Parent Product --</option>
        @foreach($parents as $parent)
            <option value="{{ $parent->id }}" {{ old('parent_id', $product->parent_id) == $parent->id ? 'selected' : '' }}>
                {{ $parent->name }}
            </option>
        @endforeach
    </select>
    @error('parent_id')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

{{-- Product Status --}}
<div class="col-md-4 form-group">
    <label for="product_status_id" class="form-label font-weight-bold">Product Status</label>
    <select name="product_status_id" id="product_status_id" class="form-control @error('product_status_id') is-invalid @enderror" required>
        <option value="">-- Select Status --</option>
        @foreach($statuses as $status)
            <option value="{{ $status->id }}" {{ old('product_status_id', $product->product_status_id) == $status->id ? 'selected' : '' }}>
                {{ Str::title($status->name) }}
            </option>
        @endforeach
    </select>
    @error('product_status_id')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

{{-- Price --}}
<div class="col-md-4 form-group" id="price_group">
    <label for="price" class="form-label font-weight-bold">Price</label>
    <div class="input-group">
        <div class="input-group-prepend">
            <span class="input-group-text">Rp</span>
        </div>
        <input type="number" step="0.01" name="price" id="price" value="{{ old('price', $product->price ?? 0) }}" class="form-control @error('price') is-invalid @enderror" placeholder="0.00">
    </div>
    @error('price')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

{{-- Stock (hidden for configurable) --}}
<div class="col-md-4 form-group" id="stock_group">
    <label for="stock" class="form-label font-weight-bold">Initial Stock</label>
    <input type="number" name="stock" id="stock" value="{{ old('stock', $product->stock ?? 0) }}" class="form-control @error('stock') is-invalid @enderror" placeholder="0">
    @error('stock')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>

{{-- Weight --}}
<div class="col-md-4 form-group" id="weight_group">
    <label for="weight" class="form-label font-weight-bold">Weight (grams)</label>
    <div class="input-group">
        <input type="number" name="weight" id="weight" value="{{ old('weight', $product->weight ?? 1000) }}" class="form-control @error('weight') is-invalid @enderror" placeholder="1000" required>
        <div class="input-group-append">
            <span class="input-group-text">grams</span>
        </div>
    </div>
    @error('weight')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>



{{-- Description --}}
<div class="col-md-12 form-group">
    <label for="description" class="form-label font-weight-bold">Description</label>
    <textarea name="description" id="description" class="form-control @error('description') is-invalid @enderror" rows="3" placeholder="Enter product description...">{{ old('description', $product->description) }}</textarea>
    @error('description')
        <div class="invalid-feedback">{{ $message }}</div>
    @enderror
</div>



{{-- Action Buttons --}}
<div class="col-md-12 text-right mt-1" id="form-actions">
    <a href="{{ route('product.index') }}" class="btn btn-outline-secondary mr-1">
        Cancel
    </a>
    <button type="submit" class="btn btn-primary" id="btn-save">
        Save Product
    </button>
</div>
