import React, { SetStateAction, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ILead } from "../types";
import {
  TrendingUp,
  UserPlus,
  Users,
  CheckCircle,
  HelpCircle,
  XCircle,
  Clock,
  Compass,
  ArrowUpRight,
  Activity,
  CalendarDays,
  Target
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (page: string, extra?: any) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/leads", {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
        } else {
          toast("Failed to download CRM statistics", "error");
        }
      } catch (err) {
        console.error(err);
        toast("Server link failure during state check", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [getAuthHeaders, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading metrics engine...</p>
        </div>
      </div>
    );
  }

  // --- STATS COMPUTATION ---
  const total = leads.length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const contacted = leads.filter((l) => l.status === "Contacted").length;
  const followUp = leads.filter((l) => l.status === "Follow Up").length;
  const converted = leads.filter((l) => l.status === "Converted").length;
  const lost = leads.filter((l) => l.status === "Lost").length;

  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
  const pipelineValue = total * 1500; // Mock average deal value: $1500 / lead
  const convertedValue = converted * 1500;

  // --- SOURCING BREAKDOWN ---
  const sources = ["Website", "LinkedIn", "Referral", "Instagram", "Other"];
  const sourceStats = sources.map((src) => {
    const count = leads.filter((l) => l.source === src).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { name: src, count, percentage };
  });

  // --- ACQUISITION TIMELINE (Last 7 Days) ---
  // Create an array for the last 7 calendar days
  const timelineDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const timelineData = timelineDays.map((day) => {
    const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = leads.filter((l) => {
      const created = new Date(l.createdAt);
      return (
        created.getFullYear() === day.getFullYear() &&
        created.getMonth() === day.getMonth() &&
        created.getDate() === day.getDate()
      );
    }).length;
    return { label, count, rawDate: day };
  });

  // Safe SVG graphing calculations
  const maxAcquisitions = Math.max(...timelineData.map((d) => d.count), 1);
  const chartHeight = 120;
  const chartWidth = 500;
  const points = timelineData.map((d, index) => {
    const x = (index / 6) * chartWidth;
    const y = chartHeight - (d.count / maxAcquisitions) * (chartHeight - 20) - 10;
    return { x, y, label: d.label, count: d.count };
  });

  const pathD = points.length > 0 ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ") : "";
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length-1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z` : "";

  // Recent leads log
  const recentLeads = [...leads].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Upper Dashboard Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Terminal Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time contact pipeline index, conversion ratios, and recent engagements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("add-lead")}
            className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Lead</span>
          </button>
        </div>
      </div>

      {/* 1. KEY METRICS PERFORMANCE SIX-COLUMN GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Leads</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">Managed pool</p>
        </div>

        {/* New Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">New</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{newLeads}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Awaiting action</p>
        </div>

        {/* Contacted */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Contacted</p>
          <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{contacted}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Active outreach</p>
        </div>

        {/* Follow Up */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Follow-Up</p>
          <p className="text-2xl font-bold text-blue-500 dark:text-blue-450">{followUp}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Scheduled actions</p>
        </div>

        {/* Converted */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Converted</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{converted}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{conversionRate}% Rate</p>
        </div>

        {/* Lost Leads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Lost</p>
          <p className="text-2xl font-bold text-rose-500 dark:text-rose-400">{lost}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Unreached/Closed</p>
        </div>
      </div>

      {/* 2. DOUBLE-GRID CHARTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Interactive SVGAcquisitions Chart (Span 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl lg:col-span-2 relative shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <span>Lead Intake Velocities</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Incoming count trends registered in the system over the last 7 days.
              </p>
            </div>
            <div className="text-xs bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 text-slate-500 dark:text-slate-400 rounded-lg font-semibold flex items-center gap-1">
              <span>Weighted Index</span>
            </div>
          </div>

          {/* SVG Line / Area Custom Chart */}
          <div className="relative mt-4">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-800/40" strokeDasharray="3 3" />
              <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="#cbd5e1" strokeWidth="1" className="dark:stroke-slate-800" />

              {/* Shaded Area Under Line */}
              {areaD && <path d={areaD} fill="url(#chartAreaGrad)" />}

              {/* Bold Gradient Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Vector Nodes */}
              {points.map((p, index) => {
                const isHovered = hoveredDay === index;
                return (
                  <g 
                    key={index} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill="#ffffff"
                      stroke="#4f46e5"
                      strokeWidth={isHovered ? 3.5 : 2}
                      className="transition-all duration-150 shadow-sm"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Custom Interactive Tooltip Overlay */}
            {hoveredDay !== null && points[hoveredDay] && (
              <div 
                className="absolute bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-xl pointer-events-none text-xs flex flex-col gap-1 transition-all z-20"
                style={{
                  left: `${(hoveredDay / 6) * 85}%`,
                  bottom: `${chartHeight - points[hoveredDay].y + 20}px`
                }}
              >
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{points[hoveredDay].label}</span>
                <span className="font-bold text-sm text-indigo-300">{points[hoveredDay].count} Inbound Leads</span>
              </div>
            )}
          </div>

          {/* SVG Chart X-Axis Labels */}
          <div className="flex justify-between mt-3 px-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
            {timelineData.map((d, index) => (
              <span key={index} className={hoveredDay === index ? "text-indigo-500 font-bold transition-colors" : ""}>
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Lead Sourcing Bento Ratios */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-500" />
              <span>Acquisition Channels</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Performance breakdown across marketing channels.
            </p>
          </div>

          <div className="space-y-4 my-6">
            {sourceStats.map((src, index) => {
              const isHovered = hoveredSource === src.name;
              
              // Custom Tailwind dynamic color mapping based on index
              const colorClasses = [
                "bg-sky-500",      // Website
                "bg-indigo-500",   // LinkedIn
                "bg-purple-500",   // Referral
                "bg-pink-500",     // Instagram
                "bg-slate-500"     // Other
              ];

              return (
                <div 
                  key={index}
                  className={`p-2.5 rounded-xl border border-transparent transition-all duration-150 ${
                    isHovered ? "bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800" : ""
                  }`}
                  onMouseEnter={() => setHoveredSource(src.name)}
                  onMouseLeave={() => setHoveredSource(null)}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorClasses[index]}`} />
                      <span>{src.name}</span>
                    </span>
                    <span>
                      {src.count} ({src.percentage}%)
                    </span>
                  </div>
                  
                  {/* Progress Indicator Slider */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${colorClasses[index]}`}
                      style={{ width: `${src.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>Market Expansion Map</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">Closed Deal Index</span>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY LOGS & HOT LEADS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Ingestions Logs (Span 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                <span>Recent Lead Ingestions</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-200 leading-relaxed max-w-[500px]">
                Review details of the five latest pipeline registrants.
              </p>
            </div>
            <button
              onClick={() => onNavigate("leads")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>Manage View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-150 dark:divide-slate-850">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-sm font-medium text-slate-400">
                No pipeline leads processed yet. Create some to view logs!
              </div>
            ) : (
              recentLeads.map((l) => {
                const colorMap = {
                  New: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border-transparent",
                  Contacted: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-transparent",
                  "Follow Up": "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-transparent",
                  Converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-transparent",
                  Lost: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-transparent"
                };

                return (
                  <div 
                    key={l.id} 
                    onClick={() => onNavigate("lead-detail", { leadId: l.id })}
                    className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/20 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{l.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">{l.company} · {l.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-md border ${colorMap[l.status]}`}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Target Conversion Progress Ring Card */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 rounded-xl flex flex-col justify-between shadow-sm border border-slate-800">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Conversion Hub</div>
            <h4 className="text-xl font-bold mt-2">Pipeline Velocity</h4>
            <p className="text-xs text-indigo-200/70 mt-1">Weighted metric for closed sales quota fulfillment.</p>
          </div>

          <div className="flex items-center justify-center my-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Radial Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#1e1b4b"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * conversionRate) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold tracking-tight">{conversionRate}%</span>
                <p className="text-[9px] text-indigo-300 font-bold uppercase mt-0.5">Success Index</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-950/80 flex items-center justify-between text-xs text-indigo-200/60">
            <span>Portfolio Worth</span>
            <span className="font-bold text-white text-sm">${convertedValue.toLocaleString()} / ${pipelineValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
