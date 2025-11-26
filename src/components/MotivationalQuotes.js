import React, { useState, useEffect } from 'react';
import './MotivationalQuotes.css';

const MotivationalQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const quotes = [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "Perseverance",
      icon: "💪"
    },
    {
      text: "The expert in anything was once a beginner. Every pro was once an amateur.",
      author: "Robin Sharma",
      category: "Learning",
      icon: "🌱"
    },
    {
      text: "Your education is a dress rehearsal for a life that is yours to lead.",
      author: "Nora Ephron",
      category: "Education",
      icon: "🎓"
    },
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King",
      category: "Knowledge",
      icon: "📚"
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      category: "Persistence",
      icon: "⏰"
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "Dreams",
      icon: "✨"
    },
    {
      text: "Study hard, for the well is deep, and our brains are shallow.",
      author: "Richard Baxter",
      category: "Study",
      icon: "🧠"
    },
    {
      text: "Excellence is not a skill, it's an attitude.",
      author: "Ralph Marston",
      category: "Excellence",
      icon: "🏆"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const handleNextQuote = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
      setIsVisible(true);
    }, 300);
  };

  const currentQuoteData = quotes[currentQuote];

  return (
    <div className="motivational-quotes">
      <div className="quotes-header">
        <h3>💡 Daily Motivation</h3>
        <button className="refresh-quote" onClick={handleNextQuote}>
          🔄
        </button>
      </div>

      <div className={`quote-container ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="quote-icon">
          {currentQuoteData.icon}
        </div>
        
        <div className="quote-content">
          <blockquote className="quote-text">
            "{currentQuoteData.text}"
          </blockquote>
          
          <div className="quote-attribution">
            <span className="quote-author">— {currentQuoteData.author}</span>
            <span className="quote-category">{currentQuoteData.category}</span>
          </div>
        </div>
      </div>

      <div className="quote-progress">
        <div className="progress-dots">
          {quotes.map((_, index) => (
            <div 
              key={index} 
              className={`progress-dot ${index === currentQuote ? 'active' : ''}`}
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  setCurrentQuote(index);
                  setIsVisible(true);
                }, 300);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MotivationalQuotes;