// backend/services/scholarship.js - Updated for MongoDB collection

const { getDB } = require('../db');

class scholarships {
  constructor() {
    this.collectionName = 'scholarships';
  }

  async searchScholarships(studentProfile) {
    try {
      const db = getDB();
      const collection = db.collection(this.collectionName);
      
      // Build MongoDB query based on student profile
      const query = this.buildMongoQuery(studentProfile);
      const pipeline = this.buildAggregationPipeline(studentProfile, query);
      
      console.log('Scholarship search query:', JSON.stringify(query, null, 2));
      
      // Execute aggregation pipeline
      const scholarships = await collection.aggregate(pipeline).toArray();
      
      // Calculate fit scores and add additional metadata
      const scoredScholarships = scholarships.map(scholarship => ({
        ...scholarship,
        fit_score: this.calculateFitScore(scholarship, studentProfile),
        days_until_deadline: this.calculateDaysUntilDeadline(scholarship),
        estimated_chance: this.estimateChance(scholarship, studentProfile),
        urgency_level: this.getUrgencyLevel(scholarship)
      }));

      // Sort by fit score and return top results
      return scoredScholarships
        .sort((a, b) => b.fit_score - a.fit_score)
        .slice(0, 50); // Limit to top 50 matches

    } catch (error) {
      console.error('Error searching scholarships:', error);
      throw new Error('Failed to search scholarships: ' + error.message);
    }
  }

  buildMongoQuery(profile) {
    const query = {
      'metadata.is_active': true,
      'application.deadline.date': { $gte: new Date() } // Only future deadlines
    };

    // Academic level filter
    if (profile.gradeLevel) {
      const academicLevel = this.mapGradeToAcademicLevel(profile.gradeLevel);
      query['matching_criteria.academic_levels'] = { $in: [academicLevel, 'any'] };
    }

    // GPA requirement filter
    if (profile.gpa) {
      const studentGPA = parseFloat(profile.gpa);
      query.$or = [
        { 'matching_criteria.academic_requirements.gpa_min': { $lte: studentGPA } },
        { 'matching_criteria.academic_requirements.gpa_min': { $exists: false } },
        { 'matching_criteria.academic_requirements.gpa_min': null }
      ];
    }

    // Test score requirements
    if (profile.satScore || profile.actScore) {
      const testQuery = { $or: [] };
      
      if (profile.satScore) {
        const satScore = parseInt(profile.satScore);
        testQuery.$or.push({
          $or: [
            { 'matching_criteria.academic_requirements.sat_min': { $lte: satScore } },
            { 'matching_criteria.academic_requirements.sat_min': { $exists: false } }
          ]
        });
      }
      
      if (profile.actScore) {
        const actScore = parseInt(profile.actScore);
        testQuery.$or.push({
          $or: [
            { 'matching_criteria.academic_requirements.act_min': { $lte: actScore } },
            { 'matching_criteria.academic_requirements.act_min': { $exists: false } }
          ]
        });
      }
      
      // If no test scores provided, include scholarships without test requirements
      testQuery.$or.push({
        'matching_criteria.academic_requirements.sat_min': { $exists: false },
        'matching_criteria.academic_requirements.act_min': { $exists: false }
      });
      
      query.$and = query.$and || [];
      query.$and.push(testQuery);
    }

    return query;
  }

  buildAggregationPipeline(profile, baseQuery) {
    const pipeline = [
      // Match basic criteria
      { $match: baseQuery },
      
      // Add computed fields
      {
        $addFields: {
          days_until_deadline: {
            $ceil: {
              $divide: [
                { $subtract: ['$application.deadline.date', new Date()] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          },
          award_amount_numeric: {
            $cond: {
              if: { $isNumber: '$award_info.funds.amount' },
              then: '$award_info.funds.amount',
              else: 0
            }
          }
        }
      },
      
      // Filter out past deadlines
      {
        $match: {
          days_until_deadline: { $gte: 0 }
        }
      },
      
      // Add interest matching score
      {
        $addFields: {
          interest_match_score: this.buildInterestMatchExpression(profile)
        }
      },
      
      // Sort by relevance
      {
        $sort: {
          interest_match_score: -1,
          award_amount_numeric: -1,
          days_until_deadline: 1
        }
      },
      
      // Limit results
      { $limit: 100 }
    ];

    return pipeline;
  }

  buildInterestMatchExpression(profile) {
    const interests = this.extractInterests(profile.extracurriculars || '');
    const fields = this.extractFieldsOfStudy(profile.apClasses || '');
    
    const matchConditions = [];
    
    // Interest-based matching
    interests.forEach(interest => {
      matchConditions.push({
        $cond: {
          if: { $in: [interest, '$search_data.keywords'] },
          then: 10,
          else: 0
        }
      });
    });
    
    // Field of study matching
    fields.forEach(field => {
      matchConditions.push({
        $cond: {
          if: { $in: [field, '$matching_criteria.fields_of_study'] },
          then: 15,
          else: 0
        }
      });
    });
    
    if (matchConditions.length === 0) {
      return { $literal: 1 }; // Default score if no matches
    }
    
    return { $add: matchConditions };
  }

  mapGradeToAcademicLevel(gradeLevel) {
    const mapping = {
      '9': 'high_school_freshman',
      '10': 'high_school_sophomore',
      '11': 'high_school_junior',
      '12': 'high_school_senior'
    };
    return mapping[gradeLevel] || 'high_school_senior';
  }

  extractInterests(extracurriculars) {
    const interests = [];
    const text = extracurriculars.toLowerCase();
    
    const interestMap = {
      'leadership': ['president', 'captain', 'leader', 'chair'],
      'athletics': ['soccer', 'football', 'basketball', 'sports', 'varsity', 'team'],
      'stem': ['robotics', 'science', 'engineering', 'math', 'computer', 'technology'],
      'community_service': ['volunteer', 'community', 'service', 'charity'],
      'arts': ['music', 'art', 'theater', 'drama', 'band', 'choir'],
      'academic': ['debate', 'quiz', 'honor', 'academic', 'scholar'],
      'writing': ['newspaper', 'journalism', 'writing', 'literary']
    };
    
    Object.entries(interestMap).forEach(([interest, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        interests.push(interest);
      }
    });
    
    return interests;
  }

  extractFieldsOfStudy(apClasses) {
    const fields = [];
    const text = apClasses.toLowerCase();
    
    const fieldMap = {
      'science': ['biology', 'chemistry', 'physics', 'environmental'],
      'mathematics': ['calculus', 'statistics', 'math'],
      'social_studies': ['history', 'government', 'psychology', 'geography'],
      'english': ['english', 'literature', 'language'],
      'technology': ['computer science', 'programming'],
      'arts': ['art', 'music theory', 'studio art'],
      'foreign_language': ['spanish', 'french', 'german', 'chinese', 'latin']
    };
    
    Object.entries(fieldMap).forEach(([field, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        fields.push(field);
      }
    });
    
    return fields;
  }

  calculateFitScore(scholarship, profile) {
    let score = 50; // Base score
    
    // GPA scoring (25 points)
    if (scholarship.matching_criteria?.academic_requirements?.gpa_min) {
      const requiredGPA = scholarship.matching_criteria.academic_requirements.gpa_min;
      const studentGPA = parseFloat(profile.gpa || 0);
      
      if (studentGPA >= requiredGPA) {
        score += 20;
        // Bonus for exceeding requirement
        const excess = studentGPA - requiredGPA;
        score += Math.min(5, excess * 10);
      } else {
        score -= 15; // Penalty for not meeting requirement
      }
    }
    
    // Test score scoring (20 points)
    if (scholarship.matching_criteria?.academic_requirements?.sat_min && profile.satScore) {
      const requiredSAT = scholarship.matching_criteria.academic_requirements.sat_min;
      const studentSAT = parseInt(profile.satScore);
      
      if (studentSAT >= requiredSAT) {
        score += 15;
        score += Math.min(5, (studentSAT - requiredSAT) / 50);
      } else {
        score -= 10;
      }
    }
    
    // Interest matching (15 points)
    if (scholarship.interest_match_score) {
      score += Math.min(15, scholarship.interest_match_score / 2);
    }
    
    // Award amount consideration (10 points)
    const amount = scholarship.award_info?.funds?.amount || 0;
    if (amount >= 5000) score += 10;
    else if (amount >= 2000) score += 7;
    else if (amount >= 1000) score += 5;
    
    // Deadline urgency penalty
    const daysUntil = scholarship.days_until_deadline || 0;
    if (daysUntil <= 7) score -= 5;
    else if (daysUntil <= 14) score -= 2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateDaysUntilDeadline(scholarship) {
    if (!scholarship.application?.deadline?.date) return 999;
    
    const deadline = new Date(scholarship.application.deadline.date);
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  estimateChance(scholarship, profile) {
    const fitScore = this.calculateFitScore(scholarship, profile);
    
    if (fitScore >= 90) return 'Very High';
    if (fitScore >= 75) return 'High';
    if (fitScore >= 60) return 'Medium';
    if (fitScore >= 40) return 'Low';
    return 'Very Low';
  }

  getUrgencyLevel(scholarship) {
    const days = scholarship.days_until_deadline || 999;
    
    if (days <= 7) return 'critical';
    if (days <= 14) return 'high';
    if (days <= 30) return 'medium';
    return 'low';
  }

  async getScholarshipStats(profile) {
    try {
      const scholarships = await this.searchScholarships(profile);
      
      return {
        total_available: scholarships.length,
        total_value: scholarships.reduce((sum, s) => sum + (s.award_info?.funds?.amount || 0), 0),
        high_match: scholarships.filter(s => s.fit_score >= 75).length,
        deadlines_soon: scholarships.filter(s => s.days_until_deadline <= 30).length,
        avg_amount: scholarships.length > 0 ? 
          Math.round(scholarships.reduce((sum, s) => sum + (s.award_info?.funds?.amount || 0), 0) / scholarships.length) : 0,
        renewable_count: scholarships.filter(s => s.award_info?.renewable === true).length,
        categories: await this.getTopCategories(scholarships)
      };
    } catch (error) {
      console.error('Error calculating scholarship stats:', error);
      throw error;
    }
  }

  async getTopCategories(scholarships) {
    const categoryCount = {};
    
    scholarships.forEach(scholarship => {
      const categories = scholarship.search_data?.categories || [];
      categories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  async getScholarshipById(id) {
    try {
      const db = getDB();
      const collection = db.collection(this.collectionName);
      
      const scholarship = await collection.findOne({ _id: id });
      
      if (!scholarship) {
        throw new Error('Scholarship not found');
      }
      
      return {
        ...scholarship,
        days_until_deadline: this.calculateDaysUntilDeadline(scholarship)
      };
    } catch (error) {
      console.error('Error fetching scholarship by ID:', error);
      throw error;
    }
  }

  async getScholarshipsByCategory(category, limit = 20) {
    try {
      const db = getDB();
      const collection = db.collection(this.collectionName);
      
      const query = {
        'metadata.is_active': true,
        'application.deadline.date': { $gte: new Date() },
        'search_data.categories': category
      };
      
      const scholarships = await collection
        .find(query)
        .sort({ 'award_info.funds.amount': -1 })
        .limit(limit)
        .toArray();
      
      return scholarships.map(scholarship => ({
        ...scholarship,
        days_until_deadline: this.calculateDaysUntilDeadline(scholarship)
      }));
    } catch (error) {
      console.error('Error fetching scholarships by category:', error);
      throw error;
    }
  }

  async getUpcomingDeadlines(days = 30) {
    try {
      const db = getDB();
      const collection = db.collection(this.collectionName);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);
      
      const scholarships = await collection
        .find({
          'metadata.is_active': true,
          'application.deadline.date': {
            $gte: new Date(),
            $lte: cutoffDate
          }
        })
        .sort({ 'application.deadline.date': 1 })
        .limit(10)
        .toArray();
      
      return scholarships.map(scholarship => ({
        ...scholarship,
        days_until_deadline: this.calculateDaysUntilDeadline(scholarship),
        urgency_level: this.getUrgencyLevel(scholarship)
      }));
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      throw error;
    }
  }

  async searchScholarshipsByText(searchText, studentProfile = null, limit = 20) {
    try {
      const db = getDB();
      const collection = db.collection(this.collectionName);
      
      const query = {
        'metadata.is_active': true,
        'application.deadline.date': { $gte: new Date() },
        $text: { $search: searchText }
      };
      
      const scholarships = await collection
        .find(query, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .toArray();
      
      if (studentProfile) {
        return scholarships.map(scholarship => ({
          ...scholarship,
          fit_score: this.calculateFitScore(scholarship, studentProfile),
          days_until_deadline: this.calculateDaysUntilDeadline(scholarship),
          estimated_chance: this.estimateChance(scholarship, studentProfile)
        }));
      }
      
      return scholarships.map(scholarship => ({
        ...scholarship,
        days_until_deadline: this.calculateDaysUntilDeadline(scholarship)
      }));
    } catch (error) {
      console.error('Error in text search:', error);
      throw error;
    }
  }
}

module.exports = new scholarships();