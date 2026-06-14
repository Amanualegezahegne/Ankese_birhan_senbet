import { useState, useEffect } from 'react';
import { FaMusic, FaSearch, FaTimes, FaTag, FaUser, FaLanguage } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/Mezmur.css';

const CATEGORIES = ['Praise', 'Worship', 'Offertory', 'Communion', 'Opening', 'Closing', 'Other'];

const Mezmur = () => {
    const [hymns, setHymns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selected, setSelected] = useState(null);

    const token = localStorage.getItem('studentToken');

    useEffect(() => {
        const fetchHymns = async () => {
            try {
                const res = await api.get('/hymns', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) setHymns(res.data.data);
            } catch (err) {
                setError('Failed to load hymns. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchHymns();
    }, []);

    // Client-side filtering
    const filtered = hymns.filter(h => {
        const matchSearch = !search ||
            h.title.toLowerCase().includes(search.toLowerCase()) ||
            (h.author || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = !categoryFilter || h.category === categoryFilter;
        return matchSearch && matchCat;
    });

    return (
        <div className="mezmur-page">
            {/* Header */}
            <div className="mezmur-header">
                <div>
                    <h2><FaMusic style={{ marginRight: '0.5rem' }} />መዝሙሮች (Hymns)</h2>
                    <p>የጉባኤያችንን መዝሙሮች ዝርዝር ይዩ — Browse our congregation's hymn list</p>
                </div>
            </div>

            {/* Search & filter bar */}
            <div className="mezmur-filters">
                <div className="mezmur-search-wrap">
                    <FaSearch className="mezmur-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="mezmur-search-input"
                    />
                    {search && (
                        <button className="mezmur-clear-btn" onClick={() => setSearch('')}>
                            <FaTimes />
                        </button>
                    )}
                </div>
                <select
                    className="mezmur-filter-select"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {error && <div className="mezmur-error">{error}</div>}

            {loading ? (
                <div className="mezmur-loading">
                    <FaMusic size={32} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                    <p>Loading hymns...</p>
                </div>
            ) : (
                <div className="mezmur-layout">
                    {/* Hymn list */}
                    <div className="mezmur-list">
                        {filtered.length === 0 ? (
                            <div className="mezmur-empty">
                                <FaMusic size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <p>{hymns.length === 0 ? 'No hymns have been added yet.' : 'No hymns match your search.'}</p>
                            </div>
                        ) : (
                            filtered.map(hymn => (
                                <div
                                    key={hymn.id}
                                    className={`mezmur-card ${selected?.id === hymn.id ? 'active' : ''}`}
                                    onClick={() => setSelected(selected?.id === hymn.id ? null : hymn)}
                                >
                                    <div className="mezmur-card-top">
                                        <span className="mezmur-card-title">{hymn.title}</span>
                                        {hymn.category && (
                                            <span className="mezmur-badge">{hymn.category}</span>
                                        )}
                                    </div>
                                    {(hymn.author || hymn.language) && (
                                        <div className="mezmur-card-meta">
                                            {hymn.author && (
                                                <span className="mezmur-meta-item">
                                                    <FaUser size={10} /> {hymn.author}
                                                </span>
                                            )}
                                            {hymn.language && (
                                                <span className="mezmur-meta-item">
                                                    <FaLanguage size={10} /> {hymn.language}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Detail view */}
                    {selected && (
                        <div className="mezmur-detail">
                            <div className="mezmur-detail-header">
                                <div>
                                    <h3>{selected.title}</h3>
                                    {selected.author && (
                                        <p className="mezmur-detail-author"><FaUser size={12} /> {selected.author}</p>
                                    )}
                                </div>
                                <button className="mezmur-close-btn" onClick={() => setSelected(null)}>
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="mezmur-detail-badges">
                                {selected.category && (
                                    <span className="mezmur-badge">
                                        <FaTag size={10} /> {selected.category}
                                    </span>
                                )}
                                {selected.language && (
                                    <span className="mezmur-badge lang">
                                        <FaLanguage size={10} /> {selected.language}
                                    </span>
                                )}
                            </div>

                            <div className="mezmur-lyrics">
                                {selected.lyrics
                                    ? selected.lyrics.split('\n').map((line, i) => (
                                        <p key={i} style={{ margin: '0.2rem 0' }}>{line || <br />}</p>
                                    ))
                                    : <p className="mezmur-no-lyrics">ምንም ግጥም አልተጨመረም — No lyrics added yet.</p>
                                }
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Mezmur;
