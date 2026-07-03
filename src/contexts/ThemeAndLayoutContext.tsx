import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeType = "classic-light" | "slate-dark" | "sepia-cozy" | "forest-fresh";
export type DensityType = "compact" | "cozy" | "spacious";
export type FontScaleType = "sm" | "base" | "lg";

interface ThemeAndLayoutContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  density: DensityType;
  setDensity: (d: DensityType) => void;
  fontScale: FontScaleType;
  setFontScale: (f: FontScaleType) => void;
  isSpotlightOpen: boolean;
  setIsSpotlightOpen: (b: boolean) => void;
  tourStep: number | null;
  setTourStep: (step: number | null) => void;
  startTour: () => void;
}

const ThemeAndLayoutContext = createContext<ThemeAndLayoutContextType | undefined>(undefined);

export const ThemeAndLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>("classic-light");
  const [density, setDensityState] = useState<DensityType>("cozy");
  const [fontScale, setFontScaleState] = useState<FontScaleType>("base");
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("ug_theme") as ThemeType;
    const savedDensity = localStorage.getItem("ug_density") as DensityType;
    const savedScale = localStorage.getItem("ug_scale") as FontScaleType;

    if (savedTheme) setThemeState(savedTheme);
    if (savedDensity) setDensityState(savedDensity);
    if (savedScale) setFontScaleState(savedScale);

    // Dynamic keyboard listeners for CMD+K Spotlight or Accessibility Jumps
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or Ctrl+K opens spotlight search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
      // ESC closes spotlight/tours
      if (e.key === "Escape") {
        setIsSpotlightOpen(false);
        setTourStep(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const setTheme = (t: ThemeType) => {
    localStorage.setItem("ug_theme", t);
    setThemeState(t);
  };

  const setDensity = (d: DensityType) => {
    localStorage.setItem("ug_density", d);
    setDensityState(d);
  };

  const setFontScale = (f: FontScaleType) => {
    localStorage.setItem("ug_scale", f);
    setFontScaleState(f);
  };

  const startTour = () => {
    setTourStep(1);
  };

  return (
    <ThemeAndLayoutContext.Provider
      value={{
        theme,
        setTheme,
        density,
        setDensity,
        fontScale,
        setFontScale,
        isSpotlightOpen,
        setIsSpotlightOpen,
        tourStep,
        setTourStep,
        startTour
      }}
    >
      {children}
    </ThemeAndLayoutContext.Provider>
  );
};

export const useThemeLayout = () => {
  const context = useContext(ThemeAndLayoutContext);
  if (!context) {
    throw new Error("useThemeLayout must be used within a ThemeAndLayoutProvider");
  }
  return context;
};
