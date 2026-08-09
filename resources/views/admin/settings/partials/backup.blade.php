<!-- TAB 7: Backup & Reset Data -->
<div class="tab-pane fade" id="backup" role="tabpanel" aria-labelledby="backup-tab">
    <div class="row">
        <!-- Section 1: Backup Database -->
        <div class="col-md-6 border-right">
            <div class="card shadow-none border mb-0">
                <div class="card-header bg-light-primary py-1">
                    <h5 class="card-title font-weight-bold text-primary mb-0">
                        <i data-feather="download-cloud" class="mr-50"></i>Backup Database
                    </h5>
                </div>
                <div class="card-body pt-2">
                    <p class="text-muted small">
                        Unduh salinan cadangan (backup) seluruh struktur dan data dalam database sistem berupa file SQL. Salinan ini dapat digunakan untuk pemulihan data (restore) di kemudian hari.
                    </p>
                    <div class="alert alert-primary p-1 mb-2" role="alert">
                        <div class="alert-body small">
                            <i data-feather="info" class="mr-50"></i>
                            File backup mencakup seluruh tabel data transaksi, master produk, kustomer, pesanan, sertifikasi pengguna dan pengaturan aplikasi.
                        </div>
                    </div>
                    <a href="{{ route('admin.settings.backup.download') }}" class="btn btn-primary font-weight-bold btn-block">
                        <i data-feather="download" class="mr-50"></i> Unduh Backup Database (.sql)
                    </a>
                </div>
            </div>
        </div>

        <!-- Section 2: Reset Data Systems -->
        <div class="col-md-6">
            <div class="card shadow-none border mb-0 border-danger">
                <div class="card-header bg-light-danger py-1">
                    <h5 class="card-title font-weight-bold text-danger mb-0">
                        <i data-feather="alert-triangle" class="mr-50"></i>Reset Data Sistem
                    </h5>
                </div>
                <div class="card-body pt-2">
                    <p class="text-muted small">
                        Fitur ini akan mengosongkan/menghapus seluruh data operasional (Pesanan, Produk, Stok, Transaksi, Log, Kustomer, Supplier, Voucher, dll).
                    </p>
                    <div class="alert alert-warning p-1 mb-2" role="alert">
                        <div class="alert-body small">
                            <strong class="d-block mb-25"><i data-feather="shield-check" class="mr-50"></i>Data Yang Dikecualikan (Aman):</strong>
                            Data <strong>User Admin</strong>, <strong>Role</strong>, <strong>Permission</strong>, dan <strong>Pengaturan Aplikasi</strong> tidak akan dihapus sehingga sistem tetap dapat diakses secara normal.
                        </div>
                    </div>
                    
                    <form action="{{ route('admin.settings.data.reset') }}" method="POST" id="resetDataForm" class="d-none">
                        @csrf
                        <input type="hidden" name="confirm_text" id="hidden_confirm_text" value="">
                    </form>

                    <button type="button" class="btn btn-danger font-weight-bold btn-block" id="btn-trigger-reset-data">
                        <i data-feather="trash-2" class="mr-50"></i> Reset Data Operasional
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
