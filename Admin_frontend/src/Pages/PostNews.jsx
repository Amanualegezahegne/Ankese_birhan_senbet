import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTimes, FaSave } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/NewsManager.css'; // Reuse the styling

const PostNews = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editItem = location.state?.editItem;

    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentNewsId, setCurrentNewsId] = useState(null);

    const [formData, setFormData] = useState({
        titleEn: '',
        titleAm: '',
        contentEn: '',
        contentAm: '',
        category: 'Church',
        imageUrl: ''
    });

    useEffect(() => {
        if (editItem) {
            setFormData({
                titleEn: editItem.title.en,
                titleAm: editItem.title.am,
                contentEn: editItem.content.en,
                contentAm: editItem.content.am,
                category: editItem.category,
                imageUrl: editItem.imageUrl || ''
            });
            setIsEditing(true);
            setCurrentNewsId(editItem._id);
            setImagePreview(editItem.imageUrl ? (editItem.imageUrl.startsWith('http') ? editItem.imageUrl : `${new URL(api.defaults.baseURL).origin}${editItem.imageUrl}`) : '');
        }
    }, [editItem]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setFormData({ ...formData, imageUrl: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = sessionStorage.getItem('adminToken');

        const formDataObj = new FormData();
        formDataObj.append('title', JSON.stringify({ en: formData.titleEn, am: formData.titleAm }));
        formDataObj.append('content', JSON.stringify({ en: formData.contentEn, am: formData.contentAm }));
        formDataObj.append('category', formData.category);

        if (selectedFile) {
            formDataObj.append('image', selectedFile);
        } else {
            formDataObj.append('imageUrl', formData.imageUrl);
        }

        try {
            if (isEditing) {
                await api.put(`/news/${currentNewsId}`, formDataObj, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await api.post('/news', formDataObj, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            navigate('/news');
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Error saving news' });
            setLoading(false);
        }
    };

    return (
        <div className="news-management-page fade-in">
            <div className="news-header-container">
                <div>
                    <h1>{isEditing ? 'Edit Information' : 'Post New Information'}</h1>
                    <p className="subtitle">Fill out the form below to {isEditing ? 'update' : 'publish'} news.</p>
                </div>
                <button 
                    className="btn-cancel"
                    onClick={() => navigate('/news')}
                >
                    <FaTimes style={{ marginRight: '5px' }} /> Cancel
                </button>
            </div>

            {status.message && <div className={`alert ${status.type}`}>{status.message}</div>}

            <div className="premium-card">
                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="input-grid">
                        <div className="form-group">
                            <label>Title (EN)</label>
                            <input type="text" name="titleEn" value={formData.titleEn} onChange={handleInputChange} required className="premium-input" />
                        </div>
                        <div className="form-group">
                            <label>Title (AM)</label>
                            <input type="text" name="titleAm" value={formData.titleAm} onChange={handleInputChange} required className="premium-input" />
                        </div>
                        <div className="form-group full">
                            <label>Content (EN)</label>
                            <textarea name="contentEn" value={formData.contentEn} onChange={handleInputChange} required className="premium-input" style={{ height: '150px' }} />
                        </div>
                        <div className="form-group full">
                            <label>Content (AM)</label>
                            <textarea name="contentAm" value={formData.contentAm} onChange={handleInputChange} required className="premium-input" style={{ height: '150px' }} />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className="premium-input">
                                <option value="Church">Church</option>
                                <option value="School">School</option>
                                <option value="Holiday">Holiday</option>
                                <option value="Service">Service</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} disabled={!!selectedFile} placeholder="Or paste URL here..." className="premium-input" />
                        </div>
                        <div className="form-group full">
                            <label>Upload Image</label>
                            <div className="file-input-wrapper">
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>
                        {(imagePreview || formData.imageUrl) && (
                            <div className="form-group full image-preview-container">
                                <label>Image Preview</label>
                                <div className="preview-box">
                                    <img src={imagePreview || (formData.imageUrl.startsWith('http') ? formData.imageUrl : `${new URL(api.defaults.baseURL).origin}${formData.imageUrl}`)} alt="Preview" className="image-preview" style={{ maxHeight: '300px' }} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-actions" style={{ marginTop: '2rem', justifyContent: 'flex-start' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                            <FaSave style={{ marginRight: '8px' }} />
                            {loading ? 'Saving...' : (isEditing ? 'Update News' : 'Publish News')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostNews;
