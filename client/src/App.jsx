import { useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SubmissionForm from './components/SubmissionForm.jsx';
import LiveRunView from './components/LiveRunView.jsx';
import Dashboard from './components/Dashboard.jsx';
import RunDetail from './components/RunDetail.jsx';

function ZampLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Official Zamp icon mark */}
      <svg width="26" height="22" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-900">
        <path d="M0 6H18L23 0H5L0 6Z" fill="currentColor" />
        <path d="M0 20H18L23 14H5L0 20Z" fill="currentColor" />
      </svg>
      <div className="flex items-baseline gap-2">
        <span className="font-black text-2xl tracking-tighter text-slate-900 font-sans lowercase">
          zamp
        </span>
        {/* <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          Vendor AI OS
        </span> */}
      </div>
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Professional Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="hover:opacity-95 transition-opacity">
              <ZampLogo />
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-6 border-l border-slate-200">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                New Submission
              </Link>
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${isActive('/dashboard')
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                Audit Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini 2.5 Flash • Operational</span>
            </div>
            <a
              href="http://localhost:4000/swagger"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1"
            >
              <span>Swagger API</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Zamp Financial Automation — Deterministic Compliance & LLM Audit System</p>
          <p className="font-mono-data text-slate-600 font-medium">PS-2 Production Ready Build</p>
        </div>
      </footer>
    </div>
  );
}

function SubmitPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmitted = (data) => {
    navigate('/run', { state: { run: data } });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>AI-Powered Vendor Qualification</span>
        </div> */}
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Vendor Onboarding
        </h1>
        <p className="text-slate-600 text-sm mt-1">Let automation handle the repetitive work. Your vendor information is validated and checked for duplicates, while AI assists with fuzzy name matching and vendor communication.
        </p>
      </div>

      <SubmissionForm onSubmitted={onSubmitted} loading={loading} setLoading={setLoading} />
    </div>
  );
}

function LiveRunPage() {
  const location = useLocation();
  const run = location.state?.run;
  return <LiveRunView run={run} />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <SubmitPage />
          </Layout>
        }
      />
      <Route
        path="/run"
        element={
          <Layout>
            <LiveRunPage />
          </Layout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/dashboard/:id"
        element={
          <Layout>
            <RunDetail />
          </Layout>
        }
      />
    </Routes>
  );
}
