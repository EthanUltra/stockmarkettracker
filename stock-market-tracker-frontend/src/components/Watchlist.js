import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Watchlist() {
    const [watchlist, setWatchlist] = useState(() => {
        return JSON.parse(localStorage.getItem('watchlist')) || [];
    });
    const [symbol, setSymbol] = useState('');
    const [stockData, setStockData] = useState({});
    const [sortOption, setSortOption] = useState('alphabetical'); // Sorting options: alphabetical, change, price

    // Fetch stock data for the watchlist
    useEffect(() => {
        const fetchStockData = async () => {
            const data = {};
            for (let stock of watchlist) {
                try {
                    const response = await axios.get(`http://localhost:5000/stocks/${stock}`);
                    data[stock] = response.data;
                } catch (error) {
                    console.error(`Error fetching data for ${stock}:`, error.message);
                }
            }
            setStockData(data);
        };

        if (watchlist.length > 0) {
            fetchStockData();
        }
    }, [watchlist]);

    // Add stock to the watchlist
    const addStock = () => {
        if (symbol && !watchlist.includes(symbol.toUpperCase())) {
            const updatedWatchlist = [...watchlist, symbol.toUpperCase()];
            setWatchlist(updatedWatchlist);
            localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
            setSymbol('');
        }
    };

    // Remove stock from the watchlist
    const removeStock = (stock) => {
        const updatedWatchlist = watchlist.filter((item) => item !== stock);
        setWatchlist(updatedWatchlist);
        localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    };

    // Sort the watchlist based on the selected option
    const getSortedWatchlist = () => {
        return [...watchlist].sort((a, b) => {
            const stockA = stockData[a] || {};
            const stockB = stockData[b] || {};

            if (sortOption === 'alphabetical') {
                return a.localeCompare(b);
            } else if (sortOption === 'change') {
                const changeA = ((stockA.current - stockA.previousClose) / stockA.previousClose) || 0;
                const changeB = ((stockB.current - stockB.previousClose) / stockB.previousClose) || 0;
                return changeB - changeA; // Descending order
            } else if (sortOption === 'price') {
                return (stockB.current || 0) - (stockA.current || 0);
            }

            return 0;
        });
    };

    return (
        <div>
            <h2>Watchlist</h2>
            <input
                type="text"
                placeholder="Enter stock symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
            />
            <button onClick={addStock}>Add</button>

            <div>
                <label htmlFor="sort">Sort by: </label>
                <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="change">% Change</option>
                    <option value="price">Price</option>
                </select>
            </div>

            <ul>
                {getSortedWatchlist().map((stock) => (
                    <li key={stock}>
                        <strong>{stock}</strong>
                        {stockData[stock] && (
                            <>
                                {' - '}
                                <span>Price: ${stockData[stock].current.toFixed(2)}</span>{' '}
                                <span>
                                    Change:{' '}
                                    {(
                                        ((stockData[stock].current - stockData[stock].previousClose) /
                                            stockData[stock].previousClose) *
                                        100
                                    ).toFixed(2)}
                                    %
                                </span>{' '}
                                <span>High: ${stockData[stock].high.toFixed(2)}</span>{' '}
                                <span>Low: ${stockData[stock].low.toFixed(2)}</span>
                            </>
                        )}
                        <button onClick={() => removeStock(stock)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Watchlist;
