@extends('layouts.app')
@section('title', $title)
@section('content')
    <div class="row">
        <!-- Header Info -->
        <div class="col-12 mb-2">
            <div class="card premium-card mb-0">
                <div class="card-header premium-card-header d-flex flex-wrap justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper">
                            <i data-feather="shopping-bag"></i>
                        </div>
                        <div class="header-text-wrapper ml-1">
                            <h4 class="card-title font-weight-bold text-white mb-0">
                                {{ $order->exists ? 'Pesanan ' . $order->order_number : 'Buat Pesanan Baru' }}
                            </h4>
                            @if($order->exists)
                                <p class="text-white-50 small mb-0">Dibuat pada: {{ $order->created_at->format('d M Y H:i') }}</p>
                            @else
                                <p class="text-white-50 small mb-0">Formulir pendaftaran order manual administrator</p>
                            @endif
                        </div>
                    </div>
                    
                    <div class="d-flex align-items-center mt-1 mt-sm-0">
                        @if($order->exists)
                            @php
                                $statusObj = $order->statusRelation ?: \App\Models\OrderStatus::find($order->status_id);
                                $slug = $statusObj?->slug ?? 'pending';
                                $name = $statusObj?->name ?? 'Pending';
                                $badgeClass = 'secondary';
                                if ($slug === 'processing') $badgeClass = 'info';
                                elseif ($slug === 'shipping') $badgeClass = 'warning';
                                elseif ($slug === 'completed') $badgeClass = 'success';
                                elseif (in_array($slug, ['cancelled', 'failed'])) $badgeClass = 'danger';
                            @endphp
                            <span class="badge badge-pill badge-{{ $badgeClass }} mr-2 py-50 px-1 font-weight-bold text-white shadow-sm" style="font-size: 0.85rem; border: 1.5px solid rgba(255,255,255,0.5);">
                                {{ $name }}
                            </span>
                        @endif
                        
                        @if($order->exists)
                            <a href="{{ url('adminv1/api/orders/' . $order->id . '/print-invoice') }}" target="_blank" class="btn btn-sm btn-outline-light mr-50 font-weight-bold">
                                <i data-feather="file-text" class="mr-25" style="width: 14px; height: 14px;"></i> Cetak Invoice
                            </a>
                            <a href="{{ url('adminv1/api/orders/' . $order->id . '/print-resi') }}" target="_blank" class="btn btn-sm btn-outline-light mr-50 font-weight-bold">
                                <i data-feather="printer" class="mr-25" style="width: 14px; height: 14px;"></i> Cetak Resi
                            </a>
                        @endif
                        
                        <a href="{{ url('admin/orders') }}" class="btn btn-sm btn-outline-light">
                            <i data-feather="arrow-left" class="mr-25"></i> Kembali
                        </a>
                    </div>
                </div>
            </div>
        </div>

        @if($order->exists)
            <!-- EDIT / DETAILS MODE (Tabbed) -->
            <!-- Left Sidebar: Quick Actions & Status Edit -->
            <div class="col-lg-4 col-md-5">
                <div class="card premium-card">
                    <div class="card-body">
                        <h5 class="font-weight-bold mb-1"><i data-feather="settings" class="text-primary mr-50"></i> Kelola Status</h5>
                        <form id="form-update-status">
                            @csrf
                            <div class="form-group-premium mb-1">
                                <label class="form-label-premium" for="order-status-select">Status Pesanan</label>
                                <select name="status_id" id="order-status-select" class="form-control-premium" required>
                                    @foreach($statuses as $status)
                                        <option value="{{ $status->id }}" {{ $order->status_id == $status->id ? 'selected' : '' }}>
                                            {{ $status->name }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            
                            <div class="form-group-premium mb-2">
                                <label class="form-label-premium" for="order-status-desc">Catatan Perubahan Status (Opsional)</label>
                                <textarea name="description" id="order-status-desc" class="textarea-premium" rows="2" placeholder="Masukan catatan alasan perubahan status..."></textarea>
                            </div>
                            
                            <button type="submit" class="btn btn-block btn-save-premium" id="btn-submit-status">
                                Perbarui Status
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Print Documents Card -->
                <div class="card premium-card">
                    <div class="card-body">
                        <h5 class="font-weight-bold mb-1"><i data-feather="printer" class="text-primary mr-50"></i> Cetak Dokumen</h5>
                        <div class="row">
                            <div class="col-6">
                                <a href="{{ url('adminv1/api/orders/' . $order->id . '/print-invoice') }}" target="_blank" class="btn btn-block btn-outline-primary font-weight-bold" style="padding: 10px 5px; border-radius: 8px; font-size: 11px;">
                                    <i data-feather="file-text" class="mr-25" style="width: 14px; height: 14px;"></i> Invoice
                                </a>
                            </div>
                            <div class="col-6">
                                <a href="{{ url('adminv1/api/orders/' . $order->id . '/print-resi') }}" target="_blank" class="btn btn-block btn-outline-primary font-weight-bold" style="padding: 10px 5px; border-radius: 8px; font-size: 11px;">
                                    <i data-feather="printer" class="mr-25" style="width: 14px; height: 14px;"></i> Label Resi
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Card -->
                <div class="card premium-card">
                    <div class="card-body">
                        <h5 class="font-weight-bold mb-1"><i data-feather="credit-card" class="text-primary mr-50"></i> Ringkasan Biaya</h5>
                        <div class="d-flex justify-content-between mb-50">
                            <span class="text-muted">Subtotal:</span>
                            <span class="font-weight-bold">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-50">
                            <span class="text-muted">Potongan Voucher:</span>
                            <span class="text-danger font-weight-bold">- Rp {{ number_format($order->discount, 0, ',', '.') }}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <span class="text-muted">Ongkos Kirim:</span>
                            <span class="font-weight-bold">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-dark font-weight-bold">Grand Total:</span>
                            <h4 class="text-primary font-weight-bold mb-0">Rp {{ number_format($order->grand_total, 0, ',', '.') }}</h4>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Panel: Tab Content -->
            <div class="col-lg-8 col-md-7">
                <div class="card premium-tabs-card">
                    <div class="card-body p-0">
                        <ul class="nav nav-pills premium-nav-pills" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="detail-tab" data-toggle="tab" href="#detail-pane" role="tab" aria-selected="true">
                                    <i data-feather="info" class="mr-25"></i> Detail & Logs
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="items-tab" data-toggle="tab" href="#items-pane" role="tab" aria-selected="false">
                                    <i data-feather="list" class="mr-25"></i> Produk ({{ $order->items->count() }})
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="payment-tab" data-toggle="tab" href="#payment-pane" role="tab" aria-selected="false">
                                    <i data-feather="dollar-sign" class="mr-25"></i> Pembayaran
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="shipment-tab" data-toggle="tab" href="#shipment-pane" role="tab" aria-selected="false">
                                    <i data-feather="truck" class="mr-25"></i> Pengiriman
                                </a>
                            </li>
                        </ul>

                        <div class="tab-content p-3">
                            <!-- Detail Pane -->
                            <div class="tab-pane active" id="detail-pane" role="tabpanel">
                                @include('order-module::partials.detail')
                            </div>

                            <!-- Items Pane -->
                            <div class="tab-pane" id="items-pane" role="tabpanel">
                                @include('order-module::partials.items')
                            </div>

                            <!-- Payment Pane -->
                            <div class="tab-pane" id="payment-pane" role="tabpanel">
                                @include('order-module::partials.payment')
                            </div>

                            <!-- Shipment Pane -->
                            <div class="tab-pane" id="shipment-pane" role="tabpanel">
                                @include('order-module::partials.shipment')
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @else
            <!-- CREATE NEW ORDER MODE -->
            <div class="col-12">
                @if ($errors->any())
                    <div class="alert alert-danger py-1 mb-2">
                        <ul class="mb-0" style="padding-left: 15px;">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
                <form action="{{ route('admin.orders.create') }}" method="POST" id="order-create-form">
                    @csrf
                    @method('PUT')
                    
                    <!-- 1. Customer Info & Destination Shipping & Courier -->
                    <div class="card premium-card">
                        <div class="card-body">
                            <div class="row">
                                <!-- Customer General Info -->
                                <div class="col-md-6 border-right">
                                    <div class="form-section-title">
                                        <i data-feather="user" class="text-primary mr-50"></i> Informasi Pelanggan
                                    </div>
                                    <div class="form-group-premium">
                                        <label class="form-label-premium" for="order_customer_id">Pilih Customer <span class="text-danger">*</span></label>
                                        <select name="customer_id" id="order_customer_id" class="form-control-premium" required>
                                            <option value="">Pilih Customer...</option>
                                            @foreach($customers as $cust)
                                                <option value="{{ $cust->id }}" {{ old('customer_id') == $cust->id ? 'selected' : '' }}>
                                                    {{ $cust->name }} ({{ $cust->phone ?: $cust->email }})
                                                </option>
                                            @endforeach
                                        </select>
                                        @error('customer_id') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                    </div>

                                    <div class="form-group-premium">
                                        <label class="form-label-premium" for="order_status_id">Status Awal Pesanan <span class="text-danger">*</span></label>
                                        <select name="status_id" id="order_status_id" class="form-control-premium" required>
                                            @foreach($statuses as $stat)
                                                <option value="{{ $stat->id }}" {{ (old('status_id') ?: 1) == $stat->id ? 'selected' : '' }}>
                                                    {{ $stat->name }}
                                                </option>
                                            @endforeach
                                        </select>
                                        @error('status_id') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                    </div>

                                    <div class="form-group-premium mb-0">
                                        <label class="form-label-premium" for="order_notes">Catatan Pembeli</label>
                                        <textarea name="notes" id="order_notes" class="textarea-premium" rows="3" placeholder="Masukkan catatan tambahan...">{{ old('notes') }}</textarea>
                                        @error('notes') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                    </div>
                                </div>

                                <!-- Shipping Address & Courier Selector -->
                                <div class="col-md-6">
                                    <div class="form-section-title">
                                        <i data-feather="truck" class="text-primary mr-50"></i> Tujuan Pengiriman & Kurir
                                    </div>
                                    
                                    <!-- Address Selector populated via AJAX -->
                                    <div class="form-group-premium">
                                        <label class="form-label-premium" for="customer_address_selector">Pilih Alamat Customer</label>
                                        <select name="customer_address_id" id="customer_address_selector" class="form-control-premium" disabled>
                                            <option value="">Silakan pilih customer terlebih dahulu...</option>
                                        </select>
                                    </div>

                                    <div class="row">
                                        <div class="col-sm-6 form-group-premium">
                                            <label class="form-label-premium" for="dest_name">Nama Penerima <span class="text-danger">*</span></label>
                                            <input type="text" name="destination_contact_name" id="dest_name" class="form-control-premium" required value="{{ old('destination_contact_name') }}" placeholder="Nama penerima paket">
                                        </div>
                                        <div class="col-sm-6 form-group-premium">
                                            <label class="form-label-premium" for="dest_phone">No. Telepon Penerima <span class="text-danger">*</span></label>
                                            <input type="text" name="destination_contact_phone" id="dest_phone" class="form-control-premium" required value="{{ old('destination_contact_phone') }}" placeholder="No. HP penerima">
                                        </div>
                                    </div>

                                    <div class="form-group-premium">
                                        <label class="form-label-premium" for="dest_address">Alamat Lengkap Pengiriman <span class="text-danger">*</span></label>
                                        <input type="text" name="destination_address" id="dest_address" class="form-control-premium" required value="{{ old('destination_address') }}" placeholder="Alamat lengkap tujuan">
                                    </div>

                                    <div class="row">
                                        <div class="col-sm-4 form-group-premium">
                                            <label class="form-label-premium" for="dest_postal">Kode Pos <span class="text-danger">*</span></label>
                                            <input type="text" name="destination_postal_code" id="dest_postal" class="form-control-premium" required value="{{ old('destination_postal_code') }}" placeholder="Kode Pos">
                                        </div>
                                        <div class="col-sm-8 d-flex align-items-end mb-1">
                                            <button type="button" class="btn btn-outline-primary" id="btn-cek-ongkir" style="height: 40px; width: 100%;">
                                                <i data-feather="refresh-cw" class="mr-25"></i> Hitung Ongkir Biteship
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Biteship rates selection -->
                                    <div class="form-group-premium d-none" id="biteship-rates-wrapper">
                                        <label class="form-label-premium" for="biteship_rate_select">Pilih Kurir & Tarif Pengiriman <span class="text-danger">*</span></label>
                                        <select id="biteship_rate_select" class="form-control-premium">
                                            <option value="">-- Pilih Layanan Kurir --</option>
                                        </select>
                                    </div>

                                    <!-- Hidden inputs for final selected courier values -->
                                    <input type="hidden" name="courier_company" id="hidden_courier_company" value="{{ old('courier_company') ?: 'jne' }}">
                                    <input type="hidden" name="courier_service" id="hidden_courier_service" value="{{ old('courier_service') ?: 'REG' }}">

                                    <!-- Hidden coordinates -->
                                    <input type="hidden" name="destination_latitude" id="dest_lat" value="{{ old('destination_latitude') }}">
                                    <input type="hidden" name="destination_longitude" id="dest_lng" value="{{ old('destination_longitude') }}">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Product Selector & Table -->
                    <div class="card premium-card">
                        <div class="card-body">
                            <div class="form-section-title">
                                <i data-feather="list" class="text-primary mr-50"></i> Tambah Produk Belanja
                            </div>
                            
                            <div class="row mb-2">
                                <div class="col-md-6 form-group-premium">
                                    <label class="form-label-premium" for="product_selector">Pilih Produk</label>
                                    <select id="product_selector" class="form-control-premium">
                                        <option value="">Pilih Produk...</option>
                                        @foreach($products as $prod)
                                            <option value="{{ $prod->id }}" data-name="{{ $prod->name }}" data-price="{{ $prod->price }}" data-sku="{{ $prod->sku }}">
                                                {{ $prod->name }} - Rp {{ number_format($prod->price, 0, ',', '.') }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-3 form-group-premium">
                                    <label class="form-label-premium" for="product_qty">Jumlah (Qty)</label>
                                    <input type="number" id="product_qty" value="1" min="1" class="form-control-premium">
                                </div>
                                <div class="col-md-3 d-flex align-items-end mb-1">
                                    <button type="button" class="btn btn-primary" id="btn-add-item-row" style="height: 40px; width: 100%;">
                                        <i data-feather="plus" class="mr-25"></i> Tambahkan
                                    </button>
                                </div>
                            </div>

                            <div class="table-responsive">
                                <table class="table table-bordered table-striped" id="tbl-order-items-creation">
                                    <thead>
                                        <tr>
                                            <th style="width: 45%;">Nama Produk</th>
                                            <th>SKU</th>
                                            <th class="text-right">Harga Satuan</th>
                                            <th class="text-center" style="width: 100px;">Qty</th>
                                            <th class="text-right" style="width: 160px;">Total</th>
                                            <th class="text-center" style="width: 60px;">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tbody-order-items">
                                        @if(old('items') && is_array(old('items')))
                                            @foreach(old('items') as $idx => $oldItem)
                                                @php
                                                    $product = $products->firstWhere('id', $oldItem['product_id']);
                                                @endphp
                                                @if($product)
                                                    @php
                                                        $unitPrice = $product->price ?: 0;
                                                        $qty = intval($oldItem['quantity'] ?? 1);
                                                        $total = $unitPrice * $qty;
                                                    @endphp
                                                    <tr class="order-item-tr" id="item-row-{{ $idx }}">
                                                        <td>
                                                            <strong class="text-dark">{{ $product->name }}</strong>
                                                            <input type="hidden" name="items[{{ $idx }}][product_id]" value="{{ $product->id }}">
                                                        </td>
                                                        <td>
                                                            <code class="text-primary">{{ $product->sku ?: '-' }}</code>
                                                        </td>
                                                        <td class="text-right">
                                                            Rp {{ number_format($unitPrice, 0, ',', '.') }}
                                                        </td>
                                                        <td class="text-center">
                                                            <input type="number" name="items[{{ $idx }}][quantity]" value="{{ $qty }}" min="1" class="form-control text-center mx-auto item-row-qty" style="width: 75px; height: 32px;" data-unit-price="{{ $unitPrice }}">
                                                        </td>
                                                        <td class="text-right font-weight-bold text-dark item-row-total" data-raw-value="{{ $total }}">
                                                            Rp {{ number_format($total, 0, ',', '.') }}
                                                        </td>
                                                        <td class="text-center">
                                                            <button type="button" class="btn btn-xs btn-outline-danger btn-delete-row" data-row-id="{{ $idx }}">
                                                                <i data-feather="trash"></i> Hapus
                                                            </button>
                                                        </td>
                                                    </tr>
                                                @endif
                                            @endforeach
                                        @else
                                            <tr id="tr-empty-items">
                                                <td colspan="6" class="text-center text-muted py-2">
                                                    Belum ada produk yang ditambahkan ke order.
                                                </td>
                                            </tr>
                                        @endif
                                    </tbody>
                                </table>
                                @error('items') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                            </div>
                        </div>
                    </div>

                    <!-- 3. Voucher Redeem & Costing summary (Below the items table) -->
                    <div class="row">
                        <!-- Voucher Card -->
                        <div class="col-lg-6">
                            <div class="card premium-card" style="height: calc(100% - 20px);">
                                <div class="card-body">
                                    <div class="form-section-title">
                                        <i data-feather="gift" class="text-primary mr-50"></i> Redeem Voucher Belanja
                                    </div>
                                    <div class="form-group-premium">
                                        <label class="form-label-premium" for="voucher_code_input">Kode Voucher</label>
                                        <div class="input-group">
                                            <input type="text" id="voucher_code_input" class="form-control-premium" style="border-top-right-radius: 0; border-bottom-right-radius: 0;" value="{{ old('voucher_code') }}" placeholder="Contoh: FREEONGKIR">
                                            <div class="input-group-append">
                                                <button class="btn btn-outline-primary" type="button" id="btn-apply-voucher" style="border-top-left-radius: 0; border-bottom-left-radius: 0; height: 40px;">
                                                    Terapkan
                                                </button>
                                            </div>
                                        </div>
                                        <div id="voucher-status-feedback" class="mt-50 small">
                                            @if(old('voucher_code'))
                                                <span class="text-success font-weight-bold">✓ Voucher {{ old('voucher_code') }} diterapkan (Potongan Rp {{ number_format(old('discount'), 0, ',', '.') }})</span>
                                            @endif
                                        </div>
                                    </div>

                                    <!-- Hidden Fields for applied voucher -->
                                    <input type="hidden" name="voucher_id" id="hidden_voucher_id" value="{{ old('voucher_id') }}">
                                    <input type="hidden" name="voucher_code" id="hidden_voucher_code" value="{{ old('voucher_code') }}">
                                </div>
                            </div>
                        </div>

                        <!-- Costing Card -->
                        <div class="col-lg-6">
                            <div class="card premium-card" style="height: calc(100% - 20px);">
                                <div class="card-body">
                                    <div class="form-section-title">
                                        <i data-feather="dollar-sign" class="text-primary mr-50"></i> Perincian Nominal Pembayaran
                                    </div>
                                    
                                    <div class="form-group-premium mb-1 row align-items-center">
                                        <label class="col-sm-5 form-label-premium mb-0" for="order_subtotal">Subtotal Produk</label>
                                        <div class="col-sm-7">
                                            <input type="number" name="subtotal" id="order_subtotal" value="{{ old('subtotal') ?: 0 }}" class="form-control-premium" readonly min="0" style="background-color: #f8f8f8; text-align: right;">
                                        </div>
                                    </div>

                                    <div class="form-group-premium mb-1 row align-items-center">
                                        <label class="col-sm-5 form-label-premium mb-0" for="order_discount">Potongan Diskon</label>
                                        <div class="col-sm-7">
                                            <input type="number" name="discount" id="order_discount" value="{{ old('discount') ?: 0 }}" class="form-control-premium" readonly min="0" style="background-color: #f8f8f8; text-align: right; color: #ea5455; font-weight: 700;">
                                        </div>
                                    </div>

                                    <div class="form-group-premium mb-1 row align-items-center">
                                        <label class="col-sm-5 form-label-premium mb-0" for="order_shipping_cost">Ongkos Kirim (Rp)</label>
                                        <div class="col-sm-7">
                                            <input type="number" name="shipping_cost" id="order_shipping_cost" value="{{ old('shipping_cost') ?: 0 }}" class="form-control-premium price-calc-input" min="0" style="text-align: right;" readonly style="background-color: #f8f8f8;">
                                        </div>
                                    </div>

                                    <hr>

                                    <div class="form-group-premium mb-0 row align-items-center">
                                        <label class="col-sm-5 font-weight-bold text-dark mb-0" style="font-size: 1rem;">Grand Total</label>
                                        <div class="col-sm-7">
                                            <input type="number" name="grand_total" id="order_grand_total" value="{{ old('grand_total') ?: 0 }}" class="form-control-premium" required min="0" readonly style="font-weight: 700; color: #7367f0; text-align: right; font-size: 1.1rem; border-color: #7367f0; background: rgba(115,103,240,0.03);">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Submit Actions -->
                    <div class="card premium-card mt-1">
                        <div class="card-body py-1 d-flex align-items-center justify-content-end">
                            <a href="{{ url('admin/orders') }}" class="btn btn-cancel-premium mr-1">Batal</a>
                            <button type="submit" class="btn btn-save-premium">Buat Order & Simpan</button>
                        </div>
                    </div>
                </form>
            </div>
        @endif
    </div>
@endsection

@push('css')
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/extensions/toastr.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/plugins/extensions/ext-component-toastr.css') }}">
    <style>
        /* Shared Styles matching design aesthetics */
        .premium-card {
            border-radius: 16px !important;
            border: none !important;
            box-shadow: 0 10px 30px rgba(115, 103, 240, 0.05) !important;
            overflow: hidden !important;
            background: #fff !important;
            margin-bottom: 20px !important;
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
        
        .form-label-premium {
            font-size: 0.8rem;
            font-weight: 700;
            color: #5e5873;
            margin-bottom: 6px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .form-control-premium {
            width: 100%;
            height: 40px;
            padding: 8px 12px;
            font-size: 0.9rem;
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
        
        .textarea-premium {
            width: 100%;
            padding: 10px 12px;
            font-size: 0.9rem;
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

        .btn-save-premium {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.85)) !important;
            color: #fff !important;
            font-weight: 600;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(115, 103, 240, 0.2);
            transition: all 0.2s ease;
        }
        .btn-save-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(115, 103, 240, 0.3);
        }
        .btn-cancel-premium {
            background-color: #f3f2f7 !important;
            color: #6e6b7b !important;
            font-weight: 600;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            transition: all 0.2s ease;
            display: inline-block;
        }
        .btn-cancel-premium:hover {
            background-color: #e4e2eb !important;
            color: #5e5873 !important;
        }

        .premium-tabs-card {
            border-radius: 16px !important;
            border: none !important;
            box-shadow: 0 10px 30px rgba(115, 103, 240, 0.05) !important;
            background: #fff !important;
            overflow: hidden;
        }
        .premium-nav-pills {
            border-bottom: 2px solid #f3f2f7;
            padding: 12px 16px 0;
            background: #fafafc;
        }
        .premium-nav-pills .nav-link {
            border-radius: 8px 8px 0 0 !important;
            color: #6e6b7b !important;
            font-weight: 600 !important;
            padding: 12px 20px !important;
            border: none !important;
            background: transparent !important;
            position: relative;
            transition: all 0.2s ease;
        }
        .premium-nav-pills .nav-link.active {
            color: #7367f0 !important;
            background: transparent !important;
        }
        .premium-nav-pills .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 3px;
            background: #7367f0;
            border-radius: 3px 3px 0 0;
        }

        /* Timeline History Styles */
        .timeline {
            position: relative;
            padding-left: 30px;
            margin-bottom: 0;
            list-style: none;
        }
        .timeline:before {
            content: '';
            position: absolute;
            top: 5px;
            bottom: 5px;
            left: 9px;
            width: 2px;
            background: #ebe9f1;
        }
        .timeline-item {
            position: relative;
            margin-bottom: 20px;
        }
        .timeline-item:last-child {
            margin-bottom: 0;
        }
        .timeline-badge {
            position: absolute;
            left: -30px;
            top: 2px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #7367f0;
            border: 4px solid #fff;
            box-shadow: 0 0 0 2px #ebe9f1;
        }
        .timeline-badge.success { background: #28c76f; box-shadow: 0 0 0 2px #d2f4ea; }
        .timeline-badge.warning { background: #ff9f43; box-shadow: 0 0 0 2px #ffe8d0; }
        .timeline-badge.danger { background: #ea5455; box-shadow: 0 0 0 2px #fce5e6; }
        .timeline-badge.info { background: #00cfe8; box-shadow: 0 0 0 2px #d6f7fc; }
        
        .timeline-date {
            font-size: 0.75rem;
            color: #b9b9c3;
            font-weight: 600;
        }
        .timeline-title {
            font-size: 0.9rem;
            font-weight: 700;
            color: #2b2b2b;
            margin-bottom: 2px;
        }
        .timeline-text {
            font-size: 0.85rem;
            color: #6e6b7b;
            margin-bottom: 0;
        }
        .error-msg {
            color: #ea5455;
            font-size: 0.8rem;
            font-weight: 500;
        }
        .input-group {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            align-items: stretch;
            width: 100%;
        }
        .input-group .form-control-premium {
            flex: 1 1 auto;
            width: 1%;
            min-width: 0;
            margin-bottom: 0;
        }
        .input-group-append {
            display: flex;
            margin-left: -1px;
        }
    </style>
@endpush

@push('script')
<script src="{{ asset('template/app-assets/vendors/js/extensions/toastr.min.js') }}"></script>
<script>
    $(document).ready(function() {
        var itemIndex = {{ old('items') ? count(old('items')) : 0 }};
        var appliedVoucherCode = "{{ old('voucher_code') }}";
        var oldAddressId = "{{ old('customer_address_id') }}";

        // Dynamic Loading of Customer Address Lists
        $('#order_customer_id').change(function() {
            var customerId = $(this).val();
            var selector = $('#customer_address_selector');

            if (!customerId) {
                selector.prop('disabled', true).html('<option value="">Silakan pilih customer terlebih dahulu...</option>');
                clearShippingFields();
                return;
            }

            selector.prop('disabled', true).html('<option value="">Sedang memuat alamat...</option>');

            $.ajax({
                url: `/admin/customers/${customerId}/addresses`,
                method: 'GET',
                success: function(res) {
                    selector.prop('disabled', false).html('<option value="">-- Pilih Alamat Pengiriman --</option>');
                    
                    if (res.success && res.addresses && res.addresses.length > 0) {
                        res.addresses.forEach(function(addr) {
                            var isSelected = (oldAddressId == addr.id) ? 'selected' : '';
                            var isPrimaryBadge = addr.is_primary ? ' [Utama]' : '';
                            selector.append(`
                                <option value="${addr.id}" ${isSelected}
                                    data-contact-name="${addr.name}" 
                                    data-contact-phone="${addr.phone}" 
                                    data-address="${addr.address}" 
                                    data-postal="${addr.postal_code || ''}" 
                                    data-lat="${addr.latitude || ''}" 
                                    data-lng="${addr.longitude || ''}">
                                    ${addr.name} - ${addr.address.substring(0, 45)}...${isPrimaryBadge}
                                </option>
                            `);
                        });
                        
                        // If there is an oldAddressId selected but it hasn't filled fields, trigger details fill
                        if (oldAddressId) {
                            var selectedOption = selector.find(':selected');
                            if (selectedOption.val() && !$('#dest_name').val()) {
                                selector.trigger('change');
                            }
                        }
                    } else {
                        selector.append('<option value="">Customer belum memiliki alamat terdaftar.</option>');
                    }
                },
                error: function() {
                    selector.prop('disabled', false).html('<option value="">Gagal memuat alamat. Isi manual di bawah.</option>');
                }
            });
        });

        // Trigger loading address if customer is already selected on page load (due to validation redirect)
        if ($('#order_customer_id').val()) {
            $('#order_customer_id').trigger('change');
        }

        // Triggered when an address is chosen
        $('#customer_address_selector').change(function() {
            var opt = $(this).find(':selected');
            if (opt.val()) {
                $('#dest_name').val(opt.data('contact-name'));
                $('#dest_phone').val(opt.data('contact-phone'));
                $('#dest_address').val(opt.data('address'));
                $('#dest_postal').val(opt.data('postal'));
                $('#dest_lat').val(opt.data('lat'));
                $('#dest_lng').val(opt.data('lng'));
            } else {
                clearShippingFields();
            }
        });

        function clearShippingFields() {
            $('#dest_name').val('');
            $('#dest_phone').val('');
            $('#dest_address').val('');
            $('#dest_postal').val('');
            $('#dest_lat').val('');
            $('#dest_lng').val('');
            $('#biteship-rates-wrapper').addClass('d-none');
            $('#biteship_rate_select').html('<option value="">-- Pilih Layanan Kurir --</option>');
        }

        // Live Shipping Rates Calculation from Biteship API
        $('#btn-cek-ongkir').click(function(e) {
            e.preventDefault();
            calculateBiteshipRates();
        });

        function calculateBiteshipRates() {
            var postal = $('#dest_postal').val().trim();
            var lat = $('#dest_lat').val().trim();
            var lng = $('#dest_lng').val().trim();

            if (!postal) {
                toastr.warning('Silakan isi Kode Pos terlebih dahulu.');
                return;
            }

            var items = [];
            $('.order-item-tr').each(function() {
                var rowId = $(this).attr('id').replace('item-row-', '');
                var productId = $(this).find('input[name="items[' + rowId + '][product_id]"]').val();
                var quantity = $(this).find('input[name="items[' + rowId + '][quantity]"]').val();
                if (productId && quantity) {
                    items.push({
                        product_id: productId,
                        quantity: quantity
                    });
                }
            });

            if (items.length === 0) {
                toastr.warning('Silakan tambahkan produk belanja terlebih dahulu.');
                return;
            }

            $('#btn-cek-ongkir').prop('disabled', true).html('<i class="spinner-border spinner-border-sm mr-25"></i> Menghitung...');

            $.ajax({
                url: "{{ route('admin.orders.shipping-rates') }}",
                method: "POST",
                data: {
                    _token: "{{ csrf_token() }}",
                    postal_code: postal,
                    latitude: lat,
                    longitude: lng,
                    items: items
                },
                success: function(res) {
                    $('#btn-cek-ongkir').prop('disabled', false).html('<i data-feather="refresh-cw" class="mr-25"></i> Hitung Ongkir Biteship');
                    feather.replace();

                    if (res.success && res.rates && res.rates.length > 0) {
                        $('#biteship-rates-wrapper').removeClass('d-none');
                        var select = $('#biteship_rate_select');
                        
                        var prevCourier = $('#hidden_courier_company').val();
                        var prevService = $('#hidden_courier_service').val();
                        
                        select.html('<option value="">-- Pilih Layanan Kurir --</option>');

                        res.rates.forEach(function(rate) {
                            var company = rate.company || rate.courier_code || '';
                            var service = rate.type || rate.courier_service_code || '';
                            var serviceName = rate.courier_service_name || service;
                            var price = parseFloat(rate.price) || 0;
                            var duration = rate.duration || '-';
                            
                            var isSelected = (prevCourier == company && prevService == service) ? 'selected' : '';
                            var text = `${company.toUpperCase()} - ${serviceName} (Rp ${price.toLocaleString('id-ID')}) - ETD: ${duration}`;
                            
                            select.append(`
                                <option value="${company}_${service}" ${isSelected}
                                    data-courier="${company}" 
                                    data-service="${service}" 
                                    data-cost="${price}">
                                    ${text}
                                </option>
                            `);
                        });
                        toastr.success('Tarif ongkir Biteship berhasil dimuat.');
                    } else {
                        toastr.error(res.message || 'Gagal memuat tarif kurir. Periksa koneksi API Biteship.');
                    }
                },
                error: function() {
                    $('#btn-cek-ongkir').prop('disabled', false).html('<i data-feather="refresh-cw" class="mr-25"></i> Hitung Ongkir Biteship');
                    feather.replace();
                    toastr.error('Terjadi kesalahan menghubungi server untuk hitung ongkir.');
                }
            });
        }



        // Triggered when Biteship service option is chosen
        $('#biteship_rate_select').change(function() {
            var opt = $(this).find(':selected');
            if (opt.val()) {
                var courier = opt.data('courier');
                var service = opt.data('service');
                var cost = parseFloat(opt.data('cost')) || 0;

                $('#hidden_courier_company').val(courier);
                $('#hidden_courier_service').val(service);
                $('#order_shipping_cost').val(cost);
            } else {
                $('#hidden_courier_company').val('jne');
                $('#hidden_courier_service').val('REG');
                $('#order_shipping_cost').val(0);
            }
            recalculateTotals();
        });

        function recalculateTotals() {
            var subtotal = 0;
            $('.item-row-total').each(function() {
                subtotal += parseFloat($(this).data('raw-value')) || 0;
            });

            $('#order_subtotal').val(subtotal);

            // Re-apply voucher discount via AJAX if voucher was applied, because subtotal changed
            if (appliedVoucherCode) {
                applyVoucherAJAX(appliedVoucherCode, subtotal, false);
            } else {
                var discount = parseFloat($('#order_discount').val()) || 0;
                var shipping = parseFloat($('#order_shipping_cost').val()) || 0;
                var grandTotal = subtotal - discount + shipping;
                if (grandTotal < 0) grandTotal = 0;

                $('#order_grand_total').val(grandTotal);
            }
        }

        // Add Product Row
        $('#btn-add-item-row').click(function(e) {
            e.preventDefault();
            var selector = $('#product_selector');
            var selectedOpt = selector.find(':selected');
            var prodId = selector.val();
            var qty = parseInt($('#product_qty').val()) || 1;

            if (!prodId) {
                toastr.warning('Silakan pilih produk terlebih dahulu.');
                return;
            }
            if (qty < 1) {
                toastr.warning('Jumlah kuantitas (Qty) minimal 1.');
                return;
            }

            var name = selectedOpt.data('name');
            var price = parseFloat(selectedOpt.data('price')) || 0;
            var sku = selectedOpt.data('sku') || '-';
            var total = price * qty;

            // Remove empty placeholder
            $('#tr-empty-items').remove();

            // Append row to table
            var rowHtml = `
                <tr class="order-item-tr" id="item-row-${itemIndex}">
                    <td>
                        <strong class="text-dark">${name}</strong>
                        <input type="hidden" name="items[${itemIndex}][product_id]" value="${prodId}">
                    </td>
                    <td>
                        <code class="text-primary">${sku}</code>
                    </td>
                    <td class="text-right">
                        Rp ${price.toLocaleString('id-ID')}
                    </td>
                    <td class="text-center">
                        <input type="number" name="items[${itemIndex}][quantity]" value="${qty}" min="1" class="form-control text-center mx-auto item-row-qty" style="width: 75px; height: 32px;" data-unit-price="${price}">
                    </td>
                    <td class="text-right font-weight-bold text-dark item-row-total" data-raw-value="${total}">
                        Rp ${total.toLocaleString('id-ID')}
                    </td>
                    <td class="text-center">
                        <button type="button" class="btn btn-xs btn-outline-danger btn-delete-row" data-row-id="${itemIndex}">
                            <i data-feather="trash"></i> Hapus
                        </button>
                    </td>
                </tr>
            `;

            $('#tbody-order-items').append(rowHtml);
            feather.replace();

            // Reset selector
            selector.val('');
            $('#product_qty').val(1);
            itemIndex++;

            recalculateTotals();
        });

        // Delete Row
        $(document).on('click', '.btn-delete-row', function(e) {
            e.preventDefault();
            var rowId = $(this).data('row-id');
            $('#item-row-' + rowId).remove();

            if ($('.order-item-tr').length === 0) {
                $('#tbody-order-items').html(`
                    <tr id="tr-empty-items">
                        <td colspan="6" class="text-center text-muted py-2">
                            Belum ada produk yang ditambahkan ke order.
                        </td>
                    </tr>
                `);
            }

            recalculateTotals();
        });

        // Update row total when qty inside input changes
        $(document).on('input', '.item-row-qty', function() {
            var qty = parseInt($(this).val()) || 0;
            var unitPrice = parseFloat($(this).data('unit-price')) || 0;
            var total = qty * unitPrice;
            
            var cell = $(this).closest('tr').find('.item-row-total');
            cell.data('raw-value', total);
            cell.html('Rp ' + total.toLocaleString('id-ID'));
            
            recalculateTotals();
        });

        // Apply Voucher AJAX
        $('#btn-apply-voucher').click(function(e) {
            e.preventDefault();
            var code = $('#voucher_code_input').val().trim();
            var subtotal = parseFloat($('#order_subtotal').val()) || 0;

            if (!code) {
                toastr.warning('Silakan masukkan kode voucher.');
                return;
            }
            if (subtotal === 0) {
                toastr.warning('Silakan tambahkan produk belanja terlebih dahulu.');
                return;
            }

            applyVoucherAJAX(code, subtotal, true);
        });

        function applyVoucherAJAX(code, subtotal, showToast) {
            var shipping = parseFloat($('#order_shipping_cost').val()) || 0;

            $.ajax({
                url: "{{ route('admin.orders.validate-voucher') }}",
                method: "POST",
                data: {
                    _token: "{{ csrf_token() }}",
                    code: code,
                    subtotal: subtotal,
                    shipping_cost: shipping
                },
                success: function(res) {
                    if (res.success) {
                        appliedVoucherCode = res.voucher_code;
                        $('#hidden_voucher_id').val(res.voucher_id);
                        $('#hidden_voucher_code').val(res.voucher_code);
                        $('#order_discount').val(res.discount);
                        
                        var grandTotal = subtotal - res.discount + shipping;
                        if (grandTotal < 0) grandTotal = 0;
                        $('#order_grand_total').val(grandTotal);

                        $('#voucher-status-feedback').html(`<span class="text-success font-weight-bold">✓ Voucher berhasil digunakan: Potongan Rp ${res.discount.toLocaleString('id-ID')}</span>`);
                        if (showToast) toastr.success(res.message);
                    } else {
                        // Reset voucher fields
                        appliedVoucherCode = '';
                        $('#hidden_voucher_id').val('');
                        $('#hidden_voucher_code').val('');
                        $('#order_discount').val(0);
                        
                        var grandTotal = subtotal + shipping;
                        $('#order_grand_total').val(grandTotal);

                        $('#voucher-status-feedback').html(`<span class="text-danger">✗ ${res.message}</span>`);
                        if (showToast) toastr.error(res.message);
                    }
                },
                error: function() {
                    appliedVoucherCode = '';
                    $('#hidden_voucher_id').val('');
                    $('#hidden_voucher_code').val('');
                    $('#order_discount').val(0);
                    
                    var grandTotal = subtotal + shipping;
                    $('#order_grand_total').val(grandTotal);

                    $('#voucher-status-feedback').html(`<span class="text-danger">✗ Terjadi kesalahan validasi voucher.</span>`);
                    if (showToast) toastr.error('Gagal validasi voucher.');
                }
            });
        }

        @if($order->exists)
            var orderId = "{{ $order->id }}";

            // Update Order Status AJAX
            $('#form-update-status').submit(function(e) {
                e.preventDefault();
                $('#btn-submit-status').prop('disabled', true).text('Memproses...');

                $.ajax({
                    url: '/admin/orders/' + orderId + '/update-status',
                    method: 'POST',
                    data: $(this).serialize(),
                    success: function(res) {
                        $('#btn-submit-status').prop('disabled', false).text('Perbarui Status');
                        if (res.success) {
                            toastr.success(res.message);
                            setTimeout(function() {
                                location.reload();
                            }, 1000);
                        } else {
                            toastr.error(res.message);
                        }
                    },
                    error: function() {
                        $('#btn-submit-status').prop('disabled', false).text('Perbarui Status');
                        toastr.error('Gagal memperbarui status order.');
                    }
                });
            });

            // Update Order Details & Waybill ID AJAX
            $(document).on('submit', '#form-update-details', function(e) {
                e.preventDefault();
                var btn = $(this).find('button[type=submit]');
                btn.prop('disabled', true).text('Menyimpan...');

                $.ajax({
                    url: '/admin/orders/' + orderId + '/update-details',
                    method: 'POST',
                    data: $(this).serialize(),
                    success: function(res) {
                        btn.prop('disabled', false).text('Simpan Perubahan');
                        if (res.success) {
                            toastr.success(res.message);
                            setTimeout(function() {
                                location.reload();
                            }, 1000);
                        } else {
                            toastr.error(res.message);
                        }
                    },
                    error: function() {
                        btn.prop('disabled', false).text('Simpan Perubahan');
                        toastr.error('Gagal menyimpan perubahan.');
                    }
                });
            });

            // Sync Payment status manually from Midtrans API
            $(document).on('click', '#btn-sync-payment', function(e) {
                e.preventDefault();
                var btn = $(this);
                btn.prop('disabled', true).html('<i class="spinner-border spinner-border-sm mr-25"></i> Menghubungkan...');

                $.ajax({
                    url: '/admin/orders/' + orderId + '/sync-payment',
                    method: 'POST',
                    data: {
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(res) {
                        btn.prop('disabled', false).html('<i data-feather="refresh-cw" class="mr-25"></i> Sync Status Midtrans');
                        feather.replace();
                        if (res.success) {
                            toastr.success(res.message);
                            setTimeout(function() {
                                location.reload();
                            }, 1000);
                        } else {
                            toastr.error(res.message);
                        }
                    },
                    error: function() {
                        btn.prop('disabled', false).html('<i data-feather="refresh-cw" class="mr-25"></i> Sync Status Midtrans');
                        feather.replace();
                        toastr.error('Gagal menghubungi server untuk sinkronisasi pembayaran.');
                    }
                });
            });

            // Generate Payment Link manually from Midtrans API
            $(document).on('click', '#btn-generate-payment-link', function(e) {
                e.preventDefault();
                var btn = $(this);
                btn.prop('disabled', true).html('<i class="spinner-border spinner-border-sm mr-25"></i> Menghubungkan...');

                $.ajax({
                    url: '/admin/orders/' + orderId + '/generate-payment-link',
                    method: 'POST',
                    data: {
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(res) {
                        btn.prop('disabled', false).html('<i data-feather="link" class="mr-25"></i> Buat Link Pembayaran Midtrans');
                        feather.replace();
                        if (res.success) {
                            toastr.success(res.message);
                            setTimeout(function() {
                                location.reload();
                            }, 1000);
                        } else {
                            toastr.error(res.message);
                        }
                    },
                    error: function() {
                        btn.prop('disabled', false).html('<i data-feather="link" class="mr-25"></i> Buat Link Pembayaran Midtrans');
                        feather.replace();
                        toastr.error('Gagal menghubungi server untuk membuat link pembayaran.');
                    }
                });
            });

            // Trigger Midtrans Snap Payment Overlay Modal
            $(document).on('click', '.btn-trigger-pay-snap', function(e) {
                e.preventDefault();
                var btn = $(this);
                var snapToken = btn.data('snap-token');

                if (snapToken) {
                    launchMidtransSnap(snapToken);
                } else {
                    btn.prop('disabled', true).html('<i class="spinner-border spinner-border-sm mr-25"></i> Memproses...');
                    
                    $.ajax({
                        url: '/admin/orders/' + orderId + '/generate-payment-link',
                        method: 'POST',
                        data: {
                            _token: "{{ csrf_token() }}"
                        },
                        success: function(res) {
                            btn.prop('disabled', false).html('<i data-feather="credit-card" class="mr-25"></i> Bayar Sekarang');
                            feather.replace();
                            
                            if (res.success && res.snap_token) {
                                btn.data('snap-token', res.snap_token);
                                launchMidtransSnap(res.snap_token);
                            } else {
                                toastr.error(res.message || 'Gagal menyiapkan portal pembayaran.');
                            }
                        },
                        error: function() {
                            btn.prop('disabled', false).html('<i data-feather="credit-card" class="mr-25"></i> Bayar Sekarang');
                            feather.replace();
                            toastr.error('Terjadi kesalahan memuat payment portal.');
                        }
                    });
                }
            });

            function launchMidtransSnap(snapToken) {
                if (typeof snap === 'undefined') {
                    toastr.error('Script Midtrans Snap belum ter-load. Silakan refresh halaman.');
                    return;
                }

                snap.pay(snapToken, {
                    onSuccess: function(result) {
                        toastr.success('Pembayaran berhasil dikonfirmasi!');
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                    },
                    onPending: function(result) {
                        toastr.info('Menunggu penyelesaian pembayaran.');
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                    },
                    onError: function(result) {
                        toastr.error('Pembayaran gagal dilakukan.');
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                    },
                    onClose: function() {
                        toastr.warning('Halaman pembayaran ditutup.');
                        location.reload();
                    }
                });
            }
            // Book courier and generate waybill ID from Biteship API
            $(document).on('click', '#btn-book-biteship', function(e) {
                e.preventDefault();
                var btn = $(this);
                btn.prop('disabled', true).html('<i class="spinner-border spinner-border-sm mr-25"></i> Menghubungi Biteship...');

                $.ajax({
                    url: '/admin/orders/' + orderId + '/book-shipment',
                    method: 'POST',
                    data: {
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(res) {
                        btn.prop('disabled', false).html('<i data-feather="truck" class="mr-25"></i> Booking Kurir & Generate Resi');
                        feather.replace();
                        if (res.success) {
                            toastr.success(res.message);
                            setTimeout(function() {
                                location.reload();
                            }, 1500);
                        } else {
                            toastr.error(res.message);
                        }
                    },
                    error: function() {
                        btn.prop('disabled', false).html('<i data-feather="truck" class="mr-25"></i> Booking Kurir & Generate Resi');
                        feather.replace();
                        toastr.error('Gagal menghubungi server untuk booking kurir.');
                    }
                });
            });
        @endif
    });
</script>
@endpush
