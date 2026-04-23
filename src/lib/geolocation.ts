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
  "Kadıköy, Istanbul": { latitude: 40.9901, longitude: 29.0292 },
  "Beşiktaş, Istanbul": { latitude: 41.0428, longitude: 29.0077 },
  "Şişli, Istanbul": { latitude: 41.0601, longitude: 28.9877 },
  "Üsküdar, Istanbul": { latitude: 41.0270, longitude: 29.0152 },
  "Fatih, Istanbul": { latitude: 41.0113, longitude: 28.9405 },
  "Beyoğlu, Istanbul": { latitude: 41.0369, longitude: 28.9775 },
  "Bakırköy, Istanbul": { latitude: 40.9888, longitude: 28.8708 },
  "Maltepe, Istanbul": { latitude: 40.9255, longitude: 29.1415 },
  "Sarıyer, Istanbul": { latitude: 41.1685, longitude: 29.0573 },
  "Ataşehir, Istanbul": { latitude: 40.9839, longitude: 29.1082 },
  "Ümraniye, Istanbul": { latitude: 41.0256, longitude: 29.0987 },
  "Kartal, Istanbul": { latitude: 40.8872, longitude: 29.1932 },
  "Bağcılar, Istanbul": { latitude: 41.0335, longitude: 28.8579 },
};

/**
 * Smart fallback coordinate finder.
 * Attempts exact match, then fuzzy match based on district name.
 */
export function getFallbackCoordinates(location: string): Coordinates {
  if (!location) return { latitude: 41.0082, longitude: 28.9784 }; // Istanbul center (Fatih)

  const normalized = location.toLowerCase();

  // Try exact match first
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (key.toLowerCase() === normalized) {
      return coords;
    }
  }

  // Try partial match (e.g. user entered "İstanbul, Bağcılar" or just "Bağcılar")
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    // Get just the district part (e.g. "Bağcılar")
    const district = key.split(',')[0].trim().toLowerCase();
    
    // Turkish character normalizations for robust searching
    const distNormalized = district.replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c');
    const locNormalized = normalized.replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c');

    if (locNormalized.includes(distNormalized)) {
      return coords;
    }
  }

  // Final fallback if nothing matches
  return { latitude: 41.0082, longitude: 28.9784 };
}
