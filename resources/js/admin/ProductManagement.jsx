import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    Plus, Search, Edit, Trash2, Package, Tag, Layers, Droplets, Image as ImageIcon, 
    ChevronDown, ChevronUp, ChevronRight, Folder, FolderOpen, FileText, Star, 
    PlusCircle, X, Check, Save, ArrowLeft, RefreshCw, Eye, History, ShieldAlert,
    ArrowUpDown
} from 'lucide-react';

// ============================================================================
// DUMMY MASTER DATA DEFINITION
// ============================================================================

// Collapsible Parent-Child Category Tree
const CATEGORIES_TREE = [
    {
        id: 10, name: 'Suku Cadang & Oli', isParent: true, children: [
            {
                id: 20, name: 'Mesin & Transmisi', isParent: true, children: [
                    { id: 21, name: 'Filter Oli & Udara' },
                    { id: 22, name: 'Busi & Pengapian' },
                    { id: 23, name: 'Piston & Klep' }
                ]
            },
            {
                id: 30, name: 'Sistem Pengereman', isParent: true, children: [
                    { id: 31, name: 'Kampas Rem' },
                    { id: 32, name: 'Piringan Cakram / Disc' }
                ]
            },
            {
                id: 40, name: 'Kaki-Kaki & Ban', isParent: true, children: [
                    { id: 41, name: 'Shockbreaker' },
                    { id: 42, name: 'Velg & Ban Mobil' }
                ]
            },
            {
                id: 50, name: 'Pelumas & Aki', isParent: true, children: [
                    { id: 51, name: 'Oli Mesin Mobil' },
                    { id: 52, name: 'Aki Basah & Kering' }
                ]
            }
        ]
    },
    {
        id: 60, name: 'Aksesoris & Variasi', isParent: true, children: [
            { id: 61, name: 'Kamera Mobil & Dashcam' },
            { id: 62, name: 'Lampu LED & Xenon' },
            { id: 63, name: 'Karpet & Cover Mobil' }
        ]
    }
];

// Dynamic Attributes mapped to specific leaf category IDs and names for backend compatibility
const CATEGORY_ATTRIBUTES_MAP = {
    51: [ // Oli Mesin Mobil
        { id: 'brand', name: 'Merek / Pabrikan', type: 'text', required: true, placeholder: 'e.g. Shell, Mobil1, Castrol' },
        { id: 'viscosity', name: 'Kekentalan / Viskositas SAE', type: 'select', options: ['SAE 0W-20', 'SAE 5W-30', 'SAE 5W-40', 'SAE 10W-40'], required: true },
        { id: 'base_oil', name: 'Bahan Dasar (Base Oil)', type: 'select', options: ['Fully Synthetic', 'Semi Synthetic', 'Mineral'], required: true },
        { id: 'api_service', name: 'Spesifikasi API Service', type: 'text', required: false, placeholder: 'e.g. API SP, API SN Plus' }
    ],
    'Oli Mesin Mobil': [
        { id: 'brand', name: 'Merek / Pabrikan', type: 'text', required: true, placeholder: 'e.g. Shell, Mobil1, Castrol' },
        { id: 'viscosity', name: 'Kekentalan / Viskositas SAE', type: 'select', options: ['SAE 0W-20', 'SAE 5W-30', 'SAE 5W-40', 'SAE 10W-40'], required: true },
        { id: 'base_oil', name: 'Bahan Dasar (Base Oil)', type: 'select', options: ['Fully Synthetic', 'Semi Synthetic', 'Mineral'], required: true },
        { id: 'api_service', name: 'Spesifikasi API Service', type: 'text', required: false, placeholder: 'e.g. API SP, API SN Plus' }
    ],
    31: [ // Kampas Rem
        { id: 'brand', name: 'Merek Kampas', type: 'text', required: true, placeholder: 'e.g. Bendix, Brembo, Akebono' },
        { id: 'material', name: 'Bahan Material', type: 'select', options: ['Ceramic / Keramik', 'Semi-Metallic', 'Organic / Non-Asbestos'], required: true },
        { id: 'position', name: 'Posisi Pemasangan', type: 'select', options: ['Roda Depan (Front)', 'Roda Belakang (Rear)'], required: true }
    ],
    'Kampas Rem': [
        { id: 'brand', name: 'Merek Kampas', type: 'text', required: true, placeholder: 'e.g. Bendix, Brembo, Akebono' },
        { id: 'material', name: 'Bahan Material', type: 'select', options: ['Ceramic / Keramik', 'Semi-Metallic', 'Organic / Non-Asbestos'], required: true },
        { id: 'position', name: 'Posisi Pemasangan', type: 'select', options: ['Roda Depan (Front)', 'Roda Belakang (Rear)'], required: true }
    ],
    42: [ // Velg & Ban Mobil
        { id: 'brand', name: 'Merek Ban/Velg', type: 'text', required: true, placeholder: 'e.g. Michelin, Bridgestone, GT Radial' },
        { id: 'ring_size', name: 'Ukuran Ring (Diameter)', type: 'select', options: ['R14', 'R15', 'R16', 'R17', 'R18', 'R19'], required: true },
        { id: 'aspect_ratio', name: 'Rasio Aspek & Lebar', type: 'text', required: false, placeholder: 'e.g. 225/45' }
    ],
    'Velg & Ban Mobil': [
        { id: 'brand', name: 'Merek Ban/Velg', type: 'text', required: true, placeholder: 'e.g. Michelin, Bridgestone, GT Radial' },
        { id: 'ring_size', name: 'Ukuran Ring (Diameter)', type: 'select', options: ['R14', 'R15', 'R16', 'R17', 'R18', 'R19'], required: true },
        { id: 'aspect_ratio', name: 'Rasio Aspek & Lebar', type: 'text', required: false, placeholder: 'e.g. 225/45' }
    ],
    61: [ // Kamera Mobil & Dashcam
        { id: 'brand', name: 'Merek Dashcam', type: 'text', required: true, placeholder: 'e.g. 70mai, BlackVue, Yi' },
        { id: 'resolution', name: 'Resolusi Rekaman', type: 'select', options: ['1085p Full HD', '2K 1440p', '4K 2160p Ultra HD'], required: true },
        { id: 'gps_module', name: 'Modul GPS Internal', type: 'select', options: ['Ada (Built-in)', 'Tidak Ada / Optional'], required: false }
    ],
    'Kamera Mobil & Dashcam': [
        { id: 'brand', name: 'Merek Dashcam', type: 'text', required: true, placeholder: 'e.g. 70mai, BlackVue, Yi' },
        { id: 'resolution', name: 'Resolusi Rekaman', type: 'select', options: ['1085p Full HD', '2K 1440p', '4K 2160p Ultra HD'], required: true },
        { id: 'gps_module', name: 'Modul GPS Internal', type: 'select', options: ['Ada (Built-in)', 'Tidak Ada / Optional'], required: false }
    ]
};

