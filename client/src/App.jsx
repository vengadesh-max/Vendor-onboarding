import { useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SubmissionForm from './components/SubmissionForm.jsx';
import LiveRunView from './components/LiveRunView.jsx';
import Dashboard from './components/Dashboard.jsx';
import RunDetail from './components/RunDetail.jsx';

function ZampLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Official Zamp icon mark */}
      <svg
        width="40"
        height="28"
        viewBox="0 0 36 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-slate-900 shrink-0"
      >
        <path d="M0 9L6 0H36L30 9H0Z" fill="currentColor" />
        <path d="M0 23L6 14H36L30 23H0Z" fill="currentColor" />
      </svg>
      <span className="font-black text-3xl sm:text-[34px] tracking-tighter text-slate-900 font-sans lowercase leading-none">
        zamp
      </span>
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
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="hover:opacity-95 transition-opacity">
            <ZampLogo />
          </Link>

          <nav className="flex items-center gap-1.5">
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
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 print:p-0 print:max-w-none">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Zamp Financial</p>
          <p className="font-mono-data text-slate-600 font-medium"></p>
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
