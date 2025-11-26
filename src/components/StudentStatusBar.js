import React from 'react';
import './StudentStatusBar.css';

const StudentStatusBar = ({ user, onChatClick }) => {
  // Mock student data - in real app, this would come from API
  const studentStats = {
    gpa: '3.8',
    courses: 5,
    pendingTasks: 3,
    completedCredits: 87,
    totalCredits: 120
  };

  const progressPercentage = Math.round((studentStats.completedCredits / studentStats.totalCredits) * 100);

  return (
    <div className="student-status-bar">
      <div className="status-items">
        <div className="status-item">
          <span className="status-icon">📊</span>
          <div className="status-content">
            <span className="status-value">{studentStats.gpa}</span>
            <span className="status-label">GPA</span>
          </div>
        </div>

        <div className="status-item">
          <span className="status-icon">📚</span>
          <div className="status-content">
            <span className="status-value">{studentStats.courses}</span>
            <span className="status-label">Courses</span>
          </div>
        </div>

        <div className="status-item">
          <span className="status-icon">⏰</span>
          <div className="status-content">
            <span className="status-value">{studentStats.pendingTasks}</span>
            <span className="status-label">Tasks Due</span>
          </div>
        </div>

        <div className="status-item progress-item">
          <span className="status-icon">🎓</span>
          <div className="status-content">
            <span className="status-value">{progressPercentage}%</span>
            <span className="status-label">Degree Progress</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="status-actions">
        <button className="ask-ai-btn" onClick={onChatClick}>
          <span className="ai-icon">🤖</span>
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
};

export default StudentStatusBar;