<!-- TAB 4: Banner Slider Utama (CRUD Banners Table) -->
<div class="tab-pane fade" id="slider" role="tabpanel" aria-labelledby="slider-tab">
    <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
            <h5 class="font-weight-bold text-primary mb-0"><i data-feather="layers" class="mr-50"></i>Kelola Banner Slider Utama</h5>
            <p class="text-muted small mb-0">Slider besar utama/carousel di halaman depan toko.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm font-weight-bold" data-toggle="modal" data-target="#addBannerModal">
            <i data-feather="plus" class="mr-25"></i> Tambah Banner Baru
        </button>
    </div>

    <div class="table-responsive">
        <table class="table table-hover border">
            <thead class="thead-light">
                <tr>
                    <th style="width: 70px;">Urutan</th>
                    <th style="width: 120px;">Gambar</th>
                    <th>Badge & Judul</th>
                    <th>Tombol & Link</th>
                    <th style="width: 100px;">Status</th>
                    <th style="width: 150px;" class="text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($banners as $banner)
                    <tr>
                        <td class="font-weight-bold text-center">{{ $banner->order }}</td>
                        <td>
                            <img src="{{ \App\Helpers\StorageHelper::url($banner->image) }}" alt="image" style="width: 100px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                        </td>
                        <td>
                            @if($banner->badge)
                                <span class="badge badge-light-primary mb-25">{{ $banner->badge }}</span><br>
                            @endif
                            <span class="font-weight-bold">{{ $banner->title }}</span><br>
                            <small class="text-muted">{{ $banner->subtitle }}</small>
                        </td>
                        <td>
                            <span class="badge badge-light-secondary mb-25"><i data-feather="play-circle" style="width: 12px; height: 12px;"></i> {{ $banner->button_text }}</span><br>
                            <small class="text-muted">{{ $banner->link ?: '-' }}</small>
                        </td>
                        <td>
                            @if($banner->is_active)
                                <span class="badge badge-pill badge-light-success font-weight-bold">Aktif</span>
                            @else
                                <span class="badge badge-pill badge-light-danger font-weight-bold">Nonaktif</span>
                            @endif
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn btn-sm btn-outline-warning btn-edit-banner py-25 px-50" 
                                    data-id="{{ $banner->id }}"
                                    data-title="{{ $banner->title }}"
                                    data-subtitle="{{ $banner->subtitle }}"
                                    data-badge="{{ $banner->badge }}"
                                    data-button_text="{{ $banner->button_text }}"
                                    data-link="{{ $banner->link }}"
                                    data-order="{{ $banner->order }}"
                                    data-is_active="{{ $banner->is_active ? 1 : 0 }}"
                                    data-image="{{ \App\Helpers\StorageHelper::url($banner->image) }}">
                                <i data-feather="edit-2"></i> Edit
                            </button>
                            
                            <form action="{{ route('admin.settings.banners.delete', $banner->id) }}" method="POST" class="d-inline delete-banner-form ml-50">
                                @csrf
                                <button type="submit" class="btn btn-sm btn-outline-danger btn-delete-banner py-25 px-50">
                                    <i data-feather="trash-2"></i> Hapus
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="text-center text-muted py-3">Belum ada banner slider yang terdaftar.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
