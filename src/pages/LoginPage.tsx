import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { KeyRound, Mail, Lock, LogIn, Sparkles, Database } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("admin@crm.com");
  const [password, setPassword] = useState("AdminPassword2026!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please supply both administrator email and passphrase.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        toast(`Welcome back, ${data.user.name}! Access authorized.`, "success");
      } else {
        setError(data.error || "Authentication failed. Double check your credentials.");
        toast(data.error || "Authentication failed.", "error");
      }
    } catch (err: any) {
      console.error(err);
      setError("The API server could not be reached. Ensure back-end is running.");
      toast("Server connection failure", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] opacity-50" />
      
      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-lg bg-indigo-600 text-white shadow-sm mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">
            LeadEngine CRM
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Client Lead &amp; Pipeline Management Terminal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
          
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Administrator Sign-In
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950/60 dark:hover:bg-slate-950/100 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all"
                  placeholder="admin@crm.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Access Passphrase
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-950/60 dark:hover:bg-slate-950/100 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 text-sm text-slate-900 dark:text-white transition-all"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-indigo-500/50 shadow-sm select-none active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Seeded Credentials Helper Box */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50/50 border border-indigo-100 dark:bg-indigo-950/10 dark:border-indigo-900/35 rounded-lg">
              <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              </span>
              <div>
                <h5 className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                  Quick Trial Administrator Key:
                </h5>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-1 flex flex-col gap-0.5 font-sans leading-relaxed">
                  <span><strong>Login ID:</strong> admin@crm.com</span>
                  <span><strong>Password:</strong> AdminPassword2026!</span>
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Hybrid DB Active
              </span>
              <span>Secure Session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
