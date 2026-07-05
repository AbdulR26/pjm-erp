import React, { useState, useEffect } from 'react';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { getCsrfToken } from '../../utils/helpers';

export default function ProfileTab({ currentUser, onUpdateUser }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [gender, setGender] = useState('laki-laki');
    const [birthDay, setBirthDay] = useState('15');
    const [birthMonth, setBirthMonth] = useState('6');
    const [birthYear, setBirthYear] = useState('1995');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setPhone(currentUser.phone || '');
            setAddress(currentUser.address || '');
            setPostalCode(currentUser.postal_code || '');
            setLatitude(currentUser.latitude || '');
            setLongitude(currentUser.longitude || '');
        }
    }, [currentUser]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken()
                },
                body: JSON.stringify({ name, phone, address, postal_code: postalCode, latitude, longitude })
            });
            const data = await res.json();
            if (res.ok) {
                setProfileSuccess('Profil berhasil diperbarui!');
                if (onUpdateUser) {
                    onUpdateUser(data.customer);
                }
            } else {
                if (data.status === 'validation_error') {
                    const firstErr = Object.values(data.errors)[0][0];
                    setProfileError(firstErr);
                } else {
                    setProfileError(data.message || 'Gagal memperbarui profil.');
                }
            }
        } catch (err) {
            setProfileError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <div className="p-6 sm:p-8 md:p-10 flex-1 flex flex-col">
            <div className="border-b border-slate-100 pb-5 mb-8">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Profil Saya</h3>
                <p className="text-sm text-slate-400 mt-1">Kelola informasi profil Anda untuk mengontrol, mengamankan dan melindungi akun</p>
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-12 grow items-start">
                <form onSubmit={handleProfileSubmit} className="w-full lg:w-[68%] flex flex-col gap-6">
                    {profileSuccess && (
                        <div className="bg-emerald-50/60 border border-emerald-100 text-emerald-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-all">
                            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                            <span>{profileSuccess}</span>
                        </div>
                    )}
                    {profileError && (
                        <div className="bg-red-50/60 border border-red-100 text-red-800 px-4 py-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium transition-all">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <span>{profileError}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Username (Email)</label>
                        <div className="w-full sm:w-[75%] text-slate-700 text-sm font-bold py-1">
                            {currentUser?.email || ''}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Nama Lengkap</label>
                        <div className="w-full sm:w-[75%]">
                            <input 
                                type="text" 
                                className="w-full max-w-md h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                disabled={profileLoading} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Nomor Telepon</label>
                        <div className="w-full sm:w-[75%]">
                            <input 
                                type="text" 
                                className="w-full max-w-md h-11 px-4 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-800 transition outline-none bg-slate-50/20 focus:bg-white" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                disabled={profileLoading} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Jenis Kelamin</label>
                        <div className="w-full sm:w-[75%] flex items-center gap-6 text-sm text-slate-700 font-medium">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="radio" 
                                    name="gender" 
                                    value="laki-laki" 
                                    checked={gender === 'laki-laki'} 
                                    onChange={(e) => setGender(e.target.value)} 
                                    className="w-4 h-4 text-[#ff5722] focus:ring-[#ff5722]/20 border-slate-300 accent-[#ff5722]"
                                />
                                <span>Laki-laki</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="radio" 
                                    name="gender" 
                                    value="perempuan" 
                                    checked={gender === 'perempuan'} 
                                    onChange={(e) => setGender(e.target.value)} 
                                    className="w-4 h-4 text-[#ff5722] focus:ring-[#ff5722]/20 border-slate-300 accent-[#ff5722]"
                                />
                                <span>Perempuan</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="w-full sm:w-[25%] sm:text-right text-slate-400 pr-6 text-sm font-semibold mb-1.5 sm:mb-0">Tanggal Lahir</label>
                        <div className="w-full sm:w-[75%] flex items-center gap-3">
                            <select 
                                value={birthDay} 
                                onChange={(e) => setBirthDay(e.target.value)} 
                                className="h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-700 bg-white cursor-pointer outline-none transition"
                            >
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <select 
                                value={birthMonth} 
                                onChange={(e) => setBirthMonth(e.target.value)} 
                                className="h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-700 bg-white cursor-pointer outline-none transition"
                            >
                                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                                    <option key={m} value={idx + 1}>{m}</option>
                                ))}
                            </select>
                            <select 
                                value={birthYear} 
                                onChange={(e) => setBirthYear(e.target.value)} 
                                className="h-10 px-3.5 border border-slate-200 hover:border-slate-300 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 rounded-xl text-sm font-medium text-slate-700 bg-white cursor-pointer outline-none transition"
                            >
                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center mt-4">
                        <div className="w-full sm:w-[25%] pr-6" />
                        <div className="w-full sm:w-[75%]">
                            <button 
                                type="submit" 
                                className="px-8 py-3 bg-linear-to-r from-[#ff5722] to-[#ff7a00] hover:shadow-md hover:shadow-orange-500/10 active:scale-[0.98] transition-all rounded-xl text-white font-bold text-sm cursor-pointer"
                                disabled={profileLoading}
                            >
                                {profileLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="w-full lg:w-[32%] lg:border-l lg:border-slate-100 py-6 flex flex-col items-center gap-5 text-center lg:pl-10">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-102">
                            {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-slate-300" />
                            )}
                        </div>
                    </div>
                    <button className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl transition cursor-pointer shadow-2xs hover:shadow-xs">
                        Pilih Gambar
                    </button>
                    <div className="text-xs text-slate-400 space-y-1.5 mt-1 leading-relaxed max-w-[200px]">
                        <div>Ukuran file: maks. 1 MB</div>
                        <div>Format gambar: .JPEG, .PNG</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
