import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getOrGenerateFieldData } from '../utils/fieldDataGenerator';

const FieldDataContext = createContext();

export const useFieldData = () => {
  const context = useContext(FieldDataContext);
  if (!context) {
    throw new Error('useFieldData must be used within FieldDataProvider');
  }
  return context;
};

export const FieldDataProvider = ({ children }) => {
  const [selectedField, setSelectedField] = useState(null);
  const [fieldData, setFieldData] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    console.log('Selected field changed:', selectedField?.id);
    if (selectedField) {
      const data = getOrGenerateFieldData(selectedField.id, selectedField.area);
      console.log('Generated/Loaded data for field:', selectedField.id, data);
      setFieldData(data);
    } else {
      setFieldData(null);
    }
  }, [selectedField, updateTrigger]);

  const selectField = useCallback((field) => {
    console.log('Selecting field:', field?.id);
    setSelectedField(field);
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const clearField = useCallback(() => {
    console.log('Clearing field selection');
    setSelectedField(null);
    setFieldData(null);
  }, []);

  const refreshData = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  return (
    <FieldDataContext.Provider value={{ 
      selectedField, 
      fieldData, 
      selectField, 
      clearField,
      refreshData
    }}>
      {children}
    </FieldDataContext.Provider>
  );
};