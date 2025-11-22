import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  useMap,
  GeoJSON,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";
import LocationModal from "./LocationModal";
import MapControls from "./MapControls";
import MapOverlays from "./MapOverlays";
import sampleFieldsData from "./sampleFields.json";
import { useFieldData } from "../context/FieldDataContext";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom yellow marker icon for manual boundary points
const yellowMarkerIcon = new L.divIcon({
  className: "yellow-marker",
  html: `<div style="
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: #fbbf24;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    border: 2px solid #fbbf24;
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  ">+</div>`,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

// NDVI-like color palette by crop health
const getHealthColor = (health) => {
  const value = (health || "").toLowerCase();

  switch (value) {
    case "very good":
      return "#4CAF50"; // strong green
    case "good":
      return "#8BC34A"; // fresh green-yellow
    case "decent":
      return "#FFEB3B"; // yellow
    case "poor":
      return "#FF5722"; // orange-red
    default:
      return "#9E9E9E"; // grey "no data"
  }
};

const getSampleFieldStyle = (feature) => {
  const health = feature?.properties?.cropHealth;
  const color = getHealthColor(health);

  return {
    fill: true,
    fillColor: color,
    fillOpacity: 0.8,
    color,
    opacity: 0.9,
    weight: 1,
  };
};

const MoveMapToLocation = ({ center, bounds, onBoundsFitted }) => {
  const map = useMap();
  const previousBoundsRef = useRef(null);

  useEffect(() => {
    if (bounds) {
      const boundsString = JSON.stringify(bounds);

      if (previousBoundsRef.current !== boundsString) {
        previousBoundsRef.current = boundsString;

        setTimeout(() => {
          try {
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 16,
              animate: true,
              duration: 1,
            });

            if (onBoundsFitted) {
              setTimeout(() => onBoundsFitted(), 500);
            }
          } catch (error) {
            console.error("Error fitting bounds:", error);
          }
        }, 100);
      }
    } else if (center) {
      const centerString = JSON.stringify(center);
      if (previousBoundsRef.current !== centerString) {
        previousBoundsRef.current = centerString;
        setTimeout(() => {
          try {
            map.setView(center, 15, { animate: true });
          } catch (error) {
            console.error("Error setting view:", error);
          }
        }, 100);
      }
    }
  }, [center, bounds, map, onBoundsFitted]);

  return null;
};

// Manual boundary marker handler
const ManualMarkerHandler = ({ isAdding, onAddMarker }) => {
  useMapEvents({
    click: (e) => {
      if (isAdding) {
        const { lat, lng } = e.latlng;
        onAddMarker({ lat, lng });
      }
    },
  });
  return null;
};

