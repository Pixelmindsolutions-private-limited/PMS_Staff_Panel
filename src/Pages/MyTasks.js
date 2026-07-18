// import React, { useState, useEffect } from 'react';
// import {
//   FiCheckCircle,
//   FiClock,
//   FiAlertCircle,
//   FiPlus,
//   FiSearch,
//   FiEdit,
//   FiTrash2,
//   FiCalendar,
//   FiFlag,
//   FiUser,
//   FiBarChart2,
//   FiDownload,
//   FiRefreshCw,
//   FiTrendingUp,
//   FiAward,
//   FiTarget,
//   FiPieChart,
//   FiZap,
//   FiActivity
// } from 'react-icons/fi';

// const style = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

//   :root {
//     --teal-50:  #f0fdfa;
//     --teal-100: #ccfbf1;
//     --teal-200: #99f6e4;
//     --teal-300: #5eead4;
//     --teal-400: #2dd4bf;
//     --teal-500: #14b8a6;
//     --teal-600: #0d9488;
//     --teal-700: #0f766e;
//     --teal-800: #115e59;
//     --teal-900: #134e4a;
//     --slate-50:  #f8fafc;
//     --slate-100: #f1f5f9;
//     --slate-200: #e2e8f0;
//     --slate-300: #cbd5e1;
//     --slate-400: #94a3b8;
//     --slate-500: #64748b;
//     --slate-600: #475569;
//     --slate-700: #334155;
//     --slate-800: #1e293b;
//     --surface: #ffffff;
//     --surface-2: #f8fffe;
//     --radius-sm: 8px;
//     --radius-md: 14px;
//     --radius-lg: 20px;
//     --radius-xl: 28px;
//     --shadow-sm: 0 1px 3px rgba(13,148,136,0.08), 0 1px 2px rgba(13,148,136,0.04);
//     --shadow-md: 0 4px 16px rgba(13,148,136,0.1), 0 2px 6px rgba(13,148,136,0.06);
//     --shadow-lg: 0 10px 40px rgba(13,148,136,0.14), 0 4px 12px rgba(13,148,136,0.08);
//     --shadow-glow: 0 0 0 3px rgba(20,184,166,0.15);
//   }

//   * { box-sizing: border-box; }

//   .mytasks-root {
//     font-family: 'DM Sans', sans-serif;
//     min-height: 100vh;
//     background: linear-gradient(135deg, #f0fdfa 0%, #e6faf7 40%, #f0fdf9 70%, #ecfdf5 100%);
//     padding: 0;
//     position: relative;
//     overflow-x: hidden;
//   }

//   .mytasks-root::before {
//     content: '';
//     position: fixed;
//     top: -200px;
//     right: -200px;
//     width: 600px;
//     height: 600px;
//     background: radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%);
//     pointer-events: none;
//     z-index: 0;
//   }

//   .mytasks-root::after {
//     content: '';
//     position: fixed;
//     bottom: -150px;
//     left: -150px;
//     width: 500px;
//     height: 500px;
//     background: radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%);
//     pointer-events: none;
//     z-index: 0;
//   }

//   .page-inner {
//     position: relative;
//     z-index: 1;
//     max-width: 1280px;
//     margin: 0 auto;
//     padding: 24px 16px 48px;
//   }

//   @media (min-width: 640px) { .page-inner { padding: 32px 24px 56px; } }
//   @media (min-width: 1024px) { .page-inner { padding: 40px 40px 64px; } }

//   /* Header */
//   .page-header {
//     display: flex;
//     flex-direction: column;
//     gap: 16px;
//     margin-bottom: 32px;
//   }
//   @media (min-width: 640px) {
//     .page-header { flex-direction: row; align-items: center; justify-content: space-between; }
//   }

//   .header-title {
//     font-family: 'Syne', sans-serif;
//     font-size: clamp(22px, 4vw, 32px);
//     font-weight: 800;
//     color: var(--teal-800);
//     letter-spacing: -0.5px;
//     line-height: 1.1;
//     margin: 0 0 4px 0;
//   }

//   .header-subtitle {
//     font-size: 14px;
//     color: var(--slate-500);
//     margin: 0;
//     font-weight: 400;
//   }

//   .btn-primary {
//     display: inline-flex;
//     align-items: center;
//     gap: 8px;
//     background: linear-gradient(135deg, var(--teal-500) 0%, var(--teal-600) 100%);
//     color: #fff;
//     border: none;
//     border-radius: var(--radius-md);
//     padding: 11px 22px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 14px;
//     font-weight: 600;
//     cursor: pointer;
//     transition: all 0.2s ease;
//     box-shadow: 0 4px 14px rgba(13,148,136,0.3);
//     white-space: nowrap;
//     align-self: flex-start;
//   }
//   .btn-primary:hover {
//     transform: translateY(-1px);
//     box-shadow: 0 6px 20px rgba(13,148,136,0.4);
//     background: linear-gradient(135deg, var(--teal-400) 0%, var(--teal-500) 100%);
//   }
//   .btn-primary:active { transform: translateY(0); }

//   /* Cards */
//   .card {
//     background: var(--surface);
//     border-radius: var(--radius-lg);
//     box-shadow: var(--shadow-md);
//     border: 1px solid rgba(20,184,166,0.1);
//     overflow: hidden;
//   }

//   .card-padded { padding: 24px; }
//   @media (min-width: 640px) { .card-padded { padding: 28px 32px; } }

//   /* Stats Grid */
//   .stats-grid {
//     display: grid;
//     grid-template-columns: repeat(2, 1fr);
//     gap: 12px;
//     margin-bottom: 24px;
//   }
//   @media (min-width: 480px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
//   @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(5, 1fr); } }
//   @media (min-width: 1024px) { .stats-grid { gap: 16px; } }

//   .stat-card {
//     background: var(--surface);
//     border-radius: var(--radius-md);
//     padding: 16px;
//     text-align: center;
//     border: 1px solid rgba(20,184,166,0.1);
//     box-shadow: var(--shadow-sm);
//     transition: all 0.2s ease;
//     position: relative;
//     overflow: hidden;
//   }
//   .stat-card::before {
//     content: '';
//     position: absolute;
//     top: 0; left: 0; right: 0;
//     height: 3px;
//     background: var(--bar-color, var(--teal-400));
//   }
//   .stat-card:hover {
//     transform: translateY(-2px);
//     box-shadow: var(--shadow-lg);
//   }

//   .stat-value {
//     font-family: 'Syne', sans-serif;
//     font-size: clamp(22px, 3.5vw, 28px);
//     font-weight: 800;
//     line-height: 1;
//     margin-bottom: 4px;
//   }
//   .stat-label { font-size: 12px; color: var(--slate-500); font-weight: 500; }

//   /* Section Title */
//   .section-title {
//     font-family: 'Syne', sans-serif;
//     font-size: 16px;
//     font-weight: 700;
//     color: var(--teal-800);
//     display: flex;
//     align-items: center;
//     gap: 8px;
//     margin: 0 0 20px 0;
//   }

//   .section-icon {
//     width: 30px; height: 30px;
//     background: linear-gradient(135deg, var(--teal-100), var(--teal-200));
//     border-radius: 8px;
//     display: flex; align-items: center; justify-content: center;
//     color: var(--teal-600);
//     font-size: 14px;
//     flex-shrink: 0;
//   }

//   /* Quick Add Form */
//   .quick-add-grid {
//     display: grid;
//     grid-template-columns: 1fr;
//     gap: 12px;
//   }
//   @media (min-width: 640px) { .quick-add-grid { grid-template-columns: 1fr 1fr; } }
//   @media (min-width: 1024px) { .quick-add-grid { grid-template-columns: 2fr 2fr 1fr 1.5fr; } }

//   .form-input {
//     width: 100%;
//     padding: 11px 16px;
//     border: 1.5px solid var(--teal-100);
//     border-radius: var(--radius-sm);
//     font-family: 'DM Sans', sans-serif;
//     font-size: 14px;
//     color: var(--slate-700);
//     background: var(--surface-2);
//     outline: none;
//     transition: all 0.2s ease;
//   }
//   .form-input:focus {
//     border-color: var(--teal-400);
//     box-shadow: var(--shadow-glow);
//     background: #fff;
//   }
//   .form-input::placeholder { color: var(--slate-400); }

//   .add-row { display: flex; gap: 10px; }
//   .btn-add {
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     background: linear-gradient(135deg, var(--teal-500), var(--teal-600));
//     color: #fff;
//     border: none;
//     border-radius: var(--radius-sm);
//     padding: 11px 18px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 14px;
//     font-weight: 600;
//     cursor: pointer;
//     transition: all 0.2s ease;
//     white-space: nowrap;
//     box-shadow: 0 4px 12px rgba(13,148,136,0.25);
//   }
//   .btn-add:hover { background: linear-gradient(135deg, var(--teal-400), var(--teal-500)); transform: translateY(-1px); }

//   /* Filter Bar */
//   .filter-bar {
//     display: flex;
//     flex-direction: column;
//     gap: 12px;
//   }
//   @media (min-width: 768px) {
//     .filter-bar { flex-direction: row; align-items: center; justify-content: space-between; }
//   }

