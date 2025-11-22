// src/context/FieldDataContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import sampleFieldsData from "../components/sampleFields.json";

const FieldDataContext = createContext(null);

// ensure each sample feature has an id
const SAMPLE_FEATURES = (sampleFieldsData?.features || []).map(
  (feature, index) => {
    const props = feature.properties || {};
    return {
      ...feature,
      properties: {
        ...props,
        _id: props._id || `sample-${index}`,
      },
    };
  }
);

const parseArea = (feature) =>
  parseFloat(feature?.properties?.area_ha || 0) || 0;

const DEFAULTS = {
  avgNDVI: 0.68,
  evi: 0.65,
  vhi: 48.1,
  savi: 0.71,
  soilHealth: {
    healthPercentage: 60,
    healthStatus: "Normal",
    cropAge: 15,
    standardYield: 460,
  },
};

function buildAggregatedData(features) {
  if (!features || features.length === 0) return null;

  const mapped = features.map((f) => {
    const p = f.properties || {};
    const area = parseArea(f);

    return {
      area,
      cropType: p.cropType || "Unknown",
      cropHealth: p.cropHealth || "Decent",
      avgNDVI: typeof p.avgNDVI === "number" ? p.avgNDVI : DEFAULTS.avgNDVI,
      evi: typeof p.evi === "number" ? p.evi : DEFAULTS.evi,
      vhi: typeof p.vhi === "number" ? p.vhi : DEFAULTS.vhi,
      savi: typeof p.savi === "number" ? p.savi : DEFAULTS.savi,
      ndviSeries: p.ndviSeries || null,
      waterSeries: p.waterSeries || null,
      soilHealth: p.soilHealth || null,
    };
  });

  const totalArea = mapped.reduce((sum, f) => sum + f.area, 0);

  const weighted = mapped.reduce(
    (acc, f) => {
      const w = f.area || 1;
      acc.weight += w;
      acc.ndvi += f.avgNDVI * w;
      acc.evi += f.evi * w;
      acc.vhi += f.vhi * w;
      acc.savi += f.savi * w;
      return acc;
    },
    { weight: 0, ndvi: 0, evi: 0, vhi: 0, savi: 0 }
  );

  const avgNDVI =
    weighted.weight > 0 ? weighted.ndvi / weighted.weight : DEFAULTS.avgNDVI;
  const avgEVI =
    weighted.weight > 0 ? weighted.evi / weighted.weight : DEFAULTS.evi;
  const avgVHI =
    weighted.weight > 0 ? weighted.vhi / weighted.weight : DEFAULTS.vhi;
  const avgSAVI =
    weighted.weight > 0 ? weighted.savi / weighted.weight : DEFAULTS.savi;

  const healthyFarms = mapped.filter((f) => {
    const h = f.cropHealth.toLowerCase();
    return h === "very good" || h === "good";
  }).length;

  const lowIndexFarms = mapped.filter((f) => {
    const h = f.cropHealth.toLowerCase();
    return h === "poor" || f.avgNDVI < 0.35;
  }).length;

  // aggregate NDVI & Water series if present
  const aggregateSeries = (key) => {
    const withSeries = mapped.filter((m) => m[key]);
    if (withSeries.length === 0) return null;

    const base = withSeries[0][key];
    const len = base.length;
    const result = [];

    for (let i = 0; i < len; i++) {
      let sum = 0;
      let count = 0;
      withSeries.forEach((m) => {
        const s = m[key];
        if (s && s[i]) {
          sum += s[i].v;
          count++;
        }
      });
      result.push({
        name: base[i].name,
        v: count ? sum / count : 0,
      });
    }
    return result;
  };

  const ndviTimeSeries = aggregateSeries("ndviSeries");
  const waterIndexTimeSeries = aggregateSeries("waterSeries");

  // soil health (simple aggregate)
  let soilHealth;
  const withSoil = mapped.filter((m) => m.soilHealth);
  if (withSoil.length > 0) {
    const hpAvg =
      withSoil.reduce(
        (sum, f) => sum + (f.soilHealth.healthPercentage || 0),
        0
      ) / withSoil.length;

    const hpRounded = Math.round(hpAvg || DEFAULTS.soilHealth.healthPercentage);

    const status =
      hpRounded >= 75
        ? "Excellent"
        : hpRounded >= 50
        ? "Normal"
        : "Needs Attention";

    const base = withSoil[0].soilHealth;

    soilHealth = {
      healthPercentage: hpRounded,
      healthStatus: status,
      cropAge: base.cropAge ?? DEFAULTS.soilHealth.cropAge,
      standardYield: base.standardYield ?? DEFAULTS.soilHealth.standardYield,
      nutrients: base.nutrients,
      layers: base.layers,
    };
  }

  return {
    dashboardData: {
      avgNDVI: {
        value: avgNDVI.toFixed(2),
        change: "+5.2",
        positive: true,
      },
      totalArea,
      healthyFarms: {
        healthy: healthyFarms,
        total: features.length,
      },
      lowIndexFarms,
    },
    sidebarMetrics: {
      evi: {
        value: avgEVI.toFixed(2),
        change: "+5.2",
        positive: true,
      },
      vhi: {
        value: avgVHI.toFixed(1),
        change: "-5.2",
        positive: false,
      },
      savi: {
        value: avgSAVI.toFixed(2),
        change: "+5.2",
        positive: true,
      },
    },
    ndviTimeSeries,
    waterIndexTimeSeries,
    soilHealth: soilHealth || DEFAULTS.soilHealth,
  };
}

