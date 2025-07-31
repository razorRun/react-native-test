# React Native Performance Test - Setup Instructions

## Prerequisites
- Node.js >= 16
- React Native development environment set up
- iOS Simulator or Android Emulator (preferably use a physical device)
- Flipper or React DevTools for profiling

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-native-test
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install iOS dependencies (Mac only):
```bash
cd ios && pod install && cd ..
```

**Note**: If you encounter boost checksum errors during `pod install`, try:
```bash
cd ios
rm -rf Pods
pod cache clean --all
pod install --repo-update
```

## Running the App

### iOS Simulator
```bash
npm run ios
# or
yarn ios
```

### Android Emulator
```bash
npm run android
# or
yarn android
```

**Note**: This test is designed to work well in simulators. The performance issues are noticeable even without a physical device.

## The Challenge

You have **1 hour** to identify and fix critical performance issues in this React Native e-commerce app.

### Instructions
1. **Read the test instructions**: Open `SENIOR_RN_PERFORMANCE_TEST.md`
2. **Profile first**: Use React Native Performance Monitor and profiling tools
3. **Focus on TOP 5 issues**: Don't try to fix everything
4. **Document your fixes**: Track what you changed and why

### Performance Issues to Look For
- Memory leaks
- Excessive re-renders
- Large datasets without pagination
- Animation performance
- Bridge communication issues

### Tools You Should Use
- React Native Performance Monitor (shake device or Cmd+D)
- Flipper (recommended)
- React DevTools
- Console logs for quick debugging

## Submission
After 1 hour, create a `PERFORMANCE_REPORT.md` file documenting:
1. Issues identified (ranked by severity)
2. Fixes implemented
3. Performance improvements achieved
4. Recommendations for issues you couldn't fix

Good luck!