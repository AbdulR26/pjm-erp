@extends('layouts.app')
@section('title', 'Dashboard ERP')

@section('content')
<div class="row">

    <!-- Glowing Metric Cards Section -->
    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card metric-card border-0 shadow-sm overflow-hidden" style="border-radius: 20px; background: #fff;">
            <div class="card-body p-2 position-relative">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-secondary font-weight-bold uppercase small" style="letter-spacing: 0.5px;">OMZET SUKSES</span>
                    <span class="metric-icon-bg bg-light-success text-success">
                        <i data-feather="trending-up"></i>
                    </span>
                </div>
                <h2 class="font-weight-bolder text-dark mb-50" style="font-size: 1.6rem; letter-spacing: -0.5px;">Rp {{ number_format($totalSales, 0, ',', '.') }}</h2>
                <div class="d-flex align-items-center text-success small font-weight-bold">
                    <i data-feather="check" class="mr-25" style="width: 14px; height: 14px;"></i>
                    <span>Telah diterima di kasir</span>
                </div>
                <div class="accent-line bg-success"></div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card metric-card border-0 shadow-sm overflow-hidden" style="border-radius: 20px; background: #fff;">
            <div class="card-body p-2 position-relative">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-secondary font-weight-bold uppercase small" style="letter-spacing: 0.5px;">PESANAN BARU</span>
                    <span class="metric-icon-bg bg-light-primary text-primary">
                        <i data-feather="shopping-bag"></i>
                    </span>
                </div>
                <h2 class="font-weight-bolder text-dark mb-50" style="font-size: 1.6rem; letter-spacing: -0.5px;">{{ number_format($orderCount) }}</h2>
                <div class="d-flex align-items-center text-primary small font-weight-bold">
                    <span class="badge badge-light-primary mr-50" style="padding: 2px 6px;">{{ $pendingOrderCount }} PENDING</span>
                    <span>Butuh verifikasi</span>
                </div>
                <div class="accent-line bg-primary"></div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card metric-card border-0 shadow-sm overflow-hidden" style="border-radius: 20px; background: #fff;">
            <div class="card-body p-2 position-relative">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-secondary font-weight-bold uppercase small" style="letter-spacing: 0.5px;">KATALOG PRODUK</span>
                    <span class="metric-icon-bg bg-light-info text-info">
                        <i data-feather="box"></i>
                    </span>
                </div>
                <h2 class="font-weight-bolder text-dark mb-50" style="font-size: 1.6rem; letter-spacing: -0.5px;">{{ number_format($productCount) }}</h2>
                <div class="d-flex align-items-center text-info small font-weight-bold">
                    <i data-feather="layers" class="mr-25" style="width: 14px; height: 14px;"></i>
                    <span>Tersedia dalam katalog</span>
                </div>
                <div class="accent-line bg-info"></div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-sm-6 col-12 mb-2">
        <div class="card metric-card border-0 shadow-sm overflow-hidden" style="border-radius: 20px; background: #fff;">
            <div class="card-body p-2 position-relative">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-secondary font-weight-bold uppercase small" style="letter-spacing: 0.5px;">MITRA SUPPLIER</span>
                    <span class="metric-icon-bg bg-light-warning text-warning">
                        <i data-feather="truck"></i>
                    </span>
                </div>
                <h2 class="font-weight-bolder text-dark mb-50" style="font-size: 1.6rem; letter-spacing: -0.5px;">{{ number_format($customerCount) }}</h2>
                <div class="d-flex align-items-center text-warning small font-weight-bold">
                    <span class="badge badge-light-warning mr-50" style="padding: 2px 6px;">{{ $poCount }} PO</span>
                    <span>Telah diterbitkan</span>
                </div>
                <div class="accent-line bg-warning"></div>
            </div>
        </div>
    </div>

    <!-- Double Column Main Dashboard Worksheets -->
    <div class="col-lg-7 col-12 mb-2">
        <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 20px; height: 100%;">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-15 border-bottom border-light">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(115, 103, 240, 0.08); padding: 8px; border-radius: 10px;" class="mr-75">
                        <i data-feather="shopping-cart" class="text-primary" style="width: 18px; height: 18px;"></i>
                    </div>
                    <div>
                        <h5 class="font-weight-bolder text-dark mb-0">Transaksi Pesanan Pelanggan</h5>
                        <p class="text-muted small mb-0">Pesanan terbaru yang dilakukan oleh customer e-commerce</p>
                    </div>
                </div>
                <a href="{{ route('admin.orders.index') }}" class="btn btn-sm btn-outline-primary font-weight-bold" style="border-radius: 8px; padding: 6px 12px;">Daftar Pesanan &rarr;</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0" style="vertical-align: middle;">
                        <thead class="bg-light-2">
                            <tr>
                                <th class="border-0 font-weight-bold text-secondary text-xs uppercase" style="padding: 12px 18px;">No. Order</th>
                                <th class="border-0 font-weight-bold text-secondary text-xs uppercase">Pelanggan</th>
                                <th class="border-0 font-weight-bold text-secondary text-xs uppercase">Total Pembayaran</th>
                                <th class="border-0 font-weight-bold text-secondary text-xs uppercase text-center" style="width: 130px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentOrders as $order)
                                <tr>
                                    <td style="padding: 15px 18px; vertical-align: middle;">
                                        <a href="{{ url('admin/orders/' . $order->id . '/edit') }}" class="font-weight-bolder text-primary">
                                            {{ $order->order_number }}
                                        </a>
                                    </td>
                                    <td style="vertical-align: middle;">
                                        <div class="d-flex align-items-center">
                                            <div class="avatar-letter mr-75">
                                                {{ strtoupper(substr($order->customer->name ?? '-', 0, 1)) }}
                                            </div>
                                            <div>
                                                <span class="font-weight-bolder text-dark d-block" style="line-height: 1.2;">{{ $order->customer->name ?? '-' }}</span>
                                                <small class="text-muted">{{ $order->customer->phone ?? '-' }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="font-weight-bolder text-dark" style="vertical-align: middle;">
                                        Rp {{ number_format($order->grand_total, 0, ',', '.') }}
                                    </td>
                                    <td class="text-center" style="vertical-align: middle;">
                                        @php
                                            $slug = $order->status->slug ?? 'pending';
                                            $badge = 'secondary';
                                            if ($slug === 'processing') $badge = 'info';
                                            elseif ($slug === 'shipping') $badge = 'warning';
                                            elseif ($slug === 'completed') $badge = 'success';
                                            elseif (in_array($slug, ['cancelled', 'failed'])) $badge = 'danger';
                                        @endphp
                                        <span class="badge badge-pill badge-light-{{ $badge }} py-50 px-1 font-weight-bold text-xs uppercase">
                                            {{ $order->status->name ?? 'Pending' }}
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted py-4">Belum ada pesanan terbaru.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Purchase Orders & Stock Column -->
    <div class="col-lg-5 col-12 mb-2">
        <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 20px; height: 100%;">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-15 border-bottom border-light">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(255, 159, 67, 0.08); padding: 8px; border-radius: 10px;" class="mr-75">
                        <i data-feather="file-text" class="text-warning" style="width: 18px; height: 18px;"></i>
                    </div>
                    <div>
                        <h5 class="font-weight-bolder text-dark mb-0">Aktivitas Pemasok (PO)</h5>
                        <p class="text-muted small mb-0">Log pengadaan dan Purchase Order terakhir</p>
                    </div>
                </div>
                <a href="{{ route('admin.purchase-orders.index') }}" class="btn btn-sm btn-outline-warning font-weight-bold" style="border-radius: 8px; padding: 6px 12px;">Daftar PO &rarr;</a>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0" style="vertical-align: middle;">
                        <thead class="bg-light-2">
                            <tr>
                                <th class="border-0 font-weight-bold text-secondary text-xs uppercase" style="padding: 12px 18px;">No. PO</th>
                                <th class="border-0 font-weight-bold text-secondary text-xs uppercase">Supplier</th>
                                <th class="border-0 font-weight-bold text-secondary text-xs uppercase text-center" style="width: 125px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentPOs as $po)
                                <tr>
                                    <td style="padding: 15px 18px; vertical-align: middle;">
                                        <a href="{{ url('admin/purchase-orders/' . $po->id . '/edit') }}" class="font-weight-bolder text-primary">
                                            {{ $po->po_number }}
                                        </a>
                                    </td>
                                    <td style="vertical-align: middle;">
                                        <span class="font-weight-bolder text-dark d-block" style="line-height: 1.2;">{{ $po->supplier->company_name ?? $po->supplier->name ?? '-' }}</span>
                                        <small class="text-muted">Total: Rp {{ number_format($po->grand_total, 0, ',', '.') }}</small>
                                    </td>
                                    <td class="text-center" style="vertical-align: middle;">
                                        @php
                                            $status = strtolower($po->status);
                                            $badge = 'secondary';
                                            if ($status === 'draft') $badge = 'secondary';
                                            elseif ($status === 'ordered') $badge = 'info';
                                            elseif ($status === 'received') $badge = 'success';
                                            elseif ($status === 'cancelled') $badge = 'danger';
                                        @endphp
                                        <span class="badge badge-pill badge-light-{{ $badge }} py-50 px-75 font-weight-bold text-xs uppercase">
                                            {{ $status }}
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-center text-muted py-4">Belum ada PO diterbitkan.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('css')
    <style>
        /* Pulse System indicator */
        .pulse-dot {
            width: 8px;
            height: 8px;
            background-color: #28c76f;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 0 0 rgba(40, 199, 111, 0.7);
            animation: pulse-green 2s infinite;
        }

        @keyframes pulse-green {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(40, 199, 111, 0.7);
            }
            70% {
                transform: scale(1);
                box-shadow: 0 0 0 6px rgba(40, 199, 111, 0);
            }
            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(40, 199, 111, 0);
            }
        }

        /* Metric Cards hover transitions */
        .metric-card {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
        }
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(115, 103, 240, 0.08) !important;
        }
        .accent-line {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            border-radius: 0 0 20px 20px;
            opacity: 0.85;
        }

        .metric-icon-bg {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        /* Letter Avatar */
        .avatar-letter {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background-color: #f3f2f7;
            color: #7367f0;
            font-weight: 700;
            font-size: 1.05rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #ebe9f1;
        }

        /* Additional design alignments */
        .bg-light-2 {
            background-color: #fafafc !important;
        }
        .border-light {
            border-color: #f3f2f7 !important;
        }
    </style>
@endpush
