import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationMap({
  mapPosition,
  mapRef,
  locationForm,
  updateSearchQuery,
  handleLocationChange,
  setMapPosition,
}) {
  // Handler for marker drag
const handleMarkerDrag = async (e) => {
  const latlng = e.target.getLatLng();
  handleLocationChange({ target: { name: "latitude", value: latlng.lat } });
  handleLocationChange({ target: { name: "longitude", value: latlng.lng } });

  // Reverse geocode to get address details
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`
  );
  const data = await res.json();
  if (data && data.display_name) {
    handleLocationChange({ target: { name: "address", value: data.display_name } });
    if (data.address) {
      if (data.address.city || data.address.town || data.address.village) {
        handleLocationChange({
          target: {
            name: "city",
            value: data.address.city || data.address.town || data.address.village,
          },
        });
      }
      if (data.address.postcode) {
        handleLocationChange({
          target: { name: "postal_code", value: data.address.postcode },
        });
      }
      if(data.address.country){
        handleLocationChange({
          target: {name: "country", value: data.address.country}
        })
      }
      if(data.address.state){
        handleLocationChange({
          target: {name: "state", value: data.address.state}
        })
      }
    }
    if (typeof updateSearchQuery === "function") {
      updateSearchQuery(data.display_name);
    }
  }
};

  return (
    <MapContainer
      center={mapPosition}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {locationForm.latitude && locationForm.longitude && (
        <Marker
          position={[locationForm.latitude, locationForm.longitude]}
          draggable={true}
          eventHandlers={{
            dragend: handleMarkerDrag,
          }}
        />
      )}
    </MapContainer>
  );
}
