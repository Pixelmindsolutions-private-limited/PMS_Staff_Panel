import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

// ─── Reusable nav item list ───────────────────────────────────────────────────
const NavItems = ({ items, openDropdown, toggleDropdown, setOpenDropdown, expanded, onNav }) => {
  return items.map((item, idx) => {
    const isLogout = !!item.action;
    const isOpen = openDropdown === item.name;

    const baseRow = `w-full flex items-center gap-3 rounded-xl border border-transparent
      text-[13px] font-medium transition-all duration-150 cursor-pointer
      ${expanded ? "px-3 py-2.5" : "py-2.5 justify-center px-0"}`;

    const normalRow = `${baseRow} text-teal-800 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600 group`;
    const logoutRow = `${baseRow} text-teal-800 hover:bg-red-50 hover:border-red-100 hover:text-red-500 group`;

    return (
      <div key={idx} className="w-full">
        {/* Divider before Logout */}
        {isLogout && <div className="my-2 mx-1 h-px bg-teal-100" />}

        {item.dropdown ? (
          <>
            {/* Dropdown trigger */}
            <button onClick={() => toggleDropdown(item.name)} className={normalRow}>
              <i className={`${item.icon} text-[16px] text-teal-400 group-hover:text-teal-500 flex-shrink-0 transition-colors w-5 text-center`} />
              {expanded && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  <FaChevronDown
                    className={`text-[9px] text-teal-300 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </>
              )}
            </button>

            {/* Dropdown items */}
            {isOpen && expanded && (
              <div className="ml-[30px] pl-3 border-l-2 border-teal-100 mt-0.5 mb-1.5 flex flex-col gap-0.5">
                {item.dropdown.map((sub, si) => (
                  <Link
                    key={si}
                    to={sub.path}
                    onClick={() => { setOpenDropdown(null); onNav?.(); }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] text-teal-600 hover:bg-teal-50 hover:text-teal-500 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-300 flex-shrink-0" />
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </>

        ) : isLogout ? (
          <button onClick={item.action} className={logoutRow}>
            <i className={`${item.icon} text-[16px] text-teal-400 group-hover:text-red-400 flex-shrink-0 transition-colors w-5 text-center`} />
            {expanded && <span className="flex-1 text-left">{item.name}</span>}
          </button>

        ) : (
          <Link
            to={item.path}
            onClick={() => onNav?.()}
            className={normalRow}
          >
            <i className={`${item.icon} text-[16px] text-teal-400 group-hover:text-teal-500 flex-shrink-0 transition-colors w-5 text-center`} />
            {expanded && <span>{item.name}</span>}
          </Link>
        )}
      </div>
    );
  });
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isCollapsed, isMobile, setIsCollapsed }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  const handleLogout = async () => {
    window.location.href = "/";
  };

  const staffElements = [
    { icon: "ri-dashboard-fill", name: "Dashboard", path: "/dashboard" },
    
    {
      icon: "ri-time-fill", name: "Attendance", dropdown: [
        // { name: "Punch In/Out", path: "/punch" },
        { name: "Attendance History", path: "/attendance" },
        { name: "Monthly Report", path: "/report" },
      ]
    },
    // {
    //   icon: "ri-task-fill", name: "Tasks", dropdown: [
    //     { name: "My Tasks", path: "/mytasks" },
    //     { name: "Task History", path: "/taskhistory" },
    //     { name: "Performance", path: "/myperformance" },
    //   ]
    // },
    // {
    //   icon: "ri-calendar-event-fill", name: "Leave", dropdown: [
    //     { name: "Apply Leave", path: "/applyleave" },
    //     { name: "Leave Balance", path: "/leavebalance" },
    //     { name: "Leave History", path: "/leavehistory" },
    //   ]
    // },
    // {
    //   icon: "ri-money-dollar-circle-fill", name: "Salary", dropdown: [
    //     { name: "Salary Slips", path: "/salaryslip" },
    //   ]
    // },
    // {
    //   icon: "ri-bar-chart-fill", name: "Performance", dropdown: [
    //     { name: "Performance Report", path: "/performancereport" },
    //     { name: "KPI Metrics", path: "/kpi" },
    //     { name: "Goals", path: "/goals" },
    //   ]
    // },
    // {
    //   icon: "ri-team-fill", name: "Team", dropdown: [
    //     { name: "Team Members", path: "/teammembers" },
    //     { name: "Team Projects", path: "/teamprojects" },
    //   ]
    // },
    // {
    //   icon: "ri-message-circle-fill", name: "Team Chat", path: "/teamchat" 
    // },
    // {
    //   icon: "ri-file-text-fill", name: "Documents", dropdown: [
    //     { name: "My Documents", path: "/mydocuments" },
    //     { name: "Upload Documents", path: "/upload-documents" },
    //   ]
    // },
    { icon: "ri-user-fill", name: "My Profile", path: "/myprofile" },
    // {
    //   icon: "ri-settings-3-fill", name: "Settings", dropdown: [
    //     { name: "Profile Settings", path: "/profile-settings" },
    //     { name: "Change Password", path: "/change-password" },
    //     { name: "Notifications", path: "/staff-notifications" },
    //   ]
    // },
    { icon: "ri-logout-box-fill", name: "Logout", action: handleLogout },
  ];

  // ── Shared header + nav + footer markup ──
  const Header = ({ showClose }) => (
    <div className="flex items-center justify-between bg-teal-400 px-4 py-4 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/25 border border-white/40 flex items-center justify-center flex-shrink-0">
          <i className="ri-user-fill text-white text-lg" />
        </div>
        <div className="min-w-0 overflow-hidden">
          <p className="text-white font-bold text-sm leading-none truncate">Staff Portal</p>
          <p className="text-white/70 text-[10px] mt-0.5 truncate">Employee Management</p>
        </div>
      </div>
      {showClose && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition ml-2 flex-shrink-0"
        >
          <i className="ri-close-line text-base" />
        </button>
      )}
    </div>
  );

  const Footer = () => (
    <div className="border-t border-teal-100 bg-teal-50/60 px-4 py-3 text-center flex-shrink-0">
      <p className="text-[11px] text-teal-300">© 2024 Company Name</p>
      <span className="inline-block mt-1.5 bg-white text-teal-400 border border-teal-200 rounded-full text-[10px] font-semibold px-3 py-0.5">
        Staff Portal v1.0
      </span>
    </div>
  );

  // ── MOBILE: full-screen overlay drawer ──────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {!isCollapsed && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsCollapsed(true)}
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-white shadow-2xl
            border-r border-teal-100 transition-transform duration-300 ease-in-out
            ${isCollapsed ? "-translate-x-full" : "translate-x-0"}`}
        >
          <Header showClose />
          <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-teal-300">
              Main Menu
            </p>
            <NavItems
              items={staffElements}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
              setOpenDropdown={setOpenDropdown}
              expanded={true}
              onNav={() => setIsCollapsed(true)}
            />
          </nav>
          <Footer />
        </aside>
      </>
    );
  }

  // ── DESKTOP: inline collapsible sidebar ─────────────────────────────────────
  return (
    <aside
      className={`relative h-screen flex flex-col bg-white border-r border-teal-100 shadow-sm
        flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-[60px]" : "w-64"}`}
    >
      {/* Collapsed header shows only icon */}
      {isCollapsed ? (
        <div className="flex items-center justify-center bg-teal-400 px-0 py-4 flex-shrink-0 h-[68px]">
          <div className="w-9 h-9 rounded-xl bg-white/25 border border-white/40 flex items-center justify-center flex-shrink-0">
            <i className="ri-user-fill text-white text-lg" />
          </div>
        </div>
      ) : (
        <Header showClose={false} />
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 flex flex-col gap-0.5">
        {!isCollapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-teal-300">
            Main Menu
          </p>
        )}
        <NavItems
          items={staffElements}
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          setOpenDropdown={setOpenDropdown}
          expanded={!isCollapsed}
        />
      </nav>

      {!isCollapsed && <Footer />}
    </aside>
  );
};

export default Sidebar;