// Initial Mock Product Database (Rich data matching schema)
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: 'Oli Mesin Shell Helix Ultra 5W-40 Fully Synthetic',
        category_id: 51,
        category_path: ['Suku Cadang & Oli', 'Pelumas & Aki', 'Oli Mesin Mobil'],
        description: 'Shell Helix Ultra 5W-40 merupakan pelumas mesin mobil fully synthetic dengan teknologi pembersih aktif Shell PurePlus. Memberikan perlindungan keausan mesin yang maksimal di segala kondisi jalan.',
        main_image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
        gallery_images: [
            'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80'
        ],
        badge: 'Laris',
        rating: 4.9,
        sold_count: 180,
        is_flash_sale: false,
        flash_sale_stock: 0,
        attributes: {
            brand: 'Shell',
            viscosity: 'SAE 5W-40',
            base_oil: 'Fully Synthetic',
            api_service: 'API SP / SN Plus'
        },
        variants: [
            { id: 101, name: 'Kemasan 4 Liter', base_price: 450000, stock: 42, sku: 'SH-HU-5W40-4L' },
            { id: 102, name: 'Kemasan 1 Liter', base_price: 125000, stock: 15, sku: 'SH-HU-5W40-1L' }
        ],
        prices: [
            { id: 201, variant_id: 101, level: 'retail', min_qty: 1, price: 450000 },
            { id: 202, variant_id: 101, level: 'retail', min_qty: 6, price: 430000 }, // Grosir
            { id: 203, variant_id: 101, level: 'bengkel', min_qty: 1, price: 410000 }, // Harga bengkel partner
            { id: 204, variant_id: 102, level: 'retail', min_qty: 1, price: 125000 },
            { id: 205, variant_id: 102, level: 'bengkel', min_qty: 1, price: 115000 }
        ],
        stock_mutations: [
            { id: 301, variant_id: 101, type: 'in', quantity: 50, source: 'purchase', notes: 'Restock Bulanan Supplier Utama', user: 'Admin PJM', created_at: '2026-06-01 10:00' },
            { id: 302, variant_id: 101, type: 'out', quantity: 8, source: 'sale', notes: 'Penjualan Pembeli via Web', user: 'System', created_at: '2026-06-05 14:30' }
        ]
    },
    {
        id: 2,
        name: 'Kampas Rem Depan Bendix General CT Ceramic',
        category_id: 31,
        category_path: ['Suku Cadang & Oli', 'Sistem Pengereman', 'Kampas Rem'],
        description: 'Kampas rem keramik Bendix General CT memberikan performa pengereman senyap, minim debu, dan daya tahan piringan cakram yang lama dengan teknologi Blue Titanium Stripe.',
        main_image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
        gallery_images: [
            'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80'
        ],
        badge: '100% Ori',
        rating: 4.8,
        sold_count: 95,
        is_flash_sale: false,
        flash_sale_stock: 0,
        attributes: {
            brand: 'Bendix',
            material: 'Ceramic / Keramik',
            position: 'Roda Depan (Front)'
        },
        variants: [
            { id: 103, name: 'Toyota Avanza/Xenia', base_price: 320000, stock: 24, sku: 'BX-GCT-AVZ-F' },
            { id: 104, name: 'Honda Jazz/Brio', base_price: 310000, stock: 18, sku: 'BX-GCT-JAZ-F' }
        ],
        prices: [
            { id: 206, variant_id: 103, level: 'retail', min_qty: 1, price: 320000 },
            { id: 207, variant_id: 103, level: 'retail', min_qty: 5, price: 300000 },
            { id: 208, variant_id: 103, level: 'bengkel', min_qty: 1, price: 280000 }
        ],
        stock_mutations: [
            { id: 303, variant_id: 103, type: 'in', quantity: 30, source: 'purchase', notes: 'Kirim dari Gudang Pusat', user: 'Admin PJM', created_at: '2026-06-03 09:15' }
        ]
    }
];

