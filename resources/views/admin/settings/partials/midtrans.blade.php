<!-- TAB 5: Midtrans Payment Integration -->
<div class="tab-pane fade" id="midtrans" role="tabpanel" aria-labelledby="midtrans-tab">
    <!-- Settlement & Payout Info Card -->
    <div class="alert alert-primary p-1 mb-2 d-flex align-items-center justify-content-between flex-wrap">
        <div class="d-flex align-items-center">
            <div class="avatar bg-light-primary p-50 mr-1">
                <div class="avatar-content"><i data-feather="dollar-sign" class="font-medium-5"></i></div>
            </div>
            <div>
                <h6 class="alert-heading font-weight-bold mb-25">Informasi Saldo Payout & Settlement Midtrans</h6>
                <p class="small text-muted mb-0">Untuk pencairan dana (Settlement/Payout Ke Rekening Toko) dan penarikan saldo, silakan akses Dashboard resmi Midtrans.</p>
            </div>
        </div>
        <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" class="btn btn-primary font-weight-bold btn-sm mt-50 mt-sm-0">
            <i data-feather="external-link" class="mr-25"></i> Buka Dashboard Midtrans
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
            <h5 class="font-weight-bold text-primary mb-0"><i data-feather="shield" class="mr-50"></i>Integrasi Midtrans Snap</h5>
            <span id="midtrans-status-badge" class="badge badge-light-secondary font-weight-bold px-1 py-50">Belum Dites</span>
        </div>
        <p class="text-muted small">Konfigurasi akun payment gateway Midtrans Anda untuk pembayaran instan Snap Popup.</p>
        
        <div class="row">
            <div class="col-md-6 form-group">
                <label for="midtrans_merchant_id" class="font-weight-bold">Merchant ID</label>
                <input type="text" id="midtrans_merchant_id" name="midtrans_merchant_id" class="form-control" value="{{ old('midtrans_merchant_id', $settings['midtrans_merchant_id'] ?? '') }}" placeholder="Gxxxxxxxxx">
            </div>

            <div class="col-md-6 form-group">
                <label class="d-block font-weight-bold mb-50">Environment Mode</label>
                <div class="custom-control custom-switch custom-control-inline mt-25">
                    <input type="checkbox" class="custom-control-input" id="midtrans_is_production" name="midtrans_is_production" {{ (old('midtrans_is_production', $settings['midtrans_is_production'] ?? '0') == '1') ? 'checked' : '' }}>
                    <label class="custom-control-label" for="midtrans_is_production">Aktifkan Mode Produksi (Lunas Asli)</label>
                </div>
            </div>

            <div class="col-md-6 form-group">
                <label for="midtrans_client_key" class="font-weight-bold">Client Key</label>
                <input type="text" id="midtrans_client_key" name="midtrans_client_key" class="form-control" value="{{ old('midtrans_client_key', $settings['midtrans_client_key'] ?? '') }}" placeholder="SB-Mid-client-xxxxxxx">
            </div>

            <div class="col-md-6 form-group">
                <label for="midtrans_server_key" class="font-weight-bold">Server Key</label>
                <input type="password" id="midtrans_server_key" name="midtrans_server_key" class="form-control" value="{{ old('midtrans_server_key', $settings['midtrans_server_key'] ?? '') }}" placeholder="SB-Mid-server-xxxxxxx">
            </div>
        </div>
        <div class="d-flex justify-content-end mt-2 pt-1 border-top">
            <button type="button" id="btn-test-midtrans" class="btn btn-outline-info font-weight-bold mr-1"><i data-feather="wifi" class="mr-25"></i> Tes Koneksi Midtrans</button>
            <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Midtrans</button>
        </div>
    </form>

    <!-- Separator -->
    <div class="divider divider-primary mt-3">
        <div class="divider-text font-weight-bold">Manajemen Metode Pembayaran Midtrans</div>
    </div>

    <!-- Payment Methods Management Card -->
    <div class="card mt-2 border">
        <div class="card-header border-bottom">
            <h5 class="card-title font-weight-bold text-primary mb-0">
                <i data-feather="credit-card" class="mr-50"></i>Daftar Metode Pembayaran Midtrans
            </h5>
            <p class="text-muted small mb-0">Tentukan opsi pembayaran apa saja yang muncul pada pop-up Snap Midtrans saat pelanggan membayar.</p>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="thead-light">
                        <tr>
                            <th width="20%">Kategori</th>
                            <th width="25%">Kode Metode</th>
                            <th>Nama Metode Pembayaran</th>
                            <th width="15%" class="text-center">Status Aktif</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php
                            $sortedMethods = collect($paymentMethods ?? [])->groupBy('category');
                        @endphp
                        @forelse($sortedMethods as $category => $methods)
                            @foreach($methods as $index => $method)
                                <tr>
                                    @if($index === 0)
                                        <td rowspan="{{ count($methods) }}" class="align-middle font-weight-bold text-primary bg-light" style="border-right: 1px solid #ebe9f1;">
                                            {{ $category }}
                                        </td>
                                    @endif
                                    <td class="font-weight-bold text-monospace">{{ $method->code }}</td>
                                    <td>{{ $method->name }}</td>
                                    <td class="text-center">
                                        <div class="custom-control custom-switch custom-switch-primary d-inline-flex justify-content-center">
                                            <input type="checkbox" class="custom-control-input payment-toggle" id="payment-{{ $method->id }}" data-id="{{ $method->id }}" {{ $method->is_active ? 'checked' : '' }}>
                                            <label class="custom-control-label" for="payment-{{ $method->id }}"></label>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        @empty
                            <tr>
                                <td colspan="4" class="text-center py-2 text-muted">
                                    <i data-feather="alert-circle" class="mr-25"></i> Belum ada data metode pembayaran.
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
        <div class="divider-text font-weight-bold">Riwayat Transaksi Pembayaran (Payments)</div>
    </div>

    <!-- Payment Transaction History Card -->
    <div class="card mt-2 border">
        <div class="card-header border-bottom">
            <h5 class="card-title font-weight-bold text-primary mb-0">
                <i data-feather="clock" class="mr-50"></i>Transaksi Pembayaran Terakhir
            </h5>
            <p class="text-muted small mb-0">15 transaksi pembayaran Midtrans terbaru dari sistem web ERP.</p>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="thead-light">
                        <tr>
                            <th width="15%">Tanggal</th>
                            <th width="15%">No. Pesanan</th>
                            <th>Pelanggan</th>
                            <th width="20%">Metode Pembayaran</th>
                            <th width="15%">ID Transaksi Midtrans</th>
                            <th width="12%" class="text-right">Total Pembayaran</th>
                            <th width="13%" class="text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($payments ?? [] as $payment)
                            <tr>
                                <td class="small">{{ $payment->created_at ? $payment->created_at->format('d/m/Y H:i') : '-' }}</td>
                                <td class="font-weight-bold">
                                    #{{ $payment->order->order_number ?? $payment->order_id }}
                                </td>
                                <td>{{ $payment->order->customer->name ?? '-' }}</td>
                                <td>
                                    <span class="badge badge-light-primary text-uppercase">{{ $payment->midtrans_payment_type ?: $payment->payment_method }}</span>
                                </td>
                                <td class="font-weight-bold text-monospace small">
                                    {{ $payment->midtrans_transaction_id ?: '-' }}
                                </td>
                                <td class="text-right font-weight-bold text-success">
                                    Rp {{ number_format($payment->amount ?? 0, 0, ',', '.') }}
                                </td>
                                <td class="text-center">
                                    @php
                                        $statusBadges = [
                                            'waiting_payment' => 'badge-light-warning',
                                            'pending'         => 'badge-light-info',
                                            'paid'            => 'badge-light-success',
                                            'expired'         => 'badge-light-secondary',
                                            'cancelled'       => 'badge-light-danger',
                                            'failed'          => 'badge-light-danger',
                                            'refunded'        => 'badge-light-primary',
                                        ];
                                        $badgeClass = $statusBadges[$payment->status] ?? 'badge-light-secondary';
                                    @endphp
                                    <span class="badge badge-pill {{ $badgeClass }} font-weight-bold text-capitalize">
                                        {{ str_replace('_', ' ', $payment->status) }}
                                    </span>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center py-2 text-muted">
                                    <i data-feather="info" class="mr-25"></i> Belum ada transaksi pembayaran Midtrans yang tercatat.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
