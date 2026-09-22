import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Layers,
  FileText,
  ExternalLink,
  Code2,
  Zap,
  ShieldCheck,
  Cpu,
  Copy,
  Check
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const duration = Math.round(performance.now() - startTime);
      setLatency(duration);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Unable to connect to backend server');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const copyPayload = () => {
    if (healthData) {
      navigator.clipboard.writeText(JSON.stringify(healthData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isConnected = healthData && healthData.status === 'ok';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Procure<span className="text-indigo-400">Pro</span>
              </span>
              <span className="ml-2 text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Core Stack
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Health Indicator Pill */}
            <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              loading
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  loading ? 'bg-amber-400' : isConnected ? 'bg-emerald-400' : 'bg-rose-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  loading ? 'bg-amber-500' : isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></span>
              </span>
              <span>
                {loading ? 'Pinging...' : isConnected ? `Backend Online (${latency}ms)` : 'Backend Offline'}
              </span>
            </div>

            <a
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition"
            >
              <span>Swagger Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href="https://github.com/Shreyasu1016/SIH.git"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition flex items-center space-x-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub Repository</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full-Stack Foundation Initialized</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ProcurePro Full-Stack Engine
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Intelligent Procurement & Standards Compliance platform scaffolded with FastAPI,
            React 19, Vite, and SQLite/PostgreSQL.
          </p>
        </div>

        {/* Health Check Card Section */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Ambient Corner Flare */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-white">Full-Stack Health Check</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Validating client-to-API communication at <code className="text-indigo-300 bg-slate-800/80 px-1.5 py-0.5 rounded">{API_BASE_URL}/health</code>
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Pinging API...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Endpoint Status */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-400">Endpoint Status</span>
                <div className="flex items-center space-x-2 mt-2">
                  {loading ? (
                    <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                  ) : isConnected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className={`text-base font-bold uppercase tracking-wide ${
                    loading ? 'text-amber-400' : isConnected ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {loading ? 'Checking...' : isConnected ? healthData.status : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Latency */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-400">Response Latency</span>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-2xl font-black text-white">
                    {latency !== null ? latency : '--'}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">ms</span>
                </div>
              </div>

              {/* Database Connection */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
                <span className="text-xs font-medium text-slate-400">Database Dialect</span>
                <div className="flex items-center space-x-2 mt-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-base font-bold text-white capitalize">
                    {healthData?.database?.dialect || (isConnected ? 'Active' : '--')}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Backend Unreachable</div>
                  <div className="text-xs text-rose-200/80">{error}</div>
                  <div className="text-xs text-slate-400 pt-1">
                    Tip: Start the backend server by running <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">uvicorn main:app --reload</code> inside <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">backend/</code>.
                  </div>
                </div>
              </div>
            )}

            {/* Response Payload Viewer */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">JSON Response Payload</span>
                </div>

                <div className="flex items-center space-x-3">
                  {lastChecked && (
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Last ping: {lastChecked}
                    </span>
                  )}
                  {healthData && (
                    <button
                      onClick={copyPayload}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Copy response payload"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <pre className="font-mono text-xs text-indigo-300 overflow-x-auto p-2 bg-slate-950/70 rounded-lg max-h-56 leading-relaxed">
                {loading && !healthData
                  ? '// Waiting for API response...'
                  : healthData
                  ? JSON.stringify(healthData, null, 2)
                  : `// Error connecting to ${API_BASE_URL}/health`}
              </pre>
            </div>
          </div>
        </div>

        {/* Architecture Components Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Backend Card */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">FastAPI Backend</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modular structure with <code className="text-slate-300 font-mono">main.py</code>, SQLAlchemy models, database session pooling, and CORS configuration.
            </p>
            <div className="pt-2 text-xs font-medium text-indigo-400 flex items-center space-x-1">
              <span>Path: backend/</span>
            </div>
          </div>

          {/* Database Card */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Database Layer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatic SQLite fallback for zero-config local development, with seamless PostgreSQL production readiness via <code className="text-slate-300 font-mono">DATABASE_URL</code>.
            </p>
            <div className="pt-2 text-xs font-medium text-violet-400 flex items-center space-x-1">
              <span>Path: backend/app/db.py</span>
            </div>
          </div>

          {/* Standards Data Card */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Standards Dataset</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated repository for technical and procurement standards (ISO, BIS, IEEE) in JSON/CSV formats for compliance auditing.
            </p>
            <div className="pt-2 text-xs font-medium text-emerald-400 flex items-center space-x-1">
              <span>Path: data/sample_standards.json</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ProcurePro © 2026. Smart Procurement & Standards Platform.
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Verified</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">FastAPI + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
