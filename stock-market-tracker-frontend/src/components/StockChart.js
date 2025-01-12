import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsFeed from './NewsFeed';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

function StockChart() {
    const [symbol, setSymbol] = useState('AAPL');
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);

    const stockList = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NFLX'];

    useEffect(() => {
        const fetchStockData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/stocks/${symbol}`);
                const data = response.data;

                setChartData({
                    labels: ['Open', 'High', 'Low', 'Current', 'Previous Close'],
                    datasets: [
                        {
                            label: `${symbol} Stock Data`,
                            data: [data.open, data.high, data.low, data.current, data.previousClose],
                            borderColor: 'rgba(75,192,192,1)',
                            backgroundColor: 'rgba(75,192,192,0.2)',
                            fill: true,
                            tension: 0.3,
                        },
                    ],
                });
            } catch (err) {
                console.error('Error fetching stock data:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [symbol]);

    return (
        <div className="stock-tracker">
            <div className="title-container">
                <h2>Stock Tracker</h2>
                <label>
                    Select Stock:
                    <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                        {stockList.map((stock) => (
                            <option key={stock} value={stock}>
                                {stock}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="chart-container">
                {loading ? (
                    <p>Loading chart...</p>
                ) : chartData ? (
                    <Line data={chartData} />
                ) : (
                    <p>No chart data available.</p>
                )}
            </div>
            <div className="news-feed">
                <NewsFeed symbol={symbol} />
            </div>
        </div>
    );
}

export default StockChart;
