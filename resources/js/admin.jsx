import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './admin/AdminApp';

const container = document.getElementById('admin-app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <AdminApp />
        </React.StrictMode>
    );
}
