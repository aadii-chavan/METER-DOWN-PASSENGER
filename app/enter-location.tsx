import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Keyboard,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Plane, Building2, Wrench } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocationButton from '../components/LocationButton';
import { LocationService, LocationData } from '../utils/locationService';
import { isSuggestionInPune } from '../utils/locationService';

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  distance?: string;
  type: 'recent' | 'place' | 'airport' | 'hotel' | 'office';
  icon: any;
  coordinates?: { latitude: number; longitude: number };
}

export default function EnterLocationScreen() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'drop'>('pickup');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  
  // Remove distanceCache and all distance logic

  // Remove formatDistance and calculateDistance functions

  const handleBack = () => {
    router.back();
  };

  // Check location permission and preload location on component mount
  useEffect(() => {
    checkLocationPermission();
    const initializeLocation = async () => {
      try {
        const currentAddress = await LocationService.getCurrentAddress();
        if (currentAddress) {
          setPickupLocation(currentAddress);
        } else {
          Alert.alert(
            'Location Unavailable',
            'Unable to get your current location. Please ensure your device GPS is enabled, location permission is granted, and you are in an area with good signal. Try again or check your device settings.'
          );
        }
      } catch (error: any) {
        let message = 'Unable to get your current location.';
        if (error?.message?.includes('timeout')) {
          message = 'Location request timed out. Please move to an open area or check your GPS settings.';
        } else if (error?.message?.includes('permission')) {
          message = 'Location permission denied. Please enable location access in your device settings.';
        }
        Alert.alert('Location Error', message);
      }
    };
    initializeLocation();
  }, []);

  const checkLocationPermission = async () => {
    const hasPermission = await LocationService.checkLocationPermission();
    setHasLocationPermission(hasPermission);
  };

  const handleLocationReceived = (address: string) => {
    setPickupLocation(address);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleLocationError = (error: string) => {
    Alert.alert('Location Error', error);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'recent':
        return Clock;
      case 'airport':
        return Plane;
      case 'hotel':
        return Building2;
      case 'office':
        return Wrench;
      default:
        return Clock; // Default icon for 'place' type
    }
  };

  const handleLocationSearch = (text: string, inputType: 'pickup' | 'drop') => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (inputType === 'pickup') {
      setPickupLocation(text);
    } else {
      setDropLocation(text);
    }
    if (text.length === 0) {
      if (inputType === 'pickup') {
        setSuggestions([
          {
            id: 'current-location',
            name: 'Use Current Location',
            address: 'Get your precise location',
            type: 'recent',
            icon: Clock,
          },
        ]);
      } else {
        setSuggestions([]);
      }
      setIsLoadingSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    searchTimeout.current = setTimeout(async () => {
      let proximity = undefined;
      try {
        const loc = await LocationService.getCurrentLocation();
        if (loc) {
          proximity = { latitude: loc.latitude, longitude: loc.longitude };
          setCurrentLocation(loc);
        }
      } catch {}
      const results = await LocationService.searchPlaces(text, proximity);
      setSuggestions(results);
      setIsLoadingSuggestions(false);
    }, 400);
  };

  const handleSuggestionSelect = async (suggestion: LocationSuggestion) => {
    if (suggestion.id === 'current-location') {
      setIsLoadingLocation(true);
      try {
        const address = await LocationService.getCurrentAddress();
        if (address) {
          if (activeInput === 'pickup') {
            setPickupLocation(address);
          } else {
            setDropLocation(address);
          }
          if (!isSuggestionInPune({ address })) {
            Alert.alert('Notice', 'Service at your place is not available at the moment.');
          }
        } else {
          Alert.alert(
            'Location Unavailable',
            'Unable to get your current location. Please ensure your device GPS is enabled, location permission is granted, and you are in an area with good signal. Try again or check your device settings.'
          );
        }
      } catch (error: any) {
        let message = 'Unable to get your current location.';
        if (error?.message?.includes('timeout')) {
          message = 'Location request timed out. Please move to an open area or check your GPS settings.';
        } else if (error?.message?.includes('permission')) {
          message = 'Location permission denied. Please enable location access in your device settings.';
        }
        Alert.alert('Location Error', message);
      } finally {
        setIsLoadingLocation(false);
      }
    } else {
      // Handle regular suggestion selection
      if (activeInput === 'pickup') {
        setPickupLocation(suggestion.name);
      } else {
        setDropLocation(suggestion.name);
        // Check if selected drop location is in Pune
        if (!isSuggestionInPune(suggestion)) {
          Alert.alert('Notice', 'Service at your place is not available at the moment.');
        }
      }
    }
    setSuggestions([]);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Fixed Header with proper safe area padding */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Fixed Location Container with proper spacing */}
      <View style={styles.fixedLocationContainer}>
        {/* Pickup Location */}
        <View style={styles.locationRow}>
          <View style={styles.locationDot}>
            <View style={styles.pickupDot} />
          </View>
          <TextInput
            style={[styles.locationInput, activeInput === 'pickup' && styles.activeInput]}
            value={pickupLocation}
            onChangeText={(text) => handleLocationSearch(text, 'pickup')}
            placeholder="Starting from?"
            placeholderTextColor="#999"
            onFocus={() => setActiveInput('pickup')}
            autoFocus={true}
          />
          <LocationButton
            onLocationReceived={handleLocationReceived}
            onError={handleLocationError}
            size="small"
            disabled={!hasLocationPermission}
          />
        </View>

        {/* Connecting Line */}
        <View style={styles.connectingLine} />

        {/* Drop Location */}
        <View style={styles.locationRow}>
          <View style={styles.locationDot}>
            <View style={styles.dropDot} />
          </View>
          <TextInput
            style={[styles.locationInput, activeInput === 'drop' && styles.activeInput]}
            value={dropLocation}
            onChangeText={(text) => handleLocationSearch(text, 'drop')}
            placeholder="Where are you going?"
            placeholderTextColor="#999"
            onFocus={() => setActiveInput('drop')}
          />
          {dropLocation.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setDropLocation('');
                setSuggestions([]);
              }}
            >
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search Suggestions */}
        {suggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            {isLoadingSuggestions && (
              <View style={{ alignItems: 'center', padding: 10 }}>
                <ActivityIndicator size="small" color="#f5cb5c" />
              </View>
            )}
            {suggestions.map((suggestion) => {
              const IconComponent = getIconForType(suggestion.type);
              const isCurrentLocation = suggestion.id === 'current-location';
              
              // Only show "Use Current Location" for pickup field
              if (isCurrentLocation && activeInput === 'drop') {
                return null;
              }
              
              // Debug: Log suggestion details
              console.log('Suggestion:', {
                name: suggestion.name,
                distance: suggestion.distance,
                coordinates: suggestion.coordinates,
                currentLocation: currentLocation
              });
              
              return (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionSelect(suggestion)}
                  disabled={isCurrentLocation && isLoadingLocation}
                >
                  <View style={styles.suggestionIcon}>
                    {isCurrentLocation && isLoadingLocation ? (
                      <ActivityIndicator size="small" color="#f5cb5c" />
                    ) : (
                      <IconComponent size={20} color="#666" />
                    )}
                  </View>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionName}>{suggestion.name}</Text>
                    <Text style={styles.suggestionAddress}>{suggestion.address}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          !isLoadingSuggestions && ((activeInput === 'drop' && dropLocation.length > 0) || (activeInput === 'pickup' && pickupLocation.length > 0)) && (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ color: '#999' }}>No results found</Text>
            </View>
          )
        )}

        {/* Add some bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    // Add margin to ensure it's not cut off
    marginTop: Platform.OS === 'ios' ? 10 : 5,
  },
  fixedLocationContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0.02,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  locationDot: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  dropDot: {
    width: 8,
    height: 8,
    backgroundColor: '#f5cb5c',
  },
  connectingLine: {
    width: 2,
    height: 15,
    backgroundColor: '#f5cb5c',
    marginLeft: 9,
    marginVertical: 5,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  activeInput: {
    color: '#000',
    fontWeight: '500',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    marginTop: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0.02,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: 18,
  },
  suggestionDistance: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#f5cb5c',
    marginLeft: 10,
    backgroundColor: '#fff5e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bottomPadding: {
    height: 20,
  },
});