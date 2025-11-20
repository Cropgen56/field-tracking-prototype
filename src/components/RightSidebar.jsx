import React, { useState, useEffect, useRef } from "react";
import { UploadCloud, TrendingUp, TrendingDown } from "lucide-react";
import NDVIChart from "./NDVIChart";
import { getCropList } from "../api/cropApi";
import { processUploadedFile, extractCoordinatesFromGeoJSON } from "../utils/fileParser";

export default function RightSidebar({ onFileUpload }) {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCropList();

        if (data.success && data.data) {
          setCrops(data.data);
          if (data.data.length > 0) {
            setSelectedCrop(data.data[0].cropName);
          }
        }
      } catch (error) {
        console.error("Error fetching crops:", error);
        setError("Failed to load crops");
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const capitalizeCropName = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const file = files[0];
      const validExtensions = ['.geojson', '.json'];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValid) {
        throw new Error('Please upload a GeoJSON file (.geojson or .json)');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File is too large. Maximum size is 10MB.');
      }

      const geojson = await processUploadedFile(file);
      const coordinates = extractCoordinatesFromGeoJSON(geojson);
      
      if (coordinates.length === 0) {
        throw new Error('No valid coordinates found in the file');
      }

      const fileData = {
        geojson,
        coordinates,
        fileName: file.name
      };

      if (onFileUpload) {
        onFileUpload(fileData);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <aside className="w-full lg:bg-[#132f1eff] p-3 sm:p-4">
      <div className="bg-[#0C2214] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg">
        
        {/* Header */}
        <div className="mt-8 lg:mt-0">
          <div className="text-lg sm:text-xl font-semibold text-white">Field Name</div>
          <div className="text-xs text-[#9FB79F] -mt-1">Location Name</div>
        </div>

        {/* Crop Selection */}
        <div className="mt-3 sm:mt-4">
          <label className="text-xs text-[#9FB79F]">Suggested Crop</label>
          <select
            value={selectedCrop}
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
                <option value="">Select a crop</option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop.cropName}>
                    {capitalizeCropName(crop.cropName)}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mt-4 sm:mt-6">
          <MetricCard
            title="Avg. NDVI Value"
            value="0.68"
            change="+5.2%"
            status="Stable This Week"
            positive
          />
          <MetricCard
            title="EVI"
            value="0.65"
            change="+5.2%"
            status="Slight Increase"
            positive
          />
          <MetricCard
            title="VHI"
            value="48.1"
            change="-5.2%"
            status="Stress Detected"
            positive={false}
          />
          <MetricCard
            title="SAVI"
            value="0.71"
            change="+5.2%"
            status="Consistent"
            positive
          />
        </div>

        <div className="border-t border-white/10 my-4 sm:my-6"></div>

        {/* NDVI Chart */}
        <div>
          <div className="text-xs sm:text-sm font-semibold text-white">
            NDVI Time-Series (8 Weeks)
          </div>
          <div className="mt-3 sm:mt-4 h-32 sm:h-40">
            <NDVIChart />
          </div>
        </div>

        <div className="border-t border-white/10 my-4 sm:my-6"></div>

        {/* Snapshot Section */}
        <div>
          <div className="text-xs sm:text-sm font-semibold text-white">Latest Snapshot</div>
          <div className="mt-2 sm:mt-3 h-24 sm:h-28 rounded-xl overflow-hidden bg-white/5">
            <img
              src="/snapshot.png"
              className="w-full h-full object-cover"
              alt="Latest Snapshot"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div className="mt-2 sm:mt-3 text-xs text-[#9FB79F] leading-5">
            <p>15 Nov 2025</p>
            <p>Cloud Cover: 2%</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 text-xs sm:text-sm mt-3 sm:mt-4 text-black space-y-1">
            <p>Historical NDVI (Avg): 0.78</p>
            <p>Planting Window: May 15 – Jan 5</p>
            <p>Regional Yield: 3.1 T/Ha</p>
          </div>
        </div>

        <div className="border-t border-white/10 my-4 sm:my-6"></div>

        {/* Upload Section */}
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".geojson,.json"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <div className="w-full py-2.5 sm:py-3 bg-[#344E41] text-white rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm hover:bg-[#3d5a4a] transition-colors cursor-pointer">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Upload Field Boundaries</span>
                </>
              )}
            </div>
          </label>
          <p className="text-[10px] sm:text-[11px] mt-2 sm:mt-3 text-[#9FB79F]">
            Upload GeoJSON For Real Boundaries.
          </p>
          {uploadError && (
            <p className="text-red-400 text-xs mt-2 bg-red-900/20 px-3 py-2 rounded">{uploadError}</p>
          )}
          {uploadSuccess && (
            <p className="text-green-400 text-xs mt-2 bg-green-900/20 px-3 py-2 rounded">
              File uploaded successfully!
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ title, value, change, status, positive }) {
  return (
    <div>
      <div className="text-[10px] sm:text-[11px] text-[#9FB79F]">{title}</div>
      <div className="flex items-center gap-1 sm:gap-2 mt-1">
        <p className="text-lg sm:text-xl lg:text-2xl text-white font-semibold">{value}</p>
        <span
          className={`text-xs sm:text-sm flex items-center gap-0.5 sm:gap-1 ${
            positive ? "text-[#64E57C]" : "text-[#FF6A6A]"
          }`}
        >
          {positive ? <TrendingUp size={14} className="sm:w-4 sm:h-4" /> : <TrendingDown size={14} className="sm:w-4 sm:h-4" />}
          <span className="hidden sm:inline">{change}</span>
        </span>
      </div>
      <p className="text-[10px] sm:text-[11px] text-[#9FB79F] mt-1">{status}</p>
    </div>
  );
}