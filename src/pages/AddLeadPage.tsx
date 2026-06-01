import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, UserPlus, Sparkles, Building, Mail, Phone, Calendar, Link, FileText, CheckCircle2 } from "lucide-react";

interface AddLeadPageProps {
  onNavigate: (page: string, extra?: any) => void;
}

export default function AddLeadPage({ onNavigate }: AddLeadPageProps) {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  // Unified Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("Website");
  const [status, setStatus] = useState("New");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Regex check email pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setError("Please supply a complete contact full name.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please specify a valid email address structure (e.g. name@domain.com).");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim(),
          source,
          status,
          notes: notes.trim(),
          followUpDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast("New lead generated and ingested into database!", "success");
        onNavigate("leads");
      } else {
        setError(data.error || "Failed to create lead structure.");
        toast(data.error || "Action failed", "error");
      }
    } catch (err) {
      console.error(err);
      setError("Link failure checking active API. Ensure backend is running.");
      toast("Server link failure", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      
      {/* 1. Header Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("leads")}
          className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 hover:dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md cursor-pointer transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Ingest Lead</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Add parameters to feed information logs to CRM algorithms.
          </p>
        </div>
      </div>

      {/* 2. Visual Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 right-0 h-1" />

        {error && (
          <div className="m-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Field A: Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Contact Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <UserPlus className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all placeholder-slate-400"
                  placeholder="e.g. Robert Downey Jr."
                />
              </div>
            </div>

            {/* Field B: Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all placeholder-slate-400"
                  placeholder="e.g. r.downey@stark.com"
                />
              </div>
            </div>

            {/* Field C: Phone Number */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all placeholder-slate-400"
                  placeholder="e.g. +1 555-0199"
                />
              </div>
            </div>

            {/* Field D: Company Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Company Association
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all placeholder-slate-400"
                  placeholder="e.g. Stark Industries"
                />
              </div>
            </div>

            {/* Field E: Lead Source Channel */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Acquisition Channel
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Link className="w-4 h-4" />
                </span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-700 dark:text-slate-350 dark:bg-slate-950 appearance-none cursor-pointer transition-all"
                >
                  <option value="Website">🌐 Website Landing Form</option>
                  <option value="LinkedIn">💼 LinkedIn Networking</option>
                  <option value="Referral">🤝 Personal Referral</option>
                  <option value="Instagram">📸 Instagram Channel</option>
                  <option value="Other">❓ Other Channel</option>
                </select>
              </div>
            </div>

            {/* Field F: Initial Pipeline Status */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Stage Entry Status
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-700 dark:text-slate-350 dark:bg-slate-950 appearance-none cursor-pointer transition-all"
                >
                  <option value="New">🟢 New Inbound</option>
                  <option value="Contacted">🔵 Contacted / Pitch Made</option>
                  <option value="Follow Up">🟡 Follow-Up Active</option>
                  <option value="Converted">🟣 Converted Account</option>
                  <option value="Lost">🔴 Lost Deal</option>
                </select>
              </div>
            </div>

            {/* Field G: Optional Follow-Up Date */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Actionable Follow-Up Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Field H: Notes / Description */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-2.5">
                Lead description Notes
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400 dark:text-slate-500">
                  <FileText className="w-4 h-4" />
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/30 focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all placeholder-slate-400"
                  placeholder="Insert client requirements, deal value limits, meeting schedules, or project scopes..."
                />
              </div>
            </div>

          </div>

          {/* Intelligent Alert Info Card */}
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg dark:bg-indigo-950/20 dark:border-indigo-900/40 text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed flex items-start gap-2.5">
            <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </span>
            <div>
              <strong>Nodemailer Alert System Armed:</strong> When registered, the system will trigger an automated SMTP notification delivery process to the main administrator email (configured as <strong>amruthabethu9@gmail.com</strong>) with complete profile summaries.
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-150 dark:border-slate-800">
            <button
              type="button"
              disabled={loading}
              onClick={() => onNavigate("leads")}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50 font-medium text-xs rounded-md cursor-pointer transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-md shadow-sm cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Ingesting Lead...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register CRM Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
