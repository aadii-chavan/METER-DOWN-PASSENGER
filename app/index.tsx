import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { router } from 'expo-router';
import { Globe, Phone, User } from 'lucide-react-native';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// i18n translations
type TranslationKeys = 'en' | 'hi';
type Translations = {
  [key in TranslationKeys]: {
    appName: string;
    enterMobile: string;
    mobileNumber: string;
    otp: string;
    continue: string;
    sendOtp: string;
    verifyOtp: string;
    loading: string;
    consentText: string;
    changeNumber: string;
  }
};
const translations: Translations = {
  en: {
    appName: 'Meter Down',
    enterMobile: 'Enter your mobile number',
    mobileNumber: 'Mobile number',
    otp: 'Enter OTP',
    continue: 'Continue',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    loading: 'Please wait...',
    consentText: 'By proceeding, you consent to get calls, WhatsApp or SMS/RCS messages, including by automated means, from Meter Down and its affiliates to the number provided.',
    changeNumber: 'Change mobile number',
  },
  hi: {
    appName: 'मीटर डाउन',
    enterMobile: 'अपना मोबाइल नंबर दर्ज करें',
    mobileNumber: 'मोबाइल नंबर',
    otp: 'OTP दर्ज करें',
    continue: 'जारी रखें',
    sendOtp: 'OTP भेजें',
    verifyOtp: 'OTP सत्यापित करें',
    loading: 'कृपया प्रतीक्षा करें...',
    consentText: 'आगे बढ़कर, आप प्रदान किए गए नंबर पर मीटर डाउन और इसकी सहयोगी कंपनियों से कॉल, व्हाट्सऐप या SMS/RCS संदेश प्राप्त करने की सहमति देते हैं।',
    changeNumber: 'मोबाइल नंबर बदलें',
  },
};

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [language, setLanguage] = useState<TranslationKeys>('en');
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
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t.enterMobile}</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countrySelector}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder={t.mobileNumber}
              value={phoneNumber.replace('+91', '')}
              onChangeText={(text) => {
                const cleanText = text.replace(/[^0-9]/g, '');
                setPhoneNumber(`+91${cleanText}`);
              }}
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.contactIcon}>
              <User size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.continueButton, (!phoneNumber || phoneNumber.length < 13) && styles.disabledButton]}
            onPress={handleSendOtp}
            disabled={loading || !phoneNumber || phoneNumber.length < 13}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>{t.continue}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.consentText}>{t.consentText}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>We've sent a code to {phoneNumber}</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={[styles.continueButton, (!otp || otp.length !== 6) && styles.disabledButton]}
            onPress={handleVerifyOtp}
            disabled={loading || !otp || otp.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>{t.verifyOtp}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changeNumberButton}
            onPress={() => setAuthStep('input')}
          >
            <Text style={styles.changeNumberText}>{t.changeNumber}</Text>
          </TouchableOpacity>
          {/* Development credentials hint */}
          <Text style={styles.demoHint}>
            🧪 Dev Mode: Use +911234567890 with OTP 123456 for testing
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Language Toggle */}
      <TouchableOpacity style={styles.languageToggle} onPress={toggleLanguage}>
        <Globe size={20} color="#000" />
        <Text style={styles.languageText}>{language.toUpperCase()}</Text>
      </TouchableOpacity>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      >
        {renderPhoneAuth()}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  languageToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  languageText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 100,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f0f0f0',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contactIcon: {
    paddingHorizontal: 16,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    marginBottom: 24,
    backgroundColor: '#fff',
    textAlign: 'center',
    letterSpacing: 8,
  },
  continueButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#4285f4',
    marginRight: 16,
  },
  socialButtonLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  findAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 32,
  },
  findAccountText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginLeft: 8,
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  changeNumberText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    textDecorationLine: 'underline',
  },
  consentText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: 18,
    textAlign: 'left',
  },
  demoHint: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#f5cb5c',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
    backgroundColor: '#333533',
    padding: 12,
    borderRadius: 8,
  },
});