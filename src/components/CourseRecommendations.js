import React, { useState, useEffect } from 'react';
import recommendationService from '../services/recommendationService';
import './CourseRecommendations.css';

const CourseRecommendations = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);

  useEffect(() => {
    if (user?.studentId) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      // Get student's enrolled courses (mock data for demo)
      const enrolledCourses = recommendationService.getMockEnrolledCourses(user.studentId);
      
      // Get recommendations
      const recs = recommendationService.getRecommendations(
        {
          program: 'Computer Science', // Could come from user data
          gpa: 3.8 // Could come from user data
        },
        enrolledCourses
      );
      
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = (rec) => {
    setSelectedRec(rec);
  };

  const handleRegisterInterest = (courseId) => {
    // In a real app, this would call an API
    console.log(`Registering interest for ${courseId}`);
    // Could integrate with your chatbot or registration system
  };

  if (loading) {
    return (
      <div className="recommendations-widget">
        <div className="recommendations-header">
          <h3>🎯 Suggested Courses for You</h3>
        </div>
        <div className="recommendations-loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Finding perfect courses for you...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-widget">
        <div className="recommendations-header">
          <h3>🎯 Suggested Courses for You</h3>
        </div>
        <div className="no-recommendations">
          <p>🎉 You're all caught up!</p>
          <small>Check back next semester for new recommendations</small>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-widget">
      <div className="recommendations-header">
        <h3>🎯 Suggested Courses for You</h3>
        <span className="recommendations-count">{recommendations.length} matches</span>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div 
            key={rec.courseId} 
            className={`recommendation-item ${!rec.hasPrerequisites ? 'missing-prereqs' : ''}`}
            onClick={() => handleRecommendationClick(rec)}
          >
            <div className="rec-icon">
              {rec.icon}
            </div>
            
            <div className="rec-content">
              <div className="rec-header">
                <h4>{rec.courseId} - {rec.name}</h4>
                <div className="rec-match">
                  <span className="match-percentage">{rec.matchPercentage}% match</span>
                </div>
              </div>
              
              <p className="rec-description">{rec.description}</p>
              
              <div className="rec-details">
                <span className="rec-reason">{rec.reason}</span>
                <div className="rec-badges">
                  <span className={`difficulty-badge ${rec.difficulty?.toLowerCase()}`}>
                    {rec.difficulty}
                  </span>
                  <span className="job-relevance-badge">
                    {rec.jobRelevance} Demand
                  </span>
                </div>
              </div>
              
              {!rec.hasPrerequisites && (
                <div className="prereq-warning">
                  ⚠️ Prerequisites required: {rec.prerequisites?.join(', ')}
                </div>
              )}
            </div>
            
            <div className="rec-actions">
              <button 
                className="learn-more-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecommendationClick(rec);
                }}
              >
                Learn More
              </button>
              {rec.hasPrerequisites && (
                <button 
                  className="register-interest-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegisterInterest(rec.courseId);
                  }}
                >
                  Register Interest
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="recommendations-footer">
        <button className="view-all-courses">
          View All Available Courses
        </button>
      </div>

      {/* Course Detail Modal */}
      {selectedRec && (
        <div className="course-modal-overlay" onClick={() => setSelectedRec(null)}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedRec.icon} {selectedRec.courseId} - {selectedRec.name}</h3>
              <button className="modal-close" onClick={() => setSelectedRec(null)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="course-stats">
                <div className="stat">
                  <span className="stat-label">Match</span>
                  <span className="stat-value">{selectedRec.matchPercentage}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Difficulty</span>
                  <span className="stat-value">{selectedRec.difficulty}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Job Relevance</span>
                  <span className="stat-value">{selectedRec.jobRelevance}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Popularity</span>
                  <span className="stat-value">{selectedRec.popularity}%</span>
                </div>
              </div>
              
              <div className="course-description">
                <h4>Course Description</h4>
                <p>{selectedRec.description}</p>
              </div>
              
              <div className="recommendation-reason">
                <h4>Why This Course?</h4>
                <p>{selectedRec.reason}</p>
              </div>
              
              {selectedRec.prerequisites && selectedRec.prerequisites.length > 0 && (
                <div className="prerequisites">
                  <h4>Prerequisites</h4>
                  <div className="prereq-list">
                    {selectedRec.prerequisites.map(prereq => (
                      <span key={prereq} className="prereq-tag">{prereq}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setSelectedRec(null)}>
                Close
              </button>
              {selectedRec.hasPrerequisites && (
                <button 
                  className="modal-btn primary"
                  onClick={() => handleRegisterInterest(selectedRec.courseId)}
                >
                  Register Interest
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRecommendations;