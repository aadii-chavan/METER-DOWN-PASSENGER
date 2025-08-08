// Mapbox configuration
import { ENV } from './env';

export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: ENV.MAPBOX_ACCESS_TOKEN,
  BASE_URL: 'https://api.mapbox.com',
  GEOCODING_VERSION: 'v5',
};

export const getMapboxToken = (): string => {
  const token = MAPBOX_CONFIG.ACCESS_TOKEN;
  if (!token) {
    throw new Error('Mapbox access token is required for location features');
  }
  return token;
};

export const buildGeocodingUrl = (longitude: number, latitude: number): string => {
  const token = getMapboxToken();
  return `${MAPBOX_CONFIG.BASE_URL}/geocoding/${MAPBOX_CONFIG.GEOCODING_VERSION}/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=poi,address,neighborhood,place&limit=1`;
}; 