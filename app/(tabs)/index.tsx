import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { router } from 'expo-router';
import { Globe, Phone } from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../../config/env';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// i18n translations
const translations = {
  en: {
    appName: 'Meter Down',
    welcome: 'Welcome to Meter Down',
    subtitle: 'Your trusted ride partner',
    phoneNumber: 'Phone Number',
    otp: 'Enter OTP',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    loading: 'Please wait...',
  },
  hi: {
    appName: 'मीटर डाउन',
    welcome: 'मीटर डाउन में आपका स्वागत है',
    subtitle: 'आपका विश्वसनीय राइड पार्टनर',
    phoneNumber: 'फोन नंबर',
    otp: 'OTP दर्ज करें',
    sendOtp: 'OTP भेजें',
    verifyOtp: 'OTP सत्यापित करें',
    loading: 'कृपया प्रतीक्षा करें...',
  },
};

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [language, setLanguage] = useState('en');
  const [authStep, setAuthStep] = useState('input'); // 'input' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const supabaseUrl = ENV.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = ENV.EXPO_PUBLIC_SUPABASE_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 13) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      // DEVELOPMENT: Dummy authentication for testing to save credits
      if (phoneNumber === '+911234567890') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        setAuthStep('otp');
        console.log('✅ Dummy OTP sent for testing phone number');
      } else {
        // Real Supabase call for other numbers
        const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
        setLoading(false);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          setAuthStep('otp');
        }
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      // DEVELOPMENT: Dummy authentication for testing to save credits
      if (phoneNumber === '+911234567890' && otp === '123456') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        console.log('✅ Dummy authentication successful - navigating to home');
        // Navigate to home page after successful authentication
        router.push('/home');
      } else {
        // Real Supabase call for other credentials
        const { data, error } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: otp, type: 'sms' });
        setLoading(false);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          // Navigate to home page after successful authentication
          router.push('/home');
        }
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Failed to verify OTP.');
    }
  };

  const renderPhoneAuth = () => {
    if (authStep === 'input') {
      return (
        <>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#242423" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.phoneNumber}
              value={phoneNumber}
              onChangeText={(text) => {
                // Auto-format with +91
                if (!text.startsWith('+91')) {
                  setPhoneNumber(`+91${text.replace(/^\+91/, '')}`);
                } else {
                  setPhoneNumber(text);
                }
              }}
              keyboardType="phone-pad"
              maxLength={13}
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#333533" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>{t.sendOtp}</Text>
            )}
          </TouchableOpacity>
        </>
      );
    } else {
      return (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t.otp}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#333533" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>{t.verifyOtp}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setAuthStep('input')}
          >
            <Text style={styles.linkButtonText}>Change Phone Number</Text>
          </TouchableOpacity>
          {/* Development credentials hint */}
          <Text style={styles.hintText}>
            🧪 Dev Mode: Use +911234567890 with OTP 123456 for testing
          </Text>
        </>
      );
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
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.3)" translucent />
      <View style={styles.overlay}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
        >
          {/* Language Toggle */}
          <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
            <Globe size={20} color="#e8eddf" />
            <Text style={styles.languageText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
          {/* Logo and Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>{t.appName}</Text>
            <Text style={styles.subtitle}>{t.welcome}</Text>
            <Text style={styles.description}>{t.subtitle}</Text>
          </View>
          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>
              {'Phone Login'}
            </Text>
            {renderPhoneAuth()}
          </View>
        </KeyboardAwareScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: height - 100,
  },
  languageToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(36, 36, 35, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  languageText: {
    color: '#e8eddf',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 4,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    color: '#e8eddf',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#e8eddf',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#e8eddf',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  loginCard: {
    backgroundColor: '#e8eddf',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333533',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333533',
  },
  primaryButton: {
    backgroundColor: '#f5cb5c',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333533',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#242423',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 52,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#242423',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#242423',
    textDecorationLine: 'underline',
  },
  hintText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});