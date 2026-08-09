<!-- TAB 2: Social Media -->
<div class="tab-pane fade" id="social" role="tabpanel" aria-labelledby="social-tab">
    <form action="{{ route('admin.settings.update') }}" method="POST">
        @csrf
        <input type="hidden" name="app_name" value="{{ $settings['app_name'] ?? '' }}">
        <input type="hidden" name="app_short_name" value="{{ $settings['app_short_name'] ?? '' }}">
        <input type="hidden" name="primary_color" value="{{ $settings['primary_color'] ?? '' }}">
        <input type="hidden" name="secondary_color" value="{{ $settings['secondary_color'] ?? '' }}">
        <input type="hidden" name="store_name" value="{{ $settings['store_name'] ?? '' }}">

        <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="share-2" class="mr-50"></i>Pranala Sosial Media</h5>
        <p class="text-muted small">Tautkan akun sosial media toko Anda untuk ditampilkan di halaman depan web.</p>
        
        <div class="row">
            <div class="col-md-6 form-group">
                <label for="social_instagram" class="font-weight-bold">Instagram URL</label>
                <input type="url" id="social_instagram" name="social_instagram" class="form-control" value="{{ old('social_instagram', $settings['social_instagram'] ?? '') }}" placeholder="https://instagram.com/username">
            </div>

            <div class="col-md-6 form-group">
                <label for="social_facebook" class="font-weight-bold">Facebook URL</label>
                <input type="url" id="social_facebook" name="social_facebook" class="form-control" value="{{ old('social_facebook', $settings['social_facebook'] ?? '') }}" placeholder="https://facebook.com/page">
            </div>

            <div class="col-md-6 form-group">
                <label for="social_tiktok" class="font-weight-bold">Tiktok URL</label>
                <input type="url" id="social_tiktok" name="social_tiktok" class="form-control" value="{{ old('social_tiktok', $settings['social_tiktok'] ?? '') }}" placeholder="https://tiktok.com/@username">
            </div>
        </div>
        <div class="d-flex justify-content-end mt-2 pt-1 border-top">
            <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Sosial Media</button>
        </div>
    </form>
</div>
