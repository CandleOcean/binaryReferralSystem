# Referral Tracking Explanation

## Understanding the Difference

### Binary Tree Position vs. Actual Referrer

In a binary referral system, there's an important distinction:

1. **Binary Tree Position** (`leftChild`, `rightChild`)
   - Where someone sits in the tree structure
   - Determined by BFS placement algorithm
   - May not be directly under their referrer

2. **Actual Referrer** (`leftReferredBy`, `rightReferredBy`)
   - Who actually recruited this person
   - Who gets the direct bonus
   - Tracked separately for accountability

## Example Scenario

```
        Alice (Root)
       /              \
   Bob (left)      Carol (right)
```

### Case 1: Alice recruits Bob and Carol
- Bob's `referredBy` = Alice
- Carol's `referredBy` = Alice
- Alice's `leftChild` = Bob
- Alice's `rightChild` = Carol
- Alice's `leftReferredBy` = Alice (she recruited her own left)
- Alice's `rightReferredBy` = Alice (she recruited her own right)

### Case 2: Bob recruits David, but David is placed under Carol

```
        Alice
       /      \
     Bob      Carol
             /
          David
```

- David's `referredBy` = Bob (Bob recruited him)
- Carol's `leftChild` = David (David sits under Carol in tree)
- Carol's `leftReferredBy` = Bob (Bob recruited Carol's left child)

## Why This Matters

### Direct Bonus
- Goes to the person in `referredBy` field
- Bob gets 250 UGX/sqm for recruiting David
- Even though David sits under Carol

### Pair Bonus
- Goes to everyone in the upline based on tree position
- Carol gets pair bonuses when David joins her left leg
- Alice gets pair bonuses from the entire tree growth

### Accountability
- `leftReferredBy` and `rightReferredBy` show who is actively recruiting
- Helps identify top recruiters
- Shows who is building whose team

## Database Fields

```typescript
{
  // Who recruited this user
  referredBy: ObjectId,
  
  // Binary tree structure
  leftChild: ObjectId,
  rightChild: ObjectId,
  
  // Who recruited my children (NEW!)
  leftReferredBy: ObjectId,  // Who recruited my left child
  rightReferredBy: ObjectId, // Who recruited my right child
}
```

## API Response Example

```json
{
  "name": "Alice",
  "referralCode": "ABC123",
  
  "leftChild": {
    "name": "Bob",
    "referralCode": "DEF456"
  },
  
  "leftReferredBy": {
    "name": "Alice",
    "referralCode": "ABC123"
  },
  
  "rightChild": {
    "name": "Carol",
    "referralCode": "GHI789"
  },
  
  "rightReferredBy": {
    "name": "Alice",
    "referralCode": "ABC123"
  }
}
```

This shows:
- Alice has Bob on her left and Carol on her right
- Alice recruited both of them herself
- If someone else recruited them, `leftReferredBy`/`rightReferredBy` would show that person

## Use Cases

1. **Commission Tracking**: Know exactly who earned what
2. **Team Building**: See who is actively recruiting
3. **Spillover Analysis**: Identify when placements don't match recruiters
4. **Performance Metrics**: Track individual recruiting performance
5. **Dispute Resolution**: Clear record of who recruited whom
