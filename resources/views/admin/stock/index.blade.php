@extends('layouts.app')
@section('title', 'Manajemen Stok & Penyesuaian')

@section('content')
<div class="row">
    <!-- Header -->
    <div class="col-12 mb-2">
        <div class="card bg-primary text-white mb-0" style="background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7)) !important; border-radius: 8px;">
            <div class="card-header d-flex align-items-center py-2 flex-wrap">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">
                        <i data-feather="database" style="width: 24px; height: 24px; color: white;"></i>
                    </div>
                    <div class="ml-1">
                        <h4 class="card-title font-weight-bold text-white mb-0">Manajemen & Koreksi Stok</h4>
                        <p class="text-white-50 small mb-0">Kelola inventaris barang, lakukan mutasi masuk/keluar manual, dan penyesuaian stok opname fisik.</p>
                    </div>
                </div>
                <div class="ml-auto mt-50 mt-md-0">
                    <a href="{{ route('admin.stock.mutations') }}" class="btn btn-dark font-weight-bold">
                        <i data-feather="activity" class="mr-25"></i> Lihat Riwayat Mutasi
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Summary Statistics -->
    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card card-tiny-line-stats">
            <div class="card-body p-2 d-flex align-items-center">
                <div class="avatar bg-light-primary p-50 mr-1" style="border-radius: 8px;">
                    <i data-feather="box" class="text-primary" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h3 class="font-weight-bolder mb-0">{{ number_format($totalItems) }}</h3>
                    <p class="card-text text-muted font-weight-bold small mb-0">Total Item Produk</p>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card card-tiny-line-stats">
            <div class="card-body p-2 d-flex align-items-center">
                <div class="avatar bg-light-warning p-50 mr-1" style="border-radius: 8px;">
                    <i data-feather="alert-triangle" class="text-warning" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h3 class="font-weight-bolder mb-0 text-warning">{{ number_format($lowStockCount) }}</h3>
                    <p class="card-text text-muted font-weight-bold small mb-0">Stok Menipis (<= 5)</p>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card card-tiny-line-stats">
            <div class="card-body p-2 d-flex align-items-center">
                <div class="avatar bg-light-danger p-50 mr-1" style="border-radius: 8px;">
                    <i data-feather="x-circle" class="text-danger" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h3 class="font-weight-bolder mb-0 text-danger">{{ number_format($emptyStockCount) }}</h3>
                    <p class="card-text text-muted font-weight-bold small mb-0">Stok Habis (0)</p>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card card-tiny-line-stats">
            <div class="card-body p-2 d-flex align-items-center">
                <div class="avatar bg-light-success p-50 mr-1" style="border-radius: 8px;">
                    <i data-feather="dollar-sign" class="text-success" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h3 class="font-weight-bolder mb-0">Rp {{ number_format($totalStockValue, 0, ',', '.') }}</h3>
                    <p class="card-text text-muted font-weight-bold small mb-0">Estimasi Nilai Aset Stok</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="col-12 mb-2">
        <div class="card">
            <div class="card-body">
                <form action="{{ route('admin.stock.index') }}" method="GET" class="row">
                    <div class="col-md-4 form-group">
                        <label for="search" class="font-weight-bold">Cari Produk / SKU</label>
                        <input type="text" id="search" name="search" class="form-control" value="{{ request('search') }}" placeholder="Cari nama barang atau SKU...">
                    </div>
                    <div class="col-md-3 form-group">
                        <label for="category_id" class="font-weight-bold">Kategori Produk</label>
                        <select id="category_id" name="category_id" class="form-control">
                            <option value="">Semua Kategori</option>
                            @foreach($categories as $category)
                                <option value="{{ $category->id }}" {{ request('category_id') == $category->id ? 'selected' : '' }}>
                                    {{ $category->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-3 form-group d-flex align-items-center pt-2">
                        <div class="custom-control custom-switch custom-switch-warning">
                            <input type="checkbox" class="custom-control-input" id="low_stock" name="low_stock" value="1" {{ request('low_stock') ? 'checked' : '' }}>
                            <label class="custom-control-label font-weight-bold" for="low_stock">Tampilkan Stok Menipis Saja</label>
                        </div>
                    </div>
                    <div class="col-md-2 form-group d-flex align-items-end">
                        <button type="submit" class="btn btn-primary btn-block font-weight-bold">
                            <i data-feather="search" class="mr-25"></i> Cari
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Stock Table -->
    <div class="col-12">
        <div class="card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="thead-light">
                            <tr>
                                <th>Produk</th>
                                <th width="15%">Kategori</th>
                                <th width="15%">SKU</th>
                                <th width="15%" class="text-right">Harga Jual</th>
                                <th width="12%" class="text-center">Jumlah Stok</th>
                                <th width="12%" class="text-center">Status</th>
                                <th width="18%" class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($products as $product)
                                @php
                                    $displayName = $product->name;
                                    if ($product->parent_id && $product->parent) {
                                        $displayName = $product->parent->name . ' - ' . $product->name;
                                    }
                                    
                                    // Resolve category name
                                    $catName = '-';
                                    if ($product->categories->isNotEmpty()) {
                                        $catName = $product->categories->first()->name;
                                    } elseif ($product->parent && $product->parent->categories->isNotEmpty()) {
                                        $catName = $product->parent->categories->first()->name;
                                    }

                                    // Resolve stock status
                                    $stock = (int) $product->stock;
                                    $statusLabel = 'Normal';
                                    $statusClass = 'badge-light-success';
                                    if ($stock === 0) {
                                        $statusLabel = 'Habis';
                                        $statusClass = 'badge-light-danger';
                                    } elseif ($stock <= 5) {
                                        $statusLabel = 'Kritis';
                                        $statusClass = 'badge-light-warning';
                                    } elseif ($stock <= 20) {
                                        $statusLabel = 'Rendah';
                                        $statusClass = 'badge-light-info';
                                    }
                                @endphp
                                <tr>
                                    <td>
                                        <div class="font-weight-bold text-dark">{{ $displayName }}</div>
                                        @if($product->parent_id)
                                            <span class="badge badge-pill badge-light-secondary font-weight-bold mt-25" style="font-size: 8px;">VARIAN</span>
                                        @endif
                                    </td>
                                    <td>{{ $catName }}</td>
                                    <td class="text-monospace font-weight-bold">{{ $product->sku ?: '-' }}</td>
                                    <td class="text-right font-weight-bold">
                                        Rp {{ number_format($product->price, 0, ',', '.') }}
                                    </td>
                                    <td class="text-center font-weight-bolder" id="stock-val-{{ $product->id }}">
                                        {{ number_format($product->stock) }}
                                    </td>
                                    <td class="text-center" id="stock-status-{{ $product->id }}">
                                        <span class="badge badge-pill {{ $statusClass }} font-weight-bold">{{ $statusLabel }}</span>
                                    </td>
                                    <td class="text-center">
                                        <div class="btn-group">
                                            <!-- Adjust Stock Button -->
                                            <button type="button" class="btn btn-sm btn-outline-primary font-weight-bold btn-adjust"
                                                    data-id="{{ $product->id }}"
                                                    data-name="{{ $displayName }}"
                                                    data-stock="{{ $product->stock }}">
                                                <i data-feather="refresh-cw" class="mr-25"></i> Mutasi
                                            </button>
                                            
                                            <!-- Correct Stock (Opname) Button -->
                                            <button type="button" class="btn btn-sm btn-outline-warning font-weight-bold btn-correct"
                                                    data-id="{{ $product->id }}"
                                                    data-name="{{ $displayName }}"
                                                    data-stock="{{ $product->stock }}">
                                                <i data-feather="check-square" class="mr-25"></i> Opname
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center py-3 text-muted">
                                        <i data-feather="alert-circle" class="mr-25"></i> Tidak ada data stok produk ditemukan.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="card-footer d-flex justify-content-end pb-0">
                    {{ $products->links() }}
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL MUTASI STOK MANUAL -->
<!-- ============================================== -->
<div class="modal fade" id="adjustStockModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title text-white font-weight-bold">Mutasi Stok Barang (Masuk/Keluar)</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="adjustStockForm" action="{{ route('admin.stock.adjust') }}" method="POST">
                @csrf
                <input type="hidden" name="product_id" id="adjust_product_id">
                <div class="modal-body">
                    <div class="bg-light p-1 rounded mb-2 border">
                        <div class="font-weight-bold text-dark mb-25" id="adjust_product_name">Nama Produk</div>
                        <div class="text-muted small">Stok saat ini: <strong class="text-primary" id="adjust_current_stock">0</strong> pcs</div>
                    </div>

                    <div class="form-group">
                        <label class="font-weight-bold d-block">Tipe Mutasi <span class="text-danger">*</span></label>
                        <div class="custom-control custom-radio custom-control-inline">
                            <input type="radio" id="type_in" name="type" class="custom-control-input" value="in" checked>
                            <label class="custom-control-label font-weight-bold text-success" for="type_in">
                                <i data-feather="arrow-down-left" class="mr-25"></i> Barang Masuk (+)
                            </label>
                        </div>
                        <div class="custom-control custom-radio custom-control-inline">
                            <input type="radio" id="type_out" name="type" class="custom-control-input" value="out">
                            <label class="custom-control-label font-weight-bold text-danger" for="type_out">
                                <i data-feather="arrow-up-right" class="mr-25"></i> Barang Keluar (-)
                            </label>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 form-group">
                            <label for="quantity" class="font-weight-bold">Jumlah Kuantitas <span class="text-danger">*</span></label>
                            <input type="number" id="quantity" name="quantity" class="form-control" min="1" placeholder="Contoh: 10" required>
                        </div>
                        <div class="col-md-6 form-group">
                            <label for="source" class="font-weight-bold">Sumber Mutasi <span class="text-danger">*</span></label>
                            <select id="source" name="source" class="form-control" required>
                                <option value="adjustment">Penyesuaian Manual</option>
                                <option value="purchase">Pembelian Dari Supplier</option>
                                <option value="sale">Penjualan Ke Customer</option>
                                <option value="return">Retur Barang</option>
                                <option value="damage">Barang Rusak/Afkir</option>
                                <option value="transfer">Transfer Gudang</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="notes" class="font-weight-bold">Catatan / Alasan Mutasi</label>
                        <textarea id="notes" name="notes" class="form-control" rows="3" placeholder="Contoh: Tambah stok manual, retur barang, dll."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary font-weight-bold" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary font-weight-bold">Simpan Mutasi</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL KOREKSI STOK (STOCK OPNAME) -->
<!-- ============================================== -->
<div class="modal fade" id="correctStockModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-warning text-white">
                <h5 class="modal-title text-white font-weight-bold">Koreksi Stok Opname Fisik</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="correctStockForm" action="{{ route('admin.stock.correct') }}" method="POST">
                @csrf
                <input type="hidden" name="product_id" id="correct_product_id">
                <div class="modal-body">
                    <div class="bg-light p-1 rounded mb-2 border">
                        <div class="font-weight-bold text-dark mb-25" id="correct_product_name">Nama Produk</div>
                        <div class="text-muted small">Stok tercatat di sistem: <strong class="text-warning" id="correct_current_stock">0</strong> pcs</div>
                    </div>

                    <div class="form-group">
                        <label for="correct_stock" class="font-weight-bold">Jumlah Stok Fisik Sebenarnya <span class="text-danger">*</span></label>
                        <input type="number" id="correct_stock" name="stock" class="form-control" min="0" placeholder="Masukkan jumlah stok fisik saat ini..." required>
                        <p class="text-muted small mt-25 mb-0">Sistem akan secara otomatis mencatat selisih barang masuk/keluar di riwayat mutasi.</p>
                    </div>

                    <div class="form-group">
                        <label for="correct_notes" class="font-weight-bold">Catatan Stock Opname</label>
                        <textarea id="correct_notes" name="notes" class="form-control" rows="3" placeholder="Contoh: Hasil perhitungan fisik stock opname Juli 2026."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary font-weight-bold" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning font-weight-bold text-white">Simpan Penyesuaian</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('script')
<script>
    $(document).ready(function() {
        // Trigger Adjust Modal
        $('.btn-adjust').on('click', function() {
            var id = $(this).data('id');
            var name = $(this).data('name');
            var stock = $(this).data('stock');

            $('#adjust_product_id').val(id);
            $('#adjust_product_name').text(name);
            $('#adjust_current_stock').text(stock);
            $('#quantity').val('');
            $('#notes').val('');
            
            $('#adjustStockModal').modal('show');
        });

        // Submit Adjust Form via AJAX
        $('#adjustStockForm').on('submit', function(e) {
            e.preventDefault();
            var form = $(this);
            var btn = form.find('button[type="submit"]');
            btn.prop('disabled', true).text('Menyimpan...');

            $.ajax({
                url: form.attr('action'),
                type: 'POST',
                data: form.serialize(),
                success: function(response) {
                    btn.prop('disabled', false).text('Simpan Mutasi');
                    if (response.success) {
                        $('#adjustStockModal').modal('hide');
                        Swal.fire({
                            title: 'Berhasil!',
                            text: response.message,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(function() {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Gagal!', response.message, 'error');
                    }
                },
                error: function(xhr) {
                    btn.prop('disabled', false).text('Simpan Mutasi');
                    var errMsg = 'Gagal menyimpan mutasi stok.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message;
                    }
                    Swal.fire('Error!', errMsg, 'error');
                }
            });
        });

        // Trigger Correct Modal
        $('.btn-correct').on('click', function() {
            var id = $(this).data('id');
            var name = $(this).data('name');
            var stock = $(this).data('stock');

            $('#correct_product_id').val(id);
            $('#correct_product_name').text(name);
            $('#correct_current_stock').text(stock);
            $('#correct_stock').val('');
            $('#correct_notes').val('');

            $('#correctStockModal').modal('show');
        });

        // Submit Correct Form via AJAX
        $('#correctStockForm').on('submit', function(e) {
            e.preventDefault();
            var form = $(this);
            var btn = form.find('button[type="submit"]');
            btn.prop('disabled', true).text('Menyimpan...');

            $.ajax({
                url: form.attr('action'),
                type: 'POST',
                data: form.serialize(),
                success: function(response) {
                    btn.prop('disabled', false).text('Simpan Penyesuaian');
                    if (response.success) {
                        $('#correctStockModal').modal('hide');
                        Swal.fire({
                            title: 'Berhasil!',
                            text: response.message,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(function() {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Gagal!', response.message, 'error');
                    }
                },
                error: function(xhr) {
                    btn.prop('disabled', false).text('Simpan Penyesuaian');
                    var errMsg = 'Gagal menyesuaikan stok.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message;
                    }
                    Swal.fire('Error!', errMsg, 'error');
                }
            });
        });
    });
</script>
@endpush
