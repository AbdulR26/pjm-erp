<!-- ============================================== -->
<!-- MODAL TAMBAH BANNER -->
<!-- ============================================== -->
<div class="modal fade" id="addBannerModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title text-white font-weight-bold">Tambah Banner Baru</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form action="{{ route('admin.settings.banners.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <label for="title" class="font-weight-bold">Judul Banner <span class="text-danger">*</span></label>
                        <input type="text" id="title" name="title" class="form-control" placeholder="Contoh: Suku Cadang Asli Toyota" required>
                    </div>
                    <div class="form-group">
                        <label for="subtitle" class="font-weight-bold">Subjudul Banner</label>
                        <input type="text" id="subtitle" name="subtitle" class="form-control" placeholder="Contoh: Diskon Hingga 30% untuk Oli Mesin">
                    </div>
                    <div class="form-group">
                        <label for="badge" class="font-weight-bold">Badge Text</label>
                        <input type="text" id="badge" name="badge" class="form-control" placeholder="Contoh: BEST SELLER">
                    </div>
                    <div class="form-group">
                        <label for="button_text" class="font-weight-bold">Teks Tombol <span class="text-danger">*</span></label>
                        <input type="text" id="button_text" name="button_text" class="form-control" value="Belanja Sekarang" required>
                    </div>
                    <div class="form-group">
                        <label for="link" class="font-weight-bold">Link URL Tujuan</label>
                        <input type="text" id="link" name="link" class="form-control" placeholder="Contoh: /produk-kategori/oli">
                    </div>
                    <div class="form-group">
                        <label for="order" class="font-weight-bold">Urutan Tampil (Order)</label>
                        <input type="number" id="order" name="order" class="form-control" value="0">
                    </div>
                    <div class="form-group">
                        <label for="image" class="font-weight-bold">Gambar Banner <span class="text-danger">*</span></label>
                        <div class="custom-file">
                            <input type="file" class="custom-file-input" id="image" name="image" required>
                            <label class="custom-file-label" for="image">Pilih Gambar</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="custom-control custom-checkbox mt-50">
                            <input type="checkbox" class="custom-control-input" id="is_active" name="is_active" value="1" checked>
                            <label class="custom-control-label font-weight-bold" for="is_active">Aktifkan Banner Ini</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary btn-sm font-weight-bold"><i data-feather="save" class="mr-25"></i> Tambah Banner</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL EDIT BANNER -->
<!-- ============================================== -->
<div class="modal fade" id="editBannerModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-warning text-white">
                <h5 class="modal-title text-white font-weight-bold">Edit Banner Slider</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="editBannerForm" action="" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <label for="edit_title" class="font-weight-bold">Judul Banner <span class="text-danger">*</span></label>
                        <input type="text" id="edit_title" name="title" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_subtitle" class="font-weight-bold">Subjudul Banner</label>
                        <input type="text" id="edit_subtitle" name="subtitle" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_badge" class="font-weight-bold">Badge Text</label>
                        <input type="text" id="edit_badge" name="badge" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_button_text" class="font-weight-bold">Teks Tombol <span class="text-danger">*</span></label>
                        <input type="text" id="edit_button_text" name="button_text" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_link" class="font-weight-bold">Link URL Tujuan</label>
                        <input type="text" id="edit_link" name="link" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_order" class="font-weight-bold">Urutan Tampil (Order)</label>
                        <input type="number" id="edit_order" name="order" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_image" class="font-weight-bold">Gambar Banner (Kosongkan jika tidak diganti)</label>
                        <div class="custom-file mb-1">
                            <input type="file" class="custom-file-input" id="edit_image" name="image">
                            <label class="custom-file-label" for="edit_image">Pilih Gambar Baru</label>
                        </div>
                        <img id="edit_image_preview" src="" alt="preview" style="max-height: 80px; max-width: 150px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; display: none;">
                    </div>
                    <div class="form-group">
                        <div class="custom-control custom-checkbox mt-50">
                            <input type="checkbox" class="custom-control-input" id="edit_is_active" name="is_active" value="1">
                            <label class="custom-control-label font-weight-bold" for="edit_is_active">Aktifkan Banner Ini</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning btn-sm font-weight-bold text-white"><i data-feather="save" class="mr-25"></i> Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
</div>