//   .search-wrap {
//     position: relative;
//     flex: 1;
//     min-width: 0;
//   }
//   .search-icon {
//     position: absolute;
//     left: 14px;
//     top: 50%;
//     transform: translateY(-50%);
//     color: var(--teal-400);
//     font-size: 15px;
//     pointer-events: none;
//   }
//   .search-input {
//     width: 100%;
//     padding: 11px 16px 11px 42px;
//     border: 1.5px solid var(--teal-100);
//     border-radius: var(--radius-sm);
//     font-family: 'DM Sans', sans-serif;
//     font-size: 14px;
//     color: var(--slate-700);
//     background: var(--surface-2);
//     outline: none;
//     transition: all 0.2s ease;
//   }
//   .search-input:focus {
//     border-color: var(--teal-400);
//     box-shadow: var(--shadow-glow);
//     background: #fff;
//   }

//   .filter-controls {
//     display: flex;
//     flex-wrap: wrap;
//     gap: 10px;
//   }

//   .select-filter {
//     padding: 10px 14px;
//     border: 1.5px solid var(--teal-100);
//     border-radius: var(--radius-sm);
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13px;
//     font-weight: 500;
//     color: var(--slate-600);
//     background: var(--surface-2);
//     outline: none;
//     cursor: pointer;
//     transition: all 0.2s ease;
//     appearance: none;
//     -webkit-appearance: none;
//     background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230d9488' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
//     background-repeat: no-repeat;
//     background-position: right 10px center;
//     padding-right: 30px;
//   }
//   .select-filter:focus { border-color: var(--teal-400); box-shadow: var(--shadow-glow); }

//   .btn-export {
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     background: var(--teal-50);
//     color: var(--teal-700);
//     border: 1.5px solid var(--teal-200);
//     border-radius: var(--radius-sm);
//     padding: 10px 16px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13px;
//     font-weight: 600;
//     cursor: pointer;
//     transition: all 0.2s ease;
//   }
//   .btn-export:hover { background: var(--teal-100); border-color: var(--teal-300); }

//   /* Table */
//   .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

//   table {
//     width: 100%;
//     border-collapse: separate;
//     border-spacing: 0;
//     font-size: 14px;
//   }

//   thead tr {
//     background: linear-gradient(to right, var(--teal-50), var(--teal-100));
//   }

//   thead th {
//     padding: 14px 18px;
//     text-align: left;
//     font-size: 11px;
//     font-weight: 700;
//     text-transform: uppercase;
//     letter-spacing: 0.06em;
//     color: var(--teal-700);
//     white-space: nowrap;
//     border-bottom: 2px solid var(--teal-200);
//   }

//   tbody tr {
//     transition: background 0.15s ease;
//     border-bottom: 1px solid var(--slate-100);
//   }
//   tbody tr:last-child { border-bottom: none; }
//   tbody tr:hover { background: var(--teal-50); }

//   td { padding: 16px 18px; vertical-align: middle; }

//   .task-title {
//     font-weight: 600;
//     color: var(--slate-800);
//     margin-bottom: 3px;
//     font-size: 14px;
//   }
//   .task-desc {
//     font-size: 12px;
//     color: var(--slate-500);
//     line-height: 1.4;
//     display: -webkit-box;
//     -webkit-line-clamp: 2;
//     -webkit-box-orient: vertical;
//     overflow: hidden;
//     max-width: 260px;
//   }
//   .task-category {
//     display: inline-block;
//     margin-top: 6px;
//     background: var(--teal-50);
//     color: var(--teal-700);
//     border: 1px solid var(--teal-200);
//     border-radius: 6px;
//     padding: 2px 8px;
//     font-size: 11px;
//     font-weight: 600;
//     letter-spacing: 0.03em;
//   }

//   .status-select {
//     border: none;
//     border-radius: 20px;
//     padding: 5px 12px;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 12px;
//     font-weight: 600;
//     cursor: pointer;
//     outline: none;
//     appearance: none;
//     -webkit-appearance: none;
//     transition: all 0.2s;
//   }

//   .badge {
//     display: inline-flex;
//     align-items: center;
//     gap: 5px;
//     border-radius: 20px;
//     padding: 5px 12px;
//     font-size: 12px;
//     font-weight: 600;
//   }

//   .date-cell {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     font-size: 13px;
//     white-space: nowrap;
//   }

//   .time-cell .est { font-size: 12px; color: var(--slate-500); }
//   .time-cell .actual { font-size: 13px; font-weight: 600; }

//   .action-btns { display: flex; gap: 6px; }
//   .btn-icon {
//     width: 32px; height: 32px;
//     border: none;
//     border-radius: 8px;
//     cursor: pointer;
//     display: flex; align-items: center; justify-content: center;
//     font-size: 14px;
//     transition: all 0.15s ease;
//     background: transparent;
//   }
//   .btn-icon-edit { color: var(--teal-600); }
//   .btn-icon-edit:hover { background: var(--teal-50); color: var(--teal-700); }
//   .btn-icon-del { color: #ef4444; }
//   .btn-icon-del:hover { background: #fef2f2; }

//   .empty-state {
//     text-align: center;
//     padding: 56px 24px;
//     color: var(--slate-400);
//   }
//   .empty-state svg { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
//   .empty-state p { margin: 0 0 6px; font-size: 15px; font-weight: 500; color: var(--slate-500); }
//   .empty-state span { font-size: 13px; }

//   /* History Component */
//   .history-stats-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 12px;
//     margin-bottom: 24px;
//   }
//   @media (min-width: 768px) {
//     .history-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
//   }

//   .hist-stat {
//     border-radius: var(--radius-md);
//     padding: 18px;
//     border: 1px solid transparent;
//     position: relative;
//     overflow: hidden;
//     transition: transform 0.2s ease, box-shadow 0.2s ease;
//   }
//   .hist-stat:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
//   .hist-stat-label { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
//   .hist-stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 2px; }
//   .hist-stat-sub { font-size: 11px; margin-top: 2px; }

//   .hist-stat-icon {
//     position: absolute;
//     top: 14px; right: 14px;
//     opacity: 0.5;
//     font-size: 18px;
//   }

//   .progress-bar-track {
//     width: 100%;
//     height: 6px;
//     border-radius: 3px;
//     margin-top: 10px;
//     overflow: hidden;
//   }
//   .progress-bar-fill {
//     height: 100%;
//     border-radius: 3px;
//     transition: width 0.6s ease;
//   }

//   .completion-item {
//     padding: 14px 16px;
//     border-radius: var(--radius-md);
//     background: var(--teal-50);
//     border: 1px solid var(--teal-100);
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//     transition: background 0.15s ease;
//   }
//   .completion-item:hover { background: var(--teal-100); }
//   @media (min-width: 640px) {
//     .completion-item { flex-direction: row; align-items: center; justify-content: space-between; }
//   }

//   .completion-meta {
//     display: flex;
//     flex-wrap: wrap;
//     gap: 12px;
//     align-items: center;
//     font-size: 12px;
//     color: var(--slate-500);
//   }
//   .completion-meta span { display: flex; align-items: center; gap: 4px; }

//   .efficiency-badge {
//     padding: 4px 12px;
//     border-radius: 20px;
//     font-size: 11px;
//     font-weight: 700;
//     white-space: nowrap;
//     flex-shrink: 0;
//   }

//   .trends-grid {
//     display: grid;
//     grid-template-columns: 1fr;
//     gap: 16px;
//     margin-top: 24px;
//   }
//   @media (min-width: 768px) { .trends-grid { grid-template-columns: 1fr 1fr; } }

//   .trend-panel {
//     background: var(--teal-50);
//     border-radius: var(--radius-md);
//     padding: 18px;
//     border: 1px solid var(--teal-100);
//   }
//   .trend-panel-title { font-size: 13px; font-weight: 700; color: var(--teal-800); margin: 0 0 16px 0; }

//   .priority-row {
//     display: flex;
//     align-items: center;
//     justify-content: space-between;
//     margin-bottom: 10px;
//   }
//   .priority-row:last-child { margin-bottom: 0; }
//   .priority-label { font-size: 12px; font-weight: 500; color: var(--slate-600); text-transform: capitalize; }
//   .priority-bar-wrap { display: flex; align-items: center; gap: 8px; }
//   .priority-track { width: 80px; height: 6px; background: var(--slate-200); border-radius: 3px; overflow: hidden; }
//   @media (min-width: 480px) { .priority-track { width: 110px; } }
//   .priority-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
//   .priority-pct { font-size: 12px; font-weight: 700; color: var(--teal-700); width: 32px; text-align: right; }

//   .week-bars { display: flex; align-items: flex-end; justify-content: space-around; height: 80px; gap: 8px; }
//   .week-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
//   .week-bar-outer { width: 100%; background: var(--teal-200); border-radius: 4px 4px 0 0; display: flex; flex-direction: column; justify-content: flex-end; height: 60px; overflow: hidden; }
//   .week-bar-inner { background: linear-gradient(to top, var(--teal-600), var(--teal-400)); border-radius: 4px 4px 0 0; transition: height 0.5s ease; }
//   .week-label { font-size: 11px; font-weight: 500; color: var(--slate-500); }

//   /* Quick Actions */
//   .actions-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 12px;
//   }
//   @media (min-width: 480px) { .actions-grid { grid-template-columns: repeat(4, 1fr); } }

