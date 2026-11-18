import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import {
  Check,
  Copy,
  Layers,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Search,
  Trash2,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Constants (kept outside the component so references stay stable)           */
/* -------------------------------------------------------------------------- */

// Every component in the app that loads Google Maps must use the same
// loader id and the same libraries array, otherwise the loader throws.
const LOADER_ID = "google-map-script";
const LIBRARIES = ["places"];

const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 };
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 17;

// Restrict search suggestions to these countries (ISO 3166-1 alpha-2).
// Pass `regionCodes={[]}` to search worldwide.
const DEFAULT_REGION_CODES = ["in"];

const MARKER_COLOR = "#ff1a1a"; // pin colour

const MAP_FRAME_STYLE = { width: "100%", height: "100%" };

const BASE_MAP_OPTIONS = {
  streetViewControl: false,
  mapTypeControl: false, // replaced by our own Map / Satellite toggle
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isEmpty = (value) =>
  value === "" || value === null || value === undefined;

const parseCoordinates = (latitude, longitude) => {
  if (isEmpty(latitude) || isEmpty(longitude)) return null;

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { lat, lng };
};

const coordinateKey = ({ lat, lng }) => `${lat},${lng}`;

/* -------------------------------------------------------------------------- */
/* Small UI pieces                                                            */
/* -------------------------------------------------------------------------- */

const MapButton = ({ label, onClick, active, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-lg backdrop-blur transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? "border-primary-500 bg-primary-500 text-white"
        : "border-slate-200 bg-white/95 text-slate-600 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:text-white"
    }`}
  >
    {children}
  </button>
);

const CoordinateItem = ({ label, value }) => (
  <span className="flex items-center gap-2 px-3 py-2">
    <span className="text-slate-400">{label}</span>
    <span className="font-mono font-medium tabular-nums text-slate-700 dark:text-slate-200">
      {value}
    </span>
  </span>
);

/* -------------------------------------------------------------------------- */
/* Place search (Places API "New" autocomplete with a custom dropdown)        */
/* -------------------------------------------------------------------------- */

const PlaceSearch = ({ regionCodes, onPlaceSelect }) => {
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const sessionTokenRef = useRef(null);
  const requestIdRef = useRef(0);
  const skipNextSearchRef = useRef(false);

  // Fetch suggestions (debounced)
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return undefined;
    }

    const input = query.trim();

    if (input.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const { AutocompleteSuggestion, AutocompleteSessionToken } =
          window.google.maps.places;

        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        const { suggestions } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: sessionTokenRef.current,
            ...(regionCodes?.length
              ? { includedRegionCodes: regionCodes }
              : {}),
          });

        if (requestId !== requestIdRef.current) return;

        setResults(
          suggestions.filter((item) => item.placePrediction).slice(0, 6),
        );
        setActiveIndex(-1);
        setError("");
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("Place search failed:", err);
        setResults([]);
        setError(
          "Search is unavailable. Check that Places API (New) is enabled for your API key.",
        );
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, regionCodes]);

  const handleSelect = useCallback(
    async (suggestion) => {
      const prediction = suggestion?.placePrediction;
      if (!prediction) return;

      skipNextSearchRef.current = true;
      setQuery(prediction.text.text);
      setResults([]);
      setOpen(false);
      setLoading(true);

      try {
        const place = prediction.toPlace();
        await place.fetchFields({
          fields: ["location", "formattedAddress", "displayName"],
        });

        // A new session starts after a place has been chosen.
        sessionTokenRef.current = null;

        if (place.location) {
          onPlaceSelect({
            lat: place.location.lat(),
            lng: place.location.lng(),
            address: place.formattedAddress || prediction.text.text,
          });
        }
      } catch (err) {
        console.error("Place details failed:", err);
        setError("Couldn't load that place. Please try another result.");
        setOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [onPlaceSelect],
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      // Never let Enter submit a parent <form> from the search box.
      event.preventDefault();
      if (open && results.length) {
        handleSelect(results[activeIndex >= 0 ? activeIndex : 0]);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError("");
    setOpen(false);
  };

  const showDropdown = open && (results.length > 0 || Boolean(error));

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 shadow-lg backdrop-blur transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900/95">
        <Search size={17} className="shrink-0 text-slate-400" />

        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search for an address or place"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
        />

        {loading ? (
          <LoaderCircle
            size={16}
            className="shrink-0 animate-spin text-slate-400"
          />
        ) : (
          query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )
        )}
      </div>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          {error && (
            <li className="px-3 py-2.5 text-xs text-red-600 dark:text-red-400">
              {error}
            </li>
          )}

          {results.map((suggestion, index) => {
            const prediction = suggestion.placePrediction;
            const isActive = index === activeIndex;

            return (
              <li
                key={prediction.placeId}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isActive}
                // mouseDown (not click) so the input doesn't blur first
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(suggestion);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${
                  isActive ? "bg-slate-100 dark:bg-slate-800" : ""
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <MapPin size={15} />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {prediction.mainText?.text ?? prediction.text.text}
                  </span>
                  {prediction.secondaryText?.text && (
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {prediction.secondaryText.text}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Location picker                                                            */
/* -------------------------------------------------------------------------- */

const LocationPicker = ({
  latitude,
  longitude,
  onLocationSelect,
  height = 420,
  regionCodes = DEFAULT_REGION_CODES,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: LOADER_ID,
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  // Address we already know (from search), so we can skip reverse geocoding.
  const knownAddressRef = useRef(null);

  const selectedLocation = useMemo(
    () => parseCoordinates(latitude, longitude),
    [latitude, longitude],
  );

  // The map's center/zoom props are set once. After that we move the map
  // ourselves, so clicking to drop a pin never makes the map jump around.
  const [initialView] = useState(() => ({
    center: selectedLocation ?? DEFAULT_CENTER,
    zoom: selectedLocation ? SELECTED_ZOOM - 1 : DEFAULT_ZOOM,
  }));

  const mapOptions = useMemo(
    () => ({
      ...BASE_MAP_OPTIONS,
      mapTypeId: isSatellite ? "hybrid" : "roadmap",
    }),
    [isSatellite],
  );

  const markerIcon = useMemo(() => {
    if (!isLoaded) return undefined;

    const pinPath = `
    M24 1
    C10.75 1 0 11.75 0 25
    C0 40 17 58 24 67
    C31 58 48 40 48 25
    C48 11.75 37.25 1 24 1
    Z
  `;

    const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="80"
      viewBox="-8 -4 64 80"
    >
      <defs>
        <linearGradient id="pinShade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.22" />
          <stop offset="45%" stop-color="#000000" stop-opacity="0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.16" />
        </linearGradient>

        <filter id="pinShadow" x="-40%" y="-20%" width="180%" height="160%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            flood-color="#000000"
            flood-opacity="0.22"
          />
        </filter>
      </defs>

      <!-- Pin body (colour comes from MARKER_COLOR) -->
      <path d="${pinPath}" fill="${MARKER_COLOR}" filter="url(#pinShadow)" />

      <!-- Edge shading -->
      <path d="${pinPath}" fill="url(#pinShade)" />

      <!-- Hollow white centre -->
      <circle cx="24" cy="25" r="13.5" fill="#ffffff" />
    </svg>
  `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new window.google.maps.Size(56, 70),
      anchor: new window.google.maps.Point(28, 62), // tip of the pin
    };
  }, [isLoaded]);

  const onMapLoad = useCallback((instance) => setMap(instance), []);
  const onMapUnmount = useCallback(() => setMap(null), []);

  // If the coordinates change from outside (e.g. typed into form fields) and
  // the point is off-screen, bring it into view.
  useEffect(() => {
    if (!map || !selectedLocation) return;

    const bounds = map.getBounds();
    if (bounds && !bounds.contains(selectedLocation)) {
      map.panTo(selectedLocation);
      if ((map.getZoom() ?? 0) < 14) map.setZoom(SELECTED_ZOOM);
    }
  }, [map, selectedLocation]);

  // Reverse geocode the selected point into a readable address.
  useEffect(() => {
    if (!isLoaded || !selectedLocation) {
      setAddress("");
      setAddressLoading(false);
      return undefined;
    }

    const known = knownAddressRef.current;
    if (known && known.key === coordinateKey(selectedLocation)) {
      setAddress(known.address);
      setAddressLoading(false);
      return undefined;
    }

    let cancelled = false;
    setAddressLoading(true);

    const timer = setTimeout(() => {
      new window.google.maps.Geocoder()
        .geocode({ location: selectedLocation })
        .then(({ results }) => {
          if (!cancelled) setAddress(results?.[0]?.formatted_address ?? "");
        })
        .catch(() => {
          if (!cancelled) setAddress("");
        })
        .finally(() => {
          if (!cancelled) setAddressLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isLoaded, selectedLocation]);

  const selectPoint = useCallback(
    (lat, lng) => {
      setGeoError("");
      onLocationSelect({
        latitude: lat.toFixed(7),
        longitude: lng.toFixed(7),
      });
    },
    [onLocationSelect],
  );

  const handleMapClick = useCallback(
    (event) => {
      if (!event.latLng) return;
      selectPoint(event.latLng.lat(), event.latLng.lng());
    },
    [selectPoint],
  );

  const handlePlaceSelect = useCallback(
    ({ lat, lng, address: placeAddress }) => {
      knownAddressRef.current = {
        key: coordinateKey({
          lat: Number(lat.toFixed(7)),
          lng: Number(lng.toFixed(7)),
        }),
        address: placeAddress,
      };

      map?.panTo({ lat, lng });
      map?.setZoom(SELECTED_ZOOM);
      selectPoint(lat, lng);
    },
    [map, selectPoint],
  );

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support location access.");
      return;
    }

    setLocating(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;

        map?.panTo({ lat, lng });
        map?.setZoom(SELECTED_ZOOM);
        selectPoint(lat, lng);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setGeoError(
          error.code === error.PERMISSION_DENIED
            ? "Location access is blocked. Allow it in your browser settings and try again."
            : "Couldn't get your current location. Try again or pick a point on the map.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleCopy = async () => {
    if (!selectedLocation) return;

    try {
      await navigator.clipboard.writeText(
        `${selectedLocation.lat}, ${selectedLocation.lng}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be unavailable on insecure origins */
    }
  };

  const handleClearLocation = () => {
    knownAddressRef.current = null;
    setGeoError("");
    onLocationSelect({ latitude: "", longitude: "" });
  };

  /* ------------------------------ Render states ----------------------------- */

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
        Unable to load Google Maps. Check your API key, billing and allowed
        referrers in Google Cloud Console.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
      >
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={18} className="animate-spin" />
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map frame */}
      <div
        style={{ height }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700"
      >
        <GoogleMap
          mapContainerStyle={MAP_FRAME_STYLE}
          center={initialView.center}
          zoom={initialView.zoom}
          options={mapOptions}
          onLoad={onMapLoad}
          onUnmount={onMapUnmount}
          onClick={handleMapClick}
        >
          {selectedLocation && (
            <MarkerF
              position={selectedLocation}
              icon={markerIcon}
              draggable
              onDragEnd={handleMapClick}
              title="Selected site location"
            />
          )}
        </GoogleMap>

        {/* Search */}
        <div className="absolute left-3 right-16 top-3 z-10 max-w-md">
          <PlaceSearch
            regionCodes={regionCodes}
            onPlaceSelect={handlePlaceSelect}
          />
        </div>

        {/* Map controls */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <MapButton
            label={
              isSatellite ? "Switch to map view" : "Switch to satellite view"
            }
            active={isSatellite}
            onClick={() => setIsSatellite((value) => !value)}
          >
            <Layers size={18} />
          </MapButton>

          <MapButton
            label="Use my current location"
            onClick={handleLocateMe}
            disabled={locating}
          >
            {locating ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <LocateFixed size={18} />
            )}
          </MapButton>
        </div>
      </div>

      {/* Status bar (single row on desktop, wraps on small screens) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        {/* Status + address */}
        <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
            <MapPin size={18} />
            {selectedLocation && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-50 bg-emerald-500 dark:border-slate-800" />
            )}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {selectedLocation ? "Location selected" : "No location selected"}
            </p>

            {geoError ? (
              <p
                className="truncate text-xs text-red-600 dark:text-red-400"
                title={geoError}
              >
                {geoError}
              </p>
            ) : selectedLocation ? (
              addressLoading ? (
                <span className="mt-1 block h-3 w-44 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              ) : (
                <p
                  className="truncate text-xs text-slate-500 dark:text-slate-400"
                  title={address || undefined}
                >
                  {address || "Address not available for this point"}
                </p>
              )
            ) : (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Search, use your location, or click the map to drop a pin
              </p>
            )}
          </div>
        </div>

        {selectedLocation && (
          <>
            {/* Coordinates */}
            <div className="flex shrink-0 divide-x divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">
              <CoordinateItem
                label="Lat"
                value={selectedLocation.lat.toFixed(6)}
              />
              <CoordinateItem
                label="Lng"
                value={selectedLocation.lng.toFixed(6)}
              />
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy coordinates"
                title="Copy coordinates"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-slate-800 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>

              <button
                type="button"
                onClick={handleClearLocation}
                aria-label="Clear location"
                title="Clear location"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-red-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-slate-900 dark:hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
