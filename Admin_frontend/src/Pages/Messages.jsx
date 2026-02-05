import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/Messages.css';
import '../Styles/Alert.css';

const Messages = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/messages');
            if (response.data.success) {
                setMessages(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/messages/${id}/read`);
            if (response.data.success) {
                setMessages(messages.map(msg =>
                    msg._id === id ? { ...msg, isRead: true } : msg
                ));
            }
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    };

    if (loading) return <div className="admin-loading">{t('common.loading') || 'Loading...'}</div>;

    return (
        <div className="admin-messages">
            <div className="messages-header">
                <h2>{t('admin.messages.title')}</h2>
                <p>{t('admin.messages.subtitle')}</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="messages-list">
                {messages.length === 0 ? (
                    <div className="no-messages">{t('admin.messages.noMessages')}</div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg._id} className={`message-card ${msg.isRead ? 'read' : 'unread'}`}>
                            <div className="message-header-info">
                                <span className="message-source">{msg.source === 'admin' ? '🏛️ Admin' : '👤 User'}</span>
                                <span className="message-date">{new Date(msg.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="message-body">
                                <h3>{msg.name}</h3>
                                <p className="message-email">{msg.email}</p>
                                <p className="message-content">{msg.message}</p>
                            </div>
                            <div className="message-footer">
                                {!msg.isRead && (
                                    <button
                                        onClick={() => markAsRead(msg._id)}
                                        className="btn-mark-read"
                                    >
                                        {t('admin.messages.markRead')}
                                    </button>
                                )}
                                <span className={`status-badge ${msg.isRead ? 'read' : 'unread'}`}>
                                    {msg.isRead ? t('admin.messages.read') : t('admin.messages.unread')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Messages;