//   .action-btn {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: center;
//     gap: 8px;
//     padding: 18px 12px;
//     border-radius: var(--radius-md);
//     border: 1.5px solid transparent;
//     cursor: pointer;
//     font-family: 'DM Sans', sans-serif;
//     font-size: 13px;
//     font-weight: 600;
//     transition: all 0.2s ease;
//     background: var(--teal-50);
//     color: var(--teal-700);
//     border-color: var(--teal-100);
//   }
//   .action-btn:hover {
//     background: var(--teal-100);
//     border-color: var(--teal-300);
//     transform: translateY(-2px);
//     box-shadow: var(--shadow-md);
//   }
//   .action-btn svg { font-size: 18px; color: var(--teal-600); }

//   .loading-screen {
//     min-height: 100vh;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     background: linear-gradient(135deg, #f0fdfa, #e6faf7);
//     font-family: 'DM Sans', sans-serif;
//     flex-direction: column;
//     gap: 16px;
//   }
//   .spinner {
//     width: 44px; height: 44px;
//     border: 3px solid var(--teal-100);
//     border-top-color: var(--teal-500);
//     border-radius: 50%;
//     animation: spin 0.8s linear infinite;
//   }
//   @keyframes spin { to { transform: rotate(360deg); } }
//   .loading-text { font-size: 14px; color: var(--teal-700); font-weight: 500; }

//   .history-header {
//     display: flex;
//     flex-direction: column;
//     gap: 12px;
//     margin-bottom: 24px;
//   }
//   @media (min-width: 640px) {
//     .history-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
//   }

//   .divider { height: 1px; background: var(--teal-100); margin: 24px 0; }

//   .sub-section-title {
//     font-size: 14px;
//     font-weight: 700;
//     color: var(--teal-800);
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     margin: 0 0 16px 0;
//   }

//   .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal-500); display: inline-block; }

//   .assigner-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--slate-600); }
//   .assigner-avatar {
//     width: 26px; height: 26px;
//     border-radius: 50%;
//     background: linear-gradient(135deg, var(--teal-200), var(--teal-300));
//     display: flex; align-items: center; justify-content: center;
//     font-size: 11px;
//     font-weight: 700;
//     color: var(--teal-700);
//     flex-shrink: 0;
//   }

//   .overdue-date { color: #dc2626; font-weight: 600; }
//   .normal-date { color: var(--slate-600); }

//   /* Scrollbar */
//   .table-wrap::-webkit-scrollbar { height: 6px; }
//   .table-wrap::-webkit-scrollbar-track { background: var(--teal-50); border-radius: 3px; }
//   .table-wrap::-webkit-scrollbar-thumb { background: var(--teal-300); border-radius: 3px; }
// `;

// // Task History
// const TaskHistory = ({ tasks }) => {
//   const [timeRange, setTimeRange] = useState('month');

//   const completedTasks = tasks.filter(t => t.status === 'completed');
//   const totalTasks = tasks.length;
//   const completedCount = completedTasks.length;
//   const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

//   const avgCompletionTime = completedTasks.length > 0
//     ? Math.round(completedTasks.reduce((acc, t) => {
//         const days = (new Date(t.completedDate) - new Date(t.assignedDate)) / 86400000;
//         return acc + days;
//       }, 0) / completedTasks.length * 10) / 10
//     : 0;

//   const productivityScore = completedTasks.length > 0
//     ? Math.round(completedTasks.reduce((acc, t) => {
//         const eff = t.actualHours && t.estimatedHours ? (t.estimatedHours / t.actualHours) * 100 : 100;
//         return acc + Math.min(eff, 150);
//       }, 0) / completedTasks.length)
//     : 0;

//   const recentCompletions = [...completedTasks]
//     .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
//     .slice(0, 8);

//   const getEffInfo = (est, act) => {
//     if (!act || !est) return { text: 'N/A', cls: 'bg-slate-100 text-slate-600' };
//     const e = (est / act) * 100;
//     if (e >= 120) return { text: 'Excellent', cls: 'bg-emerald-100 text-emerald-700' };
//     if (e >= 80) return { text: 'On Track', cls: 'bg-teal-100 text-teal-700' };
//     return { text: 'Over Budget', cls: 'bg-amber-100 text-amber-700' };
//   };

//   const getEffColor = (est, act) => {
//     if (!act || !est) return 'var(--slate-500)';
//     return (est / act) * 100 >= 80 ? 'var(--teal-600)' : '#f59e0b';
//   };

//   return (
//     <div className="card card-padded" style={{ marginTop: 24 }}>
//       {/* Header */}
//       <div className="history-header">
//         <div>
//           <div className="section-title" style={{ marginBottom: 4 }}>
//             <div className="section-icon"><FiTrendingUp /></div>
//             Task Completion History
//           </div>
//           <p style={{ margin: 0, fontSize: 13, color: 'var(--slate-500)' }}>
//             Track productivity and completion patterns
//           </p>
//         </div>
//         <select
//           className="select-filter"
//           value={timeRange}
//           onChange={e => setTimeRange(e.target.value)}
//         >
//           <option value="week">Last 7 Days</option>
//           <option value="month">Last 30 Days</option>
//           <option value="quarter">Last 3 Months</option>
//           <option value="year">Last Year</option>
//           <option value="all">All Time</option>
//         </select>
//       </div>

//       {/* History Stats */}
//       <div className="history-stats-grid">
//         {[
//           {
//             label: 'Completion Rate', value: `${completionRate}%`, sub: `${completedCount} of ${totalTasks} tasks`,
//             bg: '#f0fdfa', border: 'var(--teal-200)', labelColor: 'var(--teal-600)', valueColor: 'var(--teal-800)', subColor: 'var(--teal-500)',
//             icon: <FiTarget />, bar: true, barPct: completionRate, barColor: 'var(--teal-500)', barTrack: 'var(--teal-200)'
//           },
//           {
//             label: 'Tasks Completed', value: completedCount, sub: `Total: ${totalTasks}`,
//             bg: '#f0fdff', border: '#a5f3fc', labelColor: '#0e7490', valueColor: '#164e63', subColor: '#0e7490',
//             icon: <FiCheckCircle />, bar: false
//           },
//           {
//             label: 'Avg. Completion', value: `${avgCompletionTime}d`, sub: 'days per task',
//             bg: '#fdf4ff', border: '#e9d5ff', labelColor: '#7c3aed', valueColor: '#4c1d95', subColor: '#7c3aed',
//             icon: <FiClock />, bar: false
//           },
//           {
//             label: 'Productivity Score', value: productivityScore, sub: 'efficiency rating',
//             bg: '#fff7ed', border: '#fed7aa', labelColor: '#c2410c', valueColor: '#7c2d12', subColor: '#c2410c',
//             icon: <FiAward />, bar: false
//           },
//         ].map((s, i) => (
//           <div key={i} className="hist-stat" style={{ background: s.bg, borderColor: s.border }}>
//             <div className="hist-stat-label" style={{ color: s.labelColor }}>{s.label}</div>
//             <div className="hist-stat-value" style={{ color: s.valueColor }}>{s.value}</div>
//             <div className="hist-stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
//             <div className="hist-stat-icon" style={{ color: s.labelColor }}>{s.icon}</div>
//             {s.bar && (
//               <div className="progress-bar-track" style={{ background: s.barTrack }}>
//                 <div className="progress-bar-fill" style={{ width: `${s.barPct}%`, background: s.barColor }} />
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="divider" />

//       {/* Recent Completions */}
//       <div className="sub-section-title">
//         <FiCheckCircle style={{ color: 'var(--teal-500)' }} />
//         Recently Completed
//       </div>

//       {recentCompletions.length === 0 ? (
//         <div className="empty-state">
//           <div><FiCheckCircle /></div>
//           <p>No completed tasks yet</p>
//           <span>Complete tasks to see history here</span>
//         </div>
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//           {recentCompletions.map(task => {
//             const eff = getEffInfo(task.estimatedHours, task.actualHours);
//             return (
//               <div key={task.id} className="completion-item">
//                 <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
//                   <FiCheckCircle style={{ color: 'var(--teal-500)', flexShrink: 0, marginTop: 2, fontSize: 15 }} />
//                   <div style={{ minWidth: 0 }}>
//                     <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
//                     <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>{task.category}</div>
//                   </div>
//                 </div>
//                 <div className="completion-meta">
//                   <span><FiCalendar />{new Date(task.completedDate).toLocaleDateString()}</span>
//                   <span><FiClock style={{ color: getEffColor(task.estimatedHours, task.actualHours) }} />
//                     {task.actualHours}h / {task.estimatedHours}h
//                   </span>
//                 </div>
//                 <span className={`efficiency-badge ${eff.cls}`}>{eff.text}</span>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Trends */}
//       <div className="divider" />
//       <div className="sub-section-title">
//         <FiPieChart style={{ color: 'var(--teal-500)' }} />
//         Completion Trends
//       </div>

