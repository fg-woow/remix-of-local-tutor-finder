import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TutorMapProps {
  tutorName: string;
  tutorLocation: string;
  latitude: number;
  longitude: number;
  userLatitude?: number;
  userLongitude?: number;
}

// Fix default Leaflet marker icons (Vite doesn't bundle them correctly)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "hue-rotate-[200deg] brightness-150",
});

const TutorMap = ({
  tutorName,
  tutorLocation,
  latitude,
  longitude,
  userLatitude,
  userLongitude,
}: TutorMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
    }).setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Tutor marker
    L.marker([latitude, longitude], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(
        `<div style="text-align:center;font-family:sans-serif;">
          <strong style="font-size:14px;">${tutorName}</strong><br/>
          <span style="color:#666;font-size:12px;">${tutorLocation}</span>
        </div>`
      )
      .openPopup();

    // User marker (if location available)
    if (userLatitude && userLongitude) {
      L.marker([userLatitude, userLongitude], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;font-family:sans-serif;">
            <strong style="font-size:14px;">📍 You are here</strong>
          </div>`
        );

      // Fit bounds to show both markers
      const bounds = L.latLngBounds(
        [latitude, longitude],
        [userLatitude, userLongitude]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, userLatitude, userLongitude, tutorName, tutorLocation]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[300px] rounded-lg overflow-hidden border shadow-sm z-0"
      style={{ minHeight: "300px" }}
    />
  );
};

export default TutorMap;
