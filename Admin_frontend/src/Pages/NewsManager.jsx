import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaNewspaper } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/NewsManager.css';

const NewsManager = () => {
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const fetchNews = async () => {
        try {
            const response = await api.get('/news');
            if (response.data.success) {
                setNews(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // Pagination logic
    const totalPages = Math.ceil(news.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentNews = news.slice(startIndex, startIndex + itemsPerPage);

    const handleEdit = (item) => {
        navigate('/news/post', { state: { editItem: item } });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this news item?')) return;

        const token = sessionStorage.getItem('adminToken');
        try {
            await api.delete(`/news/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'News deleted!' });
            fetchNews();
        } catch (error) {
            setStatus({ type: 'error', message: 'Delete failed' });
        }
    };

    return (
        <div className="news-management-page fade-in">
            <div className="news-header-container">
                <div>
                    <h1>News Management</h1>
                    <p className="subtitle">Manage information, news, and announcements</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => navigate('/news/post')}
                >
                    <FaPlus /> Post News
                </button>
            </div>

            {status.message && <div className={`alert ${status.type}`}>{status.message}</div>}

            <div className="premium-card list-card" style={{ marginTop: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center' }}>
                    <FaNewspaper style={{ marginRight: '10px', color: '#ffd700' }}/> Current Information
                </h2>
                {loading ? <p style={{ color: '#ffd700', textAlign: 'center', margin: '2rem 0' }}>Loading...</p> : (
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentNews.map(item => (
                                    <tr key={item._id}>
                                        <td className="news-title-cell">{item.title.en}</td>
                                        <td><span className={`tag ${item.category.toLowerCase()}`}>{item.category}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleEdit(item)} className="icon-btn edit">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="icon-btn delete">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {currentNews.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>No news found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {!loading && totalPages > 1 && (
                    <div className="pagination-container premium-pagination">
                        <button 
                            className="btn-cancel" 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </button>
                        <span>
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <button 
                            className="btn-cancel" 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default NewsManager;
