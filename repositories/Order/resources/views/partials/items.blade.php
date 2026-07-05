<div class="table-responsive mt-1">
    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th style="width: 45%;">Nama Produk</th>
                <th>SKU</th>
                <th class="text-right">Berat (Gram)</th>
                <th class="text-right">Harga Unit</th>
                <th class="text-center" style="width: 80px;">Qty</th>
                <th class="text-right" style="width: 180px;">Total Harga</th>
            </tr>
        </thead>
        <tbody>
            @if($order->items->isEmpty())
                <tr>
                    <td colspan="6" class="text-center text-muted py-2">
                        Tidak ada barang produk dalam transaksi pesanan ini.
                    </td>
                </tr>
            @else
                @foreach($order->items as $item)
                    <tr>
                        <td>
                            <strong class="text-dark">{{ $item->product_name }}</strong>
                        </td>
                        <td>
                            <code class="text-primary">{{ $item->sku }}</code>
                        </td>
                        <td class="text-right">
                            {{ number_format($item->weight, 0, ',', '.') }} g
                        </td>
                        <td class="text-right">
                            Rp {{ number_format($item->unit_price, 0, ',', '.') }}
                        </td>
                        <td class="text-center font-weight-bold">
                            {{ $item->quantity }}
                        </td>
                        <td class="text-right font-weight-bold text-dark">
                            Rp {{ number_format($item->total_price, 0, ',', '.') }}
                        </td>
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>
</div>
