@extends('layouts.app')
@section('title', 'Laporan Sistem')

@section('content')
<div class="row">
    <!-- Header -->
    <div class="col-12 mb-2">
        <div class="card bg-primary text-white mb-0" style="background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7)) !important; border-radius: 8px;">
            <div class="card-header d-flex align-items-center py-2">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">
                        <i data-feather="file-text" style="width: 24px; height: 24px; color: white;"></i>
                    </div>
                    <div class="ml-1">
                        <h4 class="card-title font-weight-bold text-white mb-0">Laporan & Rekapitulasi Data</h4>
                        <p class="text-white-50 small mb-0">Pilih periode rentang tanggal dan jenis laporan untuk memfilter data serta mengunduh dokumen PDF resmi.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="col-12">
        <div class="card">
            <div class="card-header border-bottom">
                <h5 class="card-title font-weight-bold text-primary mb-0"><i data-feather="filter" class="mr-50"></i>Filter Laporan</h5>
            </div>
            <div class="card-body pt-2">
                <form action="{{ route('admin.reports.index') }}" method="GET" id="reportFilterForm">
                    <div class="row align-items-end">
                        <div class="col-md-3 form-group">
                            <label for="start_date" class="font-weight-bold">Dari Tanggal</label>
                            <input type="date" id="start_date" name="start_date" class="form-control" value="{{ $startDate }}" required>
                        </div>

                        <div class="col-md-3 form-group">
                            <label for="end_date" class="font-weight-bold">Sampai Tanggal</label>
                            <input type="date" id="end_date" name="end_date" class="form-control" value="{{ $endDate }}" required>
                        </div>

                        <div class="col-md-3 form-group">
                            <label for="report_type" class="font-weight-bold">Jenis Laporan</label>
                            <select id="report_type" name="report_type" class="form-control font-weight-bold">
                                <option value="order" {{ $reportType === 'order' ? 'selected' : '' }}>🛒 Laporan Penjualan & Order</option>
                                <option value="product" {{ $reportType === 'product' ? 'selected' : '' }}>📦 Laporan Master Produk</option>
                                <option value="top_product" {{ $reportType === 'top_product' ? 'selected' : '' }}>🔥 Laporan Produk Terlaris</option>
                                <option value="stock" {{ $reportType === 'stock' ? 'selected' : '' }}>📊 Laporan Stok Varian Produk</option>
                                <option value="retur" {{ $reportType === 'retur' ? 'selected' : '' }}>🔄 Laporan Retur Pesanan</option>
                                <option value="customer" {{ $reportType === 'customer' ? 'selected' : '' }}>👥 Laporan Data Pelanggan</option>
                                <option value="pengiriman" {{ $reportType === 'pengiriman' ? 'selected' : '' }}>🚚 Laporan Pengiriman (Shipments)</option>
                            </select>
                        </div>

                        <div class="col-md-3 form-group d-flex">
                            <button type="submit" class="btn btn-primary font-weight-bold mr-1 flex-grow-1">
                                <i data-feather="search" class="mr-25"></i> Filter Data
                            </button>
                            <button type="submit" formaction="{{ route('admin.reports.export-pdf') }}" target="_blank" class="btn btn-danger font-weight-bold">
                                <i data-feather="file-text" class="mr-25"></i> Export PDF
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Data Table Card Preview -->
    <div class="col-12 mt-1">
        <div class="card border">
            <div class="card-header border-bottom d-flex justify-content-between align-items-center">
                <h5 class="card-title font-weight-bold text-primary mb-0">
                    <i data-feather="list" class="mr-50"></i>Pratinjau Data Laporan
                </h5>
                <span class="badge badge-light-primary font-weight-bold">
                    Periode: {{ \Illuminate\Support\Carbon::parse($startDate)->format('d/m/Y') }} - {{ \Illuminate\Support\Carbon::parse($endDate)->format('d/m/Y') }}
                </span>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    @if($reportType === 'product')
                        <table class="table table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th width="5%">No</th>
                                    <th>Nama Produk</th>
                                    <th>Kategori</th>
                                    <th class="text-center">Jumlah Varian</th>
                                    <th class="text-center">Total Terjual</th>
                                    <th class="text-center">Badge Promo</th>
                                    <th class="text-center">Tanggal Input</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reportData as $index => $prod)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td class="font-weight-bold text-primary">{{ $prod->name }}</td>
                                        <td>{{ $prod->categories->pluck('name')->join(', ') ?: '-' }}</td>
                                        <td class="text-center"><span class="badge badge-light-info">{{ $prod->variants->count() }} Varian</span></td>
                                        <td class="text-center font-weight-bold">{{ number_format($prod->sold_count ?? 0) }}</td>
                                        <td class="text-center">{{ $prod->badge ?: '-' }}</td>
                                        <td class="text-center small">{{ $prod->created_at ? $prod->created_at->format('d/m/Y H:i') : '-' }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="7" class="text-center py-2 text-muted">Tidak ada data produk pada rentang tanggal ini.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>

                    @elseif($reportType === 'top_product')
                        <table class="table table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th width="8%" class="text-center">Peringkat</th>
                                    <th>Nama Produk</th>
                                    <th>Kategori</th>
                                    <th width="20%" class="text-center">Total Terjual</th>
                                    <th width="25%" class="text-right">Total Omset</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reportData as $index => $item)
                                    <tr>
                                        <td class="text-center font-weight-bold text-primary">#{{ $index + 1 }}</td>
                                        <td class="font-weight-bold">{{ $item->product_name }}</td>
                                        <td>{{ $item->category_name ?: '-' }}</td>
                                        <td class="text-center"><span class="badge badge-light-primary font-weight-bold">{{ number_format($item->total_qty_sold) }} Unit</span></td>
                                        <td class="text-right font-weight-bold text-success">Rp {{ number_format($item->total_revenue, 0, ',', '.') }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="text-center py-2 text-muted">Belum ada data penjualan produk terlaris pada rentang tanggal ini.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>

                    @elseif($reportType === 'stock')
                        <table class="table table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th width="5%">No</th>
                                    <th>SKU Varian</th>
                                    <th>Nama Produk Utama</th>
                                    <th>Varian</th>
                                    <th class="text-right">Harga</th>
                                    <th class="text-center">Sisa Stok</th>
                                    <th class="text-center">Status Stok</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reportData as $index => $v)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td class="text-monospace font-weight-bold">{{ $v->sku ?: '-' }}</td>
                                        <td class="font-weight-bold">{{ $v->parent ? $v->parent->name : $v->name }}</td>
                                        <td>{{ $v->parent ? $v->name : 'Standar' }}</td>
                                        <td class="text-right">Rp {{ number_format($v->price, 0, ',', '.') }}</td>
                                        <td class="text-center font-weight-bold {{ $v->stock <= 5 ? 'text-danger' : '' }}">{{ $v->stock }}</td>
                                        <td class="text-center">
                                            @if($v->stock <= 0)
                                                <span class="badge badge-pill badge-light-danger font-weight-bold">Habis</span>
                                            @elseif($v->stock <= 5)
                                                <span class="badge badge-pill badge-light-warning font-weight-bold">Hampir Habis</span>
                                            @else
                                                <span class="badge badge-pill badge-light-success font-weight-bold">Aman</span>
                                            @endif
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="7" class="text-center py-2 text-muted">Tidak ada data stok varian.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>

                    @elseif($reportType === 'order')
                        <table class="table table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th width="5%">No</th>
                                    <th>Tanggal</th>
                                    <th>No. Order</th>
                                    <th>Pelanggan</th>
                                    <th class="text-right">Subtotal</th>
                                    <th class="text-right">Ongkir</th>
                                    <th class="text-right">Grand Total</th>
                                    <th class="text-center">Status Order</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reportData as $index => $order)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td class="small">{{ $order->created_at ? $order->created_at->format('d/m/Y H:i') : '-' }}</td>
                                        <td class="font-weight-bold">#{{ $order->order_number }}</td>
                                        <td>{{ $order->customer->name ?? '-' }}</td>
                                        <td class="text-right">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
                                        <td class="text-right">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</td>
                                        <td class="text-right font-weight-bold text-primary">Rp {{ number_format($order->grand_total, 0, ',', '.') }}</td>
                                        <td class="text-center">
                                            <span class="badge badge-pill badge-light-info font-weight-bold">{{ $order->status->name ?? 'Pending' }}</span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="8" class="text-center py-2 text-muted">Tidak ada data transaksi order pada periode ini.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>

                    @elseif($reportType === 'retur')
                        <table class="table table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th width="5%">No</th>
                                    <th>Tanggal</th>
                                    <th>No. Retur</th>
                                    <th>No. Order</th>
                                    <th>Pelanggan</th>
                                    <th>Alasan Retur</th>
                                    <th class="text-right">Total Refund</th>
                                    <th class="text-center">Status Retur</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reportData as $index => $retur)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td class="small">{{ $retur->created_at ? $retur->created_at->format('d/m/Y H:i') : '-' }}</td>
                                        <td class="font-weight-bold text-danger">{{ $retur->return_number }}</td>
                                        <td class="font-weight-bold">#{{ $retur->order->order_number ?? $retur->order_id }}</td>
                                        <td>{{ $retur->order->customer->name ?? '-' }}</td>
                                        <td>{{ str_replace('_', ' ', $retur->reason_type) }}</td>
                                        <td class="text-right font-weight-bold text-danger">Rp {{ number_format($retur->total_refund_amount, 0, ',', '.') }}</td>
                                        <td class="text-center">
                                            <span class="badge badge-pill badge-light-warning font-weight-bold">{{ $retur->status }}</span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="8" class="text-center py-2 text-muted">Tidak ada pengajuan retur pada periode ini.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>

                    @elseif($reportType === 'customer')
                        <table class="table table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th width="5%">No</th>
                                    <th>Tgl Daftar</th>
                                    <th>Nama Pelanggan</th>
                                    <th>Email</th>
                                    <th>No. Telepon</th>
                                    <th class="text-center">Status Akun</th>
                                    <th class="text-center">Jumlah Order</th>
                                    <th class="text-right">Total Belanja</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reportData as $index => $cust)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td class="small">{{ $cust->created_at ? $cust->created_at->format('d/m/Y') : '-' }}</td>
                                        <td class="font-weight-bold text-primary">{{ $cust->name }}</td>
                                        <td>{{ $cust->email }}</td>
                                        <td>{{ $cust->phone ?: '-' }}</td>
                                        <td class="text-center">
                                            @if($cust->is_active)
                                                <span class="badge badge-pill badge-light-success font-weight-bold">Aktif</span>
                                            @else
                                                <span class="badge badge-pill badge-light-secondary font-weight-bold">Belum Aktif</span>
                                            @endif
                                        </td>
                                        <td class="text-center font-weight-bold">{{ $cust->orders_count }} kali</td>
                                        <td class="text-right font-weight-bold text-success">Rp {{ number_format($cust->orders_sum_grand_total ?? 0, 0, ',', '.') }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="8" class="text-center py-2 text-muted">Tidak ada pelanggan terdaftar pada periode ini.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>

                    @elseif($reportType === 'pengiriman')
                        <table class="table table-hover mb-0">
                            <thead class="thead-light">
                                <tr>
                                    <th width="5%">No</th>
                                    <th>Tgl Kirim</th>
                                    <th>No. Order</th>
                                    <th>Pelanggan</th>
                                    <th>Ekspedisi & Layanan</th>
                                    <th>No. Resi (Waybill)</th>
                                    <th class="text-right">Ongkir</th>
                                    <th class="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($reportData as $index => $ship)
                                    <tr>
                                        <td>{{ $index + 1 }}</td>
                                        <td class="small">{{ $ship->created_at ? $ship->created_at->format('d/m/Y H:i') : '-' }}</td>
                                        <td class="font-weight-bold">#{{ $ship->order->order_number ?? $ship->order_id }}</td>
                                        <td>{{ $ship->order->customer->name ?? '-' }}</td>
                                        <td>
                                            <span class="badge badge-light-primary text-uppercase">{{ $ship->courier_company }}</span>
                                            <small class="d-block text-muted">{{ $ship->courier_service_name ?: $ship->courier_service }}</small>
                                        </td>
                                        <td class="text-monospace font-weight-bold">{{ $ship->waybill_id ?: ($ship->biteship_order_id ?: '-') }}</td>
                                        <td class="text-right font-weight-bold text-success">Rp {{ number_format($ship->cost, 0, ',', '.') }}</td>
                                        <td class="text-center">
                                            <span class="badge badge-pill badge-light-info font-weight-bold">{{ str_replace('_', ' ', $ship->status) }}</span>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="8" class="text-center py-2 text-muted">Tidak ada data pengiriman pada periode ini.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
