'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HOME_SEATS, STATIONS } from '@/lib/constants';

type SeatKey = 'karsa' | 'arka' | 'ara' | 'sekar' | 'radit';
type StationKey = 'home' | 'karsa' | 'ara' | 'arka' | 'radit' | 'sekar' | 'loft';

const SEAT_KEYS: { key: SeatKey; label: string; color: string }[] = [
  { key: 'karsa', label: 'Karsa (Purple)', color: '#a855f7' },
  { key: 'arka',  label: 'Arka (Yellow)',  color: '#eab308' },
  { key: 'ara',   label: 'Ara (Blue)',     color: '#3b82f6' },
  { key: 'sekar', label: 'Sekar (White)',  color: '#e2e8f0' },
  { key: 'radit', label: 'Radit (Magenta)', color: '#ec4899' },
];

const STATION_KEYS: { key: StationKey; label: string }[] = [
  { key: 'home',  label: 'Home Center' },
  { key: 'karsa', label: 'Karsa Station' },
  { key: 'ara',   label: 'Ara Desk' },
  { key: 'arka',  label: 'Arka Workstation' },
  { key: 'radit', label: 'Radit Desk' },
  { key: 'sekar', label: 'Sekar Corner' },
  { key: 'loft',  label: 'Loft Top' },
];

