import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { LocationService } from '../utils/locationService';

interface LocationButtonProps {
  onLocationReceived: (address: string) => void;
  onError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export default function LocationButton({ 
  onLocationReceived, 
  onError, 
  size = 'medium',
  disabled = false 
}: LocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetLocation = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    // Show immediate feedback for longer requests
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Location request taking longer than expected...');
      }
    }, 3000);

    try {
      const address = await LocationService.getCurrentAddress();
      clearTimeout(timeoutId);
      if (address) {
        onLocationReceived(address);
      } else {
        onError?.('Unable to get your current location. Please ensure your device GPS is enabled, location permission is granted, and you are in an area with good signal. Try again or check your device settings.');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Location button error:', error)
      let message = 'Unable to get your current location.';
      if (error?.message?.includes('timeout')) {
        message = 'Location request timed out. Please move to an open area or check your GPS settings.';
      } else if (error?.message?.includes('permission')) {
        message = 'Location permission denied. Please enable location access in your device settings.';
      }
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, iconSize: 16 };
      case 'large':
        return { width: 48, height: 48, iconSize: 24 };
      default:
        return { width: 40, height: 40, iconSize: 20 };
    }
  };

  const { width, height, iconSize } = getButtonSize();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width, height },
        disabled && styles.disabled
      ]}
      onPress={handleGetLocation}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#f5cb5c" />
      ) : (
        <MapPin size={iconSize} color="#f5cb5c" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  disabled: {
    opacity: 0.5,
  },
}); 