# Network Tree Visualization Guide

## Overview

The Network Tree feature provides an interactive visual representation of your binary referral network, making it easy to understand your downline structure, track earnings, and identify growth opportunities.

## Accessing the Tree

1. Open the app and login
2. Navigate to the Dashboard
3. In the "Network Stats" section, tap the **"🌳 View Tree"** button
4. The Network Tree screen will open

## Understanding the Tree View

### Tree Structure

```
                    You (Root)
                   /          \
            Left Child      Right Child
           /        \       /        \
         L-L       L-R    R-L       R-R
```

The tree shows your binary network structure with:
- **You** at the top (root node)
- **Left leg** on the left side
- **Right leg** on the right side
- Each person can have up to 2 direct recruits

### Node Information

Each user card displays:

**Header:**
- Name (bold)
- Status indicator (colored dot)
  - 🟢 Green: Active & earning
  - 🟠 Orange: Needs inspection
  - 🔴 Red: Suspended

**Details:**
- Phone number
- Total earnings (UGX)
- Floor size (sqm)
- Left leg total (sqm)
- Matched pairs count
- Right leg total (sqm)
- Community rating (⭐ if available)

### Status Colors

- **Green**: Floor is active, earnings enabled
- **Orange**: Floor needs inspection
- **Red**: Floor suspended, earnings disabled

## Features

### 1. Adjustable Depth

At the top right, you'll see depth selector buttons: **2**, **3**, **4**

- **Depth 2**: Shows you + 2 levels (4 people max)
- **Depth 3**: Shows you + 3 levels (8 people max) - Default
- **Depth 4**: Shows you + 4 levels (16 people max)

Tap a number to change the depth. The tree will reload with the new depth.

### 2. Expand/Collapse Nodes

- Tap any user card to expand or collapse their children
- Useful for focusing on specific branches
- Collapsed nodes show a subtle indicator

### 3. Empty Slots

Empty positions are shown as dashed boxes with "Empty Slot" text:
```
┌─────────────────┐
│   Empty Slot    │
│  (Available)    │
└─────────────────┘
```

These indicate where new recruits can be placed.

### 4. Scrolling

- **Horizontal scroll**: Swipe left/right to see wide trees
- **Vertical scroll**: Swipe up/down to see deep trees
- Pinch to zoom (if supported)

## Use Cases

### 1. Track Network Growth

Quickly see:
- How many people are in each leg
- Which leg needs more recruits for balanced growth
- Total network size at a glance

### 2. Identify Opportunities

- Spot empty slots for new recruits
- See which branches are growing fastest
- Find users who might need support

### 3. Monitor Floor Status

- Quickly identify suspended users (red dots)
- See who needs inspection (orange dots)
- Celebrate active earners (green dots)

### 4. Understand Earnings

- See total earnings for each person
- Compare left vs right leg totals
- Identify high performers

### 5. Plan Recruitment

- Find optimal placement for new recruits
- Balance your legs for maximum pair bonuses
- Visualize growth potential

## Tips for Best Results

### Balanced Growth

For maximum earnings, aim to balance your legs:
```
Left Leg: 150 sqm    Right Leg: 150 sqm
         ↓                    ↓
    150 matched pairs = 150,000 UGX
```

Unbalanced legs create carry-over:
```
Left Leg: 200 sqm    Right Leg: 100 sqm
         ↓                    ↓
    100 matched pairs = 100,000 UGX
    100 sqm carry-over (left)
```

### Strategic Placement

- Place strong recruiters in empty slots
- Help downline members fill their slots
- Monitor and support struggling branches

### Regular Monitoring

- Check tree weekly to track growth
- Identify and address suspended floors
- Celebrate milestones with your team

## Performance Notes

### Loading Time

- Depth 2: Instant
- Depth 3: 1-2 seconds (recommended)
- Depth 4: 2-4 seconds (large networks)

### Data Usage

- Minimal data usage (JSON only)
- Cached for offline viewing (future)
- Pull to refresh for latest data

### Best Practices

1. **Start with Depth 3**: Good balance of detail and performance
2. **Use Depth 4 sparingly**: Only for detailed analysis
3. **Collapse branches**: Hide sections you're not analyzing
4. **Regular updates**: Pull to refresh for latest earnings

## Troubleshooting

### Tree won't load
- Check internet connection
- Verify you're logged in
- Try reducing depth to 2

### Missing users
- Increase depth to see more levels
- Expand collapsed nodes
- Refresh the tree

### Slow performance
- Reduce depth to 2 or 3
- Close other apps
- Restart the app

### Wrong data
- Pull down to refresh
- Check last update time
- Logout and login again

## Future Enhancements

Coming soon:
- [ ] Search for specific users
- [ ] Filter by status (active/suspended)
- [ ] Export tree as image
- [ ] Zoom and pan controls
- [ ] Highlight specific branches
- [ ] Show earnings trends
- [ ] Offline mode with sync

## Support

For issues or questions:
1. Check this guide
2. Review the main README
3. Contact support team

---

**Happy networking! 🌳**
