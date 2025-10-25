"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = icon;

interface Resource {
  id: number;
  name: string;
  type: string;
  pricePerDay: number;
  location: string;
  capacity: string;
  latitude?: number;
  longitude?: number;
}

interface MapViewProps {
  resources: Resource[];
}

export default function MapView({ resources }: MapViewProps) {
  // Filter resources with valid coordinates
  const resourcesWithCoords = resources.filter(
    (r) => r.latitude && r.longitude && !isNaN(r.latitude) && !isNaN(r.longitude)
  );

  // Default center (India - Punjab region)
  const defaultCenter: [number, number] = [30.9010, 75.8573];
  const center = resourcesWithCoords.length > 0 
    ? [resourcesWithCoords[0].latitude!, resourcesWithCoords[0].longitude!] as [number, number]
    : defaultCenter;

  if (resourcesWithCoords.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground">No resources with location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {resourcesWithCoords.map((resource) => (
          <Marker
            key={resource.id}
            position={[resource.latitude!, resource.longitude!]}
          >
            <Popup>
              <div className="space-y-2 p-2">
                <div>
                  <h3 className="font-semibold">{resource.name}</h3>
                  <Badge className="mt-1">{resource.type}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Location:</span> {resource.location}</p>
                  <p><span className="text-muted-foreground">Capacity:</span> {resource.capacity}</p>
                  <p><span className="text-muted-foreground">Price:</span> <span className="font-bold text-green-600">₹{resource.pricePerDay}/day</span></p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
