import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/NewsManager.css';

const NewsManager = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNewsId, setCurrentNewsId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [formData, setFormData] = useState({
        titleEn: '',
        titleAm: '',
        contentEn: '',
        contentAm: '',
        category: 'church',
        imageUrl: ''
    });

    const fetchNews = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/news');
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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            titleEn: '',
            titleAm: '',
            contentEn: '',
            contentAm: '',
            category: 'church',
            imageUrl: ''
        });
        setIsEditing(false);
        setCurrentNewsId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('adminToken'); // Admins use 'adminToken'

        const payload = {
            title: { en: formData.titleEn, am: formData.titleAm },
            content: { en: formData.contentEn, am: formData.contentAm },
            category: formData.category,
            imageUrl: formData.imageUrl
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/news/${currentNewsId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatus({ type: 'success', message: 'News updated successfully!' });
            } else {
                await axios.post('http://localhost:5000/api/news', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStatus({ type: 'success', message: 'News created successfully!' });
            }
            fetchNews();
            resetForm();
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Error saving news' });
        }
    };

    const handleEdit = (item) => {
        setFormData({
            titleEn: item.title.en,
            titleAm: item.title.am,
            contentEn: item.content.en,
            contentAm: item.content.am,
            category: item.category,
            imageUrl: item.imageUrl || ''
        });
        setIsEditing(true);
        setCurrentNewsId(item._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this news item?')) return;

        const token = sessionStorage.getItem('adminToken');
        try {
            await axios.delete(`http://localhost:5000/api/news/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'News deleted!' });
            fetchNews();
        } catch (error) {
            setStatus({ type: 'error', message: 'Delete failed' });
        }
    };

    return (
        <div className="news-manager">
            <div className="header-section">
                <h1>News Management</h1>
                {status.message && <div className={`alert ${status.type}`}>{status.message}</div>}
            </div>

            <div className="manager-content">
                <form onSubmit={handleSubmit} className="news-form-card">
                    <h2>{isEditing ? 'Edit Information' : 'Post New Information'}</h2>
                    <div className="input-grid">
                        <div className="field">
                            <label>Title (EN)</label>
                            <input type="text" name="titleEn" value={formData.titleEn} onChange={handleInputChange} required />
                        </div>
                        <div className="field">
                            <label>Title (AM)</label>
                            <input type="text" name="titleAm" value={formData.titleAm} onChange={handleInputChange} required />
                        </div>
                        <div className="field full">
                            <label>Content (EN)</label>
                            <textarea name="contentEn" value={formData.contentEn} onChange={handleInputChange} required />
                        </div>
                        <div className="field full">
                            <label>Content (AM)</label>
                            <textarea name="contentAm" value={formData.contentAm} onChange={handleInputChange} required />
                        </div>
                        <div className="field">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange}>
                                <option value="church">Church</option>
                                <option value="school">School</option>
                                <option value="holiday">Holiday</option>
                                <option value="service">Service</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Image URL</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="actions">
                        <button type="submit" className="save-btn">{isEditing ? 'Update' : 'Post'}</button>
                        {isEditing && <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>}
                    </div>
                </form>

                <div className="news-list-card">
                    <h2>Current Information</h2>
                    {loading ? <p>Loading...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map(item => (
                                    <tr key={item._id}>
                                        <td>{item.title.en}</td>
                                        <td><span className={`tag ${item.category}`}>{item.category}</span></td>
                                        <td>
                                            <button onClick={() => handleEdit(item)} className="edit-link">Edit</button>
                                            <button onClick={() => handleDelete(item._id)} className="delete-link">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsManager;
