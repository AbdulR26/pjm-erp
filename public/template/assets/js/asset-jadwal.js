$(function () {
    const scheduleSetting = window.LaravelData.scheduleSetting;
    console.log(scheduleSetting);

    const listMapelEl = document.getElementById('listMapel');
    if (listMapelEl) {
        new Sortable(listMapelEl, {
            group: {
                name: 'shared',
                pull: 'clone',
                put: false
            },
            sort: false,
            filter: '.used',
            animation: 150,
            onStart: function (evt) {
                $('.jam-slot').each(function () {
                    if ($(this).find('.jadwal-card').length === 0) {
                        $(this).addClass('drag-active');
                    }
                });
            },
            onEnd: function (evt) {
                $('.jam-slot').removeClass('drag-active');
            }
        });
    }

    function normalizeTime(time) {
        return time.substring(0, 5);
    }
    function addMinutes(time, minutes) {
        const [h, m] = normalizeTime(time).split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        d.setMinutes(d.getMinutes() + minutes);
        return d.toTimeString().slice(0, 5);
    }

    function formatJam(time) {
        return time ? time.substring(0, 5) : '';
    }


    function timeToMinutes(time) {
        if (!time) return null;

        // pastikan format HH:mm atau HH:mm:ss
        const clean = time.substring(0, 5);
        const [h, m] = clean.split(':').map(Number);

        if (isNaN(h) || isNaN(m)) return null;

        return h * 60 + m;
    }


    function minutesToTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }


    function aktifkanSlot(slot) {
        if (!document.getElementById('listMapel')) return;
        new Sortable(slot, {
            group: {
                name: 'shared',
                pull: true,
                put: true
            },
            animation: 150,
            onStart: function (evt) {
                $('.jam-slot').each(function () {
                    if ($(this).find('.jadwal-card').length === 0) {
                        $(this).addClass('drag-active');
                    }
                });
            },
            onEnd: function (evt) {
                $('.jam-slot').removeClass('drag-active');
            },

            onAdd: function (evt) {
                const el = evt.item;
                const toSlot = evt.to;
                const fromSlot = evt.from;

                const mapelId = el.dataset.mapel;
                const guruId = el.dataset.guru;
                const color = el.dataset.color || '#3b82f6';

                const newDetailId = toSlot.dataset.detailId;
                const oldDetailId = fromSlot.dataset.detailId || null;

                if (!mapelId || !newDetailId) {
                    el.remove();
                    return;
                }

                const targetCard = toSlot.querySelector('.slot-mapel');

                /* =====================================
                 * CASE 1: SLOT ➜ SLOT (TUKAR)
                 * ===================================== */
                if (oldDetailId && targetCard) {
                    const oldMapel = {
                        mapel: targetCard.dataset.mapel,
                        guru: targetCard.dataset.guru,
                        color: targetCard.dataset.color,
                        text: targetCard.querySelector('span') ? targetCard.querySelector('span').innerText : targetCard.innerText
                    };

                    // Optimistic UI: tukar dulu
                    targetCard.remove();
                    fromSlot.appendChild(targetCard);
                    applyCard(el, color);
                    applyCard(targetCard, oldMapel.color);

                    // Simpan ke DB, kalau gagal revert
                    Promise.all([
                        saveSlot(newDetailId, mapelId, guruId),
                        saveSlot(oldDetailId, oldMapel.mapel, oldMapel.guru)
                    ]).catch(function(msg) {
                        // Revert: kembalikan el ke fromSlot, targetCard ke toSlot
                        el.remove();
                        targetCard.remove();
                        fromSlot.appendChild(el);
                        toSlot.appendChild(targetCard);
                        applyCard(el, color);
                        applyCard(targetCard, oldMapel.color);
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Memindahkan',
                            text: msg || 'Terjadi kesalahan saat menyimpan perubahan.'
                        });
                    });

                    syncMapelStatus();
                    return;
                }

                /* =====================================
                 * CASE 2: LIST ➜ SLOT TERISI (SWAP KE LIST)
                 * ===================================== */
                if (!oldDetailId && targetCard) {
                    const oldMapel = {
                        mapel: targetCard.dataset.mapel,
                        guru: targetCard.dataset.guru,
                        color: targetCard.dataset.color,
                        text: targetCard.querySelector('span') ? targetCard.querySelector('span').innerText : targetCard.innerText
                    };

                    // Optimistic UI
                    targetCard.remove();
                    applyCard(el, color);

                    clearSlot(newDetailId).then(function() {
                        return saveSlot(newDetailId, mapelId, guruId);
                    }).then(function() {
                        // Balikin mapel lama ke list jika belum ada
                        if ($(`#listMapel .mapel-item[data-mapel="${oldMapel.mapel}"][data-guru="${oldMapel.guru}"]`).length === 0) {
                            $('#listMapel').append(`
                                <div class="mapel-item"
                                    data-mapel="${oldMapel.mapel}"
                                    data-guru="${oldMapel.guru}"
                                    data-color="${oldMapel.color}">
                                    ${oldMapel.text}
                                </div>
                            `);
                        }
                        syncMapelStatus();
                    }).catch(function(msg) {
                        // Revert
                        el.remove();
                        toSlot.appendChild(targetCard);
                        applyCard(targetCard, oldMapel.color);
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Memindahkan',
                            text: msg || 'Terjadi kesalahan saat menyimpan perubahan.'
                        });
                    });
                    return;
                }

                /* =====================================
                 * CASE 3: PINDAH NORMAL (slot kosong)
                 * ===================================== */
                applyCard(el, color);

                const doSave = oldDetailId
                    ? clearSlot(oldDetailId).then(() => saveSlot(newDetailId, mapelId, guruId))
                    : saveSlot(newDetailId, mapelId, guruId);

                doSave.then(function() {
                    syncMapelStatus();
                }).catch(function(msg) {
                    // Revert: kembalikan ke posisi asal
                    el.remove();
                    if (oldDetailId) {
                        fromSlot.appendChild(el);
                        applyCard(el, color);
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Memindahkan',
                        text: msg || 'Terjadi kesalahan saat menyimpan perubahan.'
                    });
                });
            }
        });
    }





    function hapusMapel(btn) {
        const card = $(btn).closest('.slot-mapel');
        const slot = card.closest('.jam-slot');
        const detailId = slot.attr('data-detail-id');
        const dayKey = slot.closest('.hari').attr('data-day');
        if (!detailId) return;
        Swal.fire({
            title: 'Hapus mapel?',
            text: 'Mapel akan dihapus dari slot ini',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {

                // 🔥 clear DB
                clearSlot(detailId).then(function() {
                    // 🔥 hapus UI
                    card.remove();

                    // 🔥 update jumlah jam
                    updateCount(dayKey);

                    // 🔥 update status mapel kiri
                    syncMapelStatus();

                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus',
                        timer: 1200,
                        showConfirmButton: false
                    });
                }).catch(function(msg) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Menghapus',
                        text: msg || 'Terjadi kesalahan saat menghapus mapel.'
                    });
                });
            }
        });
    };

    window.tambahSlot = function (dayKey, scheduleId) {

        console.log(dayKey, scheduleId);
        const hari = $('.hari[data-day="' + dayKey + '"]');
        const dayId = hari.data('day-id');
        const kelasId = hari.data('kelas-id');
        if (!dayId || !scheduleId) {
            Swal.fire('Day ID / Schedule ID tidak valid');
            return;
        }

        const lastRow = hari.find('.jam-row').last();
        let startMinutes;
        if (lastRow.length) {
            const lastEnd = lastRow.data('end');
            if (!lastEnd) {
                console.error('data-end tidak ditemukan');
                return;
            }
            startMinutes = timeToMinutes(lastEnd);
        } else {
            const jamMulai = scheduleSetting?.jam_mulai || "07:00";
            startMinutes = timeToMinutes(jamMulai);
        }

        if (startMinutes === null) {
            Swal.fire('Format jam tidak valid');
            return;
        }

        // Cari durasi default: coba hitung dari baris terakhir, fallback ke scheduleSetting.durasi, atau fallback ke 40 menit
        let durasi = 40;
        if (lastRow.length) {
            const lastStart = lastRow.data('start');
            const lastEnd = lastRow.data('end');
            if (lastStart && lastEnd) {
                const diff = timeToMinutes(lastEnd) - timeToMinutes(lastStart);
                if (diff > 0) {
                    durasi = diff;
                }
            }
        } else if (scheduleSetting?.durasi) {
            const parsedDurasi = parseInt(scheduleSetting.durasi);
            if (!isNaN(parsedDurasi) && parsedDurasi > 0) {
                durasi = parsedDurasi;
            }
        }

        const endMinutes = startMinutes + durasi;

        const startTime = minutesToTime(startMinutes);
        const endTime = minutesToTime(endMinutes);
        $.post(APP_URL + '/jadwal/slot/store', {
            _token: $('meta[name="csrf-token"]').attr('content'),
            schedule_id: scheduleId,
            day_id: dayId,
            kelas_id: kelasId,
            start_time: startTime,
            end_time: endTime
        }, function (res) {

            const row = $(`
            <div class="jam-row manual"
                 data-start="${startTime}"
                 data-end="${endTime}"
                 data-detail-id="${res.id}">
                <div class="jam-label">
                    ${startTime} - ${endTime}
                    <button type="button" class="btn btn-sm btn-danger ms-2"
                        onclick="hapusSlotKosong(this)">×</button>
                </div>
                <div class="jam-slot" data-detail-id="${res.id}"></div>
            </div>
        `);

            hari.append(row);
            aktifkanSlot(row.find('.jam-slot')[0]);

        });
    };

    window.hapusSlotKosong = function (btn) {
        const row = $(btn).closest('.jam-row');
        const detailId = row.attr('data-detail-id');
        console.log("hapusSlotKosong dipanggil. detailId:", detailId);

        if (!detailId || detailId === 'undefined') {
            Swal.fire('Error', 'ID Slot tidak ditemukan atau tidak valid.', 'error');
            return;
        }

        Swal.fire({
            title: 'Hapus slot?',
            text: 'Slot ini akan dihapus dari jadwal',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("Mengirim request DELETE ke:", APP_URL + '/jadwal/slot/delete/' + detailId);
                $.ajax({
                    url: APP_URL + '/jadwal/slot/delete/' + detailId,
                    type: 'DELETE',
                    data: {
                        _token: $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (res) {
                        console.log("Response sukses DELETE:", res);
                        row.remove();
                        Swal.fire({
                            icon: 'success',
                            title: 'Terhapus',
                            text: res.message || 'Data berhasil dihapus dari database',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    },
                    error: function (xhr, status, error) {
                        console.error("Gagal DELETE. Status:", status, "Error:", error, "XHR:", xhr);
                        const msg = xhr.responseJSON?.message || xhr.responseJSON?.error || 'Gagal menghapus slot dari database';
                        Swal.fire('Gagal', msg, 'error');
                    }
                });
            }
        });
    };




    function updateCount(dayKey) {
        const filled = $('.hari[data-day="' + dayKey + '"] .jadwal-card').length;
        $('#count-' + dayKey).text(filled + ' dari 13 jam terisi');
    }

    function renderJadwalFromDB(kelasId) {
        $.get(window.LaravelData.routeGetSchedule, { schedule_id: window.LaravelData.scheduleId }, function (res) {
            $('#jadwalContainer').empty();
            if (kelasId) {
                res = res.filter(r => r.kelas_id == kelasId);
            }
            res.forEach(schedule => {
                $('#jadwalContainer').append(`
                            <div class="col-12 mb-3">
                                <h5>Jadwal ${schedule.kelas} - ${schedule.jenjang}</h5>
                            </div>
                        `);
                console.log(schedule);

                for (const dayKey in schedule.hari) {

                    const col = $(`
                        <div class="col-md-6 mb-4">
                            <div class="hari-column">
                                <div class="hari-title">
                                    <h6>${dayKey.toUpperCase()}</h6>
                                    <span id="count-${dayKey}">0 dari 13 jam terisi</span>
                                </div>
                              <div class="hari"
                                    data-day="${dayKey}"
                                    data-day-id="${schedule.hari[dayKey][0].day_id}"
                                    data-kelas-id="${schedule.kelas_id}"
                                    data-schedule-id="${schedule.schedule_id}">
                            </div>
                                ${document.getElementById('listMapel') ? `
                                <div class="tambah-slot">
                                    <button type="button"
                                        onclick="tambahSlot('${dayKey}', ${schedule.schedule_id})">
                                        + Tambah Slot Manual
                                    </button>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `);
                    $('#jadwalContainer').append(col);
                    schedule.hari[dayKey].forEach(detail => {
                        const start = formatJam(detail.start_time);
                        const end = formatJam(detail.end_time);
                        const row = $(`
                            <div class="jam-row"
                                data-start="${start}"
                                data-end="${end}"
                                data-detail-id="${detail.id}">
                                <div class="jam-label">
                                    ${start} - ${end}
                                    ${detail.status == 1 && document.getElementById('listMapel') ? `<button type="button" class="btn btn-sm btn-danger ms-2" onclick="hapusSlotKosong(this)">×</button>` : ''}
                                </div>
                                <div class="jam-slot" data-detail-id="${detail.id}"></div>
                            </div>
                        `);
                        col.find('.hari').append(row);
                        if (detail.is_istirahat == 1 || detail.type === 'istirahat') {
                            row.find('.jam-slot').append(`
                                        <div class="jadwal-card istirahat">
                                            <span><strong>ISTIRAHAT</strong></span>
                                        </div>
                                    `);
                        } else if (detail.type === 'kegiatan') {
                            row.find('.jam-slot').append(`
                                        <div class="jadwal-card kegiatan">
                                            <span>
                                                <strong>${detail.nama_kegiatan}</strong>
                                            </span>
                                        </div>
                                    `);
                        } else if (detail.mapel) {
                            const safeColor = detail.color || '#3b82f6';
                            row.find('.jam-slot').append(`
                                        <div class="jadwal-card slot-mapel"
                                             data-mapel="${detail.mata_pelajaran_id}"
                                             data-guru="${detail.guru_id || ''}"
                                             style="background: ${safeColor}15; border-left: 4px solid ${safeColor}; color: #1e293b;">
                                            <span>
                                                <strong>${detail.code} - ${detail.mapel}</strong>
                                                ${detail.guru ? `<br><small style="color: #64748b; font-weight: 500;">${detail.guru}</small>` : ''}
                                            </span>

                                            ${detail.status == 1 && document.getElementById('listMapel') ? ` <button type="button" class="btn-hapus btn-hapus-mapel">×</button>` : ''}
                                        </div>
                                    `);
                        }
                        aktifkanSlot(row.find('.jam-slot')[0]);
                    });
                    updateCount(dayKey);
                }
            });
            syncMapelStatus();
        });
    }
    const jenjangAktif = scheduleSetting.jenjang_id || null;
    $('#kelasTabs .nav-link').each(function () {
        const jenjangKelas = $(this).data('jenjang');
        if (jenjangKelas != jenjangAktif) {
            $(this).closest('.nav-item').remove();
        }
    });

    const firstTab = $('#kelasTabs .nav-link').first();
    if (firstTab.length) {
        firstTab.addClass('active');
        renderJadwalFromDB(firstTab.data('kelas'));
    }

    $('#kelasTabs').on('click', '.nav-link', function () {
        $('#kelasTabs .nav-link').removeClass('active');
        $(this).addClass('active');

        const kelasId = $(this).data('kelas');
        renderJadwalFromDB(kelasId);
    });

    $('#formTemplate').on('change', function() {
        const jenjangId = $(this).find('option:selected').data('jenjang');
        if (jenjangId) {
            $('#formJenjang').val(jenjangId).trigger('change');
        }
    });





    $('#filterKelas').on('change', function () {
        renderJadwalFromDB($(this).val());
    });

    $('#btnBuatJadwal').on('click', function (e) {
        e.preventDefault();

        const data = {
            _token: $('meta[name="csrf-token"]').attr('content'),
            template_id: $('#formTemplate').val(),
            jenjang_id: $('#formJenjang').val(),
            kelas_ids: $('#formKelas').val(),
            days: $('#formHari').val(),
        };

        if (!data.template_id || !data.jenjang_id || !data.kelas_ids || !data.days) {
            Swal.fire('Lengkapi form terlebih dahulu, termasuk Template Slot');
            return;
        }

        $.ajax({
            url: window.LaravelData.routeGenerate,
            method: "POST",
            data: data,
            success: function (res) {
                Swal.fire({
                    title: 'Berhasil',
                    text: 'Jadwal kosong berhasil dibuat',
                    icon: 'success',
                    timer: 1200,
                    showConfirmButton: false
                }).then(() => {
                    if (res.redirect) {
                        window.location.href = res.redirect;
                    }
                });
            },
            error: function (err) {
                Swal.fire(
                    'Error',
                    err.responseJSON?.message || 'Terjadi kesalahan',
                    'error'
                );
            }
        });

    });

    $('#btnGenerate').on('click', function (e) {
        e.preventDefault();
        const scheduleId = $(this).data('id');
        if (!scheduleId) {
            Swal.fire('Schedule belum dibuat');
            return;
        }

        Swal.fire({
            title: 'Generate Jadwal Mapel?',
            html: `
                <p>Proses ini akan mereset jadwal mapel yang ada dan mengisinya secara otomatis.</p>
                <div class="form-check text-start mt-3 mb-2" style="display: inline-block;">
                    <input class="form-check-input" type="checkbox" id="chkUseAi">
                    <label class="form-check-label" for="chkUseAi" style="font-weight: bold;">
                        Gunakan AI (Eksperimental)
                    </label>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Generate',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                return {
                    use_ai: document.getElementById('chkUseAi').checked ? 1 : 0
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Memproses...',
                    text: result.value.use_ai ? 'Sedang meminta AI merancang jadwal...' : 'Sedang membuat jadwal...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                $.ajax({
                    url: APP_URL + '/jadwal/generate/mapels',
                    method: 'POST',
                    data: {
                        _token: $('meta[name="csrf-token"]').attr('content'),
                        schedule_id: scheduleId,
                        use_ai: result.value.use_ai
                    },
                    success(res) {
                        Swal.fire('Sukses', res.message, 'success');
                        renderJadwalFromDB();
                    },
                    error(xhr) {
                        Swal.fire('Gagal', xhr.responseJSON?.message || 'Terjadi kesalahan saat generate jadwal', 'error');
                    }
                });
            }
        });
    });

    $('#btnReset').on('click', function (e) {
        e.preventDefault();
        const scheduleId = $(this).data('id');
        Swal.fire({
            title: 'Reset Jadwal?',
            text: 'Semua mapel & guru akan dikosongkan',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, reset',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: APP_URL + '/jadwal/reset-mapel',
                    type: 'POST',
                    data: {
                        _token: $('meta[name="csrf-token"]').attr('content'),
                        schedule_id: scheduleId
                    },
                    success: function (res) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Berhasil',
                            text: res.message,
                            timer: 1500,
                            showConfirmButton: false
                        });
                        renderJadwalFromDB();
                    },
                    error: function (xhr) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: xhr.responseJSON?.message ??
                                'Tidak bisa reset jadwal'
                        });
                    }
                });
            }
        });
    });


    $('#btnPrint').on('click', function (e) {
        e.preventDefault();
        const scheduleId = $(this).data('id');
        if (!scheduleId) return;

        let options = '<option value="">Semua Kelas</option>';
        $('#formKelas option:selected').each(function() {
            options += `<option value="${$(this).val()}">${$(this).text()}</option>`;
        });

        Swal.fire({
            title: 'Print Jadwal',
            html: `
                <div class="form-group text-start">
                    <label>Pilih Kelas</label>
                    <select id="printKelasSelect" class="form-select mt-1">
                        ${options}
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Print PDF',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                const kelasId = $('#printKelasSelect').val();
                let url = APP_URL + `/jadwal/${scheduleId}/print`;
                if (kelasId) url += `?kelas_id=${kelasId}`;
                window.open(url, '_blank');
            }
        });
    });

    $('#btnPublish').on('click', function () {
        const scheduleId = $(this).data('id');
        if (!scheduleId) return;

        let optionsHtml = '';
        $('#formKelas option:selected').each(function() {
            let val = $(this).val();
            let text = $(this).text();
            optionsHtml += `<option value="${val}" selected>${text}</option>`;
        });

        Swal.fire({
            title: 'Publish Jadwal?',
            html: `
                <p>Jadwal tidak bisa diubah setelah dipublish.</p>
                <div class="form-check text-start mt-3 mb-2">
                    <input class="form-check-input" type="checkbox" id="chkSendEmail" checked>
                    <label class="form-check-label" for="chkSendEmail" style="font-weight: bold;">
                        Kirim Notifikasi Email ke Guru
                    </label>
                </div>
                <div class="form-group text-start mt-3" id="kelasSelectContainer">
                    <label style="font-weight: bold; margin-bottom: 5px; display: block;">Pilih Kelas</label>
                    <select id="publishKelasSelect" class="form-select w-100" multiple="multiple">
                        ${optionsHtml}
                    </select>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Publish',
            cancelButtonText: 'Batal',
            didOpen: () => {
                $('#publishKelasSelect').select2({
                    dropdownParent: $('.swal2-container'),
                    width: '100%',
                    placeholder: 'Semua Kelas'
                });
            },
            preConfirm: () => {
                return {
                    send_email: document.getElementById('chkSendEmail').checked,
                    kelas_ids: $('#publishKelasSelect').val()
                }
            }
        }).then(res => {
            if (res.isConfirmed) {
                Swal.fire({
                    title: 'Memproses...',
                    text: 'Sedang mempublish jadwal dan mengirim email...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                $.ajax({
                    url: APP_URL + `/jadwal/${scheduleId}/publish`,
                    type: 'POST',
                    data: {
                        _token: $('meta[name="csrf-token"]').attr('content'),
                        send_email: res.value.send_email ? 1 : 0,
                        kelas_ids: res.value.kelas_ids
                    },
                    success: function(response) {
                        Swal.fire('Berhasil', response.message, 'success').then(() => {
                            location.reload();
                        });
                    },
                    error: function(xhr) {
                        Swal.fire('Gagal', xhr.responseJSON?.message || 'Terjadi kesalahan saat mempublish', 'error');
                    }
                });
            }
        });
    });

    $('#searchMapel').on('keyup', function () {
        const keyword = $(this).val().toLowerCase();
        $('#listMapel .mapel-item').each(function () {
            const text = $(this).data('search');
            $(this).toggle(text.includes(keyword));
        });
    });

    function syncMapelStatus() {
        const usedMapel = new Set();
        $('#jadwalContainer .slot-mapel[data-mapel]').each(function () {
            usedMapel.add($(this).data('mapel'));
        });

        console.log('slot-mapel count', $('#jadwalContainer .slot-mapel').length);

        $('#listMapel .mapel-item').each(function () {
            const mapelId = $(this).data('mapel');
            const color = $(this).data('color') || '#3b82f6';

            if (usedMapel.has(mapelId)) {
                $(this)
                    .removeClass('unused')
                    .addClass('used')
                    .css('background', '')
                    .css('border-left', '');

                $(this).find('.badge').remove();
                $(this).append('<span class="badge bg-success text-white float-end" style="font-weight: 700; font-size: 10px; padding: 4px 8px; border-radius: 12px;"><i class="fa fa-check"></i> Terpakai</span>');
            } else {
                $(this)
                    .addClass('unused')
                    .removeClass('used')
                    .css('background', '')
                    .css('border-left', `4px solid ${color}`);

                $(this).find('.badge').remove();
                $(this).append('<span class="badge badge-secondary float-end" style="font-weight: 700; font-size: 10px; padding: 4px 8px; border-radius: 12px;">Belum</span>');
            }
        });
    }

    function applyCard(el, color) {
        const safeColor = color || '#3b82f6';

        // Extract content
        const $el = $(el);
        const $small = $el.find('small');
        const guruText = $small.text().trim();

        // Extract mapel code and name, removing small/badge/button nodes
        const temp = $el.clone();
        temp.find('small, .badge, button').remove();
        const mapelText = temp.text().trim().replace(/\s+/g, ' ');

        el.classList.add('jadwal-card', 'slot-mapel');
        el.style.background = safeColor + '15'; // ~8% opacity tint background
        el.style.borderLeft = `4px solid ${safeColor}`;
        el.style.color = '#1e293b';

        el.innerHTML = `
            <span>
                <strong>${mapelText}</strong>
                ${guruText ? `<br><small style="color: #64748b; font-weight: 500;">${guruText}</small>` : ''}
            </span>
            <button type="button" class="btn-hapus btn-hapus-mapel">×</button>
        `;
    }

    function saveSlot(detailId, mapelId, guruId) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: APP_URL + '/jadwal/update/mapel',
                type: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    detail_id: detailId,
                    mata_pelajaran_id: mapelId,
                    guru_id: guruId
                },
                success: function(res) {
                    resolve(res);
                },
                error: function(xhr) {
                    const msg = xhr.responseJSON?.message || 'Gagal menyimpan jadwal';
                    reject(msg);
                }
            });
        });
    }

    function clearSlot(detailId) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: APP_URL + '/jadwal/mapel/clear',
                type: 'POST',
                data: {
                    _token: $('meta[name="csrf-token"]').attr('content'),
                    detail_id: detailId
                },
                success: function(res) {
                    resolve(res);
                },
                error: function(xhr) {
                    const msg = xhr.responseJSON?.message || 'Gagal menghapus slot';
                    reject(msg);
                }
            });
        });
    }

    $(document).on('click', '.btn-hapus-mapel', function (e) {
        e.preventDefault();
        hapusMapel(this);
        console.log('hapus mapel clicked');

    });

    $('#btnCheckConflict').on('click', function (e) {
        e.preventDefault();
        $.post(APP_URL + '/jadwal/check-conflict', {
            _token: $('meta[name="csrf-token"]').attr('content')
        }, function (res) {

            if (!res.conflicts.length) {
                $('#conflictPanel').addClass('d-none');
                Swal.fire('Aman', 'Tidak ada bentrok guru 🎉', 'success');
                return;
            }

            renderConflictPanel(res.conflicts);
            highlightConflict(res.conflicts);

            Swal.fire(
                'Bentrok Ditemukan',
                `${res.conflicts.length} bentrok guru`,
                'warning'
            );
        });
    });

    function highlightConflict(conflicts) {
        $('.jam-slot').removeClass('conflict');
        conflicts.forEach(conflict => {
            conflict.detail_ids.forEach(detailId => {
                $(`.jam-slot[data-detail-id="${detailId}"]`)
                    .addClass('conflict')
                    .attr('title', 'Bentrok guru');
            });
        });
    }

    function renderConflictPanel(conflicts) {

    const list = $('#conflictList');
    list.empty();

    conflicts.forEach((c, i) => {
        list.append(`
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>Guru #${c.guru_id}</strong><br>
                    Hari ID: ${c.day_id} | Jam ke-${c.jam_ke}
                </div>
                <button type="button"
                    class="btn btn-sm btn-outline-danger btn-lihat-bentrok"
                    data-detail-id="${c.detail_ids[0]}">
                    Lihat
                </button>
            </li>
        `);
    });

    $('#conflictPanel').removeClass('d-none');
}

$(document).on('click', '.btn-lihat-bentrok', function (e) {
    e.preventDefault();
    const detailId = $(this).attr('data-detail-id');
    const $slot = $(`.jam-slot[data-detail-id="${detailId}"]`);
    if (!$slot.length) return;
    $('html, body').animate({
        scrollTop: $slot.offset().top - 120
    }, 500);
    $slot.addClass('conflict-focus');
    setTimeout(() => {
        $slot.removeClass('conflict-focus');
    }, 2000);
});



});
