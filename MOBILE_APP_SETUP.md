# VLOTO Mobile App Setup Guide

## Overview

VLOTO Mobile is a React Native application that provides Vietnamese lottery number generation with advanced statistical analysis. The app works offline and automatically syncs data when connected to the internet.

## Features

- **Offline Functionality**: Works without internet connection using cached data
- **Smart Number Generation**: Multiple algorithms for generating lottery numbers
- **Statistical Analysis**: Detailed frequency analysis and pattern recognition
- **Auto-Sync**: Automatically updates data when online
- **Local Storage**: All data stored locally on device
- **Cross-Platform**: Works on both Android and iOS

## Prerequisites

### For Development
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### For Users
- Android 6.0+ or iOS 10.0+
- ~50MB storage space
- Internet connection for initial data download

## Installation

### Method 1: Development Setup

1. **Clone and Setup**
   ```bash
   cd vloto
   npm install
   ```

2. **Install React Native Dependencies**
   ```bash
   npx react-native link
   ```

3. **Android Setup**
   ```bash
   # Start Metro bundler
   npx react-native start
   
   # In another terminal, run Android app
   npx react-native run-android
   ```

4. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

### Method 2: Build APK for Distribution

1. **Build Release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **APK Location**
   - Find the APK at: `android/app/build/outputs/apk/release/app-release.apk`
   - Transfer to Android device and install

## App Structure

```
src/
├── components/          # Reusable UI components
├── context/            # Data management context
├── screens/            # Main app screens
├── services/           # Data fetching services
└── utils/              # Utility functions
```

## Key Components

### DataContext
- Manages local data storage with AsyncStorage
- Handles network connectivity
- Auto-syncs data when online
- Provides offline fallback

### LotteryGenerator
- Smart number generation algorithms
- Frequency-based analysis
- Pattern recognition
- Statistical calculations

### Screens
- **HomeScreen**: Dashboard with latest results
- **Vietlot45Screen**: Mega 6/45 number generator
- **Vietlot55Screen**: Mega 6/55 number generator
- **SettingsScreen**: App preferences and data management

## Data Management

### Local Storage
- Uses AsyncStorage for persistent data
- Stores lottery results, frequency data, and settings
- Automatic cache management

### Data Sources
- Primary: ketquadientoan.com (when online)
- Fallback: Bundled sample data
- Update frequency: Every 6 hours

### Offline Functionality
- Full app functionality without internet
- Uses cached data for number generation
- Syncs when connection restored

## Generation Strategies

### Smart Generation
- Weighted probability based on historical frequency
- Considers multiple factors (day, month, patterns)
- Balanced approach for optimal results

### Frequency-Based
- **Hot Numbers**: Most frequently drawn
- **Cold Numbers**: Least frequently drawn
- **Balanced**: Mix of hot and cold numbers

### Pattern-Based
- Day of week analysis
- Monthly patterns
- Even/odd date correlations

## Usage Instructions

### First Launch
1. App will attempt to download latest data
2. If offline, uses sample data
3. Data syncs automatically when online

### Generating Numbers
1. Select generation strategy
2. Choose single set or multiple sets
3. View detailed analysis of generated numbers

### Manual Selection
1. Tap numbers to select (max 6)
2. View frequency colors for each number
3. Analyze your selection

### Settings Management
- Force data updates
- Clear cache
- View storage usage
- Toggle auto-update

## Troubleshooting

### Common Issues

**App won't start**
- Check Node.js version (v16+)
- Run `npm install` again
- Clear Metro cache: `npx react-native start --reset-cache`

**Data not loading**
- Check internet connection
- Force update in Settings
- Clear cache and restart

**Android build fails**
- Ensure Android SDK is installed
- Check ANDROID_HOME environment variable
- Clean build: `cd android && ./gradlew clean`

**iOS build fails** (macOS only)
- Run `cd ios && pod install`
- Clean Xcode build folder
- Check iOS deployment target

### Performance Tips
- Clear cache periodically
- Close and restart app if sluggish
- Ensure sufficient storage space

## Technical Details

### Dependencies
- React Native 0.73.0
- React Navigation for navigation
- React Native Paper for UI components
- AsyncStorage for local storage
- NetInfo for connectivity monitoring

### Data Format
```json
{
  "draws": [
    {
      "date": "T7, 15/03/2025",
      "numbers": "01 34 39 40 42 45",
      "prize": "133.643.776.800"
    }
  ],
  "summary": [...],
  "dayOfWeek": {...},
  "month": {...},
  "evenOdd": {...}
}
```

### Security
- No sensitive data stored
- Local-only data processing
- No user tracking or analytics

## Updates and Maintenance

### Auto-Updates
- Data updates every 6 hours when online
- Manual update available in Settings
- Fallback to cached data if update fails

### App Updates
- New versions distributed via APK
- Backward compatible data format
- Automatic migration of cached data

## Support

For issues or questions:
1. Check this documentation
2. Review app Settings > Debug Information
3. Clear cache and restart app
4. Reinstall app if problems persist

## Development Notes

### Adding New Features
1. Follow existing code structure
2. Update DataContext for new data requirements
3. Add new screens to navigation
4. Test offline functionality

### Testing
- Test on both Android and iOS
- Verify offline functionality
- Test data sync scenarios
- Check performance with large datasets

### Building for Production
1. Update version in app.json
2. Test release build thoroughly
3. Generate signed APK for Android
4. Archive for iOS App Store

## License

MIT License - See LICENSE file for details. 
