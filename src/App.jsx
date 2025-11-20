import React, { useState } from 'react'
import Header from './components/Header'
import MapSection from './components/MapSection'
import RightSidebar from './components/RightSidebar'
import DashboardCards from './components/DashboardCards'
import SoilHealth from './components/SoilHealth'

export default function App() {
  const [uploadedFileData, setUploadedFileData] = useState(null);

  const handleFileUpload = (fileData) => {
    console.log('App received file upload:', fileData);
    setUploadedFileData(fileData);
  };

  return (
    <div className="min-h-screen bg-cg-bg font-sans text-sm text-white overflow-x-hidden">
      <Header />

      <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pb-8 sm:pb-12 md:pb-16">
        {/* Desktop Layout - Two Column */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
          {/* Main Content Area */}
          <div className="col-span-8 xl:col-span-8 2xl:col-span-9">
            <MapSection uploadedData={uploadedFileData} />
            <div className="mt-3 sm:mt-4 md:mt-6">
              <DashboardCards />
            </div>
            <div className="mt-3 sm:mt-4 md:mt-6">
              <SoilHealth />
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="col-span-4 xl:col-span-4 2xl:col-span-3">
            <RightSidebar onFileUpload={handleFileUpload} />
          </div>
        </div>

        {/* Mobile/Tablet Layout - Single Column, All Components */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          <MapSection uploadedData={uploadedFileData} />
          <DashboardCards />
          <SoilHealth />
          <RightSidebar onFileUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  )
}