//       <div className="trends-grid">
//         <div className="trend-panel">
//           <p className="trend-panel-title">By Priority</p>
//           {['high', 'medium', 'low'].map(p => {
//             const all = tasks.filter(t => t.priority === p);
//             const done = all.filter(t => t.status === 'completed').length;
//             const rate = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
//             const colors = { high: '#ef4444', medium: '#f59e0b', low: 'var(--teal-500)' };
//             return (
//               <div key={p} className="priority-row">
//                 <span className="priority-label">{p}</span>
//                 <div className="priority-bar-wrap">
//                   <div className="priority-track">
//                     <div className="priority-fill" style={{ width: `${rate}%`, background: colors[p] }} />
//                   </div>
//                   <span className="priority-pct">{rate}%</span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="trend-panel">
//           <p className="trend-panel-title">Monthly Progress</p>
//           <div className="week-bars">
//             {[1, 2, 3, 4].map(week => {
//               const h = [45, 72, 60, 88][week - 1];
//               return (
//                 <div key={week} className="week-bar-wrap">
//                   <div className="week-bar-outer">
//                     <div className="week-bar-inner" style={{ height: `${h}%` }} />
//                   </div>
//                   <span className="week-label">W{week}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main MyTasks Component
// const MyTasks = () => {
//   const [tasks, setTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [priorityFilter, setPriorityFilter] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });

//   const sampleTasks = [
//     { id: 1, title: 'Complete Monthly Sales Report', description: 'Prepare and submit the monthly sales performance report with analysis', status: 'completed', priority: 'high', dueDate: '2024-01-20', assignedDate: '2024-01-15', completedDate: '2024-01-19', estimatedHours: 8, actualHours: 6.5, assigner: 'Priya Patel', category: 'Reporting' },
//     { id: 2, title: 'Client Meeting Preparation', description: 'Prepare presentation and documents for upcoming client meeting on Friday', status: 'in-progress', priority: 'high', dueDate: '2024-01-25', assignedDate: '2024-01-18', completedDate: null, estimatedHours: 6, actualHours: 3, assigner: 'Raj Kumar', category: 'Client Meeting' },
//     { id: 3, title: 'Update CRM Database', description: 'Update customer records and interactions in the CRM system', status: 'pending', priority: 'medium', dueDate: '2024-01-22', assignedDate: '2024-01-20', completedDate: null, estimatedHours: 4, actualHours: 0, assigner: 'Priya Patel', category: 'Data Management' },
//     { id: 4, title: 'Team Training Session', description: 'Conduct training session for new team members on sales procedures', status: 'pending', priority: 'low', dueDate: '2024-01-30', assignedDate: '2024-01-22', completedDate: null, estimatedHours: 3, actualHours: 0, assigner: 'Anjali Sharma', category: 'Training' },
//     { id: 5, title: 'Q1 Budget Planning', description: 'Collaborate with finance team for Q1 budget planning and allocation', status: 'in-progress', priority: 'high', dueDate: '2024-02-05', assignedDate: '2024-01-25', completedDate: null, estimatedHours: 12, actualHours: 4, assigner: 'Amit Verma', category: 'Planning' },
//     { id: 6, title: 'Website Content Update', description: 'Update product information and pricing on company website', status: 'overdue', priority: 'medium', dueDate: '2024-01-18', assignedDate: '2024-01-10', completedDate: null, estimatedHours: 5, actualHours: 0, assigner: 'Neha Singh', category: 'Content' },
//     { id: 7, title: 'Customer Feedback Analysis', description: 'Analyze recent customer feedback and prepare improvement suggestions', status: 'completed', priority: 'medium', dueDate: '2024-01-24', assignedDate: '2024-01-20', completedDate: '2024-01-23', estimatedHours: 6, actualHours: 5.5, assigner: 'Priya Patel', category: 'Analysis' },
//     { id: 8, title: 'Inventory Audit', description: 'Conduct quarterly inventory audit and prepare report', status: 'pending', priority: 'low', dueDate: '2024-02-10', assignedDate: '2024-01-28', completedDate: null, estimatedHours: 8, actualHours: 0, assigner: 'Sanjay Roy', category: 'Audit' },
//     { id: 9, title: 'Social Media Campaign', description: 'Create and schedule social media posts for new product launch', status: 'completed', priority: 'medium', dueDate: '2024-01-28', assignedDate: '2024-01-22', completedDate: '2024-01-26', estimatedHours: 10, actualHours: 8, assigner: 'Neha Singh', category: 'Marketing' },
//     { id: 10, title: 'Vendor Contract Review', description: 'Review and finalize contracts with new vendors', status: 'completed', priority: 'high', dueDate: '2024-01-19', assignedDate: '2024-01-12', completedDate: '2024-01-18', estimatedHours: 7, actualHours: 9, assigner: 'Arjun Mehta', category: 'Legal' },
//   ];

//   useEffect(() => {
//     setTimeout(() => { setTasks(sampleTasks); setFilteredTasks(sampleTasks); setLoading(false); }, 900);
//   }, []);

//   useEffect(() => {
//     let r = tasks;
//     if (searchTerm) r = r.filter(t =>
//       t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       t.category.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     if (statusFilter !== 'all') r = r.filter(t => t.status === statusFilter);
//     if (priorityFilter !== 'all') r = r.filter(t => t.priority === priorityFilter);
//     setFilteredTasks(r);
//   }, [searchTerm, statusFilter, priorityFilter, tasks]);

//   const handleStatusChange = (id, newStatus) => {
//     setTasks(prev => prev.map(t => t.id === id
//       ? { ...t, status: newStatus, completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null }
//       : t
//     ));
//   };

//   const handleAddTask = () => {
//     if (!newTask.title.trim()) return;
//     setTasks(prev => [{
//       id: prev.length + 1, ...newTask, status: 'pending',
//       assignedDate: new Date().toISOString().split('T')[0], completedDate: null,
//       actualHours: 0, estimatedHours: 4, assigner: 'You', category: 'Personal'
//     }, ...prev]);
//     setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
//   };

//   const handleDeleteTask = id => setTasks(prev => prev.filter(t => t.id !== id));

//   const isOverdue = d => new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();

//   const statusStyle = s => ({
//     completed: 'background:#dcfce7;color:#166534;',
//     'in-progress': 'background:#cffafe;color:#0e7490;',
//     pending: 'background:#fef9c3;color:#854d0e;',
//     overdue: 'background:#fee2e2;color:#991b1b;',
//   }[s] || 'background:#f1f5f9;color:#475569;');

//   const priorityStyle = p => ({
//     high: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
//     medium: { bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
//     low: { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
//   }[p] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' });

//   const stats = {
//     total: tasks.length,
//     completed: tasks.filter(t => t.status === 'completed').length,
//     inProgress: tasks.filter(t => t.status === 'in-progress').length,
//     pending: tasks.filter(t => t.status === 'pending').length,
//     overdue: tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && isOverdue(t.dueDate))).length,
//   };

//   const statCards = [
//     { label: 'Total Tasks', value: stats.total, color: 'var(--teal-600)', bar: 'var(--teal-500)' },
//     { label: 'Completed', value: stats.completed, color: '#16a34a', bar: '#22c55e' },
//     { label: 'In Progress', value: stats.inProgress, color: '#0e7490', bar: '#06b6d4' },
//     { label: 'Pending', value: stats.pending, color: '#b45309', bar: '#f59e0b' },
//     { label: 'Overdue', value: stats.overdue, color: '#dc2626', bar: '#ef4444' },
//   ];

//   const getInitials = name => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

//   if (loading) return (
//     <div className="mytasks-root">
//       <style>{style}</style>
//       <div className="loading-screen">
//         <div className="spinner" />
//         <span className="loading-text">Loading your workspace…</span>
//       </div>
//     </div>
//   );

//   return (
//     <div className="mytasks-root">
//       <style>{style}</style>
//       <div className="page-inner">

