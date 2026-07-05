@php
    $snapSrc = config('midtrans.is_production') 
        ? 'https://app.midtrans.com/snap/snap.js' 
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
    $clientKey = config('midtrans.client_key');
@endphp
<script src="{{ $snapSrc }}" data-client-key="{{ $clientKey }}"></script>

@if(!$order->payment)
    <div class="alert alert-warning py-1 text-center mt-1" role="alert">
        <div class="alert-body">
            Belum ada informasi tagihan pembayaran yang dibuat untuk order ini.
        </div>
    </div>
@else
    <div class="row">
        <!-- Midtrans & Payment Meta Info -->
        <div class="col-md-6">
            <h5 class="font-weight-bold mb-2 text-dark"><i data-feather="credit-card" class="text-primary mr-50"></i> Informasi Transaksi Pembayaran</h5>
            <table class="table table-borderless table-sm mb-2">
                <tr>
                    <td class="font-weight-bold text-muted pl-0" style="width: 150px;">Metode Pembayaran</td>
                    <td>: {{ App\Models\Payment::PAYMENT_METHODS[$order->payment->payment_method] ?? $order->payment->payment_method ?? 'Belum Memilih' }}</td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Status Pembayaran</td>
                    <td>
                        @php
                            $pStatus = $order->payment->status;
                            $badge = 'secondary';
                            $pLabel = $pStatus;
                            if ($pStatus === 'paid') { $badge = 'success'; $pLabel = 'Lunas'; }
                            elseif ($pStatus === 'waiting_payment') { $badge = 'warning'; $pLabel = 'Menunggu Pembayaran'; }
                            elseif ($pStatus === 'pending') { $badge = 'info'; $pLabel = 'Menunggu Aksi'; }
                            elseif (in_array($pStatus, ['expired', 'cancelled', 'failed'])) { $badge = 'danger'; $pLabel = 'Kedaluwarsa/Gagal'; }
                        @endphp
                        : <span class="badge badge-light-{{ $badge }}">{{ $pLabel }}</span>
                    </td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Jumlah Tagihan</td>
                    <td>: <strong class="text-primary">Rp {{ number_format($order->payment->amount, 0, ',', '.') }}</strong></td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Waktu Lunas</td>
                    <td>: {{ $order->payment->paid_at ? $order->payment->paid_at->format('d M Y H:i:s') : '-' }}</td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Batas Waktu Bayar</td>
                    <td>: {{ $order->payment->expired_at ? $order->payment->expired_at->format('d M Y H:i:s') : '-' }}</td>
                </tr>
            </table>

            <h5 class="font-weight-bold mb-2 text-dark pt-1 border-top"><i data-feather="cpu" class="text-primary mr-50"></i> Integrasi Midtrans</h5>
            <table class="table table-borderless table-sm">
                <tr>
                    <td class="font-weight-bold text-muted pl-0" style="width: 150px;">Midtrans ID Transaksi</td>
                    <td>: <code class="text-dark">{{ $order->payment->midtrans_transaction_id ?: '-' }}</code></td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Tipe Pembayaran</td>
                    <td>: {{ $order->payment->midtrans_payment_type ?: '-' }}</td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Nomor Virtual Account</td>
                    <td>: <code class="text-primary">{{ $order->payment->midtrans_va_number ?: '-' }}</code></td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Snap Token</td>
                    <td>: <span class="small text-muted">{{ $order->payment->snap_token ?: '-' }}</span></td>
                </tr>
                @if($order->payment->payment_url)
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Payment URL</td>
                        <td>: <a href="{{ $order->payment->payment_url }}" target="_blank" class="btn btn-xs btn-outline-primary py-25">Buka Halaman Pembayaran</a></td>
                    </tr>
                @else
                    @if($order->payment->status !== 'paid')
                        <tr>
                            <td class="font-weight-bold text-muted pl-0">Payment URL</td>
                            <td>: 
                                <button type="button" class="btn btn-xs btn-warning py-25 text-white font-weight-bold" id="btn-generate-payment-link">
                                    <i data-feather="link" class="mr-25"></i> Buat Link Pembayaran Midtrans
                                </button>
                            </td>
                        </tr>
                    @endif
                @endif
                @if($order->payment->status !== 'paid')
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Aksi Pembayaran</td>
                        <td>: 
                            <button type="button" class="btn btn-xs btn-success py-25 text-white font-weight-bold btn-trigger-pay-snap" data-snap-token="{{ $order->payment->snap_token }}">
                                <i data-feather="credit-card" class="mr-25"></i> Bayar Sekarang
                            </button>
                        </td>
                    </tr>
                @endif
                @if($order->payment->status !== 'paid')
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Aksi</td>
                        <td>: 
                            <button type="button" class="btn btn-xs btn-primary py-25" id="btn-sync-payment">
                                <i data-feather="refresh-cw" class="mr-25"></i> Sync Status Midtrans
                            </button>
                        </td>
                    </tr>
                @endif
            </table>
        </div>

        <!-- Payment logs timeline -->
        <div class="col-md-6 mt-3 mt-md-0">
            <h5 class="font-weight-bold mb-2 text-dark"><i data-feather="activity" class="text-primary mr-50"></i> Log Siklus Pembayaran</h5>
            @if($order->payment->histories->isEmpty())
                <div class="alert alert-light py-1 text-center" role="alert">
                    <span class="text-muted small">Belum ada riwayat update dari payment gateway.</span>
                </div>
            @else
                <ul class="timeline">
                    @foreach($order->payment->histories->sortByDesc('created_at') as $history)
                        @php
                            $histStatus = $history->status;
                            $badge = 'secondary';
                            $statusLabel = $histStatus;
                            if ($histStatus === 'paid') { $badge = 'success'; $statusLabel = 'Lunas'; }
                            elseif ($histStatus === 'waiting_payment') { $badge = 'warning'; $statusLabel = 'Invoice Dibuat'; }
                            elseif ($histStatus === 'pending') { $badge = 'info'; $statusLabel = 'Menunggu Bayar'; }
                            elseif (in_array($histStatus, ['expired', 'cancelled', 'failed'])) { $badge = 'danger'; $statusLabel = 'Gagal/Kedaluwarsa'; }
                        @endphp
                        <li class="timeline-item">
                            <span class="timeline-badge {{ $badge }}"></span>
                            <div class="timeline-date">{{ $history->created_at->format('d M Y H:i:s') }}</div>
                            <div class="timeline-title">Status: {{ $statusLabel }}</div>
                            <p class="timeline-text text-muted small">Tercatat oleh sistem sinkronisasi Midtrans webhook.</p>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>
    </div>
@endif
