import { useState, useEffect } from 'react';
import { FaMusic, FaPlus, FaEdit, FaTrash, FaTimes, FaSearch } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/HymnManagement.css';

const CATEGORIES = ['Praise', 'Worship', 'Offertory', 'Communion', 'Opening', 'Closing', 'Other'];
const LANGUAGES = ['Amharic', 'English', 'Oromiffa', 'Tigrinya', 'Other'];

const emptyForm = { title: '', lyrics: '', category: '', author: '', language: 'Amharic' };

const HymnManagement = () => {
    const [hymns, setHymns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHymn, setEditingHymn] = useState(null); // null = add, object = edit
    const [form, setForm] = useState(emptyForm);

    // Detail view
    const [viewHymn, setViewHymn] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const token = localStorage.getItem('studentToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchHymns();
    }, []);

    useEffect(() => {
        if (message.text) {
            const t = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(t);
        }
    }, [message.text]);

    const fetchHymns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/hymns', config);
            if (res.data.success) setHymns(res.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load hymns.' });
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditingHymn(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (hymn) => {
        setEditingHymn(hymn);
        setForm({
            title: hymn.title || '',
            lyrics: hymn.lyrics || '',
            category: hymn.category || '',
            author: hymn.author || '',
            language: hymn.language || 'Amharic',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingHymn(null);
        setForm(emptyForm);
    };

    const handleSave = async () => {
        if (!form.title.trim()) {
            setMessage({ type: 'warning', text: 'Title is required.' });
            return;
        }
        setSaving(true);
        try {
            if (editingHymn) {
                await api.put(`/hymns/${editingHymn.id}`, form, config);
                setMessage({ type: 'success', text: 'Hymn updated successfully!' });
            } else {
                await api.post('/hymns', form, config);
                setMessage({ type: 'success', text: 'Hymn added successfully!' });
            }
            closeModal();
            fetchHymns();
        } catch (err) {
            setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to save hymn.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this hymn? This cannot be undone.')) return;
        try {
            await api.delete(`/hymns/${id}`, config);
            setMessage({ type: 'success', text: 'Hymn deleted.' });
            if (viewHymn?.id === id) setViewHymn(null);
            fetchHymns();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete hymn.' });
        }
    };

    // Client-side filtering
    const filtered = hymns.filter(h => {
        const matchSearch = !search || h.title.toLowerCase().includes(search.toLowerCase()) || (h.author || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = !categoryFilter || h.category === categoryFilter;
        return matchSearch && matchCat;
    });

    return (
        <div className="hymn-page">
            {/* Header */}
            <div className="hymn-header">
                <div>
                    <h2><FaMusic style={{ marginRight: '0.5rem' }} />Hymn / Song Management</h2>
                    <p>Add, edit, and manage the congregation's song list</p>
                </div>
                <button className="hymn-add-btn" onClick={openAdd}>
                    <FaPlus /> Add Hymn
                </button>
            </div>

            {/* Alert */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Filters */}
            <div className="hymn-filters">
                <div className="hymn-search-wrap">
                    <FaSearch className="hymn-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="hymn-search-input"
                    />
                    {search && (
                        <button className="hymn-clear-btn" onClick={() => setSearch('')}><FaTimes /></button>
                    )}
                </div>
                <select
                    className="hymn-filter-select"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Main content: list + detail */}
            <div className="hymn-layout">
                {/* List */}
                <div className="hymn-list-panel">
                    {loading ? (
                        <div className="hymn-loading">Loading hymns...</div>
                    ) : filtered.length === 0 ? (
                        <div className="hymn-empty">
                            <FaMusic size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>{hymns.length === 0 ? 'No hymns yet. Click "Add Hymn" to get started.' : 'No hymns match your search.'}</p>
                        </div>
                    ) : (
                        filtered.map(hymn => (
                            <div
                                key={hymn.id}
                                className={`hymn-card ${viewHymn?.id === hymn.id ? 'active' : ''}`}
                                onClick={() => setViewHymn(hymn)}
                            >
                                <div className="hymn-card-main">
                                    <strong className="hymn-card-title">{hymn.title}</strong>
                                    {hymn.author && <span className="hymn-card-author">{hymn.author}</span>}
                                </div>
                                <div className="hymn-card-meta">
                                    {hymn.category && <span className="hymn-badge">{hymn.category}</span>}
                                    {hymn.language && <span className="hymn-badge lang">{hymn.language}</span>}
                                </div>
                                <div className="hymn-card-actions" onClick={e => e.stopPropagation()}>
                                    <button className="hymn-icon-btn edit" onClick={() => openEdit(hymn)} title="Edit"><FaEdit /></button>
                                    <button className="hymn-icon-btn delete" onClick={() => handleDelete(hymn.id)} title="Delete"><FaTrash /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail panel */}
                {viewHymn && (
                    <div className="hymn-detail-panel">
                        <div className="hymn-detail-header">
                            <div>
                                <h3>{viewHymn.title}</h3>
                                {viewHymn.author && <p className="hymn-detail-author">by {viewHymn.author}</p>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="hymn-icon-btn edit" onClick={() => openEdit(viewHymn)}><FaEdit /></button>
                                <button className="hymn-icon-btn delete" onClick={() => handleDelete(viewHymn.id)}><FaTrash /></button>
                                <button className="hymn-icon-btn" onClick={() => setViewHymn(null)}><FaTimes /></button>
                            </div>
                        </div>
                        <div className="hymn-detail-badges">
                            {viewHymn.category && <span className="hymn-badge">{viewHymn.category}</span>}
                            {viewHymn.language && <span className="hymn-badge lang">{viewHymn.language}</span>}
                        </div>
                        <div className="hymn-lyrics">
                            {viewHymn.lyrics
                                ? viewHymn.lyrics.split('\n').map((line, i) => (
                                    <p key={i} style={{ margin: '0.2rem 0' }}>{line || <br />}</p>
                                ))
                                : <p style={{ color: 'var(--muted-text)', fontStyle: 'italic' }}>No lyrics added.</p>
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="hymn-modal-overlay" onClick={closeModal}>
                    <div className="hymn-modal" onClick={e => e.stopPropagation()}>
                        <div className="hymn-modal-header">
                            <h3>{editingHymn ? 'Edit Hymn' : 'Add New Hymn'}</h3>
                            <button className="hymn-icon-btn" onClick={closeModal}><FaTimes /></button>
                        </div>

                        <div className="hymn-modal-body">
                            <div className="hymn-field">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Hymn title"
                                    className="hymn-input"
                                />
                            </div>

                            <div className="hymn-field-row">
                                <div className="hymn-field">
                                    <label>Category</label>
                                    <select className="hymn-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="hymn-field">
                                    <label>Language</label>
                                    <select className="hymn-input" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="hymn-field">
                                <label>Author / Composer</label>
                                <input
                                    type="text"
                                    value={form.author}
                                    onChange={e => setForm({ ...form, author: e.target.value })}
                                    placeholder="Author or composer name"
                                    className="hymn-input"
                                />
                            </div>

                            <div className="hymn-field">
                                <label>Lyrics</label>
                                <textarea
                                    value={form.lyrics}
                                    onChange={e => setForm({ ...form, lyrics: e.target.value })}
                                    placeholder="Enter lyrics here..."
                                    className="hymn-textarea"
                                    rows={10}
                                />
                            </div>
                        </div>

                        <div className="hymn-modal-footer">
                            <button className="hymn-cancel-btn" onClick={closeModal}>Cancel</button>
                            <button className="hymn-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : editingHymn ? 'Update' : 'Add Hymn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HymnManagement;
