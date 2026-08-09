<!-- TAB 1: General & Appearance -->
<div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="general-tab">
    <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data">
        @csrf
        <div class="row">
            <div class="col-md-6">
                <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="info" class="mr-50"></i>Identitas Toko & Aplikasi</h5>
                
                <div class="form-group">
                    <label for="store_name" class="font-weight-bold">Nama Toko</label>
                    <input type="text" id="store_name" name="store_name" class="form-control" value="{{ old('store_name', $settings['store_name'] ?? 'Putri Jaya Mobil') }}" required>
                </div>

                <div class="form-group">
                    <label for="app_name" class="font-weight-bold">Nama Aplikasi Admin</label>
                    <input type="text" id="app_name" name="app_name" class="form-control" value="{{ old('app_name', $settings['app_name'] ?? 'Putri Jaya Mobil') }}" required>
                </div>

                <div class="form-group">
                    <label for="app_short_name" class="font-weight-bold">Singkatan Nama Aplikasi</label>
                    <input type="text" id="app_short_name" name="app_short_name" class="form-control" value="{{ old('app_short_name', $settings['app_short_name'] ?? 'PJM') }}" required>
                </div>

                <div class="form-group">
                    <label for="store_email" class="font-weight-bold">Email Toko</label>
                    <input type="email" id="store_email" name="store_email" class="form-control" value="{{ old('store_email', $settings['store_email'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="store_phone" class="font-weight-bold">No. Telepon Toko</label>
                    <input type="text" id="store_phone" name="store_phone" class="form-control" value="{{ old('store_phone', $settings['store_phone'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="store_whatsapp" class="font-weight-bold">No. WhatsApp Toko (Format: 628xxx)</label>
                    <input type="text" id="store_whatsapp" name="store_whatsapp" class="form-control" value="{{ old('store_whatsapp', $settings['store_whatsapp'] ?? '') }}">
                </div>

                <div class="form-group">
                    <label for="store_address" class="font-weight-bold">Alamat Toko</label>
                    <textarea id="store_address" name="store_address" class="form-control" rows="3">{{ old('store_address', $settings['store_address'] ?? '') }}</textarea>
                </div>

                <div class="form-group">
                    <label for="store_city" class="font-weight-bold">Kota / Lokasi Toko (Untuk Tampilan Produk)</label>
                    <input type="text" id="store_city" name="store_city" class="form-control" value="{{ old('store_city', $settings['store_city'] ?? 'Kota Bekasi') }}">
                </div>
            </div>

            <div class="col-md-6">
                <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="palette" class="mr-50"></i>Tema Warna Panel Admin</h5>
                
                <div class="row">
                    <div class="col-md-6 form-group">
                        <label for="primary_color" class="font-weight-bold">Warna Utama (Primary)</label>
                        <div class="input-group">
                            <input type="color" class="form-control p-25" style="height: 38px; max-width: 50px;" value="{{ old('primary_color', $settings['primary_color'] ?? '#7367f0') }}" oninput="document.getElementById('primary_color_text').value = this.value">
                            <input type="text" id="primary_color_text" name="primary_color" class="form-control" value="{{ old('primary_color', $settings['primary_color'] ?? '#7367f0') }}" required>
                        </div>
                    </div>
                    <div class="col-md-6 form-group">
                        <label for="secondary_color" class="font-weight-bold">Warna Sekunder</label>
                        <div class="input-group">
                            <input type="color" class="form-control p-25" style="height: 38px; max-width: 50px;" value="{{ old('secondary_color', $settings['secondary_color'] ?? '#82868b') }}" oninput="document.getElementById('secondary_color_text').value = this.value">
                            <input type="text" id="secondary_color_text" name="secondary_color" class="form-control" value="{{ old('secondary_color', $settings['secondary_color'] ?? '#82868b') }}" required>
                        </div>
                    </div>
                </div>

                <h5 class="mt-2 mb-1 font-weight-bold text-primary"><i data-feather="image" class="mr-50"></i>Logo & Favicon</h5>

                <div class="form-group">
                    <label for="logo" class="font-weight-bold">Logo Aplikasi</label>
                    <div class="custom-file mb-1">
                        <input type="file" class="custom-file-input" id="logo" name="logo">
                        <label class="custom-file-label" for="logo">Pilih File Logo</label>
                    </div>
                    @if(!empty($settings['logo']))
                        <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                            <img src="{{ \App\Helpers\StorageHelper::url($settings['logo']) }}" alt="App Logo" style="max-height: 50px;">
                            <p class="small text-muted mb-0 mt-25">Logo aktif saat ini</p>
                        </div>
                    @endif
                </div>

                <div class="form-group mt-2">
                    <label for="logo_favicon" class="font-weight-bold">Favicon Aplikasi</label>
                    <div class="custom-file mb-1">
                        <input type="file" class="custom-file-input" id="logo_favicon" name="logo_favicon">
                        <label class="custom-file-label" for="logo_favicon">Pilih File Favicon</label>
                    </div>
                    @if(!empty($settings['logo_favicon']))
                        <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                            <img src="{{ \App\Helpers\StorageHelper::url($settings['logo_favicon']) }}" alt="App Favicon" style="max-height: 32px;">
                            <p class="small text-muted mb-0 mt-25">Favicon aktif saat ini</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-end mt-2 pt-1 border-top">
            <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Perubahan Toko</button>
        </div>
    </form>
</div>
