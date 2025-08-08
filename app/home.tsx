import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Shield } from 'lucide-react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { WithSpringConfig } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const smoothSpringConfig: WithSpringConfig = {
  damping: 50,
  mass: 0.5,
  stiffness: 200,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

export default function HomeScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  // Snap points for the bottom sheet: 25%, 50%, 90% of screen height
  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  const handleWhereToGo = () => {
    router.push('/enter-location');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* Map Background */}
        <View style={styles.mapContainer}>
          {/* Map Placeholder - Replace with Mapbox integration in the future */}
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>Map View</Text>
            <Text style={styles.mapSubtext}>Interactive map will be integrated here</Text>
          </View>
        </View>
        {/* Draggable Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={1} // Start at 50%
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.sheetHandle}
          animationConfigs={smoothSpringConfig}
        >
          {/* Bottom Sheet Content (Booking UI) */}
          <View style={styles.bottomSection}>
            {/* Where to go button */}
            <TouchableOpacity style={styles.whereToGoButton} onPress={handleWhereToGo}>
              <View style={styles.whereToGoContent}>
                <Text style={styles.whereToGoText}>Where would you like to go?</Text>
                <View style={styles.arrowIcon}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
            {/* Quick Actions */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
              style={styles.quickActionsContainer}
            >
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.buttonContent}>
                  <Plus size={20} color="#f5cb5c" />
                  <Text style={styles.quickActionText}>Add Home</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.buttonContent}>
                  <Plus size={20} color="#f5cb5c" />
                  <Text style={styles.quickActionText}>Add Work</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.buttonContent}>
                  <Plus size={20} color="#f5cb5c" />
                  <Text style={styles.quickActionText}>+Save Other</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
            {/* Safety Card */}
            <View style={styles.safetyCard}>
              <View style={styles.safetyContent}>
                <Text style={styles.safetyTitle}>Setup{"\n"}Safety Now!</Text>
                <Text style={styles.safetySubtitle}>Safe and{"\n"}Reliable Rides</Text>
              </View>
              <View style={styles.safetyIcon}>
                <Shield size={40} color="#fff" />
              </View>
            </View>
            {/* Bottom Text */}
            <Text style={styles.bottomText}>Book and move, anywhere</Text>
          </View>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapText: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
  },
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04, // Softer shadow
    shadowRadius: 4,     // Less pronounced
    elevation: 4,
  },
  sheetHandle: {
    backgroundColor: '#e0e0e0', // Lighter, more subtle
    width: 36,                  // Smaller width
    height: 4,                  // Thinner
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
    opacity: 0.7,               // More subtle
  },
  bottomSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  whereToGoButton: {
    backgroundColor: '#fff', // White background for modern look
    borderRadius: 100,       // Softer, less pill-like
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 100,
    borderWidth: 1,
    borderColor: '#ececec', // Subtle border
  },
  whereToGoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  whereToGoText: {
    fontSize: 17,
    fontFamily: 'Poppins-Regular', // Slightly bolder for clarity
    color: '#222',
    letterSpacing: 0.05,
  },
  arrowIcon: {
    width: 35,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5cb5c',
    borderRadius: 14,
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsScroll: {
    paddingHorizontal: 0,
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#f5cb5c',
    marginLeft: 8,
    letterSpacing: 0.1,
  },
  safetyCard: {
    backgroundColor: '#f5cb5c',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    lineHeight: 28,
  },
  safetySubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginTop: 4,
    lineHeight: 20,
  },
  safetyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333533',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
  },
});