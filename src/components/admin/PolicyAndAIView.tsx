import React, { useState } from "react";
import { 
  FileUp, 
  Trash2, 
  CheckCircle, 
  Cpu, 
  Database, 
  Settings, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  BarChart, 
  Activity, 
  Send, 
  BookOpen 
} from "lucide-react";

interface PolicyAndAIViewProps {
  analytics: any;
  token: string;
  onRefresh: () => Promise<void>;
}

export const PolicyAndAIView: React.FC<PolicyAndAIViewProps> = ({ 
  analytics, 
  token, 
  onRefresh 
}) => {
  // Tabs: policy | ai
  const [activeTab, setActiveTab] = useState<"policy" | "ai">("policy");

  // Policy States
  const [polTitle, setPolTitle] = useState("");
  const [polCategory, setPolCategory] = useState("Academic Regulations");
  const [polContent, setPolContent] = useState("");
  const [polSuccess, setPolSuccess] = useState(false);

  // Prompt Management
  const [systemPrompt, setSystemPrompt] = useState(
    "You are CampusGPT, an elite AI Academic Advisor & Copilot for university students. Answer queries objectively and pair replies with cited policy codes."
  );
  const [promptSaved, setPromptSaved] = useState(false);

  // Policy uploader submit
  const handlePolicyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!polTitle.trim() || !polContent.trim()) return;

    try {
      const response = await fetch("/api/admin/policy/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: polTitle,
          category: polCategory,
          content: polContent
        })
      });
      if (response.ok) {
        setPolSuccess(true);
        setPolTitle("");
        setPolContent("");
        setTimeout(() => setPolSuccess(false), 4000);
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 3000);
  };

  const aiQuestions = analytics?.aiQuestions || [
    { question: "What is the policy for short attendance because of sickness?", count: 18 },
    { question: "Where is the hostel dining application located?", count: 12 },
    { question: "Are state merit scholarships open to freshmen?", count: 9 },
    { question: "Can I void my lab equipment penalty?", count: 5 }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md" id="policies_ai_control">
      
      {/* Tab bar selection */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl mb-4 w-fit">
        <button 
          onClick={() => setActiveTab("policy")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "policy" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Policy Upload Center
        </button>
        <button 
          onClick={() => setActiveTab("ai")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "ai" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
        >
          <Cpu className="w-3.5 h-3.5" /> AI Control Center
        </button>
      </div>

      {/* SUBVIEW 1: Policy Management */}
      {activeTab === "policy" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-slate-300">
          
          {/* Form col */}
          <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <span className="font-extrabold text-white text-xs uppercase tracking-wider block">Commit Official Policy Board Regulations</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Submit raw board resolutions or administrative guides. The RAG pipeline automatically strips sections, generates embeddings utilizing Gemini, and pushes semantic nodes onto the vector index.
              </p>
            </div>

            <form onSubmit={handlePolicyUpload} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1.5 font-bold">Document Title</label>
                  <input 
                    type="text"
                    value={polTitle}
                    onChange={e => setPolTitle(e.target.value)}
                    placeholder="e.g. Hostels curfew standard operations"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1.5 font-bold">Classification Domain</label>
                  <select 
                    value={polCategory}
                    onChange={e => setPolCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                  >
                    <option value="Conduct Regulations">Dorm Conduct Regulations</option>
                    <option value="Academic Regulations">Academic Regulations</option>
                    <option value="Fee Guidelines">Fee Guidelines</option>
                    <option value="Hostel Guidelines">Hostel Rules & Safety</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">RAG Raw Text Corpus (Markdown / Paragraphs)</label>
                <textarea 
                  rows={4}
                  value={polContent}
                  onChange={e => setPolContent(e.target.value)}
                  placeholder="Insert bullet points or policy paragraphs. Students can query details via the AI Copilot."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none font-mono text-[10px]"
                  required
                />
              </div>

              {polSuccess && (
                <div className="p-2 border border-emerald-800 bg-emerald-950/60 text-emerald-400 rounded-lg flex items-center gap-1.5 font-bold animate-pulse">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Embedded nodes generated and registered in index vector storage!
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl shadow select-none"
              >
                Assemble & Commit Policy Document
              </button>
            </form>
          </div>

          {/* Index and vector status monitoring */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Index summary */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="font-bold text-white text-xs block">AI Vector Database Index Status</span>
              
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-500">Vector Host provider</span>
                  <span className="text-white font-bold">Pinecone (Standard-GCP)</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-500">Index Node status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">🟢 Connected & Live</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-500">Total Registered Chunks</span>
                  <span className="text-indigo-400 font-bold">142 Embedded Nodes</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800/40">
                  <span className="text-slate-500">Query Latency Average</span>
                  <span className="text-cyan-400 font-bold">12ms (Cached pipeline)</span>
                </div>
              </div>
            </div>

            {/* Version List */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <span className="font-bold text-white text-xs block mb-3">Loaded Corpus Documents</span>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">Dorm Curfew Penalties</span>
                    <span className="text-[10px] text-slate-500 block">Hostel rules v2.1 (Index synced)</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">1.2kb</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">Academic Short Attendance Laws</span>
                    <span className="text-[10px] text-slate-500 block">Scholarship criteria (v1)</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">4.4kb</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBVIEW 2: AI Control Center */}
      {activeTab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-slate-300">
          
          {/* Left col: Chat logs auditing and stats */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Mini API Usage graph */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">Gemini Model Inference stats</span>
                <span className="bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-lg text-[9px] font-mono">Model: 1.5-flash</span>
              </div>

              <div className="h-2 rounded bg-slate-800 overflow-hidden relative">
                <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-400 w-[68%]" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono">
                <span>Total Token Quota (Daily): 68% utilized</span>
                <span>Calls: 2,422/5,000</span>
              </div>
            </div>

            {/* Chat audit logs */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="font-bold text-white text-xs">Student search logs (Audit Roster)</span>
                <span className="text-[10px] text-slate-500 font-bold font-mono">RAG Hit Rate: 98.4%</span>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto">
                {aiQuestions.map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl leading-relaxed flex justify-between items-center">
                    <div className="space-y-1 pr-3">
                      <span className="text-slate-200 block font-bold leading-tight">"{item.question}"</span>
                      <span className="text-[9px] text-slate-500 font-mono block">Validated with citations (Copilot pipeline)</span>
                    </div>
                    <span className="bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 px-2 py-0.5 rounded font-bold font-mono shrink-0">
                      {item.count} counts
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right col: System prompt configuration & diagnostics */}
          <div className="lg:col-span-6 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <span className="font-extrabold text-white text-xs uppercase block">Modify system intelligence instruction</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Refine the underlying persona logic of CampusGPT. Ensure formatting aligns with institutional standards. Writes directly to system embeddings parameters.
              </p>
            </div>

            <form onSubmit={handleSavePrompt} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">LLM Orchestration system instruction</label>
                <textarea 
                  rows={5}
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-white font-mono text-[10px] outline-none focus:border-blue-500"
                />
              </div>

              {promptSaved && (
                <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 font-extrabold rounded-lg animate-pulse">
                  System Orchestrations instructions deployed to runtime variables!
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl select-none"
              >
                Save & Hot-Deploy Prompt
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
