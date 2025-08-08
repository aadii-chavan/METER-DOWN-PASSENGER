# Location Auto-Fill Feature

## Overview
This feature allows users to automatically fill their current location in the pickup field on the enter-location page, similar to how Uber and Google Maps work.

## Features Implemented

### 1. Location Permission Handling
- Automatic permission requests for location access
- Graceful handling of permission denied scenarios
- Permission status tracking

### 2. Current Location Detection
- High-accuracy GPS location retrieval
- Reverse geocoding using Mapbox API
- Precise street-level address formatting

### 3. User Interface
- Location button next to pickup input field
- "Use Current Location" option in suggestions
- Loading states during location fetching
- Error handling with user-friendly alerts

### 4. Location Button Component
- Reusable `LocationButton` component
- Configurable sizes (small, medium, large)
- Loading indicator during location fetch
- Error callback support

## Files Added/Modified

### New Files
- `utils/locationService.ts` - Core location functionality
- `components/LocationButton.tsx` - Reusable location button
- `config/env.ts` - Environment configuration
- `LOCATION_FEATURE.md` - This documentation

### Modified Files
- `app/enter-location.tsx` - Integrated location functionality
- `app.json` - Added location permissions
- `app/_layout.tsx` - Added environment validation
- `package.json` - Added new dependencies

## Dependencies Added
- `expo-location` - For GPS location access
- `@react-native-async-storage/async-storage` - For storing location data

## Environment Variables Required
- `MAPBOX_ACCESS_TOKEN` - Mapbox API key for reverse geocoding

## Usage

### For Users
1. Open the enter-location page
2. Tap the location button next to "Starting from?" field
3. Grant location permission when prompted
4. Current address will be auto-filled
5. Can also select "Use Current Location" from suggestions

### For Developers
```typescript
import LocationButton from '../components/LocationButton';
import { LocationService } from '../utils/locationService';

// Get current address
const address = await LocationService.getCurrentAddress();

// Use location button component
<LocationButton
  onLocationReceived={(address) => setPickupLocation(address)}
  onError={(error) => Alert.alert('Error', error)}
  size="small"
/>
```

## Error Handling
- Location permission denied
- GPS unavailable
- Network errors for geocoding
- Mapbox API errors
- Invalid coordinates

## Future Enhancements
- Location caching for better performance
- Background location updates
- Location history
- Custom location accuracy settings
- Offline location support 