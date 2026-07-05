<form id="form-update-details">
    @csrf
    <div class="row">
        <!-- Customer & Order details -->
        <div class="col-md-6">
            <h5 class="font-weight-bold mb-2 text-dark"><i data-feather="user" class="text-primary mr-50"></i> Kontak Customer</h5>
            <table class="table table-borderless table-sm mb-2">
                <tr>
                    <td class="font-weight-bold text-muted pl-0" style="width: 120px;">Nama Customer</td>
                    <td>: {{ $order->customer->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">No. Telepon</td>
                    <td>: {{ $order->customer->phone ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Alamat Email</td>
                    <td>: {{ $order->customer->email ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="font-weight-bold text-muted pl-0">Daftar Sejak</td>
                    <td>: {{ $order->customer->created_at ? $order->customer->created_at->format('d M Y') : '-' }}</td>
                </tr>
            </table>

            <div class="form-group-premium">
                <label class="form-label-premium" for="order-notes">Catatan Pembeli / Pesanan</label>
                <textarea name="notes" id="order-notes" class="textarea-premium" rows="4" placeholder="Tambahkan catatan khusus untuk order ini...">{{ $order->notes }}</textarea>
            </div>
            
            <button type="submit" class="btn btn-sm btn-primary">
                Simpan Perubahan Catatan
            </button>
        </div>

        <!-- Order Status Timeline -->
        <div class="col-md-6 mt-3 mt-md-0">
            <h5 class="font-weight-bold mb-2 text-dark"><i data-feather="clock" class="text-primary mr-50"></i> Log Riwayat Pesanan</h5>
            @if($order->histories->isEmpty())
                <div class="alert alert-light py-1 text-center" role="alert">
                    <span class="text-muted small">Belum ada riwayat tercatat untuk pesanan ini.</span>
                </div>
            @else
                <ul class="timeline">
                    @foreach($order->histories->sortByDesc('created_at') as $history)
                        @php
                            $slug = $history->status->slug ?? 'pending';
                            $badge = 'secondary';
                            if ($slug === 'processing') $badge = 'info';
                            elseif ($slug === 'shipping') $badge = 'warning';
                            elseif ($slug === 'completed') $badge = 'success';
                            elseif (in_array($slug, ['cancelled', 'failed'])) $badge = 'danger';
                        @endphp
                        <li class="timeline-item">
                            <span class="timeline-badge {{ $badge }}"></span>
                            <div class="timeline-date">{{ $history->created_at->format('d M Y H:i') }}</div>
                            <div class="timeline-title">{{ $history->status->name ?? 'Update Status' }}</div>
                            <p class="timeline-text">{{ $history->description }}</p>
                        </li>
                    @endforeach
                </ul>
            @endif
        </div>
    </div>
</form>
