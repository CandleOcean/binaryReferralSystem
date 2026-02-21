# API Reference - Binary Referral System

Base URL: `http://localhost:4000`

## 👤 Users

### Register Root User (First User)
```http
POST /api/users/register-root
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+256700000000",
  "floorSizeSqm": 15,
  "district": "Kampala",
  "village": "Nakawa"
}
```

### Register with Referral
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "Jane Smith",
  "phone": "+256700000001",
  "floorSizeSqm": 15,
  "referredBy": "USER_ID_HERE",
  "district": "Kampala",
  "village": "Nakawa"
}
```

### Login by Phone
```http
GET /api/users/phone/:phone
```

### Get User by ID
```http
GET /api/users/:id
```

## 🔍 Inspections

### Create Inspection
```http
POST /api/inspections
Content-Type: application/json

{
  "userId": "USER_ID",
  "inspectorName": "Inspector Name",
  "cleanlinessRating": 5,
  "structuralIntegrity": 5,
  "overallRating": 5,
  "notes": "Floor in excellent condition",
  "photos": ["url1", "url2"],
  "actionRequired": false,
  "gpsCoordinates": {
    "latitude": 0.3476,
    "longitude": 32.5825
  }
}
```

**Rating Scale**: 1-5 stars
- 5: Excellent
- 4: Good
- 3: Acceptable (minimum for earnings)
- 2: Needs attention (suspends earnings)
- 1: Poor (suspends earnings)

### Get User Inspections
```http
GET /api/inspections/user/:userId
```

### Get Inspection Statistics
```http
GET /api/inspections/stats
```

Response:
```json
{
  "totalInspections": 150,
  "suspendedUsers": 5,
  "needsInspection": 20,
  "averageRatings": {
    "avgCleanliness": 4.2,
    "avgStructural": 4.5,
    "avgOverall": 4.3
  }
}
```

## ⭐ Endorsements

### Create Endorsement
```http
POST /api/endorsements
Content-Type: application/json

{
  "endorsedUserId": "USER_ID_TO_ENDORSE",
  "endorserUserId": "YOUR_USER_ID",
  "rating": 5,
  "comment": "Great neighbor, keeps floor very clean!",
  "relationship": "neighbor"
}
```

**Relationships**: neighbor, family, friend, downline, upline, other

### Get User Endorsements
```http
GET /api/endorsements/user/:userId
```

### Get Endorsement Statistics
```http
GET /api/endorsements/stats/:userId
```

Response:
```json
{
  "total": 15,
  "ratingBreakdown": {
    "5": 10,
    "4": 3,
    "3": 2,
    "2": 0,
    "1": 0
  },
  "relationshipBreakdown": {
    "neighbor": 8,
    "friend": 5,
    "family": 2
  }
}
```

## 📊 Analytics

### System Statistics
```http
GET /api/analytics/system
```

Response:
```json
{
  "users": {
    "total": 127,
    "active": 120,
    "suspended": 7
  },
  "floors": {
    "totalSqm": 1905,
    "totalRevenue": 45720000
  },
  "earnings": {
    "totalPaidOut": 952500,
    "companyRevenue": 44767500,
    "payoutPercentage": 2.08
  }
}
```

### Growth Projection
```http
GET /api/analytics/projection/:userId?months=6
```

Response:
```json
{
  "userId": "USER_ID",
  "userName": "John Doe",
  "currentEarnings": 22500,
  "projections": [
    {
      "month": 1,
      "newRecruits": 2,
      "totalDownline": 2,
      "newPairs": 1,
      "totalPairs": 1,
      "directBonus": 7500,
      "pairBonus": 15000,
      "monthlyEarnings": 22500,
      "cumulativeEarnings": 22500
    },
    // ... months 2-6
  ],
  "assumptions": {
    "avgFloorSize": 15,
    "directRecruitsPerMonth": 2,
    "pairBonusPerSqm": 1000,
    "directBonusPerSqm": 250
  }
}
```

### District Statistics
```http
GET /api/analytics/districts
```

Response:
```json
[
  {
    "district": "Kampala",
    "users": 45,
    "floorSqm": 675,
    "earnings": 350000,
    "avgRating": 4.3,
    "revenue": 16200000
  },
  // ... other districts
]
```

### Top Earners
```http
GET /api/analytics/top-earners?limit=10
```

Response:
```json
[
  {
    "_id": "USER_ID",
    "name": "John Doe",
    "phone": "+256700000000",
    "totalEarnings": 952500,
    "directBonus": 7500,
    "pairBonus": 945000,
    "district": "Kampala",
    "communityRating": 4.8
  },
  // ... other top earners
]
```

### Network Tree
```http
GET /api/analytics/tree/:userId?depth=3
```

Query Parameters:
- `depth`: Tree depth to fetch (default: 3, max recommended: 4)

Response:
```json
{
  "_id": "USER_ID",
  "name": "John Doe",
  "phone": "+256700000000",
  "floorSizeSqm": 15,
  "totalEarnings": 952500,
  "directBonus": 7500,
  "pairBonus": 945000,
  "leftLegSqm": 465,
  "rightLegSqm": 465,
  "matchedPairsSqm": 465,
  "floorStatus": "active",
  "communityRating": 4.8,
  "depth": 0,
  "leftChild": {
    "_id": "LEFT_CHILD_ID",
    "name": "Left Child",
    // ... same structure, depth: 1
    "leftChild": { /* ... */ },
    "rightChild": { /* ... */ }
  },
  "rightChild": {
    "_id": "RIGHT_CHILD_ID",
    "name": "Right Child",
    // ... same structure, depth: 1
    "leftChild": { /* ... */ },
    "rightChild": { /* ... */ }
  }
}
```

## 🏥 Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "Binary Referral API running 🚀"
}
```

## 📝 User Model Fields

```typescript
{
  // Basic Info
  name: string
  phone: string (unique)
  floorSizeSqm: number
  
  // Tree Structure
  referredBy: ObjectId
  leftChild: ObjectId
  rightChild: ObjectId
  
  // Earnings
  totalEarnings: number
  directBonus: number
  pairBonus: number
  earningsEnabled: boolean
  
  // Binary Tree Tracking
  leftLegSqm: number
  rightLegSqm: number
  matchedPairsSqm: number
  carryLeftSqm: number
  carryRightSqm: number
  
  // Floor Status
  floorStatus: "active" | "needs_inspection" | "suspended"
  lastInspectionDate: Date
  floorConditionRating: number (1-5)
  maintenanceNotes: string
  
  // Community
  communityRating: number (0-5)
  totalEndorsements: number
  
  // Location
  district: string
  village: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

## 💰 Constants

```typescript
FLOOR_PRICE_PER_SQM = 24,000 UGX
PAIR_BONUS_PER_SQM = 1,000 UGX
DIRECT_BONUS_PER_SQM = 250 UGX
AVERAGE_FLOOR_SIZE = 15 sqm
```

## 🔐 Error Responses

All endpoints return errors in this format:
```json
{
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Server Error
