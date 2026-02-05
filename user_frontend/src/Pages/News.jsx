import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/News.css';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/news');
                if (response.data.success) {
                    setNews(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError(t('news.error'));
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [t]);

    if (loading) return <div className="news-loading">{t('news.loading')}</div>;
    if (error) return <div className="news-error">{error}</div>;

    const currentLang = i18n.language === 'en' ? 'en' : 'am';

    return (
        <div className="page-container news-page">
            <div className="news-header">
                <h1>{t('news.title')}</h1>
                <p>{t('news.subtitle')}</p>
            </div>

            <div className="news-grid">
                {news.length > 0 ? (
                    news.map((item) => (
                        <div key={item._id} className="news-card">
                            <div className="news-card-image">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title[currentLang]} />
                                ) : (
                                    <div className="placeholder-image">
                                        <i className="fas fa-church"></i>
                                    </div>
                                )}
                                <span className={`category-badge ${item.category.toLowerCase()}`}>
                                    {t(`news.${item.category.toLowerCase()}`)}
                                </span>
                            </div>
                            <div className="news-card-content">
                                <span className="news-date">
                                    {new Date(item.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'am-ET')}
                                </span>
                                <h3>{item.title[currentLang]}</h3>
                                <p>{item.content[currentLang]}</p>
                                <button className="read-more-btn">
                                    {t('news.readMore')}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-news">{t('news.noNews')}</div>
                )}
            </div>
        </div>
    );
};

export default News;
