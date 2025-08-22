// src/utils/dashboardHelpers.js
// Comprehensive dashboard helper with CosmosDB integration and Azure OpenAI

/**
 * Main dashboard data fetcher and processor
 * Fetches all data from CosmosDB and generates insights using Azure OpenAI
 */
export async function getDashboardData(userId, profile = null) {
  try {
    // Validate inputs
    if (!userId) {
      console.warn('No userId provided to getDashboardData');
      return getFallbackData(profile);
    }

    console.log('Fetching dashboard data for userId:', userId);

    // Fetch all required data in parallel with individual error handling
    const [studentProfile, collegeMatches, scholarships, careerInsights] = await Promise.allSettled([
      fetchStudentProfile(userId, profile),
      fetchCollegeMatches(userId),
      fetchScholarships(userId, profile),
      fetchCareerInsights(userId, profile)
    ]);

    // Extract results with fallbacks
    const studentProfileResult = studentProfile.status === 'fulfilled' ? studentProfile.value : profile;
    const collegeMatchesResult = collegeMatches.status === 'fulfilled' ? collegeMatches.value : [];
    const scholarshipsResult = scholarships.status === 'fulfilled' ? scholarships.value : { totalEligibleAmount: 0, opportunities: [] };
    const careerInsightsResult = careerInsights.status === 'fulfilled' ? careerInsights.value : '';

    console.log('Dashboard data fetched:', {
      hasProfile: !!studentProfileResult,
      collegeCount: collegeMatchesResult.length,
      scholarshipCount: scholarshipsResult.opportunities?.length || 0,
      hasCareerInsights: !!careerInsightsResult
    });

    // Generate AI-powered insights
    const insights = await generateAIInsights(studentProfileResult, collegeMatchesResult, scholarshipsResult);

    return {
      studentProfile: studentProfileResult,
      topColleges: collegeMatchesResult,
      scholarships: scholarshipsResult,
      careerInsights: careerInsightsResult,
      actionPlan: insights.actionPlan,
      admissionProbabilities: insights.probabilities,
      userStats: calculateUserStats(studentProfileResult),
      context: insights.context
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return getFallbackData(profile);
  }
}

/**
 * Fetch student profile from CosmosDB
 */
async function fetchStudentProfile(userId, profile = null) {
  if (profile) return profile;
  
  try {
    console.log('Fetching student profile for userId:', userId);
    const response = await fetch(`/api/profile/${userId}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Student profile fetched:', data);
      return data.profile || data;
    } else {
      console.warn('Failed to fetch student profile:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('Failed to fetch student profile:', error);
  }
  
  return null;
}

/**
 * Fetch college matches from CosmosDB
 */
async function fetchCollegeMatches(userId) {
  try {
    console.log('Fetching college matches for userId:', userId);
    // First try to get cached matches
    const response = await fetch(`/api/dashboard/top-matches?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      console.log('College matches fetched:', data.results?.length || 0, 'matches');
      return data.results || [];
    } else {
      console.warn('Failed to fetch college matches:', response.status, response.statusText);
    }
  } catch (error) {
    console.warn('Failed to fetch college matches:', error);
  }
  
  return [];
}

/**
 * Fetch scholarships from CosmosDB
 */
async function fetchScholarships(userId, profile = null) {
  try {
    const response = await fetch(`/api/dashboard/scholarship-stats?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      return {
        totalEligibleAmount: data.totalEligibleAmount || 0,
        opportunities: data.opportunities || []
      };
    }
  } catch (error) {
    console.warn('Failed to fetch scholarships:', error);
  }
  
  return { totalEligibleAmount: 0, opportunities: [] };
}

/**
 * Fetch career insights using RAG
 */
async function fetchCareerInsights(userId, profile = null) {
  if (!profile) return '';
  
  try {
    const response = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: "What career insights and recommendations can you provide for this student?",
        context: { studentProfile: profile }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.text || '';
    }
  } catch (error) {
    console.warn('Failed to fetch career insights:', error);
  }
  
  return '';
}

/**
 * Generate AI-powered insights using Azure OpenAI
 */
async function generateAIInsights(studentProfile, collegeMatches, scholarships) {
  try {
    const response = await fetch('/api/dashboard/next-steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentProfile,
        collegeMatches,
        scholarships: scholarships.opportunities || [],
        userId: studentProfile?.userId
      })
    });

    if (response.ok) {
      const data = await response.json();
      return {
        actionPlan: data.nextSteps || [],
        probabilities: calculateProbabilities(studentProfile, collegeMatches),
        context: data.context || {}
      };
    }
  } catch (error) {
    console.warn('Failed to generate AI insights:', error);
  }

  // Fallback calculations
  return {
    actionPlan: generateFallbackActionPlan(studentProfile, scholarships),
    probabilities: calculateProbabilities(studentProfile, collegeMatches),
    context: {}
  };
}

/**
 * Calculate user statistics based on profile data
 */
export function calculateUserStats(profile) {
  if (!profile) {
    return {
      profileScore: 0,
      recommendationLevel: 'Incomplete',
      completionPercentage: 0,
      strengths: [],
      areasForImprovement: [],
      gpaPercentile: 0,
      satPercentile: 0
    };
  }

  // Calculate profile completion percentage
  const requiredFields = ['gpa', 'satScore', 'gradeLevel', 'extracurriculars', 'career_goals'];
  const completedFields = requiredFields.filter(field => {
    const value = profile[field];
    return value && value.toString().trim() !== '' && value !== 'N/A';
  });
  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

  // Calculate profile score (0-100)
  let profileScore = 0;
  
  // GPA contribution (0-30 points)
  if (profile.gpa) {
    const gpa = parseFloat(profile.gpa);
    if (gpa >= 4.0) profileScore += 30;
    else if (gpa >= 3.8) profileScore += 25;
    else if (gpa >= 3.5) profileScore += 20;
    else if (gpa >= 3.0) profileScore += 15;
    else if (gpa >= 2.5) profileScore += 10;
    else profileScore += 5;
  }

  // SAT Score contribution (0-30 points)
  if (profile.satScore) {
    const sat = parseInt(profile.satScore);
    if (sat >= 1500) profileScore += 30;
    else if (sat >= 1400) profileScore += 25;
    else if (sat >= 1300) profileScore += 20;
    else if (sat >= 1200) profileScore += 15;
    else if (sat >= 1100) profileScore += 10;
    else profileScore += 5;
  }

  // Extracurriculars contribution (0-20 points)
  if (profile.extracurriculars) {
    const activities = profile.extracurriculars.split(',').length;
    profileScore += Math.min(activities * 2, 20);
  }

  // Career goals contribution (0-20 points)
  if (profile.career_goals) {
    profileScore += 20;
  }

  // Determine recommendation level
  let recommendationLevel = 'Incomplete';
  if (profileScore >= 80) recommendationLevel = 'Excellent';
  else if (profileScore >= 60) recommendationLevel = 'Good';
  else if (profileScore >= 40) recommendationLevel = 'Fair';
  else if (profileScore >= 20) recommendationLevel = 'Needs Improvement';

  // Calculate percentiles
  const gpaPercentile = profile.gpa ? Math.min(Math.round((parseFloat(profile.gpa) / 4.0) * 100), 100) : 0;
  const satPercentile = profile.satScore ? Math.min(Math.round((parseInt(profile.satScore) / 1600) * 100), 100) : 0;

  // Identify strengths and areas for improvement
  const strengths = [];
  const areasForImprovement = [];

  if (profile.gpa && parseFloat(profile.gpa) >= 3.5) {
    strengths.push('Strong Academic Performance');
  } else {
    areasForImprovement.push('Improve GPA');
  }

  if (profile.satScore && parseInt(profile.satScore) >= 1300) {
    strengths.push('High Test Scores');
  } else {
    areasForImprovement.push('Consider SAT/ACT Prep');
  }

  if (profile.extracurriculars) {
    strengths.push('Active in Extracurriculars');
  } else {
    areasForImprovement.push('Add Extracurricular Activities');
  }

  if (profile.career_goals) {
    strengths.push('Clear Career Goals');
  } else {
    areasForImprovement.push('Define Career Goals');
  }

  return {
    profileScore,
    recommendationLevel,
    completionPercentage,
    strengths,
    areasForImprovement,
    gpaPercentile,
    satPercentile
  };
}

/**
 * Calculate admission probabilities for colleges based on user profile
 */
export function calculateProbabilities(profile, colleges) {
  if (!profile || !colleges || colleges.length === 0) {
    return {};
  }

  const probabilities = {};

  colleges.forEach(college => {
    let base = 50; // start at 50%

    // Adjust based on GPA
    if (profile.gpa && college.avgGPA) {
      const diff = parseFloat(profile.gpa) - college.avgGPA;
      base += diff * 10; // 0.1 GPA = ±1%
    } else if (profile.gpa && college.admission_rate) {
      // Fallback to admission rate-based calculation
      const gpa = parseFloat(profile.gpa);
      const admissionRate = college.admission_rate * 100;
      
      if (gpa >= 4.0) base += 30;
      else if (gpa >= 3.8) base += 25;
      else if (gpa >= 3.5) base += 20;
      else if (gpa >= 3.0) base += 15;
      else if (gpa >= 2.5) base += 10;
      else base += 5;

      // Adjust based on admission rate
      if (admissionRate < 10) base -= 20; // Very selective
      else if (admissionRate < 25) base -= 10; // Selective
      else if (admissionRate > 80) base += 10; // Less selective
    }

    // Adjust based on SAT
    if (profile.satScore && college.avgSAT) {
      const diff = parseInt(profile.satScore) - college.avgSAT;
      base += diff / 20; // 20 points = ±1%
    } else if (profile.satScore && college.sat_scores) {
      // Fallback to SAT scores comparison
      const sat = parseInt(profile.satScore);
      const avgSat = college.sat_scores.average || 1200;
      
      if (sat >= avgSat + 200) base += 20;
      else if (sat >= avgSat + 100) base += 15;
      else if (sat >= avgSat) base += 10;
      else if (sat >= avgSat - 100) base += 5;
      else base -= 10;
    }

    // Extracurriculars factor
    if (profile.extracurriculars) {
      const activities = profile.extracurriculars.split(',').length;
      base += Math.min(activities * 2, 10);
    }

    // Career goals alignment
    if (profile.career_goals && college.popular_majors) {
      const careerGoal = profile.career_goals.toLowerCase();
      const popularMajors = college.popular_majors.map(major => major.toLowerCase());
      
      if (popularMajors.some(major => careerGoal.includes(major) || major.includes(careerGoal))) {
        base += 10;
      }
    }

    // Clamp probability between 5% and 95%
    const probability = Math.min(Math.max(Math.round(base), 5), 95);

    // Categorize likelihood
    let likelihood = 'target';
    if (probability >= 70) likelihood = 'safety';
    else if (probability >= 40) likelihood = 'target';
    else likelihood = 'reach';

    probabilities[college.unitid || college._id] = {
      probability,
      likelihood,
      factors: {
        gpa: profile.gpa ? parseFloat(profile.gpa) : null,
        sat: profile.satScore ? parseInt(profile.satScore) : null,
        extracurriculars: profile.extracurriculars ? profile.extracurriculars.split(',').length : 0,
        careerGoals: !!profile.career_goals
      }
    };
  });

  return probabilities;
}

/**
 * Generate fallback action plan when AI is unavailable
 */
function generateFallbackActionPlan(profile, scholarships) {
  const actions = [];

  if (profile && profile.gpa) {
    actions.push({
      task: `Complete your college applications early. With your ${profile.gpa} GPA, focus on schools where you're a strong candidate.`,
      priority: 'high',
      dueDate: 'ASAP'
    });
  } else {
    actions.push({
      task: "Complete your college applications early to meet deadlines and maximize your chances of admission.",
      priority: 'high',
      dueDate: 'ASAP'
    });
  }

  if (scholarships && scholarships.opportunities && scholarships.opportunities.length > 0) {
    const totalAmount = scholarships.totalEligibleAmount;
    actions.push({
      task: `Apply for scholarships immediately. You have access to $${totalAmount.toLocaleString()} in potential funding with ${scholarships.opportunities.length} opportunities.`,
      priority: 'high',
      dueDate: 'ASAP'
    });
  } else {
    actions.push({
      task: "Research and apply for scholarships that match your academic profile and career goals.",
      priority: 'medium',
      dueDate: 'This week'
    });
  }

  if (profile && (!profile.satScore || profile.satScore === 'N/A')) {
    actions.push({
      task: "Register for and prepare for the SAT/ACT to strengthen your college applications.",
      priority: 'medium',
      dueDate: 'Next month'
    });
  } else {
    actions.push({
      task: "Continue building your extracurricular activities and leadership experience to strengthen your applications.",
      priority: 'medium',
      dueDate: 'Ongoing'
    });
  }

  return actions;
}

/**
 * Get fallback data when all else fails
 */
function getFallbackData(profile) {
  return {
    studentProfile: profile,
    topColleges: [],
    scholarships: { totalEligibleAmount: 0, opportunities: [] },
    careerInsights: '',
    actionPlan: generateFallbackActionPlan(profile, { totalEligibleAmount: 0, opportunities: [] }),
    admissionProbabilities: {},
    userStats: calculateUserStats(profile),
    context: {}
  };
}

/**
 * Get confidence level based on profile completeness and scores
 */
export function getConfidenceLevel(userProfile) {
  if (!userProfile) {
    return { level: 'Incomplete', color: 'text-red-600', bgColor: 'bg-red-100', icon: '!' };
  }

  const stats = calculateUserStats(userProfile);
  const completeness = stats.completionPercentage;

  if (completeness >= 80 && stats.profileScore >= 70) {
    return { level: 'On Track', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✓' };
  } else if (completeness >= 60 && stats.profileScore >= 50) {
    return { level: 'Getting There', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚠' };
  } else {
    return { level: 'Needs Action', color: 'text-red-600', bgColor: 'bg-red-100', icon: '!' };
  }
}

/**
 * Get dynamic greeting based on time of day
 */
export function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate days until deadline
 */
export function getDaysUntilDeadline(deadline) {
  if (!deadline) return null;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get deadline urgency color
 */
export function getDeadlineColor(daysLeft) {
  if (daysLeft <= 7) return 'text-red-600 bg-red-100';
  if (daysLeft <= 30) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
}
