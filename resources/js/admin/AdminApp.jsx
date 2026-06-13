import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import Layout from './Layout';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import CustomerManagement from './CustomerManagement';

export default function AdminApp() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState('dashboard');

    // Fetch user profile on load
    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/adminv1/api/me');
            if (res.data && res.data.user) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('/adminv1/api/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setCurrentTab('dashboard');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-semibold text-sm">Memuat halaman admin...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login onLoginSuccess={fetchUserProfile} />;
    }

    return (
        <Layout user={user} currentTab={currentTab} setTab={setCurrentTab} onLogout={handleLogout}>
            {currentTab === 'dashboard' && <Dashboard user={user} setTab={setCurrentTab} />}
            {currentTab === 'users' && user.roles.includes('admin') && <UserManagement />}
            {currentTab === 'customers' && <CustomerManagement />}
        </Layout>
    );
}