export function FieldDataProvider({ children }) {
  const [selectedCrop, setSelectedCropState] = useState(""); // "", "Wheat", "Maize", ...
  // selectedFieldInternal: null | { type: "sample"|"snapshot", id, snapshot? }
  const [selectedFieldInternal, setSelectedFieldInternal] = useState(null);
  const [fieldData, setFieldData] = useState(null);

  // major crop by area for the whole dataset
  const globalMajorCrop = useMemo(() => {
    const totalsByCrop = new Map();
    SAMPLE_FEATURES.forEach((f) => {
      const crop = f?.properties?.cropType || "Unknown";
      const area = parseArea(f);
      totalsByCrop.set(crop, (totalsByCrop.get(crop) || 0) + area);
    });

    let best = { name: "Unknown", area: 0 };
    totalsByCrop.forEach((area, name) => {
      if (area > best.area) best = { name, area };
    });
    return best;
  }, []);

  const updateForCropGroup = (cropName) => {
    const features =
      cropName && cropName.length
        ? SAMPLE_FEATURES.filter(
            (f) =>
              (f?.properties?.cropType || "").toLowerCase() ===
              cropName.toLowerCase()
          )
        : SAMPLE_FEATURES;

    const aggregated = buildAggregatedData(features);
    if (aggregated) {
      const majorCrop =
        cropName && cropName.length
          ? {
              name: cropName,
              area: aggregated.dashboardData.totalArea,
            }
          : globalMajorCrop;

      setFieldData({ ...aggregated, majorCrop });
    } else {
      setFieldData(null);
    }
  };

  // initial: all fields
  useEffect(() => {
    updateForCropGroup("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // react when crop group changes (and we are NOT on a single field)
  useEffect(() => {
    if (!selectedFieldInternal) {
      updateForCropGroup(selectedCrop);
    }
  }, [selectedCrop, selectedFieldInternal]); // eslint-disable-line react-hooks/exhaustive-deps

  // react when a specific field is selected
  useEffect(() => {
    if (!selectedFieldInternal) return;

    if (selectedFieldInternal.type === "sample") {
      const feature = SAMPLE_FEATURES.find(
        (f) => f.properties?._id === selectedFieldInternal.id
      );
      if (!feature) return;
      const aggregated = buildAggregatedData([feature]);
      if (aggregated) {
        const area = aggregated.dashboardData.totalArea;
        const cropName = feature.properties?.cropType || "Field";
        setFieldData({
          ...aggregated,
          majorCrop: { name: cropName, area },
        });
      }
    }

    if (selectedFieldInternal.type === "snapshot") {
      const snapshot = selectedFieldInternal.snapshot;
      if (!snapshot) return;
      // basic metrics from area only (can extend later)
      const dummyFeature = {
        properties: {
          area_ha: snapshot.area?.toString() || "0",
          cropHealth: "Decent",
          avgNDVI: DEFAULTS.avgNDVI,
        },
      };
      const aggregated = buildAggregatedData([dummyFeature]);
      if (aggregated) {
        setFieldData({
          ...aggregated,
          majorCrop: {
            name: snapshot.name || "Saved Field",
            area: snapshot.area || 0,
          },
        });
      }
    }
  }, [selectedFieldInternal]);

  // public API

  const setSelectedCrop = (cropName) => {
    setSelectedCropState(cropName);
    setSelectedFieldInternal(null); // back to group view
  };

  const selectSampleField = (fieldId) => {
    if (!fieldId) {
      // "All fields" for current crop
      setSelectedFieldInternal(null);
    } else {
      setSelectedFieldInternal({ type: "sample", id: fieldId });
    }
  };

  const selectField = (snapshot) => {
    if (!snapshot) {
      setSelectedFieldInternal(null);
      return;
    }
    setSelectedFieldInternal({
      type: "snapshot",
      id: snapshot.id,
      snapshot,
    });
  };

  const clearField = () => {
    setSelectedFieldInternal(null);
  };

  const selectedField = useMemo(() => {
    if (!selectedFieldInternal) return null;

    if (selectedFieldInternal.type === "sample") {
      const feature = SAMPLE_FEATURES.find(
        (f) => f.properties?._id === selectedFieldInternal.id
      );
      if (!feature) return null;
      return {
        type: "sample",
        id: selectedFieldInternal.id,
        name: feature.properties?.name || "Sample Field",
        area: parseArea(feature),
      };
    }

    if (selectedFieldInternal.type === "snapshot") {
      const snap = selectedFieldInternal.snapshot;
      return {
        type: "snapshot",
        id: snap.id,
        name: snap.name,
        area: snap.area,
      };
    }

    return null;
  }, [selectedFieldInternal]);

  const contextValue = {
    fieldData,
    selectedCrop,
    setSelectedCrop,
    selectedField,
    // expose sample-field id so map dropdown can bind to it
    selectedSampleFieldId:
      selectedFieldInternal?.type === "sample"
        ? selectedFieldInternal.id
        : null,
    selectSampleField,
    selectField, // snapshots
    clearField,
  };

  return (
    <FieldDataContext.Provider value={contextValue}>
      {children}
    </FieldDataContext.Provider>
  );
}

export const useFieldData = () => useContext(FieldDataContext);
