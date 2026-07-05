@extends('layouts.app')
@section('title', $title)

@section('content')
<div class="row">
    <div class="col-12">
        <form action="{{ $po->exists ? route('admin.purchase-orders.edit', $po->id) : route('admin.purchase-orders.create') }}" method="POST" id="po-form">
            @csrf
            @if($po->exists)
                @method('PATCH')
            @else
                @method('PUT')
            @endif

            <!-- PO Header & Details Card -->
            <div class="card premium-card">
                <div class="card-header premium-card-header">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper">
                            <i data-feather="file-text"></i>
                        </div>
                        <div class="header-text-wrapper ml-1">
                            <h4 class="card-title font-weight-bold text-white mb-0">{{ $title }}</h4>
                            <p class="text-white-50 small mb-0">Kelola detail purchase order, pemasok, dan kalkulasi biaya</p>
                        </div>
                    </div>
                    @if($po->exists)
                        <span class="badge badge-pill badge-light-warning font-weight-bold px-1 py-50">{{ strtoupper($po->status) }}</span>
                    @endif
                </div>

                <div class="card-body pt-3">
                    <div class="row">
                        <!-- Supplier Info -->
                        <div class="col-md-4 form-group-premium">
                            <label class="form-label-premium" for="supplier_id">Pemasok / Supplier <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="truck"></i>
                                <select name="supplier_id" id="supplier_id" class="form-control-premium" required style="padding-top:2px; padding-bottom:2px;">
                                    <option value="" disabled selected>Pilih Supplier</option>
                                    @foreach($suppliers as $supplier)
                                        <option value="{{ $supplier->id }}" {{ (old('supplier_id', $po->supplier_id) == $supplier->id) ? 'selected' : '' }}>
                                            {{ $supplier->company_name ?? $supplier->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            @error('supplier_id') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                        </div>

                        <!-- Order Date -->
                        <div class="col-md-4 form-group-premium">
                            <label class="form-label-premium" for="order_date">Tanggal PO <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="calendar"></i>
                                <input type="text" name="order_date" id="order_date" value="{{ old('order_date', $po->order_date ? $po->order_date->format('Y-m-d') : date('Y-m-d')) }}" class="form-control-premium datetime-picker" required placeholder="Pilih Tanggal">
                            </div>
                            @error('order_date') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                        </div>

                        <!-- Expected Delivery Date -->
                        <div class="col-md-4 form-group-premium">
                            <label class="form-label-premium" for="expected_delivery_date">Estimasi Pengiriman</label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="clock"></i>
                                <input type="text" name="expected_delivery_date" id="expected_delivery_date" value="{{ old('expected_delivery_date', $po->expected_delivery_date ? $po->expected_delivery_date->format('Y-m-d') : '') }}" class="form-control-premium datetime-picker" placeholder="Pilih Tanggal (Opsional)">
                            </div>
                            @error('expected_delivery_date') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                        </div>

                        <!-- Status (Only editable on Edit draft) -->
                        @if($po->exists && $po->status === 'draft')
                            <div class="col-md-4 form-group-premium">
                                <label class="form-label-premium" for="status">Ubah Status</label>
                                <div class="input-wrapper-premium">
                                    <i class="input-icon" data-feather="activity"></i>
                                    <select name="status" id="status" class="form-control-premium" style="padding-top:2px; padding-bottom:2px;">
                                        <option value="draft" {{ $po->status == 'draft' ? 'selected' : '' }}>DRAFT</option>
                                        <option value="ordered" {{ $po->status == 'ordered' ? 'selected' : '' }}>ORDERED (Dipesan)</option>
                                        <option value="cancelled" {{ $po->status == 'cancelled' ? 'selected' : '' }}>CANCELLED (Batal)</option>
                                    </select>
                                </div>
                            </div>
                        @endif

                        <!-- Notes -->
                        <div class="col-12 form-group-premium mt-1">
                            <label class="form-label-premium" for="notes">Catatan Tambahan</label>
                            <textarea name="notes" id="notes" class="textarea-premium" rows="3" placeholder="Tambahkan catatan PO disini...">{{ old('notes', $po->notes) }}</textarea>
                            @error('notes') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                        </div>
                    </div>
                </div>
            </div>

            <!-- PO Items Table Card -->
            <div class="card premium-card">
                <div class="card-header bg-light d-flex justify-content-between align-items-center py-1">
                    <h5 class="font-weight-bold text-primary mb-0"><i data-feather="shopping-bag" class="mr-50"></i>Daftar Produk PO</h5>
                    <button type="button" class="btn btn-primary btn-sm font-weight-bold" data-toggle="modal" data-target="#productSelectModal">
                        <i data-feather="plus" class="mr-25"></i> Tambah Produk
                    </button>
                </div>

                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0" id="po-items-table">
                            <thead class="thead-light">
                                <tr>
                                    <th style="width: 50px;" class="text-center">No</th>
                                    <th>Nama Produk & SKU</th>
                                    <th style="width: 150px;">Jumlah (Qty)</th>
                                    <th style="width: 200px;">Biaya Satuan (Rp)</th>
                                    <th style="width: 200px;">Total Biaya (Rp)</th>
                                    <th style="width: 100px;" class="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="po-items-body">
                                @php $index = 0; @endphp
                                @if(old('items'))
                                    @foreach(old('items') as $oldItem)
                                        @php 
                                            $prod = \Qollam\Product\Models\Product::with('parent')->find($oldItem['product_id']);
                                            $index++; 
                                        @endphp
                                        @if($prod)
                                            <tr data-product-id="{{ $prod->id }}">
                                                <td class="text-center row-number">{{ $index }}</td>
                                                <td>
                                                    <span class="font-weight-bold text-primary">
                                                        {{ $prod->parent ? $prod->parent->name . ' - ' . $prod->name : $prod->name }}
                                                    </span><br>
                                                    <small class="text-muted">SKU: {{ $prod->sku ?: '-' }}</small>
                                                    <input type="hidden" name="items[{{ $index }}][product_id]" value="{{ $prod->id }}">
                                                </td>
                                                <td>
                                                    <input type="number" name="items[{{ $index }}][quantity]" class="form-control item-qty" min="1" value="{{ $oldItem['quantity'] }}" required>
                                                </td>
                                                <td>
                                                    <input type="number" step="any" name="items[{{ $index }}][unit_cost]" class="form-control item-cost" min="0" value="{{ $oldItem['unit_cost'] }}" required>
                                                </td>
                                                <td class="font-weight-bold text-dark item-total">
                                                    Rp {{ number_format($oldItem['quantity'] * $oldItem['unit_cost'], 0, ',', '.') }}
                                                </td>
                                                <td class="text-center">
                                                    <button type="button" class="btn btn-flat-danger btn-sm btn-remove-item"><i data-feather="trash-2"></i></button>
                                                </td>
                                            </tr>
                                        @endif
                                    @endforeach
                                @elseif($po->exists)
                                    @foreach($po->items as $item)
                                        @php $index++; @endphp
                                        <tr data-product-id="{{ $item->product_id }}">
                                            <td class="text-center row-number">{{ $index }}</td>
                                            <td>
                                                <span class="font-weight-bold text-primary">
                                                    {{ $item->product->parent ? $item->product->parent->name . ' - ' . $item->product->name : $item->product->name }}
                                                </span><br>
                                                <small class="text-muted">SKU: {{ $item->product->sku ?: '-' }}</small>
                                                <input type="hidden" name="items[{{ $index }}][product_id]" value="{{ $item->product_id }}">
                                            </td>
                                            <td>
                                                <input type="number" name="items[{{ $index }}][quantity]" class="form-control item-qty" min="1" value="{{ $item->quantity }}" required>
                                            </td>
                                            <td>
                                                <input type="number" step="any" name="items[{{ $index }}][unit_cost]" class="form-control item-cost" min="0" value="{{ $item->unit_cost }}" required>
                                            </td>
                                            <td class="font-weight-bold text-dark item-total">
                                                Rp {{ number_format($item->total_cost, 0, ',', '.') }}
                                            </td>
                                            <td class="text-center">
                                                <button type="button" class="btn btn-flat-danger btn-sm btn-remove-item"><i data-feather="trash-2"></i></button>
                                            </td>
                                        </tr>
                                    @endforeach
                                @endif
                                <tr id="empty-row" style="{{ $index > 0 ? 'display:none;' : '' }}">
                                    <td colspan="6" class="text-center text-muted py-3">Belum ada produk yang ditambahkan. Silakan klik tombol 'Tambah Produk'.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Cost Summary Section -->
            <div class="row">
                <div class="col-lg-6"></div>
                <div class="col-lg-6">
                    <div class="card premium-card">
                        <div class="card-body p-2 bg-light rounded" style="border: 1px dashed #7367f0;">
                            <h5 class="font-weight-bold text-primary mb-2 border-bottom pb-50"><i data-feather="pie-chart" class="mr-50"></i>Ringkasan Biaya PO</h5>
                            
                            <div class="d-flex justify-content-between mb-1">
                                <span class="text-secondary font-weight-bold">Subtotal:</span>
                                <span class="font-weight-bold text-dark" id="summary-subtotal">Rp 0</span>
                            </div>

                            <div class="row align-items-center mb-1">
                                <div class="col-6">
                                    <span class="text-secondary font-weight-bold">Pajak (Rp):</span>
                                </div>
                                <div class="col-6">
                                    <input type="number" name="tax" id="po-tax" class="form-control form-control-sm text-right font-weight-bold" min="0" value="{{ old('tax', $po->tax ?? 0) }}">
                                </div>
                            </div>

                            <div class="row align-items-center mb-1 border-bottom pb-1">
                                <div class="col-6">
                                    <span class="text-secondary font-weight-bold">Biaya Pengiriman (Rp):</span>
                                </div>
                                <div class="col-6">
                                    <input type="number" name="shipping_cost" id="po-shipping-cost" class="form-control form-control-sm text-right font-weight-bold" min="0" value="{{ old('shipping_cost', $po->shipping_cost ?? 0) }}">
                                </div>
                            </div>

                            <div class="d-flex justify-content-between pt-1">
                                <h4 class="font-weight-bold text-danger">Grand Total:</h4>
                                <h4 class="font-weight-bold text-danger" id="summary-grandtotal">Rp 0</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Submission Actions -->
            <div class="d-flex align-items-center justify-content-end mt-2 mb-3">
                <a href="{{ route('admin.purchase-orders.index') }}" class="btn btn-cancel-premium mr-1">Batal</a>
                <button type="submit" class="btn btn-save-premium"><i data-feather="save" class="mr-25"></i> Simpan Purchase Order</button>
            </div>
        </form>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL PILIH PRODUK (DATATABLE + CHECKBOX) -->
<!-- ============================================== -->
<div class="modal fade" id="productSelectModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title text-white font-weight-bold"><i data-feather="grid" class="mr-50"></i>Pilih Produk & Varian</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <p class="text-muted small">Pilih satu atau beberapa produk/varian di bawah ini menggunakan checkbox, kemudian tekan tombol **"Tambahkan Produk Pilihan"**.</p>
                
                <div class="table-responsive">
                    <table class="table table-hover border" id="modal-products-table" style="width: 100%;">
                        <thead class="thead-light">
                            <tr>
                                <th style="width: 40px;" class="text-center">
                                    <div class="custom-control custom-checkbox">
                                        <input type="checkbox" class="custom-control-input" id="check-all-modal">
                                        <label class="custom-control-label" for="check-all-modal"></label>
                                    </div>
                                </th>
                                <th>Produk / Varian</th>
                                <th>SKU</th>
                                <th style="width: 120px;">Harga Beli (Rp)</th>
                                <th style="width: 100px;">Stok Aktif</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($products as $product)
                                <tr data-id="{{ $product->id }}" 
                                    data-name="{{ $product->parent ? $product->parent->name . ' - ' . $product->name : $product->name }}"
                                    data-sku="{{ $product->sku ?: '-' }}"
                                    data-price="{{ $product->price ?? 0 }}">
                                    <td class="text-center">
                                        <div class="custom-control custom-checkbox">
                                            <input type="checkbox" class="custom-control-input product-check" id="check-{{ $product->id }}" value="{{ $product->id }}">
                                            <label class="custom-control-label" for="check-{{ $product->id }}"></label>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="font-weight-bold text-dark">{{ $product->parent ? $product->parent->name : $product->name }}</span>
                                        @if($product->parent)
                                            <span class="badge badge-light-info ml-25">{{ $product->name }}</span>
                                        @endif
                                    </td>
                                    <td><code>{{ $product->sku ?: '-' }}</code></td>
                                    <td class="font-weight-bold">Rp {{ number_format($product->price ?? 0, 0, ',', '.') }}</td>
                                    <td>
                                        @if(($product->stock ?? 0) <= 0)
                                            <span class="badge badge-light-danger">Habis</span>
                                        @else
                                            <span class="badge badge-light-success">{{ $product->stock }} pcs</span>
                                        @endif
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">Tutup</button>
                <button type="button" class="btn btn-primary btn-sm font-weight-bold" id="btn-add-selected-products">
                    <i data-feather="check-circle" class="mr-25"></i> Tambahkan Produk Pilihan
                </button>
            </div>
        </div>
    </div>
</div>
@endsection

@push('css')
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/pickers/flatpickr/flatpickr.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/plugins/forms/pickers/form-flat-pickr.css') }}">
    
    <style>
        /* Premium Card Design */
        .premium-card {
            border-radius: 16px !important;
            border: none !important;
            box-shadow: 0 10px 30px rgba(115, 103, 240, 0.05) !important;
            overflow: hidden !important;
            background: #fff !important;
            margin-bottom: 24px !important;
        }
        .premium-card-header {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.78)) !important;
            padding: 20px 24px !important;
            border-bottom: none !important;
        }
        .header-icon-wrapper {
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        
        /* Section Headers inside form */
        .form-section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #4b4b4b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            border-bottom: 2px solid #f3f2f7;
            padding-bottom: 8px;
        }

        /* Form Premium Inputs */
        .form-group-premium {
            margin-bottom: 15px !important;
        }
        .form-label-premium {
            font-size: 0.82rem;
            font-weight: 600;
            color: #5e5873;
            margin-bottom: 6px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .input-wrapper-premium {
            position: relative;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
        }
        .input-icon {
            position: absolute;
            left: 15px;
            color: #b9b9c3;
            width: 17px;
            height: 17px;
            transition: all 0.3s ease;
            pointer-events: none;
            z-index: 10;
        }
        .form-control-premium {
            width: 100%;
            height: 46px;
            padding: 10px 16px 10px 45px;
            font-size: 0.95rem;
            color: #6e6b7b;
            background-color: #fff;
            border: 1.5px solid #d8d6de;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .form-control-premium:focus {
            border-color: #7367f0 !important;
            box-shadow: 0 4px 15px rgba(115, 103, 240, 0.15) !important;
            outline: none;
        }
        .form-control-premium:focus + .input-icon,
        .input-wrapper-premium:focus-within .input-icon {
            color: #7367f0;
        }

        .textarea-premium {
            width: 100%;
            padding: 12px 16px;
            font-size: 0.95rem;
            color: #6e6b7b;
            background-color: #fff;
            border: 1.5px solid #d8d6de;
            border-radius: 8px;
            transition: all 0.3s ease;
            resize: vertical;
        }
        .textarea-premium:focus {
            border-color: #7367f0 !important;
            box-shadow: 0 4px 15px rgba(115, 103, 240, 0.15) !important;
            outline: none;
        }

        /* Error Messages */
        .error-msg {
            color: #ea5455;
            font-size: 0.8rem;
            font-weight: 500;
        }

        /* Premium Buttons */
        .btn-save-premium {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.85)) !important;
            color: #fff !important;
            font-weight: 600;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(115, 103, 240, 0.2);
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .btn-save-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(115, 103, 240, 0.3);
        }
        .btn-save-premium:active {
            transform: translateY(0);
        }
        .btn-cancel-premium {
            background-color: #f3f2f7 !important;
            color: #6e6b7b !important;
            font-weight: 600;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-block;
        }
        .btn-cancel-premium:hover {
            background-color: #e4e2eb !important;
            color: #5e5873 !important;
        }
    </style>