//         {/* Header */}
//         <div className="page-header">
//           <div>
//             <h1 className="header-title">My Tasks</h1>
//             <p className="header-subtitle">Manage and track your assigned work</p>
//           </div>
//           <button className="btn-primary" onClick={() => document.querySelector('.quick-add-title-input')?.focus()}>
//             <FiPlus style={{ fontSize: 16 }} /> New Task
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="stats-grid">
//           {statCards.map((s, i) => (
//             <div key={i} className="stat-card" style={{ '--bar-color': s.bar }}>
//               <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
//               <div className="stat-label">{s.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* Quick Add */}
//         <div className="card card-padded" style={{ marginBottom: 20 }}>
//           <div className="section-title">
//             <div className="section-icon"><FiZap /></div>
//             Quick Add Task
//           </div>
//           <div className="quick-add-grid">
//             <input
//               className="form-input quick-add-title-input"
//               type="text"
//               placeholder="Task title…"
//               value={newTask.title}
//               onChange={e => setNewTask({ ...newTask, title: e.target.value })}
//               onKeyDown={e => e.key === 'Enter' && handleAddTask()}
//             />
//             <input
//               className="form-input"
//               type="text"
//               placeholder="Short description…"
//               value={newTask.description}
//               onChange={e => setNewTask({ ...newTask, description: e.target.value })}
//             />
//             <select
//               className="form-input"
//               value={newTask.priority}
//               onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
//             >
//               <option value="low">Low Priority</option>
//               <option value="medium">Medium Priority</option>
//               <option value="high">High Priority</option>
//             </select>
//             <div className="add-row">
//               <input
//                 className="form-input"
//                 type="date"
//                 value={newTask.dueDate}
//                 onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
//                 style={{ flex: 1 }}
//               />
//               <button className="btn-add" onClick={handleAddTask}>
//                 <FiPlus /> Add
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="card card-padded" style={{ marginBottom: 20 }}>
//           <div className="filter-bar">
//             <div className="search-wrap">
//               <FiSearch className="search-icon" />
//               <input
//                 className="search-input"
//                 type="text"
//                 placeholder="Search tasks, categories…"
//                 value={searchTerm}
//                 onChange={e => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="filter-controls">
//               <select className="select-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="in-progress">In Progress</option>
//                 <option value="completed">Completed</option>
//                 <option value="overdue">Overdue</option>
//               </select>
//               <select className="select-filter" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
//                 <option value="all">All Priority</option>
//                 <option value="high">High</option>
//                 <option value="medium">Medium</option>
//                 <option value="low">Low</option>
//               </select>
//               <button className="btn-export">
//                 <FiDownload style={{ fontSize: 14 }} /> Export
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="card" style={{ marginBottom: 20 }}>
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Task Details</th>
//                   <th>Status</th>
//                   <th>Priority</th>
//                   <th>Due Date</th>
//                   <th>Assigned By</th>
//                   <th>Time</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredTasks.map(task => {
//                   const ps = priorityStyle(task.priority);
//                   const over = isOverdue(task.dueDate) && task.status !== 'completed';
//                   return (
//                     <tr key={task.id}>
//                       <td>
//                         <div className="task-title">{task.title}</div>
//                         <div className="task-desc">{task.description}</div>
//                         <span className="task-category">{task.category}</span>
//                       </td>
//                       <td>
//                         <select
//                           className="status-select"
//                           value={task.status === 'overdue' ? 'pending' : task.status}
//                           onChange={e => handleStatusChange(task.id, e.target.value)}
//                           style={{ cssText: statusStyle(task.status) }}
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="in-progress">In Progress</option>
//                           <option value="completed">Completed</option>
//                         </select>
//                       </td>
//                       <td>
//                         <span className="badge" style={{ background: ps.bg, color: ps.color }}>
//                           <span style={{ width: 6, height: 6, borderRadius: '50%', background: ps.dot, display: 'inline-block', flexShrink: 0 }} />
//                           {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
//                         </span>
//                       </td>
//                       <td>
//                         <div className="date-cell">
//                           <FiCalendar style={{ color: over ? '#dc2626' : 'var(--teal-400)', fontSize: 13 }} />
//                           <span className={over ? 'overdue-date' : 'normal-date'}>
//                             {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
//                           </span>
//                           {over && <FiAlertCircle style={{ color: '#dc2626', fontSize: 13 }} />}
//                         </div>
//                       </td>
//                       <td>
//                         <div className="assigner-cell">
//                           <div className="assigner-avatar">{getInitials(task.assigner)}</div>
//                           <span style={{ fontSize: 12, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                             {task.assigner}
//                           </span>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="time-cell">
//                           <div className="est">Est: {task.estimatedHours}h</div>
//                           <div className="actual" style={{ color: task.actualHours > task.estimatedHours ? '#dc2626' : 'var(--teal-600)' }}>
//                             Act: {task.actualHours}h
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="action-btns">
//                           <button className="btn-icon btn-icon-edit" title="Edit"><FiEdit /></button>
//                           <button className="btn-icon btn-icon-del" onClick={() => handleDeleteTask(task.id)} title="Delete"><FiTrash2 /></button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>

//             {filteredTasks.length === 0 && (
//               <div className="empty-state">
//                 <div><FiActivity style={{ fontSize: 36 }} /></div>
//                 <p>No tasks found</p>
//                 <span>Try adjusting your filters or add a new task</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Task History */}
//         <TaskHistory tasks={tasks} />

//         {/* Quick Actions */}
//         <div className="card card-padded" style={{ marginTop: 24 }}>
//           <div className="section-title" style={{ marginBottom: 16 }}>
//             <div className="section-icon"><FiZap /></div>
//             Quick Actions
//           </div>
//           <div className="actions-grid">
//             {[
//               { icon: <FiBarChart2 />, label: 'Task Analytics' },
//               { icon: <FiDownload />, label: 'Export Report' },
//               { icon: <FiCalendar />, label: 'Calendar View' },
//               { icon: <FiFlag />, label: 'Set Priority' },
//             ].map((a, i) => (
//               <button key={i} className="action-btn">
//                 {a.icon}
//                 {a.label}
//               </button>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default MyTasks;

