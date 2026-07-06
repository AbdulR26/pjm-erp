@extends('layouts.app')
@section('title', 'Manajemen Ulasan Produk')

@section('content')
<div class="row">
    <!-- Header -->
    <div class="col-12 mb-2">
        <div class="card bg-primary text-white mb-0" style="background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7)) !important; border-radius: 8px;">
            <div class="card-header d-flex align-items-center py-2">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">
                        <i data-feather="star" style="width: 24px; height: 24px; color: white;"></i>
                    </div>
                    <div class="ml-1">
                        <h4 class="card-title font-weight-bold text-white mb-0">Ulasan & Rating Produk</h4>
                        <p class="text-white-50 small mb-0">Moderasi ulasan pembeli, sembunyikan ulasan spam, dan berikan tanggapan resmi toko.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Card -->
    <div class="col-12 mb-2">
        <div class="card">
            <div class="card-body">
                <form action="{{ route('admin.reviews.index') }}" method="GET" class="row">
                    <div class="col-md-4 form-group">
                        <label for="search" class="font-weight-bold">Cari Produk / Pelanggan</label>
                        <input type="text" id="search" name="search" class="form-control" value="{{ request('search') }}" placeholder="Cari nama produk, customer, atau komentar...">
                    </div>
                    <div class="col-md-3 form-group">
                        <label for="rating" class="font-weight-bold">Rating Bintang</label>
                        <select id="rating" name="rating" class="form-control">
                            <option value="">Semua Bintang</option>
                            @for($i=5; $i>=1; $i--)
                                <option value="{{ $i }}" {{ request('rating') == $i ? 'selected' : '' }}>
                                    {{ $i }} Bintang
                                </option>
                            @endfor
                        </select>
                    </div>
                    <div class="col-md-3 form-group">
                        <label for="status" class="font-weight-bold">Status Tampil</label>
                        <select id="status" name="status" class="form-control">
                            <option value="">Semua Status</option>
                            <option value="visible" {{ request('status') === 'visible' ? 'selected' : '' }}>Ditampilkan</option>
                            <option value="hidden" {{ request('status') === 'hidden' ? 'selected' : '' }}>Disembunyikan</option>
                        </select>
                    </div>
                    <div class="col-md-2 form-group d-flex align-items-end">
                        <button type="submit" class="btn btn-primary btn-block font-weight-bold">
                            <i data-feather="filter" class="mr-25"></i> Filter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Reviews List -->
    <div class="col-12">
        <div class="card">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="thead-light">
                            <tr>
                                <th width="20%">Produk & Order</th>
                                <th width="20%">Pelanggan</th>
                                <th width="15%">Rating & Tanggal</th>
                                <th>Ulasan</th>
                                <th width="15%">Balasan Toko</th>
                                <th width="12%" class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($reviews as $review)
                                <tr id="review-row-{{ $review->id }}" class="{{ $review->is_hidden ? 'table-warning' : '' }}">
                                    <!-- Product Info -->
                                    <td>
                                        <div class="font-weight-bold text-dark">{{ $review->product->name ?? 'Produk Dihapus' }}</div>
                                        <div class="small text-muted mt-25">
                                            Order: <span class="text-monospace">{{ $review->order->order_number ?? '-' }}</span>
                                        </div>
                                    </td>
                                    <!-- Customer Info -->
                                    <td>
                                        <div class="font-weight-bold">{{ $review->customer->name ?? 'Customer Umum' }}</div>
                                        <div class="small text-muted mt-25">{{ $review->customer->phone ?? '' }}</div>
                                    </td>
                                    <!-- Rating & Time -->
                                    <td>
                                        <div class="text-warning">
                                            @for($i=1; $i<=5; $i++)
                                                <i data-feather="star" class="{{ $i <= $review->rating ? 'fill-current' : '' }}" style="width: 16px; height: 16px;"></i>
                                            @endfor
                                        </div>
                                        <div class="small text-muted mt-50">
                                            {{ $review->created_at->format('Y-m-d H:i') }}
                                        </div>
                                    </td>
                                    <!-- Comment & Media -->
                                    <td>
                                        <div class="text-dark">{{ $review->comment ?: '-' }}</div>
                                        
                                        <!-- Photo/Video Attachments -->
                                        @if(!empty($review->photo_urls) || $review->video_url)
                                            <div class="d-flex flex-wrap mt-50">
                                                @foreach($review->photo_urls as $photo)
                                                    <a href="javascript:void(0)" class="review-media-link mr-50 mb-50" data-src="{{ $photo }}" data-type="image">
                                                        <img src="{{ $photo }}" alt="Review Attachment" class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                                                    </a>
                                                @endforeach
                                                @if($review->video_url)
                                                    <a href="javascript:void(0)" class="review-media-link mb-50 btn btn-flat-danger p-0" data-src="{{ $review->video_url }}" data-type="video">
                                                        <div class="d-flex align-items-center justify-content-center bg-light border rounded" style="width: 60px; height: 60px; position: relative;">
                                                            <i data-feather="video" class="text-danger" style="width: 24px; height: 24px;"></i>
                                                            <span class="badge badge-pill badge-danger" style="position: absolute; bottom: 2px; right: 2px; font-size: 8px;">VIDEO</span>
                                                        </div>
                                                    </a>
                                                @endif
                                            </div>
                                        @endif
                                    </td>
                                    <!-- Seller Reply -->
                                    <td id="reply-cell-{{ $review->id }}">
                                        @if($review->seller_reply)
                                            <div class="text-dark-50 font-italic">{{ $review->seller_reply }}</div>
                                            <div class="small text-muted mt-25">
                                                Dibalas: {{ $review->seller_reply_at ? $review->seller_reply_at->format('Y-m-d H:i') : '-' }}
                                            </div>
                                        @else
                                            <span class="badge badge-light-secondary font-weight-bold">Belum dibalas</span>
                                        @endif
                                    </td>
                                    <!-- Actions -->
                                    <td class="text-center">
                                        <div class="btn-group-vertical">
                                            <!-- Reply Button -->
                                            <button type="button" class="btn btn-sm btn-outline-primary font-weight-bold btn-reply-review" 
                                                    data-id="{{ $review->id }}" 
                                                    data-product="{{ $review->product->name ?? 'Produk' }}" 
                                                    data-customer="{{ $review->customer->name ?? 'Customer' }}"
                                                    data-rating="{{ $review->rating }}"
                                                    data-comment="{{ $review->comment }}"
                                                    data-reply="{{ $review->seller_reply }}">
                                                <i data-feather="message-square" class="mr-25"></i> Balas
                                            </button>
                                            
                                            <!-- Hide/Show Toggle Button -->
                                            <button type="button" class="btn btn-sm btn-outline-warning font-weight-bold mt-25 btn-toggle-review" data-id="{{ $review->id }}">
                                                <i data-feather="{{ $review->is_hidden ? 'eye' : 'eye-off' }}" class="mr-25"></i> 
                                                <span>{{ $review->is_hidden ? 'Tampilkan' : 'Sembunyikan' }}</span>
                                            </button>

                                            <!-- Delete Button -->
                                            <button type="button" class="btn btn-sm btn-outline-danger font-weight-bold mt-25 btn-delete-review" data-id="{{ $review->id }}">
                                                <i data-feather="trash-2" class="mr-25"></i> Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="text-center py-3 text-muted">
                                        <i data-feather="alert-circle" class="mr-25"></i> Tidak ada data ulasan produk.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="card-footer d-flex justify-content-end pb-0">
                    {{ $reviews->links() }}
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL BALAS ULASAN -->
<!-- ============================================== -->
<div class="modal fade" id="replyReviewModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title text-white font-weight-bold">Balas Ulasan Pelanggan</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="replyReviewForm" method="POST">
                @csrf
                <div class="modal-body">
                    <!-- Review Info Panel -->
                    <div class="bg-light p-1 rounded mb-2 border">
                        <div class="d-flex justify-content-between align-items-center mb-50">
                            <span class="font-weight-bold text-dark" id="modal-customer">Pelanggan</span>
                            <span class="text-warning font-weight-bold" id="modal-rating">5 Bintang</span>
                        </div>
                        <div class="small text-muted font-weight-bold mb-50" id="modal-product">Nama Produk</div>
                        <div class="text-dark font-italic bg-white p-50 border rounded" id="modal-comment">"Isi ulasan pelanggan"</div>
                    </div>

                    <div class="form-group">
                        <label for="reply_text" class="font-weight-bold text-primary">Tanggapan Toko <span class="text-danger">*</span></label>
                        <textarea id="reply_text" name="reply" class="form-control" rows="5" placeholder="Tuliskan respon resmi toko Anda..." required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary font-weight-bold" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary font-weight-bold">Kirim Tanggapan</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL MEDIA PREVIEW -->
<!-- ============================================== -->
<div class="modal fade" id="mediaPreviewModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content bg-transparent border-0 shadow-none">
            <div class="modal-body p-0 text-center position-relative">
                <button type="button" class="close text-white position-absolute" data-dismiss="modal" aria-label="Close" style="top: 15px; right: 20px; font-size: 30px; z-index: 9999;">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div id="media-preview-container" class="rounded overflow-hidden">
                    <!-- Media element injected here via JS -->
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('script')
<script>
    $(document).ready(function() {
        // Open Media Preview
        $('.review-media-link').on('click', function() {
            var src = $(this).data('src');
            var type = $(this).data('type');
            var container = $('#media-preview-container');
            
            container.empty();
            if (type === 'image') {
                container.append('<img src="' + src + '" class="img-fluid rounded border shadow-lg" style="max-height: 80vh;">');
            } else if (type === 'video') {
                container.append('<video src="' + src + '" class="w-100 rounded border shadow-lg" controls autoplay style="max-height: 80vh;"></video>');
            }
            
            $('#mediaPreviewModal').modal('show');
        });

        // Trigger Reply Modal
        $('.btn-reply-review').on('click', function() {
            var id = $(this).data('id');
            var product = $(this).data('product');
            var customer = $(this).data('customer');
            var rating = $(this).data('rating');
            var comment = $(this).data('comment');
            var reply = $(this).data('reply');

            var modal = $('#replyReviewModal');
            $('#replyReviewForm').attr('action', '{{ url("/admin/reviews") }}/' + id + '/reply');
            $('#modal-customer').text(customer);
            $('#modal-product').text(product);
            $('#modal-rating').text(rating + ' Bintang');
            $('#modal-comment').text(comment ? '"' + comment + '"' : '"Tidak ada komentar tertulis"');
            $('#reply_text').val(reply);

            modal.modal('show');
        });

        // Submit Reply Form via AJAX
        $('#replyReviewForm').on('submit', function(e) {
            e.preventDefault();
            var form = $(this);
            var actionUrl = form.attr('action');
            var submitBtn = form.find('button[type="submit"]');

            submitBtn.prop('disabled', true).text('Mengirim...');

            $.ajax({
                url: actionUrl,
                type: 'POST',
                data: form.serialize(),
                success: function(response) {
                    submitBtn.prop('disabled', false).text('Kirim Tanggapan');
                    if (response.success) {
                        $('#replyReviewModal').modal('hide');
                        Swal.fire('Berhasil!', response.message, 'success').then(function() {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Gagal!', response.message, 'error');
                    }
                },
                error: function(xhr) {
                    submitBtn.prop('disabled', false).text('Kirim Tanggapan');
                    var errMsg = 'Gagal menyimpan tanggapan.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message;
                    }
                    Swal.fire('Error!', errMsg, 'error');
                }
            });
        });

        // Toggle Review Visibility via AJAX
        $('.btn-toggle-review').on('click', function() {
            var btn = $(this);
            var id = btn.data('id');
            btn.prop('disabled', true);

            $.ajax({
                url: '{{ url("/admin/reviews") }}/' + id + '/toggle',
                type: 'POST',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    btn.prop('disabled', false);
                    if (response.success) {
                        // Success Toast
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                        Toast.fire({
                            icon: 'success',
                            title: response.message
                        });

                        // Visual row update
                        var row = $('#review-row-' + id);
                        var icon = btn.find('svg');
                        var text = btn.find('span');

                        if (response.is_hidden) {
                            row.addClass('table-warning');
                            text.text('Tampilkan');
                            // Replace feather icon to eye
                            btn.html('<i data-feather="eye" class="mr-25"></i> <span>Tampilkan</span>');
                        } else {
                            row.removeClass('table-warning');
                            text.text('Sembunyikan');
                            btn.html('<i data-feather="eye-off" class="mr-25"></i> <span>Sembunyikan</span>');
                        }
                        feather.replace(); // Refresh icons
                    } else {
                        Swal.fire('Gagal!', response.message, 'error');
                    }
                },
                error: function(xhr) {
                    btn.prop('disabled', false);
                    var errMsg = 'Gagal memproses permintaan.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message;
                    }
                    Swal.fire('Error!', errMsg, 'error');
                }
            });
        });

        // Delete Review via AJAX
        $('.btn-delete-review').on('click', function() {
            var btn = $(this);
            var id = btn.data('id');

            Swal.fire({
                title: 'Hapus Ulasan?',
                text: "Ulasan yang dihapus tidak dapat dipulihkan kembali.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-outline-secondary ml-1'
                },
                buttonsStyling: false
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: '{{ url("/admin/reviews") }}/' + id,
                        type: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        success: function(response) {
                            if (response.success) {
                                Swal.fire('Terhapus!', response.message, 'success').then(function() {
                                    $('#review-row-' + id).fadeOut(300, function() { $(this).remove(); });
                                });
                            } else {
                                Swal.fire('Gagal!', response.message, 'error');
                            }
                        },
                        error: function(xhr) {
                            var errMsg = 'Gagal menghapus ulasan.';
                            if (xhr.responseJSON && xhr.responseJSON.message) {
                                errMsg = xhr.responseJSON.message;
                            }
                            Swal.fire('Error!', errMsg, 'error');
                        }
                    });
                }
            });
        });
    });
</script>
@endpush
