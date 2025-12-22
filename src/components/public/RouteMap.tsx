import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteMapProps {
  pickupCoords: Coordinates | null;
  destinationCoords: Coordinates | null;
  routeCoords: [number, number][];
}

// Fix for default markers (Leaflet + Vite)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getPrimaryStrokeColor() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();
  return raw ? `hsl(${raw})` : "hsl(220 90% 56%)";
}

export default function RouteMap({
  pickupCoords,
  destinationCoords,
  routeCoords,
}: RouteMapProps) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);

  // Init map once
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;

    const map = L.map(elRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([52.0, 10.0], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layers when props change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Markers
    if (pickupCoords) {
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], {
          icon: pickupIcon,
        }).addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    if (destinationCoords) {
      if (!destinationMarkerRef.current) {
        destinationMarkerRef.current = L.marker(
          [destinationCoords.lat, destinationCoords.lng],
          { icon: destinationIcon },
        ).addTo(map);
      } else {
        destinationMarkerRef.current.setLatLng([
          destinationCoords.lat,
          destinationCoords.lng,
        ]);
      }
    } else if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    // Route polyline
    if (routeCoords.length > 0) {
      const color = getPrimaryStrokeColor();
      if (!routeRef.current) {
        routeRef.current = L.polyline(routeCoords, {
          color,
          weight: 4,
          opacity: 0.85,
        }).addTo(map);
      } else {
        routeRef.current.setLatLngs(routeCoords);
        routeRef.current.setStyle({ color });
      }
    } else if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    // Fit bounds
    const points: [number, number][] = [];
    if (pickupCoords) points.push([pickupCoords.lat, pickupCoords.lng]);
    if (destinationCoords) points.push([destinationCoords.lat, destinationCoords.lng]);

    if (points.length >= 2) {
      map.fitBounds(points, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 10);
    }
  }, [pickupCoords, destinationCoords, routeCoords]);

  return <div ref={elRef} className="h-full w-full" />;
}
