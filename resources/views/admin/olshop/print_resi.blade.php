<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Print Resi {{ strtoupper($shop) }} - {{ $order->order_number }}</title>
    <style>
        @page {
            size: 100mm 150mm;
            margin: 0;
        }
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 8px;
            box-sizing: border-box;
            background: #fff;
            color: #000;
            font-size: 11px;
        }
        .label-container {
            border: 2px solid #000;
            padding: 8px;
            height: 140mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        /* Marketplace Header Styling */
        .header-tokopedia {
            background-color: #03AC0E;
            color: #ffffff;
        }
        .header-tiktok {
            background-color: #000000;
            color: #ffffff;
            border-bottom: 3px solid #FE2C55;
        }
        .header-shopee {
            background-color: #EE4D2D;
            color: #ffffff;
        }
        
        .header {
            padding: 6px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 4px;
            font-weight: bold;
        }
        .header .olshop-title {
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .header .courier-badge {
            font-size: 14px;
            background: rgba(255,255,255,0.25);
            padding: 2px 8px;
            border-radius: 3px;
        }

        .barcode-section {
            text-align: center;
            margin: 8px 0;
            padding: 6px 0;
            border-bottom: 1px dashed #000;
        }
        .barcode-box {
            font-family: 'Courier New', Courier, monospace;
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 4px;
            background: #f0f0f0;
            padding: 6px;
            border: 1px solid #999;
            display: inline-block;
            margin-bottom: 4px;
        }
        .resi-number {
            font-size: 14px;
            font-weight: bold;
        }

        .address-box {
            display: flex;
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
        }
        .address-half {
            flex: 1;
            padding-right: 6px;
        }
        .address-half:last-child {
            padding-right: 0;
            border-left: 1px solid #ccc;
            padding-left: 6px;
        }
        .address-title {
            font-weight: bold;
            font-size: 10px;
            color: #444;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .name {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .phone {
            font-size: 11px;
            margin-bottom: 4px;
        }
        .address-detail {
            font-size: 10px;
            line-height: 1.3;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 8px;
        }
        .items-table th, .items-table td {
            border: 1px solid #aaa;
            padding: 4px 6px;
            text-align: left;
        }
        .items-table th {
            background-color: #eee;
            font-weight: bold;
        }

        .footer {
            border-top: 1px solid #000;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
        }

        @media print {
            .no-print {
                display: none !important;
            }
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>

    <div class="no-print" style="margin-bottom: 12px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; font-weight: bold; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🖨️ Cetak Resi Sekarang
        </button>
    </div>

    <div class="label-container">
        <!-- Header -->
        <div class="header header-{{ $shop }}">
            <div class="olshop-title">
                @if($shop === 'tokopedia')
                    🟢 TOKOPEDIA
                @elseif($shop === 'tiktok')
                    🎵 TIKTOK SHOP
                @else
                    🟧 SHOPEE
                @endif
            </div>
            <div class="courier-badge">
                {{ $shipment ? $shipment->courier_name : 'KURIR REGULER' }}
            </div>
        </div>

        <!-- Barcode & Waybill -->
        <div class="barcode-section">
            <div class="barcode-box">||| | |||| || | |||| ||</div>
            <div class="resi-number">
                No. Resi: <u>{{ $shipment && $shipment->waybill ? $shipment->waybill : ('RESI-' . $order->order_number) }}</u>
            </div>
            <small style="color: #555;">No. Pesanan: {{ $order->order_number }}</small>
        </div>

        <!-- Address Info -->
        <div class="address-box">
            <div class="address-half">
                <div class="address-title">PENERIMA:</div>
                <div class="name">{{ $order->customer ? $order->customer->name : 'Pembeli' }}</div>
                <div class="phone">📞 {{ $order->customer ? $order->customer->phone : '-' }}</div>
                <div class="address-detail">
                    {{ $order->customer ? $order->customer->address : 'Alamat Pengiriman' }}
                </div>
            </div>
            <div class="address-half">
                <div class="address-title">PENGIRIM:</div>
                <div class="name">{{ $storeName }}</div>
                <div class="phone">📞 {{ $storePhone }}</div>
                <div class="address-detail">{{ $storeAddress }}</div>
            </div>
        </div>

        <!-- Items Table -->
        <div>
            <div class="address-title" style="margin-bottom: 4px;">RINCIAN PRODUK:</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>SKU / Nama Produk</th>
                        <th style="width: 40px; text-align: center;">Qty</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($order->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product_name }}</strong>
                        </td>
                        <td style="text-align: center; font-weight: bold;">{{ $item->quantity }}</td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="2">Produk Pesanan Marketplace</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div>Printed via <strong>ERP Putri Jaya Mobil</strong></div>
            <div>Waktu: {{ date('d-m-Y H:i') }}</div>
        </div>
    </div>

    <script>
        window.addEventListener('DOMContentLoaded', (event) => {
            // Auto trigger print window
            setTimeout(() => {
                window.print();
            }, 500);
        });
    </script>
</body>
</html>
