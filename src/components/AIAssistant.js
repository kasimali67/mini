import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I'm your AI Banking Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [quickActions, setQuickActions] = useState([
    'Check my balance',
    'Recent transactions',
    'Transfer money',
    'Pay bills',
    'Find nearest ATM',
    'Investment advice'
  ]);
  
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  useEffect(() => {
    scrollToBottom();
    initSpeechRecognition();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };
    }
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: messageText,
        context: 'banking'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.data.reply,
        intent: response.data.intent,
        entities: response.data.entities,
        actions: response.data.suggestedActions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Execute actions if any
      if (response.data.executeAction) {
        executeAction(response.data.executeAction);
      }
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'I apologize, but I'm having trouble processing your request right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  const executeAction = async (action) => {
    switch (action.type) {
      case 'balance_inquiry':
        // Fetch and display balance
        break;
      case 'transaction_history':
        // Show transaction history
        break;
      case 'transfer_money':
        // Open transfer dialog
        break;
      case 'pay_bill':
        // Open bill payment dialog
        break;
      default:
        break;
    }
  };

  const startVoiceRecognition = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition.current) {
      setIsListening(false);
      recognition.current.stop();
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    
      
        
          🤖
          
            AI Banking Assistant
            Online
          
        
        
        
          Clear Chat
          Settings
        
      

      
        {quickActions.map((action, index) => (
           handleQuickAction(action)}
          >
            {action}
          
        ))}
      

      
        {messages.map((message) => (
          
            
              {message.message}
              
              {message.actions && (
                
                  {message.actions.map((action, index) => (
                     handleQuickAction(action.text)}
                    >
                      {action.icon} {action.text}
                    
                  ))}
                
              )}
            
            
            
              {message.timestamp.toLocaleTimeString()}
            
          
        ))}
        
        {isTyping && (
          
            
              
              
              
            
          
        )}
        
        
      

      
        
           setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice..."
            className="message-input"
            rows="1"
          />
          
          
            
              {isListening ? '🔴' : '🎤'}
            
            
             handleSendMessage()}
              disabled={!inputMessage.trim()}
            >
              Send
            
          
        
      

      
        
          💬
          Natural Language Understanding
        
        
        
          🎯
          Intent Recognition
        
        
        
          🌐
          Multi-language Support
        
        
        
          🔄
          24/7 Availability
        
      
    
  );
};

export default AIAssistant;
