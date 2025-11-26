// Course Recommendation Engine
class RecommendationService {
  constructor() {
    // Course progression paths and prerequisites
    this.courseProgression = {
      'CS101': ['CS202', 'WEB220', 'DB250'],
      'CS202': ['AI301', 'DS201'],
      'IT201': ['DB250', 'CY101'],
      'CY101': ['AI301'],
      'WEB220': ['DS201'],
      'DB250': ['AI301', 'DS201']
    };

    // Course metadata for recommendations
    this.courseData = {
      'AI301': {
        name: 'Artificial Intelligence',
        difficulty: 'Advanced',
        popularity: 95,
        jobRelevance: 'High',
        prerequisites: ['CS101', 'CS202'],
        description: 'Machine learning and AI fundamentals',
        icon: '🤖'
      },
      'DB250': {
        name: 'Database Systems',
        difficulty: 'Intermediate',
        popularity: 88,
        jobRelevance: 'High',
        prerequisites: ['CS101'],
        description: 'SQL, NoSQL, and database design',
        icon: '💾'
      },
      'WEB220': {
        name: 'Web Development',
        difficulty: 'Intermediate',
        popularity: 92,
        jobRelevance: 'Very High',
        prerequisites: ['CS101'],
        description: 'Modern web technologies and frameworks',
        icon: '🌐'
      },
      'DS201': {
        name: 'Introduction to Data Science',
        difficulty: 'Intermediate',
        popularity: 85,
        jobRelevance: 'High',
        prerequisites: ['CS101'],
        description: 'Data analysis and visualization',
        icon: '📊'
      },
      'CY101': {
        name: 'Introduction to Cybersecurity',
        difficulty: 'Beginner',
        popularity: 78,
        jobRelevance: 'High',
        prerequisites: [],
        description: 'Security fundamentals and best practices',
        icon: '🔒'
      }
    };

    // Student program tracks
    this.programTracks = {
      'Computer Science': ['AI301', 'WEB220', 'DB250', 'DS201'],
      'Information Technology': ['DB250', 'CY101', 'WEB220'],
      'Cybersecurity': ['CY101', 'AI301', 'DB250'],
      'Data Science': ['DS201', 'AI301', 'DB250']
    };
  }

  // Get personalized course recommendations
  getRecommendations(student, enrolledCourses = [], availableCourses = []) {
    const recommendations = [];
    
    // Get progression-based recommendations
    const progressionRecs = this.getProgressionRecommendations(enrolledCourses);
    
    // Get program-based recommendations
    const programRecs = this.getProgramRecommendations(student.program || 'Computer Science');
    
    // Get GPA-based recommendations
    const gpaRecs = this.getGPABasedRecommendations(student.gpa || 3.8);
    
    // Combine and score recommendations
    const allRecs = [...progressionRecs, ...programRecs, ...gpaRecs];
    const scoredRecs = this.scoreRecommendations(allRecs, student, enrolledCourses);
    
    // Filter out already enrolled courses
    const enrolledCourseIds = enrolledCourses.map(c => c.course_id || c.courseId);
    const filteredRecs = scoredRecs.filter(rec => !enrolledCourseIds.includes(rec.courseId));
    
    // Return top 4 recommendations
    return filteredRecs.slice(0, 4);
  }

  // Get recommendations based on course progression
  getProgressionRecommendations(enrolledCourses) {
    const recommendations = [];
    
    enrolledCourses.forEach(course => {
      const courseId = course.course_id || course.courseId;
      const nextCourses = this.courseProgression[courseId] || [];
      
      nextCourses.forEach(nextCourseId => {
        if (this.courseData[nextCourseId]) {
          recommendations.push({
            courseId: nextCourseId,
            ...this.courseData[nextCourseId],
            reason: `Perfect next step after ${courseId}`,
            type: 'progression',
            score: 90
          });
        }
      });
    });
    
    return recommendations;
  }

  // Get recommendations based on student's program
  getProgramRecommendations(program) {
    const programCourses = this.programTracks[program] || this.programTracks['Computer Science'];
    
    return programCourses.map(courseId => ({
      courseId,
      ...this.courseData[courseId],
      reason: `Recommended for ${program} majors`,
      type: 'program',
      score: 75
    })).filter(rec => rec.name); // Filter out undefined courses
  }

  // Get recommendations based on GPA
  getGPABasedRecommendations(gpa) {
    const recommendations = [];
    
    if (gpa >= 3.5) {
      // High GPA students get advanced courses
      recommendations.push({
        courseId: 'AI301',
        ...this.courseData['AI301'],
        reason: `Your ${gpa} GPA qualifies you for advanced courses`,
        type: 'gpa',
        score: 85
      });
    }
    
    if (gpa >= 3.0) {
      // Good GPA students get popular courses
      recommendations.push({
        courseId: 'WEB220',
        ...this.courseData['WEB220'],
        reason: 'High job market demand',
        type: 'market',
        score: 80
      });
    }
    
    return recommendations;
  }

  // Score and rank recommendations
  scoreRecommendations(recommendations, student, enrolledCourses) {
    const scoredRecs = recommendations.map(rec => {
      let finalScore = rec.score || 70;
      
      // Boost score based on job relevance
      if (rec.jobRelevance === 'Very High') finalScore += 15;
      else if (rec.jobRelevance === 'High') finalScore += 10;
      
      // Boost score based on popularity
      finalScore += (rec.popularity || 70) * 0.1;
      
      // Check prerequisites
      const hasPrereqs = this.checkPrerequisites(rec.courseId, enrolledCourses);
      if (!hasPrereqs) finalScore -= 30;
      
      return {
        ...rec,
        finalScore,
        hasPrerequisites: hasPrereqs,
        matchPercentage: Math.min(Math.round(finalScore), 99)
      };
    });
    
    // Remove duplicates and sort by score
    const uniqueRecs = this.removeDuplicates(scoredRecs, 'courseId');
    return uniqueRecs.sort((a, b) => b.finalScore - a.finalScore);
  }

  // Check if student meets prerequisites
  checkPrerequisites(courseId, enrolledCourses) {
    const course = this.courseData[courseId];
    if (!course || !course.prerequisites) return true;
    
    const enrolledCourseIds = enrolledCourses.map(c => c.course_id || c.courseId);
    return course.prerequisites.every(prereq => enrolledCourseIds.includes(prereq));
  }

  // Remove duplicate recommendations
  removeDuplicates(array, key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  // Get mock enrolled courses for demo
  getMockEnrolledCourses(studentId) {
    const mockData = {
      'S1001': [
        { course_id: 'CS101', course_name: 'Introduction to Programming' },
        { course_id: 'CS202', course_name: 'Data Structures and Algorithms' }
      ],
      'S1002': [
        { course_id: 'IT201', course_name: 'Networking Fundamentals' }
      ],
      'S1003': [
        { course_id: 'CY101', course_name: 'Introduction to Cybersecurity' }
      ]
    };
    
    return mockData[studentId] || [
      { course_id: 'CS101', course_name: 'Introduction to Programming' }
    ];
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;