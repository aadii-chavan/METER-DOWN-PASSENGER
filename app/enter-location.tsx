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
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Plane, Building2, Wrench, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LocationButton from '../components/LocationButton';
import { LocationService, LocationData } from '../utils/locationService';
import { isSuggestionInPune } from '../utils/locationService';

const { width, height } = Dimensions.get('window');

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

  const handleBack = () => {
    router.back();
  };

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
        return MapPin;
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
      if (activeInput === 'pickup') {
        setPickupLocation(suggestion.name);
      } else {
        setDropLocation(suggestion.name);
        if (!isSuggestionInPune(suggestion)) {
          Alert.alert('Notice', 'Service at your place is not available at the moment.');
        }
      }
    }
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleContinue = () => {
    if (pickupLocation && dropLocation) {
      // Navigate to next screen or handle booking
      Alert.alert('Booking', `From: ${pickupLocation}\nTo: ${dropLocation}`);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=1200',
      }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
          
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color="#e8eddf" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Enter Location</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* Location Input Container */}
            <View style={styles.locationContainer}>
              <Text style={styles.cardTitle}>Plan Your Journey</Text>
              
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
                  placeholderTextColor="rgba(36, 36, 35, 0.5)"
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
                  placeholderTextColor="rgba(36, 36, 35, 0.5)"
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

              {/* Continue Button */}
              {pickupLocation && dropLocation && (
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Suggestions */}
            <ScrollView 
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {isLoadingSuggestions && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#f5cb5c" />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              )}
              
              {suggestions.length > 0 && suggestions.map((suggestion) => {
                const IconComponent = getIconForType(suggestion.type);
                const isCurrentLocation = suggestion.id === 'current-location';
                
                if (isCurrentLocation && activeInput === 'drop') {
                  return null;
                }
                
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
                        <IconComponent size={20} color="#f5cb5c" />
                      )}
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionName}>{suggestion.name}</Text>
                      <Text style={styles.suggestionAddress}>{suggestion.address}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {!isLoadingSuggestions && suggestions.length === 0 && 
               ((activeInput === 'drop' && dropLocation.length > 0) || (activeInput === 'pickup' && pickupLocation.length > 0)) && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(36, 36, 35, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#e8eddf',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#e8eddf',
    marginHorizontal: 20,
    marginBottom: 100,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  locationContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(36, 36, 35, 0.1)',
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginBottom: 24,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationDot: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#242423',
  },
  dropDot: {
    width: 10,
    height: 10,
    backgroundColor: '#f5cb5c',
    borderRadius: 2,
  },
  connectingLine: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(245, 203, 92, 0.5)',
    marginLeft: 9,
    marginVertical: 4,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#242423',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeInput: {
    borderWidth: 2,
    borderColor: '#f5cb5c',
    shadowOpacity: 0.15,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(36, 36, 35, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 20,
    color: '#242423',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#f5cb5c',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
  },
  suggestionsScroll: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#242423',
    marginLeft: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 203, 92, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(36, 36, 35, 0.7)',
    lineHeight: 18,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(36, 36, 35, 0.5)',
  },
});