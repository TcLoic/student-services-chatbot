import React, { useState, useEffect } from 'react';
import './StudyTips.css';

const StudyTips = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const studyTips = [
    {
      tip: "Take breaks every 25 minutes for better focus and retention",
      category: "Focus",
      icon: "⏰"
    },
    {
      tip: "Review notes within 24 hours to improve long-term memory",
      category: "Memory",
      icon: "🧠"
    },
    {
      tip: "Create a dedicated study space free from distractions",
      category: "Environment",
      icon: "📚"
    },
    {
      tip: "Use active recall - test yourself instead of just re-reading",
      category: "Technique",
      icon: "🎯"
    },
    {
      tip: "Get 7-9 hours of sleep for optimal cognitive performance",
      category: "Health",
      icon: "😴"
    },
    {
      tip: "Break large assignments into smaller, manageable tasks",
      category: "Planning",
      icon: "📋"
    },
    {
      tip: "Study the most challenging material when you're most alert",
      category: "Timing",
      icon: "🌅"
    },
    {
      tip: "Form study groups to discuss and explain concepts to others",
      category: "Collaboration",
      icon: "👥"
    },
    {
      tip: "Use flashcards for memorizing key terms and concepts",
      category: "Tools",
      icon: "🃏"
    },
    {
      tip: "Stay hydrated and eat brain-healthy foods while studying",
      category: "Nutrition",
      icon: "🥗"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % studyTips.length);
        setIsVisible(true);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [studyTips.length]);

  const handleNextTip = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentTip((prev) => (prev + 1) % studyTips.length);
      setIsVisible(true);
    }, 300);
  };

  const currentTipData = studyTips[currentTip];

  return (
    <div className="study-tips">
      <div className="tips-header">
        <h3>💡 Study Tips</h3>
        <button className="next-tip" onClick={handleNextTip}>
          →
        </button>
      </div>

      <div className={`tip-container ${isVisible ? 'visible' : 'hidden'}`}>
        <div className="tip-icon">
          {currentTipData.icon}
        </div>
        
        <div className="tip-content">
          <p className="tip-text">
            {currentTipData.tip}
          </p>
          
          <div className="tip-category">
            <span className="category-badge">{currentTipData.category}</span>
          </div>
        </div>
      </div>

      <div className="tip-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentTip + 1) / studyTips.length) * 100}%` }}
          ></div>
        </div>
        <span className="tip-counter">
          {currentTip + 1} of {studyTips.length}
        </span>
      </div>
    </div>
  );
};

export default StudyTips;