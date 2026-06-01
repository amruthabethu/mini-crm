import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ILead } from "../types";
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Calendar,
  Link,
  Plus,
  Eye,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Database,
  Briefcase
} from "lucide-react";

interface LeadsPageProps {
  onNavigate: (page: string, extra?: any) => void;
}

export default function LeadsPage({ onNavigate }: LeadsPageProps) {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  
  // Leads Store States
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state values
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt_desc");

  // Deletion modals state values
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Pagination bounds
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8;

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const qParams = new URLSearchParams({
        search,
        status: statusFilter,
        source: sourceFilter,
        sortBy
      });

      const res = await fetch(`/api/leads?${qParams}`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      } else {
        toast("Failed to download contact leads list", "error");
      }
    } catch (err) {
      console.error(err);
      toast("link error checking active leads index", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // Reset page index on filter change
    setCurrentPage(1);
  }, [search, statusFilter, sourceFilter, sortBy]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        toast("Lead record deleted permanently.", "success");
        setConfirmDeleteId(null);
        fetchLeads(); // refresh
      } else {
        const errorData = await res.json();
        toast(errorData.error || "Failed to purge database lead entry", "error");
      }
    } catch (error) {
      console.error(error);
      toast("Database state blocked lead purge", "error");
    }
  };

  // Status visual configurations
  const statusConfig = {
    New: { bg: "bg-indigo-100 dark:bg-indigo-950/40", text: "text-indigo-800 dark:text-indigo-400", border: "border-transparent" },
    Contacted: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-800 dark:text-amber-400", border: "border-transparent" },
    "Follow Up": { bg: "bg-blue-100 dark:bg-blue-950/40", text: "text-blue-800 dark:text-blue-400", border: "border-transparent" },
    Converted: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-800 dark:text-emerald-450", border: "border-transparent" },
    Lost: { bg: "bg-rose-100 dark:bg-rose-950/40", text: "text-rose-800 dark:text-rose-400", border: "border-transparent" }
  };

  // Sourcing visually configured channels
  const sourceConfig = {
    Website: { bg: "bg-blue-100/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200" },
    LinkedIn: { bg: "bg-sky-100/60 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200" },
    Referral: { bg: "bg-purple-100/50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200" },
    Instagram: { bg: "bg-pink-100/50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200" },
    Other: { bg: "bg-slate-100/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200" }
  };

  // Slice paginated records
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  const paginate = (num: number) => {
    if (num > 0 && num <= totalPages) {
      setCurrentPage(num);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Lead Registry</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Search, sort, filter channels, and track historical pipeline logs.
          </p>
        </div>
        <button
          onClick={() => onNavigate("add-lead")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors cursor-pointer active:scale-[0.98] self-start md:self-auto"
        >
          <Plus className="w-4 h-4 inline-block mr-1.5" />
          <span>Ingest New Lead</span>
        </button>
      </div>

      {/* 2. ADVANCED FILTERS CARD BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* A. Dynamic Search Indexer */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/30 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm placeholder-slate-400 text-slate-900 dark:text-white transition-all hover:border-slate-300 dark:hover:border-slate-700"
            />
          </div>

          {/* B. Filter Status Badge */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/30 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-700 dark:text-slate-300 transition-all appearance-none cursor-pointer"
            >
              <option value="">Filter by: Status (all)</option>
              <option value="New">🟢 Status: New</option>
              <option value="Contacted">🔵 Status: Contacted</option>
              <option value="Follow Up">🟡 Status: Follow Up</option>
              <option value="Converted">🟣 Status: Converted</option>
              <option value="Lost">🔴 Status: Lost</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
              <Filter className="w-4 h-4" />
            </span>
          </div>

          {/* C. Filter Sourcing Channels */}
          <div className="relative">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/30 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-700 dark:text-slate-300 transition-all appearance-none cursor-pointer"
            >
              <option value="">Filter by: Source (all)</option>
              <option value="Website">🌐 Channel: Website</option>
              <option value="LinkedIn">💼 Channel: LinkedIn</option>
              <option value="Referral">🤝 Channel: Referral</option>
              <option value="Instagram">📸 Channel: Instagram</option>
              <option value="Other">❓ Channel: Other</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
              <Link className="w-4 h-4" />
            </span>
          </div>

          {/* D. sorting dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/30 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-700 dark:text-slate-300 transition-all appearance-none cursor-pointer"
            >
              <option value="createdAt_desc">Sort options: Newest Created</option>
              <option value="createdAt_asc">Sort options: Oldest Created</option>
              <option value="followUp_asc">Sort options: Follow-Up Urgent</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
              <ArrowUpDown className="w-4 h-4" />
            </span>
          </div>

        </div>
      </div>

      {/* 3. LEADS RECORD LIST TABLE */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Filtering catalog...</p>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-8 text-center">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg mb-4">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Lead Records Met Parameters</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
            Try custom keywords or change active filter selections to fetch coordinates.
          </p>
          <button 
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setSourceFilter("");
              setSortBy("createdAt_desc");
            }}
            className="mt-4 px-3.5 py-2 hover:bg-slate-100 border dark:border-slate-800 hover:dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-md transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          
          {/* Responsive scroll track */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 dark:bg-slate-950 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                  <th className="py-4.5 px-6">Company &amp; Client Full Name</th>
                  <th className="py-4.5 px-5">Direct Email</th>
                  <th className="py-4.5 px-5">Phone Number</th>
                  <th className="py-4.5 px-4.5">Channel</th>
                  <th className="py-4.5 px-4.5">Pipeline Status</th>
                  <th className="py-4.5 px-5">Action Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850 text-sm text-slate-700 dark:text-slate-300">
                {currentLeads.map((l) => {
                  const stat = statusConfig[l.status] || statusConfig.New;
                  const channel = sourceConfig[l.source as keyof typeof sourceConfig] || sourceConfig.Other;

                  return (
                    <tr 
                      key={l.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group"
                    >
                      {/* Name / Org */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {l.name}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 font-sans">
                            <Briefcase className="w-3.5 h-3.5" />
                            {l.company}
                          </span>
                        </div>
                      </td>

                      {/* Email Link */}
                      <td className="py-4.5 px-5 font-mono text-xs">
                        <a 
                          href={`mailto:${l.email}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline text-indigo-600 dark:text-indigo-400"
                        >
                          {l.email}
                        </a>
                      </td>

                      {/* Phone Number */}
                      <td className="py-4.5 px-5 font-sans text-xs">
                        {l.phone || <span className="text-slate-300 dark:text-slate-700">None Added</span>}
                      </td>

                      {/* Source Channel Badges */}
                      <td className="py-4.5 px-4.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${channel.bg}`}>
                          {l.source}
                        </span>
                      </td>

                      {/* Client Pipeline Badges */}
                      <td className="py-4.5 px-4.5">
                        <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md border ${stat.bg} ${stat.text} ${stat.border}`}>
                          {l.status}
                        </span>
                      </td>

                      {/* CRUD Actions Row */}
                      <td className="py-4.5 px-5">
                        <div className="flex items-center gap-2">
                          
                          {/* Navigate to Profile */}
                          <button
                            onClick={() => onNavigate("lead-detail", { leadId: l.id })}
                            className="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View details</span>
                          </button>

                          {/* Quick Delete Trash Trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(l.id);
                            }}
                            className="p-1.5 rounded-lg border border-transparent hover:border-rose-250 dark:hover:border-rose-900 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 cursor-pointer transition-all active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION CONTROL PORTAL */}
          {totalPages > 1 && (
            <div className="bg-slate-50/60 dark:bg-slate-950/30 px-6 py-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Displaying <span className="font-bold text-slate-700 dark:text-white">{indexOfFirstLead + 1}</span> to{" "}
                <span className="font-bold text-slate-700 dark:text-white">
                  {Math.min(indexOfLastLead, leads.length)}
                </span>{" "}
                of <span className="font-mono text-slate-800 dark:text-indigo-400">{leads.length}</span> leads in roster
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                  className="p-2 border dark:border-slate-850 rounded-md bg-white dark:bg-slate-900 disabled:opacity-40 text-slate-500 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  const isActive = currentPage === i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                  className="p-2 border dark:border-slate-850 rounded-md bg-white dark:bg-slate-900 disabled:opacity-40 text-slate-500 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. CONFIRMATION DELETION DIALOG OVERLAY */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl max-w-md w-full p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
            
            <div className="flex items-start gap-4">
              <span className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-lg">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Lead Entry</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Are you completely sure you want to delete this lead? This will erase all historic timelines, note archives, and pipeline details. This action is irreversible.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 hover:bg-slate-150 border dark:border-slate-800 hover:dark:bg-slate-800 text-slate-750 dark:text-slate-300 font-semibold text-xs rounded-md cursor-pointer transition-all"
              >
                Cancel Purge
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-md cursor-pointer active:scale-95 transition-all"
              >
                Delete Lead Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