export default function MapSection({
  uploadedData,
  externalLocation,
  onLocationChange,
  onFieldSave,
  selectedSnapshot,
  // comes from App / sidebar ("", "Maize", "Wheat", "Tobacco" etc.)
  selectedCrop = "",
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [generatedPolygon, setGeneratedPolygon] = useState([]);
  const [sampleFields, setSampleFields] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState("NDVI");
  const [shouldFitBounds, setShouldFitBounds] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const [manualMarkers, setManualMarkers] = useState([]);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualArea, setManualArea] = useState(0);
  const [manualGeoJson, setManualGeoJson] = useState(null);

  const [toast, setToast] = useState(null);

  const mapRef = useRef(null);
  const lastSnapshotIdRef = useRef(null);

  const { selectField } = useFieldData();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // FILTERED SAMPLE FIELDS (case-insensitive by crop)
  const filteredSampleFields = useMemo(() => {
    if (!sampleFields) return null;

    // "" or null ⇒ ALL crops
    if (!selectedCrop) return sampleFields;

    const target = selectedCrop.toLowerCase();

    return {
      ...sampleFields,
      features: sampleFields.features.filter((f) => {
        const crop = (f?.properties?.cropType || "").toLowerCase();
        return crop === target;
      }),
    };
  }, [sampleFields, selectedCrop]);

  // Load snapshot when selected
  useEffect(() => {
    if (
      selectedSnapshot &&
      selectedSnapshot.markers &&
      selectedSnapshot.id !== lastSnapshotIdRef.current
    ) {
      console.log(
        "Loading snapshot:",
        selectedSnapshot.name,
        selectedSnapshot.id
      );
      lastSnapshotIdRef.current = selectedSnapshot.id;

      selectField(selectedSnapshot);
      setManualMarkers(selectedSnapshot.markers);
      setGeneratedPolygon([]);
      setSampleFields(null); // hide sample polygons when viewing saved field

      if (selectedSnapshot.markers.length > 0) {
        const lats = selectedSnapshot.markers.map((m) => m.lat);
        const lngs = selectedSnapshot.markers.map((m) => m.lng);

        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        setMapCenter([centerLat, centerLng]);
        setShouldFitBounds(true);
        setMapKey((prev) => prev + 1);
      }

      setIsAddingManual(false);
      showToast("Field loaded successfully", "success");
    }
  }, [selectedSnapshot, selectField]);

  // geo, external location, uploadedData, manual area etc...
  // 👉 keep exactly your previous effects and handlers here
  // (omitted for brevity – you can keep them unchanged)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = [latitude, longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    if (externalLocation) {
      setMapCenter(externalLocation);
      setShouldFitBounds(false);
    }
  }, [externalLocation]);

  useEffect(() => {
    if (
      uploadedData &&
      uploadedData.coordinates &&
      uploadedData.coordinates.length > 0
    ) {
      setGeneratedPolygon(uploadedData.coordinates);
      setShouldFitBounds(true);
      setSampleFields(null);

      const lats = uploadedData.coordinates.map((c) => c.lat);
      const lngs = uploadedData.coordinates.map((c) => c.lng);
      const center = [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ];
      setMapCenter(center);
      setMapKey((prev) => prev + 1);
    }
  }, [uploadedData]);

  useEffect(() => {
    if (manualMarkers.length >= 3) {
      const coords = manualMarkers.map((m) => [m.lng, m.lat]);
      coords.push(coords[0]);

      const polygon = turf.polygon([coords]);
      const areaInSqMeters = turf.area(polygon);
      const areaInHectares = areaInSqMeters / 10000;
      setManualArea(areaInHectares);

      const geojson = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
        properties: {
          area_ha: areaInHectares.toFixed(2),
          created_at: new Date().toISOString(),
        },
      };
      setManualGeoJson(geojson);
    } else {
      setManualArea(0);
      setManualGeoJson(null);
    }
  }, [manualMarkers]);

  useEffect(() => {
    if (mapRef.current) {
      const mapContainer = mapRef.current.getContainer();
      mapContainer.style.cursor = isAddingManual ? "crosshair" : "";
    }
  }, [isAddingManual]);

  const handleGenerateField = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // load ALL sample fields when button clicked
      setSampleFields(sampleFieldsData);

      const allCoords = [];
      sampleFieldsData.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach((coord) => {
            allCoords.push({ lng: coord[0], lat: coord[1] });
          });
        }
      });

      if (allCoords.length > 0) {
        const lats = allCoords.map((c) => c.lat);
        const lngs = allCoords.map((c) => c.lng);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        setMapCenter([centerLat, centerLng]);
        setMapKey((prev) => prev + 1);
      }

      setGeneratedPolygon([]);
      setManualMarkers([]);
      setShouldFitBounds(true);
      setIsGenerating(false);

      const totalArea = sampleFieldsData.features.reduce((sum, feature) => {
        return sum + parseFloat(feature.properties.area_ha || 0);
      }, 0);

      showToast(
        `${
          sampleFieldsData.features.length
        } sample fields loaded! Total area: ${totalArea.toFixed(2)} ha`,
        "success"
      );
    }, 1000);
  };

  // undo / clear / save / toggle / zoom / bounds – keep same as earlier
  const handleAddManualMarker = (marker) => {
    setManualMarkers((prev) => [...prev, marker]);
  };

  const handleUndoLastMarker = () => {
    if (manualMarkers.length === 0) {
      showToast("No markers to undo", "warning");
      return;
    }
    setManualMarkers((prev) => prev.slice(0, -1));
    showToast("Last marker removed", "success");
  };

  const handleClearAllMarkers = () => {
    if (manualMarkers.length === 0) {
      showToast("No markers to clear", "warning");
      return;
    }
    setManualMarkers([]);
    showToast("All markers cleared", "success");
  };

  const handleSaveBoundary = () => {
    if (manualMarkers.length < 3) {
      showToast("Please add at least 3 boundary points", "error");
      return;
    }

    const boundaryData = {
      id: Date.now(),
      markers: manualMarkers,
      geojson: manualGeoJson,
      area: manualArea,
      savedAt: new Date().toISOString(),
      name: `Field ${new Date().toLocaleDateString()}`,
    };

    try {
      const existingSnapshots = JSON.parse(
        localStorage.getItem("fieldSnapshots") || "[]"
      );
      const updatedSnapshots = [boundaryData, ...existingSnapshots];
      localStorage.setItem("fieldSnapshots", JSON.stringify(updatedSnapshots));
      window.dispatchEvent(new Event("localStorageUpdated"));

      if (onFieldSave) {
        onFieldSave(boundaryData);
      }

      showToast(
        `Field saved! Area: ${manualArea.toFixed(2)} hectares`,
        "success"
      );

      setManualMarkers([]);
      setIsAddingManual(false);
    } catch (error) {
      console.error("Error saving boundary:", error);
      showToast("Failed to save field. Please try again.", "error");
    }
  };

  const handleToggleAddMode = () => {
    if (!isAddingManual && manualMarkers.length >= 3) {
      showToast("Please save or clear existing field first", "warning");
      return;
    }
    setIsAddingManual(!isAddingManual);
    showToast(
      !isAddingManual
        ? "Click on map to add boundary points"
        : "Drawing mode stopped",
      "success"
    );
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleBoundsFitted = () => {
    setShouldFitBounds(false);
  };

  const polygonBounds = useMemo(() => {
    const activeSample = filteredSampleFields || sampleFields;

    if (
      activeSample &&
      activeSample.features &&
      activeSample.features.length > 0
    ) {
      const allCoords = [];
      activeSample.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
          feature.geometry.coordinates[0].forEach((coord) => {
            allCoords.push({ lng: coord[0], lat: coord[1] });
          });
        }
      });

      if (allCoords.length > 0) {
        const lats = allCoords.map((c) => c.lat);
        const lngs = allCoords.map((c) => c.lng);
        return [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ];
      }
    }

    if (generatedPolygon.length === 0 && manualMarkers.length === 0)
      return null;

    let lats;
    let lngs;
    if (manualMarkers.length > 0) {
      lats = manualMarkers.map((c) => c.lat);
      lngs = manualMarkers.map((c) => c.lng);
    } else {
      lats = generatedPolygon.map((c) => c.lat);
      lngs = generatedPolygon.map((c) => c.lng);
    }

    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
  }, [generatedPolygon, manualMarkers, sampleFields, filteredSampleFields]);

  return (
    <>
      <div className="bg-cg-panel rounded-xl sm:rounded-2xl shadow-cg-soft h-[400px] sm:h-[450px] md:h-[500px] relative overflow-hidden border border-green-900/20">
        <MapContainer
          center={mapCenter}
          zoom={15}
          className="w-full h-full rounded-xl sm:rounded-2xl"
          ref={mapRef}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            maxZoom={20}
          />

          {uploadedData && uploadedData.geojson && (
            <GeoJSON
              key={uploadedData.fileName}
              data={uploadedData.geojson}
              style={{
                fillColor: "#79c24a",
                fillOpacity: 0.3,
                color: "#79c24a",
                weight: 3,
              }}
            />
          )}

          {/* 🔥 sample fields filtered strictly by selectedCrop */}
          {filteredSampleFields && filteredSampleFields.features && (
            <GeoJSON
              key={`sample-fields-${selectedCrop || "all"}`}
              data={filteredSampleFields}
              style={getSampleFieldStyle}
              onEachFeature={(feature, layer) => {
                if (feature.properties && feature.properties.name) {
                  const { name, area_ha, cropType, cropHealth } =
                    feature.properties;
                  layer.bindPopup(`
                    <div style="font-family: sans-serif;">
                      <strong>${name}</strong><br/>
                      Crop: ${cropType || "N/A"}<br/>
                      Health: ${cropHealth || "N/A"}<br/>
                      Area: ${area_ha} hectares
                    </div>
                  `);
                }
              }}
            />
          )}

          {generatedPolygon.length > 0 &&
            !uploadedData?.geojson &&
            manualMarkers.length === 0 &&
            !sampleFields && (
              <Polygon
                positions={generatedPolygon.map(({ lat, lng }) => [lat, lng])}
                pathOptions={{
                  fillColor: "#79c24a",
                  fillOpacity: 0.2,
                  color: "#79c24a",
                  weight: 3,
                }}
              />
            )}

          {manualMarkers.map((marker, i) => (
            <Marker
              key={i}
              position={[marker.lat, marker.lng]}
              icon={yellowMarkerIcon}
            />
          ))}

          {manualMarkers.length >= 3 && (
            <Polygon
              positions={manualMarkers.map(({ lat, lng }) => [lat, lng])}
              pathOptions={{
                fillColor: "#fbbf24",
                fillOpacity: 0.2,
                color: "#fbbf24",
                weight: 3,
              }}
            />
          )}

          <ManualMarkerHandler
            isAdding={isAddingManual}
            onAddMarker={handleAddManualMarker}
          />

          <MoveMapToLocation
            key={mapKey}
            center={!shouldFitBounds ? mapCenter : null}
            bounds={shouldFitBounds ? polygonBounds : null}
            onBoundsFitted={handleBoundsFitted}
          />
        </MapContainer>

        <MapControls
          isAddingManual={isAddingManual}
          isGenerating={isGenerating}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onToggleAddMode={handleToggleAddMode}
          onUndoLastMarker={handleUndoLastMarker}
          onClearAllMarkers={handleClearAllMarkers}
          onSaveBoundary={handleSaveBoundary}
          onOpenLocationModal={() => setShowLocationModal(true)}
          onGenerateField={handleGenerateField}
        />

        <MapOverlays
          manualArea={manualArea}
          sampleFieldsCount={filteredSampleFields?.features?.length || 0}
          toast={toast}
          onToastClose={() => setToast(null)}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </div>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={onLocationChange}
      />
    </>
  );
}
