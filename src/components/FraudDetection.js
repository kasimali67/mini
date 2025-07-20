import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';

const FraudDetection = () => {
  const [fraudScore, setFraudScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [mlModel, setMlModel] = useState({
    accuracy: 0,
    lastTrained: null,
    version: ''
  });

  const [riskChart, setRiskChart] = useState({
    labels: [],
    datasets: [{
      label: 'Risk Score',
      data: [],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.1
    }]
  });

  useEffect(() => {
    fetchFraudData();
    const interval = setInterval(fetchFraudData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFraudData = async () => {
    try {
      const response = await axios.get('/api/fraud/analysis', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = response.data;
      setFraudScore(data.currentRiskScore);
      setRiskFactors(data.riskFactors);
      setAnomalies(data.anomalies);
      setMlModel(data.mlModel);
      
      // Update risk chart
      setRiskChart({
        labels: data.riskHistory.map(item => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [{
          ...riskChart.datasets[0],
          data: data.riskHistory.map(item => item.score)
        }]
      });
    } catch (error) {
      console.error('Error fetching fraud data:', error);
    }
  };

  const getRiskLevel = (score) => {
    if (score  {
    try {
      await axios.post(`/api/fraud/false-positive/${anomalyId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchFraudData(); // Refresh data
    } catch (error) {
      console.error('Error reporting false positive:', error);
    }
  };

  const risk = getRiskLevel(fraudScore);

  return (
    
      
        🛡️ Advanced Fraud Detection
        
          Model v{mlModel.version} | Accuracy: {mlModel.accuracy}%
        
      

      
        {/* Current Risk Score */}
        
          Current Risk Score
          
            {fraudScore}
            {risk.level} Risk
          
          
            Based on transaction patterns, location, and behavioral analysis
          
        

        {/* Risk Factors */}
        
          Risk Factors Detected
          {riskFactors.length > 0 ? (
            
              {riskFactors.map((factor, index) => (
                
                  {factor.icon}
                  
                    {factor.title}
                    {factor.description}
                    Weight: {factor.weight}
                  
                
              ))}
            
          ) : (
            
              ✅
              No risk factors detected
            
          )}
        

        {/* Anomaly Detection */}
        
          Transaction Anomalies
          {anomalies.length > 0 ? (
            
              {anomalies.map((anomaly, index) => (
                
                  
                    {anomaly.type}
                    
                      {new Date(anomaly.timestamp).toLocaleString()}
                    
                  
                  
                    {anomaly.description}
                    
                      Amount: ${anomaly.amount}
                      Location: {anomaly.location}
                      Confidence: {anomaly.confidence}%
                    
                  
                  
                     handleReportFalsePositive(anomaly.id)}
                    >
                      Mark as Safe
                    
                    Investigate
                  
                
              ))}
            
          ) : (
            
              ✅
              No anomalies detected in recent transactions
            
          )}
        

        {/* Risk Trend Chart */}
        
          Risk Score Trend
          
            
          
        

        {/* Security Recommendations */}
        
          Security Recommendations
          
            
              🔐
              
                Enable Biometric Authentication
                Add an extra layer of security with fingerprint or face recognition
                Enable Now
              
            
            
            
              📱
              
                Update Mobile App
                Latest version includes enhanced security features
                Update
              
            
            
            
              🌍
              
                Review Location Settings
                Unusual activity detected from new locations
                Review
              
            
          
        

        {/* ML Model Performance */}
        
          AI Model Performance
          
            
              Accuracy
              
                
              
              {mlModel.accuracy}%
            
            
            
              Precision
              
                
              
              92%
            
            
            
              Recall
              
                
              
              89%
            
          
          
          
            Last trained: {new Date(mlModel.lastTrained).toLocaleDateString()}
            Model version: {mlModel.version}
            Schedule Retraining
          
        
      
    
  );
};

export default FraudDetection;
