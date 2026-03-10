import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { useNotification } from '../context/NotificationContext';
import { getSession, clearSession } from '../services/auth';
import { fetchMarketplaceItems, addMarketplaceItem, updateMarketplaceItem, deleteMarketplaceItem, uploadImage } from '../services/marketplace';
import { fetchFaqs, addFaq, updateFaq, deleteFaq } from '../services/faq';
import { fetchNewsletterSubscriptions, deleteNewsletterSubscription } from '../services/newsletter';
import { Export, Add, Edit, Trash, Ship, MessageQuestion, Sms, Element3, Logout, SearchNormal1, CloseSquare, HambergerMenu } from 'iconsax-react';
import { fetchMessages, updateMessage, deleteMessage } from '../services/messages';
import { fetchAds, addAd, deleteAd } from '../services/ads';
import { config } from '../config';

import '../styles/admin.css';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
    // ... (state remains valid)
    // State for Marketplace and General UI
    const [marketplaceItems, setMarketplaceItems] = useState([]);
    const [marketLoading, setMarketLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddItem, setShowAddItem] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        category: 'sale',
        price: '',
        availability: 'Immediate',
        location: 'Port Harcourt, Nigeria',
        tags: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editingMarketItem, setEditingMarketItem] = useState(null);
    // FAQ State
    const [faqItems, setFaqItems] = useState([]);
    const [showAddFaq, setShowAddFaq] = useState(false);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [editingFaq, setEditingFaq] = useState(null);

    // Newsletter State
    const [subscriptions, setSubscriptions] = useState([]);
    const [newsLoading, setNewsLoading] = useState(false);

    // Messages State
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [viewingMessage, setViewingMessage] = useState(null);
    const unreadCount = messages.filter(m => !m.is_read).length;

    // Admin User Identity
    const [adminUser, setAdminUser] = useState(null);

    // UI Advanced Features
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());

    // Ads State
    const [ads, setAds] = useState([]);
    const [adsLoading, setAdsLoading] = useState(false);
    const [showAddAd, setShowAddAd] = useState(false);
    const [selectedAdFiles, setSelectedAdFiles] = useState([]);

    // Authentication Check & Proactive Profile Load
    useEffect(() => {
        const checkAuth = async () => {
            const token = getSession();
            if (!token) {
                navigate('/admin-login');
                return;
            }

            // Load from local storage initially
            const storedUser = localStorage.getItem('admin_user');
            let currentUser = null;
            if (storedUser) {
                try {
                    currentUser = JSON.parse(storedUser);
                    setAdminUser(currentUser);
                } catch (e) {
                    console.error("Error parsing admin user", e);
                }
            }

            // Always fetch latest profile from DB to ensure UI integrity (Full Name, etc)
            if (currentUser?.id) {
                try {
                    const response = await fetch(`${config.supabaseUrl}/rest/v1/User?id=eq.${currentUser.id}&select=full_name`, {
                        headers: {
                            'apikey': config.supabaseAnonKey,
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error("Profile fetch failed:", errorText);
                        return;
                    }

                    const data = await response.json();

                    if (data && data[0]) {
                        const updatedUser = {
                            ...currentUser,
                            full_name: data[0].full_name, // Direct property for easier access
                            user_metadata: {
                                ...(currentUser.user_metadata || {}),
                                full_name: data[0].full_name
                            }
                        };
                        setAdminUser(updatedUser);
                        localStorage.setItem('admin_user', JSON.stringify(updatedUser));
                    } else {
                        console.warn("No record found in 'User' table for this ID. Check your database!");
                    }
                } catch (err) {
                    console.error("Failed to refresh user profile from database:", err);
                }
            }
        };

        checkAuth();
    }, [navigate]);

    // Fetch data when tab is active
    useEffect(() => {
        if (activeTab === 'marketplace' || activeTab === 'dashboard') {
            loadMarketplaceItems();
            if (activeTab === 'dashboard') {
                // Show message counts on the dashboard
                loadMessages();
            }
        } else if (activeTab === 'faq') {
            loadFaqs();
        } else if (activeTab === 'newsletter') {
            loadNewsletter();
        } else if (activeTab === 'messages') {
            loadMessages();
        } else if (activeTab === 'ads') {
            loadAds();
        }
    }, [activeTab]);

    const loadFaqs = async () => {
        try {
            const data = await fetchFaqs();
            setFaqItems(data);
        } catch (err) {
            console.error(err);
            setError(`FAQ Error: ${err.message} `);
        }
    };

    const loadAds = async () => {
        setAdsLoading(true);
        try {
            const data = await fetchAds();
            setAds(data);
        } catch (err) {
            console.error(err);
            setError(`Ads Error: ${err.message}`);
        } finally {
            setAdsLoading(false);
        }
    };

    const loadMarketplaceItems = async () => {
        setMarketLoading(true);
        setError(null);
        try {
            const data = await fetchMarketplaceItems();
            setMarketplaceItems(data);
        } catch (err) {
            console.error(err);
            if (err.message.includes('JWT') || err.message.includes('invalid') || err.message.includes('token')) {
                handleLogout();
            } else {
                setError(`Listing Error: ${err.message} `);
            }
        } finally {
            setMarketLoading(false);
        }
    };

    const loadNewsletter = async () => {
        setNewsLoading(true);
        try {
            const data = await fetchNewsletterSubscriptions();
            setSubscriptions(data);
        } catch (err) {
            console.error(err);
            setError(`Newsletter Error: ${err.message} `);
        } finally {
            setNewsLoading(false);
        }
    };

    const loadMessages = async () => {
        setMessagesLoading(true);
        try {
            const data = await fetchMessages();
            setMessages(data);
        } catch (err) {
            console.error(err);
            if (err.message.includes('JWT') || err.message.includes('invalid') || err.message.includes('token')) {
                handleLogout();
            } else {
                setError(`Messages Error: ${err.message}`);
            }
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleToggleRead = async (msg) => {
        try {
            await updateMessage(msg.id, { is_read: !msg.is_read });
            // Optimistic update locally
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: !m.is_read } : m));
        } catch (err) {
            notify('Error updating message status: ' + err.message, 'error');
        }
    };

    const handleDeleteMessage = async (id) => {
        try {
            await deleteMessage(id);
            setMessages(messages.filter(m => m.id !== id));
            notify(t('Delete Success'), 'success');
        } catch (err) {
            notify('Error deleting message: ' + err.message, 'error');
        }
    };

    const handleDeleteMarketItem = async (id) => {
        if (!window.confirm(t('Are you sure?'))) return;
        try {
            await deleteMarketplaceItem(id);
            loadMarketplaceItems();
            notify(t('Delete Success'), 'success');
        } catch (err) {
            notify("Error deleting item: " + err.message, 'error');
        }
    };

    const handleDeleteFaqItem = async (id) => {
        if (!window.confirm(t('Are you sure?'))) return;
        try {
            await deleteFaq(id);
            loadFaqs();
            notify(t('Delete Success'), 'success');
        } catch (err) {
            notify("Error deleting FAQ: " + err.message, 'error');
        }
    };

    const handleMassDeleteMessages = async () => {
        if (selectedItems.size === 0) return;

        if (window.confirm(`${t('Confirm Delete')} ${selectedItems.size} ${t('Messages')}?`)) {
            try {
                // For now, delete individually in a loop (Supabase best practice for small batches)
                // In production, use a RPC for mass deletes
                const idsToDelete = Array.from(selectedItems);
                await Promise.all(idsToDelete.map(id => deleteMessage(id)));

                setMessages(messages.filter(m => !selectedItems.has(m.id)));
                setSelectedItems(new Set());
                notify(t('Delete Success'), 'success');
            } catch (err) {
                notify("Error during mass delete: " + err.message, 'error');
            }
        }
    };

    const handleMassDelete = async () => {
        if (selectedItems.size === 0) return;
        if (!window.confirm(t('Mass Delete Confirm'))) return;

        try {
            const ids = Array.from(selectedItems);
            if (activeTab === 'marketplace') {
                await Promise.all(ids.map(id => deleteMarketplaceItem(id)));
                loadMarketplaceItems();
            } else if (activeTab === 'partnerships') {
                // Assuming deletePartnership and loadPartnerships exist
                // await Promise.all(ids.map(id => deletePartnership(id)));
                // loadPartnerships();
                notify("Partnership mass delete not implemented yet.", 'info');
            } else if (activeTab === 'messages') {
                handleMassDeleteMessages();
                return;
            } else if (activeTab === 'faq') {
                await Promise.all(ids.map(id => deleteFaq(id)));
                loadFaqs();
            }
            setSelectedItems(new Set());
            notify(t('Delete Success'), 'success');
        } catch (err) {
            notify("Error during mass delete: " + err.message, 'error');
        }
    };

    const toggleSelectItem = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const toggleSelectAll = (items) => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(i => i.id)));
        }
    };

    const handleLogout = () => {
        clearSession();
        navigate('/admin-login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Lock body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen && window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    // Lock body scroll when modals are open
    // Assuming isAddModalOpen and isEditModalOpen are defined elsewhere if needed for other modals
    // For now, commenting out as they are not defined in the provided snippet
    /*
    useEffect(() => {
        if (isAddModalOpen || isEditModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isAddModalOpen, isEditModalOpen]);
    */

    // Sidebar Item Component
    const SidebarItem = ({ icon: Icon, label, tabId, isLogout }) => (
        <div
            onClick={() => {
                if (isLogout) handleLogout();
                else {
                    setActiveTab(tabId);
                    setSidebarOpen(false); // Close sidebar on mobile on selection
                }
            }}
            className={`dashboard-sidebar-item ${activeTab === tabId && !isLogout ? 'active' : ''} ${isLogout ? 'logout' : ''}`}
        >
            <Icon size={20} color="currentColor" variant={activeTab === tabId && !isLogout ? "Bold" : "Outline"} />
            <span>{label}</span>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            {/* Full Width Top Header (Custom) */}
            <div className="dashboard-top-header">
                <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Mobile Toggle inside Header */}
                    <div className="mobile-menu-trigger" onClick={toggleSidebar} style={{ cursor: 'pointer', marginRight: '8px' }}>
                        {sidebarOpen ? <CloseSquare size="24" color="#0A192F" /> : <HambergerMenu size="24" color="#0A192F" />}
                    </div>
                    <Link to="/">
                        <img
                            src="/images/logo-alpha.jpg"
                            alt="Romeo Alpha Logo"
                            style={{ height: '50px', objectFit: 'contain' }}
                        />
                    </Link>
                </div>

                {/* Dashboard Address removed as requested */}

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="admin-user-info" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: '#0A192F', fontSize: '14px' }}>
                            {adminUser?.full_name || adminUser?.user_metadata?.full_name || t('User')}
                        </div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#E6F1FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#0056b3',
                        overflow: 'hidden'
                    }}>
                        {adminUser?.user_metadata?.avatar_url ? (
                            <img src={adminUser.user_metadata.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            (adminUser?.full_name?.[0] || adminUser?.user_metadata?.full_name?.[0] || adminUser?.email?.[0] || 'U').toUpperCase()
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Sidebar */}
                <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div style={{ flex: 1 }}>
                        <SidebarItem icon={Element3} label={t('Dashboard')} tabId="dashboard" />
                        <SidebarItem icon={Ship} label={t('Marketplace')} tabId="marketplace" />
                        <SidebarItem icon={MessageQuestion} label={t('Messages')} tabId="messages" />
                        <SidebarItem icon={MessageQuestion} label={t('FAQ')} tabId="faq" />
                        <SidebarItem icon={Sms} label={t('Newsletter')} tabId="newsletter" />
                        <SidebarItem icon={Export} label={t('Upload')} tabId="ads" />
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                        <SidebarItem icon={Logout} label={t('Logout')} isLogout={true} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="dashboard-main">

                    {activeTab === 'dashboard' && (
                        <div className="fade-in">


                            <header style={{ marginBottom: '12px' }}>
                                <h1 style={{ fontSize: '28px', color: '#0A192F', margin: 0 }}>{t('Dashboard')}</h1>
                            </header>

                            {error && (
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#FFF0F0',
                                    border: '1px solid #FFCACA',
                                    borderRadius: '8px',
                                    color: '#D32F2F',
                                    marginBottom: '24px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span><strong>{t('Error Label')}:</strong> {error}</span>
                                    <button onClick={() => { loadMarketplaceItems(); }} style={{ background: 'none', border: '1px solid #D32F2F', color: '#D32F2F', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>{t('Try Refresh')}</button>
                                </div>
                            )}

                            <div className="dashboard-grid">

                                {/* Summary Card 2: Marketplace items */}
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ color: '#6B82AC', fontSize: '14px', fontWeight: 600 }}>{t('Active Listings')}</span>
                                        <div style={{ padding: '8px', backgroundColor: '#FFF4E6', borderRadius: '8px' }}>
                                            <Ship size="20" color="#FF8A00" variant="Bold" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '32px', margin: 0, color: '#0A192F' }}>{marketplaceItems.length || '-'}</h3>
                                </div>

                                {/* Summary Card 3: For Sale */}
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ color: '#6B82AC', fontSize: '14px', fontWeight: 600 }}>{t('Vessels for Sale')}</span>
                                        <div style={{ padding: '8px', backgroundColor: '#E6FFF1', borderRadius: '8px' }}>
                                            <Add size="20" color="#00B341" variant="Bold" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '32px', margin: 0, color: '#0A192F' }}>
                                        {marketplaceItems.filter(item => item.category === 'sale').length || '0'}
                                    </h3>
                                </div>
                                {/* Summary Card 4: Messages */}
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ color: '#6B82AC', fontSize: '14px', fontWeight: 600 }}>{t('Messages')}</span>
                                        <div style={{ padding: '8px', backgroundColor: '#E8F4FF', borderRadius: '8px' }}>
                                            <MessageQuestion size="20" color="#0066cc" variant="Bold" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '32px', margin: 0, color: '#0A192F' }}>{messages.length || '-'}</h3>
                                    <div style={{ color: '#6B82AC', marginTop: '8px', fontSize: '13px' }}>{unreadCount} {t('Unread')}</div>
                                </div>
                            </div>
                        </div>
                    )}




                    {activeTab === 'marketplace' && (
                        <div className="fade-in">
                            <header style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1 style={{ fontSize: '28px', color: '#0A192F', margin: 0 }}>{t('Marketplace')}</h1>
                                <button
                                    onClick={() => setShowAddItem(!showAddItem)}
                                    className="dashboard-action-btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        backgroundColor: '#0056b3',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        width: 'fit-content'
                                    }}
                                >
                                    <Add size="20" />
                                    <span className="btn-text">{t('Add New Item')}</span>
                                </button>
                            </header>

                            {showAddItem && (
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '32px' }}>
                                    <h3 style={{ marginBottom: '20px', color: '#0A192F' }}>{editingMarketItem ? t('Edit Marketplace Item') : t('Add New Item')}</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Title')}</label>
                                            <input
                                                type="text"
                                                placeholder={t('Placeholder Name')}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Category')}</label>
                                            <select
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            >
                                                <option value="sale">{t('Marketplace Sale')}</option>
                                                <option value="hire">{t('Marketplace Hire')}</option>
                                                <option value="repair">{t('Marketplace Repair')}</option>
                                                <option value="scrap">{t('Marketplace Scrap')}</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Price')} (₦)</label>
                                            <input
                                                type="text"
                                                placeholder={t('Price Placeholder')}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.price}
                                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Availability')}</label>
                                            <input
                                                type="text"
                                                placeholder={t('Immediate')}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.availability}
                                                onChange={(e) => setNewItem({ ...newItem, availability: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Location')}</label>
                                            <input
                                                type="text"
                                                placeholder={t('Label Portharcourt')}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.location}
                                                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Tags Placeholder')}</label>
                                            <input
                                                type="text"
                                                placeholder={t('Tags Placeholder')}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.tags}
                                                onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Upload Images')}</label>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp"
                                                multiple
                                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files).slice(0, 5);
                                                    setSelectedFiles(files);
                                                }}
                                            />
                                            {selectedFiles.length > 0 && (
                                                <span style={{ fontSize: '12px', color: '#666' }}>{selectedFiles.length} {t('Files Selected')}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Description')}</label>
                                            <textarea
                                                placeholder={t('Inquiry Placeholder Message')}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px', fontFamily: 'inherit' }}
                                                value={newItem.description}
                                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                        <button
                                            style={{ padding: '10px 24px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                            onClick={async () => {
                                                if (!newItem.title || !newItem.description) {
                                                    notify(t('Form Required Error'), 'error');
                                                    return;
                                                }
                                                setMarketLoading(true);
                                                try {
                                                    let imageUrls = [];
                                                    if (selectedFiles.length > 0) {
                                                        const uploadPromises = selectedFiles.map(file => uploadImage(file));
                                                        imageUrls = await Promise.all(uploadPromises);
                                                    }

                                                    const itemToSave = {
                                                        ...newItem,
                                                        image_url: imageUrls.length > 0 ? imageUrls[0] : (editingMarketItem?.image_url || ''),
                                                        gallery: imageUrls.length > 0 ? imageUrls : (editingMarketItem?.gallery || [])
                                                    };

                                                    if (editingMarketItem) {
                                                        await updateMarketplaceItem(editingMarketItem.id, itemToSave);
                                                        notify(t('Item Updated Success'), 'success');
                                                    } else {
                                                        await addMarketplaceItem(itemToSave);
                                                        notify(t('Item Added Success'), 'success');
                                                    }

                                                    setShowAddItem(false);
                                                    setEditingMarketItem(null);
                                                    setNewItem({
                                                        title: '',
                                                        description: '',
                                                        category: 'sale',
                                                        price: '',
                                                        availability: 'Immediate',
                                                        location: 'Port Harcourt, Nigeria',
                                                        tags: ''
                                                    });
                                                    setSelectedFiles([]);
                                                    loadMarketplaceItems();
                                                } catch (err) {
                                                    notify("Error: " + err.message, 'error');
                                                } finally {
                                                    setMarketLoading(false);
                                                }
                                            }}
                                        >
                                            {marketLoading ? t('Sending') : (editingMarketItem ? t('Update Item') : t('Save Item'))}
                                        </button>
                                        <button
                                            style={{ padding: '10px 24px', backgroundColor: '#f8f9fa', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                            onClick={() => { setShowAddItem(false); setEditingMarketItem(null); }}
                                        >
                                            {t('Cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && activeTab === 'marketplace' && (
                                <div style={{ padding: '16px', backgroundColor: '#FFF0F0', color: '#D32F2F', borderRadius: '8px', marginBottom: '20px', border: '1px solid #FFCACA' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <SearchNormal1 size="18" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B82AC' }} />
                                        <input
                                            type="text"
                                            placeholder={t('Search Placeholder')}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                                        />
                                    </div>
                                    {selectedItems.size > 0 && (
                                        <button
                                            onClick={handleMassDelete}
                                            style={{ padding: '10px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                                        >
                                            <Trash size={16} color="currentColor" /> {t('Delete')} ({selectedItems.size})
                                        </button>
                                    )}
                                </div>
                                {marketLoading && <div style={{ padding: '40px', textAlign: 'center' }}>{t('General Message Error')}</div>}

                                {!marketLoading && marketplaceItems.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B82AC' }}>
                                        <Ship size="48" variant="Outline" style={{ marginBottom: '16px', opacity: 0.5 }} />
                                        <p>{t('Marketplace Empty State')}</p>
                                    </div>
                                )}

                                {!marketLoading && marketplaceItems.length > 0 && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                                    <th style={{ padding: '16px 24px', width: '40px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={marketplaceItems.length > 0 && selectedItems.size === marketplaceItems.length}
                                                            onChange={() => toggleSelectAll(marketplaceItems)}
                                                        />
                                                    </th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Title')}</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Category')}</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Price')}</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase', width: '100px' }}>{t('Actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {marketplaceItems
                                                    .filter(item =>
                                                        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((item) => (
                                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee', backgroundColor: selectedItems.has(item.id) ? '#f8fbff' : 'transparent' }}>
                                                            <td style={{ padding: '16px 24px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedItems.has(item.id)}
                                                                    onChange={() => toggleSelectItem(item.id)}
                                                                />
                                                            </td>
                                                            <td data-label="Item" style={{ padding: '16px 24px' }}>
                                                                <div style={{ fontWeight: '600', color: '#0A192F' }}>{item.title}</div>
                                                                <div style={{ fontSize: '12px', color: '#666', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {item.description}
                                                                </div>
                                                            </td>
                                                            <td data-label="Category" style={{ padding: '16px 24px' }}>
                                                                <span style={{
                                                                    padding: '4px 10px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    backgroundColor: '#f0f0f0',
                                                                    color: '#666',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    {item.category && t('Marketplace ' + item.category.charAt(0).toUpperCase() + item.category.slice(1))}
                                                                </span>
                                                            </td>
                                                            <td data-label={t('Price')} style={{ padding: '16px 24px', color: '#0A192F', fontWeight: '600' }}>
                                                                {item.price || t('NA')}
                                                            </td>
                                                            <td data-label="Actions" style={{ padding: '16px 24px' }}>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingMarketItem(item);
                                                                            setNewItem({
                                                                                title: item.title,
                                                                                description: item.description,
                                                                                category: item.category,
                                                                                price: item.price,
                                                                                availability: item.availability,
                                                                                location: item.location,
                                                                                tags: item.tags
                                                                            });
                                                                            setShowAddItem(true);
                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                        }}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B82AC' }}
                                                                    >
                                                                        <Edit size={18} color="currentColor" />
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (window.confirm(t('Delete Confirm'))) {
                                                                                try {
                                                                                    await deleteMarketplaceItem(item.id);
                                                                                    loadMarketplaceItems();
                                                                                    notify(t('Delete Success'), 'success');
                                                                                } catch (e) { notify(e.message, 'error'); }
                                                                            }
                                                                        }}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545' }}
                                                                    >
                                                                        <Trash size={18} color="currentColor" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {
                        activeTab === 'messages' && (
                            <div className="fade-in">
                                <header style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h1 style={{ fontSize: '28px', color: '#0A192F', margin: 0 }}>{t('Messages')}</h1>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <button onClick={loadMessages} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>{t('Refresh List')}</button>
                                    </div>
                                </header>

                                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                    {messagesLoading ? (
                                        <div style={{ padding: '40px', textAlign: 'center' }}>{t('General Error')}</div>
                                    ) : messages.length === 0 ? (
                                        <div style={{ padding: '40px', textAlign: 'center', color: '#6B82AC' }}>{t('No Messages')}</div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                                        <th style={{ padding: '16px 24px', width: '40px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={messages.length > 0 && selectedItems.size === messages.length}
                                                                onChange={() => toggleSelectAll(messages)}
                                                            />
                                                        </th>
                                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('From')}</th>
                                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Subject')}</th>
                                                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Received Date')}</th>
                                                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {messages.map((msg) => (
                                                        <tr key={msg.id} style={{ borderBottom: '1px solid #eee', backgroundColor: selectedItems.has(msg.id) ? '#f8fbff' : 'transparent' }}>
                                                            <td style={{ padding: '16px 24px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedItems.has(msg.id)}
                                                                    onChange={() => toggleSelectItem(msg.id)}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '16px 24px' }}>
                                                                <div style={{ fontWeight: msg.is_read ? '500' : '700', color: '#0A192F' }}>{msg.full_name}</div>
                                                                <div style={{ fontSize: '12px', color: '#666' }}>{msg.email}</div>
                                                            </td>
                                                            <td style={{ padding: '16px 24px' }}>
                                                                <div style={{ fontWeight: '600', color: '#0A192F', maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject || t('No Subject')}</div>
                                                                <div style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.message}</div>
                                                            </td>
                                                            <td style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>{new Date(msg.created_at).toLocaleString()}</td>
                                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                    <button
                                                                        onClick={() => setViewingMessage(msg)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0056b3' }}
                                                                        title={t('View Message')}
                                                                    >
                                                                        <SearchNormal1 size={18} color="currentColor" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleToggleRead(msg)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: msg.is_read ? '#6B82AC' : '#0056b3' }}
                                                                        title={msg.is_read ? t('Mark as Unread') : t('Mark as Read')}
                                                                    >
                                                                        <MessageQuestion size={18} color="currentColor" variant={msg.is_read ? 'Outline' : 'Bold'} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545' }}
                                                                        title={t('Delete')}
                                                                    >
                                                                        <Trash size={18} color="currentColor" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {viewingMessage && (
                                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                                        <div style={{ width: '90%', maxWidth: '760px', background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <h3 style={{ margin: 0 }}>{viewingMessage.subject || t('No Subject')}</h3>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => { setViewingMessage(null); }} style={{ border: 'none', background: '#f8f9fa', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>{t('Close')}</button>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '12px', color: '#6B82AC' }}>{t('From')}: {viewingMessage.full_name} • {viewingMessage.email}</div>
                                            <div style={{ marginBottom: '16px', color: '#666', whiteSpace: 'pre-wrap' }}>{viewingMessage.message}</div>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => { handleToggleRead(viewingMessage); }} style={{ padding: '8px 12px', backgroundColor: '#0056b3', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>{viewingMessage.is_read ? t('Mark as Unread') : t('Mark as Read')}</button>
                                                <button onClick={() => { handleDeleteMessage(viewingMessage.id); setViewingMessage(null); }} style={{ padding: '8px 12px', backgroundColor: '#fff', color: '#dc3545', borderRadius: '8px', border: '1px solid #f0f0f0', cursor: 'pointer' }}>{t('Delete')}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {activeTab === 'faq' && (
                        <div className="fade-in">
                            <header style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1 style={{ fontSize: '28px', color: '#0A192F', margin: 0 }}>{t('FAQ')}</h1>
                                <button
                                        onClick={() => { setShowAddFaq(!showAddFaq); setEditingFaq(null); setNewFaq({ question: '', answer: '' }); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 20px',
                                            backgroundColor: '#0056b3',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <Add size="20" />
                                        {t('Add New FAQ')}
                                    </button>
                                </header>

                                {showAddFaq && (
                                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '32px' }}>
                                        <h3 style={{ marginBottom: '20px', color: '#0A192F' }}>{editingFaq ? t('Update FAQ') : t('Add New FAQ')}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Question')}</label>
                                                <input
                                                    type="text"
                                                    placeholder={t('FAQ_Q1')}
                                                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                                                    value={newFaq.question}
                                                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Answer')}</label>
                                                <textarea
                                                    placeholder={t('FAQ_A1')}
                                                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '120px', fontFamily: 'inherit', fontSize: '14px', resize: 'vertical' }}
                                                    value={newFaq.answer}
                                                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                            <button
                                                style={{ padding: '10px 24px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                                onClick={async () => {
                                                    if (!newFaq.question || !newFaq.answer) {
                                                        notify(t('FAQ Required Error'), 'error');
                                                        return;
                                                    }
                                                    try {
                                                        if (editingFaq) {
                                                            await updateFaq(editingFaq.id, newFaq);
                                                            notify(t('Item Updated Success'), 'success');
                                                        } else {
                                                            await addFaq(newFaq);
                                                            notify(t('Item Added Success'), 'success');
                                                        }
                                                        setShowAddFaq(false);
                                                        setNewFaq({ question: '', answer: '' });
                                                        setEditingFaq(null);
                                                        await loadFaqs();
                                                    } catch (err) {
                                                        notify("Error: " + err.message, 'error');
                                                    }
                                                }}
                                            >
                                                {editingFaq ? t('Update FAQ') : t('Save FAQ')}
                                            </button>
                                            <button
                                                style={{ padding: '10px 24px', backgroundColor: '#f8f9fa', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                                onClick={() => { setShowAddFaq(false); setEditingFaq(null); setNewFaq({ question: '', answer: '' }); }}
                                            >
                                                {t('Cancel')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                    {faqItems.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '48px', color: '#6B82AC' }}>
                                            <p>{t('FAQ Empty State')}</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {faqItems.map((faq) => (
                                                <div key={faq.id} style={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '12px',
                                                    padding: '24px',
                                                    border: '1px solid #eaeaea',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '12px'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                                        <h3 style={{
                                                            fontSize: '16px',
                                                            fontWeight: '700',
                                                            color: '#0A192F',
                                                            margin: 0,
                                                            lineHeight: '1.4'
                                                        }}>
                                                            {t(faq.question)}
                                                        </h3>
                                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingFaq(faq);
                                                                    setNewFaq({ question: faq.question, answer: faq.answer });
                                                                    setShowAddFaq(true);
                                                                }}
                                                                style={{
                                                                    border: 'none',
                                                                    background: '#f0f4f8',
                                                                    borderRadius: '6px',
                                                                    padding: '6px',
                                                                    cursor: 'pointer',
                                                                    color: '#6B82AC',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                title="Edit Question & Answer"
                                                            >
                                                                <Edit size={18} color="currentColor" />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(t('FAQ Delete Confirm'))) {
                                                                        await deleteFaq(faq.id);
                                                                        await loadFaqs();
                                                                    }
                                                                }}
                                                                style={{
                                                                    border: 'none',
                                                                    background: '#fff0f0',
                                                                    borderRadius: '6px',
                                                                    padding: '6px',
                                                                    cursor: 'pointer',
                                                                    color: '#dc3545',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                title="Delete FAQ"
                                                            >
                                                                <Trash size={18} color="currentColor" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#4a5568',
                                                        lineHeight: '1.6',
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {t(faq.answer)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    {activeTab === 'newsletter' && (
                        <div className="fade-in">
                            <header style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1 style={{ fontSize: '28px', color: '#0A192F', margin: 0 }}>{t('Newsletter')}</h1>
                                <button onClick={loadNewsletter} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    {t('Refresh List')}
                                </button>
                            </header>

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                {newsLoading ? (
                                    <div style={{ padding: '64px', textAlign: 'center', color: '#6B82AC' }}>
                                        <div className="spinner"></div>
                                        <p style={{ marginTop: '16px' }}>{t('Loading') || 'Loading Subscriptions...'}</p>
                                    </div>
                                ) : subscriptions.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545', fontWeight: '500' }}>
                                        {t('Newsletter Empty State')}
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Subscriber Email')}</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Joined Date')}</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>{t('Actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subscriptions.map((sub) => (
                                                    <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0A192F' }}>
                                                            {sub.email}
                                                        </td>
                                                        <td style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>
                                                            {new Date(sub.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(t('Remove Subscriber'))) {
                                                                        try {
                                                                            await deleteNewsletterSubscription(sub.id);
                                                                            loadNewsletter();
                                                                            notify(t('Delete Success'), 'success');
                                                                        } catch (e) { notify(e.message, 'error'); }
                                                                    }
                                                                }}
                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545' }}
                                                            >
                                                                <Trash size={18} color="currentColor" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'ads' && (
                        <div className="fade-in">
                            <header style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1 style={{ fontSize: '28px', color: '#0A192F', margin: 0 }}>{t('Upload')}</h1>
                                <button
                                    onClick={() => setShowAddAd(!showAddAd)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        backgroundColor: '#0056b3',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Add size="20" />
                                    {t('Upload Image')}
                                </button>
                            </header>

                            {showAddAd && (
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ marginBottom: '20px', color: '#0A192F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Add size="20" variant="Bold" /> {t('Upload New Ad Image')}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>{t('Select Image')}</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        setSelectedAdFiles(files);
                                                    }}
                                                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: '#fcfcfc' }}
                                                />
                                                <small style={{ color: '#888', fontSize: '12px' }}>Recommend size: 1200x400px</small>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    disabled={selectedAdFiles.length === 0 || adsLoading}
                                                    style={{ 
                                                        padding: '12px 24px', 
                                                        backgroundColor: selectedAdFiles.length === 0 ? '#ccc' : '#0056b3', 
                                                        color: '#fff', 
                                                        border: 'none', 
                                                        borderRadius: '8px', 
                                                        cursor: selectedAdFiles.length === 0 ? 'not-allowed' : 'pointer', 
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={async () => {
                                                        if (selectedAdFiles.length === 0) return;
                                                        setAdsLoading(true);
                                                        try {
                                                            const url = await uploadImage(selectedAdFiles[0]);
                                                            await addAd({ image_url: url });
                                                            notify(t('Ad Added Success'), 'success');
                                                            setShowAddAd(false);
                                                            setSelectedAdFiles([]);
                                                            loadAds();
                                                        } catch (err) {
                                                            notify("Error: " + err.message, 'error');
                                                        } finally {
                                                            setAdsLoading(false);
                                                        }
                                                    }}
                                                >
                                                    {adsLoading ? t('Uploading') : t('Save Ad')}
                                                </button>
                                                <button
                                                    style={{ padding: '12px 24px', backgroundColor: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
                                                    onClick={() => { setShowAddAd(false); setSelectedAdFiles([]); }}
                                                >
                                                    {t('Cancel')}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style={{ border: '2px dashed #eee', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', overflow: 'hidden', minHeight: '180px' }}>
                                            {selectedAdFiles.length > 0 ? (
                                                <img 
                                                    src={URL.createObjectURL(selectedAdFiles[0])} 
                                                    alt="Preview" 
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                                />
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#6B82AC' }}>
                                                    <Export size="32" variant="Outline" strokeWidth="1.5" />
                                                    <p style={{ marginTop: '8px', fontSize: '13px' }}>Image Preview</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="ads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                                {adsLoading && <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '48px', color: '#6B82AC' }}>{t('Loading Ads')}</div>}
                                {!adsLoading && ads.length === 0 && <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '48px', color: '#6B82AC', background: '#f8f9fa', borderRadius: '12px', border: '2px dashed #eee' }}>{t('No Ads found')}</div>}
                                {!adsLoading && ads.map((ad) => (
                                    <div key={ad.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eaeaea', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                        <div style={{ height: '180px', width: '100%', backgroundColor: '#f8f9fa' }}>
                                            <img src={ad.image_url} alt="Ad" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: '#6B82AC' }}>{new Date(ad.created_at).toLocaleDateString()}</span>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(t('Delete Confirm'))) {
                                                        try {
                                                            await deleteAd(ad.id);
                                                            loadAds();
                                                            notify(t('Delete Success'), 'success');
                                                        } catch (e) { notify(e.message, 'error'); }
                                                    }
                                                }}
                                                style={{ backgroundColor: '#fff5f5', color: '#dc3545', border: '1px solid #ffd8d8', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                            >
                                                <Trash size={14} /> {t('Delete')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

            </div >
            <style>{`
    .header-address-text {
    display: none;
}
@media(min-width: 1024px) {
                    .header-address-text {
        display: inline;
    }
}
@media(max-width: 768px) {
                    .dashboard-sidebar {
        transform: translateX(-100%);
    }
                    .dashboard-sidebar.open {
        transform: translateX(0);
    }
                    .mobile-menu-trigger {
        display: block!important;
    }
                    .mobile-header {
        display: flex!important;
    }
                    .dashboard-main {
        padding-top: 20px!important;
    }
                    .admin-user-info {
        display: none;
    }
}
@media(min-width: 769px) {
                    .dashboard-sidebar {
        transform: none!important;
        position: static!important;
        display: flex!important;
    }
                    .mobile-menu-trigger {
        display: none!important;
    }
                    .mobile-header {
        display: none!important;
    }
                    .dashboard-main {
        padding-top: 32px!important;
    }
                    .admin-user-info {
        display: block!important;
    }
}
                 .dashboard-action-btn.btn-text {
    display: inline;
}
@media(max-width: 600px) {
                    .dashboard-action-btn.btn-text {
        display: none;
    }
                    .dashboard-action-btn {
        padding: 10px!important;
    }
}
                .fade-in {
    animation: fadeIn 0.3s ease-in;
                }
@keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
}
`}</style>
        </div >
    );
};

export default AdminDashboard;
