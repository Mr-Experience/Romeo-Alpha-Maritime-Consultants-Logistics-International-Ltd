import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../services/auth';
import { fetchMessages } from '../services/messages';
import { fetchMarketplaceItems, addMarketplaceItem, deleteMarketplaceItem, uploadImage } from '../services/marketplace';
import { getFaqs, addFaq, updateFaq, deleteFaq } from '../services/faq';
import { fetchAds, addAd, deleteAd } from '../services/ads';
import { Element3, Sms, Logout, HambergerMenu, CloseSquare, Ship, Add, Trash, Edit, MessageQuestion, Briefcase, Gallery } from 'iconsax-react';

import '../styles/admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
    // ... (state remains valid)
    const [messages, setMessages] = useState([]);
    const [marketplaceItems, setMarketplaceItems] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [msgLoading, setMsgLoading] = useState(false);
    const [marketLoading, setMarketLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddItem, setShowAddItem] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', description: '', category: 'sale', price: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    // FAQ State
    const [faqItems, setFaqItems] = useState([]);
    const [showAddFaq, setShowAddFaq] = useState(false);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [editingFaq, setEditingFaq] = useState(null);

    // Ads State
    const [ads, setAds] = useState([]);
    const [adsLoading, setAdsLoading] = useState(false);
    const [showAddAd, setShowAddAd] = useState(false);
    const [newAd, setNewAd] = useState({ title: '', link_url: '' });

    // Authentication Check
    useEffect(() => {
        const token = getSession();
        if (!token) {
            navigate('/admin-login');
        }
    }, [navigate]);

    // Fetch data when tab is active
    useEffect(() => {
        if (activeTab === 'messages') {
            loadMessages();
        } else if (activeTab === 'marketplace' || activeTab === 'dashboard') {
            loadMarketplaceItems();
        } else if (activeTab === 'faq') {
            loadFaqs();
        } else if (activeTab === 'proposals') {
            loadProposals();
        } else if (activeTab === 'ads') {
            loadAds();
        }

        // Always load stats for dashboard if we're on dashboard
        if (activeTab === 'dashboard') {
            loadMessages();
        }
    }, [activeTab]);

    const loadFaqs = () => {
        const faqs = getFaqs();
        setFaqItems(faqs);
    };

    const loadProposals = () => {
        const storedProposals = JSON.parse(localStorage.getItem('partnershipProposals') || '[]');
        setProposals(storedProposals);
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
                setError(`Listing Error: ${err.message}`);
            }
        } finally {
            setMarketLoading(false);
        }
    };

    const loadAds = async () => {
        setAdsLoading(true);
        setError(null);
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

    const loadMessages = async () => {
        setMsgLoading(true);
        setError(null);
        try {
            const data = await fetchMessages();
            setMessages(data);
        } catch (err) {
            console.error(err);
            if (err.message.includes('JWT') || err.message.includes('invalid') || err.message.includes('token')) {
                handleLogout();
            } else {
                setError(`Message Error: ${err.message}`);
            }
        } finally {
            setMsgLoading(false);
        }
    };

    const handleLogout = () => {
        clearSession();
        navigate('/admin-login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
            className={`dashboard-sidebar-item ${activeTab === tabId && !isLogout ? 'active' : ''}`}
        >
            <Icon size="20" variant={activeTab === tabId && !isLogout ? "Bold" : "Outline"} />
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
                    <img
                        src="/images/logo-alpha.jpg"
                        alt="Romeo Alpha Logo"
                        style={{ height: '50px', objectFit: 'contain' }}
                    />
                </div>

                {/* Dashboard Address (Hidden on small mobile) */}
                <div className="dashboard-address" style={{ fontSize: '12px', color: '#6B82AC', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px', textAlign: 'center' }}>
                    <span className="header-address-text">
                        Headquarters: Portharcourt, Nigeria
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="admin-user-info" style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: '#0A192F', fontSize: '14px' }}>Admin User</div>
                        <div style={{ fontSize: '11px', color: '#6B82AC' }}>Administrator</div>
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
                        color: '#0056b3'
                    }}>
                        A
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Sidebar */}
                <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div style={{ flex: 1 }}>
                        <SidebarItem icon={Element3} label="Dashboard" tabId="dashboard" />
                        <SidebarItem icon={Ship} label="Marketplace" tabId="marketplace" />
                        <SidebarItem icon={Sms} label="Messages" tabId="messages" />
                        <SidebarItem icon={MessageQuestion} label="FAQ" tabId="faq" />
                        <SidebarItem icon={Gallery} label="Ads Management" tabId="ads" />
                        <SidebarItem icon={Briefcase} label="Partnership Proposals" tabId="proposals" />
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                        <SidebarItem icon={Logout} label="Logout" isLogout={true} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="dashboard-main">

                    {activeTab === 'dashboard' && (
                        <div className="fade-in">


                            <header style={{ marginBottom: '20px' }}>
                                <h1 style={{ fontSize: '28px', color: '#0A192F', marginBottom: '8px' }}>Dashboard Overview</h1>
                                <p style={{ color: '#6B82AC' }}>Here is what's happening today.</p>
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
                                    <span><strong>Error:</strong> {error}</span>
                                    <button onClick={() => { loadMessages(); loadMarketplaceItems(); }} style={{ background: 'none', border: '1px solid #D32F2F', color: '#D32F2F', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Try Refresh</button>
                                </div>
                            )}

                            <div className="dashboard-grid">
                                {/* Summary Card 1 */}
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ color: '#6B82AC', fontSize: '14px', fontWeight: 600 }}>Total Messages</span>
                                        <div style={{ padding: '8px', backgroundColor: '#E6F1FF', borderRadius: '8px' }}>
                                            <Sms size="20" color="#0056b3" variant="Bold" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '32px', margin: 0, color: '#0A192F' }}>{messages.length || '-'}</h3>
                                </div>

                                {/* Summary Card 2: Marketplace items */}
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ color: '#6B82AC', fontSize: '14px', fontWeight: 600 }}>Active Listings</span>
                                        <div style={{ padding: '8px', backgroundColor: '#FFF4E6', borderRadius: '8px' }}>
                                            <Ship size="20" color="#FF8A00" variant="Bold" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '32px', margin: 0, color: '#0A192F' }}>{marketplaceItems.length || '-'}</h3>
                                </div>

                                {/* Summary Card 3: For Sale */}
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span style={{ color: '#6B82AC', fontSize: '14px', fontWeight: 600 }}>Vessels for Sale</span>
                                        <div style={{ padding: '8px', backgroundColor: '#E6FFF1', borderRadius: '8px' }}>
                                            <Add size="20" color="#00B341" variant="Bold" />
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '32px', margin: 0, color: '#0A192F' }}>
                                        {marketplaceItems.filter(item => item.category === 'sale').length || '0'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        /* existing messages view */
                        <div className="fade-in">
                            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h1 style={{ fontSize: '28px', color: '#0A192F', marginBottom: '8px' }}>Messages</h1>
                                    <p style={{ color: '#6B82AC' }}>View and manage incoming inquiries.</p>
                                </div>
                                <button onClick={loadMessages} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    Refresh
                                </button>
                            </header>

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                {msgLoading && <div style={{ padding: '40px', textAlign: 'center' }}>Loading messages...</div>}

                                {!msgLoading && messages.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545', fontWeight: '500' }}>
                                        No messages Currently
                                    </div>
                                )}

                                {!msgLoading && messages.length > 0 && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Sender</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Subject</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Date</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase', width: '100px' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {messages.map((msg) => (
                                                    <tr key={msg.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td data-label="Sender" style={{ padding: '16px 24px' }}>
                                                            <div style={{ fontWeight: '600', color: '#0A192F' }}>{msg.full_name}</div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>{msg.email}</div>
                                                        </td>
                                                        <td data-label="Subject" style={{ padding: '16px 24px', maxWidth: '300px' }}>
                                                            <div style={{ fontWeight: '500', color: '#333', marginBottom: '4px' }}>{msg.subject}</div>
                                                            <div style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {msg.message}
                                                            </div>
                                                        </td>
                                                        <td data-label="Date" style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>
                                                            {new Date(msg.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td data-label="Status" style={{ padding: '16px 24px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '11px',
                                                                fontWeight: '700',
                                                                backgroundColor: msg.is_read ? '#f0f0f0' : '#e6f1ff',
                                                                color: msg.is_read ? '#888' : '#0056b3'
                                                            }}>
                                                                {msg.is_read ? 'READ' : 'NEW'}
                                                            </span>
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
                            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h1 style={{ fontSize: '28px', color: '#0A192F', marginBottom: '8px' }}>Ads Management</h1>
                                    <p style={{ color: '#6B82AC' }}>Manage promotional images and advertisements.</p>
                                </div>
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
                                    Add New Ad
                                </button>
                            </header>

                            {showAddAd && (
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '32px' }}>
                                    <h3 style={{ marginBottom: '20px', color: '#0A192F' }}>Add Promotional Ad</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Special Logistics Offer"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newAd.title}
                                                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Link (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. /contact or https://..."
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newAd.link_url}
                                                onChange={(e) => setNewAd({ ...newAd, link_url: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Upload Ad Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                        <button
                                            style={{ padding: '10px 24px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                            onClick={async () => {
                                                if (!newAd.title || !selectedFile) {
                                                    alert("Title and Image are required");
                                                    return;
                                                }
                                                setAdsLoading(true);
                                                try {
                                                    const image_url = await uploadImage(selectedFile);
                                                    await addAd({ ...newAd, image_url });
                                                    setShowAddAd(false);
                                                    setNewAd({ title: '', link_url: '' });
                                                    setSelectedFile(null);
                                                    loadAds();
                                                    alert("Ad added successfully!");
                                                } catch (err) {
                                                    alert("Error: " + err.message);
                                                } finally {
                                                    setAdsLoading(false);
                                                }
                                            }}
                                        >
                                            {adsLoading ? 'Saving...' : 'Save Ad'}
                                        </button>
                                        <button
                                            style={{ padding: '10px 24px', backgroundColor: '#f8f9fa', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                            onClick={() => setShowAddAd(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                {adsLoading && <div style={{ padding: '40px', textAlign: 'center' }}>Loading ads...</div>}

                                {!adsLoading && ads.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B82AC' }}>
                                        <Gallery size="48" variant="Outline" style={{ marginBottom: '16px', opacity: 0.5 }} />
                                        <p>No ads found. Add one to get started.</p>
                                    </div>
                                )}

                                {!adsLoading && ads.length > 0 && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Preview</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Title</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Link</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase', width: '100px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ads.map((ad) => (
                                                    <tr key={ad.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td data-label="Preview" style={{ padding: '16px 24px' }}>
                                                            <img src={ad.image_url} alt={ad.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                        </td>
                                                        <td data-label="Title" style={{ padding: '16px 24px' }}>
                                                            <div style={{ fontWeight: '600', color: '#0A192F' }}>{ad.title}</div>
                                                        </td>
                                                        <td data-label="Link" style={{ padding: '16px 24px', color: '#6B82AC' }}>
                                                            {ad.link_url || 'None'}
                                                        </td>
                                                        <td data-label="Actions" style={{ padding: '16px 24px' }}>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm("Are you sure you want to delete this ad?")) {
                                                                        try {
                                                                            await deleteAd(ad.id);
                                                                            loadAds();
                                                                        } catch (e) { alert(e.message); }
                                                                    }
                                                                }}
                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545' }}
                                                            >
                                                                <Trash size="18" />
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

                    {activeTab === 'proposals' && (
                        <div className="fade-in">
                            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h1 style={{ fontSize: '28px', color: '#0A192F', marginBottom: '8px' }}>Partnership Proposals</h1>
                                    <p style={{ color: '#6B82AC' }}>Manage partnership inquiries and collaborations.</p>
                                </div>
                                <button onClick={loadProposals} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                                    Refresh
                                </button>
                            </header>

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                {proposals.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B82AC' }}>
                                        <Briefcase size="48" variant="Outline" style={{ marginBottom: '16px', opacity: 0.5 }} />
                                        <p>No partnership proposals received yet.</p>
                                    </div>
                                )}

                                {proposals.length > 0 && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Company / Contact</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Interest</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Message</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {proposals.map((prop) => (
                                                    <tr key={prop.id} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td data-label="Company / Contact" style={{ padding: '16px 24px' }}>
                                                            <div style={{ fontWeight: '600', color: '#0A192F' }}>{prop.companyName}</div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>{prop.representativeName}</div>
                                                            <div style={{ fontSize: '12px', color: '#888' }}>{prop.email}</div>
                                                        </td>
                                                        <td data-label="Interest" style={{ padding: '16px 24px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '11px',
                                                                fontWeight: '700',
                                                                backgroundColor: '#E6F1FF',
                                                                color: '#0056b3',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {prop.serviceInterest}
                                                            </span>
                                                        </td>
                                                        <td data-label="Message" style={{ padding: '16px 24px', maxWidth: '300px' }}>
                                                            <div style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {prop.message}
                                                            </div>
                                                        </td>
                                                        <td data-label="Date" style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>
                                                            {new Date(prop.date).toLocaleDateString()}
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

                    {activeTab === 'marketplace' && (
                        <div className="fade-in">
                            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h1 style={{ fontSize: '28px', color: '#0A192F', marginBottom: '8px' }}>Marine Marketplace</h1>
                                    <p style={{ color: '#6B82AC' }}>Manage vessels for sale, hire, repair and scraps.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddItem(!showAddItem)}
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
                                    Add New Item
                                </button>
                            </header>

                            {showAddItem && (
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '32px' }}>
                                    <h3 style={{ marginBottom: '20px', color: '#0A192F' }}>Add Marketplace Item</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 50m AHTS Vessel"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.title}
                                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Category</label>
                                            <select
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            >
                                                <option value="sale">For Sale</option>
                                                <option value="hire">For Hire</option>
                                                <option value="repair">Repair Service</option>
                                                <option value="scrap">Scrap / Scrapping</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Price / Budget (₦)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. ₦1,200,000 or Contact for Price"
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                value={newItem.price}
                                                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Upload Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Description</label>
                                            <textarea
                                                placeholder="Details about the vessel or service..."
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
                                                    alert("Title and Description are required");
                                                    return;
                                                }
                                                setMarketLoading(true);
                                                try {
                                                    let image_url = '';
                                                    if (selectedFile) {
                                                        image_url = await uploadImage(selectedFile);
                                                    }

                                                    await addMarketplaceItem({ ...newItem, image_url });
                                                    setShowAddItem(false);
                                                    setNewItem({ title: '', description: '', category: 'sale', price: '' });
                                                    setSelectedFile(null);
                                                    loadMarketplaceItems();
                                                    alert("Item added successfully!");
                                                } catch (err) {
                                                    alert("Error: " + err.message);
                                                } finally {
                                                    setMarketLoading(false);
                                                }
                                            }}
                                        >
                                            {marketLoading ? 'Saving...' : 'Save Item'}
                                        </button>
                                        <button
                                            style={{ padding: '10px 24px', backgroundColor: '#f8f9fa', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                            onClick={() => setShowAddItem(false)}
                                        >
                                            Cancel
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
                                {marketLoading && <div style={{ padding: '40px', textAlign: 'center' }}>Loading items...</div>}

                                {!marketLoading && marketplaceItems.length === 0 && (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B82AC' }}>
                                        <Ship size="48" variant="Outline" style={{ marginBottom: '16px', opacity: 0.5 }} />
                                        <p>Marketplace items will appear here once you start adding them.</p>
                                        <p style={{ fontSize: '13px', marginTop: '8px' }}>Make sure to run the `supabase_marketplace_table.sql` in your Supabase dashboard.</p>
                                    </div>
                                )}

                                {!marketLoading && marketplaceItems.length > 0 && (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Item</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Category</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase' }}>Price</th>
                                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#6B82AC', textTransform: 'uppercase', width: '100px' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {marketplaceItems.map((item) => (
                                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
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
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td data-label="Price" style={{ padding: '16px 24px', color: '#0A192F', fontWeight: '600' }}>
                                                            {item.price || 'N/A'}
                                                        </td>
                                                        <td data-label="Actions" style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button onClick={() => alert("Edit functionality coming soon")} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B82AC' }}>
                                                                    <Edit size="18" />
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (confirm("Are you sure you want to delete this item?")) {
                                                                            try {
                                                                                await deleteMarketplaceItem(item.id);
                                                                                loadMarketplaceItems();
                                                                            } catch (e) { alert(e.message); }
                                                                        }
                                                                    }}
                                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545' }}
                                                                >
                                                                    <Trash size="18" />
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

                    {activeTab === 'faq' && (
                        <div className="fade-in">
                            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h1 style={{ fontSize: '28px', color: '#0A192F', marginBottom: '8px' }}>FAQ Management</h1>
                                    <p style={{ color: '#6B82AC' }}>Create and manage frequently asked questions.</p>
                                </div>
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
                                    Add New FAQ
                                </button>
                            </header>

                            {showAddFaq && (
                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea', marginBottom: '32px' }}>
                                    <h3 style={{ marginBottom: '20px', color: '#0A192F' }}>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Question</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. What services do you offer?"
                                                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                                                value={newFaq.question}
                                                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#6B82AC' }}>Answer</label>
                                            <textarea
                                                placeholder="Provide a detailed answer to the question..."
                                                style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '120px', fontFamily: 'inherit', fontSize: '14px', resize: 'vertical' }}
                                                value={newFaq.answer}
                                                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                        <button
                                            style={{ padding: '10px 24px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                            onClick={() => {
                                                if (!newFaq.question || !newFaq.answer) {
                                                    alert('Question and Answer are required');
                                                    return;
                                                }
                                                if (editingFaq) {
                                                    updateFaq(editingFaq.id, newFaq);
                                                } else {
                                                    addFaq(newFaq);
                                                }
                                                setShowAddFaq(false);
                                                setNewFaq({ question: '', answer: '' });
                                                setEditingFaq(null);
                                                loadFaqs();
                                            }}
                                        >
                                            {editingFaq ? 'Update FAQ' : 'Save FAQ'}
                                        </button>
                                        <button
                                            style={{ padding: '10px 24px', backgroundColor: '#f8f9fa', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
                                            onClick={() => { setShowAddFaq(false); setEditingFaq(null); setNewFaq({ question: '', answer: '' }); }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                                {faqItems.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px', color: '#6B82AC' }}>
                                        <p>No FAQs found. Add one to get started.</p>
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
                                                        {faq.question}
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
                                                            <Edit size="18" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this FAQ?')) {
                                                                    deleteFaq(faq.id);
                                                                    loadFaqs();
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
                                                            <Trash size="18" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    color: '#4a5568',
                                                    lineHeight: '1.6',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {faq.answer}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div> {/* Close flex wrapper */}

            {/* Inline Styles for Responsive Helpers (would ideally be in CSS file) */}
            <style>{`
                .header-address-text {
                    display: none;
                }
                @media (min-width: 1024px) {
                    .header-address-text {
                        display: inline;
                    }
                }
                @media (max-width: 768px) {
                    .dashboard-sidebar {
                        transform: translateX(-100%);
                    }
                    .dashboard-sidebar.open {
                        transform: translateX(0);
                    }
                    .mobile-menu-trigger {
                        display: block !important;
                    }
                    .mobile-header {
                        display: flex !important;
                    }
                    .dashboard-main {
                        padding-top: 20px !important;
                    }
                    .admin-user-info {
                        display: none;
                    }
                }
                @media (min-width: 769px) {
                    .dashboard-sidebar {
                        transform: none !important;
                        position: static !important;
                        display: flex !important;
                    }
                    .mobile-menu-trigger {
                        display: none !important;
                    }
                    .mobile-header {
                        display: none !important;
                    }
                    .dashboard-main {
                        padding-top: 32px !important;
                    }
                    .admin-user-info {
                        display: block !important;
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
        </div>
    );
};

export default AdminDashboard;
