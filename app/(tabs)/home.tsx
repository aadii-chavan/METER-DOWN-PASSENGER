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
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Shield, LogOut, Navigation, Clock, MapPin, Menu } from 'lucide-react-native';
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
  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  const handleWhereToGo = () => {
    router.push('/enter-location');
  };

  const handleLogout = () => {
    router.push('/');
  };

  const handleServices = () => {
    router.push('/services');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.subtitle}>Ready for your next ride?</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.headerButton} onPress={handleProfile}>
                  <Menu size={20} color="#e8eddf" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
                  <LogOut size={20} color="#e8eddf" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Draggable Bottom Sheet */}
            <BottomSheet
              ref={bottomSheetRef}
              index={1}
              snapPoints={snapPoints}
              enablePanDownToClose={false}
              backgroundStyle={styles.sheetBackground}
              handleIndicatorStyle={styles.sheetHandle}
              animationConfigs={smoothSpringConfig}
            >
              <View style={styles.bottomSection}>
                {/* Where to go button */}
                <TouchableOpacity style={styles.whereToGoButton} onPress={handleWhereToGo}>
                  <View style={styles.whereToGoContent}>
                    <MapPin size={20} color="#242423" style={styles.whereToGoIcon} />
                    <Text style={styles.whereToGoText}>Where would you like to go?</Text>
                    <View style={styles.arrowIcon}>
                      <Navigation size={16} color="#242423" />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickActionsScroll}
                  style={styles.quickActionsContainer}
                >
                  <TouchableOpacity style={styles.quickActionButton}>
                    <View style={styles.quickActionIcon}>
                      <Plus size={20} color="#f5cb5c" />
                    </View>
                    <Text style={styles.quickActionText}>Add Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionButton}>
                    <View style={styles.quickActionIcon}>
                      <Plus size={20} color="#f5cb5c" />
                    </View>
                    <Text style={styles.quickActionText}>Add Work</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionButton}>
                    <View style={styles.quickActionIcon}>
                      <Clock size={20} color="#f5cb5c" />
                    </View>
                    <Text style={styles.quickActionText}>Recent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionButton} onPress={handleServices}>
                    <View style={styles.quickActionIcon}>
                      <Menu size={20} color="#f5cb5c" />
                    </View>
                    <Text style={styles.quickActionText}>Services</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Safety Card */}
                <View style={styles.safetyCard}>
                  <View style={styles.safetyContent}>
                    <Text style={styles.safetyTitle}>Setup Safety Now!</Text>
                    <Text style={styles.safetySubtitle}>Safe and Reliable Rides</Text>
                  </View>
                  <View style={styles.safetyIcon}>
                    <Shield size={32} color="#e8eddf" />
                  </View>
                </View>

                {/* Bottom Text */}
                <Text style={styles.bottomText}>Book and move, anywhere</Text>
              </View>
            </BottomSheet>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </GestureHandlerRootView>
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#e8eddf',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#e8eddf',
    marginTop: 4,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(36, 36, 35, 0.8)',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sheetBackground: {
    backgroundColor: '#e8eddf',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHandle: {
    backgroundColor: 'rgba(36, 36, 35, 0.3)',
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  whereToGoButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  whereToGoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whereToGoIcon: {
    marginRight: 12,
  },
  whereToGoText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#242423',
  },
  arrowIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5cb5c',
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginBottom: 16,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsScroll: {
    paddingHorizontal: 0,
    gap: 16,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 203, 92, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    textAlign: 'center',
  },
  safetyCard: {
    backgroundColor: '#f5cb5c',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    lineHeight: 24,
  },
  safetySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#242423',
    marginTop: 4,
    opacity: 0.8,
  },
  safetyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#242423',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(36, 36, 35, 0.6)',
    textAlign: 'center',
  },
});