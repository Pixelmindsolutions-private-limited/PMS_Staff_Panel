import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile by default
      if (mobile) setIsCollapsed(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // When employee logs into staff panel, do NOT open browser window/tab!
    // Sync credentials to desktop widget so it appears directly on desktop screen
    try {
      const staffRaw = sessionStorage.getItem('staffDetails') || localStorage.getItem('staffDetails');
      if (staffRaw) {
        const staffObj = JSON.parse(staffRaw);
        fetch('http://127.0.0.1:48999/login-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffObj)
        }).catch(() => {
          // If desktop widget is not running yet, wake it via protocol
          try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'pms-widget://open';
            document.body.appendChild(iframe);
            setTimeout(() => iframe.remove(), 1500);
          } catch (_) {}
        });
      }
    } catch (_) {}
  }, []);

  const openWidgetPopup = () => {
    // Directs user to desktop wallpaper widget (NOT in browser)
    try {
      const staffRaw = sessionStorage.getItem('staffDetails') || localStorage.getItem('staffDetails');
      const staffObj = staffRaw ? JSON.parse(staffRaw) : {};
      fetch('http://127.0.0.1:48999/login-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffObj)
      }).catch(() => {
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = 'pms-widget://open';
          document.body.appendChild(iframe);
          setTimeout(() => iframe.remove(), 1500);
        } catch (_) {}
      });
    } catch (_) {}
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-teal-50/30 relative">

      {/* ── Sidebar ── */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobile={isMobile}
        setIsCollapsed={setIsCollapsed}
      />

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Navbar ── */}
        <Navbar
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          setIsCollapsed={setIsCollapsed}
        />

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-teal-50/40 p-4 sm:p-5 lg:p-6">
          <div className="w-full max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>

      </div>

      {/* Floating Attendance Widget Launcher */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center">
        <button
          type="button"
          onClick={openWidgetPopup}
          className="group bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl font-bold text-xs flex items-center gap-2 transition-all border border-teal-300/40 hover:-translate-y-0.5"
          title="Open floating attendance card on screen"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Attendance Widget</span>
          <span className="bg-white/20 group-hover:bg-white/30 text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors">↗ Pop Out</span>
        </button>
      </div>
    </div>
  );
}