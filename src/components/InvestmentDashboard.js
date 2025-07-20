import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import axios from 'axios';

const InvestmentDashboard = () => {
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    todayChange: 0,
    todayPercentage: 0,
    holdings: []
  });

  const [portfolioChart, setPortfolioChart] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  });

  const [performanceChart, setPerformanceChart] = useState({
    labels: [],
    datasets: [{
      label: 'Portfolio Value',
      data: [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  });

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    fetchPortfolioData();
    fetchAIRecommendations();
    fetchMarketNews();
    fetchWatchlist();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const response = await axios.get('/api/investment/portfolio', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = response.data;
      setPortfolio(data.summary);

      // Update portfolio allocation chart
      setPortfolioChart({
        labels: data.holdings.map(h => h.symbol),
        datasets: [{
          ...portfolioChart.datasets[0],
          data: data.holdings.map(h => h.value)
        }]
      });

      // Update performance chart
      setPerformanceChart({
        labels: data.performance.map(p => new Date(p.date).toLocaleDateString()),
        datasets: [{
          ...performanceChart.datasets[0],
          data: data.performance.map(p => p.value)
        }]
      });

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  };

  const fetchAIRecommendations = async () => {
    try {
      const response = await axios.get('/api/investment/ai-recommendations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    }
  };

  const fetchMarketNews = async () => {
    try {
      const response = await axios.get('/api/investment/market-news');
      setMarketNews(response.data);
    } catch (error) {
      console.error('Error fetching market news:', error);
    }
  };

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get('/api/investment/watchlist', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const handleBuyStock = async (symbol, quantity, price) => {
    try {
      await axios.post('/api/investment/buy', {
        symbol,
        quantity,
        price
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      fetchPortfolioData(); // Refresh data
    } catch (error) {
      console.error('Error buying stock:', error);
    }
  };

  const handleSellStock = async (symbol, quantity, price) => {
    try {
      await axios.post('/api/investment/sell', {
        symbol,
        quantity,
        price
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      fetchPortfolioData(); // Refresh data
    } catch (error) {
      console.error('Error selling stock:', error);
    }
  };

  return (
    
      
        💼 Investment Portfolio
        
          
            ${portfolio.totalValue?.toLocaleString()}
            = 0 ? 'positive' : 'negative'}`}>
              {portfolio.todayChange >= 0 ? '+' : ''}${portfolio.todayChange?.toLocaleString()} 
              ({portfolio.todayPercentage?.toFixed(2)}%)
            
          
        
      

      
        {/* Portfolio Performance Chart */}
        
          Portfolio Performance
          
            
          
        

        {/* Portfolio Allocation */}
        
          Asset Allocation
          
            
          
        

        {/* Holdings Table */}
        
          Current Holdings
          
            
              
                
                  Symbol
                  Shares
                  Price
                  Value
                  Change
                  Actions
                
              
              
                {portfolio.holdings?.map((holding, index) => (
                  
                    
                      
                        {holding.symbol}
                        {holding.name}
                      
                    
                    {holding.shares}
                    ${holding.price?.toFixed(2)}
                    ${holding.value?.toLocaleString()}
                    = 0 ? 'positive' : 'negative'}>
                      {holding.change >= 0 ? '+' : ''}{holding.changePercent?.toFixed(2)}%
                    
                    
                       handleBuyStock(holding.symbol, 1, holding.price)}
                      >
                        Buy
                      
                       handleSellStock(holding.symbol, 1, holding.price)}
                      >
                        Sell
                      
                    
                  
                ))}
              
            
          
        

        {/* AI Recommendations */}
        
          🤖 AI Investment Recommendations
          
            {aiRecommendations.map((rec, index) => (
              
                
                  {rec.action}
                  Confidence: {rec.confidence}%
                
                
                  {rec.symbol} - {rec.companyName}
                  {rec.reason}
                  
                    Target Price: ${rec.targetPrice}
                    Potential Return: {rec.potentialReturn}%
                  
                
                
                  Apply Recommendation
                  Dismiss
                
              
            ))}
          
        

        {/* Watchlist */}
        
          📊 Watchlist
          
            {watchlist.map((item, index) => (
              
                
                  {item.symbol}
                  ${item.price?.toFixed(2)}
                
                = 0 ? 'positive' : 'negative'}`}>
                  {item.change >= 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                
                 handleBuyStock(item.symbol, 1, item.price)}
                >
                  Buy
                
              
            ))}
          
          
          Add New Stock
        

        {/* Market News */}
        
          📰 Market News
          
            {marketNews.slice(0, 5).map((news, index) => (
              
                
                  {news.title}
                  {news.summary}
                  
                    {news.source}
                    {new Date(news.publishedAt).toLocaleDateString()}
                  
                
              
            ))}
          
        

        {/* Robo Advisor */}
        
          🤖 Robo Advisor
          
            
              Risk Tolerance:
              Moderate
            
            
            
              Primary Goal:
              Long-term Growth
            
            
            
              Recommended Allocation:
              
                
                  Stocks
                  
                    
                  
                  70%
                
                
                
                  Bonds
                  
                    
                  
                  20%
                
                
                
                  REITs
                  
                    
                  
                  10%
                
              
            
            
            Auto-Rebalance Portfolio
          
        
      
    
  );
};

export default InvestmentDashboard;
