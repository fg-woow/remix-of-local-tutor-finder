import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ArrowLeft, Navigation } from "lucide-react";
import { mockTutors } from "@/data/tutors";
import { getTutorProfiles } from "@/lib/api";
import type { Profile } from "@/lib/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistanceKm, getFallbackCoordinates, CITY_COORDINATES } from "@/lib/geolocation";
import { useTranslation } from "react-i18next";

// Fix default Leaflet marker icons
const tutorIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  html: `<div style="
    width: 18px;
    height: 18px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(59,130,246,0.5);
  "></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface MapTutor {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  avatar: string;
  distance?: number;
}

const MapView = () => {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [tutors, setTutors] = useState<MapTutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<MapTutor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userLocation } = useUserLocation();

  // Fetch and merge tutors
  useEffect(() => {
    const fetchTutors = async () => {
      const { data: dbProfiles } = await getTutorProfiles();
      const dbIds = new Set((dbProfiles || []).map((p: Profile) => p.user_id));

      const dbTutorList: MapTutor[] = (dbProfiles || [])
        .map((p: Profile) => {
          let lat = p.latitude;
          let lng = p.longitude;
          
          if (!lat || !lng) {
            const fallback = getFallbackCoordinates(p.location || "");
            lat = fallback.latitude;
            lng = fallback.longitude;
          }
          let distance: number | undefined;
          if (userLocation && lat && lng) {
            distance = calculateDistanceKm(userLocation, {
              latitude: lat,
              longitude: lng,
            });
          }
          return {
            id: p.user_id,
            name: p.full_name,
            location: p.location || "Istanbul",
            lat: lat!,
            lng: lng!,
            subjects: p.subjects || [],
            hourlyRate: p.hourly_rate || 0,
            rating: 5.0,
            avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=0d9488&color=fff`,
            distance,
          };
        });

      const mockTutorList: MapTutor[] = mockTutors
        .filter((t) => !dbIds.has(t.id))
        .map((t) => {
          const coords = CITY_COORDINATES[t.location];
          if (!coords) return null;
          let distance: number | undefined;
          if (userLocation) {
            distance = calculateDistanceKm(userLocation, coords);
          }
          return {
            id: t.id,
            name: t.name,
            location: t.location,
            lat: coords.latitude,
            lng: coords.longitude,
            subjects: t.subjects,
            hourlyRate: t.hourlyRate,
            rating: t.rating,
            avatar: t.avatar,
            distance,
          };
        })
        .filter(Boolean) as MapTutor[];

      setTutors([...dbTutorList, ...mockTutorList]);
      setIsLoading(false);
    };

    fetchTutors();
  }, [userLocation]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || tutors.length === 0) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: true,
      zoomControl: true,
    }).setView([39.8283, -98.5795], 4); // Center of US

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add tutor markers
    const markers: L.LatLng[] = [];
    tutors.forEach((tutor) => {
      const marker = L.marker([tutor.lat, tutor.lng], { icon: tutorIcon })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;font-family:sans-serif;min-width:160px;">
            <img src="${tutor.avatar}" alt="${tutor.name}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;margin:0 auto 8px;" />
            <strong style="font-size:14px;display:block;">${tutor.name}</strong>
            <span style="color:#666;font-size:12px;">${tutor.location}</span><br/>
            <span style="color:#888;font-size:11px;">${tutor.subjects.slice(0, 2).join(", ")}</span><br/>
            <strong style="color:#0d9488;font-size:13px;">$${tutor.hourlyRate}/hr</strong>
            ${tutor.distance !== undefined ? `<br/><span style="color:#3b82f6;font-size:11px;">📍 ${Math.round(tutor.distance)} km away</span>` : ""}
            <br/><a href="/tutors/${tutor.id}" style="color:#7c3aed;font-size:12px;text-decoration:underline;">View Profile →</a>
          </div>`
        );

      marker.on("click", () => {
        setSelectedTutor(tutor);
      });

      markers.push(L.latLng(tutor.lat, tutor.lng));
    });

    // Add user marker
    if (userLocation) {
      L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
      })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;font-family:sans-serif;">
            <strong>📍 Your Location</strong>
          </div>`
        );
      markers.push(L.latLng(userLocation.latitude, userLocation.longitude));
    }

    // Fit bounds
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [tutors, userLocation]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/tutors">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("featured.view_all", { defaultValue: "Back to list" })}
                </Link>
              </Button>
              <h1 className="text-xl font-bold">{t("map.title", { defaultValue: "Map View" })}</h1>
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {tutors.length} tutors
              </Badge>
            </div>
            {userLocation && (
              <Badge variant="default" className="gap-1 bg-blue-500">
                <Navigation className="h-3 w-3" />
                Location enabled
              </Badge>
            )}
          </div>
        </div>

        {/* Map + Sidebar */}
        <div className="container pb-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_350px]">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {isLoading ? (
                <div className="flex h-[600px] items-center justify-center rounded-lg border bg-muted">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 animate-bounce" />
                    <p>Loading map...</p>
                  </div>
                </div>
              ) : (
                <div
                  ref={mapRef}
                  className="h-[600px] rounded-lg overflow-hidden border shadow-sm"
                  style={{ minHeight: "600px", zIndex: 0 }}
                />
              )}
            </motion.div>

            {/* Sidebar - Tutor List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              <h3 className="text-sm font-medium text-muted-foreground px-1">
                {userLocation ? "Sorted by distance" : "All tutors"}
              </h3>
              {[...tutors]
                .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
                .map((tutor) => (
                  <Card
                    key={tutor.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTutor?.id === tutor.id
                        ? "ring-2 ring-primary shadow-md"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedTutor(tutor);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView(
                          [tutor.lat, tutor.lng],
                          14,
                          { animate: true }
                        );
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={tutor.avatar}
                          alt={tutor.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {tutor.name}
                            </h4>
                            <span className="text-sm font-bold text-primary ml-2">
                              ${tutor.hourlyRate}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{tutor.location}</span>
                            {tutor.distance !== undefined && (
                              <span className="text-primary font-medium ml-1">
                                • {tutor.distance < 10
                                  ? `${tutor.distance.toFixed(1)} km`
                                  : `${Math.round(tutor.distance)} km`}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{tutor.rating}</span>
                            <div className="flex gap-1 ml-1">
                              {tutor.subjects.slice(0, 2).map((s) => (
                                <Badge
                                  key={s}
                                  variant="outline"
                                  className="text-[10px] px-1 py-0"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="w-full mt-2" asChild>
                        <Link to={`/tutors/${tutor.id}`}>View Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MapView;
