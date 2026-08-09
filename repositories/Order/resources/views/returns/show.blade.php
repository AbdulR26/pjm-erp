@extends('layouts.app')
@section('title', $title)
@section('content')
<div class="row">
    <!-- Header Card -->
    <div class="col-12 mb-2">
        <div class="card border-0 shadow-sm" style="border-radius: 16px; background: linear-gradient(135deg, #1e1e2d 0%, #3226a6 100%);">
            <div class="card-body p-2 text-white">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div>
                        <span class="badge badge-pill font-weight-bold px-1 py-50 mb-50" style="background: rgba(255, 255, 255, 0.2); color: #ffffff;">
                            📦 PENGAJUAN RETUR BARANG
                        </span>
                        <h3 class="text-white font-weight-bolder mb-25">{{ $return->return_number }}</h3>
                        <p class="text-white-50 mb-0 small">
                            Pesanan: <a href="{{ route('admin.orders.edit', $return->order_id) }}" class="text-warning font-weight-bold">#{{ $return->order->order_number }}</a> &bull; Pelanggan: <strong>{{ $return->customer->name }}</strong> ({{ $return->customer->phone ?: '-' }})
                        </p>
                    </div>
                    <div class="mt-1 mt-md-0 text-md-right">
                        @php
                            $status = $return->status;
                            $label = App\Models\OrderReturn::STATUS_LABELS[$status] ?? $status;
                            $badge = 'secondary';
                            if ($status === 'pending') $badge = 'warning';
                            elseif (in_array($status, ['approved', 'shipping_back', 'received_at_warehouse'])) $badge = 'info';
                            elseif ($status === 'completed') $badge = 'success';
                            elseif (in_array($status, ['rejected', 'cancelled'])) $badge = 'danger';
                        @endphp
                        <span class="badge badge-pill badge-{{ $badge }} px-1 py-50 font-weight-bold" style="font-size: 0.9rem;">
                            {{ $label }}
                        </span>
                        <br>
                        <span class="text-white-50 small mt-25 d-block">Tgl Pengajuan: {{ $return->created_at->format('d M Y H:i') }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<form id="form-approve-return" enctype="multipart/form-data">
@csrf
<div class="row">
    <!-- Left Column: Details, Media & Items -->
    <div class="col-lg-8">
        <!-- Reason & Customer Notes -->
        <div class="card border-0 shadow-sm mb-2" style="border-radius: 16px;">
            <div class="card-body">
                <h5 class="font-weight-bold text-dark mb-1"><i data-feather="file-text" class="text-primary mr-50"></i> Alasan & Catatan Pelanggan</h5>
                <div class="p-1 mb-1" style="background-color: #f8f9fa; border-radius: 10px; border-left: 4px solid #7367f0;">
                    <span class="badge badge-primary font-weight-bold mb-50">
                        {{ App\Models\OrderReturn::REASON_LABELS[$return->reason_type] ?? $return->reason_type }}
                    </span>
                    <p class="mb-0 text-dark font-weight-normal" style="font-size: 0.95rem; white-space: pre-line;">{{ $return->customer_notes }}</p>
                </div>
            </div>
        </div>

        <!-- Evidence Gallery (Photos & Videos) -->
        <div class="card border-0 shadow-sm mb-2" style="border-radius: 16px;">
            <div class="card-body">
                <h5 class="font-weight-bold text-dark mb-1"><i data-feather="image" class="text-primary mr-50"></i> Galeri Bukti Foto & Video</h5>
                @if($return->media->isEmpty())
                    <p class="text-muted small mb-0">Tidak ada berkas bukti foto/video terlampir.</p>
                @else
                    <div class="row">
                        @foreach($return->media as $media)
                            <div class="col-md-4 col-6 mb-1">
                                <div class="border rounded p-50 text-center bg-light">
                                    @if($media->file_type === 'video')
                                        <video controls class="w-100 rounded" style="max-height: 180px; object-fit: cover;">
                                            <source src="{{ asset($media->file_path) }}">
                                            Browser Anda tidak mendukung pemutar video.
                                        </video>
                                    @else
                                        <a href="{{ asset($media->file_path) }}" target="_blank">
                                            <img src="{{ asset($media->file_path) }}" class="img-fluid rounded hover-shadow" style="max-height: 180px; object-fit: cover;" alt="Bukti Foto">
                                        </a>
                                    @endif
                                    <span class="d-block text-truncate small text-muted mt-25">{{ $media->file_name }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>

        <!-- Return Items Table -->
        <div class="card border-0 shadow-sm mb-2" style="border-radius: 16px;">
            <div class="card-body">
                <h5 class="font-weight-bold text-dark mb-1"><i data-feather="box" class="text-primary mr-50"></i> Detail Item Barang yang Diretur</h5>
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th>Produk</th>
                                <th class="text-center">Harga Satuan</th>
                                <th class="text-center">Qty Beli</th>
                                <th class="text-center">Qty Diretur</th>
                                <th class="text-center" style="width: 130px;">Qty Disetujui</th>
                                <th class="text-right">Subtotal Refund</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($return->items as $index => $item)
                                <tr>
                                    <td>
                                        <strong>{{ $item->product->name ?? ($item->orderItem->product_name ?? 'Produk') }}</strong>
                                        <input type="hidden" name="approved_items[{{ $index }}][id]" value="{{ $item->id }}">
                                    </td>
                                    <td class="text-center">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                                    <td class="text-center"><span class="badge badge-light-secondary">{{ $item->orderItem->quantity ?? '-' }}</span></td>
                                    <td class="text-center"><span class="badge badge-light-warning font-weight-bold">{{ $item->requested_qty }}</span></td>
                                    <td class="text-center">
                                        @if(in_array($return->status, ['pending', 'approved', 'shipping_back', 'received_at_warehouse']))
                                            <input type="number" 
                                                   name="approved_items[{{ $index }}][approved_qty]" 
                                                   class="form-control form-control-sm text-center approved-qty-input" 
                                                   data-price="{{ $item->unit_price }}" 
                                                   data-max="{{ $item->requested_qty }}" 
                                                   value="{{ $item->approved_qty ?: $item->requested_qty }}" 
                                                   min="0" 
                                                   max="{{ $item->requested_qty }}" 
                                                   required>
                                        @else
                                            <strong class="text-primary">{{ $item->approved_qty }}</strong>
                                        @endif
                                    </td>
                                    <td class="text-right font-weight-bold item-refund-subtotal">
                                        Rp {{ number_format(($item->approved_qty ?: $item->requested_qty) * $item->unit_price, 0, ',', '.') }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Right Column: Logistics, Refund Calculator & Action Form -->
    <div class="col-lg-4">
        <!-- Return Logistics Info -->
        <div class="card border-0 shadow-sm mb-2" style="border-radius: 16px;">
            <div class="card-body">
                <h5 class="font-weight-bold text-dark mb-1"><i data-feather="truck" class="text-primary mr-50"></i> Pengembalian Barang (Kurir)</h5>
                <div class="alert alert-info py-75 small font-weight-bold mb-1">
                    ℹ Biaya ongkir pengembalian barang dibebankan dan ditanggung oleh Pemilik Toko.
                </div>
                <table class="table table-borderless table-sm mb-0">
                    <tr>
                        <td class="text-muted pl-0" style="width: 120px;">Kurir Retur</td>
                        <td>: <strong>{{ strtoupper($return->return_courier_name ?: '-') }}</strong></td>
                    </tr>
                    <tr>
                        <td class="text-muted pl-0">No. Resi Retur</td>
                        <td>: <code class="text-dark">{{ $return->return_waybill_id ?: 'Belum diisi pelanggan' }}</code></td>
                    </tr>
                    <tr>
                        <td class="text-muted pl-0">Biaya Kirim</td>
                        <td>: <span class="badge badge-light-success font-weight-bold">Ditanggung Toko</span></td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Approval & Refund Action Card -->
        <div class="card border-0 shadow-sm mb-2" style="border-radius: 16px;">
            <div class="card-body">
                <h5 class="font-weight-bold text-dark mb-1"><i data-feather="dollar-sign" class="text-primary mr-50"></i> Kalkulasi & Proses Refund</h5>
                
                @php
                    $initialSubtotal = $return->items->sum(function($i) { return ($i->approved_qty ?: $i->requested_qty) * $i->unit_price; });
                    $initialFinal = $return->total_refund_amount ?: max(0, $initialSubtotal - $return->deducted_shipping_fee);
                @endphp

                <div class="p-1 mb-1 rounded bg-light border">
                    <div class="d-flex justify-content-between mb-50">
                        <span class="text-muted">Subtotal Items Retur:</span>
                        <strong id="calc-subtotal">Rp {{ number_format($initialSubtotal, 0, ',', '.') }}</strong>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-50">
                        <span class="text-muted">Potongan Ongkir Balik:</span>
                        <div style="width: 110px;">
                            @if(in_array($return->status, ['pending', 'approved', 'shipping_back', 'received_at_warehouse']))
                                <input type="number" name="deducted_shipping_fee" id="deducted-fee-input" class="form-control form-control-sm text-right" value="{{ (int)$return->deducted_shipping_fee }}" min="0" placeholder="0">
                            @else
                                <span class="font-weight-bold text-dark">Rp {{ number_format($return->deducted_shipping_fee, 0, ',', '.') }}</span>
                            @endif
                        </div>
                    </div>
                    <hr class="my-50">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="font-weight-bold text-dark">TOTAL REFUND:</span>
                        <h4 class="font-weight-bolder text-primary mb-0" id="calc-final-total">Rp {{ number_format($initialFinal, 0, ',', '.') }}</h4>
                    </div>
                </div>

                @if(in_array($return->status, ['pending', 'approved', 'shipping_back', 'received_at_warehouse']))
                    <div class="form-group mb-1">
                        <label class="font-weight-bold text-dark small" for="refund-method-select">Metode Refund Dana</label>
                        <select name="refund_method" id="refund-method-select" class="form-control" required>
                            <option value="midtrans_api">Otomatis via Midtrans API (E-Wallet/QRIS/CC)</option>
                            <option value="manual_transfer">Transfer Manual Bank (Virtual Account / Bank Transfer)</option>
                        </select>
                    </div>

                    <div class="form-group mb-1 d-none" id="manual-proof-group">
                        <label class="font-weight-bold text-dark small" for="manual-transfer-proof">Upload Bukti Transfer Refund (Manual)</label>
                        <input type="file" name="manual_transfer_proof" id="manual-transfer-proof" class="form-control-file">
                    </div>

                    <div class="form-group mb-1">
                        <label class="font-weight-bold text-dark small" for="admin-notes-input">Catatan Admin</label>
                        <textarea name="admin_notes" id="admin-notes-input" class="form-control" rows="2" placeholder="Catatan persetujuan / alasan retur...">{{ $return->admin_notes }}</textarea>
                    </div>

                    <div class="d-flex gap-2 mt-2">
                        <button type="submit" class="btn btn-success btn-block font-weight-bold py-75 mr-50" id="btn-approve-return">
                            <i data-feather="check-circle" class="mr-25"></i> Setujui & Process Refund
                        </button>
                    </div>
                        <i data-feather="x-circle" class="mr-25"></i> Tolak Pengajuan Retur
                    </button>
                </form>
                @endif
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    $(document).ready(function() {
        function calculateRefundTotal() {
            var subtotal = 0;
            if ($('.approved-qty-input').length > 0) {
                $('.approved-qty-input').each(function() {
                    var qty = parseInt($(this).val()) || 0;
                    var price = parseFloat($(this).data('price')) || 0;
                    var itemSubtotal = qty * price;
                    $(this).closest('tr').find('.item-refund-subtotal').text('Rp ' + itemSubtotal.toLocaleString('id-ID'));
                    subtotal += itemSubtotal;
                });
            } else {
                $('.item-refund-subtotal').each(function() {
                    var textVal = $(this).text().replace(/[^0-9]/g, '');
                    subtotal += parseFloat(textVal) || 0;
                });
            }

            var deductedFee = parseFloat($('#deducted-fee-input').val()) || 0;
            var finalTotal = Math.max(0, subtotal - deductedFee);

            $('#calc-subtotal').text('Rp ' + subtotal.toLocaleString('id-ID'));
            $('#calc-final-total').text('Rp ' + finalTotal.toLocaleString('id-ID'));
        }

        calculateRefundTotal();

        $('.approved-qty-input, #deducted-fee-input').on('input change', function() {
            calculateRefundTotal();
        });

        $('#refund-method-select').on('change', function() {
            if ($(this).val() === 'manual_transfer') {
                $('#manual-proof-group').removeClass('d-none');
            } else {
                $('#manual-proof-group').addClass('d-none');
            }
        });

        $('#form-approve-return').on('submit', function(e) {
            e.preventDefault();
            var formData = new FormData(this);

            Swal.fire({
                title: 'Konfirmasi Refund',
                text: 'Apakah Anda yakin ingin menyetujui retur dan memproses refund ini?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Setujui & Refund',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    $('#btn-approve-return').prop('disabled', true).text('Memproses...');
                    $.ajax({
                        url: "{{ route('admin.order-returns.approve', $return->id) }}",
                        type: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(res) {
                            Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message }).then(() => {
                                location.reload();
                            });
                        },
                        error: function(err) {
                            $('#btn-approve-return').prop('disabled', false).html('<i data-feather="check-circle" class="mr-25"></i> Setujui & Process Refund');
                            var msg = err.responseJSON ? err.responseJSON.message : 'Gagal memproses refund.';
                            Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
                        }
                    });
                }
            });
        });

        $('#btn-reject-return').on('click', function() {
            Swal.fire({
                title: 'Tolak Retur',
                input: 'textarea',
                inputLabel: 'Masukkan Alasan Penolakan Retur:',
                inputPlaceholder: 'Tuliskan alasan penolakan untuk pelanggan...',
                showCancelButton: true,
                confirmButtonText: 'Tolak Retur',
                confirmButtonColor: '#ea5455',
                cancelButtonText: 'Batal',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Alasan penolakan wajib diisi!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    $.post("{{ route('admin.order-returns.reject', $return->id) }}", {
                        _token: "{{ csrf_token() }}",
                        admin_notes: result.value
                    }, function(res) {
                        Swal.fire({ icon: 'success', title: 'Ditolak', text: res.message }).then(() => {
                            location.reload();
                        });
                    }).fail(function(err) {
                        var msg = err.responseJSON ? err.responseJSON.message : 'Gagal menolak retur.';
                        Swal.fire({ icon: 'error', title: 'Gagal', text: msg });
                    });
                }
            });
        });
    });
</script>
@endpush
@endsection
