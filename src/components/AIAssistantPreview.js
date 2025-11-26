import React, { useState, useEffect } from 'react';
import './AIAssistantPreview.css';

const AIAssistantPreview = ({ user, onStartChat }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    `Hi ${user?.name || 'there'}! I can help you with course registration, library hours, and checking your grades. What would you like to know?`,
    "Need help with assignments? I can show you upcoming deadlines and help you stay organized!",
    "Want to register for courses? I can check availability and help you enroll in the perfect classes!",
    "Questions about campus services? I'm here to help with library hours, financial aid, and more!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="ai-assistant-preview">
      <div className="ai-preview-header">
        <div className="ai-avatar">
          <span className="ai-emoji">🤖</span>
          <div className="ai-status-dot"></div>
        </div>
        <div className="ai-info">
          <h3>Your AI Study Assistant</h3>
          <span className="ai-status">Online & Ready to Help</span>
        </div>
      </div>

      <div className="ai-message-container">
        <div className="ai-message">
          <p>{messages[currentMessage]}</p>
        </div>
        <div className="message-indicators">
          {messages.map((_, index) => (
            <div 
              key={index} 
              className={`indicator ${index === currentMessage ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="ai-quick-actions">
        <button className="quick-action-btn" onClick={() => onStartChat("What are the library hours?")}>
          📖 Library Hours
        </button>
        <button className="quick-action-btn" onClick={() => onStartChat("Help me register for courses")}>
          📚 Course Registration
        </button>
        <button className="quick-action-btn" onClick={() => onStartChat("Show my grades")}>
          🎓 Check Grades
        </button>
      </div>

      <div className="ai-preview-footer">
        <button className="start-chat-btn" onClick={() => onStartChat()}>
          <span className="chat-icon">💬</span>
          Start Chatting
        </button>
      </div>
    </div>
  );
};

export default AIAssistantPreview;