export default function CoordCalibrationOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'seats' | 'stations'>('seats');
  const [selectedSeat, setSelectedSeat] = useState<SeatKey>('karsa');
  const [selectedStation, setSelectedStation] = useState<StationKey>('home');
  const [seats, setSeats] = useState<Record<SeatKey, { x: number; y: number }>>({
    karsa: { ...HOME_SEATS.karsa },
    arka:  { ...HOME_SEATS.arka },
    ara:   { ...HOME_SEATS.ara },
    sekar: { ...HOME_SEATS.sekar },
    radit: { ...HOME_SEATS.radit },
  });
  const [stations, setStations] = useState<Record<StationKey, { x: number; y: number; scale: number }>>({
    home:  { ...STATIONS.home },
    karsa: { ...STATIONS.karsa },
    ara:   { ...STATIONS.ara },
    arka:  { ...STATIONS.arka },
    radit: { ...STATIONS.radit },
    sekar: { ...STATIONS.sekar },
    loft:  { ...STATIONS.loft },
  });
  const [showLabels, setShowLabels] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const hudTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('calibrate=1')) {
        setEnabled(true);
      }
    }
  }, []);

  if (!enabled) return null;

  // Zero-rerender high-performance DOM mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !hudRef.current || !hudTextRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));

    hudRef.current.style.display = 'flex';
    hudRef.current.style.left = `${e.clientX - rect.left}px`;
    hudRef.current.style.top = `${e.clientY - rect.top}px`;
    hudTextRef.current.textContent = `${x}% , ${y}%`;
  };

  const handleMouseLeave = () => {
    if (hudRef.current) hudRef.current.style.display = 'none';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent click if user clicked inside calibration panel
    if ((e.target as HTMLElement).closest('.calibration-panel')) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
    const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));

    if (activeTab === 'seats') {
      setSeats((prev) => ({
        ...prev,
        [selectedSeat]: { x, y },
      }));
      // Auto-advance to next seat key
      const currentIndex = SEAT_KEYS.findIndex((s) => s.key === selectedSeat);
      if (currentIndex !== -1 && currentIndex < SEAT_KEYS.length - 1) {
        setSelectedSeat(SEAT_KEYS[currentIndex + 1].key);
      }
    } else {
      setStations((prev) => ({
        ...prev,
        [selectedStation]: { ...prev[selectedStation], x, y },
      }));
      const currentIndex = STATION_KEYS.findIndex((s) => s.key === selectedStation);
      if (currentIndex !== -1 && currentIndex < STATION_KEYS.length - 1) {
        setSelectedStation(STATION_KEYS[currentIndex + 1].key);
      }
    }
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(msg);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const generateSeatsCode = () => {
    const code = `export const HOME_SEATS = {\n` +
      `  karsa: { x: ${seats.karsa.x}, y: ${seats.karsa.y} },\n` +
      `  arka:  { x: ${seats.arka.x}, y: ${seats.arka.y} },\n` +
      `  ara:   { x: ${seats.ara.x}, y: ${seats.ara.y} },\n` +
      `  sekar: { x: ${seats.sekar.x}, y: ${seats.sekar.y} },\n` +
      `  radit: { x: ${seats.radit.x}, y: ${seats.radit.y} },\n` +
      `} as const;`;

    copyToClipboard(code, 'Copied HOME_SEATS to clipboard!');
  };

  const generateStationsCode = () => {
    const code = `export const STATIONS = {\n` +
      `  home:  { x: ${stations.home.x}, y: ${stations.home.y}, scale: 1.35 },\n` +
      `  karsa: { x: ${stations.karsa.x}, y: ${stations.karsa.y}, scale: 1.35 },\n` +
      `  ara:   { x: ${stations.ara.x}, y: ${stations.ara.y}, scale: 1.45 },\n` +
      `  arka:  { x: ${stations.arka.x}, y: ${stations.arka.y}, scale: 1.45 },\n` +
      `  radit: { x: ${stations.radit.x}, y: ${stations.radit.y}, scale: 1.45 },\n` +
      `  sekar: { x: ${stations.sekar.x}, y: ${stations.sekar.y}, scale: 1.45 },\n` +
      `  loft:  { x: ${stations.loft.x}, y: ${stations.loft.y}, scale: 1.35 },\n` +
      `} as const;`;

    copyToClipboard(code, 'Copied STATIONS to clipboard!');
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 cursor-crosshair select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCanvasClick}
    >
      {/* 60FPS Hardware-Accelerated Crosshair HUD (No React Re-renders) */}
      <div
        ref={hudRef}
        className="pointer-events-none absolute z-50 hidden flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: 0, top: 0 }}
      >
        <div className="w-5 h-5 border border-emerald-400 rounded-full flex items-center justify-center bg-emerald-950/30 shadow-lg">
          <div className="w-1 h-1 bg-emerald-400 rounded-full" />
        </div>
        <div className="mt-1 bg-slate-900/90 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap shadow-xl">
          <span ref={hudTextRef}>0% , 0%</span>
        </div>
      </div>

      {/* Render Seat Markers (Strictly pointer-events-none so clicks never blocked) */}
      {SEAT_KEYS.map(({ key, label, color }) => {
        const pos = seats[key];
        const isSelected = activeTab === 'seats' && selectedSeat === key;
        return (
          <div
            key={`seat-${key}`}
            className="pointer-events-none absolute transform -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-75"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div
              className={`rounded-full border-2 shadow-lg flex items-center justify-center transition-all ${
                isSelected ? 'w-6 h-6 border-white bg-emerald-500 ring-4 ring-emerald-500/40 animate-pulse' : 'w-4 h-4 border-slate-900'
              }`}
              style={{ backgroundColor: isSelected ? undefined : color }}
            >
              <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
            </div>
            {showLabels && (
              <div className={`absolute top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md border ${
                isSelected ? 'bg-emerald-950 text-emerald-200 border-emerald-400 font-bold z-50' : 'bg-slate-900/90 text-slate-300 border-slate-700/80 opacity-80'
              }`}>
                {label.split(' ')[0]}: {pos.x}%, {pos.y}%
              </div>
            )}
          </div>
        );
      })}

      {/* Render Station Markers (when station tab active) */}
      {activeTab === 'stations' &&
        STATION_KEYS.map(({ key, label }) => {
          const pos = stations[key];
          const isSelected = selectedStation === key;
          return (
            <div
              key={`station-${key}`}
              className="pointer-events-none absolute transform -translate-x-1/2 -translate-y-1/2 z-40"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                className={`w-5 h-5 border-2 rounded flex items-center justify-center shadow-lg ${
                  isSelected ? 'border-amber-300 bg-amber-500 text-slate-950 font-bold ring-4 ring-amber-500/40' : 'border-indigo-400 bg-indigo-900/80 text-indigo-200'
                }`}
              >
                <span className="text-[9px] font-mono uppercase">{key.substring(0, 2)}</span>
              </div>
              {showLabels && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
                  {label}: {pos.x}%, {pos.y}%
                </div>
              )}
            </div>
          );
        })}

      {/* Modern High-Usability Calibration Control Panel */}
      <div
        className="calibration-panel fixed top-4 right-4 z-50 bg-slate-900/95 border border-slate-700/90 rounded-2xl p-4 shadow-2xl text-slate-200 text-xs w-80 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-sm tracking-wide text-white">Sobat Karsa Calibrator</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLabels((prev) => !prev)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                showLabels ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-amber-950 border-amber-600 text-amber-300'
              }`}
            >
              {showLabels ? 'Hide Labels' : 'Show Labels'}
            </button>
            <button
              onClick={() => setEnabled(false)}
              className="text-slate-400 hover:text-white text-base px-1"
              title="Close overlay"
            >
              ✕
            </button>
          </div>
        </div>

        {copiedText && (
          <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-medium mb-3 text-center shadow-lg animate-bounce">
            {copiedText}
          </div>
        )}

        {/* Category Tabs: SEATS vs STATIONS */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl mb-3 border border-slate-800">
          <button
            onClick={() => setActiveTab('seats')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'seats'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Character Seats ({SEAT_KEYS.length})
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'stations'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Camera Stations ({STATION_KEYS.length})
          </button>
        </div>

        {/* Target Buttons Grid */}
        <div className="mb-3">
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Active Target (Click island to set position):
          </label>

          {activeTab === 'seats' ? (
            <div className="grid grid-cols-1 gap-1 max-h-44 overflow-y-auto pr-1">
              {SEAT_KEYS.map(({ key, label, color }) => {
                const isSelected = selectedSeat === key;
                const pos = seats[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSeat(key)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 text-white font-medium ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {pos.x}%, {pos.y}%
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1 max-h-44 overflow-y-auto pr-1">
              {STATION_KEYS.map(({ key, label }) => {
                const isSelected = selectedStation === key;
                const pos = stations[key];
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedStation(key)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 text-white font-medium ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[11px] text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {pos.x}%, {pos.y}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Copy Buttons */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <button
            onClick={generateSeatsCode}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-semibold text-xs transition shadow-lg flex items-center justify-center gap-1.5"
          >
            <span>📋</span> Copy HOME_SEATS Code
          </button>
          <button
            onClick={generateStationsCode}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-semibold text-xs transition shadow-lg flex items-center justify-center gap-1.5"
          >
            <span>📋</span> Copy STATIONS Code
          </button>
        </div>
      </div>
    </div>
  );
}
