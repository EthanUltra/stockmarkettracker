// backend/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'cu12fn1r01qjiermur40cu12fn1r01qjiermur4g';

// Fetch stock data
app.get('/stocks/:symbol', async (req, res) => {
    const { symbol } = req.params;
    console.log(`Fetching stock data for: ${symbol}`);
    try {
        // Finnhub API endpoint
        const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
            params: {
                symbol: symbol,
                token: FINNHUB_API_KEY,
            },
        });

        const stockData = response.data;
        if (!stockData || Object.keys(stockData).length === 0) {
            return res.status(404).json({ error: `Stock data for "${symbol}" not found.` });
        }

        // Format response
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
        console.error('Error fetching stock data:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data.' });
    }
});


// Fetch news data
app.get('/news', async (req, res) => {
    try {
        console.log('Fetching general news...');
        const response = await axios.get('https://finnhub.io/api/v1/news', {
            params: {
                category: 'general',
                token: FINNHUB_API_KEY,
            },
        });

        console.log('News data:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching general news:', error.message);
        res.status(500).json({ error: 'Failed to fetch general news.' });
    }
});

app.get('/news/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        console.log(`Fetching news for ${symbol}...`);
        const response = await axios.get('https://finnhub.io/api/v1/company-news', {
            params: {
                symbol: symbol,
                from: new Date(new Date().setDate(new Date().getDate() - 7))
                    .toISOString()
                    .split('T')[0], // 7 days ago
                to: new Date().toISOString().split('T')[0], // Today
                token: FINNHUB_API_KEY,
            },
        });

        console.log(`News data for ${symbol}:`, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error.message);
        res.status(500).json({ error: `Failed to fetch news for ${symbol}.` });
    }
    if (error.response && error.response.status === 429) {
    console.error('Rate limit exceeded.');
    res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
}
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
