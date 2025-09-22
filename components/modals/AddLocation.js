"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert,AlertTitle } from "@/components/ui/alert";
import { validateForm } from "@/utils/formValidator";
import { useMutation } from "@/hooks/useMutation";
import { useFormState } from "@/hooks/useFormState";
import { PriceField } from "../common/PriceField";
import {WarningDiamondIcon} from "@phosphor-icons/react"
import dynamic from "next/dynamic";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
const LocationMap = dynamic(() => import("@/components/common/LocationMap"), {
  ssr: false,
});

export default function AddLocation({ open, setAddLocationOpen, vendorId }) {
  const [formErrors, setFormErrors] = useState({});
  const [offerAtClient, setOfferAtClient] = useState(false);
  const [offerAtBusiness, setOfferAtBusiness] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const {
    formState: locationForm,
    handleChange: handleLocationChange,
    resetForm,
  } = useFormState({
    id: "",
    address: "",
    city: "",
    postal_code: "",
    latitude: "",
    longitude: "",
    offerAtBusiness: offerAtBusiness,
    offerAtClient: offerAtClient,
  });

  const validationRules = {
    address: { required: true, message: "Address is required" },
    postal_code: { required: true, message: "Postal Code is required" },
    city: { required: true, message: "City is required" },
  };

  const {
    mutate: addLocation,
    loading: addLoading,
    error: addError,
  } = useMutation(`/api/locations/create`, { method: "POST" });

  // Debounce function for suggestions
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const fetchSuggestions = debounce(async (value) => {
    if (value.length > 2) {
      setSuggestionsLoading(true);
      const { OpenStreetMapProvider } = await import("leaflet-geosearch");
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: value });
      setSuggestions(results);
      setShowSuggestions(true);
      setSuggestionsLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
    }
  }, 400);

  // Search button handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const { OpenStreetMapProvider } = await import("leaflet-geosearch");
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    if (results && results.length > 0) {
      const { x, y, label } = results[0];
      setSearchedLocation({ lat: y, lng: x, label });
      setMapPosition([y, x]);
      handleLocationChange({ target: { name: "latitude", value: y } });
      handleLocationChange({ target: { name: "longitude", value: x } });
      handleLocationChange({ target: { name: "address", value: label } });
      setSearchQuery(label);
      setShowMap(true);
      setShowSuggestions(false);
    }
  };

  // Add location submit handler
  const handleAddLocation = async (e) => {
    e.preventDefault();
    const errors = validateForm(locationForm, validationRules);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      await addLocation({ ...locationForm, vendorId });
      resetForm();
      setAddLocationOpen(false);
    } catch (err) {
      console.error("Add location error: ", err);
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setAddLocationOpen}>
      <form onSubmit={handleAddLocation}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add Business Location</DialogTitle>
          </DialogHeader>

          {addError && (
            <Alert variant="destructive" className="flex items-center">
              <WarningDiamondIcon size={20} className="!top-[10px]" />
              <AlertTitle>{addError.message}</AlertTitle>
            </Alert>
          )}

          {/* --- Service Options --- */}
          <div className="flex flex-col space-y-3">
            <Label className="text-md">
              Where does this business offer services?
            </Label>
            <div className="grid grid-cols-12">
              <div className="flex items-center space-x-3 col-span-12 md:col-span-6">
                <Checkbox
                  id="businessPlace"
                  checked={offerAtBusiness}
                  onCheckedChange={(val) => {
                    setOfferAtBusiness(!!val);
                    handleLocationChange({
                      target: { name: "offerAtBusiness", value: !!val },
                    });
                  }}
                />
                <Label htmlFor="businessPlace" className="cursor-pointer">
                  <span className="text-base mb-2 block">
                    At Business Location
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Clients visit your store or office
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 col-span-12 md:col-span-6">
                <Checkbox
                  id="clientsPlace"
                  checked={offerAtClient}
                  onCheckedChange={(val) => {
                    setOfferAtClient(!!val);
                    handleLocationChange({
                      target: { name: "offerAtClient", value: !!val },
                    });
                  }}
                />
                <Label htmlFor="clientsPlace" className="cursor-pointer">
                  <span className="text-base mb-2 block">
                    At Client’s Place
                  </span>
                  <p className="text-xs text-muted-foreground">
                    We travel to your clients’ locations
                  </p>
                </Label>
              </div>
            </div>
          </div>

          {/* --- Location Search & Map --- */}
          <div className="flex flex-col mb-2">
            <label className="text-md">Where is this business located?</label>
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <Input
                  name="search"
                  value={searchQuery}
                  className="flex-1"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  placeholder="Search address..."
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>
              {showSuggestions && (
                <div className="bg-white border rounded shadow mt-1 absolute top-9 z-[111111] w-full max-h-80 overflow-y-auto">
                  {suggestionsLoading && (
                    <div className="px-3 py-2 text-gray-500">Loading...</div>
                  )}
                  {!suggestionsLoading &&
                    suggestions.length > 0 &&
                    suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setSearchQuery(item.label);
                          setSearchedLocation({
                            lat: item.y,
                            lng: item.x,
                            label: item.label,
                          });
                          setMapPosition([item.y, item.x]);
                          handleLocationChange({
                            target: { name: "latitude", value: item.y },
                          });
                          handleLocationChange({
                            target: { name: "longitude", value: item.x },
                          });
                          handleLocationChange({
                            target: { name: "address", value: item.label },
                          });
                          setShowMap(true);
                          setShowSuggestions(false);
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                  {!suggestionsLoading && suggestions.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">
                      No results found
                    </div>
                  )}
                </div>
              )}
              {showMap && mapPosition && (
                <LocationMap
                  mapPosition={mapPosition}
                  mapRef={mapRef}
                  locationForm={locationForm}
                  handleLocationChange={handleLocationChange}
                  updateSearchQuery={setSearchQuery}
                  setMapPosition={setMapPosition}
                />
              )}
            </div>
          </div>

          {/* --- Business Location Details --- */}
          {offerAtBusiness && (
            <div className="border p-4 rounded-lg space-y-3">
              <div className="mb-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  onChange={handleLocationChange}
                  value={locationForm.address}
                />
                {formErrors?.address && (
                  <p className="text-sm text-red-500">
                    {formErrors.address}
                  </p>
                )}
              </div>
              <div className="mb-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  onChange={handleLocationChange}
                  value={locationForm.city}
                />
                {formErrors?.city && (
                  <p className="text-sm text-red-500">
                    {formErrors.city}
                  </p>
                )}
              </div>
              <div className="mb-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  placeholder="Postal Code"
                  onChange={handleLocationChange}
                  value={locationForm.postal_code}
                />
                {formErrors?.postal_code && (
                  <p className="text-sm text-red-500">
                    {formErrors.postal_code}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* --- Client Service Areas --- */}
          {offerAtClient && (
            <div className="">
              <div className="mb-2">
                <PriceField label={"Travel Fee"} />
              </div>
              <div className="mb-2">
                <Label htmlFor="serviceAreas">
                  Maximum Travel Distance
                </Label>
                <Select id="" name="" value="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem>10 Miles</SelectItem>
                    <SelectItem>20 Miles</SelectItem>
                    <SelectItem>30 Miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAddLocationOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddLocation}>
              {addLoading ? "Saving..." : "Save Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}