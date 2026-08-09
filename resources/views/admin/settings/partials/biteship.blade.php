<!-- TAB 6: Biteship Logistic Integration -->
<div class="tab-pane fade" id="biteship" role="tabpanel" aria-labelledby="biteship-tab">
    <!-- Top-Up Saldo Info Card -->
    <div class="alert alert-primary p-1 mb-2 d-flex align-items-center justify-content-between flex-wrap">
        <div class="d-flex align-items-center">
            <div class="avatar bg-light-primary p-50 mr-1">
                <div class="avatar-content"><i data-feather="dollar-sign" class="font-medium-5"></i></div>
            </div>
            <div>
                <h6 class="alert-heading font-weight-bold mb-25">Informasi Saldo & Top-Up Biteship</h6>
                <p class="small text-muted mb-0">Untuk isi ulang saldo (Top-up) atau cek riwayat saldo dompet, silakan buka Dashboard resmi Biteship.</p>
            </div>
        </div>
        <a href="https://dashboard.biteship.com" target="_blank" rel="noopener noreferrer" class="btn btn-primary font-weight-bold btn-sm mt-50 mt-sm-0">
            <i data-feather="external-link" class="mr-25"></i> Buka Dashboard & Topup Saldo Biteship
        </a>
    </div>

    <form action="{{ route('admin.settings.update') }}" method="POST">
        @csrf
        <input type="hidden" name="app_name" value="{{ $settings['app_name'] ?? '' }}">
        <input type="hidden" name="app_short_name" value="{{ $settings['app_short_name'] ?? '' }}">
        <input type="hidden" name="primary_color" value="{{ $settings['primary_color'] ?? '' }}">
        <input type="hidden" name="secondary_color" value="{{ $settings['secondary_color'] ?? '' }}">
        <input type="hidden" name="store_name" value="{{ $settings['store_name'] ?? '' }}">

        <div class="d-flex align-items-center justify-between mb-1">
            <h5 class="font-weight-bold text-primary mb-0"><i data-feather="package" class="mr-50"></i>Koneksi Biteship API</h5>
            <span id="biteship-status-badge" class="badge badge-light-secondary font-weight-bold px-1 py-50">Belum Dites</span>
        </div>
        <p class="text-muted small">Konfigurasi akun Biteship Anda untuk penarikan ongkos kirim real-time dan booking kurir otomatis.</p>
        
        <div class="row">
            <div class="col-md-8 form-group">
                <label for="biteship_api_key" class="font-weight-bold">Biteship API Key (Token)</label>
                <input type="password" id="biteship_api_key" name="biteship_api_key" class="form-control" value="{{ old('biteship_api_key', $settings['biteship_api_key'] ?? '') }}" placeholder="biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
            </div>

            <div class="col-md-4 form-group">
                <label class="d-block font-weight-bold mb-50">Environment Mode</label>
                <div class="custom-control custom-switch custom-control-inline mt-25">
                    <input type="checkbox" class="custom-control-input" id="biteship_is_production" name="biteship_is_production" {{ (old('biteship_is_production', $settings['biteship_is_production'] ?? '0') == '1') ? 'checked' : '' }}>
                    <label class="custom-control-label" for="biteship_is_production">Aktifkan Mode Produksi (Live Booking)</label>
                </div>
            </div>

            <div class="col-12 d-flex align-items-center justify-content-between mt-1 mb-1">
                <h5 class="font-weight-bold text-primary mb-0"><i data-feather="map-pin" class="mr-50"></i>Detail Lokasi Pengirim (Gudang/Toko Asal)</h5>
                <button type="button" id="btn-get-current-location" class="btn btn-sm btn-outline-primary font-weight-bold">
                    <i data-feather="crosshair" class="mr-25"></i> Deteksi Lokasi Sekarang (GPS)
                </button>
            </div>

            <div class="col-md-6 form-group">
                <label for="biteship_origin_postal_code" class="font-weight-bold">Kode Pos Toko Asal</label>
                <input type="text" id="biteship_origin_postal_code" name="biteship_origin_postal_code" class="form-control" value="{{ old('biteship_origin_postal_code', $settings['biteship_origin_postal_code'] ?? '') }}" placeholder="14240">
            </div>

            <div class="col-md-6 form-group">
                <label for="biteship_shipper_phone" class="font-weight-bold">No. Telp Pengirim Utama</label>
                <input type="text" id="biteship_shipper_phone" name="biteship_shipper_phone" class="form-control" value="{{ old('biteship_shipper_phone', $settings['biteship_shipper_phone'] ?? '') }}" placeholder="08123456789">
            </div>

            <div class="col-md-6 form-group">
                <label for="biteship_origin_latitude" class="font-weight-bold">Latitude Toko Asal</label>
                <input type="text" id="biteship_origin_latitude" name="biteship_origin_latitude" class="form-control" value="{{ old('biteship_origin_latitude', $settings['biteship_origin_latitude'] ?? '') }}" placeholder="-6.1234567">
            </div>

            <div class="col-md-6 form-group">
                <label for="biteship_origin_longitude" class="font-weight-bold">Longitude Toko Asal</label>
                <input type="text" id="biteship_origin_longitude" name="biteship_origin_longitude" class="form-control" value="{{ old('biteship_origin_longitude', $settings['biteship_origin_longitude'] ?? '') }}" placeholder="106.1234567">
            </div>

            <div class="col-12 form-group">
                <label for="biteship_shipper_address" class="font-weight-bold">Alamat Fisik Toko Asal</label>
                <textarea id="biteship_shipper_address" name="biteship_shipper_address" class="form-control" rows="3" placeholder="Jl. Raya Putri Jaya Mobil No. 12, Kel. Sunter Agung, Jakarta Utara">{{ old('biteship_shipper_address', $settings['biteship_shipper_address'] ?? '') }}</textarea>
            </div>
        </div>
        <div class="d-flex justify-content-end mt-2 pt-1 border-top">
            <button type="button" id="btn-test-biteship" class="btn btn-outline-info font-weight-bold mr-1"><i data-feather="wifi" class="mr-25"></i> Tes Koneksi Biteship</button>
            <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Biteship</button>
        </div>
    </form>

    <!-- Separator -->
    <div class="divider divider-primary mt-3">
        <div class="divider-text font-weight-bold">Manajemen Kurir Biteship</div>
    </div>

    <!-- Courier Management Card -->
    <div class="card mt-2 border">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap border-bottom">
            <div>
                <h5 class="card-title font-weight-bold text-primary mb-0">
                    <i data-feather="truck" class="mr-50"></i>Daftar Kurir Biteship
                </h5>
                <p class="text-muted small mb-0">Aktifkan atau nonaktifkan kurir ekspedisi yang akan digunakan saat checkout pelanggan.</p>
            </div>
            <button type="button" class="btn btn-outline-primary font-weight-bold mt-50 mt-sm-0" id="btn-sync-couriers">
                <i data-feather="refresh-cw" class="mr-25"></i> Tarik Kurir dari Biteship
            </button>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="thead-light">
                        <tr>
                            <th width="15%">Kode Kurir</th>
                            <th width="25%">Nama Kurir</th>
                            <th>Layanan yang Tersedia</th>
                            <th width="15%" class="text-center">Status Aktif</th>
                        </tr>
                    </thead>
                    <tbody id="couriers-table-body">
                        @forelse($couriers ?? [] as $courier)
                            <tr>
                                <td class="font-weight-bold text-uppercase">{{ $courier->code }}</td>
                                <td>{{ $courier->name }}</td>
                                <td>
                                    <small class="text-muted">{{ $courier->service_names ?: '-' }}</small>
                                </td>
                                <td class="text-center">
                                    <div class="custom-control custom-switch custom-switch-primary d-inline-flex justify-content-center">
                                        <input type="checkbox" class="custom-control-input courier-toggle" id="courier-{{ $courier->id }}" data-id="{{ $courier->id }}" {{ $courier->is_active ? 'checked' : '' }}>
                                        <label class="custom-control-label" for="courier-{{ $courier->id }}"></label>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center py-2 text-muted">
                                    <i data-feather="alert-circle" class="mr-25"></i> Belum ada data kurir. Silakan klik tombol <strong>Tarik Kurir dari Biteship</strong> di atas.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Separator -->
    <div class="divider divider-primary mt-3">
        <div class="divider-text font-weight-bold">Riwayat Transaksi Pengiriman (Shipments)</div>
    </div>

    <!-- Shipment Transaction History Card -->
    <div class="card mt-2 border">
        <div class="card-header border-bottom">
            <h5 class="card-title font-weight-bold text-primary mb-0">
                <i data-feather="clock" class="mr-50"></i>Transaksi & Pengiriman Terakhir
            </h5>
            <p class="text-muted small mb-0">15 transaksi booking pengiriman Biteship terbaru dari sistem web ERP.</p>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="thead-light">
                        <tr>
                            <th width="15%">Tanggal</th>
                            <th width="15%">No. Pesanan</th>
                            <th>Pelanggan</th>
                            <th width="20%">Ekspedisi & Layanan</th>
                            <th width="15%">No. Resi (Waybill)</th>
                            <th width="12%" class="text-right">Biaya Ongkir</th>
                            <th width="13%" class="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($shipments ?? [] as $shipment)
                            <tr>
                                <td class="small">{{ $shipment->created_at ? $shipment->created_at->format('d/m/Y H:i') : '-' }}</td>
                                <td class="font-weight-bold">
                                    #{{ $shipment->order->order_number ?? $shipment->order_id }}
                                </td>
                                <td>{{ $shipment->order->customer->name ?? '-' }}</td>
                                <td>
                                    <span class="badge badge-light-primary text-uppercase">{{ $shipment->courier_company }}</span>
                                    <small class="d-block text-muted">{{ $shipment->courier_service_name ?: $shipment->courier_service }}</small>
                                </td>
                                <td class="font-weight-bold text-monospace small">
                                    {{ $shipment->waybill_id ?: ($shipment->biteship_order_id ?: '-') }}
                                </td>
                                <td class="text-right font-weight-bold text-success">
                                    Rp {{ number_format($shipment->cost ?? 0, 0, ',', '.') }}
                                </td>
                                <td class="text-center">
                                    @php
                                        $statusBadges = [
                                            'draft' => 'badge-light-secondary',
                                            'pickup_requested' => 'badge-light-info',
                                            'picking_up' => 'badge-light-warning',
                                            'picked' => 'badge-light-primary',
                                            'in_transit' => 'badge-light-primary',
                                            'delivered' => 'badge-light-success',
                                            'returned' => 'badge-light-danger',
                                            'cancelled' => 'badge-light-danger',
                                        ];
                                        $badgeClass = $statusBadges[$shipment->status] ?? 'badge-light-secondary';
                                    @endphp
                                    <span class="badge badge-pill {{ $badgeClass }} font-weight-bold text-capitalize">
                                        {{ str_replace('_', ' ', $shipment->status) }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-2 text-muted">
                                    <i data-feather="info" class="mr-25"></i> Belum ada transaksi pengiriman Biteship yang tercatat.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