import React, { useState, useEffect, useCallback } from 'react';
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiFlag,
  FiUser,
  FiBarChart2,
  FiDownload,
  FiRefreshCw,
  FiTrendingUp,
  FiAward,
  FiTarget,
  FiPieChart,
  FiZap,
  FiActivity,
  FiFolder,
  FiChevronDown,
  FiChevronUp,
  FiSave,
  FiX
} from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = 'https://pmsbackend.pixelmindsolutions.com/api';
// const API_BASE_URL = 'https://pmsbackend.pixelmindsolutions.com/api';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  :root {
    --teal-50:  #f0fdfa;
    --teal-100: #ccfbf1;
    --teal-200: #99f6e4;
    --teal-300: #5eead4;
    --teal-400: #2dd4bf;
    --teal-500: #14b8a6;
    --teal-600: #0d9488;
    --teal-700: #0f766e;
    --teal-800: #115e59;
    --teal-900: #134e4a;
    --slate-50:  #f8fafc;
    --slate-100: #f1f5f9;
    --slate-200: #e2e8f0;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --slate-600: #475569;
    --slate-700: #334155;
    --slate-800: #1e293b;
    --surface: #ffffff;
    --surface-2: #f8fffe;
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --shadow-sm: 0 1px 3px rgba(13,148,136,0.08), 0 1px 2px rgba(13,148,136,0.04);
    --shadow-md: 0 4px 16px rgba(13,148,136,0.1), 0 2px 6px rgba(13,148,136,0.06);
    --shadow-lg: 0 10px 40px rgba(13,148,136,0.14), 0 4px 12px rgba(13,148,136,0.08);
    --shadow-glow: 0 0 0 3px rgba(20,184,166,0.15);
  }

  * { box-sizing: border-box; }

  .mytasks-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #f0fdfa 0%, #e6faf7 40%, #f0fdf9 70%, #ecfdf5 100%);
    padding: 0;
    position: relative;
    overflow-x: hidden;
  }

  .mytasks-root::before {
    content: '';
    position: fixed;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .mytasks-root::after {
    content: '';
    position: fixed;
    bottom: -150px;
    left: -150px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .page-inner {
    position: relative;
    z-index: 1;
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px 16px 48px;
  }

  @media (min-width: 640px) { .page-inner { padding: 32px 24px 56px; } }
  @media (min-width: 1024px) { .page-inner { padding: 40px 40px 64px; } }

  /* Header */
  .page-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }
  @media (min-width: 640px) {
    .page-header { flex-direction: row; align-items: center; justify-content: space-between; }
  }

  .header-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(22px, 4vw, 32px);
    font-weight: 800;
    color: var(--teal-800);
    letter-spacing: -0.5px;
    line-height: 1.1;
    margin: 0 0 4px 0;
  }

  .header-subtitle {
    font-size: 14px;
    color: var(--slate-500);
    margin: 0;
    font-weight: 400;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, var(--teal-500) 0%, var(--teal-600) 100%);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    padding: 11px 22px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 14px rgba(13,148,136,0.3);
    white-space: nowrap;
    align-self: flex-start;
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(13,148,136,0.4);
    background: linear-gradient(135deg, var(--teal-400) 0%, var(--teal-500) 100%);
  }
  .btn-primary:active { transform: translateY(0); }

  /* Cards */
  .card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid rgba(20,184,166,0.1);
    overflow: hidden;
  }

  .card-padded { padding: 24px; }
  @media (min-width: 640px) { .card-padded { padding: 28px 32px; } }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  @media (min-width: 480px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(5, 1fr); } }
  @media (min-width: 1024px) { .stats-grid { gap: 16px; } }

  .stat-card {
    background: var(--surface);
    border-radius: var(--radius-md);
    padding: 16px;
    text-align: center;
    border: 1px solid rgba(20,184,166,0.1);
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--bar-color, var(--teal-400));
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: clamp(22px, 3.5vw, 28px);
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
  }
  .stat-label { font-size: 12px; color: var(--slate-500); font-weight: 500; }

  /* Section Title */
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--teal-800);
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 20px 0;
  }

  .section-icon {
    width: 30px; height: 30px;
    background: linear-gradient(135deg, var(--teal-100), var(--teal-200));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: var(--teal-600);
    font-size: 14px;
    flex-shrink: 0;
  }

  /* Quick Add Form */
  .quick-add-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 640px) { .quick-add-grid { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 1024px) { .quick-add-grid { grid-template-columns: 2fr 2fr 1fr 1.5fr; } }

  .form-input {
    width: 100%;
    padding: 11px 16px;
    border: 1.5px solid var(--teal-100);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--slate-700);
    background: var(--surface-2);
    outline: none;
    transition: all 0.2s ease;
  }
  .form-input:focus {
    border-color: var(--teal-400);
    box-shadow: var(--shadow-glow);
    background: #fff;
  }
  .form-input::placeholder { color: var(--slate-400); }

  .add-row { display: flex; gap: 10px; }
  .btn-add {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, var(--teal-500), var(--teal-600));
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    padding: 11px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(13,148,136,0.25);
  }
  .btn-add:hover { background: linear-gradient(135deg, var(--teal-400), var(--teal-500)); transform: translateY(-1px); }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  @media (min-width: 768px) {
    .filter-bar { flex-direction: row; align-items: center; justify-content: space-between; }
  }

  .search-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
  }
  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--teal-400);
    font-size: 15px;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    padding: 11px 16px 11px 42px;
    border: 1.5px solid var(--teal-100);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--slate-700);
    background: var(--surface-2);
    outline: none;
    transition: all 0.2s ease;
  }
  .search-input:focus {
    border-color: var(--teal-400);
    box-shadow: var(--shadow-glow);
    background: #fff;
  }

  .filter-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .select-filter {
    padding: 10px 14px;
    border: 1.5px solid var(--teal-100);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--slate-600);
    background: var(--surface-2);
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%230d9488' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 30px;
  }
  .select-filter:focus { border-color: var(--teal-400); box-shadow: var(--shadow-glow); }

  .btn-export {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--teal-50);
    color: var(--teal-700);
    border: 1.5px solid var(--teal-200);
    border-radius: var(--radius-sm);
    padding: 10px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-export:hover { background: var(--teal-100); border-color: var(--teal-300); }

  /* Table */
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
  }

  thead tr {
    background: linear-gradient(to right, var(--teal-50), var(--teal-100));
  }

  thead th {
    padding: 14px 18px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--teal-700);
    white-space: nowrap;
    border-bottom: 2px solid var(--teal-200);
  }

  tbody tr {
    transition: background 0.15s ease;
    border-bottom: 1px solid var(--slate-100);
  }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--teal-50); }

  td { padding: 16px 18px; vertical-align: middle; }

  .task-title {
    font-weight: 600;
    color: var(--slate-800);
    margin-bottom: 3px;
    font-size: 14px;
  }
  .task-desc {
    font-size: 12px;
    color: var(--slate-500);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 260px;
  }
  .task-category {
    display: inline-block;
    margin-top: 6px;
    background: var(--teal-50);
    color: var(--teal-700);
    border: 1px solid var(--teal-200);
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
  }

  .status-select {
    border: none;
    border-radius: 20px;
    padding: 5px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    transition: all 0.2s;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .date-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    white-space: nowrap;
  }

  .time-cell .est { font-size: 12px; color: var(--slate-500); }
  .time-cell .actual { font-size: 13px; font-weight: 600; }

  .action-btns { display: flex; gap: 6px; }
  .btn-icon {
    width: 32px; height: 32px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    transition: all 0.15s ease;
    background: transparent;
  }
  .btn-icon-edit { color: var(--teal-600); }
  .btn-icon-edit:hover { background: var(--teal-50); color: var(--teal-700); }
  .btn-icon-del { color: #ef4444; }
  .btn-icon-del:hover { background: #fef2f2; }

  .empty-state {
    text-align: center;
    padding: 56px 24px;
    color: var(--slate-400);
  }
  .empty-state svg { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }
  .empty-state p { margin: 0 0 6px; font-size: 15px; font-weight: 500; color: var(--slate-500); }
  .empty-state span { font-size: 13px; }

  /* History Component */
  .history-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  @media (min-width: 768px) {
    .history-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
  }

  .hist-stat {
    border-radius: var(--radius-md);
    padding: 18px;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .hist-stat:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .hist-stat-label { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .hist-stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 2px; }
  .hist-stat-sub { font-size: 11px; margin-top: 2px; }

  .hist-stat-icon {
    position: absolute;
    top: 14px; right: 14px;
    opacity: 0.5;
    font-size: 18px;
  }

  .progress-bar-track {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    margin-top: 10px;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;
  }

  .completion-item {
    padding: 14px 16px;
    border-radius: var(--radius-md);
    background: var(--teal-50);
    border: 1px solid var(--teal-100);
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: background 0.15s ease;
  }
  .completion-item:hover { background: var(--teal-100); }
  @media (min-width: 640px) {
    .completion-item { flex-direction: row; align-items: center; justify-content: space-between; }
  }

  .completion-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    font-size: 12px;
    color: var(--slate-500);
  }
  .completion-meta span { display: flex; align-items: center; gap: 4px; }

  .efficiency-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .trends-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 24px;
  }
  @media (min-width: 768px) { .trends-grid { grid-template-columns: 1fr 1fr; } }

  .trend-panel {
    background: var(--teal-50);
    border-radius: var(--radius-md);
    padding: 18px;
    border: 1px solid var(--teal-100);
  }
  .trend-panel-title { font-size: 13px; font-weight: 700; color: var(--teal-800); margin: 0 0 16px 0; }

  .priority-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .priority-row:last-child { margin-bottom: 0; }
  .priority-label { font-size: 12px; font-weight: 500; color: var(--slate-600); text-transform: capitalize; }
  .priority-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .priority-track { width: 80px; height: 6px; background: var(--slate-200); border-radius: 3px; overflow: hidden; }
  @media (min-width: 480px) { .priority-track { width: 110px; } }
  .priority-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .priority-pct { font-size: 12px; font-weight: 700; color: var(--teal-700); width: 32px; text-align: right; }

  .week-bars { display: flex; align-items: flex-end; justify-content: space-around; height: 80px; gap: 8px; }
  .week-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
  .week-bar-outer { width: 100%; background: var(--teal-200); border-radius: 4px 4px 0 0; display: flex; flex-direction: column; justify-content: flex-end; height: 60px; overflow: hidden; }
  .week-bar-inner { background: linear-gradient(to top, var(--teal-600), var(--teal-400)); border-radius: 4px 4px 0 0; transition: height 0.5s ease; }
  .week-label { font-size: 11px; font-weight: 500; color: var(--slate-500); }

  /* Quick Actions */
  .actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (min-width: 480px) { .actions-grid { grid-template-columns: repeat(4, 1fr); } }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 18px 12px;
    border-radius: var(--radius-md);
    border: 1.5px solid transparent;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
    background: var(--teal-50);
    color: var(--teal-700);
    border-color: var(--teal-100);
  }
  .action-btn:hover {
    background: var(--teal-100);
    border-color: var(--teal-300);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  .action-btn svg { font-size: 18px; color: var(--teal-600); }

  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0fdfa, #e6faf7);
    font-family: 'DM Sans', sans-serif;
    flex-direction: column;
    gap: 16px;
  }
  .spinner {
    width: 44px; height: 44px;
    border: 3px solid var(--teal-100);
    border-top-color: var(--teal-500);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 14px; color: var(--teal-700); font-weight: 500; }

  .history-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  @media (min-width: 640px) {
    .history-header { flex-direction: row; align-items: flex-start; justify-content: space-between; }
  }

  .divider { height: 1px; background: var(--teal-100); margin: 24px 0; }

  .sub-section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--teal-800);
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 16px 0;
  }

  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal-500); display: inline-block; }

  .assigner-cell { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--slate-600); }
  .assigner-avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--teal-200), var(--teal-300));
    display: flex; align-items: center; justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--teal-700);
    flex-shrink: 0;
  }

  .overdue-date { color: #dc2626; font-weight: 600; }
  .normal-date { color: var(--slate-600); }

  /* Scrollbar */
  .table-wrap::-webkit-scrollbar { height: 6px; }
  .table-wrap::-webkit-scrollbar-track { background: var(--teal-50); border-radius: 3px; }
  .table-wrap::-webkit-scrollbar-thumb { background: var(--teal-300); border-radius: 3px; }
`;

// Task History Component
const TaskHistory = ({ tasks }) => {
  const [timeRange, setTimeRange] = useState('month');

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const avgCompletionTime = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((acc, t) => {
        const days = (new Date(t.completedDate) - new Date(t.assignedDate)) / 86400000;
        return acc + days;
      }, 0) / completedTasks.length * 10) / 10
    : 0;

  const productivityScore = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((acc, t) => {
        const eff = t.actualHours && t.estimatedHours ? (t.estimatedHours / t.actualHours) * 100 : 100;
        return acc + Math.min(eff, 150);
      }, 0) / completedTasks.length)
    : 0;

  const recentCompletions = [...completedTasks]
    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
    .slice(0, 8);

  const getEffInfo = (est, act) => {
    if (!act || !est) return { text: 'N/A', cls: 'bg-slate-100 text-slate-600' };
    const e = (est / act) * 100;
    if (e >= 120) return { text: 'Excellent', cls: 'bg-emerald-100 text-emerald-700' };
    if (e >= 80) return { text: 'On Track', cls: 'bg-teal-100 text-teal-700' };
    return { text: 'Over Budget', cls: 'bg-amber-100 text-amber-700' };
  };

  const getEffColor = (est, act) => {
    if (!act || !est) return 'var(--slate-500)';
    return (est / act) * 100 >= 80 ? 'var(--teal-600)' : '#f59e0b';
  };

  return (
    <div className="card card-padded" style={{ marginTop: 24 }}>
      <div className="history-header">
        <div>
          <div className="section-title" style={{ marginBottom: 4 }}>
            <div className="section-icon"><FiTrendingUp /></div>
            Task Completion History
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--slate-500)' }}>
            Track productivity and completion patterns
          </p>
        </div>
        <select
          className="select-filter"
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="history-stats-grid">
        {[
          {
            label: 'Completion Rate', value: `${completionRate}%`, sub: `${completedCount} of ${totalTasks} tasks`,
            bg: '#f0fdfa', border: 'var(--teal-200)', labelColor: 'var(--teal-600)', valueColor: 'var(--teal-800)', subColor: 'var(--teal-500)',
            icon: <FiTarget />, bar: true, barPct: completionRate, barColor: 'var(--teal-500)', barTrack: 'var(--teal-200)'
          },
          {
            label: 'Tasks Completed', value: completedCount, sub: `Total: ${totalTasks}`,
            bg: '#f0fdff', border: '#a5f3fc', labelColor: '#0e7490', valueColor: '#164e63', subColor: '#0e7490',
            icon: <FiCheckCircle />, bar: false
          },
          {
            label: 'Avg. Completion', value: `${avgCompletionTime}d`, sub: 'days per task',
            bg: '#fdf4ff', border: '#e9d5ff', labelColor: '#7c3aed', valueColor: '#4c1d95', subColor: '#7c3aed',
            icon: <FiClock />, bar: false
          },
          {
            label: 'Productivity Score', value: productivityScore, sub: 'efficiency rating',
            bg: '#fff7ed', border: '#fed7aa', labelColor: '#c2410c', valueColor: '#7c2d12', subColor: '#c2410c',
            icon: <FiAward />, bar: false
          },
        ].map((s, i) => (
          <div key={i} className="hist-stat" style={{ background: s.bg, borderColor: s.border }}>
            <div className="hist-stat-label" style={{ color: s.labelColor }}>{s.label}</div>
            <div className="hist-stat-value" style={{ color: s.valueColor }}>{s.value}</div>
            <div className="hist-stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
            <div className="hist-stat-icon" style={{ color: s.labelColor }}>{s.icon}</div>
            {s.bar && (
              <div className="progress-bar-track" style={{ background: s.barTrack }}>
                <div className="progress-bar-fill" style={{ width: `${s.barPct}%`, background: s.barColor }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="divider" />

      <div className="sub-section-title">
        <FiCheckCircle style={{ color: 'var(--teal-500)' }} />
        Recently Completed
      </div>

      {recentCompletions.length === 0 ? (
        <div className="empty-state">
          <div><FiCheckCircle /></div>
          <p>No completed tasks yet</p>
          <span>Complete tasks to see history here</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentCompletions.map(task => {
            const eff = getEffInfo(task.estimatedHours, task.actualHours);
            return (
              <div key={task.id} className="completion-item">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                  <FiCheckCircle style={{ color: 'var(--teal-500)', flexShrink: 0, marginTop: 2, fontSize: 15 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>{task.category}</div>
                  </div>
                </div>
                <div className="completion-meta">
                  <span><FiCalendar />{new Date(task.completedDate).toLocaleDateString()}</span>
                  <span><FiClock style={{ color: getEffColor(task.estimatedHours, task.actualHours) }} />
                    {task.actualHours}h / {task.estimatedHours}h
                  </span>
                </div>
                <span className={`efficiency-badge ${eff.cls}`}>{eff.text}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="divider" />

      <div className="sub-section-title">
        <FiPieChart style={{ color: 'var(--teal-500)' }} />
        Completion Trends
      </div>

      <div className="trends-grid">
        <div className="trend-panel">
          <p className="trend-panel-title">By Priority</p>
          {['high', 'medium', 'low'].map(p => {
            const all = tasks.filter(t => t.priority === p);
            const done = all.filter(t => t.status === 'completed').length;
            const rate = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
            const colors = { high: '#ef4444', medium: '#f59e0b', low: 'var(--teal-500)' };
            return (
              <div key={p} className="priority-row">
                <span className="priority-label">{p}</span>
                <div className="priority-bar-wrap">
                  <div className="priority-track">
                    <div className="priority-fill" style={{ width: `${rate}%`, background: colors[p] }} />
                  </div>
                  <span className="priority-pct">{rate}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="trend-panel">
          <p className="trend-panel-title">Monthly Progress</p>
          <div className="week-bars">
            {[1, 2, 3, 4].map(week => {
              const h = [45, 72, 60, 88][week - 1];
              return (
                <div key={week} className="week-bar-wrap">
                  <div className="week-bar-outer">
                    <div className="week-bar-inner" style={{ height: `${h}%` }} />
                  </div>
                  <span className="week-label">W{week}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main MyTasks Component
const MyTasks = () => {
  const [worksheet, setWorksheet] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [updatingTask, setUpdatingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '', projectName: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Get employee data from session storage
  const getUserDataFromStorage = () => {
    try {
      const staffDetails = sessionStorage.getItem('staffDetails');
      if (staffDetails) {
        const parsed = JSON.parse(staffDetails);
        return {
          employeeId: parsed.user?.employeeId,
          employeeName: parsed.user?.employeeName,
          token: parsed.token
        };
      }
      
      const empId = sessionStorage.getItem('employeeId');
      const token = sessionStorage.getItem('token');
      const empName = sessionStorage.getItem('employeeName');
      
      return {
        employeeId: empId,
        employeeName: empName,
        token: token
      };
    } catch (err) {
      console.error('Error parsing user data:', err);
      return { employeeId: null, employeeName: null, token: null };
    }
  };

  // Fetch worksheet data
  const fetchWorksheet = useCallback(async () => {
    const { employeeId: empId, employeeName: empName, token } = getUserDataFromStorage();
    
    if (!empId) {
      setError('Employee ID not found. Please login again.');
      setLoading(false);
      return;
    }

    setEmployeeId(empId);
    setEmployeeName(empName);
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/worksheets/employee/${empId}`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const worksheetData = response.data.data[0];
        setWorksheet(worksheetData);
        setProjects(worksheetData.projects || []);
        setFilteredProjects(worksheetData.projects || []);
        
        // Extract all tasks from projects
        const tasks = [];
        (worksheetData.projects || []).forEach((project, pIndex) => {
          if (project.tasks && project.tasks.length > 0) {
            project.tasks.forEach((task, tIndex) => {
              tasks.push({
                id: task._id,
                taskId: task._id,
                title: task.title,
                description: task.description || '',
                category: task.category || 'work',
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                dueDate: task.dueDate,
                assignedDate: task.assignedDate || new Date(),
                completedDate: task.completedDate,
                estimatedHours: task.estimatedHours || 0,
                actualHours: task.actualHours || 0,
                assigner: task.assignedBy?.employeeName || worksheetData.employName,
                projectName: project.projectName,
                worksheetId: worksheetData._id
              });
            });
          }
        });
        setAllTasks(tasks);
        
        // Initialize expanded state
        const expandedState = {};
        (worksheetData.projects || []).forEach((_, index) => {
          expandedState[index] = false;
        });
        setExpandedProjects(expandedState);
      } else {
        setProjects([]);
        setFilteredProjects([]);
        setAllTasks([]);
      }
    } catch (err) {
      console.error('Error fetching worksheet:', err);
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorksheet();
  }, [fetchWorksheet]);

  // Filter projects based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = projects.filter(project =>
        project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchTerm, projects]);

  // Toggle project expansion
  const toggleProject = (index) => {
    setExpandedProjects(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Update task status via API
  const updateTaskStatus = async (taskId, projectName, newStatus, actualHours = null) => {
    const { token, employeeId: empId } = getUserDataFromStorage();
    
    if (!worksheet) {
      setError('Worksheet not found');
      return;
    }

    setUpdatingTask(taskId);
    
    try {
      const payload = { status: newStatus };
      if (actualHours !== null) payload.actualHours = actualHours;
      
      const response = await axios.put(
        `${API_BASE_URL}/worksheets/${worksheet._id}/project/${projectName}/task/${taskId}/status`,
        payload,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      
      if (response.data.success) {
        // Update local state
        setAllTasks(prev => prev.map(task =>
          task.id === taskId
            ? { 
                ...task, 
                status: newStatus, 
                completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : task.completedDate 
              }
            : task
        ));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to update task status');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdatingTask(null);
    }
  };

  // Handle status change from dropdown
  const handleTaskStatusChange = (taskId, projectName, newStatus) => {
    updateTaskStatus(taskId, projectName, newStatus);
  };

  // Handle delete task via API
  const handleDeleteTask = async (taskId, projectName) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    const { token } = getUserDataFromStorage();
    
    if (!worksheet) {
      setError('Worksheet not found');
      return;
    }

    setUpdatingTask(taskId);
    
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/worksheets/${worksheet._id}/project/${projectName}/task/${taskId}`,
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      
      if (response.data.success) {
        setAllTasks(prev => prev.filter(task => task.id !== taskId));
        setError(null);
      } else {
        setError(response.data.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setUpdatingTask(null);
    }
  };

  // Handle add task via API
  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.projectName) {
      setError('Task title and project are required');
      return;
    }
    
    const { token } = getUserDataFromStorage();
    
    if (!worksheet) {
      setError('Worksheet not found');
      return;
    }

    setUpdatingTask('new');
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/worksheets/${worksheet._id}/project/${newTask.projectName}/tasks`,
        {
          title: newTask.title,
          description: newTask.description || '',
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          estimatedHours: 4,
          category: 'work',
          assignedBy: {
            empId: employeeId,
            employeeName: employeeName
          }
        },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      
      if (response.data.success) {
        await fetchWorksheet(); // Refresh all data
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', projectName: '' });
        setShowAddForm(false);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to add task');
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setUpdatingTask(null);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get shift badge style
  const getShiftStyle = (shift) => {
    const styles = {
      morning: 'bg-orange-100 text-orange-700 border-orange-200',
      afternoon: 'bg-purple-100 text-purple-700 border-purple-200',
      fullday: 'bg-teal-100 text-teal-700 border-teal-200'
    };
    return styles[shift] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Calculate project status
  const getProjectStatus = (endDate) => {
    if (!endDate) return 'active';
    return new Date(endDate) >= new Date() ? 'active' : 'completed';
  };

  // Get tasks for a specific project
  const getProjectTasks = (projectName) => {
    return allTasks.filter(task => task.projectName === projectName);
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();

  const statusStyle = (status) => ({
    completed: 'background:#dcfce7;color:#166534;',
    'in-progress': 'background:#cffafe;color:#0e7490;',
    pending: 'background:#fef9c3;color:#854d0e;',
    overdue: 'background:#fee2e2;color:#991b1b;',
  }[status] || 'background:#f1f5f9;color:#475569;');

  const priorityStyle = (priority) => ({
    high: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
    medium: { bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
    low: { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  }[priority] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' });

  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    inProgress: allTasks.filter(t => t.status === 'in-progress').length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    overdue: allTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && isOverdue(t.dueDate))).length,
  };

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: 'var(--teal-600)', bar: 'var(--teal-500)' },
    { label: 'Completed', value: stats.completed, color: '#16a34a', bar: '#22c55e' },
    { label: 'In Progress', value: stats.inProgress, color: '#0e7490', bar: '#06b6d4' },
    { label: 'Pending', value: stats.pending, color: '#b45309', bar: '#f59e0b' },
    { label: 'Overdue', value: stats.overdue, color: '#dc2626', bar: '#ef4444' },
  ];

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NA';

  if (loading) return (
    <div className="mytasks-root">
      <style>{style}</style>
      <div className="loading-screen">
        <div className="spinner" />
        <span className="loading-text">Loading your workspace…</span>
      </div>
    </div>
  );

  return (
    <div className="mytasks-root">
      <style>{style}</style>
      <div className="page-inner">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="header-title">My Tasks</h1>
            <p className="header-subtitle">Manage and track your assigned work</p>
            {employeeName && <p className="text-xs text-teal-600 mt-1">Welcome, {employeeName}</p>}
          </div>
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <FiPlus style={{ fontSize: 16 }} /> New Task
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card card-padded" style={{ marginBottom: 20, background: '#fee2e2', borderColor: '#fecaca' }}>
            <div className="flex items-center gap-2 text-red-600">
              <FiAlertCircle />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">✕</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card" style={{ '--bar-color': s.bar }}>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="section-title">
              <div className="section-icon"><FiZap /></div>
              Add New Task
            </div>
            <div className="quick-add-grid">
              <input
                className="form-input"
                type="text"
                placeholder="Task title…"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              />
              <input
                className="form-input"
                type="text"
                placeholder="Short description…"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              />
              <select
                className="form-input"
                value={newTask.projectName}
                onChange={e => setNewTask({ ...newTask, projectName: e.target.value })}
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project._id} value={project.projectName}>{project.projectName}</option>
                ))}
              </select>
              <select
                className="form-input"
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="add-row">
                <input
                  className="form-input"
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button className="btn-add" onClick={handleAddTask} disabled={updatingTask === 'new'}>
                  {updatingTask === 'new' ? <FiRefreshCw className="animate-spin" /> : <FiPlus />} Add Task
                </button>
                <button className="btn-add" onClick={() => setShowAddForm(false)} style={{ background: '#94a3b8' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card card-padded" style={{ marginBottom: 20 }}>
          <div className="filter-bar">
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input
                className="search-input"
                type="text"
                placeholder="Search tasks, projects, categories…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <button className="btn-export" onClick={fetchWorksheet}>
                <FiRefreshCw style={{ fontSize: 14 }} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Projects and Tasks Table */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project / Task Details</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Assigned By</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project, projectIdx) => {
                    const isExpanded = expandedProjects[projectIdx];
                    const projectTasks = getProjectTasks(project.projectName);
                    const status = getProjectStatus(project.endDate);
                    const isActive = status === 'active';
                    
                    return (
                      <React.Fragment key={projectIdx}>
                        {/* Project Row */}
                        <tr className="project-row" style={{ background: 'linear-gradient(135deg, #f0fdfa, #e6faf7)' }}>
                          <td colSpan="7" style={{ padding: 0 }}>
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-teal-100 transition"
                              onClick={() => toggleProject(projectIdx)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isActive ? 'from-teal-500 to-teal-600' : 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-lg`}>
                                  <FiFolder size={18} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-gray-800">{project.projectName}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getShiftStyle(project.shift)}`}>
                                      {project.shift}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                      {isActive ? 'Active' : 'Completed'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span><FiCalendar className="inline mr-1" size={12} /> {formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
                                    <span><FiClock className="inline mr-1" size={12} /> {project.hours} hours/day</span>
                                  </div>
                                  {project.comment && <p className="text-xs text-gray-400 mt-1">{project.comment}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-teal-600">{projectTasks.length} tasks</div>
                                  <div className="text-xs text-gray-400">{projectTasks.filter(t => t.status === 'completed').length} completed</div>
                                </div>
                                {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                              </div>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Tasks Rows (expanded) */}
                        {isExpanded && (
                          projectTasks.length > 0 ? (
                            projectTasks.map(task => {
                              const ps = priorityStyle(task.priority);
                              const over = isOverdue(task.dueDate) && task.status !== 'completed';
                              const isUpdating = updatingTask === task.id;
                              
                              return (
                                <tr key={task.id} style={{ background: '#fff' }}>
                                  <td style={{ paddingLeft: 48 }}>
                                    <div className="task-title">{task.title}</div>
                                    <div className="task-desc">{task.description}</div>
                                    <span className="task-category">{task.category}</span>
                                  </td>
                                  <td>
                                    <select
                                      className="status-select"
                                      value={task.status === 'overdue' ? 'pending' : task.status}
                                      onChange={e => handleTaskStatusChange(task.id, task.projectName, e.target.value)}
                                      style={{ cssText: statusStyle(task.status) }}
                                      disabled={isUpdating}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="in-progress">In Progress</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    {isUpdating && <span className="ml-2 text-xs text-teal-500">Updating...</span>}
                                  </td>
                                  <td>
                                    <span className="badge" style={{ background: ps.bg, color: ps.color }}>
                                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ps.dot, display: 'inline-block', marginRight: 6 }} />
                                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="date-cell">
                                      <FiCalendar style={{ color: over ? '#dc2626' : 'var(--teal-400)' }} />
                                      <span className={over ? 'overdue-date' : 'normal-date'}>
                                        {task.dueDate ? formatDate(task.dueDate) : 'No date'}
                                      </span>
                                      {over && <FiAlertCircle style={{ color: '#dc2626' }} />}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="assigner-cell">
                                      <div className="assigner-avatar">{getInitials(task.assigner)}</div>
                                      <span>{task.assigner}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="time-cell">
                                      <div className="est">Est: {task.estimatedHours}h</div>
                                      <div className="actual" style={{ color: task.actualHours > task.estimatedHours ? '#dc2626' : 'var(--teal-600)' }}>
                                        Act: {task.actualHours}h
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="action-btns">
                                      <button 
                                        className="btn-icon btn-icon-del" 
                                        onClick={() => handleDeleteTask(task.id, task.projectName)} 
                                        title="Delete"
                                        disabled={isUpdating}
                                      >
                                        {isUpdating ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr style={{ background: '#fafafa' }}>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                <FiFolder size={24} className="mx-auto mb-2 opacity-40" />
                                <p>No tasks assigned to this project</p>
                                <button 
                                  className="btn-add mt-2" 
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                  onClick={() => {
                                    setNewTask({ ...newTask, projectName: project.projectName });
                                    setShowAddForm(true);
                                  }}
                                >
                                  <FiPlus size={12} /> Add Task
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div><FiActivity style={{ fontSize: 36 }} /></div>
                      <p>No projects assigned</p>
                      <span>Contact your admin to get assigned to projects</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task History */}
        <TaskHistory tasks={allTasks} />

        {/* Quick Actions */}
        <div className="card card-padded" style={{ marginTop: 24 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>
            <div className="section-icon"><FiZap /></div>
            Quick Actions
          </div>
          <div className="actions-grid">
            {[
              { icon: <FiBarChart2 />, label: 'Task Analytics' },
              { icon: <FiDownload />, label: 'Export Report' },
              { icon: <FiCalendar />, label: 'Calendar View' },
              { icon: <FiFlag />, label: 'Set Priority' },
            ].map((a, i) => (
              <button key={i} className="action-btn">
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyTasks;