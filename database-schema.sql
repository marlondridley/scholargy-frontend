-- Database Schema for Scholargy Users Table
-- This should be run in your Azure CosmosDB SQL API

-- CosmosDB Container Schema for Scholargy Users
-- This should be created in your Azure CosmosDB account

-- Container: users
-- Partition Key: /email
-- Throughput: 400 RU/s (adjust based on your needs)

-- Document structure for users collection:
{
    "id": "unique-user-id",
    "email": "user@example.com",
    "name": "User Full Name",
    "img_url": "https://example.com/avatar.jpg",
    "provider": "google|email",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "profile": {
        "gpa": 3.8,
        "major": "Computer Science",
        "graduationYear": 2025,
        "school": "High School Name",
        "sat_score": 1400,
        "act_score": 30,
        "extracurriculars": ["Robotics Club", "Volunteer Work"],
        "essays": [],
        "recommendations": []
    },
    "preferences": {
        "collegeType": "public|private",
        "location": "in-state|out-of-state",
        "maxTuition": 50000,
        "desiredMajors": ["Computer Science", "Engineering"]
    }
}

-- Container: user_applications (for storing detailed user profiles)
-- Partition Key: /userId
-- Throughput: 400 RU/s

-- Document structure for user_applications collection:
{
    "id": "unique-application-id",
    "userId": "user-id",
    "email": "user@example.com",
    "profile": {
        "personal": {
            "firstName": "John",
            "lastName": "Doe",
            "dateOfBirth": "2006-05-15",
            "gender": "male",
            "citizenship": "US",
            "address": {
                "street": "123 Main St",
                "city": "Anytown",
                "state": "CA",
                "zipCode": "90210",
                "country": "USA"
            }
        },
        "academic": {
            "gpa": 3.8,
            "weightedGpa": 4.2,
            "classRank": 15,
            "totalStudents": 500,
            "sat_score": 1400,
            "act_score": 30,
            "ap_courses": ["AP Calculus BC", "AP Physics", "AP English"],
            "honors_courses": ["Honors Chemistry", "Honors Literature"],
            "currentSchool": "Anytown High School",
            "graduationYear": 2025
        },
        "extracurriculars": [
            {
                "name": "Robotics Club",
                "role": "Team Captain",
                "hoursPerWeek": 10,
                "weeksPerYear": 36,
                "description": "Led team to state championship"
            }
        ],
        "essays": [
            {
                "title": "Personal Statement",
                "content": "Essay content...",
                "wordCount": 650,
                "status": "draft|final"
            }
        ],
        "recommendations": [
            {
                "teacherName": "Dr. Smith",
                "subject": "Mathematics",
                "status": "requested|submitted",
                "submissionDate": "2024-01-15T00:00:00.000Z"
            }
        ]
        "financial": {
            "familyIncome": 75000,
            "financialAidNeeded": true,
            "scholarships": ["Merit Scholarship", "Need-based Grant"]
        }
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
}

-- Indexes for optimal query performance:
-- 1. Composite index on email and provider for user lookups
-- 2. Index on userId for application queries
-- 3. Index on created_at for time-based queries
-- 4. Index on profile.academic.gpa for GPA-based filtering
