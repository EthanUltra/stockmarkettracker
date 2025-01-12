import React, { useState, useEffect } from 'react';
import Watchlist from './components/Watchlist.js';
import StockChart from './components/StockChart.js';
import NewsFeed from './components/NewsFeed.js';

function App() {
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        // Apply the theme class to the <body> tag dynamically
        document.body.className = darkMode ? 'dark-mode' : 'light-mode';
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <div>
            <header>
                <h1>📈 Stock Market Tracker</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    Switch to {darkMode ? 'Light' : 'Dark'} Mode
                </button>
            </header>
            <main>
                <Watchlist />
                <StockChart />
                <NewsFeed />
            </main>
        </div>
    );
}

export default App;
