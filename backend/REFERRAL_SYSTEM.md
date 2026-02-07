# Binary Referral System Implementation

## Overview
This system implements a binary referral structure where customers earn based on square meters (sqm) of floor sold in their network, not just per person recruited.

## Key Constants
- **Pair Bonus**: 1,000 UGX per sqm for complete pairs
- **Direct Bonus**: 250 UGX per sqm for direct recruits (one-time)
- **Average Floor Size**: 15 sqm

## How It Works

### 1. Binary Tree Structure
Every customer can have:
- **Left leg**: One recruit on the left side
- **Right leg**: One recruit on the right side

### 2. Earnings Types

#### Direct Bonus (One-Time)
- Earned only by the person who directly recruited someone
- 250 UGX per sqm
- Example: Recruit someone with 15 sqm floor → earn 3,750 UGX

#### Pair Bonus (Ongoing)
- Earned when you have matching sqm in both legs
- 1,000 UGX per sqm for matched pairs
- Earned by entire upline, not just direct recruiter
- Example: 15 sqm left + 15 sqm right = 15,000 UGX

### 3. Upline Propagation
When someone joins the network:
1. They are placed in the first available spot (BFS algorithm)
2. Their direct recruiter gets the direct bonus
3. ALL ancestors in the upline get pair bonuses based on leg growth

### 4. Carry-Over System
- **Left Carry**: Unmatched sqm in left leg
- **Right Carry**: Unmatched sqm in right leg
- These carry forward and match with future recruits

## Example Scenario

### Month 1: Alice recruits Bob and Carol
```
        Alice (15 sqm)
       /              \
   Bob (15 sqm)    Carol (15 sqm)
```

**Alice's Earnings:**
- Direct Bonus: 2 × 15 sqm × 250 = 7,500 UGX
- Pair Bonus: 1 pair × 15 sqm × 1,000 = 15,000 UGX
- **Total: 22,500 UGX**

### Month 2: Bob and Carol each recruit 2 people
```
        Alice
       /      \
     Bob      Carol
    /  \      /   \
   D    E    F     G
```

**Alice's Additional Earnings:**
- Direct Bonus: 0 (not her direct recruits)
- Pair Bonus: 2 pairs × 15 sqm × 1,000 = 30,000 UGX
- **Total: 30,000 UGX**

**Bob's Earnings:**
- Direct Bonus: 2 × 15 sqm × 250 = 7,500 UGX
- Pair Bonus: 1 pair × 15 sqm × 1,000 = 15,000 UGX
- **Total: 22,500 UGX**

## Database Schema

### User Model Fields

```typescript
{
  // Basic info
  name: String
  phone: String
  floorSizeSqm: Number
  
  // Tree structure
  referredBy: ObjectId        // Who recruited them
  leftChild: ObjectId         // Left leg recruit
  rightChild: ObjectId        // Right leg recruit
  
  // Leg totals (cumulative sqm)
  leftLegSqm: Number         // Total sqm in left leg
  rightLegSqm: Number        // Total sqm in right leg
  
  // Pair tracking
  matchedPairsSqm: Number    // Total sqm already paid as pairs
  carryLeftSqm: Number       // Unmatched sqm in left leg
  carryRightSqm: Number      // Unmatched sqm in right leg
  
  // Earnings
  directBonus: Number        // Total from direct recruits
  pairBonus: Number          // Total from pairs
  totalEarnings: Number      // directBonus + pairBonus
}
```

## API Functions

### `registerWithReferral()`
Registers a new user and handles all referral logic:
- Places user in binary tree
- Awards direct bonus to recruiter
- Updates entire upline with pair bonuses
- Tracks carry-over

### `getUserStats(userId)`
Returns complete statistics for a user:
- Leg totals
- Pair counts
- Earnings breakdown
- Tree relationships

### `getDownlineTree(userId, depth)`
Returns visual tree structure of downline

### `calculatePotentialEarnings(directRecruits, avgFloorSizeSqm, months)`
Projects potential earnings over time

## 6-Month Projection (2 Direct Recruits)

| Month | Direct | Downline | Pairs | Pair Earnings | Direct Bonus | Total      |
|-------|--------|----------|-------|---------------|--------------|------------|
| 1     | 2      | 2        | 1     | 15,000        | 7,500        | 22,500     |
| 2     | 0      | 4        | 2     | 30,000        | 0            | 30,000     |
| 3     | 0      | 8        | 4     | 60,000        | 0            | 60,000     |
| 4     | 0      | 16       | 8     | 120,000       | 0            | 120,000    |
| 5     | 0      | 32       | 16    | 240,000       | 0            | 240,000    |
| 6     | 0      | 64       | 32    | 480,000       | 0            | 480,000    |

**Grand Total: 952,500 UGX**

## Key Implementation Details

### Automatic Placement
Uses breadth-first search (BFS) to find the first available spot in the tree, ensuring balanced growth.

### Upline Update Algorithm
```typescript
1. Start at placement parent
2. Add sqm to appropriate leg (left or right)
3. Calculate new pairs: min(leftLeg, rightLeg) - matchedPairs
4. Award pair bonus if new pairs exist
5. Update carry-over values
6. Move up to next parent
7. Repeat until root
```

### Why This Works
- **Scalable**: Handles unlimited depth
- **Fair**: Everyone in upline benefits from growth
- **Transparent**: All earnings tracked separately
- **Accurate**: Carry-over ensures no sqm is lost

## Testing

Run the example simulation:
```typescript
import { simulateGrowthScenario, showPotentialEarnings } from './referral.example.js'

// Simulate actual registrations
await simulateGrowthScenario()

// Show projections
showPotentialEarnings()
```

## Notes

- The 1,000 UGX/sqm pair bonus is conservative and can be increased
- System tracks everything in sqm, not just people count
- Direct bonus is one-time, pair bonus is ongoing
- All ancestors benefit from network growth
