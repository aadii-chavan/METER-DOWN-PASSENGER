import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { LocationService, LocationData } from '../utils/locationService';
import { getMapboxToken } from '../config/mapbox';

interface MapboxMapProps {
  style?: any;
  onRegionChange?: (region: any) => void;
}

export default function MapboxMap({ style, onRegionChange }: MapboxMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  console.log('🗺️ MapboxMap component rendering with props:', { style, onRegionChange });

  useEffect(() => {
    console.log('🗺️ MapboxMap component mounted');
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      console.log('🗺️ Initializing Mapbox map...');
      // Get user's current location
      const location = await LocationService.getCurrentLocation();
      if (location) {
        console.log('📍 User location obtained:', location);
        setUserLocation(location);
      } else {
        setMapError('Unable to get your current location. Please enable GPS/location services and grant permission.');
        Alert.alert('Location Error', 'Unable to get your current location. Please enable GPS/location services and grant permission.');
      }
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setMapError('Location permission denied or location unavailable');
      Alert.alert('Location Error', 'Unable to get your current location. Please enable GPS/location services and grant permission.');
    }
  };

  const mapboxToken = getMapboxToken();
  console.log('🗺️ Mapbox token obtained:', mapboxToken ? 'Token exists' : 'No token');

  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;

  if (!userLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16, textAlign: 'center' }}>{mapError || 'Location unavailable. Please enable GPS/location services.'}</Text>
      </View>
    );
  }
  
  console.log('🗺️ Map coordinates:', { latitude, longitude });

  // Create HTML for Mapbox map
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
        <style>
            body { margin: 0; padding: 0; background-color: #f0f0f0; }
            #map { position: absolute; top: 0; bottom: 0; width: 100%; }
            .debug-info { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; z-index: 1000; }
        </style>
    </head>
    <body>
        <div class="debug-info">Mapbox Map Loading...</div>
        <div id='map'></div>
        <script>
            console.log('🗺️ Mapbox HTML script starting...');
            mapboxgl.accessToken = '${mapboxToken}';
            console.log('🗺️ Access token set');
            
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [${longitude}, ${latitude}],
                zoom: 15
            });

            console.log('🗺️ Map instance created');

            // Add user location marker
            map.on('load', function() {
                console.log('🗺️ Map loaded successfully');
                document.querySelector('.debug-info').innerHTML = 'Map Loaded!';
                
                // Add a marker for user location
                new mapboxgl.Marker({ color: '#f5cb5c' })
                    .setLngLat([${longitude}, ${latitude}])
                    .addTo(map);
                
                // Add user location control
                map.addControl(new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true,
                    showUserHeading: true
                }));
            });

            // Handle map events
            map.on('moveend', function() {
                const center = map.getCenter();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'regionChange',
                    latitude: center.lat,
                    longitude: center.lng,
                    zoom: map.getZoom()
                }));
            });

            // Handle errors
            map.on('error', function(e) {
                console.error('🗺️ Mapbox error:', e);
                document.querySelector('.debug-info').innerHTML = 'Map Error: ' + e.error.message;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    message: e.error.message
                }));
            });
        </script>
    </body>
    </html>
  `;

  console.log('🗺️ HTML generated, length:', mapHtml.length);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('🗺️ Received message from WebView:', data);
      if (data.type === 'regionChange') {
        onRegionChange?.(data);
      } else if (data.type === 'error') {
        console.error('🗺️ Mapbox error:', data.message);
        setMapError(data.message);
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  };

  if (mapError) {
    console.log('🗺️ Rendering error state:', mapError);
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Text style={styles.errorText}>Map Error: {mapError}</Text>
        <Text style={styles.errorSubtext}>Please check location permissions</Text>
      </View>
    );
  }

  console.log('🗺️ Rendering WebView with map');
  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.map}
        onMessage={handleMessage}
        onError={(error) => {
          console.error('🗺️ WebView error:', error);
          setMapError('Failed to load map');
        }}
        onLoad={() => {
          console.log('🗺️ Mapbox map loaded successfully');
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
}); 