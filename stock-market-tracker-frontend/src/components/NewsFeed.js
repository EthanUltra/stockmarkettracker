import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '.././index.css';

function NewsFeed({ symbol }) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);
    const articlesPerPage = 5; // Number of articles to display per page

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError(null);

            try {
                const endpoint = symbol
                    ? `http://localhost:5000/news/${symbol}`
                    : `http://localhost:5000/news`;

                const response = await axios.get(endpoint);
                setNews(response.data);
            } catch (err) {
                console.error('Error fetching news:', err.message);
                setError('Failed to load news. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [symbol]);

    // Handle pagination
    const startIndex = (page - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const paginatedNews = news.slice(startIndex, endIndex);

    return (
        <div className="news-feed">
            <h3>Latest News {symbol && `for ${symbol}`}</h3>
            {loading ? (
                <p>Loading news...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : paginatedNews.length > 0 ? (
                <>
                    <ul>
                        {paginatedNews.map((article, index) => (
                            <li key={index}>
                                {article.image && (
                                    <img
                                        src={article.image}
                                        alt={article.headline || 'News'}
                                        className="news-image"
                                    />
                                )}
                                <div className="news-content">
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {article.headline || article.title}
                                    </a>
                                    <p>{article.summary || article.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="pagination">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button
                            onClick={() =>
                                setPage((prev) => (endIndex < news.length ? prev + 1 : prev))
                            }
                            disabled={endIndex >= news.length}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>No news available.</p>
            )}
        </div>
    );
}

export default NewsFeed;
