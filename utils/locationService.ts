import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildGeocodingUrl, getMapboxToken } from '../config/mapbox';

// Polyfill for uuidv4 (suitable for session tokens)
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number | null;
}

export interface GeocodingResult {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  distance?: string;
  type: 'recent' | 'place' | 'airport' | 'hotel' | 'office';
  icon: any;
  coordinates?: { latitude: number; longitude: number };
}

// Pune bounding box (approx): [minLon, minLat, maxLon, maxLat]
const PUNE_BBOX = [73.7300, 18.3900, 73.9800, 18.6500];

function isFeatureInPune(feature: any): boolean {
  // Check if 'Pune' is in the place_name or context
  if (feature.place_name && feature.place_name.toLowerCase().includes('pune')) return true;
  if (feature.context) {
    for (const ctx of feature.context) {
      if (ctx.text && ctx.text.toLowerCase().includes('pune')) return true;
    }
  }
  return false;
}

// Pune alias dictionary for common abbreviations and nicknames
const PUNE_ALIASES: Record<string, string> = {
  'vit': 'Vishwakarma Institute of Technology',
  'viit': 'Vishwakarma Institute of Information Technology',
  'aissms': 'All India Shri Shivaji Memorial',
  'mit': 'Maharashtra Institute of Technology',
  'pict': 'Pune Institute of Computer Technology',
  'coep': 'College of Engineering Pune',
  'sppu': 'Savitribai Phule Pune University',
  'fcbc': 'Fergusson College',
  'sp': 'Symbiosis Pune',
  // Add more as needed
};

function expandPuneAlias(query: string): string | null {
  const key = query.trim().toLowerCase();
  return PUNE_ALIASES[key] || null;
}

const PUNE_CENTER = { latitude: 18.5204, longitude: 73.8567 };
function isDefaultPuneCenterLocation(location: { latitude: number; longitude: number }) {
  return (
    Math.abs(location.latitude - PUNE_CENTER.latitude) < 0.0001 &&
    Math.abs(location.longitude - PUNE_CENTER.longitude) < 0.0001
  );
}

// Helper to generate a session token for each search session
let currentSessionToken: string | null = null;
function getSessionToken() {
  if (!currentSessionToken) {
    currentSessionToken = uuidv4();
  }
  return currentSessionToken;
}
function resetSessionToken() {
  currentSessionToken = uuidv4();
}

