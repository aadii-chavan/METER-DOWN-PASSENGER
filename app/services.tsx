import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Car, Truck, Bike, Clock, Star, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function ServicesScreen() {
  const handleBack = () => {
    router.back();
  };

  const services = [
    {
      icon: Car,
      title: 'Meter Down Car',
      subtitle: 'Comfortable rides for daily commute',
      price: 'Starting ₹50',
      rating: '4.8',
      eta: '2-5 min',
    },
    {
      icon: Bike,
      title: 'Meter Down Bike',
      subtitle: 'Quick and affordable bike rides',
      price: 'Starting ₹25',
      rating: '4.7',
      eta: '1-3 min',
    },
    {
      icon: Truck,
      title: 'Meter Down Delivery',
      subtitle: 'Package and goods delivery',
      price: 'Starting ₹40',
      rating: '4.9',
      eta: '5-10 min',
    },
  ];

  const features = [
    { icon: Shield, title: 'Safety First', description: 'Verified drivers and real-time tracking' },
    { icon: Clock, title: 'Quick Booking', description: 'Book rides in under 30 seconds' },
    { icon: Star, title: 'Quality Service', description: 'Highly rated drivers and vehicles' },
  ];

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
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={24} color="#e8eddf" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Our Services</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content Card */}
          <View style={styles.contentCard}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.cardTitle}>Choose Your Ride</Text>
              
              {/* Services List */}
              <View style={styles.servicesContainer}>
                {services.map((service, index) => (
                  <TouchableOpacity key={index} style={styles.serviceItem}>
                    <View style={styles.serviceIcon}>
                      <service.icon size={28} color="#f5cb5c" />
                    </View>
                    <View style={styles.serviceContent}>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                      <View style={styles.serviceDetails}>
                        <Text style={styles.servicePrice}>{service.price}</Text>
                        <View style={styles.serviceMeta}>
                          <Star size={14} color="#f5cb5c" />
                          <Text style={styles.serviceRating}>{service.rating}</Text>
                          <Text style={styles.serviceEta}>• {service.eta}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Features Section */}
              <Text style={styles.sectionTitle}>Why Choose Meter Down?</Text>
              <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <feature.icon size={24} color="#f5cb5c" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* CTA Button */}
              <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/enter-location')}>
                <Text style={styles.ctaButtonText}>Book Your Ride Now</Text>
              </TouchableOpacity>
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
    paddingTop: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginBottom: 24,
    textAlign: 'center',
  },
  servicesContainer: {
    marginBottom: 32,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 203, 92, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(36, 36, 35, 0.7)',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#f5cb5c',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceRating: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginLeft: 4,
  },
  serviceEta: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(36, 36, 35, 0.6)',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureItem: {
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
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 203, 92, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(36, 36, 35, 0.7)',
  },
  ctaButton: {
    backgroundColor: '#f5cb5c',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
  },
});