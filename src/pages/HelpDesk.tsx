import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  HelpCircle, 
  Send, 
  MessageSquare, 
  Mail, 
  Star, 
  HeartHandshake,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const HelpDesk: React.FC = () => {
  const { auth } = useAuth();

  // Contact Form State
  const [contactSubject, setContactSubject] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [ticketIsSending, setTicketIsSending] = useState(false);

  // Feedback State
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackIsSending, setFeedbackIsSending] = useState(false);

  // FAQ Expandable state indexes
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  const faqItems = [
    {
      q: "Where does CampusGPT fetch policy answers from?",
      a: "CampusGPT utilizes an advanced RAG (Retrieval-Augmented Generation) pipeline. When you ask a policy question, the engine scans officially uploaded board documents (such as Hostel Manuals, Academic Calendars, Exam Rules) and retrieves exact page numbers to substantiate the answers. The AI will never hallucinate or reply outside the documents."
    },
    {
      q: "How often are my attendance and fee status data refreshed?",
      a: "Your records are synced every 60 seconds. A TanStack-style pooling hook periodically checks the server backend without bothering you, and flashes a quick sync countdown badge in your top header."
    },
    {
      q: "Can I download payment receipts of fees paid?",
      a: "Yes! Beneath your Fee Installments Registry table on the main dashboard, you can trigger download outputs in either PDF report or Excel spreadsheet formats with legal verification tags."
    },
    {
      q: "How can I apply for available scholarships?",
      a: "Navigate to the Scholarships segment of your dashboard, choose from the eligible fellowship keys and click 'Submit Application'. The Warden admin will review the application and update the status dynamically."
    },
    {
      q: "Can I talk to the Copilot using Hindi or Hinglish?",
      a: "Absolutely! The Personalized Copilot fully understands Hinglish dialect commands (e.g. 'Mera outstanding hostel fine dikhao') and can respond back translated inline. You can also listen to audio readouts in multiple tempos."
    }
  ];

  const handleContactAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSuccess("");
    setTicketError("");
    setTicketIsSending(true);

    if (!contactSubject || !contactMsg) {
      setTicketError("Both Subject and Message are required");
      setTicketIsSending(false);
      return;
    }

    try {
      const resp = await fetch("/api/student/contact-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          subject: contactSubject,
          message: contactMsg
        })
      });

      const resData = await resp.json();
      if (resp.ok) {
        setTicketSuccess("Support ticket registered in portal! Confirmation dispatched.");
        setContactSubject("");
        setContactMsg("");
      } else {
        setTicketError(resData.error || "Failed to submit help ticket");
      }
    } catch {
      setTicketError("Could not reach support server");
    } finally {
      setTicketIsSending(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSuccess("");
    setFeedbackError("");
    setFeedbackIsSending(true);

    try {
      const resp = await fetch("/api/student/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          rating: starRating,
          feedback: feedbackText
        })
      });

      const resData = await resp.json();
      if (resp.ok) {
        setFeedbackSuccess("Feedback logged successfully. Thank you for rating!");
        setFeedbackText("");
      } else {
        setFeedbackError(resData.error || "Failed to log feedback");
      }
    } catch {
      setFeedbackError("Could not reach server");
    } finally {
      setFeedbackIsSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto" id="help-center-envelope">
      
      {/* Title Header banner */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-550/10 rounded-xl flex items-center justify-center text-indigo-600">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Help Center & FAQ</h1>
          <p className="text-xs text-slate-500">Find answers instantly or file official queries directly with the warden</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FAQ segment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Frequently Asked Questions (FAQ)
            </h2>

            <div className="space-y-3.5 divide-y divide-slate-100">
              {faqItems.map((faq, idx) => (
                <div key={idx} className={`${idx > 0 ? "pt-3.5" : ""} group`}>
                  <button
                    onClick={() => setActiveFaqIdx(activeFaqIdx === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-slate-800 text-xs group-hover:text-indigo-600 transition">
                      {faq.q}
                    </span>
                    <span className="text-xs text-slate-400 font-bold ml-2">
                      {activeFaqIdx === idx ? "−" : "+"}
                    </span>
                  </button>
                  {activeFaqIdx === idx && (
                    <p className="mt-2 text-slate-500 text-xs leading-relaxed pl-1 transition-all duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Form Card */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-indigo-500" />
              Portal Feedback & Suggestions
            </h2>
            <p className="text-xs text-slate-500 mb-6">Rate your experience to help the tech team refine future model layouts.</p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {feedbackSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}
              {feedbackError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{feedbackError}</span>
                </div>
              )}

              {/* Interactive Star component */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Rate CampusGPT Portal
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-md hover:bg-slate-550/10 focus:outline-none transition"
                    >
                      <Star 
                        className={`w-6 h-6 transition-all ${
                          star <= (hoverRating !== null ? hoverRating : starRating)
                            ? "fill-indigo-600 text-indigo-600 scale-110"
                            : "text-slate-300"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Comments or Core Feedback
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you like or what could be improved inside this copilot..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={feedbackIsSending}
                className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {feedbackIsSending ? "Sending..." : "Submit My Verdict"}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Form Support ticket panel column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Mail className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Direct Office Helpline</h2>
            </div>
            
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Have an issue with hostel rooms, outstanding tuition fees, or need a manual review? Mail a direct docket to Warden **Dr. Ramesh Kumar**.
            </p>

            <form onSubmit={handleContactAdmin} className="space-y-4">
              {ticketSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ticketSuccess}</span>
                </div>
              )}
              {ticketError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{ticketError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Topic Subject
                </label>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="e.g. Requesting Hostel Room Swap"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Describe Request Details
                </label>
                <textarea
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  placeholder="Please give complete details like enrollment year, problem faced etc."
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={ticketIsSending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {ticketIsSending ? "Delivering..." : "Dispatch Helper Docket"}
              </button>
            </form>
          </div>

          {/* Quick Support Metrics Panel */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-slate-200">
            <span className="text-[10px] bg-indigo-150 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Help Desk Status</span>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Average Reply Latency:</span>
                <span className="font-semibold text-slate-800">&lt; 3 Hours</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Active Controllers Available:</span>
                <span className="font-semibold text-slate-800">2 Officials Online</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Portal Security Tier:</span>
                <span className="font-bold text-emerald-600 select-none">Fully Verified Shield</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
