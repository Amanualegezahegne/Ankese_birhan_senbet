import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/Profile.css';
import '../Styles/Alert.css';

const Profile = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        christianName: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('studentToken');
                const response = await axios.get('http://localhost:5000/api/students/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const student = response.data.data;
                    setFormData(prev => ({
                        ...prev,
                        name: student.name || '',
                        email: student.email || '',
                        christianName: student.christianName || '',
                        phone: student.phone || ''
                    }));
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setStatus({ type: 'error', message: t('profile.loadError') });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [t]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('studentToken');
            const response = await axios.put('http://localhost:5000/api/students/profile', {
                name: formData.name,
                email: formData.email,
                christianName: formData.christianName,
                phone: formData.phone
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: t('profile.updateSuccess') });
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || t('profile.updateError') });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmNewPassword) {
            setStatus({ type: 'error', message: t('signup.passwordMismatch') });
            return;
        }

        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('studentToken');
            const response = await axios.put('http://localhost:5000/api/students/profile', {
                currentPassword: formData.currentPassword,
                password: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStatus({ type: 'success', message: t('profile.passwordSuccess') });
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || t('profile.passwordError') });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="profile-loading">{t('news.loading')}</div>;

    return (
        <div className="page-container profile-page">
            <div className="profile-card">
                <div className="profile-header">
                    <h1>{t('profile.title')}</h1>
                    {status.message && (
                        <div className={`alert alert-${status.type}`}>
                            {status.message}
                        </div>
                    )}
                </div>

                <div className="profile-grid">
                    {/* General Info Section */}
                    <div className="profile-section">
                        <h3>{t('profile.personalInfo')}</h3>
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <div className="form-group">
                                <label>{t('signup.name')}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('signup.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('signup.christianName')}</label>
                                <input
                                    type="text"
                                    name="christianName"
                                    value={formData.christianName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('signup.phone')}</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="save-btn" disabled={isSubmitting}>
                                {isSubmitting ? t('profile.saveChanges') + '...' : t('profile.saveChanges')}
                            </button>
                        </form>
                    </div>

                    {/* Password Section */}
                    <div className="profile-section">
                        <h3>{t('profile.changePassword')}</h3>
                        <form onSubmit={handleChangePassword} className="profile-form">
                            <div className="form-group">
                                <label>{t('profile.currentPassword')}</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('profile.newPassword')}</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('profile.confirmNewPassword')}</label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <button type="submit" className="save-btn password-btn" disabled={isSubmitting}>
                                {isSubmitting ? t('profile.changePassword') + '...' : t('profile.changePassword')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
