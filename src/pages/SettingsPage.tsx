import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Settings,
  Database,
  Mail,
  Shield,
  HelpCircle,
  KeyRound,
  FileCheck2,
  Lock,
  Compass,
  AlertTriangle,
  RefreshCw,
  Clock,
  ExternalLink
} from "lucide-react";

export default function SettingsPage() {
  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const [dbState, setDbState] = useState({
    apiStatus: "Checking...",
    connType: "Reading...",
    leadsCount: 0,
    isMongo: false,
    adminEmail: "admin@crm.com"
  });
  
  const [loading, setLoading] = useState(true);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        // Check dynamic status headers or query helpers
        const isMongoResponse = data.leads && data.leads.length > 0 && typeof data.leads[0].id === "string" && data.leads[0].id.length > 20; // mongo uses 24 char hex IDs
        
        // Let's call a specific health API if we want, or deduce from current dataset
        setDbState({
          apiStatus: "Active & Secure",
          connType: isMongoResponse ? "MongoDB (Mongoose Engine)" : "Sandboxed Secure Local File Database",
          leadsCount: data.count || 0,
          isMongo: isMongoResponse,
          adminEmail: user?.email || "admin@crm.com"
        });
      } else {
        setDbState((prev) => ({ ...prev, apiStatus: "API Unresolved" }));
      }
    } catch (err) {
      console.error(err);
      setDbState((prev) => ({ ...prev, apiStatus: "Offline", connType: "Error matching server socket" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, [getAuthHeaders, user]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* 1. Header welcome */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-8 h-8 text-indigo-500 animate-[spin_4s_linear_infinite]" />
          <span>System Settings</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Monitor configuration diagnostics, SMTP mail states, and database engine connections.
        </p>
      </div>

      {/* 2. THREE-PANEL RECONFIGURABLE BENTO DIAGNOSTIC GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel A: Database Diagnostics Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <span>Database Dialect Status</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Checks current persistent storage protocols and structural counts.
          </p>

          <div className="space-y-4.5 my-6">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 border dark:border-slate-850 rounded-lg">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Active Connection Dialect</span>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md ${
                  dbState.isMongo 
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border-transparent"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-transparent"
                }`}>
                  {dbState.isMongo ? "MongoDB Active" : "Local File active"}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-850 dark:text-slate-100 mt-2 font-mono">
                {dbState.connType}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 border dark:border-slate-850 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lead records</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{dbState.leadsCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 border dark:border-slate-850 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase">API State</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">{dbState.apiStatus}</p>
              </div>
            </div>
          </div>

          {/* Trigger check refresh */}
          <button
            onClick={fetchDiagnostics}
            disabled={loading}
            className="w-full text-xs font-bold py-2 hover:bg-slate-100 border dark:border-slate-800 hover:dark:bg-slate-800 rounded-md text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "querying state..." : "Refresh Diagnostics Index"}</span>
          </button>
        </div>

        {/* Panel B: Security & Session Profile Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Access Validation Rules</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Review administrator credentials and structural authorization parameters.
          </p>

          <div className="space-y-4 my-6">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Administrator Session ID</span>
                <p className="text-xs font-bold text-slate-850 dark:text-white mt-1 break-all">{dbState.adminEmail}</p>
              </div>
              <Lock className="w-4.5 h-4.5 text-slate-300 dark:text-slate-650 shrink-0" />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Token protocol</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-indigo-400 mt-1 font-mono">JWT Bearer Sign (HS256)</p>
              </div>
              <KeyRound className="w-4.5 h-4.5 text-slate-300 dark:text-slate-650" />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 leading-relaxed font-sans mt-2 flex items-start gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-850">
            <Lock className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>Routings are strictly protected in `server.ts` utilizing JSON Web Tokens. Access key secrets are stored as server env variables hidden from browser dev-tools.</span>
          </div>
        </div>

        {/* Panel C: Nodemailer SMTP Alerts Status (Span 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl md:col-span-2 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
          
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-500" />
            <span>Nodemailer Email Notification Status</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Informs SMTP coordinates mapping administrative email broadcasts on new contact ingestion flows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            
            <div className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 p-3.5 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Target dispatch</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white break-all">amruthabethu9@gmail.com</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 p-3.5 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">SMTP Outgoing Port</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">2525 / SSL Fallback</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 p-3.5 rounded-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1 font-sans">Alert System State</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-sky-700 dark:text-sky-450 uppercase">Active Log Monitor</span>
              </div>
            </div>

          </div>

          <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 rounded-xl leading-relaxed">
            <h4 className="font-bold flex items-center gap-1.5 mb-1 text-xs">
              <Compass className="w-4 h-4 text-indigo-500" />
              SMTP Environmental Configuration Note:
            </h4>
            SMTP alerts utilize environment triggers. In local dev, mail deliveries are simulated internally returning complete logs in the cloud console. If you hook your dedicated <strong>SMTP_USER</strong> and <strong>SMTP_PASS</strong> keys, actual system emails are instantly pushed in standard formats.
          </div>
        </div>

      </div>

    </div>
  );
}