export class LocationService {
  // All cache and storage logic removed. Only real-time location and address fetching remain.

  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.checkLocationPermission();
      console.log('[LocationService] Permission status:', hasPermission);
      if (!hasPermission) {
        const granted = await this.requestLocationPermission();
        console.log('[LocationService] Permission requested, granted:', granted);
        if (!granted) {
          console.warn('[LocationService] Location permission denied by user.');
          throw new Error('Location permission denied');
        }
      }
      // Always fetch real-time location
      try {
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced, // Better balance between speed and accuracy
            timeInterval: 10000, // Increased timeout for better reliability
            distanceInterval: 100, // More lenient for better success rate
            mayShowUserSettingsDialog: true, // Allow user to enable location if needed
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location timeout - GPS signal may be weak')), 15000)
          )
        ]) as Location.LocationObject;
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        };
        console.log('[LocationService] Real-time location obtained:', locationData);
        return locationData;
      } catch (locError) {
        console.error('[LocationService] Error getting real-time location:', locError);
        console.warn('[LocationService] Suggestion: Ensure GPS is enabled, permission is granted, and device is in an open area.');
        throw locError;
      }
    } catch (error) {
      console.error('[LocationService] Error getting current location:', error);
      return null;
    }
  }

  static async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      // Check if Mapbox token is available
      try {
        getMapboxToken();
      } catch (error) {
        console.log('Mapbox token not available, skipping reverse geocoding');
        return null;
      }

      console.log('Attempting reverse geocoding for coordinates:', latitude, longitude);
      const url = buildGeocodingUrl(longitude, latitude);
      console.log('Geocoding URL (token hidden):', url.replace(/access_token=[^&]*/, 'access_token=***'));

      const response = await fetch(url);
      const data = await response.json();



      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        console.log('Geocoding successful, address:', address);
        
        return address;
      }

      console.log('No geocoding results found');
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  static async getCurrentAddress(): Promise<string | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) {
        console.warn('[LocationService] No location available for address lookup.');
        return null;
      }
      const address = await this.reverseGeocode(location.latitude, location.longitude);
      console.log('[LocationService] Reverse geocoded address:', address);
      return address;
    } catch (error) {
      console.error('[LocationService] Error getting current address:', error);
      return null;
    }
  }

  // Clear cache (useful for testing or when user moves significantly)
  static clearCache(): void {
    // No cache to clear
    console.log('Location cache cleared');
  }

  // Test Mapbox token validity
  static async testMapboxToken(): Promise<boolean> {
    try {
      const token = getMapboxToken();
      console.log('Testing Mapbox token...');
      console.log('Token starts with:', token.substring(0, 10) + '...');
      
      // Test with a simple geocoding request
      const testUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/73.8567,18.5204.json?access_token=${token}&limit=1`;
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (data.message && data.message.includes('Not Authorized')) {
        console.error('❌ Invalid Mapbox token:', data.message);
        return false;
      }
      
      if (data.features && data.features.length > 0) {
        console.log('✅ Mapbox token is valid!');
        console.log('Test result:', data.features[0].place_name);
        return true;
      }
      
      console.log('⚠️ Token might be valid but no results returned');
      return true;
    } catch (error) {
      console.error('❌ Error testing Mapbox token:', error);
      return false;
    }
  }

  // Mapbox Places API search for real-world suggestions
  static async searchPlaces(query: string, proximity?: { latitude: number; longitude: number }): Promise<PlaceSuggestion[]> {
    try {
      if (!query || query.length < 2) return [];
      const accessToken = getMapboxToken();
      const sessionToken = getSessionToken();
      let url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&session_token=${sessionToken}&access_token=${accessToken}`;
      if (proximity) {
        url += `&proximity=${proximity.longitude}%2C${proximity.latitude}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        // Map Search Box API results to PlaceSuggestion
        const suggestions = await Promise.all(data.suggestions.map(async (item: any) => {
          // Try to extract type and icon
          let type: PlaceSuggestion['type'] = 'place';
          let icon: any = null;
          const { Clock, Plane, Building2, Wrench } = require('lucide-react-native');
          if (item.place_formatted?.toLowerCase().includes('airport')) type = 'airport';
          else if (item.place_formatted?.toLowerCase().includes('hotel')) type = 'hotel';
          else if (item.place_formatted?.toLowerCase().includes('office') || item.place_formatted?.toLowerCase().includes('institute')) type = 'office';
          else type = 'place';
          switch (type) {
            case 'airport': icon = Plane; break;
            case 'hotel': icon = Building2; break;
            case 'office': icon = Wrench; break;
            default: icon = Clock;
          }
          
          // Extract coordinates if available - try multiple possible locations with validation
          let coordinates: { latitude: number; longitude: number } | undefined;
          
          // Helper function to validate coordinates
          const isValidCoordinate = (lat: number, lng: number): boolean => {
            return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && 
                   !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
          };
          
          // Try different possible coordinate locations in the API response with validation
          if (item.coordinates && item.coordinates.lat && item.coordinates.lng) {
            const lat = parseFloat(item.coordinates.lat);
            const lng = parseFloat(item.coordinates.lng);
            if (isValidCoordinate(lat, lng)) {
              coordinates = { latitude: lat, longitude: lng };
            }
          } else if (item.center && Array.isArray(item.center) && item.center.length >= 2) {
            const lat = parseFloat(item.center[1]);
            const lng = parseFloat(item.center[0]);
            if (isValidCoordinate(lat, lng)) {
              coordinates = { latitude: lat, longitude: lng };
            }
          } else if (item.geometry && item.geometry.coordinates && Array.isArray(item.geometry.coordinates) && item.geometry.coordinates.length >= 2) {
            const lat = parseFloat(item.geometry.coordinates[1]);
            const lng = parseFloat(item.geometry.coordinates[0]);
            if (isValidCoordinate(lat, lng)) {
              coordinates = { latitude: lat, longitude: lng };
            }
          } else if (item.lat && item.lng) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lng);
            if (isValidCoordinate(lat, lng)) {
              coordinates = { latitude: lat, longitude: lng };
            }
          }
          
          // If no coordinates found, try to geocode the address with better accuracy
          if (!coordinates && item.full_address) {
            try {
              // Use a more specific geocoding request for better accuracy
              const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(item.full_address)}.json?access_token=${accessToken}&limit=1&country=in&types=poi,address,place&language=en`;
              const geocodeResponse = await fetch(geocodeUrl);
              const geocodeData = await geocodeResponse.json();
              
              if (geocodeData.features && geocodeData.features.length > 0) {
                const feature = geocodeData.features[0];
                const lat = parseFloat(feature.center[1]);
                const lng = parseFloat(feature.center[0]);
                
                // Validate the geocoded coordinates
                if (isValidCoordinate(lat, lng)) {
                  coordinates = {
                    latitude: lat,
                    longitude: lng
                  };
                  console.log('Geocoded coordinates for', item.name, ':', coordinates);
                } else {
                  console.log('Invalid geocoded coordinates for', item.name, ':', { lat, lng });
                }
              }
            } catch (error) {
              console.log('Failed to geocode address for', item.name, ':', error);
            }
          }
          
          // Additional fallback: try with just the name if full address failed
          if (!coordinates && item.name && item.name !== item.full_address) {
            try {
              const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(item.name)}.json?access_token=${accessToken}&limit=1&country=in&types=poi,place&language=en`;
              const geocodeResponse = await fetch(geocodeUrl);
              const geocodeData = await geocodeResponse.json();
              
              if (geocodeData.features && geocodeData.features.length > 0) {
                const feature = geocodeData.features[0];
                const lat = parseFloat(feature.center[1]);
                const lng = parseFloat(feature.center[0]);
                
                if (isValidCoordinate(lat, lng)) {
                  coordinates = {
                    latitude: lat,
                    longitude: lng
                  };
                  console.log('Fallback geocoded coordinates for', item.name, ':', coordinates);
                }
              }
            } catch (error) {
              console.log('Failed fallback geocoding for', item.name, ':', error);
            }
          }
          
          // Debug log for coordinate extraction
          console.log('Final coordinates for', item.name, ':', coordinates);
          
          return {
            id: item.mapbox_id,
            name: item.name || item.place_formatted || item.full_address || item.address || query,
            address: item.full_address || item.place_formatted || item.name,
            type,
            icon,
            coordinates,
          };
        }));
        
        return suggestions;
      }
      // Fallback to geocoding API if Search Box API fails
      return [];
    } catch (error) {
      console.error('Error searching places (Search Box API):', error);
      return [];
    }
  }
} 

// Helper to check if a suggestion is in Pune
export function isSuggestionInPune(suggestion: { address: string }): boolean {
  return suggestion.address.toLowerCase().includes('pune');
} 