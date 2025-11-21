// Generate random data for each field
export const generateFieldData = (fieldId, fieldArea) => {
  const randomInRange = (min, max, decimals = 2) => {
    return (Math.random() * (max - min) + min).toFixed(decimals);
  };

  const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  // Generate NDVI time series data (8 weeks)
  const generateNDVITimeSeries = () => {
    const weeks = [];
    let previousValue = parseFloat(randomInRange(0.2, 0.4));
    
    for (let i = 1; i <= 8; i++) {
      const change = parseFloat(randomInRange(-0.1, 0.15));
      let value = previousValue + change;
      value = Math.max(0.15, Math.min(0.85, value));
      weeks.push({
        name: `WK ${i}`,
        v: parseFloat(value.toFixed(2))
      });
      previousValue = value;
    }
    return weeks;
  };

  // Generate Water Index time series data (8 weeks)
  const generateWaterIndexTimeSeries = () => {
    const weeks = [];
    let previousValue = parseFloat(randomInRange(0.15, 0.25));
    
    for (let i = 1; i <= 8; i++) {
      const change = parseFloat(randomInRange(-0.08, 0.10));
      let value = previousValue + change;
      value = Math.max(0.10, Math.min(0.45, value));
      weeks.push({
        name: `WK ${i}`,
        v: parseFloat(value.toFixed(2))
      });
      previousValue = value;
    }
    return weeks;
  };

  // Generate soil nutrients data
  const generateSoilNutrients = () => {
    return [
      {
        symbol: "P",
        label: "Nitrogen",
        thisYear: parseFloat(randomInRange(20, 30)),
        lastYear: parseFloat(randomInRange(15, 25))
      },
      {
        symbol: "Mg",
        label: "Phosphorous",
        thisYear: parseFloat(randomInRange(6, 12)),
        lastYear: parseFloat(randomInRange(5, 10))
      },
      {
        symbol: "K",
        label: "Potassium",
        thisYear: parseFloat(randomInRange(8, 15)),
        lastYear: parseFloat(randomInRange(6, 12))
      }
    ];
  };

  // Generate soil health data for different layers
  const generateSoilHealthData = () => {
    const surfaceTemp = parseFloat(randomInRange(22, 28));
    return {
      surface: {
        temperature: surfaceTemp.toFixed(0),
        moisture: randomInRange(0.18, 0.25, 2)
      },
      subsoil: {
        temperature: (surfaceTemp - parseFloat(randomInRange(1, 3))).toFixed(0),
        moisture: randomInRange(0.22, 0.28, 2)
      },
      parentMaterial: {
        temperature: (surfaceTemp - parseFloat(randomInRange(3, 5))).toFixed(0),
        moisture: randomInRange(0.25, 0.32, 2)
      }
    };
  };

  const avgNDVI = randomInRange(0.55, 0.75, 2);
  const healthPercentage = parseInt(randomInRange(55, 85));
  
  return {
    fieldId,
    generatedAt: new Date().toISOString(),
    
    // Dashboard Cards Data
    dashboardData: {
      avgNDVI: {
        value: avgNDVI,
        change: randomInRange(-8, 12, 1),
        positive: Math.random() > 0.3
      },
      totalArea: fieldArea,
      healthyFarms: {
        healthy: randomInt(18, 26),
        total: randomInt(26, 32)
      },
      lowIndexFarms: randomInt(3, 8)
    },

    // Sidebar Metrics
    sidebarMetrics: {
      evi: {
        value: randomInRange(0.55, 0.75, 2),
        change: randomInRange(-8, 12, 1),
        positive: Math.random() > 0.4
      },
      vhi: {
        value: randomInRange(40, 65, 1),
        change: randomInRange(-8, 8, 1),
        positive: Math.random() > 0.4
      },
      savi: {
        value: randomInRange(0.60, 0.80, 2),
        change: randomInRange(-6, 10, 1),
        positive: Math.random() > 0.5
      }
    },

    // NDVI Time Series
    ndviTimeSeries: generateNDVITimeSeries(),
    
    // Water Index Time Series
    waterIndexTimeSeries: generateWaterIndexTimeSeries(),

    // Soil Health Data
    soilHealth: {
      healthPercentage,
      healthStatus: healthPercentage >= 75 ? 'Good' : healthPercentage >= 50 ? 'Normal' : 'Poor',
      cropAge: randomInt(10, 45),
      standardYield: randomInRange(400, 550, 2),
      nutrients: generateSoilNutrients(),
      layers: generateSoilHealthData()
    }
  };
};

// Get field data or generate if not exists
export const getOrGenerateFieldData = (fieldId, fieldArea) => {
  try {
    const allFieldData = JSON.parse(localStorage.getItem('fieldData') || '{}');
    
    if (allFieldData[fieldId]) {
      return allFieldData[fieldId];
    }
    
    // Generate new data
    const newData = generateFieldData(fieldId, fieldArea);
    allFieldData[fieldId] = newData;
    localStorage.setItem('fieldData', JSON.stringify(allFieldData));
    
    return newData;
  } catch (error) {
    console.error('Error getting/generating field data:', error);
    return generateFieldData(fieldId, fieldArea);
  }
};

// Delete field data
export const deleteFieldData = (fieldId) => {
  try {
    const allFieldData = JSON.parse(localStorage.getItem('fieldData') || '{}');
    delete allFieldData[fieldId];
    localStorage.setItem('fieldData', JSON.stringify(allFieldData));
  } catch (error) {
    console.error('Error deleting field data:', error);
  }
};