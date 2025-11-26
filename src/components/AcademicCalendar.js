import React, { useState, useEffect } from 'react';
import './AcademicCalendar.css';

const AcademicCalendar = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Mock academic events - in real app, this would come from API/DynamoDB
    const mockEvents = [
      {
        id: 1,
        title: 'CS202 Assignment Due',
        date: '2025-01-25',
        time: '23:59',
        type: 'assignment',
        course: 'CS202',
        priority: 'high',
        daysUntil: getDaysUntil('2025-01-25')
      },
      {
        id: 2,
        title: 'Registration Deadline',
        date: '2025-01-28',
        time: '17:00',
        type: 'deadline',
        course: 'Spring 2025',
        priority: 'medium',
        daysUntil: getDaysUntil('2025-01-28')
      },
      {
        id: 3,
        title: 'Library Book Return',
        date: '2025-01-30',
        time: '18:00',
        type: 'reminder',
        course: 'Library',
        priority: 'low',
        daysUntil: getDaysUntil('2025-01-30')
      },
      {
        id: 4,
        title: 'AI301 Midterm Exam',
        date: '2025-02-15',
        time: '14:00',
        type: 'exam',
        course: 'AI301',
        priority: 'high',
        daysUntil: getDaysUntil('2025-02-15')
      },
      {
        id: 5,
        title: 'Career Fair',
        date: '2025-02-20',
        time: '10:00',
        type: 'event',
        course: 'Career Services',
        priority: 'medium',
        daysUntil: getDaysUntil('2025-02-20')
      },
      {
        id: 6,
        title: 'Spring Break Begins',
        date: '2025-03-10',
        time: '00:00',
        type: 'holiday',
        course: 'Academic Calendar',
        priority: 'low',
        daysUntil: getDaysUntil('2025-03-10')
      }
    ];

    setEvents(mockEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
  }, []);

  function getDaysUntil(dateStr) {
    const today = new Date();
    const eventDate = new Date(dateStr);
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const getFilteredEvents = () => {
    if (selectedFilter === 'all') return events;
    return events.filter(event => event.type === selectedFilter);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'assignment': return '📝';
      case 'exam': return '📊';
      case 'deadline': return '⏰';
      case 'event': return '🎉';
      case 'reminder': return '🔔';
      case 'holiday': return '🏖️';
      default: return '📅';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#0ea5e9';
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
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const getDaysUntilText = (days) => {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const filteredEvents = getFilteredEvents().slice(0, 6);

  return (
    <div className="academic-calendar">
      <div className="calendar-header">
        <h3>📅 Upcoming Events</h3>
        <div className="calendar-filters">
          <button 
            className={selectedFilter === 'all' ? 'active' : ''} 
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          <button 
            className={selectedFilter === 'assignment' ? 'active' : ''} 
            onClick={() => setSelectedFilter('assignment')}
          >
            Tasks
          </button>
          <button 
            className={selectedFilter === 'exam' ? 'active' : ''} 
            onClick={() => setSelectedFilter('exam')}
          >
            Exams
          </button>
          <button 
            className={selectedFilter === 'event' ? 'active' : ''} 
            onClick={() => setSelectedFilter('event')}
          >
            Events
          </button>
        </div>
      </div>

      <div className="calendar-events">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <p>🎉 No upcoming events!</p>
            <small>You're all caught up</small>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className={`calendar-event ${event.daysUntil <= 1 ? 'urgent' : ''}`}
            >
              <div className="event-date">
                <div className="date-text">{formatDate(event.date)}</div>
                <div className="time-text">{event.time}</div>
              </div>
              
              <div className="event-content">
                <div className="event-header">
                  <span className="event-icon">{getEventIcon(event.type)}</span>
                  <h4 className="event-title">{event.title}</h4>
                </div>
                <div className="event-details">
                  <span className="event-course">{event.course}</span>
                  <div className="event-meta">
                    <span 
                      className="priority-dot" 
                      style={{ backgroundColor: getPriorityColor(event.priority) }}
                    ></span>
                    <span className="days-until">
                      {getDaysUntilText(event.daysUntil)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="calendar-footer">
        <button className="view-full-calendar">
          View Full Calendar
        </button>
      </div>
    </div>
  );
};

export default AcademicCalendar;