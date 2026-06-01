import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ILead, IHistoryLog } from "../types";
import {
  ArrowLeft,
  Calendar,
  Building,
  Mail,
  Phone,
  Clock,
  Edit2,
  Save,
  MessageSquare,
  PlusCircle,
  Briefcase,
  History,
  Trash2,
  CheckCircle2,
  CalendarDays
} from "lucide-react";

interface LeadDetailPageProps {
  leadId: string;
  onNavigate: (page: string, extra?: any) => void;
}

export default function LeadDetailPage({ leadId, onNavigate }: LeadDetailPageProps) {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const [lead, setLead] = useState<ILead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Editable Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("Website");
  const [status, setStatus] = useState("New");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Timeline incremental note input
  const [newTimelineNote, setNewTimelineNote] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [saveSubmitting, setSaveSubmitting] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const l = data.lead as ILead;
        setLead(l);
        
        // Feed states
        setName(l.name);
        setEmail(l.email);
        setPhone(l.phone);
        setCompany(l.company);
        setSource(l.source);
        setStatus(l.status);
        setNotes(l.notes);
        setFollowUpDate(l.followUpDate || "");
      } else {
        toast("Lead profile not found or already deleted.", "error");
        onNavigate("leads");
      }
    } catch (err) {
      console.error(err);
      toast("link error contacting server database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  // Saves updated client metadata
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSubmitting(true);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          source,
          status,
          notes,
          followUpDate,
        }),
      });

      if (res.ok) {
        toast("Profile metadata updated successfully.", "success");
        setIsEditing(false);
        fetchLeadDetails(); // reload timeline update
      } else {
        const errorData = await res.json();
        toast(errorData.error || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Database update failed.", "error");
    } finally {
      setSaveSubmitting(false);
    }
  };

  // Appends a timeline log incremental note
  const handleAppendTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineNote.trim()) return;

    setNoteSubmitting(true);
    try {
      // Direct post updating notes block
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          notes: newTimelineNote.trim(),
          status, // preserve current status
        }),
      });

      if (res.ok) {
        toast("Timeline message appended successfully.", "success");
        setNewTimelineNote("");
        fetchLeadDetails(); // reload
      } else {
        toast("Could not append text to timeline log", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Timeline link state failed.", "error");
    } finally {
      setNoteSubmitting(false);
    }
  };

  // Quick Action: Delete
  const handleDeleteCurrent = async () => {
    if (!confirm("Are you completely sure you want to delete this lead? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast("Lead profile archived and purged cleanly.", "success");
        onNavigate("leads");
      } else {
        toast("Failed to process lead deletion archives", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Server link failure during archive cycle", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Retrieving full client index details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white font-sans tracking-tight">Profile index corrupt</h3>
        <button 
          onClick={() => onNavigate("leads")} 
          className="mt-4 px-4 py-2 border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-indigo-650 dark:text-indigo-450 text-xs font-semibold rounded-md cursor-pointer transition-all active:scale-95"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  // Status badging styles mapping
  const statusBadges = {
    New: "bg-indigo-100 text-indigo-800 border-transparent dark:bg-indigo-950/40 dark:text-indigo-400",
    Contacted: "bg-amber-100 text-amber-800 border-transparent dark:bg-amber-950/40 dark:text-amber-450",
    "Follow Up": "bg-blue-100 text-blue-800 border-transparent dark:bg-blue-950/40 dark:text-blue-450",
    Converted: "bg-emerald-100 text-emerald-800 border-transparent dark:bg-emerald-950/40 dark:text-emerald-450",
    Lost: "bg-rose-100 text-rose-800 border-transparent dark:bg-rose-950/40 dark:text-rose-450"
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Profile Upper Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-6">
        <div className="flex items-start gap-3.5">
          <button
            onClick={() => onNavigate("leads")}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md cursor-pointer transition-colors active:scale-95 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{lead.name}</h1>
              <span className={`px-2.5 py-0.5 border text-xs font-bold rounded-md ${statusBadges[lead.status]}`}>
                {lead.status}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Registered Org: <strong>{lead.company}</strong> · Profile UUID Index: <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{lead.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-2 hover:bg-slate-100 border dark:border-slate-800 hover:dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? "View Timeline" : "Modify Details"}</span>
          </button>
          
          <button
            onClick={handleDeleteCurrent}
            className="px-3.5 py-2 hover:bg-rose-50 border border-transparent hover:border-rose-200 hover:text-rose-600 text-slate-400 rounded-md flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Record</span>
          </button>
        </div>
      </div>

      {/* 2. DUAL BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: EDIT OR PROFILE FORM (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
              {isEditing ? "Edit Information Attributes" : "Lead Profile Registry"}
            </h3>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Client Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Company Registered
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Lead Sourcing Channel
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-705 dark:text-slate-300 cursor-pointer appearance-none"
                  >
                    <option value="Website">🌐 Website</option>
                    <option value="LinkedIn">💼 LinkedIn</option>
                    <option value="Referral">🤝 Referral</option>
                    <option value="Instagram">📸 Instagram</option>
                    <option value="Other">❓ Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Pipeline Stage Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-705 dark:text-slate-300 cursor-pointer appearance-none"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Actionable Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-105 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border dark:border-slate-800 hover:bg-slate-50 text-slate-705 dark:text-slate-300 font-medium text-xs rounded-md cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saveSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-md flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saveSubmitting ? "Saving..." : "Save changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {/* Visual Cards Mapping Properties */}
                <div className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-100 dark:bg-slate-950/60 dark:border-slate-850 rounded-xl">
                  <Mail className="w-4.5 h-4.5 text-indigo-500 mt-1" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Email Link</span>
                    <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white mt-1 break-all">
                      <a href={`mailto:${lead.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {lead.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-100 dark:bg-slate-950/60 dark:border-slate-850 rounded-xl">
                  <Phone className="w-4.5 h-4.5 text-emerald-500 mt-1" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Validated Phone Number</span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {lead.phone || <span className="text-slate-300 dark:text-slate-600 font-normal">None Specified</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-100 dark:bg-slate-950/60 dark:border-slate-850 rounded-xl">
                  <Building className="w-4.5 h-4.5 text-sky-500 mt-1" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company / Organization</span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                      {lead.company || "Independent"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-100 dark:bg-slate-950/60 dark:border-slate-850 rounded-xl">
                  <PlusCircle className="w-4.5 h-4.5 text-purple-500 mt-1" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sourcing Location</span>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                      {lead.source}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/50 border border-amber-100/60 dark:bg-amber-950/10 dark:border-amber-900/30 rounded-xl flex items-start gap-3">
                  <CalendarDays className="w-4.5 h-4.5 text-amber-500 mt-1" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Action Follow-Up Due Date</span>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1">
                      {lead.followUpDate ? (
                        new Date(lead.followUpDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })
                      ) : (
                        <span className="text-slate-400 font-normal">No follow-up date assigned yet. Configure one in Edit mode.</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Base Metadata description block */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Roster System Notes</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border dark:border-slate-850 mt-2 leading-relaxed">
                    "{lead.notes || "No notes registered in lead files."}"
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Created On
                  </span>
                  <span>{new Date(lead.createdAt).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE FOLLOW-UP TIMELINE PORTAL (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-500" />
                  <span>Interaction &amp; Follow-up History Timeline</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Historical flow logs tracking client pitches, meeting highlights, status revisions, and administrative directives.
                </p>
              </div>
            </div>

            {/* Incremental Timeline note adder Form */}
            <form onSubmit={handleAppendTimelineNote} className="mb-6">
              <div className="flex flex-col gap-2.5">
                <textarea
                  required
                  rows={2}
                  value={newTimelineNote}
                  onChange={(e) => setNewTimelineNote(e.target.value)}
                  placeholder="Record summary notes regarding recent calls, pitches, client negotiations, or scheduling..."
                  className="w-full px-3.5 py-3 bg-slate-50 hover:bg-slate-100/30 font-sans focus:bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-900 dark:text-white transition-all placeholder-slate-400"
                />
                
                <button
                  type="submit"
                  disabled={noteSubmitting || !newTimelineNote.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-xs rounded-md flex items-center justify-center gap-1.5 self-end disabled:opacity-45 cursor-pointer active:scale-95 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{noteSubmitting ? "Appending note..." : "Add Note to Timeline"}</span>
                </button>
              </div>
            </form>

            {/* Vertical Line Timeline component */}
            <div className="relative border-l border-slate-150 dark:border-slate-800 ml-4.5 pl-6 space-y-6 flex-1 max-h-[450px] overflow-y-auto pr-2 mt-4">
              {lead.history && lead.history.length > 0 ? (
                [...lead.history].reverse().map((log) => {
                  const itemBadgeMap = {
                    New: "bg-emerald-500 text-white ring-8 ring-emerald-50 dark:ring-emerald-950/20",
                    Contacted: "bg-sky-500 text-white ring-8 ring-sky-50 dark:ring-sky-950/20",
                    "Follow Up": "bg-amber-500 text-white ring-8 ring-amber-50 dark:ring-amber-950/20",
                    Converted: "bg-indigo-500 text-white ring-8 ring-indigo-50 dark:ring-indigo-950/20",
                    Lost: "bg-rose-500 text-white ring-8 ring-rose-50 dark:ring-rose-950/20"
                  };

                  const activeColorClass = itemBadgeMap[log.status as keyof typeof itemBadgeMap] || "bg-slate-400 ring-8 ring-slate-100";

                  return (
                    <div key={log.id} className="relative group">
                      
                      {/* Interactive Visual Node Pill */}
                      <span className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full ${activeColorClass} transition-transform group-hover:scale-125 duration-100`} />

                      {/* Header log Info */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        <span className="bg-slate-100/85 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          Stage: {log.status}
                        </span>
                      </div>

                      {/* Actual Content bubble */}
                      <div className="p-3.5 bg-slate-50/70 border border-slate-100 dark:bg-slate-950/30 dark:border-slate-850 rounded-xl">
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                          {log.note || "Metadata revisions applied."}
                        </p>
                        
                        {log.followUpDate && (
                          <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-2">
                            <CalendarDays className="w-3.5 h-3.5" /> Scheduled follow-up: {log.followUpDate}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No historical entries present. Add timeline highlights using the form.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
