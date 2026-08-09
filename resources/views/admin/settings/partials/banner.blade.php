<!-- TAB 3: Banner Promo & Flash Sale -->
<div class="tab-pane fade" id="banner" role="tabpanel" aria-labelledby="banner-tab">
    <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data">
        @csrf
        <input type="hidden" name="app_name" value="{{ $settings['app_name'] ?? '' }}">
        <input type="hidden" name="app_short_name" value="{{ $settings['app_short_name'] ?? '' }}">
        <input type="hidden" name="primary_color" value="{{ $settings['primary_color'] ?? '' }}">
        <input type="hidden" name="secondary_color" value="{{ $settings['secondary_color'] ?? '' }}">
        <input type="hidden" name="store_name" value="{{ $settings['store_name'] ?? '' }}">

        <div class="row">
            <!-- Banner Promo 1 -->
            <div class="col-md-6 border-right">
                <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="sidebar" class="mr-50"></i>Banner Samping 1</h5>
                
                <div class="form-group">
                    <label for="side_banner_1_badge" class="font-weight-bold">Badge Text</label>
                    <input type="text" id="side_banner_1_badge" name="side_banner_1_badge" class="form-control" value="{{ old('side_banner_1_badge', $settings['side_banner_1_badge'] ?? '') }}" placeholder="Contoh: KONSULTASI GRATIS">
                </div>

                <div class="form-group">
                    <label for="side_banner_1_title" class="font-weight-bold">Judul Banner</label>
                    <input type="text" id="side_banner_1_title" name="side_banner_1_title" class="form-control" value="{{ old('side_banner_1_title', $settings['side_banner_1_title'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="side_banner_1_subtitle" class="font-weight-bold">Subjudul Banner</label>
                    <input type="text" id="side_banner_1_subtitle" name="side_banner_1_subtitle" class="form-control" value="{{ old('side_banner_1_subtitle', $settings['side_banner_1_subtitle'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="side_banner_1_link" class="font-weight-bold">Link URL Banner</label>
                    <input type="text" id="side_banner_1_link" name="side_banner_1_link" class="form-control" value="{{ old('side_banner_1_link', $settings['side_banner_1_link'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="side_banner_1_image" class="font-weight-bold">Gambar Banner 1</label>
                    <div class="custom-file">
                        <input type="file" class="custom-file-input" id="side_banner_1_image" name="side_banner_1_image">
                        <label class="custom-file-label" for="side_banner_1_image">Ganti Gambar Banner</label>
                    </div>
                    @if(!empty($settings['side_banner_1_image']))
                        <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                            <img src="{{ \App\Helpers\StorageHelper::url($settings['side_banner_1_image']) }}" alt="Banner 1" style="max-height: 80px; max-width: 150px; object-fit: cover;">
                            <p class="small text-muted mb-0 mt-25">Gambar aktif</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Banner Promo 2 -->
            <div class="col-md-6">
                <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="sidebar" class="mr-50"></i>Banner Samping 2</h5>
                
                <div class="form-group">
                    <label for="side_banner_2_badge" class="font-weight-bold">Badge Text</label>
                    <input type="text" id="side_banner_2_badge" name="side_banner_2_badge" class="form-control" value="{{ old('side_banner_2_badge', $settings['side_banner_2_badge'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="side_banner_2_title" class="font-weight-bold">Judul Banner</label>
                    <input type="text" id="side_banner_2_title" name="side_banner_2_title" class="form-control" value="{{ old('side_banner_2_title', $settings['side_banner_2_title'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="side_banner_2_subtitle" class="font-weight-bold">Subjudul Banner</label>
                    <input type="text" id="side_banner_2_subtitle" name="side_banner_2_subtitle" class="form-control" value="{{ old('side_banner_2_subtitle', $settings['side_banner_2_subtitle'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="side_banner_2_link" class="font-weight-bold">Link URL Banner</label>
                    <input type="text" id="side_banner_2_link" name="side_banner_2_link" class="form-control" value="{{ old('side_banner_2_link', $settings['side_banner_2_link'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="side_banner_2_image" class="font-weight-bold">Gambar Banner 2</label>
                    <div class="custom-file">
                        <input type="file" class="custom-file-input" id="side_banner_2_image" name="side_banner_2_image">
                        <label class="custom-file-label" for="side_banner_2_image">Ganti Gambar Banner</label>
                    </div>
                    @if(!empty($settings['side_banner_2_image']))
                        <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                            <img src="{{ \App\Helpers\StorageHelper::url($settings['side_banner_2_image']) }}" alt="Banner 2" style="max-height: 80px; max-width: 150px; object-fit: cover;">
                            <p class="small text-muted mb-0 mt-25">Gambar aktif</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Flash Sale Schedule -->
            <div class="col-12 mt-3 pt-2 border-top">
                <h5 class="mb-1 font-weight-bold text-danger"><i data-feather="clock" class="mr-50"></i>Penjadwalan Flash Sale</h5>
                
                <div class="row">
                    <div class="col-md-6 form-group">
                        <label for="flash_sale_end_time" class="font-weight-bold">Waktu Berakhir Flash Sale (Format: YYYY-MM-DD HH:MM)</label>
                        <input type="text" id="flash_sale_end_time" name="flash_sale_end_time" class="form-control" value="{{ old('flash_sale_end_time', $settings['flash_sale_end_time'] ?? '') }}" placeholder="Contoh: 2026-06-15 08:54">
                    </div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-end mt-2 pt-1 border-top">
            <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Banner & Promo</button>
        </div>
    </form>
</div>
