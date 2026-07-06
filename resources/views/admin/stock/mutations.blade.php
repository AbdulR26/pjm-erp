@extends('layouts.app')
@section('title', 'Riwayat Mutasi Stok')

@section('content')
<div class="row">
    <!-- Header -->
    <div class="col-12 mb-2">
        <div class="card bg-dark text-white mb-0" style="background: linear-gradient(118deg, #343a40, rgba(52, 58, 64, 0.7)) !important; border-radius: 8px;">
            <div class="card-header d-flex align-items-center py-2 flex-wrap">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">
                        <i data-feather="activity" style="width: 24px; height: 24px; color: white;"></i>
                    </div>
                    <div class="ml-1">
                        <h4 class="card-title font-weight-bold text-white mb-0">Riwayat Mutasi Stok</h4>
                        <p class="text-white-50 small mb-0">Lacak seluruh riwayat barang masuk/keluar, retur, penjualan, pembelian, dan penyesuaian opname.</p>
                    </div>
                </div>
                <div class="ml-auto mt-50 mt-md-0">
                    <a href="{{ route('admin.stock.index') }}" class="btn btn-primary font-weight-bold">
                        <i data-feather="database" class="mr-25"></i> Lihat Stok Produk
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="col-12 mb-2">
        <div class="card">
            <div class="card-body">
                <form action="{{ route('admin.stock.mutations') }}" method="GET" class="row">
                    <div class="col-md-3 form-group">
                        <label for="search" class="font-weight-bold">Cari Produk / SKU</label>
                        <input type="text" id="search" name="search" class="form-control" value="{{ request('search') }}" placeholder="Cari nama barang atau SKU...">
                    </div>
                    <div class="col-md-2 form-group">
                        <label for="type" class="font-weight-bold">Tipe Mutasi</label>
                        <select id="type" name="type" class="form-control">
                            <option value="">Semua Tipe</option>
                            <option value="in" {{ request('type') === 'in' ? 'selected' : '' }}>Masuk (+)</option>
                            <option value="out" {{ request('type') === 'out' ? 'selected' : '' }}>Keluar (-)</option>
                        </select>
                    </div>
                    <div class="col-md-2 form-group">
                        <label for="source" class="font-weight-bold">Sumber Mutasi</label>
                        <select id="source" name="source" class="form-control">
                            <option value="">Semua Sumber</option>
                            <option value="adjustment" {{ request('source') === 'adjustment' ? 'selected' : '' }}>Penyesuaian Manual</option>
                            <option value="purchase" {{ request('source') === 'purchase' ? 'selected' : '' }}>Pembelian</option>
                            <option value="sale" {{ request('source') === 'sale' ? 'selected' : '' }}>Penjualan</option>
                            <option value="return" {{ request('source') === 'return' ? 'selected' : '' }}>Retur</option>
                            <option value="damage" {{ request('source') === 'damage' ? 'selected' : '' }}>Kerusakan</option>
                            <option value="transfer" {{ request('source') === 'transfer' ? 'selected' : '' }}>Transfer</option>
                        </select>
                    </div>
                    <div class="col-md-2 form-group">
                        <label for="date_from" class="font-weight-bold">Dari Tanggal</label>
                        <input type="date" id="date_from" name="date_from" class="form-control" value="{{ request('date_from') }}">
                    </div>
                    <div class="col-md-2 form-group">
                        <label for="date_to" class="font-weight-bold">Sampai Tanggal</label>
                        <input type="date" id="date_to" name="date_to" class="form-control" value="{{ request('date_to') }}">
                    </div>
                    <div class="col-md-1 form-group d-flex align-items-end mb-2">
                        <button type="submit" class="btn btn-primary btn-block p-50 font-weight-bold" title="Terapkan Filter">
                            <i data-feather="filter"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Mutations Table -->
    <div class="col-12">
        <div class="card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="thead-light">
                            <tr>
                                <th width="15%">Waktu & Tanggal</th>
                                <th>Produk</th>
                                <th width="12%" class="text-center">Tipe</th>
                                <th width="12%" class="text-right">Jumlah (pcs)</th>
                                <th width="15%" class="text-center">Sumber</th>
                                <th>Catatan / Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($mutations as $mutation)
                                @php
                                    $displayName = $mutation->product->name ?? 'Produk Dihapus';
                                    if ($mutation->product && $mutation->product->parent_id && $mutation->product->parent) {
                                        $displayName = $mutation->product->parent->name . ' - ' . $mutation->product->name;
                                    }

                                    // Resolve badge for type
                                    $typeBadgeClass = $mutation->type === 'in' ? 'badge-light-success' : 'badge-light-danger';
                                    $typeLabel = $mutation->type === 'in' ? 'Masuk (+)' : 'Keluar (-)';
                                    
                                    // Resolve source label
                                    $sourceLabel = match($mutation->reference_type) {
                                        'purchase' => 'Pembelian',
                                        'sale' => 'Penjualan',
                                        'adjustment' => 'Penyesuaian',
                                        'return' => 'Retur',
                                        'damage' => 'Kerusakan',
                                        'transfer' => 'Transfer',
                                        default => ucfirst($mutation->reference_type ?: 'Manual')
                                    };
                                    $sourceBadgeClass = match($mutation->reference_type) {
                                        'purchase' => 'badge-light-primary',
                                        'sale' => 'badge-light-info',
                                        'adjustment' => 'badge-light-warning',
                                        'return' => 'badge-light-success',
                                        'damage' => 'badge-light-danger',
                                        default => 'badge-light-secondary'
                                    };
                                @endphp
                                <tr>
                                    <!-- Time -->
                                    <td class="font-weight-bold text-dark">
                                        {{ $mutation->created_at ? $mutation->created_at->format('Y-m-d H:i') : '-' }}
                                    </td>
                                    <!-- Product -->
                                    <td>
                                        <div class="font-weight-bold text-dark">{{ $displayName }}</div>
                                        @if($mutation->product && $mutation->product->sku)
                                            <span class="small text-muted font-weight-bold text-monospace">{{ $mutation->product->sku }}</span>
                                        @endif
                                    </td>
                                    <!-- Type -->
                                    <td class="text-center">
                                        <span class="badge badge-pill {{ $typeBadgeClass }} font-weight-bold">{{ $typeLabel }}</span>
                                    </td>
                                    <!-- Quantity -->
                                    <td class="text-right font-weight-bolder text-dark">
                                        {{ number_format($mutation->quantity) }}
                                    </td>
                                    <!-- Source -->
                                    <td class="text-center">
                                        <span class="badge badge-pill {{ $sourceBadgeClass }} font-weight-bold">{{ $sourceLabel }}</span>
                                    </td>
                                    <!-- Notes -->
                                    <td>
                                        <div class="text-muted small font-italic">{{ $mutation->notes ?: '-' }}</div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center py-3 text-muted">
                                        <i data-feather="alert-circle" class="mr-25"></i> Tidak ada data riwayat mutasi stok.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="card-footer d-flex justify-content-end pb-0">
                    {{ $mutations->links() }}
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
