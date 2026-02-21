# Quick Start Guide - EarthEnable Binary Referral System

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Android Studio (for mobile app) or Xcode (for iOS)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/binary-referral" > .env
echo "PORT=4000" >> .env

# Start development server
npm run dev
```

Backend will run on `http://localhost:4000`

### 2. Mobile App Setup

```bash
cd mobile/binaryReferralApp

# Install dependencies
npm install

# For Android
npm run android

# For iOS (Mac only)
cd ios && pod install && cd ..
npm run ios
```

## 📱 Using the Mobile App

### First Time Setup

1. **Register Root User** (First user in system)
   - Open app
   - Click "Register"
   - Fill in details (leave referral code empty)
   - Submit

2. **Register with Referral**
   - Get referral code from existing user
   - Click "Register"
   - Fill in details + referral code
   - Submit

3. **Login**
   - Enter phone number
   - Click "Login"

### Dashboard Features

- **Earnings Card**: View total, direct bonus, and pair bonus
- **Floor Status**: Check floor condition and community rating
- **Network Stats**: See matched pairs and leg totals
- **Growth Projection**: View 6-month earnings forecast
- **Share Referral**: Share your code with others

## 🔍 Testing the System

### Create Test Users

```bash
# Register root user
curl -X POST http://localhost:4000/api/users/register-root \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Root",
    "phone": "+256700000001",
    "floorSizeSqm": 15,
    "district": "Kampala"
  }'

# Copy the _id from response, then register with referral
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Recruit",
    "phone": "+256700000002",
    "floorSizeSqm": 15,
    "referredBy": "ALICE_ID_HERE",
    "district": "Kampala"
  }'
```

### Create Inspection

```bash
curl -X POST http://localhost:4000/api/inspections \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "inspectorName": "QA Team",
    "cleanlinessRating": 5,
    "structuralIntegrity": 5,
    "overallRating": 5,
    "notes": "Excellent condition"
  }'
```

### Create Endorsement

```bash
curl -X POST http://localhost:4000/api/endorsements \
  -H "Content-Type: application/json" \
  -d '{
    "endorsedUserId": "USER_ID_1",
    "endorserUserId": "USER_ID_2",
    "rating": 5,
    "comment": "Great neighbor!",
    "relationship": "neighbor"
  }'
```

### View Analytics

```bash
# System stats
curl http://localhost:4000/api/analytics/system

# Growth projection
curl http://localhost:4000/api/analytics/projection/USER_ID?months=6

# District stats
curl http://localhost:4000/api/analytics/districts

# Top earners
curl http://localhost:4000/api/analytics/top-earners?limit=10
```

## 🎯 Key Concepts

### Binary Tree Structure
- Each user can have 2 direct recruits (left and right)
- New recruits are automatically placed using BFS algorithm
- Balanced growth ensures fair earnings distribution

### Earnings Calculation

**Direct Bonus** (One-time):
```
Direct Bonus = Floor Size (sqm) × 250 UGX
Example: 15 sqm × 250 = 3,750 UGX per recruit
```

**Pair Bonus** (Ongoing):
```
Pair Bonus = Matched Pairs (sqm) × 1,000 UGX
Example: 15 sqm matched = 15,000 UGX
```

### Floor Status
- **Active**: Earning enabled, floor in good condition
- **Needs Inspection**: Due for QA visit
- **Suspended**: Earnings disabled due to poor floor condition (rating < 3)

### Community Rating
- Average of all endorsements received
- Builds trust and social proof
- Visible on dashboard

## 📊 Sample Growth Scenario

Starting with 2 direct recruits (15 sqm each):

| Month | Recruits | Pairs | Earnings | Cumulative |
|-------|----------|-------|----------|------------|
| 1 | 2 | 1 | 22,500 | 22,500 |
| 2 | 4 | 2 | 30,000 | 52,500 |
| 3 | 8 | 4 | 60,000 | 112,500 |
| 4 | 16 | 8 | 120,000 | 232,500 |
| 5 | 32 | 16 | 240,000 | 472,500 |
| 6 | 64 | 32 | 480,000 | 952,500 |

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh`
- Verify .env file exists with correct values
- Check port 4000 is not in use

### Mobile app won't connect
- Android emulator: Use `http://10.0.2.2:4000`
- iOS simulator: Use `http://localhost:4000`
- Physical device: Use your computer's IP address

### No earnings showing
- Check user's `earningsEnabled` field
- Verify `floorStatus` is "active"
- Ensure recruits are properly linked in tree

## 📚 Documentation

- [Backend API Reference](backend/API_REFERENCE.md)
- [System Enhancements](backend/SYSTEM_ENHANCEMENTS.md)
- [Referral System Logic](backend/REFERRAL_SYSTEM.md)
- [Mobile App README](mobile/binaryReferralApp/README.md)

## 🆘 Support

For issues or questions:
1. Check documentation above
2. Review API responses for error messages
3. Check backend logs for detailed errors
4. Verify data in MongoDB

## 🎉 Success Checklist

- [ ] Backend running on port 4000
- [ ] MongoDB connected
- [ ] Mobile app installed on device/emulator
- [ ] Root user registered
- [ ] Second user registered with referral
- [ ] Earnings showing on dashboard
- [ ] Inspection created successfully
- [ ] Endorsement created successfully
- [ ] Analytics endpoints returning data

---

**You're ready to transform customers into brand ambassadors! 🚀**
