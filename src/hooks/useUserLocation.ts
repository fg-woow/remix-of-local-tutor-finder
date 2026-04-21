import { useState, useEffect } from "react";
import { Coordinates, getUserLocation } from "@/lib/geolocation";

/**
 * Custom hook that provides the user's geolocation.
 * Requests permission on mount and caches the result.
 */
export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Check if we already have cached location
    const cached = sessionStorage.getItem("user_location");
    if (cached) {
      try {
        setUserLocation(JSON.parse(cached));
        setIsLoading(false);
        return;
      } catch {
        // Invalid cache, proceed to fetch
      }
    }

    getUserLocation().then((loc) => {
      if (loc) {
        setUserLocation(loc);
        sessionStorage.setItem("user_location", JSON.stringify(loc));
      } else {
        setPermissionDenied(true);
      }
      setIsLoading(false);
    });
  }, []);

  return { userLocation, isLoading, permissionDenied };
}
