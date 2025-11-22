// src/components/MapControls.jsx
import React from "react";
import {
  Sparkles,
  Plus,
  Minus,
  MapPin,
  Pause,
  Undo,
  Trash2,
  Save,
} from "lucide-react";

export default function MapControls({
  isAddingManual,
  isGenerating,
  onZoomIn,
  onZoomOut,
  onToggleAddMode,
  onUndoLastMarker,
  onClearAllMarkers,
  onSaveBoundary,
  onOpenLocationModal,
  onGenerateField,
  // NEW: field dropdown (within current crop group)
  fieldOptions = [], // [{id, name}]
  selectedFieldId,
  onFieldChange,
}) {
  return (
    <>
      {/* Left Side - Zoom Controls */}
      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <button
          onClick={onZoomIn}
          className="bg-cg-panel/95 backdrop-blur-md text-white w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 border border-green-500/20 hover:border-green-500/40 hover:bg-cg-panel"
          title="Zoom in"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>
        <button
          onClick={onZoomOut}
          className="bg-cg-panel/95 backdrop-blur-md text-white w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 border border-green-500/20 hover:border-green-500/40 hover:bg-cg-panel"
          title="Zoom out"
        >
          <Minus size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Right Side - Manual Boundary Controls */}
      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
        <button
          onClick={onToggleAddMode}
          className={`backdrop-blur-md text-white w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 border ${
            isAddingManual
              ? "bg-yellow-600/90 border-yellow-400/60 hover:bg-yellow-600"
              : "bg-cg-panel/95 border-green-500/20 hover:border-green-500/40 hover:bg-cg-panel"
          }`}
          title={isAddingManual ? "Stop adding markers" : "Add manual markers"}
        >
          {isAddingManual ? (
            <Pause size={20} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
          ) : (
            <Plus size={20} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
          )}
        </button>

        <button
          onClick={onUndoLastMarker}
          className="bg-cg-panel/95 backdrop-blur-md text-white w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 border border-green-500/20 hover:border-green-500/40 hover:bg-cg-panel"
          title="Undo last marker"
        >
          <Undo size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>

        <button
          onClick={onClearAllMarkers}
          className="bg-cg-panel/95 backdrop-blur-md text-white w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 border border-green-500/20 hover:border-red-500/40 hover:bg-red-900/20"
          title="Clear all markers"
        >
          <Trash2 size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>

        <button
          onClick={onSaveBoundary}
          className="bg-cg-panel/95 backdrop-blur-md text-white w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 border border-green-500/20 hover:border-green-500/60 hover:bg-green-900/30"
          title="Save field"
        >
          <Save size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Top Controls */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-[1000] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenLocationModal}
            className="bg-cg-panel/95 backdrop-blur-md text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl border border-green-500/20 hover:border-green-500/40 hover:bg-cg-panel hover:scale-[1.02] text-xs sm:text-sm"
          >
            <MapPin size={16} className="text-green-400" />
            <span className="hidden sm:inline">Set Location</span>
            <span className="sm:hidden">Location</span>
          </button>

          {/* NEW: field selector within current crop */}
          {fieldOptions && fieldOptions.length > 0 && (
            <select
              value={selectedFieldId || ""}
              onChange={(e) =>
                onFieldChange && onFieldChange(e.target.value || null)
              }
              className="bg-cg-panel/95 backdrop-blur-md text-white px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm border border-green-500/20 hover:border-green-500/40 shadow-lg outline-none"
            >
              <option value="">All fields</option>
              {fieldOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={onGenerateField}
          disabled={isGenerating}
          className={`
            bg-cg-panel/95 backdrop-blur-md text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold 
            flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl
            text-xs sm:text-sm border border-green-500/20 hover:border-green-500/40
            ${
              isGenerating
                ? "opacity-75 cursor-wait"
                : "hover:bg-cg-panel hover:scale-[1.02]"
            }
          `}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-green-400" />
              <span className="hidden xl:inline">Generate Sample Fields</span>
              <span className="xl:hidden hidden sm:inline">
                Generate Fields
              </span>
              <span className="sm:hidden">Gen</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
