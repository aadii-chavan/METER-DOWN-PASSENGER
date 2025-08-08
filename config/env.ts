// Environment configuration for Expo
const getEnvVar = (key: string): string => {
  return process.env[`EXPO_PUBLIC_${key}`] || process.env[key] || '';
};

export const ENV = {
  MAPBOX_ACCESS_TOKEN: getEnvVar('MAPBOX_ACCESS_TOKEN'),
  EXPO_PUBLIC_SUPABASE_KEY: getEnvVar('SUPABASE_KEY'),
  EXPO_PUBLIC_SUPABASE_URL: getEnvVar('SUPABASE_URL'),
};

export const validateEnv = () => {
  if (!ENV.MAPBOX_ACCESS_TOKEN) {
    console.warn('MAPBOX_ACCESS_TOKEN is not set. Location features may not work properly.');
  }
  if (!ENV.EXPO_PUBLIC_SUPABASE_KEY) {
    console.warn('EXPO_PUBLIC_SUPABASE_KEY is not set. Supabase features may not work properly.');
  }
  if (!ENV.EXPO_PUBLIC_SUPABASE_URL) {
    console.warn('EXPO_PUBLIC_SUPABASE_URL is not set. Supabase features may not work properly.');
  }
}; 