@extends('layouts.app')

@section('title', 'Manajemen Data Olshop')

@section('content')
<div class="row">
    <!-- Success Alert -->
    @if(session('success'))
    <div class="col-12 mb-1">
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <div class="alert-body font-weight-bold">
                <i data-feather="check-circle" class="mr-50"></i> {{ session('success') }}
            </div>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    </div>
    @endif

    <!-- Header Card -->
    <div class="col-12 mb-2">
        <div class="card text-white mb-0" style="background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7)) !important; border-radius: 8px;">
            <div class="card-header d-flex align-items-center py-2 flex-wrap">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">
                        <i data-feather="shopping-bag" style="width: 24px; height: 24px; color: white;"></i>
                    </div>
                    <div class="ml-1">
                        <h4 class="card-title font-weight-bold text-white mb-0">Manajemen Data Olshop</h4>
                        <p class="text-white-50 small mb-0">Integrasi Direct API Tokopedia, TikTok Shop, dan Shopee. Clone katalog produk dan tarik transaksi penjualan.</p>
                    </div>
                </div>
                <div class="ml-auto mt-50 mt-md-0">
                    <form action="{{ route('admin.olshop.sync-orders') }}" method="POST" class="d-inline">
                        @csrf
                        <input type="hidden" name="shop" value="{{ $activeShop }}">
                        <button type="submit" class="btn btn-dark font-weight-bold shadow">
                            <i data-feather="download-cloud" class="mr-25"></i> Tarik Orderan {{ ucfirst($activeShop) }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Summary Stats -->
    <div class="col-xl-6 col-sm-6 col-12 mb-2">
        <div class="card card-tiny-line-stats mb-0">
            <div class="card-body p-2 d-flex align-items-center">
                <div class="avatar bg-light-primary p-50 mr-1" style="border-radius: 8px;">
                    <i data-feather="package" class="text-primary" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h3 class="font-weight-bolder mb-0">{{ count($olshopProducts) }}</h3>
                    <p class="card-text text-muted font-weight-bold small mb-0">Produk {{ ucfirst($activeShop) }} Tersedia</p>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-6 col-sm-6 col-12 mb-2">
        <div class="card card-tiny-line-stats mb-0">
            <div class="card-body p-2 d-flex align-items-center">
                <div class="avatar bg-light-info p-50 mr-1" style="border-radius: 8px;">
                    <i data-feather="shopping-cart" class="text-info" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <h3 class="font-weight-bolder mb-0">{{ $localOrders->count() }}</h3>
                    <p class="card-text text-muted font-weight-bold small mb-0">Transaksi {{ ucfirst($activeShop) }} Pulled</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Marketplace Selector Nav Pills -->
    <div class="col-12 mb-2">
        <div class="card mb-0">
            <div class="card-body p-1">
                <ul class="nav nav-pills">
                    <li class="nav-item">
                        <a class="nav-link {{ $activeShop === 'tokopedia' ? 'active bg-success' : '' }}" href="{{ route('admin.olshop.index', ['shop' => 'tokopedia']) }}" style="font-weight: 700;">
                            <i data-feather="shopping-bag" class="mr-25"></i> Tokopedia
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ $activeShop === 'tiktok' ? 'active bg-dark' : '' }}" href="{{ route('admin.olshop.index', ['shop' => 'tiktok']) }}" style="font-weight: 700;">
                            <i data-feather="video" class="mr-25"></i> TikTok Shop
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ $activeShop === 'shopee' ? 'active' : '' }}" style="font-weight: 700; {{ $activeShop === 'shopee' ? 'background-color: #ee4d2d !important; color: #fff !important;' : '' }}" href="{{ route('admin.olshop.index', ['shop' => 'shopee']) }}">
                            <i data-feather="shopping-cart" class="mr-25"></i> Shopee
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Tables Section -->
    <!-- Left: Clone Products -->
    <div class="col-12 col-xl-6 mb-2">
        <div class="card h-100 mb-0">
            <div class="card-header border-bottom">
                <h4 class="card-title font-weight-bold mb-0">
                    <i data-feather="copy" class="mr-50 text-primary"></i> Clone Produk {{ ucfirst($activeShop) }}
                </h4>
                <span class="badge badge-light-primary font-weight-bold">{{ count($olshopProducts) }} Item</span>
            </div>
            <div class="card-body pt-1">
                <form action="{{ route('admin.olshop.clone-product') }}" method="POST">
                    @csrf
                    <input type="hidden" name="shop" value="{{ $activeShop }}">

                    <!-- Search Box -->
                    <div class="form-group mb-1">
                        <input type="text" id="search-product-input" class="form-control" placeholder="Cari nama produk atau SKU...">
                    </div>

                    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-hover table-striped">
                            <thead class="thead-light sticky-top">
                                <tr>
                                    <th style="width: 40px;" class="text-center">
                                        <input type="checkbox" id="check-all-products">
                                    </th>
                                    <th>Detail Produk</th>
                                    <th>SKU</th>
                                    <th>Harga</th>
                                    <th class="text-center">Stok</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($olshopProducts as $prod)
                                <tr class="product-row">
                                    <td class="text-center align-middle">
                                        <input type="checkbox" name="product_ids[]" value="{{ $prod['id'] }}" class="product-checkbox">
                                    </td>
                                    <td class="align-middle">
                                        <div class="d-flex align-items-center">
                                            @if(!empty($prod['image']))
                                                <img src="{{ $prod['image'] }}" alt="img" class="rounded mr-75" style="width: 38px; height: 38px; object-fit: cover;" onerror="this.style.display='none';">
                                            @endif
                                            <div>
                                                <strong class="text-dark d-block product-name text-truncate" style="max-width: 180px;" title="{{ $prod['name'] }}">{{ $prod['name'] }}</strong>
                                                <small class="text-muted">ID: {{ $prod['id'] }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle">
                                        <span class="badge badge-light-secondary font-weight-bold product-sku" style="white-space: nowrap; font-family: monospace;">{{ $prod['sku'] }}</span>
                                    </td>
                                    <td class="align-middle text-success font-weight-bold" style="white-space: nowrap;">
                                        Rp {{ number_format($prod['price'], 0, ',', '.') }}
                                    </td>
                                    <td class="align-middle text-center">
                                        <span class="badge badge-pill badge-light-info">{{ $prod['stock'] }}</span>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="5" class="text-center py-3 text-muted">
                                        <i data-feather="inbox" class="font-medium-5 text-muted d-block mx-auto mb-25"></i>
                                        Tidak ada produk dari {{ ucfirst($activeShop) }}.
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="mt-1 d-flex justify-content-between align-items-center">
                        <small class="text-muted font-weight-bold" id="selected-count-label">0 produk dipilih</small>
                        <button type="submit" class="btn btn-success font-weight-bold">
                            <i data-feather="check-square" class="mr-25"></i> Clone Produk Terpilih
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Right: ERP Pulled Orders & Print Resi -->
    <div class="col-12 col-xl-6 mb-2">
        <div class="card h-100 mb-0">
            <div class="card-header border-bottom">
                <h4 class="card-title font-weight-bold mb-0">
                    <i data-feather="printer" class="mr-50 text-danger"></i> Transaksi & Print Resi
                </h4>
                <span class="badge badge-light-danger font-weight-bold">{{ $localOrders->count() }} Transaksi</span>
            </div>
            <div class="card-body pt-1">
                <div class="table-responsive" style="max-height: 460px; overflow-y: auto;">
                    <table class="table table-hover">
                        <thead class="thead-light sticky-top">
                            <tr>
                                <th>No. Order</th>
                                <th>Pembeli</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th class="text-center">Aksi Label</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($localOrders as $ord)
                            <tr>
                                <td class="align-middle">
                                    <strong class="text-primary d-block" style="white-space: nowrap;">{{ $ord->order_number }}</strong>
                                    <small class="text-muted">{{ $ord->created_at ? $ord->created_at->format('d M Y H:i') : '-' }}</small>
                                </td>
                                <td class="align-middle">
                                    <strong class="text-dark d-block" style="white-space: nowrap;">{{ $ord->customer ? $ord->customer->name : 'Pembeli' }}</strong>
                                    <small class="text-secondary">{{ $ord->customer ? $ord->customer->phone : '-' }}</small>
                                </td>
                                <td class="align-middle font-weight-bold text-dark" style="white-space: nowrap;">
                                    Rp {{ number_format($ord->grand_total, 0, ',', '.') }}
                                </td>
                                <td class="align-middle">
                                    @if($ord->status === 'completed')
                                        <span class="badge badge-light-success">Selesai</span>
                                    @elseif($ord->status === 'shipping')
                                        <span class="badge badge-light-info">Dikirim</span>
                                    @else
                                        <span class="badge badge-light-warning">Diproses</span>
                                    @endif
                                </td>
                                <td class="align-middle text-center">
                                    <a href="{{ route('admin.olshop.print-resi', $ord->id) }}" target="_blank" class="btn btn-sm btn-outline-danger font-weight-bold shadow-sm" style="white-space: nowrap;">
                                        <i data-feather="printer" class="mr-25"></i> Print Resi
                                    </a>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center py-3 text-muted">
                                    Belum ada orderan yang ditarik dari {{ ucfirst($activeShop) }}.<br>
                                    Klik <strong>"Tarik Orderan {{ ucfirst($activeShop) }}"</strong> untuk sinkronisasi.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    var checkAll = document.getElementById('check-all-products');
    var checkboxes = document.querySelectorAll('.product-checkbox');
    var countLabel = document.getElementById('selected-count-label');
    var searchInput = document.getElementById('search-product-input');

    function updateCount() {
        var checked = document.querySelectorAll('.product-checkbox:checked').length;
        if (countLabel) {
            countLabel.textContent = checked + ' produk dipilih';
        }
    }

    if (checkAll) {
        checkAll.addEventListener('change', function() {
            checkboxes.forEach(function(cb) {
                if (cb.closest('tr').style.display !== 'none') {
                    cb.checked = checkAll.checked;
                }
            });
            updateCount();
        });
    }

    checkboxes.forEach(function(cb) {
        cb.addEventListener('change', updateCount);
    });

    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            var filter = searchInput.value.toLowerCase();
            var rows = document.querySelectorAll('.product-row');
            rows.forEach(function(row) {
                var name = row.querySelector('.product-name') ? row.querySelector('.product-name').textContent.toLowerCase() : '';
                var sku = row.querySelector('.product-sku') ? row.querySelector('.product-sku').textContent.toLowerCase() : '';
                if (name.includes(filter) || sku.includes(filter)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});
</script>
@endsection