// ============================================================================
// COMPONENT RENDERER
// ============================================================================

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [categoriesTree, setCategoriesTree] = useState([]);
    const [isLoadingApi, setIsLoadingApi] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

    // DataTable States
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Reset page to 1 when search/filter/entries per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategoryFilter, entriesPerPage]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const renderSortIcon = (column) => {
        if (sortColumn !== column) {
            return <ArrowUpDown size={12} className="text-slate-350 shrink-0" />;
        }
        return sortDirection === 'asc' 
            ? <ChevronUp size={12} className="text-red-600 stroke-3 shrink-0" />
            : <ChevronDown size={12} className="text-red-600 stroke-3 shrink-0" />;
    };

    const getProcessedProducts = () => {
        let result = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 p.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategoryFilter ? p.category_path.includes(selectedCategoryFilter) : true;
            return matchesSearch && matchesCategory;
        });

        if (sortColumn) {
            result.sort((a, b) => {
                let valA, valB;
                if (sortColumn === 'name') {
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                } else if (sortColumn === 'category') {
                    valA = a.category_path.join(' > ').toLowerCase();
                    valB = b.category_path.join(' > ').toLowerCase();
                } else if (sortColumn === 'price') {
                    valA = a.variants.length > 0 ? Math.min(...a.variants.map(v => v.base_price)) : 0;
                    valB = b.variants.length > 0 ? Math.min(...b.variants.map(v => v.base_price)) : 0;
                } else if (sortColumn === 'stock') {
                    valA = a.variants.reduce((acc, curr) => acc + curr.stock, 0);
                    valB = b.variants.reduce((acc, curr) => acc + curr.stock, 0);
                }

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    };

    const processedProducts = getProcessedProducts();
    const totalEntries = processedProducts.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = processedProducts.slice(indexOfFirstEntry, indexOfLastEntry);
    
    // View state: 'list' or 'form'
    const [viewMode, setViewMode] = useState('list'); 
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('detail'); // 'detail', 'gambar', 'harga', 'stok'

    // Form inputs state
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategoryId, setFormCategoryId] = useState(null);
    const [formCategoryPath, setFormCategoryPath] = useState([]);
    const [formBadge, setFormBadge] = useState('');
    const [formAttributes, setFormAttributes] = useState({});
    const [formIsFlashSale, setFormIsFlashSale] = useState(false);
    const [formFlashSaleStock, setFormFlashSaleStock] = useState(0);
    
    const [formMainImage, setFormMainImage] = useState('');
    const [formGalleryImages, setFormGalleryImages] = useState([]);
    const [isUploadingMain, setIsUploadingMain] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);

    const [formVariants, setFormVariants] = useState([]);
    const [formPrices, setFormPrices] = useState([]);
    const [formMutations, setFormMutations] = useState([]);

    // Temporary helper variables for adding new items
    const [newVarName, setNewVarName] = useState('');
    const [newVarPrice, setNewVarPrice] = useState('');
    const [newVarSku, setNewVarSku] = useState('');

    const [newPriceLevel, setNewPriceLevel] = useState('retail');
    const [newPriceMinQty, setNewPriceMinQty] = useState('1');
    const [newPriceVal, setNewPriceVal] = useState('');
    const [newPriceVarId, setNewPriceVarId] = useState('');

    // Mutation transaction form
    const [mutVarId, setMutVarId] = useState('');
    const [mutType, setMutType] = useState('in');
    const [mutQty, setMutQty] = useState('');
    const [mutSource, setMutSource] = useState('purchase');
    const [mutNotes, setMutNotes] = useState('');

    // Toast Alert
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // API integration functions
    const fetchProducts = async () => {
        setIsLoadingApi(true);
        try {
            const res = await axios.get('/adminv1/api/products');
            if (res.data && res.data.products) {
                setProducts(res.data.products);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setIsLoadingApi(false);
        }
    };

    const fetchCategoriesTree = async () => {
        try {
            const res = await axios.get('/adminv1/api/categories/tree');
            if (res.data && res.data.categories) {
                setCategoriesTree(res.data.categories);
            }
        } catch (err) {
            console.error('Error fetching categories tree:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategoriesTree();
    }, []);

    // Category tree component expand states
    const [expandedCategories, setExpandedCategories] = useState({ 1: true, 5: true });
    const toggleExpand = (id) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Robust specifications attributes mapping
    const getCategoryAttributes = () => {
        if (!formCategoryId) return null;
        if (CATEGORY_ATTRIBUTES_MAP[formCategoryId]) {
            return CATEGORY_ATTRIBUTES_MAP[formCategoryId];
        }
        if (formCategoryPath && formCategoryPath.length > 0) {
            const leafName = formCategoryPath[formCategoryPath.length - 1];
            if (CATEGORY_ATTRIBUTES_MAP[leafName]) {
                return CATEGORY_ATTRIBUTES_MAP[leafName];
            }
        }
        return null;
    };

    // Filter & Sort logic has been moved to getProcessedProducts DataTable helper

    // open form for adding new product
    const handleOpenCreate = () => {
        setEditingProduct(null);
        setFormName('');
        setFormDescription('');
        setFormCategoryId(null);
        setFormCategoryPath([]);
        setFormBadge('');
        setFormAttributes({});
        setFormIsFlashSale(false);
        setFormFlashSaleStock(0);
        setFormMainImage('');
        setFormGalleryImages([]);
        setFormVariants([
            { id: Date.now(), name: 'Default Varian', base_price: 150000, stock: 10, sku: 'PJM-' + Math.floor(1000 + Math.random() * 9000) }
        ]);
        setFormPrices([]);
        setFormMutations([]);
        setActiveTab('detail');
        setViewMode('form');
    };

    // open form for editing existing product
    const handleOpenEdit = (product) => {
        setEditingProduct(product);
        setFormName(product.name);
        setFormDescription(product.description);
        setFormCategoryId(product.category_id);
        setFormCategoryPath(product.category_path);
        setFormBadge(product.badge);
        setFormAttributes({ ...product.attributes });
        setFormIsFlashSale(product.is_flash_sale || false);
        setFormFlashSaleStock(product.flash_sale_stock || 0);
        setFormMainImage(product.main_image);
        setFormGalleryImages([...product.gallery_images]);
        setFormVariants([...product.variants]);
        setFormPrices([...product.prices]);
        setFormMutations([...product.stock_mutations]);
        setActiveTab('detail');
        setViewMode('form');
    };

    // delete product
    const handleDeleteProduct = async (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: 'Produk ini akan dihapus secara permanen dari katalog!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#4b5563',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await axios.delete(`/adminv1/api/products/${id}`);
                    if (res.data && res.data.status === 'success') {
                        Swal.fire({
                            title: 'Terhapus!',
                            text: 'Produk berhasil dihapus!',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        fetchProducts();
                    }
                } catch (err) {
                    console.error('Error deleting product:', err);
                    Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus produk.', 'error');
                }
            }
        });
    };

    // handle category selection from Tree View
    const handleSelectCategory = (id, path) => {
        setFormCategoryId(id);
        setFormCategoryPath(path);
        setFormAttributes({});
        showToast(`Kategori diatur ke: ${path.join(' > ')}`);
    };

    // handle variant addition
    const handleAddVariant = (e) => {
        e.preventDefault();
        if (!newVarName || !newVarPrice) return;
        const newVar = {
            id: Date.now(),
            name: newVarName,
            base_price: parseInt(newVarPrice),
            stock: 0,
            sku: newVarSku || 'PJM-VAR-' + Math.floor(1000 + Math.random() * 9000)
        };
        setFormVariants([...formVariants, newVar]);
        setNewVarName('');
        setNewVarPrice('');
        setNewVarSku('');
        showToast('Varian baru ditambahkan!');
    };

    // handle variant removal
    const handleRemoveVariant = (id) => {
        setFormVariants(formVariants.filter(v => v.id !== id));
        setFormPrices(formPrices.filter(p => p.variant_id !== id));
        showToast('Varian dihapus!');
    };

    // handle price level/wholesale addition
    const handleAddPrice = (e) => {
        e.preventDefault();
        if (!newPriceVal || !newPriceVarId) return;
        const newP = {
            id: Date.now(),
            variant_id: parseInt(newPriceVarId),
            level: newPriceLevel,
            min_qty: parseInt(newPriceMinQty),
            price: parseInt(newPriceVal)
        };
        setFormPrices([...formPrices, newP]);
        setNewPriceVal('');
        showToast('Aturan harga baru didaftarkan!');
    };

    // handle price level removal
    const handleRemovePrice = (id) => {
        setFormPrices(formPrices.filter(p => p.id !== id));
        showToast('Aturan harga dihapus!');
    };

    // handle stock adjustment/mutation process
    const handleProcessMutation = async (e) => {
        e.preventDefault();
        if (!mutVarId || !mutQty) return;
        const quantity = parseInt(mutQty);
        const variantId = parseInt(mutVarId);

        if (editingProduct) {
            try {
                const res = await axios.post(`/adminv1/api/products/${editingProduct.id}/mutate-stock`, {
                    variant_id: variantId,
                    type: mutType,
                    quantity: quantity,
                    source: mutSource,
                    notes: mutNotes
                });
                if (res.data && res.data.status === 'success') {
                    showToast(`Stok ${mutType === 'in' ? 'masuk' : 'keluar'} berhasil diproses!`);
                    
                    // Refresh current data
                    const productsRes = await axios.get('/adminv1/api/products');
                    if (productsRes.data && productsRes.data.products) {
                        setProducts(productsRes.data.products);
                        const updatedProd = productsRes.data.products.find(p => p.id === editingProduct.id);
                        if (updatedProd) {
                            setFormVariants([...updatedProd.variants]);
                            setFormMutations([...updatedProd.stock_mutations]);
                        }
                    }

                    setMutQty('');
                    setMutNotes('');
                }
            } catch (err) {
                console.error('Error mutating stock:', err);
                Swal.fire('Error', err.response?.data?.message || 'Gagal memproses mutasi stok.', 'error');
            }
        } else {
            const updatedVariants = formVariants.map(v => {
                if (v.id === variantId) {
                    const newStock = mutType === 'in' ? v.stock + quantity : Math.max(0, v.stock - quantity);
                    return { ...v, stock: newStock };
                }
                return v;
            });
            setFormVariants(updatedVariants);
            showToast(`Stok ${mutType === 'in' ? 'masuk' : 'keluar'} diperbarui.`);
            setMutQty('');
            setMutNotes('');
        }
    };

    // Upload main image
    const handleMainImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire('Perhatian', 'File harus berupa gambar!', 'warning');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            Swal.fire('Perhatian', 'Ukuran file maksimal adalah 2MB!', 'warning');
            return;
        }

        setIsUploadingMain(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/adminv1/api/products/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res.data && res.data.status === 'success') {
                setFormMainImage(res.data.url);
                showToast('Gambar utama berhasil diunggah!');
            }
        } catch (err) {
            console.error('Error uploading main image:', err);
            Swal.fire('Error', err.response?.data?.message || 'Gagal mengunggah gambar utama.', 'error');
        } finally {
            setIsUploadingMain(false);
        }
    };

    // Upload multiple gallery images
    const handleGalleryImagesUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                Swal.fire('Perhatian', `File ${file.name} bukan merupakan gambar dan akan dilewati.`, 'warning');
                return false;
            }
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Perhatian', `File ${file.name} melebihi batas 2MB dan akan dilewati.`, 'warning');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setIsUploadingGallery(true);
        let uploadedCount = 0;

        for (const file of validFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await axios.post('/adminv1/api/products/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (res.data && res.data.status === 'success') {
                    setFormGalleryImages(prev => [...prev, res.data.url]);
                    uploadedCount++;
                }
            } catch (err) {
                console.error(`Error uploading gallery image ${file.name}:`, err);
            }
        }

        setIsUploadingGallery(false);
        if (uploadedCount > 0) {
            showToast(`${uploadedCount} gambar galeri berhasil diunggah!`);
        } else {
            Swal.fire('Error', 'Gagal mengunggah gambar galeri.', 'error');
        }
    };

    // Save whole product form (Insert/Update)
    const handleSaveProduct = async () => {
        if (!formName) {
            Swal.fire('Perhatian', 'Nama produk tidak boleh kosong!', 'warning');
            return;
        }
        if (!formCategoryId) {
            Swal.fire('Perhatian', 'Harap pilih kategori dari Tree View!', 'warning');
            return;
        }

        const payload = {
            name: formName,
            category_id: formCategoryId,
            description: formDescription,
            main_image: formMainImage,
            badge: formBadge,
            is_flash_sale: formIsFlashSale,
            flash_sale_stock: formFlashSaleStock,
            attributes: formAttributes,
            variants: formVariants.map(v => ({
                id: typeof v.id === 'number' && v.id > 1000000000000 ? null : v.id,
                name: v.name,
                base_price: v.base_price,
                stock: v.stock,
                sku: v.sku
            })),
            prices: formPrices.map(p => ({
                id: typeof p.id === 'number' && p.id > 1000000000000 ? null : p.id,
                variant_id: typeof p.variant_id === 'number' && p.variant_id > 1000000000000 ? null : p.variant_id,
                variant_sku: formVariants.find(v => v.id === p.variant_id)?.sku,
                level: p.level,
                min_qty: p.min_qty,
                price: p.price
            })),
            gallery_images: formGalleryImages
        };

        try {
            if (editingProduct) {
                const res = await axios.put(`/adminv1/api/products/${editingProduct.id}`, payload);
                if (res.data && res.data.status === 'success') {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Produk berhasil diperbarui!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchProducts();
                    setViewMode('list');
                }
            } else {
                const res = await axios.post('/adminv1/api/products', payload);
                if (res.data && res.data.status === 'success') {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: 'Produk baru berhasil didaftarkan!',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchProducts();
                    setViewMode('list');
                }
            }
        } catch (err) {
            console.error('Error saving product:', err);
            Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan data produk.', 'error');
        }
    };

    // Custom Category Tree view Node Renderer
    const renderCategoryNode = (node, path = []) => {
        const currentPath = [...path, node.name];
        const hasChildren = node.isParent && node.children && node.children.length > 0;
        const isExpanded = expandedCategories[node.id];
        const isSelected = formCategoryId === node.id;

        return (
            <div key={node.id} className="pl-3.5 space-y-1.5 border-l border-slate-150/60 mt-1 select-none">
                <div className="flex items-center space-x-2 py-1">
                    {/* Expand/Collapse Chevron */}
                    {hasChildren ? (
                        <button 
                            type="button"
                            onClick={() => toggleExpand(node.id)}
                            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 transition cursor-pointer"
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    ) : (
                        <span className="w-5" /> // Spacer
                    )}

                    {/* Folder/File Icon */}
                    <span className="text-slate-400">
                        {hasChildren ? (
                            isExpanded ? <FolderOpen size={16} className="text-amber-500 fill-amber-100" /> : <Folder size={16} className="text-amber-500 fill-amber-150" />
                        ) : (
                            <FileText size={15} className="text-red-500" />
                        )}
                    </span>

                    {/* Node Label (Clickable to select if it's a leaf node/has no children, or any node as preferred) */}
                    <button
                        type="button"
                        onClick={() => {
                            if (!hasChildren) {
                                handleSelectCategory(node.id, currentPath);
                            } else {
                                toggleExpand(node.id);
                            }
                        }}
                        className={`text-xs font-bold px-2 py-0.5 rounded transition text-left cursor-pointer ${
                            isSelected 
                                ? 'bg-red-550 text-white font-extrabold shadow-sm'
                                : hasChildren 
                                    ? 'text-slate-700 hover:text-slate-900 font-extrabold'
                                    : 'text-slate-500 hover:text-red-650 hover:bg-red-50'
                        }`}
                    >
                        {node.name} {hasChildren && <span className="text-[9px] text-slate-400 font-normal">({node.children.length})</span>}
                    </button>
                </div>

                {/* Render children recursively */}
                {hasChildren && isExpanded && (
                    <div className="space-y-1.5">
                        {node.children.map(child => renderCategoryNode(child, currentPath))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-wider">Katalog Suku Cadang & Produk</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Kelola data inventaris, variasi harga grosir, atribut spesifikasi, dan histori mutasi gudang.</p>
                </div>
                {viewMode === 'list' && (
                    <button
                        onClick={handleOpenCreate}
                        className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-red-500/20 transition duration-200 flex items-center justify-center space-x-1.5 cursor-pointer self-start sm:self-auto uppercase tracking-wide"
                    >
                        <Plus size={15} />
                        <span>Tambah Produk Baru</span>
                    </button>
                )}
            </div>

            {/* TOAST ALERT DISPLAY */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-55 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
                    <Check size={16} className="text-emerald-500 stroke-3" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ========================================================================
                VIEW MODE: LIST
                ======================================================================== */}
            {viewMode === 'list' && (
                <div className="space-y-4">
                    {/* Filters & Search Row */}
                    <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-100/80 flex flex-col lg:flex-row gap-4 items-center justify-between animate-in fade-in duration-200">
                        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tampilkan:</span>
                                <select
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden focus:border-red-500 focus:bg-white transition cursor-pointer"
                                >
                                    {[5, 10, 25, 50, 100].map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">entri</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto justify-end">
                            <div className="relative w-full sm:max-w-xs flex items-center">
                                <span className="absolute left-3 text-slate-400">
                                    <Search size={15} />
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama produk / kode SKU..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                                />
                            </div>

                            {/* Category filter pills */}
                            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Filter:</span>
                                <button
                                    onClick={() => setSelectedCategoryFilter('')}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer uppercase ${
                                        selectedCategoryFilter === ''
                                            ? 'bg-red-550 text-white shadow-xs'
                                            : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                                    }`}
                                >
                                    Semua
                                </button>
                                {['Mesin & Transmisi', 'Sistem Pengereman', 'Kaki-Kaki & Ban', 'Pelumas & Aki'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategoryFilter(cat)}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap uppercase ${
                                            selectedCategoryFilter === cat
                                                ? 'bg-red-550 text-white shadow-xs'
                                                : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {cat.split(' & ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid / Table */}
                    {isLoadingApi ? (
                        <div className="bg-white rounded-xl p-16 text-center border border-slate-100 flex flex-col items-center justify-center">
                            <div className="h-10 w-10 border-4 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Memuat data produk...</p>
                        </div>
                    ) : processedProducts.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
                            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h4 className="text-sm font-black text-slate-700 uppercase">Produk Tidak Ditemukan</h4>
                            <p className="text-xs text-slate-400 font-semibold mt-1">Gunakan kata kunci lain atau bersihkan filter pencarian.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-150/80 shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                                            <th className="py-4 px-5 w-20">Foto</th>
                                            <th 
                                                className="py-4 px-5 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition"
                                                onClick={() => handleSort('name')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Nama Produk</span>
                                                    {renderSortIcon('name')}
                                                </div>
                                            </th>
                                            <th 
                                                className="py-4 px-5 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition"
                                                onClick={() => handleSort('category')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Kategori</span>
                                                    {renderSortIcon('category')}
                                                </div>
                                            </th>
                                            <th 
                                                className="py-4 px-5 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition"
                                                onClick={() => handleSort('price')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Harga Eceran</span>
                                                    {renderSortIcon('price')}
                                                </div>
                                            </th>
                                            <th 
                                                className="py-4 px-5 cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition"
                                                onClick={() => handleSort('stock')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Total Stok</span>
                                                    {renderSortIcon('stock')}
                                                </div>
                                            </th>
                                            <th className="py-4 px-5 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                        {currentEntries.map((p) => {
                                            const totalStock = p.variants.reduce((acc, curr) => acc + curr.stock, 0);
                                            const minPrice = Math.min(...p.variants.map(v => v.base_price));
                                            const maxPrice = Math.max(...p.variants.map(v => v.base_price));
                                            const priceDisplay = minPrice === maxPrice 
                                                ? `Rp ${minPrice.toLocaleString('id-ID')}`
                                                : `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`;

                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/40 transition">
                                                    <td className="py-3 px-5">
                                                        <div className="h-11 w-11 rounded-lg overflow-hidden border border-slate-150 bg-slate-50 shadow-inner">
                                                            <img src={p.main_image} alt={p.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-5 max-w-[280px]">
                                                        <div className="font-extrabold text-slate-800 text-xs md:text-sm truncate leading-snug">{p.name}</div>
                                                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-0.5 flex items-center flex-wrap gap-1.5">
                                                            <span>SKU: {p.variants[0]?.sku || '-'}</span>
                                                            {p.badge && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-red-650 bg-red-50 px-1.5 py-0.5 rounded font-black">{p.badge}</span>
                                                                </>
                                                            )}
                                                            {p.is_flash_sale && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center shadow-xs">⚡ Flash Sale ({p.flash_sale_stock} pcs)</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-5 text-slate-500 font-bold text-xs">
                                                        {p.category_path.join(' ➔ ')}
                                                    </td>
                                                    <td className="py-3 px-5 font-extrabold text-slate-800 text-xs">
                                                        {priceDisplay}
                                                    </td>
                                                    <td className="py-3 px-5 text-xs">
                                                        <span className={`inline-block px-2.5 py-0.5 rounded-md font-black ${
                                                            totalStock === 0 
                                                                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                                                : totalStock < 10 
                                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        }`}>
                                                            {totalStock} pcs ({p.variants.length} Varian)
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-5">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleOpenEdit(p)}
                                                                className="p-1.5 bg-red-50 text-red-650 border border-red-100 rounded-lg hover:bg-red-550 hover:text-white transition cursor-pointer"
                                                                title="Edit Detail & Varian"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(p.id)}
                                                                className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                                                title="Hapus Produk"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* DataTable Footer (Pagination & Info) */}
                            <div className="bg-slate-50/75 border-t border-slate-100 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-[11px] font-bold text-slate-500 text-center sm:text-left">
                                    {totalEntries > 0 ? (
                                        <>
                                            Menampilkan <span className="text-slate-800 font-extrabold">{indexOfFirstEntry + 1}</span> hingga{" "}
                                            <span className="text-slate-800 font-extrabold">{Math.min(indexOfLastEntry, totalEntries)}</span> dari{" "}
                                            <span className="text-slate-800 font-extrabold">{totalEntries}</span> entri
                                        </>
                                    ) : (
                                        "Menampilkan 0 entri"
                                    )}
                                </div>
                                
                                {totalPages > 1 && (
                                    <div className="flex items-center space-x-1">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                                        >
                                            Sebelumnya
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                                                    currentPage === pageNum
                                                        ? "bg-red-600 text-white shadow-xs"
                                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                        
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-extrabold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                                        >
                                            Selanjutnya
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================================
                VIEW MODE: FORM (ADD / EDIT) WITH TABS
                ======================================================================== */}
            {viewMode === 'form' && (
                <div className="space-y-5">
                    {/* Back header bar */}
                    <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
                        <button
                            onClick={() => setViewMode('list')}
                            className="flex items-center space-x-1.5 text-xs font-black text-slate-800 hover:text-red-650 transition cursor-pointer uppercase tracking-wider"
                        >
                            <ArrowLeft size={16} />
                            <span>Kembali ke Daftar</span>
                        </button>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            {editingProduct ? 'MODIFIKASI PRODUK' : 'REGISTRASI PRODUK BARU'}
                        </h4>
                    </div>

                    {/* Top Section: Main Image preview & Basic Details Form */}
                    <div className="bg-white rounded-xl border border-slate-150/80 shadow-xs p-5 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {/* Left Side: Main Image Preview & File Upload */}
                            <div className="md:col-span-1 space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 block">Foto Utama Sampul</span>
                                <label className="relative h-44 w-full rounded-2xl overflow-hidden border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-red-500 transition duration-200 flex flex-col items-center justify-center cursor-pointer shadow-inner group">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleMainImageUpload} 
                                        className="hidden" 
                                        disabled={isUploadingMain}
                                    />
                                    {isUploadingMain ? (
                                        <div className="flex flex-col items-center space-y-2 text-red-650">
                                            <div className="h-8 w-8 border-4 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Mengunggah...</span>
                                        </div>
                                    ) : formMainImage ? (
                                        <>
                                            <img src={formMainImage} alt="main preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white space-y-1">
                                                <ImageIcon size={20} />
                                                <span className="text-[10px] font-black uppercase tracking-wider">Ubah Gambar</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-1.5 text-slate-450 group-hover:text-red-650 transition-colors">
                                            <ImageIcon size={32} className="text-slate-300 group-hover:text-red-500" />
                                            <span className="text-[11px] font-extrabold uppercase tracking-wide">Pilih Gambar Utama</span>
                                            <span className="text-[9px] text-slate-400">Format JPG, PNG, WEBP (Maks 2MB)</span>
                                        </div>
                                    )}
                                </label>
                                {formMainImage && (
                                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 border border-slate-150 rounded-lg">
                                        <span className="text-[9px] text-slate-500 font-bold truncate max-w-[150px]">{formMainImage}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormMainImage('')}
                                            className="text-rose-600 hover:text-rose-800 text-[10px] font-extrabold uppercase cursor-pointer"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Basic Form (Name, Description, Badge) */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nama Produk</label>
                                    <input
                                        type="text"
                                        required
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="e.g. Oli Mesin Shell Helix Ultra 5W-40 Fully Synthetic"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deskripsi Lengkap</label>
                                    <textarea
                                        rows="4"
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        placeholder="Tuliskan detail spesifikasi produk, petunjuk kecocokan tipe mobil, dan deskripsi produk..."
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500 focus:bg-white transition resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Badge Promo (Optional)</label>
                                        <input
                                            type="text"
                                            value={formBadge}
                                            onChange={(e) => setFormBadge(e.target.value)}
                                            placeholder="e.g. Laris, 100% Ori, Flash Sale"
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div className="flex items-end justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSaveProduct}
                                            className="bg-linear-to-r from-red-650 via-red-600 to-red-950 hover:from-red-700 hover:to-red-950 text-white font-extrabold py-2.5 px-6 rounded-xl shadow-md hover:shadow-red-500/20 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer text-xs uppercase tracking-wider h-[38px] w-full sm:w-auto"
                                        >
                                            <Save size={15} />
                                            <span>Simpan Produk</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Pengaturan Flash Sale</label>
                                        <label className="relative inline-flex items-center cursor-pointer mt-2.5 select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={formIsFlashSale}
                                                onChange={(e) => setFormIsFlashSale(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650"></div>
                                            <span className="ml-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide">Aktifkan Promo Flash Sale</span>
                                        </label>
                                    </div>
                                    
                                    {formIsFlashSale && (
                                        <div className="space-y-1.5 animate-in slide-in-from-left-3 duration-250">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stok Promo Flash Sale</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formFlashSaleStock}
                                                onChange={(e) => setFormFlashSaleStock(parseInt(e.target.value) || 0)}
                                                placeholder="Stok khusus Flash Sale"
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Tabs Navigation & Active Tab Content */}
                    <div className="bg-white rounded-xl border border-slate-150/80 shadow-xs overflow-hidden">
                        {/* Horizontal Tabs Header */}
                        <div className="flex border-b border-slate-100 bg-slate-50/75 overflow-x-auto scrollbar-none">
                            {[
                                { id: 'detail', label: 'Kategori & Atribut Spesifikasi', icon: Layers },
                                { id: 'gambar', label: 'Galeri Foto Tambahan', icon: ImageIcon },
                                { id: 'harga', label: 'Variasi & Multi-Harga', icon: Tag },
                                { id: 'stok', label: 'Stok & Log Mutasi', icon: Package }
                            ].map(tab => {
                                const TabIcon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-6 py-4.5 text-xs font-bold transition duration-200 border-b-2 whitespace-nowrap cursor-pointer ${
                                            isActive
                                                ? 'border-red-600 text-red-600 bg-white'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                                        }`}
                                    >
                                        <TabIcon size={14} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Tab Panel */}
                        <div className="p-5 md:p-6 min-h-[350px]">
                            
                            {/* TAB 1: DETAIL & KATEGORI (TREE VIEW) */}
                            {activeTab === 'detail' && (
                                <div className="space-y-6">
                                    <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Pengaturan Kategori & Spesifikasi Atribut</h4>
                                        <span className="text-[10px] text-slate-400 font-bold">Langkah 1 dari 4</span>
                                    </div>

                                    {/* Collapsible Category Tree View Selector */}
                                    <div className="border border-slate-100 rounded-xl p-4.5 bg-slate-50/50">
                                        <div className="flex flex-col space-y-1 mb-4">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pilih Kategori (Kategori Tree View)</label>
                                            <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                                                <span>Aktif:</span> 
                                                {formCategoryPath.length > 0 ? (
                                                    <span className="text-red-600 font-extrabold uppercase tracking-wide bg-red-50 px-2 py-0.5 rounded border border-red-200/50">{formCategoryPath.join(' ➔ ')}</span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum memilih kategori</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Categories Root Render */}
                                        <div className="bg-white rounded-lg p-3.5 border border-slate-200/60 max-h-[200px] overflow-y-auto space-y-1">
                                            {categoriesTree.map(rootNode => renderCategoryNode(rootNode))}
                                        </div>
                                    </div>

                                    {/* DYNAMIC ATTRIBUT FIELD GENERATED CONDITIONALLY */}
                                    {(() => {
                                        const attrs = getCategoryAttributes();
                                        if (!attrs) return null;
                                        return (
                                            <div className="bg-red-50/30 rounded-xl p-4.5 border border-red-100/50 space-y-4">
                                                <div className="flex items-center space-x-2 border-b border-red-100 pb-2">
                                                    <Layers className="text-red-600" size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">Spesifikasi Dinamis Kategori</span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {attrs.map((attr) => (
                                                        <div key={attr.id} className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                                                {attr.name} {attr.required && <span className="text-red-500 font-bold">*</span>}
                                                            </label>
                                                            
                                                            {attr.type === 'select' ? (
                                                                <select
                                                                    value={formAttributes[attr.id] || ''}
                                                                    onChange={(e) => setFormAttributes({ ...formAttributes, [attr.id]: e.target.value })}
                                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500 transition"
                                                                >
                                                                    <option value="">-- Pilih {attr.name} --</option>
                                                                    {attr.options.map(opt => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={formAttributes[attr.id] || ''}
                                                                    onChange={(e) => setFormAttributes({ ...formAttributes, [attr.id]: e.target.value })}
                                                                    placeholder={attr.placeholder}
                                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-red-500 transition"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* TAB 2: GAMBAR & GALERI */}
                            {activeTab === 'gambar' && (
                                <div className="space-y-6">
                                     <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                                         <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Galeri Foto Tambahan</h4>
                                         <span className="text-[10px] text-slate-400 font-bold">Langkah 2 dari 4</span>
                                     </div>

                                     {/* Additional Gallery Management */}
                                     <div className="space-y-4">
                                         <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                                             <ImageIcon size={15} />
                                             <span>Kelola Galeri Foto Tambahan (Halaman Detail)</span>
                                         </h5>
                                         
                                         {/* Multiple File Upload Zone */}
                                         <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/50 transition cursor-pointer relative group">
                                             <input 
                                                 type="file" 
                                                 multiple 
                                                 accept="image/*"
                                                 onChange={handleGalleryImagesUpload}
                                                 className="absolute inset-0 opacity-0 cursor-pointer"
                                                 disabled={isUploadingGallery}
                                             />
                                             {isUploadingGallery ? (
                                                 <div className="flex flex-col items-center space-y-2 text-red-650">
                                                     <div className="h-8 w-8 border-4 border-red-650 border-t-transparent rounded-full animate-spin"></div>
                                                     <span className="text-xs font-bold uppercase tracking-wider">Sedang Mengunggah Gambar...</span>
                                                 </div>
                                             ) : (
                                                 <div className="flex flex-col items-center space-y-1.5 text-center">
                                                     <PlusCircle size={28} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                                                     <span className="text-xs font-extrabold text-slate-700">Pilih / Seret Foto Galeri</span>
                                                     <span className="text-[10px] text-slate-450">Bisa memilih lebih dari 1 gambar sekaligus (Maks 2MB per file)</span>
                                                 </div>
                                             )}
                                         </div>

                                         {/* Gallery list preview */}
                                         {formGalleryImages.length === 0 ? (
                                             <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-center text-slate-450 text-xs italic">
                                                 Belum ada foto tambahan di galeri produk. Silakan unggah gambar di atas.
                                             </div>
                                         ) : (
                                             <div className="space-y-2">
                                                 <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Daftar Galeri ({formGalleryImages.length} Foto)</div>
                                                 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 pt-1">
                                                     {formGalleryImages.map((img, index) => (
                                                         <div key={index} className="relative h-24 w-full rounded-xl overflow-hidden border border-slate-250 bg-slate-100 group shadow-xs">
                                                             <img src={img} alt="gallery preview" className="w-full h-full object-cover" />
                                                             <button
                                                                 type="button"
                                                                 onClick={() => setFormGalleryImages(formGalleryImages.filter((_, i) => i !== index))}
                                                                 className="absolute top-1.5 right-1.5 p-1 bg-slate-900/60 hover:bg-rose-600 text-white rounded-full transition duration-150 cursor-pointer shadow-md"
                                                             >
                                                                 <X size={12} />
                                                             </button>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         )}
                                     </div>
                                </div>
                            )}

                            {/* TAB 3: HARGA & MULTI-HARGA */}
                            {activeTab === 'harga' && (
                                <div className="space-y-6">
                                    <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Pengaturan Variasi & Multi-Harga</h4>
                                        <span className="text-[10px] text-slate-400 font-bold">Langkah 3 dari 4</span>
                                    </div>

                                    {/* 1. Variants definition */}
                                    <div className="space-y-3.5">
                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">1. Daftar Varian Produk</h5>
                                        
                                        {/* Add variant row */}
                                        <form onSubmit={handleAddVariant} className="bg-slate-50 p-4 border border-slate-100 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Nama Varian</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={newVarName}
                                                    onChange={(e) => setNewVarName(e.target.value)}
                                                    placeholder="e.g. Kemasan 4L, Hitam" 
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Harga Dasar (Rp)</label>
                                                <input 
                                                    type="number" 
                                                    required
                                                    value={newVarPrice}
                                                    onChange={(e) => setNewVarPrice(e.target.value)}
                                                    placeholder="e.g. 450000" 
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Kode Part SKU</label>
                                                <input 
                                                    type="text" 
                                                    value={newVarSku}
                                                    onChange={(e) => setNewVarSku(e.target.value)}
                                                    placeholder="e.g. SH-HU-4L" 
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-red-650 hover:bg-red-650/90 text-white font-extrabold py-2 px-4 rounded-md text-xs cursor-pointer flex items-center justify-center space-x-1.5 uppercase h-10 w-full"
                                            >
                                                <PlusCircle size={14} />
                                                <span>Varian</span>
                                            </button>
                                        </form>

                                        {/* Variants list table */}
                                        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                        <th className="p-3">Nama Varian</th>
                                                        <th className="p-3">Harga Dasar</th>
                                                        <th className="p-3">Kode SKU</th>
                                                        <th className="p-3">Stok Awal</th>
                                                        <th className="p-3 text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                                    {formVariants.map(v => (
                                                        <tr key={v.id} className="hover:bg-slate-50/50">
                                                            <td className="p-3 font-extrabold text-slate-800">{v.name}</td>
                                                            <td className="p-3">Rp {v.base_price.toLocaleString('id-ID')}</td>
                                                            <td className="p-3 font-mono">{v.sku}</td>
                                                            <td className="p-3 text-slate-500">{v.stock} pcs</td>
                                                            <td className="p-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveVariant(v.id)}
                                                                    className="mx-auto block p-1 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 cursor-pointer"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 2. Price levels & Wholesale Multi-prices */}
                                    <div className="space-y-3.5 border-t border-slate-100 pt-5">
                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">2. Aturan Multi-Harga (Grosir & Level Pelanggan)</h5>
                                        
                                        {/* Add Price level rule */}
                                        <form onSubmit={handleAddPrice} className="bg-slate-50 p-4 border border-slate-100 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Varian Produk</label>
                                                <select
                                                    required
                                                    value={newPriceVarId}
                                                    onChange={(e) => setNewPriceVarId(e.target.value)}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                >
                                                    <option value="">-- Pilih --</option>
                                                    {formVariants.map(v => (
                                                        <option key={v.id} value={v.id}>{v.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Level Pelanggan</label>
                                                <select
                                                    value={newPriceLevel}
                                                    onChange={(e) => setNewPriceLevel(e.target.value)}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                >
                                                    <option value="retail">Retail / Umum</option>
                                                    <option value="bengkel">Bengkel Partner</option>
                                                    <option value="reseller">Reseller Agen</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Min. Beli (Qty)</label>
                                                <input 
                                                    type="number" 
                                                    required
                                                    min="1"
                                                    value={newPriceMinQty}
                                                    onChange={(e) => setNewPriceMinQty(e.target.value)}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Harga Jual (Rp)</label>
                                                <input 
                                                    type="number" 
                                                    required
                                                    value={newPriceVal}
                                                    onChange={(e) => setNewPriceVal(e.target.value)}
                                                    placeholder="e.g. 390000" 
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-red-650 hover:bg-red-650/90 text-white font-extrabold py-2 px-4 rounded-md text-xs cursor-pointer flex items-center justify-center space-x-1.5 uppercase h-10 w-full"
                                            >
                                                <PlusCircle size={14} />
                                                <span>Aturan</span>
                                            </button>
                                        </form>

                                        {/* Multi prices lists */}
                                        {formPrices.length === 0 ? (
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center text-slate-400 text-xs italic">
                                                Belum ada aturan multi-harga khusus. (Default menggunakan Harga Dasar).
                                            </div>
                                        ) : (
                                            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                            <th className="p-3">Varian</th>
                                                            <th className="p-3">Level Harga</th>
                                                            <th className="p-3">Min. Qty Beli</th>
                                                            <th className="p-3">Harga Berlaku</th>
                                                            <th className="p-3 text-center">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                                        {formPrices.map(p => {
                                                            const matchedVar = formVariants.find(v => v.id === p.variant_id);
                                                            const levelName = p.level === 'retail' ? 'Retail / Umum' : p.level === 'bengkel' ? 'Bengkel Partner' : 'Reseller';
                                                            return (
                                                                <tr key={p.id} className="hover:bg-slate-50/50">
                                                                    <td className="p-3 font-bold text-slate-800">{matchedVar?.name || 'Varian Terhapus'}</td>
                                                                    <td className="p-3 uppercase text-[10px]"><span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-extrabold">{levelName}</span></td>
                                                                    <td className="p-3">Beli &gt;= {p.min_qty} unit</td>
                                                                    <td className="p-3 font-extrabold text-red-600">Rp {p.price.toLocaleString('id-ID')}</td>
                                                                    <td className="p-3">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemovePrice(p.id)}
                                                                            className="mx-auto block p-1 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 cursor-pointer"
                                                                        >
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: STOK & MUTASI */}
                            {activeTab === 'stok' && (
                                <div className="space-y-6">
                                    <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Pencatatan & Mutasi Gudang</h4>
                                        <span className="text-[10px] text-slate-400 font-bold">Langkah 4 dari 4</span>
                                    </div>

                                    {/* 1. Current variants stocks overview */}
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">1. Saldo Stok Varian Saat Ini</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                            {formVariants.map(v => (
                                                <div key={v.id} className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <div className="text-xs font-black text-slate-800">{v.name}</div>
                                                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">{v.sku}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-base font-black text-red-655">{v.stock} pcs</div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Saldo Stok</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Stock In/Out mutation adjustment form */}
                                    <div className="border-t border-slate-100 pt-5 space-y-3.5">
                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">2. Form Penyesuaian Mutasi Stok</h5>
                                        
                                        <form onSubmit={handleProcessMutation} className="bg-red-50/20 border border-red-150/40 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Varian Produk</label>
                                                <select
                                                    required
                                                    value={mutVarId}
                                                    onChange={(e) => setMutVarId(e.target.value)}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                >
                                                    <option value="">-- Pilih --</option>
                                                    {formVariants.map(v => (
                                                        <option key={v.id} value={v.id}>{v.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Tipe Mutasi</label>
                                                <select
                                                    value={mutType}
                                                    onChange={(e) => setMutType(e.target.value)}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                >
                                                    <option value="in">Stok Masuk (Stock IN)</option>
                                                    <option value="out">Stok Keluar (Stock OUT)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Sumber Alasan</label>
                                                <select
                                                    value={mutSource}
                                                    onChange={(e) => setMutSource(e.target.value)}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                >
                                                    <option value="purchase">Pembelian Gudang</option>
                                                    <option value="sale">Penjualan Kasir</option>
                                                    <option value="adjustment">Penyesuaian Opname</option>
                                                    <option value="return">Retur Rusak</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Jumlah (Qty)</label>
                                                <input 
                                                    type="number" 
                                                    required
                                                    min="1"
                                                    value={mutQty}
                                                    onChange={(e) => setMutQty(e.target.value)}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                />
                                            </div>
                                            <div className="space-y-1 sm:col-span-4">
                                                <label className="text-[9px] font-bold text-slate-500 uppercase block">Catatan Mutasi</label>
                                                <input 
                                                    type="text" 
                                                    value={mutNotes}
                                                    onChange={(e) => setMutNotes(e.target.value)}
                                                    placeholder="e.g. Kulakan barang dari distributor, Penyesuaian stok opname bulanan..."
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold focus:outline-hidden focus:border-red-500"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-red-600 hover:bg-red-500 text-white font-extrabold py-2 px-4 rounded-md text-xs cursor-pointer flex items-center justify-center space-x-1.5 uppercase h-10 w-full"
                                            >
                                                <RefreshCw size={14} className="animate-spin" />
                                                <span>Proses</span>
                                            </button>
                                        </form>
                                    </div>

                                    {/* 3. Mutations History Log */}
                                    <div className="border-t border-slate-100 pt-5 space-y-3.5">
                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                                            <History size={15} />
                                            <span>3. Log Histori Mutasi Stok (Terbaru di atas)</span>
                                        </h5>
                                        
                                        {formMutations.length === 0 ? (
                                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-center text-slate-400 text-xs italic">
                                                Belum ada rekaman riwayat transaksi mutasi stok.
                                            </div>
                                        ) : (
                                            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                                                <table className="w-full text-left border-collapse text-xs">
                                                    <thead>
                                                        <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                            <th className="p-3">Waktu</th>
                                                            <th className="p-3">Varian</th>
                                                            <th className="p-3">Mutasi</th>
                                                            <th className="p-3">Sumber</th>
                                                            <th className="p-3">Petugas</th>
                                                            <th className="p-3">Catatan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                                        {formMutations.map(m => {
                                                            const matchedVar = formVariants.find(v => v.id === m.variant_id);
                                                            const isStockIn = m.type === 'in';
                                                            const sourceLabel = m.source === 'purchase' ? 'Pembelian' : m.source === 'sale' ? 'Penjualan' : m.source === 'return' ? 'Retur' : 'Penyesuaian';
                                                            return (
                                                                <tr key={m.id} className="hover:bg-slate-50/50">
                                                                    <td className="p-3 text-slate-400 font-mono">{m.created_at}</td>
                                                                    <td className="p-3 text-slate-800 font-bold">{matchedVar?.name || 'Varian Terhapus'}</td>
                                                                    <td className="p-3">
                                                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                                                                            isStockIn 
                                                                                ? 'bg-emerald-50 text-emerald-600' 
                                                                                : 'bg-rose-50 text-rose-600'
                                                                        }`}>
                                                                            {isStockIn ? '+' : '-'}{m.quantity} pcs
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-3 capitalize">{sourceLabel}</td>
                                                                    <td className="p-3 text-slate-500">{m.user}</td>
                                                                    <td className="p-3 text-slate-400 font-medium italic max-w-[200px] truncate" title={m.notes}>{m.notes}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
