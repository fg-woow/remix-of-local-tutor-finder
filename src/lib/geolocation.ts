/**
 * Geolocation & Distance Utilities
 * 
 * Uses the Haversine formula for distance calculation
 * and the browser Geolocation API for user position.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using the Haversine formula.
 * Returns distance in miles.
 */
export function calculateDistanceMiles(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate distance in kilometers.
 */
export function calculateDistanceKm(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return "< 1 km away";
  } else if (km < 10) {
    return `${km.toFixed(1)} km away`;
  } else {
    return `${Math.round(km)} km away`;
  }
}

/**
 * Get the user's current geolocation via the browser API.
 * Falls back gracefully if denied or unavailable.
 */
export function getUserLocation(): Promise<Coordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Permission denied or error — fail silently
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 600000, // Cache for 10 minutes
      }
    );
  });
}

/**
 * Location coordinates for known cities (fallback when no DB coords).
 */
export const CITY_COORDINATES: Record<string, Coordinates> = {
  "Manhattan, NY": { latitude: 40.7580, longitude: -73.9855 },
  "Brooklyn, NY": { latitude: 40.6782, longitude: -73.9442 },
  "Queens, NY": { latitude: 40.7282, longitude: -73.7949 },
  "San Francisco, CA": { latitude: 37.7749, longitude: -122.4194 },
  "Los Angeles, CA": { latitude: 34.0522, longitude: -118.2437 },
  "Chicago, IL": { latitude: 41.8781, longitude: -87.6298 },
  "Boston, MA": { latitude: 42.3601, longitude: -71.0589 },
  "Seattle, WA": { latitude: 47.6062, longitude: -122.3321 },
};
