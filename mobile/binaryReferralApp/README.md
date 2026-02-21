# Binary Referral Mobile App

A React Native mobile application for the Binary Referral System that allows users to earn from their network growth through a binary tree structure.

## Features

### 🔐 Authentication
- **Login Screen**: Phone-based authentication
- **Register Screen**: Sign up with referral code support
- User context management for persistent sessions

### 📊 Dashboard
- **Earnings Overview**: Display total earnings with breakdown
  - Direct Bonus: 250 UGX per sqm for direct recruits
  - Pair Bonus: 1,000 UGX per sqm for matched pairs
- **Network Stats**: 
  - Matched pairs count
  - Left and right leg totals (sqm)
  - Carry-over tracking
  - Personal floor size
- **Floor Status**: View floor condition and community rating
- **Network Tree Visualization**: Interactive binary tree view
  - Visual representation of your downline
  - Expandable/collapsible nodes
  - Color-coded status indicators
  - Adjustable depth (2-4 levels)
  - Shows earnings, floor size, and ratings
- **Referral Sharing**: Share your referral code via native share
- **Growth Projections**: View 6-month earnings forecast
- **Pull to Refresh**: Update earnings and stats in real-time
- **Logout**: Secure session management

## Tech Stack

- React Native
- TypeScript
- React Navigation (Native Stack)
- Context API for state management

## API Integration

The app connects to the backend API at `http://10.0.2.2:4000` (Android emulator localhost).

### Endpoints Used:
- `POST /api/users/register-root` - Register first user
- `POST /api/users/register` - Register with referral
- `GET /api/users/phone/:phone` - Login by phone
- `GET /api/users/:id` - Get user details

## Project Structure

```
src/
├── api/
│   └── client.ts          # API client and types
├── context/
│   └── UserContext.tsx    # User state management
├── navigation/
│   └── AppNavigator.tsx   # Navigation setup
└── screens/
    ├── LoginScreen.tsx        # Phone-based login
    ├── RegisterScreen.tsx     # User registration
    ├── DashboardScreen.tsx    # Main dashboard
    └── NetworkTreeScreen.tsx  # Network tree visualization
```

## UI Design

### Color Scheme
- Primary: `#007AFF` (iOS Blue)
- Background: `#f8f9fa` (Light Gray)
- Text: `#1a1a1a` (Dark)
- Success: `#34C759` (Green)

### Key Components
- Clean, modern card-based design
- Responsive layouts with proper spacing
- Loading states and error handling
- Native alerts for user feedback

## Running the App

1. Make sure the backend is running on port 4000
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run on Android:
   ```bash
   npm run android
   ```
4. Run on iOS:
   ```bash
   npm run ios
   ```

## How It Works

1. **Registration**: Users sign up with name, phone, floor size, and optional referral code
2. **Login**: Users login with their phone number
3. **Dashboard**: View earnings, network stats, and share referral code
4. **Network Growth**: As users recruit others, earnings update automatically
5. **Binary Tree**: System automatically places recruits in left/right legs for balanced growth

## Future Enhancements

- [x] Network tree visualization ✅
- [ ] Push notifications for new recruits
- [ ] Withdrawal/payout functionality
- [ ] Profile management
- [ ] Dark mode support
- [ ] Offline mode with sync
- [ ] Photo upload for floor inspections
