import React, { useState } from "react";
import { useThemeLayout, ThemeType, DensityType, FontScaleType } from "../contexts/ThemeAndLayoutContext";
import { 
  Sparkles, 
  Layers, 
  Type, 
  HelpCircle, 
  Layout, 
  X, 
  Command, 
  Check,
  Compass,
  Contrast,
  Sun,
  Moon,
  Feather,
  Eye,
  ArrowRight
} from "lucide-react";

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose, userRole }) => {
  const { 
    theme, 
    setTheme, 
    density, 
    setDensity, 
    fontScale, 
    setFontScale, 
    startTour 
  } = useThemeLayout();

  if (!isOpen) return null;

  const themesList: { id: ThemeType; label: string; desc: string; bg: string; text: string; icon: any }[] = [
    { id: "classic-light", label: "Classic Light", desc: "Crisp white, high readability", bg: "bg-white border-slate-200", text: "text-slate-800", icon: Sun },
    { id: "slate-dark", label: "Slate Dark", desc: "Calm, sleek, low-light blue-gray", bg: "bg-slate-900 border-slate-800", text: "text-slate-100", icon: Moon },
    { id: "sepia-cozy", label: "Sepia Cozy", desc: "Warm amber eye-strain relief", bg: "bg-[#f4ebd0] border-[#e6d8b3]", text: "text-[#3c2f1f]", icon: Feather },
    { id: "forest-fresh", label: "Forest Mint", desc: "Serene mint-moss high contrast", bg: "bg-emerald-950 border-emerald-900", text: "text-emerald-100", icon: Eye }
  ];

  const densities: { id: DensityType; label: string; desc: string }[] = [
    { id: "compact", label: "Compact Density", desc: "Data intensive, tight listing matrices" },
    { id: "cozy", label: "Balanced Cozy", desc: "Comfortable negative space heights" },
    { id: "spacious", label: "Relaxed Spacious", desc: "Spacious padding, relaxed overview" }
  ];

  const scales: { id: FontScaleType; label: string; style: string; size: string }[] = [
    { id: "sm", label: "Small text", style: "text-xs", size: "12px" },
    { id: "base", label: "Standard", style: "text-sm", size: "14px" },
    { id: "lg", label: "Large font", style: "text-base", size: "16px" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in slide-in-from-right duration-200 text-slate-800 dark:text-slate-200">
        
        {/* Panel Header */}
        <div className="p-5 border-b border-slate-150 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-extrabold text-[14px] text-slate-950 dark:text-white leading-none">Layout & Aesthetics Customizer</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Make your portal eye-comfortable</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-950 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Customize Body  */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
          
          {/* Quick Walkthrough Tour Trigger */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10 space-y-2">
              <span className="text-[9px] uppercase tracking-widest font-black bg-white/20 px-2 py-0.5 rounded-full inline-block">
                Interactive Companion Guide
              </span>
              <h4 className="font-extrabold text-[13px] tracking-tight text-white leading-snug">Need assistance locating tools?</h4>
              <p className="text-[10px] text-indigo-100 leading-normal">Let our visual overlay highlight each screen segment step-by-step.</p>
              
              <button 
                onClick={() => {
                  onClose();
                  startTour();
                }}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black hover:bg-slate-50 transition shadow"
              >
                <Compass className="w-3.5 h-3.5" />
                Launch Quick Walkthrough
              </button>
            </div>
          </div>

          {/* Section 1: Themes list */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Contrast className="w-3.5 h-3.5 text-indigo-500" />
              <span>Background Canvas Tone</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {themesList.map((item) => {
                const isSelected = theme === item.id;
                const ThemeIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between h-24 shadow-sm ${
                      isSelected 
                        ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/10" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1.5 rounded-lg border ${item.bg}`}>
                        <ThemeIcon className={`w-3.5 h-3.5 ${item.text}`} />
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-left">
                      <span className="text-[11px] font-black block text-slate-950 dark:text-white leading-none">{item.label}</span>
                      <span className="text-[8px] text-slate-500 dark:text-slate-400 leading-normal block mt-1 truncate">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Density layout options */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Grid & List Information Density</span>
            </div>

            <div className="space-y-2">
              {densities.map((item) => {
                const isSelected = density === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setDensity(item.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected 
                        ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/15 text-indigo-950 dark:text-indigo-200" 
                        : "border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-650 dark:text-slate-300"
                    }`}
                  >
                    <div>
                      <span className="text-[11px] font-black block leading-none">{item.label}</span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-450 mt-1 block leading-none">{item.desc}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Font scale options */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Type className="w-3.5 h-3.5 text-indigo-500" />
              <span>Text Magnification & Scaling</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {scales.map((item) => {
                const isSelected = fontScale === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFontScale(item.id)}
                    className={`px-3 py-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-600 text-white shadow" 
                        : "border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <span className={`font-black ${item.style}`}>Aa</span>
                    <span className="text-[9px] font-bold mt-1 block opacity-80 leading-none">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessibility Shortcuts Help */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5">
              <Command className="w-4 h-4 text-slate-550 dark:text-slate-400" />
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-650 dark:text-slate-350">Quick CMD Shortcuts</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border dark:border-slate-750 rounded text-[9px] font-mono">Ctrl + K</kbd> (or CMD+K) on any screen to launch the <strong>Spotlight Command bar</strong> for instant keyboard-only traversal.
            </p>
          </div>

        </div>

        {/* Footer info branding block */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-150 dark:border-slate-800 text-center">
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest block leading-relaxed">
            Layout standards aligned with WCAG 2.1 AAA
          </span>
        </div>

      </div>
    </div>
  );
};
