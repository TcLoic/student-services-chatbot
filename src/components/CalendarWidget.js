import React, { useState, useEffect } from 'react';
import calendarService from '../services/calendarService';
import './CalendarWidget.css';

const CalendarWidget = ({ user }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, assignments, exams, other

  useEffect(() => {
    if (!user?.studentId) return;

    const initializeCalendar = async () => {
      try {
        setLoading(true);
        
        // Fetch initial deadlines
        const initialDeadlines = await calendarService.fetchDeadlines(user.studentId);
        setDeadlines(initialDeadlines);
        
        // Initialize real-time updates
        await calendarService.initializeRealTime(user.studentId);
        
        // Subscribe to updates
        const unsubscribe = calendarService.subscribe((updatedDeadlines) => {
          setDeadlines([...updatedDeadlines]);
        });
        
        setLoading(false);
        
        // Cleanup on unmount
        return () => {
          unsubscribe();
          calendarService.disconnect();
        };
        
      } catch (err) {
        console.error('Failed to initialize calendar:', err);
        setError('Failed to load calendar data');
        setLoading(false);
      }
    };

    initializeCalendar();
  }, [user?.studentId]);

  const getFilteredDeadlines = () => {
    const upcoming = calendarService.getUpcomingDeadlines();
    
    if (filter === 'all') return upcoming;
    
    return upcoming.filter(deadline => {
      switch (filter) {
        case 'assignments':
          return deadline.type === 'assignment' || deadline.type === 'project';
        case 'exams':
          return deadline.type === 'exam';
        case 'other':
          return !['assignment', 'project', 'exam'].includes(deadline.type);
        default:
          return true;
      }
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#0ea5e9';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'project': return '🚀';
      case 'exam': return '📊';
      case 'registration': return '📋';
      case 'library': return '📚';
      default: return '📅';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getDaysUntil = (dateStr, timeStr) => {
    const dueDate = new Date(`${dateStr} ${timeStr}`);
    const now = new Date();
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="calendar-widget">
        <div className="calendar-header">
          <h3>📅 Upcoming Deadlines</h3>
        </div>
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <p>Loading deadlines...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-widget">
        <div className="calendar-header">
          <h3>📅 Upcoming Deadlines</h3>
        </div>
        <div className="calendar-error">
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const filteredDeadlines = getFilteredDeadlines();

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <h3>📅 Upcoming Deadlines</h3>
        <div className="calendar-filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'assignments' ? 'active' : ''} 
            onClick={() => setFilter('assignments')}
          >
            Tasks
          </button>
          <button 
            className={filter === 'exams' ? 'active' : ''} 
            onClick={() => setFilter('exams')}
          >
            Exams
          </button>
          <button 
            className={filter === 'other' ? 'active' : ''} 
            onClick={() => setFilter('other')}
          >
            Other
          </button>
        </div>
      </div>

      <div className="calendar-content">
        {filteredDeadlines.length === 0 ? (
          <div className="no-deadlines">
            <p>🎉 No upcoming deadlines!</p>
            <small>You're all caught up</small>
          </div>
        ) : (
          <div className="deadlines-list">
            {filteredDeadlines.slice(0, 5).map((deadline) => (
              <div 
                key={deadline.id} 
                className="deadline-item"
                style={{ borderLeftColor: getPriorityColor(deadline.priority) }}
              >
                <div className="deadline-icon">
                  {getTypeIcon(deadline.type)}
                </div>
                
                <div className="deadline-content">
                  <div className="deadline-title">{deadline.title}</div>
                  <div className="deadline-course">{deadline.course}</div>
                  <div className="deadline-time">
                    {formatDate(deadline.dueDate)} at {deadline.dueTime}
                  </div>
                </div>
                
                <div className="deadline-status">
                  <div className="days-until">
                    {getDaysUntil(deadline.dueDate, deadline.dueTime)}
                  </div>
                  <div 
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(deadline.priority) }}
                  ></div>
                </div>
              </div>
            ))}
            
            {filteredDeadlines.length > 5 && (
              <div className="show-more">
                <button>View all {filteredDeadlines.length} deadlines</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="calendar-footer">
        <div className="last-updated">
          <span>🔄 Real-time updates active</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;