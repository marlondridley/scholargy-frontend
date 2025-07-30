# API Services - Modular Structure

This directory contains modular API services organized by functionality. Each module handles specific API endpoints and provides clean, reusable functions.

## 📁 Module Structure

```
api/
├── index.js          # Main exports (import all modules)
├── rag.js           # RAG (Retrieval-Augmented Generation) functions
├── institutions.js  # Institution and college data functions
├── profile.js       # Profile and assessment functions
├── probability.js   # Probability calculation functions
└── README.md        # This documentation
```

## 🚀 Usage

### Import All Functions
```javascript
import { 
  sendRagQuery, 
  searchInstitutions, 
  getProfileAssessment,
  calculateProbabilities 
} from '../services/api';
```

### Import Specific Modules
```javascript
import { sendRagQuery, getTopMatches } from '../services/api/rag.js';
import { searchInstitutions } from '../services/api/institutions.js';
```

## 📋 API Modules

### 🤖 RAG Module (`rag.js`)
AI-powered question answering and recommendations.

**Functions:**
- `sendRagQuery(question, history)` - Send questions to RAG system
- `getTopMatches(profile)` - Get AI-recommended college matches
- `getScholarshipSummary(profile)` - Get scholarship recommendations
- `checkRagHealth()` - Check RAG service health

**Example:**
```javascript
const response = await sendRagQuery("What are the admission requirements for Stanford?", []);
console.log(response.answer);
```

### 🏫 Institutions Module (`institutions.js`)
College and institution data management.

**Functions:**
- `searchInstitutions(searchConfig)` - Search colleges with filters
- `getInstitutionDetails(unitId)` - Get detailed college information
- `getInstitutionsByIds(unitIds)` - Get multiple colleges by IDs
- `getInstitutionsByFilters(filters, pagination)` - Advanced search

**Example:**
```javascript
const colleges = await searchInstitutions({
  filters: { "general_info.name": { $regex: "Stanford", $options: 'i' } }
});
```

### 👤 Profile Module (`profile.js`)
Student profile and assessment management.

**Functions:**
- `getProfileAssessment(profileData)` - Get AI assessment
- `saveProfile(profileData)` - Save student profile
- `getProfile(profileId)` - Get profile by ID
- `updateProfile(profileId, profileData)` - Update profile
- `deleteProfile(profileId)` - Delete profile

**Example:**
```javascript
const assessment = await getProfileAssessment({
  gpa: 3.8,
  satScore: 1500,
  extracurriculars: "Student Council, Debate Team"
});
```

### 📊 Probability Module (`probability.js`)
Admission probability calculations and what-if scenarios.

**Functions:**
- `calculateProbabilities(studentProfile, collegeIds)` - Calculate admission chances
- `calculateWhatIfScenarios(baseProfile, scenarios, collegeId)` - What-if analysis
- `getCollegeProbabilityStats(collegeId)` - Get college statistics
- `compareCollegeProbabilities(studentProfile, collegeIds)` - Compare colleges
- `getProbabilityTrends(collegeId, years)` - Historical trends

**Example:**
```javascript
const probabilities = await calculateProbabilities(studentProfile, [123456, 789012]);
console.log(probabilities.results);
```

## 🔧 Error Handling

All functions include comprehensive error handling:

```javascript
try {
  const result = await sendRagQuery("How do I apply to college?");
  console.log(result.answer);
} catch (error) {
  console.error("API Error:", error.message);
  // Handle error gracefully
}
```

## 🛡️ Features

- **Consistent Error Handling** - All functions return meaningful error messages
- **Type Safety** - Clear parameter and return type documentation
- **Fallback Responses** - Graceful degradation when services are unavailable
- **Caching Support** - Built-in caching for performance
- **Modular Design** - Easy to maintain and extend

## 🔄 Migration from Old API

The old `api.js` file has been split into modules. Update your imports:

**Before:**
```javascript
import { searchInstitutions } from '../services/api';
```

**After:**
```javascript
import { searchInstitutions } from '../services/api';
// OR
import { searchInstitutions } from '../services/api/institutions.js';
```

## 📈 Benefits

1. **Better Organization** - Related functions grouped together
2. **Easier Maintenance** - Smaller, focused files
3. **Improved Testing** - Test individual modules
4. **Better Documentation** - Clear module boundaries
5. **Scalability** - Easy to add new modules
6. **Code Reusability** - Import only what you need

## 🚀 Adding New Modules

To add a new API module:

1. Create `newModule.js` in the `api/` directory
2. Export your functions
3. Add export to `index.js`
4. Update this README

Example:
```javascript
// api/newModule.js
export const newFunction = async (params) => {
  // Implementation
};

// api/index.js
export * from './newModule.js';
``` 