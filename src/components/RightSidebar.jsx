// src/components/RightSidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  TrendingUp,
  TrendingDown,
  MapPin,
  Trash2,
} from "lucide-react";
import NDVIChart from "./NDVIChart";
import WaterIndexChart from "./WaterIndexChart";
import {
  processUploadedFile,
  extractCoordinatesFromGeoJSON,
} from "../utils/fileParser";
import { useFieldData } from "../context/FieldDataContext";
import { deleteFieldData } from "../utils/fieldDataGenerator";
import sampleFieldsData from "./sampleFields.json";

export default function RightSidebar({ onFileUpload, onSnapshotClick }) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const fileInputRef = useRef(null);

  const { fieldData, selectField, clearField, selectedCrop, setSelectedCrop } =
    useFieldData();

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      const uniqueCrops = Array.from(
        new Set(
          sampleFieldsData.features
            .map((f) => f?.properties?.cropType)
            .filter(Boolean)
        )
      );

      setCrops(uniqueCrops);
    } catch (err) {
      console.error("Error loading crops from JSON:", err);
      setError("Failed to load crops");
    } finally {
      setLoading(false);
    }

    loadSnapshots();
  }, []);

  const loadSnapshots = () => {
    try {
      const savedSnapshots = JSON.parse(
        localStorage.getItem("fieldSnapshots") || "[]"
      );
      setSnapshots(savedSnapshots);

      if (savedSnapshots.length > 0 && !selectedFieldId) {
        const firstField = savedSnapshots[0];
        setSelectedFieldId(firstField.id);
        selectField(firstField);
      } else if (savedSnapshots.length === 0) {
        clearField();
      }
    } catch (error) {
      console.error("Error loading snapshots:", error);
    }
  };

  const capitalizeCropName = (name = "") =>
    name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // ... file upload handlers stay exactly same

  const handleFieldClick = (snapshot) => {
    setSelectedFieldId(snapshot.id);
    selectField(snapshot);
    onSnapshotClick && onSnapshotClick(snapshot);
  };

  // ... delete field logic unchanged

  // listen to storage events same as before ...

  const selectedField = snapshots.find((s) => s.id === selectedFieldId);

  const metrics = fieldData?.sidebarMetrics || {
    evi: { value: "0.65", change: "+5.2", positive: true },
    vhi: { value: "48.1", change: "-5.2", positive: false },
    savi: { value: "0.71", change: "+5.2", positive: true },
  };

  const areaValue = selectedField
    ? selectedField.area
    : fieldData?.dashboardData?.totalArea;

  return (
    <aside className="w-full lg:bg-[#132f1eff] p-3 sm:p-4">
      <div className="bg-[#0C2214] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg">
        {/* Field title */}
        <div className="mt-8 lg:mt-0">
          <div className="text-lg sm:text-xl font-semibold text-white">
            {selectedField ? selectedField.name : "Field Name"}
          </div>
          <div className="text-xs text-[#9FB79F] -mt-1">
            {selectedField
              ? new Date(selectedField.savedAt).toLocaleDateString()
              : "No Field Selected"}
          </div>
        </div>

        {/* Suggested crop – controls crop group selection */}
        <div className="mt-3 sm:mt-4">
          <label className="text-xs text-[#9FB79F]">Suggested Crop</label>
          <select
            value={selectedCrop || ""}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full mt-1 bg-white/10 rounded-lg px-2 sm:px-3 py-2 text-white outline-none text-xs sm:text-sm"
            disabled={loading}
          >
            {loading ? (
              <option>Loading crops...</option>
            ) : error ? (
              <option>{error}</option>
            ) : (
              <>
                <option value="">All crops</option>
                {crops.map((crop) => (
                  <option key={crop} value={crop}>
                    {capitalizeCropName(crop)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mt-4 sm:mt-6">
          <MetricCard
            title="Field Area"
            value={areaValue ? areaValue.toFixed(2) : "0"}
            unit="ha"
            status={areaValue ? "Active" : "No Field"}
            positive
          />
          <MetricCard
            title="EVI"
            value={metrics.evi.value}
            change={`${metrics.evi.positive ? "+" : ""}${metrics.evi.change}%`}
            status="Slight Increase"
            positive={metrics.evi.positive}
          />
          <MetricCard
            title="VHI"
            value={metrics.vhi.value}
            change={`${metrics.vhi.positive ? "+" : ""}${metrics.vhi.change}%`}
            status={metrics.vhi.positive ? "Healthy" : "Stress Detected"}
            positive={metrics.vhi.positive}
          />
          <MetricCard
            title="SAVI"
            value={metrics.savi.value}
            change={`${metrics.savi.positive ? "+" : ""}${
              metrics.savi.change
            }%`}
            status="Consistent"
            positive={metrics.savi.positive}
          />
        </div>

        <div className="border-t border-white/10 my-4 sm:my-6" />

        {/* Time series charts now driven by fieldData */}
        <div>
          <div className="text-xs sm:text-sm font-semibold text-white">
            Vegetation Time-Series (8 Weeks)
          </div>
          <div className="mt-3 sm:mt-4 h-32 sm:h-40">
            <NDVIChart />
          </div>
        </div>

        <div className="border-t border-white/10 my-4 sm:my-6" />

        <div>
          <div className="text-xs sm:text-sm font-semibold text-white">
            Water Index Time-Series (8 Weeks)
          </div>
          <div className="mt-3 sm:mt-4 h-32 sm:h-40">
            <WaterIndexChart />
          </div>
        </div>

        {/* ...saved fields list + upload block unchanged */}
      </div>

      {/* custom scrollbar styles keep same */}
    </aside>
  );
}

function MetricCard({ title, value, unit, change, status, positive }) {
  return (
    <div>
      <div className="text-[10px] sm:text-[11px] text-[#9FB79F]">{title}</div>
      <div className="flex items-center gap-1 sm:gap-2 mt-1">
        <p className="text-lg sm:text-xl lg:text-2xl text-white font-semibold">
          {value}
          {unit && <span className="text-sm ml-1">{unit}</span>}
        </p>
        {change && (
          <span
            className={`text-xs sm:text-sm flex items-center gap-0.5 sm:gap-1 ${
              positive ? "text-[#64E57C]" : "text-[#FF6A6A]"
            }`}
          >
            {positive ? (
              <TrendingUp size={14} className="sm:w-4 sm:h-4" />
            ) : (
              <TrendingDown size={14} className="sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">{change}</span>
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-[11px] text-[#9FB79F] mt-1">{status}</p>
    </div>
  );
}
