import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaMusic, FaPlus, FaEdit, FaTrash, FaTimes, FaSearch } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/HymnManagement.css';

const CATEGORIES = ['Praise', 'Worship', 'Offertory', 'Communion', 'Opening', 'Closing', 'Other'];
const LANGUAGES = ['Amharic', 'English', 'Oromiffa', 'Tigrinya', 'Other'];

const CATEGORY_KEYS = {
    Praise: 'hymns.categories.praise',
    Worship: 'hymns.categories.worship',
    Offertory: 'hymns.categories.offertory',
    Communion: 'hymns.categories.communion',
    Opening: 'hymns.categories.opening',
    Closing: 'hymns.categories.closing',
    Other: 'hymns.categories.other',
};

const emptyForm = { title: '', lyrics: '', category: '', author: '', language: 'Amharic' };

const HymnManagement = () => {
    const { t } = useTranslation();
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
            setMessage({ type: 'error', text: t('hymns.loadError') });
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
            setMessage({ type: 'warning', text: t('hymns.titleRequired') });
            return;
        }
        setSaving(true);
        try {
            if (editingHymn) {
                await api.put(`/hymns/${editingHymn.id}`, form, config);
                setMessage({ type: 'success', text: t('hymns.updateSuccess') });
            } else {
                await api.post('/hymns', form, config);
                setMessage({ type: 'success', text: t('hymns.saveSuccess') });
            }
            closeModal();
            fetchHymns();
        } catch (err) {
            setMessage({ type: 'error', text: err?.response?.data?.message || t('hymns.saveError') });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('hymns.deleteConfirm'))) return;
        try {
            await api.delete(`/hymns/${id}`, config);
            setMessage({ type: 'success', text: t('hymns.deleteSuccess') });
            if (viewHymn?.id === id) setViewHymn(null);
            fetchHymns();
        } catch (err) {
            setMessage({ type: 'error', text: t('hymns.deleteError') });
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
                    <h2><FaMusic style={{ marginRight: '0.5rem' }} />{t('hymns.title')}</h2>
                    <p>{t('hymns.subtitle')}</p>
                </div>
                <button className="hymn-add-btn" onClick={openAdd}>
                    <FaPlus /> {t('hymns.addBtn')}
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
                        placeholder={t('hymns.searchPlaceholder')}
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
                    <option value="">{t('hymns.allCategories')}</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{t(CATEGORY_KEYS[c])}</option>)}
                </select>
            </div>

            {/* Main content: list + detail */}
            <div className="hymn-layout">
                {/* List */}
                <div className="hymn-list-panel">
                    {loading ? (
                        <div className="hymn-loading">{t('gradeReport.loading')}</div>
                    ) : filtered.length === 0 ? (
                        <div className="hymn-empty">
                            <FaMusic size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>{hymns.length === 0 ? t('hymns.noHymns') : t('hymns.noMatch')}</p>
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
                                    <button className="hymn-icon-btn edit" onClick={() => openEdit(hymn)}><FaEdit /></button>
                                    <button className="hymn-icon-btn delete" onClick={() => handleDelete(hymn.id)}><FaTrash /></button>
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
                                {viewHymn.author && <p className="hymn-detail-author">{viewHymn.author}</p>}
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
                                : <p style={{ color: 'var(--muted-text)', fontStyle: 'italic' }}>{t('hymns.noLyrics')}</p>
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
                            <h3>{editingHymn ? t('hymns.editTitle') : t('hymns.addTitle')}</h3>
                            <button className="hymn-icon-btn" onClick={closeModal}><FaTimes /></button>
                        </div>

                        <div className="hymn-modal-body">
                            <div className="hymn-field">
                                <label>{t('hymns.titleField')} *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder={t('hymns.titleField')}
                                    className="hymn-input"
                                />
                            </div>

                            <div className="hymn-field-row">
                                <div className="hymn-field">
                                    <label>{t('hymns.category')}</label>
                                    <select className="hymn-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="">{t('hymns.allCategories')}</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{t(CATEGORY_KEYS[c])}</option>)}
                                    </select>
                                </div>
                                <div className="hymn-field">
                                    <label>{t('hymns.language')}</label>
                                    <select className="hymn-input" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="hymn-field">
                                <label>{t('hymns.author')}</label>
                                <input
                                    type="text"
                                    value={form.author}
                                    onChange={e => setForm({ ...form, author: e.target.value })}
                                    placeholder={t('hymns.author')}
                                    className="hymn-input"
                                />
                            </div>

                            <div className="hymn-field">
                                <label>{t('hymns.lyrics')}</label>
                                <textarea
                                    value={form.lyrics}
                                    onChange={e => setForm({ ...form, lyrics: e.target.value })}
                                    placeholder={t('hymns.lyrics') + '...'}
                                    className="hymn-textarea"
                                    rows={10}
                                />
                            </div>
                        </div>

                        <div className="hymn-modal-footer">
                            <button className="hymn-cancel-btn" onClick={closeModal}>{t('hymns.cancel')}</button>
                            <button className="hymn-save-btn" onClick={handleSave} disabled={saving}>
                                {saving ? t('gradeReport.loading') : editingHymn ? t('hymns.update') : t('hymns.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HymnManagement;
