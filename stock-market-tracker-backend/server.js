// backend/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

const PORT = 5000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'your-finnhub-api-key';

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? 'https://your-production-frontend.com' : 'http://localhost:3000',
};
app.use(cors(corsOptions));

// Axios instance with interceptors
const apiClient = axios.create({
    baseURL: 'https://finnhub.io/api/v1',
    params: { token: FINNHUB_API_KEY },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 429) {
            console.error('Rate limit exceeded.');
        }
        return Promise.reject(error);
    }
);

// Fetch stock data
app.get('/stocks/:symbol', async (req, res) => {
    const { symbol } = req.params;
    console.log(`Fetching stock data for: ${symbol}`);
    try {
        const response = await apiClient.get('/quote', { params: { symbol } });
        const stockData = response.data;

        if (!stockData || Object.keys(stockData).length === 0) {
            return res.status(404).json({ error: `Stock data for "${symbol}" not found.` });
        }

        const formattedData = {
            symbol,
            current: stockData.c,
            high: stockData.h,
            low: stockData.l,
            open: stockData.o,
            previousClose: stockData.pc,
        };

        res.json(formattedData);
    } catch (error) {
        if (!error.response) {
            console.error('Network error:', error.message);
            return res.status(500).json({ error: 'Network error. Please try again later.' });
        }
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
});

// Fetch news data
app.get('/news', async (req, res) => {
    try {
        console.log('Fetching general news...');
        const response = await apiClient.get('/news', { params: { category: 'general' } });
        res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        }
        res.status(500).json({ error: 'Failed to fetch general news.' });
    }
});

app.get('/news/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        console.log(`Fetching news for ${symbol}...`);
        const response = await apiClient.get('/company-news', {
            params: {
                symbol,
                from: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0],
            },
        });
        res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        }
        res.status(500).json({ error: `Failed to fetch news for ${symbol}.` });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
