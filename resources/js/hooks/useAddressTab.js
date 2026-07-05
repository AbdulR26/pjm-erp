import { useState, useEffect } from 'react';
import { getCsrfToken } from '../utils/helpers';

export default function useAddressTab({ currentUser, onUpdateUser }) {
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
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

    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    const fetchAddresses = async () => {
        setAddressesLoading(true);
        try {
            const res = await fetch('/api/auth/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (e) {
            console.error("Gagal mengambil data alamat:", e);
        } finally {
            setAddressesLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

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
        setIsAddrModalOpen(true);
        await fetchProvinces();
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

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
                setProfileSuccess(addrModalMode === 'create' ? 'Alamat berhasil ditambahkan!' : 'Alamat berhasil diperbarui!');
                setIsAddrModalOpen(false);
                fetchAddresses();
                if (payload.is_primary && onUpdateUser) {
                    const meRes = await fetch('/api/auth/me');
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        onUpdateUser(meData);
                    }
                }
            } else {
                setProfileError(data.message || 'Gagal menyimpan alamat.');
            }
        } catch (err) {
            setProfileError('Terjadi kesalahan jaringan.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleSetPrimaryAddress = async (id) => {
        setProfileError('');
        setProfileSuccess('');
        try {
            const res = await fetch(`/api/auth/addresses/${id}/primary`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
            if (res.ok) {
                fetchAddresses();
                setProfileSuccess('Alamat utama berhasil diubah!');
                if (onUpdateUser) {
                    const meRes = await fetch('/api/auth/me');
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        onUpdateUser(meData);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
        setProfileError('');
        setProfileSuccess('');
        try {
            const res = await fetch(`/api/auth/addresses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                }
            });
            if (res.ok) {
                fetchAddresses();
                setProfileSuccess('Alamat berhasil dihapus!');
                if (onUpdateUser) {
                    const meRes = await fetch('/api/auth/me');
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        onUpdateUser(meData);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return {
        addresses,
        addressesLoading,
        isAddrModalOpen,
        setIsAddrModalOpen,
        addrModalMode,
        editingAddrId,
        addrName, setAddrName,
        addrPhone, setAddrPhone,
        addrProvince, setAddrProvince,
        addrCity, setAddrCity,
        addrDistrict, setAddrDistrict,
        addrVillage, setAddrVillage,
        addrDetail, setAddrDetail,
        addrPostalCode, setAddrPostalCode,
        addrLatitude, setAddrLatitude,
        addrLongitude, setAddrLongitude,
        addrIsPrimary, setAddrIsPrimary,
        provinces,
        cities,
        districts,
        villages,
        loadingRegions,
        profileError,
        profileSuccess,
        profileLoading,
        handleOpenCreateAddrModal,
        handleOpenEditAddrModal,
        handleAddressSubmit,
        handleSetPrimaryAddress,
        handleDeleteAddress
    };
}
