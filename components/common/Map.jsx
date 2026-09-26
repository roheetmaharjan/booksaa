// components/MyMap.jsx
'use client';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '400px' };
const center = { lat: 27.7172, lng: 85.3240 }; // Kathmandu

export default function MyMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      <MarkerF position={center} />
    </GoogleMap>
  );
}