import React, { useState, useEffect, useCallback } from 'react';
import AttendanceWidget, { getStoredStaffDetails, getApiBaseUrl } from '../Components/AttendanceWidget';
import { FiLock, FiUser, FiLogIn, FiAlertCircle } from 'react-icons/fi';

const PunchWidgetPopup = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [authRevision, setAuthRevision] = useState(0);
  const [empIdInput, setEmpIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const checkAuth = useCallback(async () => {
    let d = getStoredStaffDetails();
    if (!d?.token && window.electronAPI?.getPersistedAuth) {
      try {
        const persisted = await window.electronAPI.getPersistedAuth();
        if (persisted?.token && persisted?.user) {
          const raw = JSON.stringify(persisted);
          localStorage.setItem('staffDetails', raw);
          sessionStorage.setItem('staffDetails', raw);
          sessionStorage.setItem('token', persisted.token);
          if (persisted.user.employeeId) {
            sessionStorage.setItem('employeeId', persisted.user.employeeId);
          }
          d = persisted;
        }
      } catch (_) {}
    }

    if (d?.token && d?.user) {
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'PMS Attendance Widget';
    // Transparent background so only the card floats over the desktop wallpaper
    document.documentElement.style.background = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'transparent';
    document.body.style.overflow = 'hidden';

    checkAuth();

    if (window.electronAPI?.onAuthSync) {
      window.electronAPI.onAuthSync((payload) => {
        if (payload?.token && payload?.user) {
          const raw = JSON.stringify(payload);
          localStorage.setItem('staffDetails', raw);
          sessionStorage.setItem('staffDetails', raw);
          sessionStorage.setItem('token', payload.token);
          if (payload.user.employeeId) {
            sessionStorage.setItem('employeeId', payload.user.employeeId);
          }
          setAuthRevision((revision) => revision + 1);
          setIsAuth(true);
        }
      });
    }

    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
      document.body.style.overflow = '';
    };
  }, [checkAuth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!empIdInput.trim() || !passwordInput) {
      setLoginError('Please enter both Employee ID and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: empIdInput.trim(),
          password: passwordInput
        })
      });

      const data = await res.json();
      if (data.success && data.data?.token) {
        const payload = JSON.stringify({
          token: data.data.token,
          user: data.data.staff,
          type: 'staff'
        });
        localStorage.setItem('staffDetails', payload);
        sessionStorage.setItem('staffDetails', payload);
        sessionStorage.setItem('token', data.data.token);
        sessionStorage.setItem('employeeId', data.data.staff.employeeId);
        setIsAuth(true);
      } else {
        setLoginError(data.message || 'Login failed. Invalid Employee ID or password.');
      }
    } catch (err) {
      console.error('Login error in popup:', err);
      setLoginError('Could not connect to server. Please check your connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-2 bg-transparent select-none overflow-hidden">
      <div className="w-full max-w-[660px]">
        {isAuth ? (
          <AttendanceWidget key={authRevision} isStandalonePopup={true} />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full text-center" style={{ backgroundColor: '#ffffff' }}>
            <img src="/pms_logo.png" alt="Pixel Mind Solutions" className="w-16 h-16 object-contain mx-auto mb-3" />
            <h2 className="font-syne font-bold text-lg text-teal-900 mb-1">Pixel Mind Solutions</h2>
            <p className="text-xs text-slate-500 mb-4">Please login to track your workday on desktop.</p>

            {loginError && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 text-left font-medium">
                <FiAlertCircle className="shrink-0 text-sm" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee ID</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:border-teal-500 focus-within:bg-white transition-all">
                  <FiUser className="text-slate-400 text-sm" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP001"
                    className="w-full bg-transparent text-xs text-slate-800 font-semibold outline-none"
                    value={empIdInput}
                    onChange={(e) => setEmpIdInput(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Password</label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:border-teal-500 focus-within:bg-white transition-all">
                  <FiLock className="text-slate-400 text-sm" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-transparent text-xs text-slate-800 font-semibold outline-none"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full mt-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loginLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiLogIn /> Log In & Start Work
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        html, body { background: transparent !important; }
        body { font-family: 'DM Sans', sans-serif; }
        .font-syne { font-family: 'Syne', sans-serif; }
        @keyframes slide-in {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default PunchWidgetPopup;
