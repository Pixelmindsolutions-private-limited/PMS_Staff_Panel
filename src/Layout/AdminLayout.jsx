import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

const syncDesktopWidget = async (staffObj) => {
  const user = staffObj?.user;

  if (!staffObj?.token || !user || !(user.employeeId || user._id)) {
    console.error("Widget sync skipped: invalid staff login data", {
      hasToken: Boolean(staffObj?.token),
      hasUser: Boolean(user),
      employeeId: user?.employeeId || null,
      type: staffObj?.type || null,
    });
    return;
  }

  if (staffObj.type && staffObj.type !== "staff") {
    console.error("Widget sync skipped: current user is not staff");
    return;
  }

  try {
    console.log("Creating widget sync for:", {
      employeeId: user.employeeId,
      employeeName: user.employeeName,
    });

    const response = await fetch(
      "https://pmsbackend.pixelmindsolutions.com/login-sync",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffObj),
      },
    );

    const result = await response.json();

    console.log("Widget sync API result:", {
      status: response.status,
      success: result.success,
      syncIdReceived: Boolean(result.syncId),
      employeeId: result.user?.employeeId,
      employeeName: result.user?.employeeName,
    });

    if (!response.ok || !result.success || !result.syncId) {
      console.error("Widget sync API failed:", result.message);
      return;
    }

    if (!/^[a-f0-9]{48}$/.test(result.syncId)) {
      console.error("Widget sync returned an invalid sync ID");
      return;
    }

    // This requests Electron to handle the sync.
    // It does not guarantee that Electron has completed it.
    window.location.href = `pms-widget://sync/${result.syncId}`;
  } catch (error) {
    console.error("Widget sync failed:", error.message);
  }
};

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

  const openWidgetPopup = () => {
    try {
      const staffRaw =
        sessionStorage.getItem("staffDetails") ||
        localStorage.getItem("staffDetails");
      if (staffRaw) syncDesktopWidget(JSON.parse(staffRaw));
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
          <div className="w-full max-w-screen-2xl mx-auto">{children}</div>
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
          <span className="bg-white/20 group-hover:bg-white/30 text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors">
            ↗ Pop Out
          </span>
        </button>
      </div>
    </div>
  );
}
