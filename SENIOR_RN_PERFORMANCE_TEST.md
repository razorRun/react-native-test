# React Native Performance Optimization Challenge

## Time Limit: 1 hour

## Overview
You've inherited a React Native e-commerce app with severe performance issues. Users report:
- App freezes during scrolling
- 5+ second load times
- High battery drain
- Crashes on older devices

Your mission: Identify and fix the critical performance bottlenecks.

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run on iOS Simulator or Android Emulator (performance issues are visible in simulator)
4. Use React Native Performance Monitor
5. Profile with Flipper or React DevTools

## Requirements

### Phase 1: Analysis (15 minutes)
Profile the app and document:
1. Initial load time
2. JS thread blocking operations
3. Memory leaks
4. Unnecessary re-renders
5. Bridge communication bottlenecks

### Phase 2: Optimization (35 minutes)
Fix the TOP 5 critical issues:
1. Fix memory leaks (priority #1)
2. Implement pagination/virtualization
3. Optimize context re-renders
4. Fix FlatList performance
5. Remove/optimize animations

### Phase 3: Documentation (10 minutes)
Provide:
1. List of issues found (ranked by impact)
2. Solutions implemented
3. Performance metrics (before/after)
4. Recommendations for further optimization

## Evaluation Criteria

### Technical Skills (40%)
- Correct identification of performance bottlenecks
- Quality of optimization solutions
- Understanding of React Native internals

### Problem-Solving (30%)
- Systematic approach to debugging
- Prioritization of issues
- Creative solutions

### Code Quality (20%)
- Clean, maintainable fixes
- No regression in functionality
- Following React Native best practices

### Communication (10%)
- Clear documentation
- Performance metrics
- Future recommendations

## Key Performance Areas

1. **Rendering Performance**
   - FlatList optimization
   - Component memoization
   - Animation performance

2. **JavaScript Thread**
   - Heavy computations
   - Synchronous operations
   - Event handler optimization

3. **Memory Management**
   - Context provider issues
   - Event listener cleanup
   - Large data structures

4. **Bridge Communication**
   - Excessive native calls
   - Large data serialization
   - Event emitter usage

5. **State Management**
   - Unnecessary re-renders
   - Context optimization
   - State update batching

## Hints
- Focus on the TOP 5 most critical issues
- Memory leaks are your first priority
- Some issues compound each other
- Check contexts and event listeners
- Profile before optimizing

## Deliverables
1. Optimized codebase
2. Performance report (`PERFORMANCE_REPORT.md`)
3. Metrics dashboard screenshot
4. List of unresolved issues with recommendations

## Note
This is a senior-level challenge. You're expected to:
- Use advanced profiling tools
- Understand React Native architecture
- Apply performance patterns
- Make architectural decisions

Good luck!