import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useThemeLayout } from "../contexts/ThemeAndLayoutContext";
import { ChatMessage } from "../types";
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  Bookmark, 
  Trash2, 
  RefreshCw,
  Clock,
  AudioLines
} from "lucide-react";

interface AICompanionProps {
  initialQuickAsk: string;
  setInitialQuickAsk: (text: string) => void;
}

export const AICompanion: React.FC<AICompanionProps> = ({
  initialQuickAsk,
  setInitialQuickAsk
}) => {
  const { auth } = useAuth();
  const { theme, density, fontScale } = useThemeLayout();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [citation, setCitation] = useState<{ source: string; pageNum: number } | null>(null);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isTtsActive, setIsTtsActive] = useState(false);
  const [languageMode, setLanguageMode] = useState<"English" | "Hindi" | "Hinglish">("English");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchHistory();
    setupSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Quick ask trigger from other tabs
  useEffect(() => {
    if (initialQuickAsk) {
      setInputText(initialQuickAsk);
      setInitialQuickAsk("");
    }
  }, [initialQuickAsk]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      if (!auth.token) return;
      const response = await fetch("/api/ai/history", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (response.ok && response.headers.get("content-type")?.includes("json")) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await fetch("/api/ai/history/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      });
      if (response.ok) {
        await fetchHistory();
        setCitation(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Browser Speech-to-Text Setup
  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = languageMode === "English" ? "en-US" : "hi-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputText((prev) => prev + " " + transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  };

  // Adjust language on the fly
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageMode === "English" ? "en-US" : "hi-IN";
    }
  }, [languageMode]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Browser Speech Recognition not supported on this client. Secure microphone permissions in metadata and try again.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Text-To-Speech Synthesis (Toggles calling native SpeechSynthesis or backend TTS)
  const handleTTS = async (text: string) => {
    if (isTtsActive) {
      window.speechSynthesis.cancel();
      setIsTtsActive(false);
      return;
    }

    setIsTtsActive(true);

    // Filter out citation tags or markdown stars
    const plainText = text.replace(/[*#]/g, "");

    // Modern fallback triggers native browser pitch synthesis (instantly loads and extremely reliable!)
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = languageMode === "English" ? "en-US" : "hi-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsTtsActive(false);
    };

    utterance.onerror = () => {
      setIsTtsActive(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const txt = inputText.trim();
    if (!txt) return;

    setInputText("");
    setIsLoading(true);
    setCitation(null);

    // Append student client-side immediately
    const userMsg: ChatMessage = {
      id: "us_" + Date.now(),
      role: "user",
      message: txt,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ message: txt })
      });

      if (response.ok && response.headers.get("content-type")?.includes("json")) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: "ai_" + Date.now(),
          role: "model",
          message: data.reply,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (data.citation) {
          setCitation(data.citation);
        }

        // Auto read response if Speech option was enabled
        if (isTtsActive) {
          handleTTS(data.reply);
        }
      } else {
        let msg = "Failed to establish port channels. Please review Secrets configuration.";
        if (response.headers.get("content-type")?.includes("json")) {
          const data = await response.json();
          msg = data.error || msg;
        } else {
          msg = `Server responded with status ${response.status}`;
        }
        throw new Error(msg);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "err_" + Date.now(),
        role: "model",
        message: err.message || "Failed to establish port channels. Please review Secrets configuration.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Unified Theme styling palettes for AI Companion
  const containerStyle = {
    "classic-light": "bg-white border-slate-150 text-slate-850 shadow-sm",
    "slate-dark": "bg-slate-900 border-slate-800 text-slate-100 dark",
    "sepia-cozy": "bg-[#f5ebd5] border-[#dfd4be] text-[#3c2f1f] shadow-xs",
    "forest-fresh": "bg-[#142318] border-[#25392b] text-emerald-100 shadow-xs"
  }[theme];

  const headerStyle = {
    "classic-light": "bg-gradient-to-r from-blue-50 to-indigo-50/75 border-b border-slate-100 text-slate-900",
    "slate-dark": "bg-slate-950/40 border-b border-slate-800/80 text-white",
    "sepia-cozy": "bg-[#ebe0cb] border-b border-[#dfd4be] text-[#3c2f1f]",
    "forest-fresh": "bg-[#111c14] border-b border-[#25392b] text-emerald-100"
  }[theme];

  const inputStyle = {
    "classic-light": "bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-indigo-500",
    "slate-dark": "bg-slate-950 border-slate-800 focus-within:bg-slate-950 focus-within:border-indigo-650",
    "sepia-cozy": "bg-[#fcf8f2] border-[#dfd4be] focus-within:bg-[#fcf8f2] focus-within:border-amber-700",
    "forest-fresh": "bg-[#0b140f] border-[#25392b] focus-within:bg-[#0b140f] focus-within:border-emerald-600"
  }[theme];

  const textMuted = {
    "classic-light": "text-slate-500",
    "slate-dark": "text-slate-400",
    "sepia-cozy": "text-[#6e5d4a]",
    "forest-fresh": "text-[#7bae90]"
  }[theme];

  const threadBg = {
    "classic-light": "bg-slate-50/50",
    "slate-dark": "bg-slate-950/15",
    "sepia-cozy": "bg-[#faf4e8]/60",
    "forest-fresh": "bg-[#0c120e]"
  }[theme];

  const tileTitleStyle = {
    "classic-light": "text-slate-950",
    "slate-dark": "text-white",
    "sepia-cozy": "text-[#3c2f1f]",
    "forest-fresh": "text-emerald-100"
  }[theme];

  const suggestionBg = {
    "classic-light": "bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-700",
    "slate-dark": "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-850/50",
    "sepia-cozy": "bg-[#ebe0cb]/50 border-[#dfd4be] text-[#3c2f1f] hover:bg-[#ebe0cb]",
    "forest-fresh": "bg-[#16271c] border-[#2a4531] text-emerald-100 hover:bg-[#1c3022]"
  }[theme];

  // Robust parsing function representing high-contrast bullets and bold tokens
  const renderMessageText = (txt: string) => {
    const lines = txt.split("\n");
    return lines.map((line, idx) => {
      let content = line;
      const isBullet = content.trim().startsWith("* ") || content.trim().startsWith("- ");
      if (isBullet) {
        content = content.replace(/^([*\-]\s+)/, "");
      }

      // Safe matching of bold tokens (e.g., **text**)
      const parts = [];
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      let lastIndex = 0;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(
          <span key={match.index} className="font-black text-indigo-700 dark:text-indigo-400">
            {match[1]}
          </span>
        );
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const lineContent = parts.length > 0 ? parts : content;

      return (
        <div key={idx} className={`${isBullet ? "pl-4 flex items-start gap-2 my-1.5" : "my-0.5"}`}>
          {isBullet && (
            <span className="text-indigo-500 dark:text-indigo-400 select-none shrink-0 mt-1.5">•</span>
          )}
          <span className="flex-1 leading-relaxed select-text">
            {lineContent}
          </span>
        </div>
      );
    });
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] max-h-screen rounded-3xl overflow-hidden border transition-all duration-200 ${containerStyle}`} id="ai-companion-root">
      
      {/* Copilot Chat Header */}
      <div className={`px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 ${headerStyle}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow">
            C
          </div>
          <div>
            <h3 className={`font-black text-xs flex items-center gap-2 ${tileTitleStyle}`}>
              CampusGPT Personalized Assistant <Sparkles className="w-4 h-4 text-indigo-500 animate-bounce" />
            </h3>
            <p className={`text-[9px] uppercase font-black tracking-widest mt-0.5 ${textMuted}`}>
              Secured Connection • {auth.user?.name}'s core documents
            </p>
          </div>
        </div>

        {/* Voice dialect and controller controls */}
        <div className="flex items-center gap-2 max-md:w-full">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/45 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(["English", "Hindi", "Hinglish"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguageMode(lang)}
                className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${
                  languageMode === lang 
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-xs border border-slate-150 dark:border-zinc-700" 
                    : "text-slate-500"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button 
            onClick={handleClearHistory}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-550 dark:text-slate-300 rounded-xl transition border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Clear Chat Thread"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RAG Citation Capsule */}
      {citation && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/60 text-[10px] uppercase tracking-wider font-extrabold text-indigo-900 dark:text-indigo-200 px-6 py-2.5 flex items-center gap-2 shrink-0 animate-in fade-in duration-100">
          <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span>Validated Source: "{citation.source}" (Approved Section on Page {citation.pageNum})</span>
        </div>
      )}

      {/* Chat Thread Messages Screen */}
      <div className={`flex-1 overflow-y-auto px-6 py-6 space-y-4 transition-colors ${threadBg}`}>
        {messages.length === 0 && !isLoading ? (
          <div className="p-8 text-center max-w-2xl mx-auto my-6 flex flex-col items-center">
            <Sparkles className="w-10 h-10 text-indigo-400 mb-3 animate-pulse" />
            <h4 className={`font-black text-sm uppercase tracking-wider ${tileTitleStyle}`}>Interactive Copilot Terminal</h4>
            <p className={`text-xs mt-1.5 leading-relaxed font-semibold max-w-sm ${textMuted}`}>
              Query the assistant regarding class attendance metrics, fee ledger structures, room availability guidelines, or library fine records.
            </p>

            {/* Bento-style Onboarding Guidance suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full">
              <button 
                onClick={() => setInputText("Can I sit for exam based on my attendance rate?")}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${suggestionBg} shadow-xs`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs">🎓</span>
                  <span className={`text-[11px] font-black leading-none ${tileTitleStyle}`}>Exam Clearance Check</span>
                </div>
                <p className={`text-[10px] leading-normal ${textMuted}`}>Cross-references monthly attendance logs to assess warnings.</p>
              </button>

              <button 
                onClick={() => setInputText("How much tuition fee balance is outstanding?")}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${suggestionBg} shadow-xs`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs">💰</span>
                  <span className={`text-[11px] font-black leading-none ${tileTitleStyle}`}>Outstanding Fees LEDGER</span>
                </div>
                <p className={`text-[10px] leading-normal ${textMuted}`}>Calculates unpaid tuition instalments and pending deadlines.</p>
              </button>

              <button 
                onClick={() => setInputText("Am I eligible for any academic scholarship or fellowship?")}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${suggestionBg} shadow-xs`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs">🏆</span>
                  <span className={`text-[11px] font-black leading-none ${tileTitleStyle}`}>Fellowships Eligibility</span>
                </div>
                <p className={`text-[10px] leading-normal ${textMuted}`}>Inquires parameters regarding State Grants and Alumni Merit aid.</p>
              </button>

              <button 
                onClick={() => setInputText("Why do I have an active library fine?")}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${suggestionBg} shadow-xs`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-xs">⚠️</span>
                  <span className={`text-[11px] font-black leading-none ${tileTitleStyle}`}>Library Infraction Audit</span>
                </div>
                <p className={`text-[10px] leading-normal ${textMuted}`}>Assesses Textbook return defaults and calculates fines.</p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.role === "user";
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isMe ? "bg-slate-200 text-slate-750 dark:bg-slate-800 dark:text-slate-100" : "bg-indigo-600 text-white shadow"
                }`}>
                  {isMe ? <User className="w-4 h-4" /> : "C"}
                </div>
                
                <div className="space-y-1 flex-1 min-w-0">
                  <div className={`p-4 rounded-3xl text-xs font-medium leading-relaxed shadow-xs ${
                    isMe 
                      ? "bg-slate-900 text-white rounded-tr-none dark:bg-indigo-605" 
                      : "bg-white border text-slate-800 border-slate-150 rounded-tl-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-205"
                  }`}>
                    {renderMessageText(m.message)}

                    {/* Integrated message citation pinned directly inside AI answer */}
                    {citation && !isMe && (
                      <div className="mt-3 flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50/50 dark:bg-slate-950/40 border border-indigo-100/50 dark:border-slate-800 rounded-xl text-[9.5px] font-black text-indigo-750 dark:text-indigo-350 w-fit">
                        <Bookmark className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400 shrink-0" />
                        <span>Reference Citation Verified: "{citation.source}" (Page {citation.pageNum})</span>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-2.5 text-[9px] text-slate-400 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isMe && (
                      <button 
                        onClick={() => handleTTS(m.message)}
                        className={`hover:text-indigo-500 cursor-pointer p-0.5 rounded transition ${isTtsActive ? "text-indigo-500 animate-pulse" : "text-slate-400"}`}
                        title="TTS Audio Out"
                      >
                        {isTtsActive ? <AudioLines className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs animate-spin">
              C
            </div>
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 text-slate-400 rounded-tl-none select-none flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold animate-pulse">Copilot is formulating response...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Action Panel */}
      <div className={`p-4 border-t shrink-0 space-y-3 ${headerStyle}`}>
        {/* Continuous Speech recording waves when speaking */}
        {isListening && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-2xl w-fit animate-pulse">
            <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">MICROPHONE ACTIVE</span>
            <div className="flex items-center gap-0.5 h-3.5">
              <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <span className="w-0.5 h-3.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <span className="w-0.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              <span className="w-0.5 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        <form onSubmit={handleMessageSubmit} className="flex gap-3">
          <div className={`flex-1 flex items-center border rounded-2xl transition px-3.5 ${inputStyle}`}>
            <input 
              type="text" 
              placeholder={isListening ? "Listening continuously... speak now..." : "Compose query or speech query..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-xs font-semibold py-3.5 focus:ring-0 text-slate-900 dark:text-white"
              disabled={isLoading}
            />

            {/* Mic trigger */}
            <button 
              type="button" 
              onClick={toggleListening}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isListening ? "bg-rose-50 dark:bg-rose-900/40 text-rose-600" : "text-slate-400 hover:text-slate-600"
              }`}
              title="Speech-To-Text Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !inputText.trim()}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition shadow-md shadow-indigo-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
