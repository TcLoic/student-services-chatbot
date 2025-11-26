import { fetchAuthSession } from '@aws-amplify/auth';

class CalendarService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.deadlines = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize WebSocket connection for real-time updates
  async initializeRealTime(studentId) {
    try {
      const session = await fetchAuthSession();
      const credentials = session.credentials;
      
      if (!credentials) throw new Error("No credentials available");

      // In production, this would be your API Gateway WebSocket URL
      const wsUrl = `wss://your-websocket-api.execute-api.us-east-1.amazonaws.com/prod?studentId=${studentId}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('📡 Real-time calendar connection established');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealTimeUpdate(data);
      };
      
      this.ws.onclose = () => {
        console.log('📡 Real-time connection closed');
        this.attemptReconnect(studentId);
      };
      
      this.ws.onerror = (error) => {
        console.error('📡 WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
      // Fallback to polling
      this.startPolling(studentId);
    }
  }

  // Handle real-time updates from WebSocket
  handleRealTimeUpdate(data) {
    switch (data.type) {
      case 'DEADLINE_ADDED':
        this.addDeadline(data.deadline);
        break;
      case 'DEADLINE_UPDATED':
        this.updateDeadline(data.deadline);
        break;
      case 'DEADLINE_REMOVED':
        this.removeDeadline(data.deadlineId);
        break;
      case 'ASSIGNMENT_GRADED':
        this.markDeadlineCompleted(data.assignmentId);
        break;
      default:
        console.log('Unknown update type:', data.type);
    }
    
    // Notify all listeners
    this.notifyListeners();
  }

  // Fetch deadlines from DynamoDB
  async fetchDeadlines(studentId) {
    try {
      const session = await fetchAuthSession();
      const credentials = session.credentials;

      if (!credentials) throw new Error("No credentials available");

      // In production, this would call your Lambda function via API Gateway
      const response = await fetch(`/api/deadlines/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${session.tokens.idToken.toString()}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch deadlines');
      
      const data = await response.json();
      this.deadlines = data.deadlines || [];
      
      return this.deadlines;
      
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      // Return mock data for development
      return this.getMockDeadlines(studentId);
    }
  }

  // Mock data for development/testing
  getMockDeadlines(studentId) {
    const now = new Date();
    const mockDeadlines = [
      {
        id: '1',
        studentId,
        title: 'CS202 Assignment Due',
        course: 'Data Structures',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: '23:59',
        type: 'assignment',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '2',
        studentId,
        title: 'Registration Deadline',
        course: 'Spring 2025',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: '17:00',
        type: 'registration',
        status: 'pending',
        priority: 'medium'
      },
      {
        id: '3',
        studentId,
        title: 'AI301 Midterm Exam',
        course: 'Artificial Intelligence',
        dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: '14:00',
        type: 'exam',
        status: 'pending',
        priority: 'high'
      },
      {
        id: '4',
        studentId,
        title: 'Library Book Return',
        course: 'Library Services',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        dueTime: '18:00',
        type: 'library',
        status: 'pending',
        priority: 'low'
      }
    ];

    this.deadlines = mockDeadlines;
    return mockDeadlines;
  }

  // Add new deadline
  addDeadline(deadline) {
    this.deadlines.push(deadline);
    this.sortDeadlines();
  }

  // Update existing deadline
  updateDeadline(updatedDeadline) {
    const index = this.deadlines.findIndex(d => d.id === updatedDeadline.id);
    if (index !== -1) {
      this.deadlines[index] = updatedDeadline;
      this.sortDeadlines();
    }
  }

  // Remove deadline
  removeDeadline(deadlineId) {
    this.deadlines = this.deadlines.filter(d => d.id !== deadlineId);
  }

  // Mark deadline as completed
  markDeadlineCompleted(assignmentId) {
    const deadline = this.deadlines.find(d => d.assignmentId === assignmentId);
    if (deadline) {
      deadline.status = 'completed';
    }
  }

  // Sort deadlines by due date
  sortDeadlines() {
    this.deadlines.sort((a, b) => {
      const dateA = new Date(`${a.dueDate} ${a.dueTime}`);
      const dateB = new Date(`${b.dueDate} ${b.dueTime}`);
      return dateA - dateB;
    });
  }

  // Get upcoming deadlines (next 30 days)
  getUpcomingDeadlines(days = 30) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.deadlines.filter(deadline => {
      const dueDate = new Date(`${deadline.dueDate} ${deadline.dueTime}`);
      return dueDate >= now && dueDate <= futureDate && deadline.status === 'pending';
    });
  }

  // Subscribe to deadline updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of updates
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.deadlines));
  }

  // Fallback polling for when WebSocket fails
  startPolling(studentId, interval = 30000) {
    setInterval(async () => {
      try {
        await this.fetchDeadlines(studentId);
        this.notifyListeners();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);
  }

  // Attempt to reconnect WebSocket
  attemptReconnect(studentId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`📡 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeRealTime(studentId);
      }, 1000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
    } else {
      console.log('📡 Max reconnection attempts reached, switching to polling');
      this.startPolling(studentId);
    }
  }

  // Cleanup
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
export default calendarService;