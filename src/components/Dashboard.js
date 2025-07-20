import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [accountData, setAccountData] = useState({
    balance: 0,
    accountNumber: '',
    transactions: []
  });
  
  const [spendingData, setSpendingData] = useState({
    labels: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping'],
    datasets: [{
      data: [30, 20, 15, 25, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)'
      ]
    }]
  });

  const [transactionTrend, setTransactionTrend] = useState({
    labels: [],
    datasets: [{
      label: 'Daily Spending',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  });

  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchFraudAlerts();
    fetchAIInsights();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/overview', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAccountData(response.data);
      
      // Update transaction trend
      const trendData = response.data.transactionTrend;
      setTransactionTrend({
        labels: trendData.map(item => new Date(item.date).toLocaleDateString()),
        datasets: [{
          ...transactionTrend.datasets[0],
          data: trendData.map(item => item.amount)
        }]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchFraudAlerts = async () => {
    try {
      const response = await axios.get('/api/fraud/alerts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFraudAlerts(response.data);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const response = await axios.get('/api/ai/insights', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  return (
    
      
        Smart Banking Dashboard
        
          Quick Transfer
          Pay Bills
          Generate Virtual Card
        
      

      
        {/* Account Summary */}
        
          Account Overview
          
            ${accountData.balance?.toLocaleString()}
            ***{accountData.accountNumber?.slice(-4)}
          
          
          {/* AI Credit Score */}
          
            AI Credit Score
            
              750
              Excellent
            
          
        

        {/* Fraud Alerts */}
        {fraudAlerts.length > 0 && (
          
            🛡️ Security Alerts
            {fraudAlerts.map((alert, index) => (
              
                
                  {alert.type}
                  {new Date(alert.timestamp).toLocaleTimeString()}
                
                {alert.message}
                Review
              
            ))}
          
        )}

        {/* AI Insights */}
        
          🤖 AI Financial Insights
          {aiInsights.map((insight, index) => (
            
              {insight.icon}
              
                {insight.title}
                {insight.description}
                {insight.impact}
              
            
          ))}
        

        {/* Spending Analytics */}
        
          Spending Categories
          
            
          
        

        {/* Transaction Trends */}
        
          Spending Trends
          
            
          
        

        {/* Investment Portfolio */}
        
          💼 Investment Portfolio
          
            
              $25,430
              +5.2% ↗
            
            
              
                Stocks
                60%
              
              
                Bonds
                30%
              
              
                Crypto
                10%
              
            
          
        

        {/* Voice Banking */}
        
          🎤 Voice Banking
          
            🎙️
            Say "Check Balance" or "Transfer Money"
          
          
            "What's my balance?"
            "Transfer $100 to John"
            "Pay electricity bill"
          
        

        {/* Goals & Savings */}
        
          🎯 Savings Goals
          
            
              Vacation Fund
              $5,000
            
            
              
            
            $3,400 saved (68%)
          
          
          
            
              Emergency Fund
              $10,000
            
            
              
            
            $4,500 saved (45%)
          
        
      

      {/* Quick Transfer Modal would go here */}
      {/* Bill Payment Modal would go here */}
      {/* Virtual Card Generator would go here */}
    
  );
};

export default Dashboard;
