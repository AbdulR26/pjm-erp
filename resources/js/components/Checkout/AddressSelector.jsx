import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { getCsrfToken } from '../../utils/helpers';

export default function AddressSelector({ 
    currentUser, 
    address, 
    setAddress,
    addresses,
    setAddresses,
    addressesLoading,
    fetchAddresses
}) {
    const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false);
    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    const [addrModalMode, setAddrModalMode] = useState('create');
    const [editingAddrId, setEditingAddrId] = useState(null);

    const [addrName, setAddrName] = useState('');
    const [addrPhone, setAddrPhone] = useState('');
    const [addrProvince, setAddrProvince] = useState('');
    const [addrCity, setAddrCity] = useState('');
    const [addrDistrict, setAddrDistrict] = useState('');
    const [addrVillage, setAddrVillage] = useState('');
    const [addrDetail, setAddrDetail] = useState('');
    const [addrPostalCode, setAddrPostalCode] = useState('');
    const [addrLatitude, setAddrLatitude] = useState('');
    const [addrLongitude, setAddrLongitude] = useState('');
    const [addrIsPrimary, setAddrIsPrimary] = useState(false);

    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState({ provinces: false, cities: false, districts: false, villages: false });
    const [addrError, setAddrError] = useState('');
    const [savingAddr, setSavingAddr] = useState(false);

    const fetchProvinces = async () => {
        setLoadingRegions(prev => ({ ...prev, provinces: true }));
        try {
            const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
            if (res.ok) {
                const data = await res.json();
                setProvinces(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data provinsi:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, provinces: false }));
        }
    };

    const fetchCities = async (provinceId) => {
        setLoadingRegions(prev => ({ ...prev, cities: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
            if (res.ok) {
                const data = await res.json();
                setCities(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data kota:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, cities: false }));
        }
    };

    const fetchDistricts = async (cityId) => {
        setLoadingRegions(prev => ({ ...prev, districts: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`);
            if (res.ok) {
                const data = await res.json();
                setDistricts(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data kecamatan:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, districts: false }));
        }
    };

    const fetchVillages = async (districtId) => {
        setLoadingRegions(prev => ({ ...prev, villages: true }));
        try {
            const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`);
            if (res.ok) {
                const data = await res.json();
                setVillages(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data desa:", e);
        } finally {
            setLoadingRegions(prev => ({ ...prev, villages: false }));
        }
    };

    useEffect(() => {
        if (!isAddrModalOpen || provinces.length === 0) return;
        if (addrProvince) {
            const foundProv = provinces.find(p => p.name.toUpperCase() === addrProvince.toUpperCase());
            if (foundProv) fetchCities(foundProv.id);
        }
    }, [addrProvince, provinces, isAddrModalOpen]);

    useEffect(() => {
        if (!isAddrModalOpen || cities.length === 0) return;
        if (addrCity) {
            const foundCity = cities.find(c => c.name.toUpperCase() === addrCity.toUpperCase());
            if (foundCity) fetchDistricts(foundCity.id);
        }
    }, [addrCity, cities, isAddrModalOpen]);

    useEffect(() => {
        if (!isAddrModalOpen || districts.length === 0) return;
        if (addrDistrict) {
            const foundDist = districts.find(d => d.name.toUpperCase() === addrDistrict.toUpperCase());
            if (foundDist) fetchVillages(foundDist.id);
        }
    }, [addrDistrict, districts, isAddrModalOpen]);

    const handleOpenCreateAddrModal = () => {
        setAddrModalMode('create');
        setEditingAddrId(null);
        setAddrName(currentUser?.name || '');
        setAddrPhone(currentUser?.phone || '');
        setAddrProvince('');
        setAddrCity('');
        setAddrDistrict('');
        setAddrVillage('');
        setAddrDetail('');
        setAddrPostalCode('');
        setAddrLatitude('');
        setAddrLongitude('');
        setAddrIsPrimary(addresses.length === 0);
        setAddrError('');
        setIsAddrModalOpen(true);
        fetchProvinces();
    };

    const handleOpenEditAddrModal = async (addr) => {
        setAddrModalMode('edit');
        setEditingAddrId(addr.id);
        setAddrName(addr.name || '');
        setAddrPhone(addr.phone || '');
        setAddrDetail(addr.address || '');
        setAddrPostalCode(addr.postal_code || '');
        setAddrLatitude(addr.latitude || '');
        setAddrLongitude(addr.longitude || '');
        setAddrIsPrimary(addr.is_primary || false);
        setAddrProvince(addr.province || '');
        setAddrCity(addr.city || '');
        setAddrDistrict(addr.district || '');
        setAddrVillage(addr.village || '');
        setAddrError('');
        setIsAddrModalOpen(true);
        await fetchProvinces();
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setSavingAddr(true);
        setAddrError('');

        const payload = {
            name: addrName,
            phone: addrPhone,
            province: addrProvince,
            city: addrCity,
            district: addrDistrict,
            village: addrVillage,
            address: addrDetail,
            postal_code: addrPostalCode,
            latitude: addrLatitude ? parseFloat(addrLatitude) : null,
            longitude: addrLongitude ? parseFloat(addrLongitude) : null,
            is_primary: addrIsPrimary,
        };

        try {
            const url = addrModalMode === 'create' ? '/api/auth/addresses' : `/api/auth/addresses/${editingAddrId}`;
            const method = addrModalMode === 'create' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setIsAddrModalOpen(false);
                setIsAddressSelectModalOpen(false);
                await fetchAddresses();
                setAddress({
                    id: data.address.id,
                    name: data.address.name,
                    phone: data.address.phone,
                    detail: data.address.address + ', Kel. ' + data.address.village + ', Kec. ' + data.address.district + ', ' + data.address.city + ', ' + data.address.province,
                    postal_code: data.address.postal_code,
                    latitude: data.address.latitude || '',
                    longitude: data.address.longitude || '',
                });
            } else {
                setAddrError(data.message || 'Gagal menyimpan alamat.');
            }
        } catch (err) {
            setAddrError('Terjadi kesalahan jaringan.');
        } finally {
            setSavingAddr(false);
        }
    };

    const handleSelectAddress = (addr) => {
        setAddress({
            id: addr.id,
            name: addr.name,
            phone: addr.phone,
            detail: addr.address + ', Kel. ' + addr.village + ', Kec. ' + addr.district + ', ' + addr.city + ', ' + addr.province,
            postal_code: addr.postal_code,
            latitude: addr.latitude || '',
            longitude: addr.longitude || '',
        });
        setIsAddressSelectModalOpen(false);
    };

    return (
        <div className="scp-card">
            <div className="scp-card-header">
                <MapPin size={16} color="#c0001a" />
                <span className="scp-card-title">Alamat Pengiriman</span>
            </div>
            <div className="scp-card-body">
                {addressesLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                        <div className="scp-spin" style={{ width: 18, height: 18, border: '2.5px solid #f3f3f3', borderTop: '2.5px solid #c0001a', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: 12, color: '#666' }}>Memuat daftar alamat...</span>
                    </div>
                ) : addresses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ fontSize: '12.5px', color: '#666', marginBottom: '12px' }}>Belum ada alamat pengiriman disimpan.</p>
                        <button 
                            type="button"
                            onClick={handleOpenCreateAddrModal}
                            style={{ background: '#c0001a', color: '#fff', fontWeight: '750', fontSize: '12px', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            + Tambah Alamat Baru
                        </button>
                    </div>
                ) : (
                    <div className="scp-addr-filled">
                        <div className="scp-addr-dot" />
                        <div style={{ flex: 1 }}>
                            <div>
                                <span className="scp-addr-name">{address.name || '—'}</span>
                                {address.phone && <span className="scp-addr-phone">({address.phone})</span>}
                            </div>
                            <div className="scp-addr-detail">
                                {address.detail || <span style={{ color: '#c0001a', fontSize: 12 }}>Alamat belum diisi</span>}
                                {address.postal_code && (
                                    <div style={{ color: '#666', fontSize: 11.5, marginTop: 4, fontWeight: 500 }}>
                                        Kode Pos: <span style={{ fontWeight: 700, color: '#222' }}>{address.postal_code}</span>
                                        {address.latitude && address.longitude && ` (${address.latitude}, ${address.longitude})`}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="scp-addr-change" onClick={() => setIsAddressSelectModalOpen(true)}>
                            Pilih Alamat Lain
                        </button>
                    </div>
                )}
            </div>

            {/* Address Selection Modal */}
            {isAddressSelectModalOpen && (
                <div className="vch-drawer-backdrop" onClick={() => setIsAddressSelectModalOpen(false)}>
                    <div className="vch-drawer" onClick={e => e.stopPropagation()} style={{ left: '50%', right: 'auto', transform: 'translateX(-50%)', maxWidth: 500, borderRadius: 8, height: '90vh', top: '5vh' }}>
                        <div className="vch-drawer-header">
                            <span className="vch-drawer-title">Pilih Alamat Pengiriman</span>
                            <button onClick={() => setIsAddressSelectModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="vch-drawer-body">
                            <button onClick={handleOpenCreateAddrModal} style={{ width: '100%', padding: '12px', border: '1px dashed #c0001a', color: '#c0001a', background: '#fff0f0', borderRadius: 6, fontWeight: 700, marginBottom: 16, cursor: 'pointer' }}>
                                + Tambah Alamat Baru
                            </button>
                            {addresses.map(addr => (
                                <div key={addr.id} className={`vch-card ${address.id === addr.id ? 'selected' : ''}`} style={{ cursor: 'pointer' }} onClick={() => handleSelectAddress(addr)}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{addr.name}</div>
                                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{addr.phone}</div>
                                        <div style={{ fontSize: 12, color: '#444' }}>{addr.address}, Kel. {addr.village}, Kec. {addr.district}, {addr.city}, {addr.province}</div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginTop: 4 }}>Kode Pos: {addr.postal_code}</div>
                                        {addr.is_primary && <span style={{ display: 'inline-block', padding: '2px 6px', background: '#e0f2e9', color: '#2e7d4a', fontSize: 10, borderRadius: 4, fontWeight: 700, marginTop: 4 }}>Utama</span>}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenEditAddrModal(addr); }} style={{ background: 'none', border: 'none', color: '#0066cc', fontWeight: 600, cursor: 'pointer', padding: 8 }}>Ubah</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Address Form Modal */}
            {isAddrModalOpen && (
                <div className="vch-drawer-backdrop" style={{ zIndex: 10000 }}>
                    <div className="vch-drawer" style={{ left: '50%', right: 'auto', transform: 'translateX(-50%)', maxWidth: 600, borderRadius: 8, height: '95vh', top: '2.5vh' }}>
                        <div className="vch-drawer-header">
                            <span className="vch-drawer-title">{addrModalMode === 'create' ? 'Tambah Alamat Baru' : 'Ubah Alamat'}</span>
                            <button onClick={() => setIsAddrModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div className="vch-drawer-body">
                            {addrError && <div style={{ padding: 12, background: '#fff0f0', color: '#c0001a', borderRadius: 6, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{addrError}</div>}
                            <form onSubmit={handleAddressSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div className="scp-input-grid">
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nama Penerima</label>
                                        <input type="text" className="scp-input" value={addrName} onChange={e => setAddrName(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nomor Telepon</label>
                                        <input type="text" className="scp-input" value={addrPhone} onChange={e => setAddrPhone(e.target.value)} required />
                                    </div>
                                </div>
                                
                                <div className="scp-input-grid">
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Provinsi</label>
                                        <select className="scp-input" value={addrProvince} onChange={e => setAddrProvince(e.target.options[e.target.selectedIndex].text)} required>
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Kota/Kabupaten</label>
                                        <select className="scp-input" value={addrCity} onChange={e => setAddrCity(e.target.options[e.target.selectedIndex].text)} required disabled={!addrProvince}>
                                            <option value="">Pilih Kota</option>
                                            {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="scp-input-grid">
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Kecamatan</label>
                                        <select className="scp-input" value={addrDistrict} onChange={e => setAddrDistrict(e.target.options[e.target.selectedIndex].text)} required disabled={!addrCity}>
                                            <option value="">Pilih Kecamatan</option>
                                            {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Desa/Kelurahan</label>
                                        <select className="scp-input" value={addrVillage} onChange={e => setAddrVillage(e.target.options[e.target.selectedIndex].text)} required disabled={!addrDistrict}>
                                            <option value="">Pilih Desa</option>
                                            {villages.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Alamat Lengkap (Nama Jalan, Gedung, No. Rumah)</label>
                                    <textarea className="scp-input" rows="3" value={addrDetail} onChange={e => setAddrDetail(e.target.value)} required></textarea>
                                </div>

                                <div className="scp-input-grid">
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Kode Pos</label>
                                        <input type="text" className="scp-input" value={addrPostalCode} onChange={e => setAddrPostalCode(e.target.value)} required />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                    <input type="checkbox" id="isPrimary" checked={addrIsPrimary} onChange={e => setAddrIsPrimary(e.target.checked)} />
                                    <label htmlFor="isPrimary" style={{ fontSize: 13, fontWeight: 500 }}>Jadikan sebagai alamat utama</label>
                                </div>

                                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                    <button type="button" onClick={() => setIsAddrModalOpen(false)} className="scp-cancel-btn" style={{ flex: 1, margin: 0 }}>Batal</button>
                                    <button type="submit" disabled={savingAddr} className="scp-save-btn" style={{ flex: 1 }}>{savingAddr ? 'Menyimpan...' : 'Simpan Alamat'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
