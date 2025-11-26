import React from 'react';
import './LoadingSkeleton.css';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-icon"></div>
              <div className="skeleton-title"></div>
            </div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        );
      
      case 'chat':
        return (
          <div className="skeleton-chat">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-message">
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="skeleton-list-item">
            <div className="skeleton-icon small"></div>
            <div className="skeleton-content">
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        );
      
      case 'header':
        return (
          <div className="skeleton-header-bar">
            <div className="skeleton-logo"></div>
            <div className="skeleton-nav">
              <div className="skeleton-nav-item"></div>
              <div className="skeleton-nav-item"></div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="skeleton-default">
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        );
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;