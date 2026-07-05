import React from 'react';
import { MapPin, CheckCircle, AlertCircle, Plus, Loader } from 'lucide-react';
import useAddressTab from '../../hooks/useAddressTab';

export default function AddressTab({ currentUser, onUpdateUser }) {
    const {
        addresses,
        addressesLoading,
        isAddrModalOpen,
        setIsAddrModalOpen,
        addrModalMode,
        addrName, setAddrName,
        addrPhone, setAddrPhone,
        addrProvince, setAddrProvince,
        addrCity, setAddrCity,
        addrDistrict, setAddrDistrict,
        addrVillage, setAddrVillage,
        addrDetail, setAddrDetail,
        addrPostalCode, setAddrPostalCode,
        addrIsPrimary, setAddrIsPrimary,
        provinces,
        cities,
        districts,
        villages,
        profileError,
        profileSuccess,
        profileLoading,
        handleOpenCreateAddrModal,
        handleOpenEditAddrModal,
        handleAddressSubmit,
        handleSetPrimaryAddress,
        handleDeleteAddress
    } = useAddressTab({ currentUser, onUpdateUser });

    return (
        <div className="p-6 sm:p-8 flex-1 flex flex-col">
            <div className="border-b border-slate-100 pb-5 mb-8 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Alamat Saya</h3>
                    <p className="text-sm text-slate-400 mt-1">Kelola alamat lengkap pengiriman pesanan Anda</p>
                </div>
                <button 
                    onClick={handleOpenCreateAddrModal}
                    className="px-5 py-3 bg-linear-to-r from-[#ff5722] to-[#ff7a00] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                    <Plus size={16} className="stroke-[3px]" />
                    <span>Tambah Alamat Baru</span>
                </button>
            </div>

            {profileSuccess && (
                <div className="bg-emerald-50/60 border border-emerald-100 text-emerald-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium mb-6">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    <span>{profileSuccess}</span>
                </div>
            )}
            {profileError && (
                <div className="bg-red-50/60 border border-red-100 text-red-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium mb-6">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <span>{profileError}</span>
                </div>
            )}

            {addressesLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-[#ff5722] gap-3">
                    <Loader size={32} className="animate-spin" />
                    <p className="text-sm font-semibold text-slate-400">Memuat daftar alamat...</p>
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#ff5722] mx-auto mb-5">
                        <MapPin size={28} className="opacity-85" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">Belum ada alamat pengiriman disimpan.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="border border-slate-100 hover:border-slate-200 rounded-xl p-6 hover:shadow-2xs transition-all duration-300 bg-white flex justify-between items-start gap-6 flex-col sm:flex-row">
                            <div className="grow space-y-2">
                                <div className="flex items-center gap-3 flex-wrap text-slate-850 font-semibold text-sm">
                                    <span className="font-bold text-base text-slate-900">{addr.name}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-500 font-medium">{addr.phone}</span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-xl break-words">
                                    {addr.address}
                                </p>
                                <div className="text-slate-500 text-sm font-medium">
                                    Kel. {addr.village}, Kec. {addr.district}, {addr.city}, {addr.province}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap pt-2">
                                    <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-lg">Kode Pos: {addr.postal_code}</span>
                                    {addr.is_primary && (
                                        <span className="border border-[#ff5722] text-[#ff5722] bg-orange-50/30 text-[11px] font-bold px-2.5 py-0.5 rounded-lg select-none">
                                            Utama
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-4 text-right self-stretch justify-between">
                                <div className="flex items-center gap-3.5 text-sm font-semibold">
                                    <button 
                                        onClick={() => handleOpenEditAddrModal(addr)}
                                        className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                                    >
                                        Ubah
                                    </button>
                                    {!addr.is_primary && (
                                        <>
                                            <span className="text-slate-200 font-normal">|</span>
                                            <button 
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                                            >
                                                Hapus
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleSetPrimaryAddress(addr.id)}
                                    disabled={addr.is_primary}
                                    className={`px-4 py-2 border rounded-xl text-xs transition-all font-semibold cursor-pointer ${
                                        addr.is_primary 
                                            ? 'border-slate-200 text-slate-400 bg-slate-50/80 cursor-not-allowed' 
                                            : 'border-slate-250 text-slate-600 hover:bg-slate-50 hover:border-slate-350'
                                    }`}
                                >
                                    Atur Sebagai Utama
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Address Modal Drawer */}
            {isAddrModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{addrModalMode === 'create' ? 'Tambah Alamat Baru' : 'Ubah Alamat'}</h2>
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Penerima</label>
                                <input type="text" value={addrName} onChange={e => setAddrName(e.target.value)} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                                <input type="text" value={addrPhone} onChange={e => setAddrPhone(e.target.value)} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Provinsi</label>
                                <select value={addrProvince} onChange={e => setAddrProvince(e.target.options[e.target.selectedIndex].text)} required className="w-full border p-2 rounded">
                                    <option value="">Pilih Provinsi</option>
                                    {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kota/Kabupaten</label>
                                <select value={addrCity} onChange={e => setAddrCity(e.target.options[e.target.selectedIndex].text)} required className="w-full border p-2 rounded" disabled={!addrProvince}>
                                    <option value="">Pilih Kota</option>
                                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kecamatan</label>
                                <select value={addrDistrict} onChange={e => setAddrDistrict(e.target.options[e.target.selectedIndex].text)} required className="w-full border p-2 rounded" disabled={!addrCity}>
                                    <option value="">Pilih Kecamatan</option>
                                    {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kelurahan/Desa</label>
                                <select value={addrVillage} onChange={e => setAddrVillage(e.target.options[e.target.selectedIndex].text)} required className="w-full border p-2 rounded" disabled={!addrDistrict}>
                                    <option value="">Pilih Desa</option>
                                    {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                                <textarea value={addrDetail} onChange={e => setAddrDetail(e.target.value)} required className="w-full border p-2 rounded" rows="3"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Pos</label>
                                <input type="text" value={addrPostalCode} onChange={e => setAddrPostalCode(e.target.value)} required className="w-full border p-2 rounded" />
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <input type="checkbox" id="isPrimary" checked={addrIsPrimary} onChange={e => setAddrIsPrimary(e.target.checked)} className="w-4 h-4 text-[#ff5722]" />
                                <label htmlFor="isPrimary" className="text-sm text-slate-700">Jadikan sebagai alamat utama</label>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setIsAddrModalOpen(false)} className="flex-1 border p-2 rounded font-semibold text-slate-600">Batal</button>
                                <button type="submit" disabled={profileLoading} className="flex-1 bg-[#ff5722] text-white p-2 rounded font-semibold">{profileLoading ? 'Menyimpan...' : 'Simpan Alamat'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
