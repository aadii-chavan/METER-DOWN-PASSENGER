import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LogOut, Navigation } from 'lucide-react-native';
import MapboxMap from '../../components/MapboxMap';

export default function HomeScreen() {
  console.log('🏠 HomeScreen component rendered');
  
  const handleLogout = () => {
    router.push('/');
  };

  console.log('🏠 About to render MapboxMap component');

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Container */}
      <View style={styles.mapContainer}>
        <Text style={styles.debugText}>Map container is here</Text>
        <MapboxMap style={styles.map} />
      </View>

      {/* Overlay Header */}
      <View style={styles.headerOverlay}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.subtitle}>Ready for your next ride?</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color="#242423" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Button */}
      <View style={styles.quickActionContainer}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Navigation size={24} color="#ffffff" />
          <Text style={styles.quickActionText}>Book Ride</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8eddf',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333533',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e8eddf',
  },
  quickActionContainer: {
    position: 'absolute',
    bottom: 100, // Account for tab bar
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5cb5c',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  debugText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    textAlign: 'center',
    paddingVertical: 10,
    zIndex: 10,
  },
});