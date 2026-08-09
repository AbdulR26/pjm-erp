<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $reportTitle }} - {{ $storeName }}</title>
    <style>
        @page {
            margin: 12mm 15mm 15mm 15mm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 9pt;
            color: #2b2b2b;
            line-height: 1.3;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .logo-img {
            max-height: 50px;
            max-width: 180px;
        }
        .store-name {
            font-size: 16pt;
            font-weight: bold;
            color: #7367f0;
            margin: 0;
        }
        .store-info {
            font-size: 8.5pt;
            color: #666;
            margin: 2px 0 0 0;
        }
        .report-title-box {
            text-align: right;
        }
        .report-title {
            font-size: 14pt;
            font-weight: bold;
            color: #111;
            margin: 0;
            text-transform: uppercase;
        }
        .report-period {
            font-size: 9pt;
            color: #555;
            margin-top: 3px;
        }
        .divider {
            border-bottom: 2px solid #7367f0;
            margin-bottom: 12px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        table.data-table th {
            background-color: #f3f2f7;
            color: #4b4b4b;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8pt;
            padding: 7px 6px;
            border: 1px solid #d8d6de;
            text-align: left;
        }
        table.data-table td {
            padding: 6px;
            border: 1px solid #e9e7ef;
            font-size: 8.5pt;
        }
        table.data-table tr:nth-child(even) {
            background-color: #faf9fc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-weight-bold { font-weight: bold; }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7.5pt;
            font-weight: bold;
        }
        .badge-success { background-color: #28c76f; color: #fff; }
        .badge-warning { background-color: #ff9f43; color: #fff; }
        .badge-danger  { background-color: #ea5455; color: #fff; }
        .badge-info    { background-color: #00cfe8; color: #fff; }
        .badge-secondary { background-color: #82868b; color: #fff; }

        .footer-info {
            margin-top: 15px;
            font-size: 8pt;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <table class="header-table">
        <tr>
            <td style="width: 55%;">
                @if($logoBase64)
                    <img src="{{ $logoBase64 }}" class="logo-img" alt="Logo">
                @else
                    <h1 class="store-name">{{ $storeName }}</h1>
                @endif
                <p class="store-info">
                    <strong>{{ $storeName }}</strong><br>
                    {{ $storeAddress ?: 'Alamat Toko Utama' }}<br>
                    Telp: {{ $storePhone ?: '-' }} | Email: {{ $storeEmail ?: '-' }}
                </p>
            </td>
            <td class="report-title-box" style="width: 45%;">
                <h2 class="report-title">{{ $reportTitle }}</h2>
                <p class="report-period">
                    Periode: <strong>{{ \Illuminate\Support\Carbon::parse($startDate)->format('d/m/Y') }}</strong> s/d <strong>{{ \Illuminate\Support\Carbon::parse($endDate)->format('d/m/Y') }}</strong>
                </p>
            </td>
        </tr>
    </table>

    <div class="divider"></div>

    <!-- Data Tables per Report Type -->
    @if($reportType === 'product')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;" class="text-center">No</th>
                    <th>Nama Produk</th>
                    <th style="width: 120px;">Kategori</th>
                    <th style="width: 90px;" class="text-center">Jumlah Varian</th>
                    <th style="width: 80px;" class="text-center">Total Terjual</th>
                    <th style="width: 90px;" class="text-center">Badge Promo</th>
                    <th style="width: 100px;" class="text-center">Tanggal Input</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reportData as $index => $prod)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td class="font-weight-bold">{{ $prod->name }}</td>
                        <td>{{ $prod->categories->pluck('name')->join(', ') ?: '-' }}</td>
                        <td class="text-center">{{ $prod->variants->count() }} Varian</td>
                        <td class="text-center font-weight-bold">{{ number_format($prod->sold_count ?? 0) }}</td>
                        <td class="text-center">{{ $prod->badge ?: '-' }}</td>
                        <td class="text-center">{{ $prod->created_at ? $prod->created_at->format('d/m/Y') : '-' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center">Tidak ada data produk pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

    @elseif($reportType === 'top_product')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 40px;" class="text-center">Rank</th>
                    <th>Nama Produk</th>
                    <th style="width: 140px;">Kategori</th>
                    <th style="width: 120px;" class="text-center">Total Qty Terjual</th>
                    <th style="width: 150px;" class="text-right">Total Omset (Pendapatan)</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reportData as $index => $item)
                    <tr>
                        <td class="text-center font-weight-bold">#{{ $index + 1 }}</td>
                        <td class="font-weight-bold">{{ $item->product_name }}</td>
                        <td>{{ $item->category_name ?: '-' }}</td>
                        <td class="text-center font-weight-bold" style="color: #7367f0;">{{ number_format($item->total_qty_sold) }} unit</td>
                        <td class="text-right font-weight-bold text-success">Rp {{ number_format($item->total_revenue, 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="text-center">Tidak ada data penjualan produk terlaris pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

    @elseif($reportType === 'stock')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;" class="text-center">No</th>
                    <th style="width: 110px;">SKU Varian</th>
                    <th>Nama Produk Utama</th>
                    <th>Varian</th>
                    <th style="width: 120px;" class="text-right">Harga</th>
                    <th style="width: 80px;" class="text-center">Sisa Stok</th>
                    <th style="width: 100px;" class="text-center">Status Stok</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reportData as $index => $v)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td style="font-family: monospace;">{{ $v->sku ?: '-' }}</td>
                        <td class="font-weight-bold">{{ $v->parent ? $v->parent->name : $v->name }}</td>
                        <td>{{ $v->parent ? $v->name : 'Standar' }}</td>
                        <td class="text-right">Rp {{ number_format($v->price, 0, ',', '.') }}</td>
                        <td class="text-center font-weight-bold {{ $v->stock <= 5 ? 'text-danger' : '' }}">{{ $v->stock }}</td>
                        <td class="text-center">
                            @if($v->stock <= 0)
                                <span class="badge badge-danger">Habis</span>
                            @elseif($v->stock <= 5)
                                <span class="badge badge-warning">Hampir Habis</span>
                            @else
                                <span class="badge badge-success">Aman</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center">Tidak ada data stok varian produk.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

    @elseif($reportType === 'order')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;" class="text-center">No</th>
                    <th style="width: 90px;">Tanggal</th>
                    <th style="width: 110px;">No. Order</th>
                    <th>Pelanggan</th>
                    <th style="width: 100px;" class="text-right">Subtotal</th>
                    <th style="width: 80px;" class="text-right">Ongkir</th>
                    <th style="width: 100px;" class="text-right">Grand Total</th>
                    <th style="width: 90px;" class="text-center">Status Transaksi</th>
                </tr>
            </thead>
            <tbody>
                @php $totalGrand = 0; @endphp
                @forelse($reportData as $index => $order)
                    @php $totalGrand += $order->grand_total; @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $order->created_at ? $order->created_at->format('d/m/Y H:i') : '-' }}</td>
                        <td class="font-weight-bold">#{{ $order->order_number }}</td>
                        <td>{{ $order->customer->name ?? '-' }}</td>
                        <td class="text-right">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</td>
                        <td class="text-right font-weight-bold">Rp {{ number_format($order->grand_total, 0, ',', '.') }}</td>
                        <td class="text-center">
                            <span class="badge badge-info">{{ $order->status->name ?? 'Pending' }}</span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center">Tidak ada transaksi order pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
            @if(count($reportData) > 0)
                <tfoot>
                    <tr style="background-color: #eae8f5; font-weight: bold;">
                        <td colspan="6" class="text-right">TOTAL PENDAPATAN (GRAND TOTAL):</td>
                        <td class="text-right font-weight-bold" style="color: #7367f0;">Rp {{ number_format($totalGrand, 0, ',', '.') }}</td>
                        <td></td>
                    </tr>
                </tfoot>
            @endif
        </table>

    @elseif($reportType === 'retur')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;" class="text-center">No</th>
                    <th style="width: 90px;">Tanggal</th>
                    <th style="width: 100px;">No. Retur</th>
                    <th style="width: 100px;">No. Order</th>
                    <th>Pelanggan</th>
                    <th>Alasan Pengembalian</th>
                    <th style="width: 110px;" class="text-right">Total Refund</th>
                    <th style="width: 90px;" class="text-center">Status Retur</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reportData as $index => $retur)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $retur->created_at ? $retur->created_at->format('d/m/Y H:i') : '-' }}</td>
                        <td class="font-weight-bold">{{ $retur->return_number }}</td>
                        <td>#{{ $retur->order->order_number ?? $retur->order_id }}</td>
                        <td>{{ $retur->order->customer->name ?? '-' }}</td>
                        <td>{{ str_replace('_', ' ', $retur->reason_type) }}</td>
                        <td class="text-right font-weight-bold text-danger">Rp {{ number_format($retur->total_refund_amount, 0, ',', '.') }}</td>
                        <td class="text-center">
                            <span class="badge badge-secondary">{{ $retur->status }}</span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center">Tidak ada pengajuan retur pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

    @elseif($reportType === 'customer')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;" class="text-center">No</th>
                    <th style="width: 90px;">Tgl Daftar</th>
                    <th>Nama Pelanggan</th>
                    <th>Email</th>
                    <th style="width: 110px;">No. Telepon</th>
                    <th style="width: 80px;" class="text-center">Status Akun</th>
                    <th style="width: 80px;" class="text-center">Total Order</th>
                    <th style="width: 120px;" class="text-right">Total Belanja</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reportData as $index => $cust)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $cust->created_at ? $cust->created_at->format('d/m/Y') : '-' }}</td>
                        <td class="font-weight-bold">{{ $cust->name }}</td>
                        <td>{{ $cust->email }}</td>
                        <td>{{ $cust->phone ?: '-' }}</td>
                        <td class="text-center">
                            @if($cust->is_active)
                                <span class="badge badge-success">Aktif</span>
                            @else
                                <span class="badge badge-secondary">Belum Aktif</span>
                            @endif
                        </td>
                        <td class="text-center font-weight-bold">{{ $cust->orders_count }} kali</td>
                        <td class="text-right font-weight-bold">Rp {{ number_format($cust->orders_sum_grand_total ?? 0, 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center">Tidak ada data pelanggan terdaftar pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

    @elseif($reportType === 'pengiriman')
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;" class="text-center">No</th>
                    <th style="width: 90px;">Tgl Kirim</th>
                    <th style="width: 100px;">No. Order</th>
                    <th>Pelanggan</th>
                    <th style="width: 130px;">Ekspedisi & Layanan</th>
                    <th style="width: 120px;">No. Resi (Waybill)</th>
                    <th style="width: 90px;" class="text-right">Ongkos Kirim</th>
                    <th style="width: 90px;" class="text-center">Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reportData as $index => $ship)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $ship->created_at ? $ship->created_at->format('d/m/Y H:i') : '-' }}</td>
                        <td class="font-weight-bold">#{{ $ship->order->order_number ?? $ship->order_id }}</td>
                        <td>{{ $ship->order->customer->name ?? '-' }}</td>
                        <td>
                            <strong style="text-transform: uppercase;">{{ $ship->courier_company }}</strong><br>
                            <small>{{ $ship->courier_service_name ?: $ship->courier_service }}</small>
                        </td>
                        <td style="font-family: monospace;">{{ $ship->waybill_id ?: ($ship->biteship_order_id ?: '-') }}</td>
                        <td class="text-right font-weight-bold">Rp {{ number_format($ship->cost, 0, ',', '.') }}</td>
                        <td class="text-center">
                            <span class="badge badge-info">{{ str_replace('_', ' ', $ship->status) }}</span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="text-center">Tidak ada data pengiriman pada periode ini.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif

    <!-- Footer Timestamp -->
    <div class="footer-info">
        <table style="width: 100%;">
            <tr>
                <td>Laporan dicetak otomatis oleh Sistem ERP <strong>{{ $storeName }}</strong>.</td>
                <td style="text-align: right;">Waktu Cetak: <strong>{{ $generatedAt }}</strong></td>
            </tr>
        </table>
    </div>

</body>
</html>
