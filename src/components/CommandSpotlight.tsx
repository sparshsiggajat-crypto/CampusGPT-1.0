import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Sparkles, 
  CornerDownLeft, 
  MapPin, 
  CreditCard, 
  GraduationCap, 
  ShieldCheck, 
  HelpCircle, 
  BookOpen, 
  ChevronRight,
  Calculator,
  UserCheck
} from "lucide-react";

interface SpotlightItem {
  id: string;
  category: "PAGES" | "QUICK ACTIONS" | "AI COPILOT SHORTCUTS";
  label: string;
  desc: string;
  icon: any;
  action: () => void;
}

interface CommandSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  setQuickAskText?: (text: string) => void;
  userRole?: "student" | "admin";
}

export const CommandSpotlight: React.FC<CommandSpotlightProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  setQuickAskText,
  userRole = "student"
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Let's build up the list of searchable items dynamically based on the user's role
  const allItems: SpotlightItem[] = [];

  if (userRole === "student") {
    // Pages
    allItems.push({
      id: "p_dashboard",
      category: "PAGES",
      label: "Copilot Overview",
      desc: "Go to your main student dashboard with attendance, outstanding fees, and room status",
      icon: UserCheck,
      action: () => { setActiveTab("dashboard"); onClose(); }
    });
    allItems.push({
      id: "p_policy",
      category: "PAGES",
      label: "Campus Guidelines & Regulations",
      desc: "Open the offline policy navigator loaded directly from local database logs",
      icon: BookOpen,
      action: () => { setActiveTab("policy"); onClose(); }
    });
    allItems.push({
      id: "p_chat",
      category: "PAGES",
      label: "AI Copilot Assistant Chat",
      desc: "Go to the dedicated AI companion and speech synthesis terminal",
      icon: Sparkles,
      action: () => { setActiveTab("chat"); onClose(); }
    });
    allItems.push({
      id: "p_settings",
      category: "PAGES",
      label: "Security & Account Settings",
      desc: "Configure secure credentials and review access keys",
      icon: ShieldCheck,
      action: () => { setActiveTab("settings"); onClose(); }
    });
    allItems.push({
      id: "p_help",
      category: "PAGES",
      label: "Help Desk & FAQ Portal",
      desc: "Submit emergency assistance tickets directly to the administration Office",
      icon: HelpCircle,
      action: () => { setActiveTab("help"); onClose(); }
    });

    // Quick Actions
    allItems.push({
      id: "a_pay_tuition",
      category: "QUICK ACTIONS",
      label: "Pay Tuition Installments",
      desc: "Trigger the tuition outstanding installment pay menu dialog",
      icon: CreditCard,
      action: () => { 
        setActiveTab("dashboard"); 
        onClose(); 
        // Trigger pay fee modal - using browser events or timeout state
        setTimeout(() => {
          const btn = document.getElementById("student-dashboard-root")?.querySelector("button[id^='pay-tuition'], p + button, button:has-text('Tuition')") as HTMLButtonElement | null;
          if (btn) btn.click();
          else alert("We've navigated you to the Dashboard! Scroll to 'Outstanding Fees & Dues' and click 'Pay Tuition Installment'.");
        }, 300);
      }
    });

    // AI queries
    if (setQuickAskText) {
      allItems.push({
        id: "ai_attendance",
        category: "AI COPILOT SHORTCUTS",
        label: "AI: Analyze Examination Eligibility",
        desc: "Ask AI if current attendance rates are safe for end-semester exams",
        icon: Sparkles,
        action: () => {
          setQuickAskText("Can I sit for exams based on my current attendance rates?");
          setActiveTab("chat");
          onClose();
        }
      });
      allItems.push({
        id: "ai_scholar",
        category: "AI COPILOT SHORTCUTS",
        label: "AI: Check Scholarship Eligibility Criteria",
        desc: "Query the assistant regarding state and Alumni fellowship grants",
        icon: GraduationCap,
        action: () => {
          setQuickAskText("Which scholarship am I eligible to qualify for? What's the criteria?");
          setActiveTab("chat");
          onClose();
        }
      });
      allItems.push({
        id: "ai_fines",
        category: "AI COPILOT SHORTCUTS",
        label: "AI: Review Library Penalty Infractions",
        desc: "Have the companion pinpoint why a fine outstanding balance is levied",
        icon: Calculator,
        action: () => {
          setQuickAskText("Why do I have an active penalty fine logged on my account?");
          setActiveTab("chat");
          onClose();
        }
      });
    }

  } else {
    // Admin list of jump nodes
    allItems.push({
      id: "adm_analytics",
      category: "PAGES",
      label: "Admin Command Analytics Console",
      desc: "View real-time graphs, fee tallies, and hostel percentage rates",
      icon: ShieldCheck,
      action: () => { setActiveTab("analytics"); onClose(); }
    });
    allItems.push({
      id: "adm_students",
      category: "PAGES",
      label: "Student CRM & Roster Directory",
      desc: "Manage roster additions, import CSV files, and audit records",
      icon: UserCheck,
      action: () => { setActiveTab("students"); onClose(); }
    });
    allItems.push({
      id: "adm_attendance",
      category: "PAGES",
      label: "Class Attendance Log Sheet",
      desc: "Mark logs and update subject percentages",
      icon: Calculator,
      action: () => { setActiveTab("attendance"); onClose(); }
    });
    allItems.push({
      id: "adm_fees",
      category: "PAGES",
      label: "Financial Ledger Controller",
      desc: "Review tuition collections, update disbursements, or waive balances",
      icon: CreditCard,
      action: () => { setActiveTab("fees"); onClose(); }
    });
    allItems.push({
      id: "adm_hostel",
      category: "PAGES",
      label: "Hostel Occupancy & Bed Allocation",
      desc: "Assign dorms, adjust rent status, or view vacant stats",
      icon: MapPin,
      action: () => { setActiveTab("hostel"); onClose(); }
    });
    allItems.push({
      id: "adm_notify",
      category: "PAGES",
      label: "Notice Warnings Board",
      desc: "Deliver custom push alerts or SMS logs directly to clients",
      icon: Sparkles,
      action: () => { setActiveTab("notify"); onClose(); }
    });
  }

  // Filter items
  const filtered = allItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.desc.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation through query matches
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
      // Scroll into view
      const selectedEl = resultsContainerRef.current?.children[selectedIndex + 1] as HTMLElement;
      selectedEl?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      const selectedEl = resultsContainerRef.current?.children[selectedIndex - 1] as HTMLElement;
      selectedEl?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 select-none" onKeyDown={handleKeyDown}>
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      {/* Search Console Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[60vh] overflow-hidden text-slate-800 dark:text-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Spotlight Input Header */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-850 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type search terms or jump directions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-0 outline-none text-[13px] font-semibold focus:ring-0 text-slate-950 dark:text-white"
          />
          <span className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-bold text-slate-400">
            ESC
          </span>
        </div>

        {/* Matches lists */}
        <div 
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2.5 divide-y divide-slate-100 dark:divide-slate-800/40"
        >
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              <Search className="w-10 h-10 mx-auto text-slate-205 dark:text-slate-750 mb-2" />
              <p className="text-xs font-semibold leading-relaxed">No navigation nodes matched "{query}"</p>
              <p className="text-[10px] mt-1 text-slate-500">Try keywords: "attendance", "pay", "scholar", "help", "copilot".</p>
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const ItemIcon = item.icon;
              
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(index);
                    item.action();
                  }}
                  className={`p-3 rounded-2xl flex items-start gap-3 text-left cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-slate-900 text-white dark:bg-indigo-650 dark:text-white" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? "bg-white/10 text-white" : "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  }`}>
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold truncate block">{item.label}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        isSelected 
                          ? "bg-white/20 text-white" 
                          : "bg-slate-1D dark:bg-slate-800 text-slate-450 dark:text-slate-400"
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <span className={`text-[10px] leading-relaxed block mt-1 line-clamp-1 ${
                      isSelected ? "text-slate-300 dark:text-indigo-100" : "text-slate-500 dark:text-slate-405"
                    }`}>
                      {item.desc}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="self-center shrink-0 flex items-center gap-1 text-[9px] font-medium text-white/80">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Command help notes footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-150 dark:border-slate-800 text-[10px] text-slate-450 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="font-bold">↑↓</span> Move
            <span className="font-bold ml-1.5">Enter</span> Route
          </span>
          <span>
            Searching <strong className="text-slate-800 dark:text-white">{allItems.length}</strong> active modules
          </span>
        </div>

      </div>
    </div>
  );
};
