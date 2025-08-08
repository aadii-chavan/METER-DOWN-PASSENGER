import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { LocationService, LocationData } from '../utils/locationService';

export default function SimpleMap() {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
      } else {
        setMapError('Unable to get your current location. Please enable GPS/location services and grant permission.');
      }
    };
    fetchLocation();
  }, []);

  if (!userLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>{mapError || 'Location unavailable. Please enable GPS/location services.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.debugText}>Simple Map Component</Text>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onLoad={() => console.log('🗺️ Simple map loaded')}
        onError={(error) => console.error('🗺️ Simple map error:', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  debugText: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 5,
    borderRadius: 5,
    zIndex: 1,
  },
}); 