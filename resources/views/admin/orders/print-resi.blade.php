<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Print Labels</title>
    <style>
        body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: #000;
            margin: 0;
            padding: 15px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .label-box {
            width: 450px;
            background: #fff;
            border: 3px solid #000;
            padding: 15px;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
        }
        .label-box:last-child {
            page-break-after: avoid;
            break-after: avoid;
        }
        .label-header {
            border-bottom: 3px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .courier-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .courier-name {
            font-size: 28px;
            font-weight: 900;
            color: #000;
            text-transform: uppercase;
            letter-spacing: -1px;
        }
        .courier-service {
            font-size: 13px;
            font-weight: 800;
            background: #000;
            color: #fff;
            padding: 3px 8px;
            border-radius: 3px;
            text-transform: uppercase;
        }
        .store-logo {
            font-size: 11px;
            font-weight: 750;
            color: #475569;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .barcode-section {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
        }
        .barcode-img {
            max-width: 100%;
            height: 65px;
            margin: 4px 0;
        }
        .waybill-number {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 1px;
            margin: 2px 0 0 0;
        }
        .order-number {
            font-size: 11px;
            color: #475569;
            font-weight: 500;
        }
        .address-grid {
            display: flex;
            border-bottom: 3px solid #000;
            margin-bottom: 8px;
        }
        .address-col {
            width: 50%;
            padding: 6px 8px 10px 8px;
            font-size: 11px;
            line-height: 1.4;
            box-sizing: border-box;
        }
        .recipient-box {
            border-right: 2px dashed #000;
            padding-right: 12px;
        }
        .sender-box {
            padding-left: 12px;
        }
        .col-title {
            font-size: 10px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            margin-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
        }
        .name-bold {
            font-size: 13px;
            font-weight: 800;
            color: #000;
            margin-bottom: 2px;
        }
        .phone-bold {
            font-weight: 750;
            color: #000;
            margin-bottom: 4px;
        }
        .address-text {
            color: #1e293b;
        }
        .postal-code {
            margin-top: 6px;
            font-weight: 800;
            font-size: 10px;
            color: #000;
            border: 1px solid #000;
            display: inline-block;
            padding: 1px 5px;
            border-radius: 2px;
            text-transform: uppercase;
        }
        .packing-list {
            padding-top: 4px;
        }
        .packing-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 6px;
            color: #000;
        }
        .packing-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        .packing-table th {
            border-bottom: 1.5px solid #000;
            padding: 4px 6px;
            text-align: left;
            font-weight: 750;
            color: #000;
        }
        .packing-table td {
            border-bottom: 1px dashed #cbd5e1;
            padding: 6px;
            vertical-align: top;
        }
        .text-center {
            text-align: center;
        }
        .font-bold {
            font-weight: bold;
        }
        
        @media print {
            body { background: #fff; padding: 0; }
            .label-box { border: 3px solid #000; box-shadow: none; }
            @page { margin: 0.5cm; }
        }
    </style>
</head>
<body>

@foreach($orders as $order)
    @php
        $shipment = $order->shipment;
    @endphp

    @if(!$shipment)
        <div class="label-box" style="height: 450px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 3px dashed #dc2626; color: #dc2626; background: #fff; margin-bottom: 20px; padding: 20px;">
            <h2 style="margin-bottom: 10px;">Pengiriman Belum Di-booking</h2>
            <p style="font-size: 16px; margin: 5px 0;">Order: <strong>{{ $order->order_number }}</strong></p>
            <p style="font-size: 14px; color: #64748b; text-align: center;">Silakan lakukan booking pengiriman terlebih dahulu di panel admin agar nomor resi tersedia.</p>
        </div>
    @else
        @php
            $courierName = strtoupper($shipment->courier_company);
            $courierService = strtoupper($shipment->courier_service_name ?? $shipment->courier_service);
            $waybill = $shipment->waybill_id ?? 'BELUM ADA RESI';
            
            $senderName = $shipment->origin_contact_name ?? 'Putri Jaya Mobil';
            $senderPhone = $shipment->origin_contact_phone ?? '0812-3456-7890';
            $senderAddress = $shipment->origin_address ?? 'Jl. Raya Putri Jaya Mobil No. 1, Bekasi';

            $receiverName = $shipment->destination_contact_name ?? ($order->customer->name ?? '-');
            $receiverPhone = $shipment->destination_contact_phone ?? ($order->customer->phone ?? '-');
            $receiverAddress = $shipment->destination_address ?? ($order->customer->address ?? '-');
            $receiverPostal = $shipment->destination_postal_code ?? '';
        @endphp

        <div class="label-box">
            <!-- Header -->
            <div class="label-header">
                <div class="courier-info">
                    <span class="courier-name">{{ $courierName }}</span>
                    <span class="courier-service">{{ $courierService }}</span>
                </div>
                <div class="store-logo">PUTRI JAYA MOBIL</div>
            </div>

            <!-- Barcode Section -->
            <div class="barcode-section">
                @if($waybill !== 'BELUM ADA RESI')
                    <img class="barcode-img" src="https://bwipjs-api.metafloor.com/?bcid=code128&text={{ $waybill }}&scale=2&rotate=N&includetext=false" alt="Barcode">
                @endif
                <div class="waybill-number">{{ $waybill }}</div>
                <div class="order-number">Order: {{ $order->order_number }}</div>
            </div>

            <!-- Address Grid -->
            <div class="address-grid">
                <div class="address-col recipient-box">
                    <div class="col-title">PENERIMA (RECIPIENT):</div>
                    <div class="name-bold">{{ $receiverName }}</div>
                    <div class="phone-bold">{{ $receiverPhone }}</div>
                    <div class="address-text">
                        {{ $receiverAddress }}
                    </div>
                    @if($receiverPostal)
                        <div class="postal-code">KODE POS: {{ $receiverPostal }}</div>
                    @endif
                </div>
                <div class="address-col sender-box">
                    <div class="col-title">PENGIRIM (SENDER):</div>
                    <div class="name-bold">{{ $senderName }}</div>
                    <div class="phone-bold">{{ $senderPhone }}</div>
                    <div class="address-text">
                        {{ $senderAddress }}
                    </div>
                </div>
            </div>

            <!-- Packing List -->
            <div class="packing-list">
                <div class="packing-title">Daftar Barang (Packing List)</div>
                <table class="packing-table">
                    <thead>
                        <tr>
                            <th style="width: 15%; text-align: center;">Qty</th>
                            <th style="width: 50%;">Nama Produk</th>
                            <th style="width: 35%;">Varian</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->items as $item)
                        <tr>
                            <td class="text-center font-bold">{{ $item->quantity }}x</td>
                            <td>{{ $item->product_name }}</td>
                            <td>{{ $item->variant_name ?: '-' }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endif
@endforeach

    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script>
        window.onload = function() {
            const barcodes = document.querySelectorAll('.barcode-svg');
            barcodes.forEach(function(svg) {
                const val = svg.getAttribute('data-value');
                if (val && val !== 'BELUM ADA RESI') {
                    JsBarcode(svg, val, {
                        format: 'CODE128',
                        lineColor: '#000',
                        width: 1.8,
                        height: 50,
                        displayValue: false,
                        margin: 0
                    });
                }
            });
            window.print();
        }
    </script>
</body>
</html>
