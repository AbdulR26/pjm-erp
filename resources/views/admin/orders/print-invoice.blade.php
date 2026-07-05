<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Print Invoices</title>
    <style>
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #334155;
            margin: 0;
            padding: 30px;
            font-size: 14px;
            line-height: 1.5;
            background: #fff;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            page-break-after: always;
            break-after: page;
        }
        .invoice-box:last-child {
            page-break-after: avoid;
            break-after: avoid;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .logo-title {
            font-size: 24px;
            font-weight: 800;
            color: #dc2626;
            letter-spacing: -0.5px;
            margin: 0;
        }
        .store-sub {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            font-weight: 700;
            margin-top: 2px;
        }
        .store-info {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
            line-height: 1.4;
        }
        .invoice-title {
            font-size: 28px;
            font-weight: 900;
            text-align: right;
            color: #1e293b;
            margin: 0;
            text-transform: uppercase;
        }
        .invoice-meta {
            text-align: right;
            font-size: 13px;
            color: #64748b;
            margin-top: 8px;
        }
        .meta-item {
            margin-bottom: 3px;
        }
        .meta-item span {
            font-weight: 750;
            color: #1e293b;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 800;
            border-radius: 4px;
            text-transform: uppercase;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
        .badge-paid { background: #28c76f; color: #fff; border: 1px solid #28c76f; }
        .badge-unpaid { background: #ea5455; color: #fff; border: 1px solid #ea5455; }
        .badge-pending { background: #ff9f43; color: #fff; border: 1px solid #ff9f43; }
        .badge-shipping { background: #7367f0; color: #fff; border: 1px solid #7367f0; }
        .badge-completed { background: #28c76f; color: #fff; border: 1px solid #28c76f; }
        
        @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; }
            .badge-paid { color: #15803d !important; border: 1px solid #15803d !important; background: transparent !important; }
            .badge-unpaid { color: #b91c1c !important; border: 1px solid #b91c1c !important; background: transparent !important; }
            .badge-pending { color: #a16207 !important; border: 1px solid #a16207 !important; background: transparent !important; }
            .badge-shipping { color: #4338ca !important; border: 1px solid #4338ca !important; background: transparent !important; }
            .badge-completed { color: #15803d !important; border: 1px solid #15803d !important; background: transparent !important; }
        }
        .addresses-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        .addresses-table td {
            width: 50%;
            vertical-align: top;
        }
        .section-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            margin-bottom: 8px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 4px;
            margin-right: 15px;
        }
        .address-box {
            font-size: 13px;
            color: #475569;
            line-height: 1.5;
            margin-right: 15px;
        }
        .address-name {
            font-weight: 700;
            color: #1e293b;
            font-size: 14px;
            margin-bottom: 4px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background: #f8fafc;
            border-bottom: 2px solid #cbd5e1;
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .summary-table {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
            font-size: 13px;
        }
        .summary-table td {
            padding: 6px 12px;
        }
        .summary-table tr.total-row {
            font-size: 16px;
            font-weight: 950;
            color: #1e293b;
            border-top: 2px solid #cbd5e1;
        }
        .summary-table tr.total-row td {
            padding-top: 12px;
            color: #dc2626;
        }
        
        .footer {
            margin-top: 80px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 500;
        }
        
        @media print {
            body { padding: 0; }
            @page { margin: 1.5cm; }
        }
    </style>
</head>
<body>

@foreach($orders as $order)
    @php
        $paymentStatus = strtoupper($order->payment->status ?? 'UNPAID');
        $paymentMethod = $order->paymentMethod ?? ($order->payment->payment_type ?? 'Midtrans / Online');
    @endphp
    <div class="invoice-box">
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td>
                    <div class="logo-title">PUTRI JAYA MOBIL</div>
                    <div class="store-sub">Premium E-Commerce</div>
                    <div class="store-info">
                        Jl. Raya Putri Jaya Mobil No. 1, Bekasi<br>
                        Telp: 0812-3456-7890<br>
                        Email: support@putrijayamobil.com
                    </div>
                </td>
                <td>
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-meta">
                        <div class="meta-item">No. Order: <span>{{ $order->order_number }}</span></div>
                        <div class="meta-item">Tanggal: <span>{{ $order->created_at ? $order->created_at->format('d-m-Y H:i') : '-' }}</span></div>
                        <div class="meta-item">Metode: <span>{{ $paymentMethod }}</span></div>
                        <div class="meta-item">Status Bayar: 
                            <span class="badge {{ $paymentStatus === 'PAID' ? 'badge-paid' : ($paymentStatus === 'PENDING' ? 'badge-pending' : 'badge-unpaid') }}">
                                {{ $paymentStatus }}
                            </span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Addresses -->
        <table class="addresses-table">
            <tr>
                <td>
                    <div class="section-title">DITAGIH KEPADA:</div>
                    <div class="address-box">
                        <div class="address-name">{{ $order->customer->name ?? '-' }}</div>
                        <div>Email: {{ $order->customer->email ?? '-' }}</div>
                        <div>Telp: {{ $order->customer->phone ?? '-' }}</div>
                    </div>
                </td>
                <td>
                    <div class="section-title">DIKIRIM KEPADA:</div>
                    <div class="address-box">
                        <div class="address-name">{{ $order->shipment->destination_contact_name ?? ($order->customer->name ?? '-') }}</div>
                        <div>Telp: {{ $order->shipment->destination_contact_phone ?? ($order->customer->phone ?? '-') }}</div>
                        <div>Alamat: {{ $order->shipment->destination_address ?? ($order->customer->address ?? '-') }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Items -->
        <table class="items-table">
            <thead>
                <tr>
                    <th class="text-center" style="width: 40px;">No</th>
                    <th class="text-left">Deskripsi Produk</th>
                    <th class="text-center" style="width: 80px;">Qty</th>
                    <th class="text-right" style="width: 140px;">Harga Satuan</th>
                    <th class="text-right" style="width: 140px;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <div class="font-bold">{{ $item->product_name }}</div>
                        <div class="text-xs text-gray-500">Varian: {{ $item->variant_name }} | SKU: {{ $item->sku }}</div>
                    </td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="text-right font-bold">Rp {{ number_format($item->total_price, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Pricing Summary -->
        <table class="summary-table">
            <tr>
                <td>Subtotal</td>
                <td class="text-right">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
            </tr>
            @if($order->discount > 0)
            <tr>
                <td style="color: #16a34a;">Diskon</td>
                <td class="text-right" style="color: #16a34a;">-Rp {{ number_format($order->discount, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr>
                <td>Ongkos Kirim</td>
                <td class="text-right">Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</td>
            </tr>
            <tr class="total-row">
                <td>Total Bayar</td>
                <td class="text-right">Rp {{ number_format($order->grand_total, 0, ',', '.') }}</td>
            </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
            Terima kasih telah berbelanja di Putri Jaya Mobil.<br>
            Jika Anda memiliki pertanyaan tentang invoice ini, silakan hubungi customer service kami.
        </div>
    </div>
@endforeach

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
