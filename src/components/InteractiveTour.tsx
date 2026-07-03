import React from "react";
import { useThemeLayout } from "../contexts/ThemeAndLayoutContext";
import { Sparkles, HelpCircle, ChevronRight, ChevronLeft, X, Check } from "lucide-react";

interface TourStepDef {
  title: string;
  desc: string;
  highlightId?: string;
  role: "student" | "admin" | "all";
}

interface InteractiveTourProps {
  userRole?: "student" | "admin";
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({ userRole = "student" }) => {
  const { tourStep, setTourStep } = useThemeLayout();

  if (tourStep === null) return null;

  const studentSteps: TourStepDef[] = [
    {
      title: "🚀 Welcome to the CampusGPT Student Portal!",
      desc: "Our customized layout bridges institutional registries with a localized AI. Let's show you around the critical widgets in 4 easy steps.",
      role: "student"
    },
    {
      title: "📊 Subject-wise Attendance Trends",
      desc: "Track monthly rates and subject bars. Our RAG logic provides custom warnings and eligibility feedback if your average rate drops below 75%.",
      highlightId: "student_attendance_bento",
      role: "student"
    },
    {
      title: "💳 Financial Instalments Outstanding",
      desc: "View paid balances & upcoming deadlines. You can route instant installment payments directly using the secure UPI payment dialog.",
      highlightId: "student-dashboard-root",
      role: "student"
    },
    {
      title: "🎓 Personal Fellowships & Scholarships Board",
      desc: "Locate active state minority programs, check AI eligibility, and apply comfortably on-the-fly with instant status feedback.",
      highlightId: "scholarships-bento",
      role: "student"
    },
    {
      title: "✨ Master Anything with CMD+K Spotlight!",
      desc: "To explore sections without lifting your fingers, hit 'Ctrl + K'. Type 'pay', 'eligible', or query terms to route immediately.",
      role: "student"
    }
  ];

  const adminSteps: TourStepDef[] = [
    {
      title: "💼 ERP Analytics Command Console",
      desc: "Welcome to the Academic Warden's Nerve Center! We have preloaded 8 key indicators tracking active student rosters, balances, and room stats.",
      role: "admin"
    },
    {
      title: "➕ Student Roster Directories",
      desc: "Use the 'Student Roster' tab to filter lists, add student entities, or batch-upload folders of CSV entries comfortably.",
      role: "admin"
    },
    {
      title: "📢 Warnings & Notice Announcements",
      desc: "Disseminate emergency push warnings and warning notices directly to students' notifications tray using 'Announcement Desk'.",
      role: "admin"
    },
    {
      title: "⚙️ Customizer & Appearance Engine",
      desc: "Set comfortable Slate Dark, Forest Fresh, or Eye-safe Sepia views. Change density modes to quickly audit large listings without eye strain.",
      role: "admin"
    }
  ];

  const currentSteps = userRole === "admin" ? adminSteps : studentSteps;
  const currentStepDef = currentSteps[tourStep - 1];

  if (!currentStepDef) {
    // End tour gracefully if step exceeds bounds
    setTourStep(null);
    return null;
  }

  const isFirst = tourStep === 1;
  const isLast = tourStep === currentSteps.length;

  const handleNext = () => {
    if (isLast) {
      setTourStep(null);
    } else {
      setTourStep(tourStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setTourStep(tourStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs select-none">
      
      {/* Target Focus Highlighter Overlay Cue if element ID is provided */}
      {currentStepDef.highlightId && (
        <div className="absolute border-4 border-indigo-500 rounded-2xl animate-pulse pointer-events-none hidden lg:block"
          style={{
            zIndex: 40,
            // Draw highlight border around target
            ...(() => {
              const el = document.getElementById(currentStepDef.highlightId!);
              if (el) {
                const rect = el.getBoundingClientRect();
                return {
                  top: `${rect.top - 8}px`,
                  left: `${rect.left - 8}px`,
                  width: `${rect.width + 16}px`,
                  height: `${rect.height + 16}px`,
                };
              }
              return { display: "none" };
            })()
          }}
        />
      )}

      {/* Main step dialog box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative space-y-4 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Step Indicator Top Bar */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black tracking-widest text-indigo-650 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-xl">
            TUTORIAL STEP {tourStep} OF {currentSteps.length}
          </span>
          <button 
            onClick={() => setTourStep(null)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <h4 className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            {currentStepDef.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal leading-relaxed font-semibold">
            {currentStepDef.desc}
          </p>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setTourStep(null)}
            className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Skip guide
          </button>

          <div className="flex gap-2 font-bold text-xs">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="p-2 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-300 transition"
                title="Go back"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-700 text-white rounded-xl shadow transition flex items-center gap-1.5"
            >
              <span>{isLast ? "Done, let's go!" : "Next segment"}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
