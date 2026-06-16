import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import Layout from './Layout';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import CustomerManagement from './CustomerManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import CategoryManagement from './CategoryManagement';
import AttributeManagement from './AttributeManagement';
import StockManagement from './StockManagement';
import BannersManagement from './BannersManagement';
import SettingsManagement from './SettingsManagement';
import VoucherManagement from './VoucherManagement';
import ChatManagement from './ChatManagement';
import SupplierManagement from './SupplierManagement';
import POManagement from './POManagement';

export default function AdminApp() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get initial tab from URL path (lightweight routing)
    const getInitialTab = () => {
        const path = window.location.pathname;
        const segments = path.split('/');
        const tab = segments[segments.length - 1];
        const validTabs = ['dashboard', 'products', 'users', 'customers', 'orders', 'categories', 'attributes', 'stock', 'banners', 'settings', 'vouchers', 'chats', 'suppliers', 'purchase-orders'];
        return validTabs.includes(tab) ? tab : 'dashboard';
    };

    const [currentTab, setCurrentTab] = useState(getInitialTab);

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

    // Sync tab state to URL path
    useEffect(() => {
        const currentPath = window.location.pathname;
        const targetPath = `/adminv1/${currentTab}`;
        if (currentPath !== targetPath) {
            window.history.pushState(null, '', targetPath);
        }
    }, [currentTab]);

    // Handle browser back/forward buttons (popstate)
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            const segments = path.split('/');
            const tab = segments[segments.length - 1];
            const validTabs = ['dashboard', 'products', 'users', 'customers', 'orders', 'categories', 'attributes', 'stock', 'banners', 'settings', 'vouchers', 'chats', 'suppliers', 'purchase-orders'];
            if (validTabs.includes(tab)) {
                setCurrentTab(tab);
            } else {
                setCurrentTab('dashboard');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Role-based route guard: Redirect staff trying to access '/users'
    useEffect(() => {
        if (user && currentTab === 'users' && !user.roles.includes('admin')) {
            setCurrentTab('dashboard');
        }
    }, [user, currentTab]);

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
                    <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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
            {currentTab === 'dashboard'   && <Dashboard user={user} setTab={setCurrentTab} />}
            {currentTab === 'products'    && <ProductManagement />}
            {currentTab === 'users'       && user.roles.includes('admin') && <UserManagement />}
            {currentTab === 'customers'   && <CustomerManagement />}
            {currentTab === 'orders'      && <OrderManagement />}
            {currentTab === 'categories'  && <CategoryManagement />}
            {currentTab === 'attributes'  && <AttributeManagement />}
            {currentTab === 'stock'       && <StockManagement />}
            {currentTab === 'vouchers'    && <VoucherManagement />}
            {currentTab === 'banners'     && <BannersManagement />}
            {currentTab === 'settings'    && user.roles.includes('admin') && <SettingsManagement />}
            {currentTab === 'chats'       && <ChatManagement />}
            {currentTab === 'suppliers'   && <SupplierManagement />}
            {currentTab === 'purchase-orders' && <POManagement />}
        </Layout>
    );
}
