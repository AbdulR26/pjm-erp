@if(!$order->shipment)
    <div class="alert alert-warning py-1 text-center mt-1" role="alert">
        <div class="alert-body">
            Belum ada informasi pengiriman barang yang dibuat untuk order ini.
        </div>
    </div>
@else
    <form id="form-update-details">
        @csrf
        <div class="row">
            <!-- Courier & Waybill details -->
            <div class="col-md-6">
                <h5 class="font-weight-bold mb-2 text-dark"><i data-feather="truck" class="text-primary mr-50"></i> Informasi Logistik Kurir</h5>
                <table class="table table-borderless table-sm mb-2">
                    <tr>
                        <td class="font-weight-bold text-muted pl-0" style="width: 150px;">Perusahaan Kurir</td>
                        <td>: <span class="text-uppercase font-weight-bold">{{ $order->shipment->courier_company }}</span></td>
                    </tr>
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Layanan Kurir</td>
                        <td>: {{ $order->shipment->courier_service_name ?: $order->shipment->courier_service }} ({{ $order->shipment->etd ?: '-' }})</td>
                    </tr>
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Ongkos Kirim Riil</td>
                        <td>: Rp {{ number_format($order->shipment->cost, 0, ',', '.') }}</td>
                    </tr>
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Biteship Order ID</td>
                        <td>: <code class="text-dark">{{ $order->shipment->biteship_order_id ?: '-' }}</code></td>
                    </tr>
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Status Biteship</td>
                        <td>
                            @php
                                $sStatus = $order->shipment->status;
                                $sBadge = 'secondary';
                                $sLabel = App\Models\Shipment::STATUS_LABELS[$sStatus] ?? $sStatus;
                                if ($sStatus === 'delivered') $sBadge = 'success';
                                elseif ($sStatus === 'in_transit' || $sStatus === 'dropping_off') $sBadge = 'info';
                                elseif (in_array($sStatus, ['pickup_requested', 'picking_up', 'picked'])) $sBadge = 'warning';
                                elseif (in_array($sStatus, ['cancelled', 'returned'])) $sBadge = 'danger';
                            @endphp
                            : <span class="badge badge-light-{{ $sBadge }}">{{ $sLabel }}</span>
                        </td>
                    </tr>
                </table>

                <h5 class="font-weight-bold mb-2 text-dark pt-1 border-top"><i data-feather="box" class="text-primary mr-50"></i> Booking Kurir Biteship & Cetak Label</h5>
                @if($order->shipment->biteship_order_id)
                    <div class="alert alert-success py-1 mb-1">
                        <div class="alert-body font-weight-bold">
                            ✓ Kurir Biteship telah berhasil di-booking.
                        </div>
                    </div>
                    <div class="mb-2">
                        <a href="{{ route('admin.orders.print-label', $order->id) }}" target="_blank" class="btn btn-success">
                            <i data-feather="printer" class="mr-25"></i> Cetak Label Pengiriman
                        </a>
                    </div>
                @else
                    @if($order->payment && $order->payment->status === 'paid')
                        <div class="alert alert-info py-1 mb-1">
                            <div class="alert-body small">
                                Pembayaran sudah Lunas. Anda bisa melakukan booking kurir Biteship untuk mendapatkan nomor resi otomatis.
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary mb-2" id="btn-book-biteship">
                            <i data-feather="truck" class="mr-25"></i> Booking Kurir & Generate Resi
                        </button>
                    @else
                        <div class="alert alert-warning py-1 mb-2">
                            <div class="alert-body small font-weight-bold">
                                ⚠ Booking kurir Biteship hanya tersedia setelah status pembayaran Lunas.
                            </div>
                        </div>
                    @endif
                @endif

                <h5 class="font-weight-bold mb-2 text-dark pt-1 border-top"><i data-feather="edit-2" class="text-primary mr-50"></i> Kelola Resi Manual (Jika Diperlukan)</h5>
                <div class="row">
                    <div class="col-md-6 form-group-premium">
                        <label class="form-label-premium" for="shipment-waybill">Nomor Resi (Waybill ID)</label>
                        <input type="text" name="waybill_id" id="shipment-waybill" value="{{ $order->shipment->waybill_id }}" class="form-control-premium" placeholder="Masukkan nomor resi">
                    </div>
                    <div class="col-md-6 form-group-premium">
                        <label class="form-label-premium" for="shipment-status-select">Status Pengiriman</label>
                        <select name="shipment_status" id="shipment-status-select" class="form-control-premium">
                            @foreach(App\Models\Shipment::STATUS_LABELS as $key => $label)
                                <option value="{{ $key }}" {{ $order->shipment->status === $key ? 'selected' : '' }}>
                                    {{ $label }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-sm btn-primary mb-2">
                    Simpan Resi & Status
                </button>

                <h5 class="font-weight-bold mb-2 text-dark pt-1 border-top"><i data-feather="map-pin" class="text-primary mr-50"></i> Alamat Tujuan Pengiriman</h5>
                <table class="table table-borderless table-sm">
                    <tr>
                        <td class="font-weight-bold text-muted pl-0" style="width: 150px;">Nama Penerima</td>
                        <td>: <strong>{{ $order->shipment->destination_contact_name }}</strong></td>
                    </tr>
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">No. Telepon Penerima</td>
                        <td>: {{ $order->shipment->destination_contact_phone }}</td>
                    </tr>
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Alamat Lengkap</td>
                        <td>: {{ $order->shipment->destination_address }}</td>
                    </tr>
                    <tr>
                        <td class="font-weight-bold text-muted pl-0">Kode Pos / Koordinat</td>
                        <td>: {{ $order->shipment->destination_postal_code ?: '-' }} 
                            @if($order->shipment->destination_latitude && $order->shipment->destination_longitude)
                                <br><span class="text-muted small">({{ $order->shipment->destination_latitude }}, {{ $order->shipment->destination_longitude }})</span>
                            @endif
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Shipment webhook logs history -->
            <div class="col-md-6 mt-3 mt-md-0">
                <h5 class="font-weight-bold mb-2 text-dark"><i data-feather="map" class="text-primary mr-50"></i> Tracking Perjalanan Paket (Biteship)</h5>
                @if(empty($order->shipment->tracking_history) || !is_array($order->shipment->tracking_history))
                    <div class="alert alert-light py-1 text-center" role="alert">
                        <span class="text-muted small">Belum ada data perjalanan kurir yang di-update dari Biteship API.</span>
                    </div>
                @else
                    <ul class="timeline">
                        @foreach($order->shipment->tracking_history as $track)
                            <li class="timeline-item">
                                <span class="timeline-badge info"></span>
                                <div class="timeline-date">
                                    {{ isset($track['timestamp']) ? Carbon\Carbon::parse($track['timestamp'])->format('d M Y H:i') : '-' }}
                                </div>
                                <div class="timeline-title">
                                    {{ $track['status'] ?? 'In Transit' }}
                                </div>
                                <p class="timeline-text text-muted small">
                                    {{ $track['note'] ?? $track['description'] ?? '-' }}
                                </p>
                            </li>
                        @endforeach
                    </ul>
                @endif
            </div>
        </div>
    </form>
@endif