@endpush

@push('script_vendor')
    <script src="{{ asset('template/app-assets/vendors/js/pickers/flatpickr/flatpickr.min.js') }}"></script>
@endpush

@push('script')
    <script>
        $(document).ready(function() {
            // 1. Initialize Flatpickr Dates
            if ($('.datetime-picker').length) {
                $('.datetime-picker').flatpickr({
                    enableTime: false,
                    dateFormat: "Y-m-d",
                });
            }

            // 2. Initialize Datatable for Product Selection Modal
            var productsTable = $('#modal-products-table').DataTable({
                "columnDefs": [
                    { "orderable": false, "targets": 0 }
                ],
                "pageLength": 10,
                "dom": '<"d-flex justify-content-between align-items-center mx-0 row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"d-flex justify-content-between mx-0 row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                "language": {
                    "search": "Cari Produk:",
                    "lengthMenu": "Tampilkan _MENU_ data",
                    "info": "Menampilkan _START_ sampai _END_ dari _TOTAL_ produk",
                    "paginate": {
                        "next": "Berikutnya",
                        "previous": "Sebelumnya"
                    }
                }
            });

            // 3. Modal Check All handler
            $('#check-all-modal').on('change', function() {
                var checked = $(this).prop('checked');
                // Check all boxes on the current visible page in DataTable
                productsTable.rows({ page: 'current' }).every(function() {
                    var rowNode = this.node();
                    $(rowNode).find('.product-check').prop('checked', checked);
                });
            });

            // Index tracker for dynamically added rows
            var itemIndex = {{ $index }};

            // 4. Add Selected Products from Modal to Table
            $('#btn-add-selected-products').on('click', function() {
                var selectedRows = [];
                
                // Scan all rows in Datatable for checked inputs (handles non-visible pages too)
                productsTable.rows().every(function() {
                    var rowNode = this.node();
                    var checkbox = $(rowNode).find('.product-check');
                    if (checkbox.prop('checked')) {
                        selectedRows.push({
                            id: checkbox.val(),
                            name: $(rowNode).data('name'),
                            sku: $(rowNode).data('sku'),
                            price: $(rowNode).data('price')
                        });
                        // Uncheck checkbox for future selections
                        checkbox.prop('checked', false);
                    }
                });

                if (selectedRows.length === 0) {
                    toastr.warning('Silakan pilih setidaknya satu produk untuk ditambahkan.');
                    return;
                }

                // Add rows to the items table
                selectedRows.forEach(function(prod) {
                    // Check if product is already added in the table
                    if ($('#po-items-body tr[data-product-id="' + prod.id + '"]').length > 0) {
                        return; // Skip duplicates
                    }

                    itemIndex++;
                    var newRow = `
                        <tr data-product-id="${prod.id}">
                            <td class="text-center row-number">${itemIndex}</td>
                            <td>
                                <span class="font-weight-bold text-primary">${prod.name}</span><br>
                                <small class="text-muted">SKU: ${prod.sku}</small>
                                <input type="hidden" name="items[${itemIndex}][product_id]" value="${prod.id}">
                            </td>
                            <td>
                                <input type="number" name="items[${itemIndex}][quantity]" class="form-control item-qty" min="1" value="1" required>
                            </td>
                            <td>
                                <input type="number" step="any" name="items[${itemIndex}][unit_cost]" class="form-control item-cost" min="0" value="${prod.price}" required>
                            </td>
                            <td class="font-weight-bold text-dark item-total">
                                Rp ${parseInt(prod.price).toLocaleString('id-ID')}
                            </td>
                            <td class="text-center">
                                <button type="button" class="btn btn-flat-danger btn-sm btn-remove-item"><i data-feather="trash-2"></i></button>
                            </td>
                        </tr>
                    `;

                    $('#po-items-body').append(newRow);
                });

                // Reset modal select all checkbox
                $('#check-all-modal').prop('checked', false);
                
                // Hide modal
                $('#productSelectModal').modal('hide');
                
                // Re-init feather icons on newly added elements
                if (feather) feather.replace();

                // Recalculate totals
                calculateTotals();
            });

            // 5. Remove Item Row handler
            $(document).on('click', '.btn-remove-item', function() {
                $(this).closest('tr').remove();
                calculateTotals();
            });

            // 6. Dynamic Cost Calculations on input change
            $(document).on('input', '.item-qty, .item-cost', function() {
                var row = $(this).closest('tr');
                var qty = parseFloat(row.find('.item-qty').val()) || 0;
                var cost = parseFloat(row.find('.item-cost').val()) || 0;
                var total = qty * cost;

                row.find('.item-total').text('Rp ' + total.toLocaleString('id-ID'));
                calculateTotals();
            });

            $('#po-tax, #po-shipping-cost').on('input', function() {
                calculateTotals();
            });

            // Calculate overall Subtotal, Tax, Shipping and Grand Total
            function calculateTotals() {
                var rows = $('#po-items-body tr[data-product-id]');
                var subtotal = 0;

                if (rows.length === 0) {
                    $('#empty-row').show();
                } else {
                    $('#empty-row').hide();
                    
                    // Reset row numbering
                    rows.each(function(idx) {
                        $(this).find('.row-number').text(idx + 1);
                    });
                }

                rows.each(function() {
                    var qty = parseFloat($(this).find('.item-qty').val()) || 0;
                    var cost = parseFloat($(this).find('.item-cost').val()) || 0;
                    subtotal += qty * cost;
                });

                var tax = parseFloat($('#po-tax').val()) || 0;
                var shipping = parseFloat($('#po-shipping-cost').val()) || 0;
                var grandTotal = subtotal + tax + shipping;

                $('#summary-subtotal').text('Rp ' + subtotal.toLocaleString('id-ID'));
                $('#summary-grandtotal').text('Rp ' + grandTotal.toLocaleString('id-ID'));
            }

            // Initial totals calculation on page load
            calculateTotals();
        });
    </script>
@endpush
