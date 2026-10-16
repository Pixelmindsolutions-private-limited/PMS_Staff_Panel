// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   FiClock, FiMapPin, FiCalendar, FiUser, FiCheckCircle,
//   FiAlertCircle, FiDownload, FiBarChart2, FiCoffee, FiSun, FiZap,
// } from 'react-icons/fi';

// const API_BASE_URL ='https://pmsbackend.pixelmindsolutions.com/api';

// const style = `
//   @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
//   :root {
//     --t50:#f0fdfa;--t100:#ccfbf1;--t200:#99f6e4;--t300:#5eead4;--t400:#2dd4bf;
//     --t500:#14b8a6;--t600:#0d9488;--t700:#0f766e;--t800:#115e59;
//     --s400:#94a3b8;--s500:#64748b;--s600:#475569;--s700:#334155;--s800:#1e293b;
//     --sur:#fff;--sur2:#f8fffe;
//     --rsm:8px;--rmd:14px;--rlg:20px;
//     --shmd:0 4px 16px rgba(13,148,136,.10),0 2px 6px rgba(13,148,136,.06);
//     --shlg:0 10px 40px rgba(13,148,136,.14),0 4px 12px rgba(13,148,136,.08);
//     --glow:0 0 0 3px rgba(20,184,166,.16);
//   }
//   *{box-sizing:border-box;}
//   .pio-root{
//     font-family:'DM Sans',sans-serif;min-height:100vh;
//     background:linear-gradient(135deg,#f0fdfa 0%,#e6faf7 40%,#f0fdf9 70%,#ecfdf5 100%);
//     position:relative;overflow-x:hidden;padding:18px 14px 64px;
//   }
//   @media(min-width:480px){.pio-root{padding:22px 18px 64px;}}
//   @media(min-width:640px){.pio-root{padding:28px 24px 72px;}}
//   @media(min-width:1024px){.pio-root{padding:36px 40px 80px;max-width:1200px;margin:0 auto;}}
//   .pio-root::before{content:'';position:fixed;top:-180px;right:-180px;width:500px;height:500px;
//     background:radial-gradient(circle,rgba(20,184,166,.08) 0%,transparent 70%);pointer-events:none;z-index:0;}
//   .pio-root::after{content:'';position:fixed;bottom:-140px;left:-140px;width:440px;height:440px;
//     background:radial-gradient(circle,rgba(13,148,136,.06) 0%,transparent 70%);pointer-events:none;z-index:0;}
//   .pio-root > *{position:relative;z-index:1;}

//   .pio-hdr{margin-bottom:20px;}
//   .pio-title{font-family:'Syne',sans-serif;font-size:clamp(18px,4vw,26px);font-weight:800;
//     color:var(--t800);letter-spacing:-.5px;margin:0 0 3px;}
//   .pio-sub{font-size:12px;color:var(--s500);margin:0;}
//   @media(min-width:480px){.pio-sub{font-size:13px;}}

//   .pio-grid{display:grid;grid-template-columns:1fr;gap:16px;}
//   @media(min-width:1024px){.pio-grid{grid-template-columns:1fr 1fr;gap:20px;}}

//   .card{background:var(--sur);border-radius:var(--rlg);box-shadow:var(--shmd);
//     border:1px solid rgba(20,184,166,.10);padding:18px;}
//   @media(min-width:480px){.card{padding:20px 22px;}}
//   .card + .card{margin-top:16px;}

//   .sec-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--t800);
//     display:flex;align-items:center;gap:8px;margin:0 0 16px;}
//   .sec-icon{width:27px;height:27px;border-radius:8px;
//     background:linear-gradient(135deg,var(--t100),var(--t200));
//     display:flex;align-items:center;justify-content:center;color:var(--t600);font-size:12px;}

//   .status-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
//   .status-pill{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid;}
//   .sp-in{background:var(--t50);color:var(--t600);border-color:var(--t200);}
//   .sp-out{background:#fef2f2;color:#dc2626;border-color:#fca5a5;}
//   .sp-break{background:#fffbeb;color:#d97706;border-color:#fde68a;}

//   .clock-wrap{text-align:center;margin-bottom:16px;}
//   .clock-time{font-family:'Syne',sans-serif;font-size:clamp(32px,7vw,48px);font-weight:800;
//     color:var(--t800);letter-spacing:-1px;line-height:1;margin-bottom:5px;font-variant-numeric:tabular-nums;}
//   .clock-date{font-size:12px;color:var(--s500);}
//   @media(min-width:480px){.clock-date{font-size:13px;}}

//   .location-row{display:flex;align-items:center;gap:8px;background:var(--t50);
//     border:1px solid var(--t100);border-radius:var(--rmd);padding:10px 14px;margin-bottom:14px;}
//   .loc-label{font-size:12px;font-weight:600;color:var(--t500);white-space:nowrap;}
//   .loc-select{flex:1;background:transparent;color:var(--t700);font-family:'DM Sans',sans-serif;
//     font-size:13px;font-weight:700;border:none;outline:none;cursor:pointer;min-width:0;}

//   .btn-punch-in{
//     width:100%;background:linear-gradient(135deg,var(--t500),var(--t600));color:#fff;
//     border:none;border-radius:var(--rmd);padding:14px;
//     font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;
//     display:flex;align-items:center;justify-content:center;gap:8px;
//     transition:all .2s;box-shadow:0 4px 14px rgba(13,148,136,.28);
//   }
//   .btn-punch-in:hover{background:linear-gradient(135deg,var(--t400),var(--t500));transform:translateY(-1px);}
//   .btn-punch-in:disabled{opacity:.5;cursor:not-allowed;transform:none;}

//   .break-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
//   .btn-tea{background:#fffbeb;color:#d97706;border:1.5px solid #fde68a;
//     border-radius:var(--rmd);padding:11px;font-family:'DM Sans',sans-serif;
//     font-size:12px;font-weight:600;cursor:pointer;
//     display:flex;align-items:center;justify-content:center;gap:7px;transition:all .15s;}
//   .btn-tea:hover{background:#fef3c7;}
//   .btn-lunch{background:#fff7ed;color:#c2410c;border:1.5px solid #fed7aa;
//     border-radius:var(--rmd);padding:11px;font-family:'DM Sans',sans-serif;
//     font-size:12px;font-weight:600;cursor:pointer;
//     display:flex;align-items:center;justify-content:center;gap:7px;transition:all .15s;}
//   .btn-lunch:hover{background:#ffedd5;}
//   .btn-punch-out{width:100%;background:#fef2f2;color:#dc2626;border:1.5px solid #fca5a5;
//     border-radius:var(--rmd);padding:12px;font-family:'DM Sans',sans-serif;
//     font-size:13px;font-weight:700;cursor:pointer;grid-column:1/-1;
//     display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;}
//   .btn-punch-out:hover{background:#fee2e2;}
//   .btn-punch-out:disabled,.btn-tea:disabled,.btn-lunch:disabled{opacity:.5;cursor:not-allowed;}

//   .spinner-sm{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.3);
//     border-top-color:#fff;animation:spin .6s linear infinite;}
//   .spinner-tea{border-color:rgba(217,119,6,.3);border-top-color:#d97706;}
//   .spinner-lunch{border-color:rgba(194,65,12,.3);border-top-color:#c2410c;}
//   .spinner-out{border-color:rgba(220,38,38,.3);border-top-color:#dc2626;}
//   @keyframes spin{to{transform:rotate(360deg);}}

//   .stat-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
//   @media(min-width:480px){.stat-tiles{grid-template-columns:repeat(3,1fr);gap:10px;}}
//   .stat-tile{display:flex;flex-direction:column;align-items:center;text-align:center;
//     padding:11px 8px;border-radius:var(--rmd);border:1px solid transparent;transition:all .15s;}
//   .stat-tile:hover{transform:translateY(-2px);box-shadow:var(--shmd);}
//   .st-icon{font-size:16px;margin-bottom:5px;}
//   .st-label{font-size:9px;color:var(--s400);font-weight:600;text-transform:uppercase;
//     letter-spacing:.04em;margin-bottom:2px;}
//   @media(min-width:480px){.st-label{font-size:10px;}}
//   .st-val{font-family:'Syne',sans-serif;font-size:clamp(13px,2.5vw,16px);font-weight:800;color:var(--t800);}

//   .timeline-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
//   .tl-dl-btn{width:27px;height:27px;border-radius:8px;background:var(--t50);
//     border:1px solid var(--t200);display:flex;align-items:center;justify-content:center;
//     color:var(--t400);cursor:pointer;font-size:12px;transition:all .15s;}
//   .tl-dl-btn:hover{background:var(--t100);color:var(--t600);}

//   .tl-scroll{max-height:280px;overflow-y:auto;padding-right:2px;}
//   .tl-scroll::-webkit-scrollbar{width:4px;}
//   .tl-scroll::-webkit-scrollbar-track{background:var(--t50);}
//   .tl-scroll::-webkit-scrollbar-thumb{background:var(--t300);border-radius:2px;}

//   .tl-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;
//     background:var(--t50);border:1px solid var(--t100);border-radius:var(--rmd);
//     margin-bottom:7px;transition:background .15s;}
//   .tl-item:last-child{margin-bottom:0;}
//   .tl-item:hover{background:var(--t100);}
//   .tl-icon{font-size:18px;flex-shrink:0;margin-top:1px;}
//   .tl-content{flex:1;min-width:0;}
//   .tl-label{font-size:12px;font-weight:700;color:var(--t800);
//     overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px;}
//   .tl-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:10px;color:var(--s400);}
//   .tl-badge{padding:2px 6px;border-radius:10px;font-size:9px;font-weight:600;}
//   .tl-badge-tea{background:#fffbeb;color:#d97706;}
//   .tl-badge-lunch{background:#fff7ed;color:#c2410c;}
//   .tl-badge-overdue{background:#fef2f2;color:#dc2626;}
//   .tl-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:5px;}

//   .summary-section{margin-top:16px;padding-top:16px;border-top:1px solid var(--t100);}
//   .summary-label{font-size:10px;font-weight:700;color:var(--t600);text-transform:uppercase;
//     letter-spacing:.06em;margin-bottom:10px;}
//   .summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
//   .sum-row{display:flex;align-items:center;justify-content:space-between;
//     font-size:11px;padding:4px 0;}
//   .sum-key{color:var(--s400);}
//   .sum-val{font-weight:700;color:var(--t700);}

//   .qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
//   @media(min-width:480px){.qa-grid{gap:10px;}}
//   .qa-btn{display:flex;align-items:center;justify-content:center;gap:7px;
//     padding:11px 10px;border-radius:var(--rmd);font-family:'DM Sans',sans-serif;
//     font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;border:1.5px solid transparent;}
//   @media(min-width:480px){.qa-btn{font-size:12px;padding:12px 10px;}}
//   .qa-btn:hover{transform:translateY(-1px);box-shadow:var(--shmd);}

//   .idle-overlay{position:fixed;inset:0;background:rgba(15,118,110,.25);
//     backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;
//     padding:16px;z-index:50;}
//   .idle-modal{background:var(--sur);border:1px solid var(--t100);border-radius:var(--rlg);
//     box-shadow:var(--shlg);padding:24px;max-width:340px;width:100%;text-align:center;}
//   .idle-icon-wrap{width:56px;height:56px;background:#fef9c3;border:1.5px solid #fde68a;
//     border-radius:16px;display:flex;align-items:center;justify-content:center;
//     margin:0 auto 14px;font-size:22px;}
//   .idle-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:var(--t800);margin:0 0 4px;}
//   .idle-sub{font-size:12px;color:var(--s500);margin:0 0 3px;}
//   .idle-time{font-size:11px;color:var(--s400);margin:0 0 8px;}
//   .idle-cta{font-size:12px;font-weight:700;color:var(--t600);margin:0 0 16px;}
//   .idle-btn{width:100%;background:linear-gradient(135deg,var(--t500),var(--t600));color:#fff;
//     border:none;border-radius:var(--rmd);padding:12px;
//     font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;
//     transition:all .2s;box-shadow:0 4px 12px rgba(13,148,136,.28);}
//   .idle-btn:hover{background:linear-gradient(135deg,var(--t400),var(--t500));}

//   .empty{text-align:center;padding:40px 16px;}
//   .empty-icon{font-size:32px;color:var(--t200);margin-bottom:10px;}
//   .empty-title{font-size:13px;font-weight:600;color:var(--s500);margin:0 0 4px;}
//   .empty-sub{font-size:11px;color:var(--s400);margin:0;}
  
//   .user-info-bar{background:white;border-radius:var(--rmd);padding:12px 16px;margin-bottom:16px;
//     border:1px solid rgba(20,184,166,.15);display:flex;align-items:center;justify-content:space-between;
//     flex-wrap:wrap;gap:10px;}
//   .user-details{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
//   .user-name{font-weight:700;color:var(--t800);font-size:14px;}
//   .user-role{font-size:12px;color:var(--s500);background:var(--t50);padding:2px 8px;border-radius:12px;}
//   .logout-btn{background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;padding:6px 12px;
//     border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;}
//   .logout-btn:hover{background:#fee2e2;}

//   .error-toast{position:fixed;top:20px;right:20px;background:#dc2626;color:white;
//     padding:12px 16px;border-radius:12px;font-size:13px;font-weight:500;
//     display:flex;align-items:center;gap:12px;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,.15);
//     animation:slideIn 0.3s ease;}
//   @keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
  
//   .break-timer{font-size:11px;color:var(--t600);background:var(--t100);padding:2px 8px;
//     border-radius:12px;margin-left:8px;font-weight:600;}
// `;

// const StaffPunchInOut = () => {
//   const navigate = useNavigate();
//   const [staffDetails, setStaffDetails] = useState(null);
//   const [employeeId, setEmployeeId] = useState('');
//   const [authToken, setAuthToken] = useState('');
//   const [sessionId, setSessionId] = useState(null);
//   const [breakInfo, setBreakInfo] = useState(null);
  
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [punchStatus, setPunchStatus] = useState('out');
//   const [todayRecords, setTodayRecords] = useState([]);
//   const [location, setLocation] = useState('Office');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showIdlePopup, setShowIdlePopup] = useState(false);
//   const [idleTime, setIdleTime] = useState(0);
//   const [error, setError] = useState('');
//   const [workStats, setWorkStats] = useState({ 
//     totalHours: 0, 
//     effectiveHours: 0, 
//     idleTime: 0, 
//     teaBreakCount: 0, 
//     lunchBreakCount: 0,
//     totalBreakHours: 0,
//     productivity: 0
//   });

//   const idleTimerRef = useRef(null);
//   const activityTimerRef = useRef(null);
//   const heartbeatIntervalRef = useRef(null);
//   const punchInTimeRef = useRef(null);
//   const idleTimeRef = useRef(0);
//   const lastActivityTimeRef = useRef(Date.now());

//   // Check authentication on mount
//   useEffect(() => {
//     const storedDetails = sessionStorage.getItem('staffDetails');
//     if (!storedDetails) {
//       navigate('/login');
//       return;
//     }
    
//     const details = JSON.parse(storedDetails);
//     if (!details.token || !details.user) {
//       sessionStorage.removeItem('staffDetails');
//       navigate('/login');
//       return;
//     }
    
//     setStaffDetails(details.user);
//     setEmployeeId(details.user.employeeId);
//     setAuthToken(details.token);
    
//     // Load initial data
//     loadTodayTimeline(details.token, details.user.employeeId);
//     checkCurrentStatus(details.token, details.user.employeeId);
//   }, [navigate]);

//   // API helper with auth
//   const apiCall = async (endpoint, method = 'GET', body = null) => {
//     try {
//       const options = {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authToken}`
//         },
//       };
//       if (body) options.body = JSON.stringify(body);
      
//       const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
//       const data = await response.json();
      
//       if (!data.success) {
//         if (response.status === 401) {
//           sessionStorage.removeItem('staffDetails');
//           navigate('/login');
//         }
//         throw new Error(data.message || 'API call failed');
//       }
//       return data;
//     } catch (error) {
//       console.error('API Error:', error);
//       setError(error.message);
//       throw error;
//     }
//   };

//   // Load today's timeline from backend
//   const loadTodayTimeline = async (token, empId) => {
//     try {
//       const data = await apiCall(`/work-session/timeline/${empId}`, 'GET', null);
//       if (data.success && data.data) {
//         // Transform timeline data for display
//         const timeline = [];
        
//         // Add work start
//         if (data.data.timeline) {
//           data.data.timeline.forEach((item, index) => {
//             if (item.type === 'work_start') {
//               timeline.push({
//                 id: `work-start-${index}`,
//                 type: 'in',
//                 title: 'Punched In — Work Started',
//                 time: item.formattedTime,
//                 location: item.location || 'Office',
//                 status: 'completed',
//                 icon: '💼'
//               });
//             } else if (item.type === 'break') {
//               timeline.push({
//                 id: `break-${index}`,
//                 type: item.title === 'Tea Break' ? 'tea_break' : 'lunch_break',
//                 title: item.title,
//                 time: item.formattedTime,
//                 endTime: item.formattedEndTime,
//                 location: item.location,
//                 duration: item.duration,
//                 expectedDuration: item.expectedDuration,
//                 isOverdue: item.isOverdue,
//                 overdueMinutes: item.overdueMinutes,
//                 status: 'completed',
//                 icon: item.icon
//               });
//             } else if (item.type === 'work_end') {
//               timeline.push({
//                 id: `work-end-${index}`,
//                 type: 'out',
//                 title: 'Punched Out — Work Ended',
//                 time: item.formattedTime,
//                 location: item.location || 'Office',
//                 status: 'completed',
//                 icon: '🏁'
//               });
//             }
//           });
//         }
        
//         setTodayRecords(timeline);
        
//         // Update work stats from summary
//         if (data.data.summary) {
//           const totalWorkHours = parseFloat(data.data.summary.totalWorkHours) || 0;
//           const totalBreakHours = parseFloat(data.data.summary.totalBreakHours) || 0;
//           const totalIdleTime = data.data.summary.idleTime || 0;
//           const productivity = data.data.summary.productivity || 0;
          
//           setWorkStats({
//             totalHours: totalWorkHours + totalBreakHours,
//             effectiveHours: totalWorkHours,
//             idleTime: totalIdleTime,
//             teaBreakCount: data.data.breaks?.filter(b => b.title === 'Tea Break').length || 0,
//             lunchBreakCount: data.data.breaks?.filter(b => b.title === 'Lunch Break').length || 0,
//             totalBreakHours: totalBreakHours,
//             productivity: productivity
//           });
//         }
//       }
//     } catch (error) {
//       console.error('Error loading timeline:', error);
//     }
//   };

//   // Check current work status
//   const checkCurrentStatus = async (token, empId) => {
//     try {
//       const data = await apiCall(`/work-session/summary/${empId}`, 'GET', null);
//       if (data.success && data.data) {
//         if (data.data.status === 'working' || data.data.status === 'idle' || data.data.status === 'on_break') {
//           setPunchStatus('in');
//           punchInTimeRef.current = new Date(data.data.startTime).getTime();
//           startHeartbeat();
          
//           // Check if on break
//           if (data.data.status === 'on_break') {
//             setPunchStatus('break');
//             // Fetch break info from active employees endpoint or separate call
//             await checkBreakStatus(token, empId);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error checking status:', error);
//     }
//   };

//   // Check break status
//   const checkBreakStatus = async (token, empId) => {
//     try {
//       const data = await apiCall(`/work-session/check-idle/${empId}`, 'GET', null);
//       if (data.success && data.breakInfo) {
//         setBreakInfo(data.breakInfo);
//       }
//     } catch (error) {
//       console.error('Error checking break:', error);
//     }
//   };

//   // Start heartbeat for activity tracking
//   const startHeartbeat = () => {
//     if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    
//     heartbeatIntervalRef.current = setInterval(async () => {
//       if (punchStatus === 'in' && !breakInfo) {
//         try {
//           const now = Date.now();
//           const timeSinceLastActivity = (now - lastActivityTimeRef.current) / 1000;
//           const isIdle = timeSinceLastActivity > 60;
          
//           await apiCall('/work-session/heartbeat', 'POST', {
//             employeeId,
//             isIdle: isIdle
//           });
//         } catch (error) {
//           console.error('Heartbeat error:', error);
//         }
//       }
//     }, 30000);
//   };

//   // Handle Punch In
//   const handlePunchIn = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/work-session/start', 'POST', {
//         employeeId,
//         notes: `Started from ${location}`
//       });
      
//       setPunchStatus('in');
//       setSessionId(data.data.sessionId);
//       punchInTimeRef.current = new Date(data.data.startTime).getTime();
//       startHeartbeat();
//       await loadTodayTimeline(authToken, employeeId);
      
//     } catch (error) {
//       console.error('Punch In Error:', error);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle Punch Out
//   const handlePunchOut = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       await apiCall('/work-session/end-work', 'POST', { employeeId });
      
//       setPunchStatus('out');
//       setSessionId(null);
//       setBreakInfo(null);
//       punchInTimeRef.current = null;
      
//       if (heartbeatIntervalRef.current) {
//         clearInterval(heartbeatIntervalRef.current);
//         heartbeatIntervalRef.current = null;
//       }
      
//       await loadTodayTimeline(authToken, employeeId);
      
//     } catch (error) {
//       console.error('Punch Out Error:', error);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle Break
//   const handleBreak = async (breakType) => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const data = await apiCall('/work-session/start-break', 'POST', {
//         employeeId,
//         breakType: breakType === 'tea_break' ? 'tea' : 'lunch'
//       });
      
//       setPunchStatus('break');
//       setBreakInfo({
//         breakType: data.data.breakType,
//         breakEndTime: data.data.breakEndTime,
//         breakDuration: data.data.breakDuration
//       });
      
//       await loadTodayTimeline(authToken, employeeId);
      
//     } catch (error) {
//       console.error('Break Error:', error);
//       setError(error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Activity tracking for idle detection
//   useEffect(() => {
//     const handleActivity = () => {
//       lastActivityTimeRef.current = Date.now();
//       setShowIdlePopup(false);
//       setIdleTime(0);
      
//       if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
//       idleTimerRef.current = setTimeout(() => {
//         if (punchStatus === 'in' && !breakInfo) {
//           setShowIdlePopup(true);
//           startIdleTracking();
//         }
//       }, 60000);
//     };
    
//     ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'].forEach(e => 
//       window.addEventListener(e, handleActivity)
//     );
    
//     handleActivity();
    
//     return () => {
//       ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'].forEach(e => 
//         window.removeEventListener(e, handleActivity)
//       );
//       if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
//       if (activityTimerRef.current) clearInterval(activityTimerRef.current);
//       if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
//     };
//   }, [punchStatus, breakInfo]);

//   const startIdleTracking = () => {
//     if (activityTimerRef.current) clearInterval(activityTimerRef.current);
//     activityTimerRef.current = setInterval(() => {
//       const idleSeconds = Math.floor((Date.now() - lastActivityTimeRef.current) / 1000);
//       if (idleSeconds > 60) {
//         setIdleTime(idleSeconds - 60);
//       }
//     }, 1000);
//   };

//   const handleResumeWork = async () => {
//     setShowIdlePopup(false);
//     setIdleTime(0);
//     lastActivityTimeRef.current = Date.now();
    
//     try {
//       await apiCall('/work-session/heartbeat', 'POST', {
//         employeeId,
//         isIdle: false
//       });
//     } catch (error) {
//       console.error('Error reporting activity:', error);
//     }
//   };

//   const handleLogout = () => {
//     sessionStorage.removeItem('staffDetails');
//     navigate('/login');
//   };

//   // Update current time and work stats
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
      
//       if (punchStatus === 'in' && punchInTimeRef.current && !breakInfo) {
//         const totalMs = Date.now() - punchInTimeRef.current;
//         const totalHours = totalMs / 3_600_000;
//         const effectiveHours = (totalMs - idleTimeRef.current) / 3_600_000;
        
//         setWorkStats(prev => ({
//           ...prev,
//           totalHours: totalHours.toFixed(2),
//           effectiveHours: effectiveHours.toFixed(2),
//         }));
//       }
      
//       // Update break timer if on break
//       if (breakInfo && breakInfo.breakEndTime) {
//         const remaining = Math.ceil((new Date(breakInfo.breakEndTime) - new Date()) / 60000);
//         if (remaining <= 0) {
//           // Break should have ended, refresh status
//           checkCurrentStatus(authToken, employeeId);
//           setBreakInfo(null);
//           setPunchStatus('in');
//         }
//       }
//     }, 1000);
    
//     return () => clearInterval(timer);
//   }, [punchStatus, breakInfo, authToken, employeeId]);

//   const efficiency = workStats.productivity || (workStats.totalHours > 0 
//     ? Math.round((workStats.effectiveHours / workStats.totalHours) * 100) 
//     : 0);

//   const statTiles = [
//     { icon:<FiClock style={{color:'var(--t500)'}}/>, label:'Total Hours', val:`${workStats.totalHours}h`, bg:'var(--t50)', border:'var(--t100)' },
//     { icon:<FiUser style={{color:'#16a34a'}}/>, label:'Effective Hrs', val:`${workStats.effectiveHours}h`, bg:'#f0fdf4', border:'#bbf7d0' },
//     { icon:<FiAlertCircle style={{color:'#dc2626'}}/>, label:'Idle Time', val:`${Math.floor(workStats.idleTime)}m`, bg:'#fef2f2', border:'#fca5a5' },
//     { icon:<FiCoffee style={{color:'#d97706'}}/>, label:'Tea Breaks', val:workStats.teaBreakCount, bg:'#fffbeb', border:'#fde68a' },
//     { icon:<FiSun style={{color:'#c2410c'}}/>, label:'Lunch Breaks', val:workStats.lunchBreakCount, bg:'#fff7ed', border:'#fed7aa' },
//     { icon:<FiZap style={{color:'var(--t500)'}}/>, label:'Efficiency', val:`${efficiency}%`, bg:'var(--t50)', border:'var(--t100)' },
//   ];

//   const summaryRows = [
//     { key:'Work Started', val: todayRecords.find(r=>r.type==='in')?.time||'--:--' },
//     { key:'Work Ended', val: todayRecords.find(r=>r.type==='out')?.time||'--:--' },
//     { key:'Total Breaks', val: workStats.teaBreakCount + workStats.lunchBreakCount },
//     { key:'Break Hours', val: `${workStats.totalBreakHours}h` },
//     { key:'Productivity', val:`${efficiency}%`, color:'var(--t600)' },
//     { key:'Idle Time', val:`${Math.floor(workStats.idleTime)} mins`, color:'#dc2626' },
//   ];

//   const getStatusText = () => {
//     if (punchStatus === 'out') return 'Not Working';
//     if (punchStatus === 'break') return 'On Break';
//     if (breakInfo) return 'On Break';
//     return 'Working';
//   };

//   const getBreakRemainingText = () => {
//     if (breakInfo && breakInfo.breakEndTime) {
//       const remaining = Math.ceil((new Date(breakInfo.breakEndTime) - new Date()) / 60000);
//       if (remaining > 0) {
//         return `${remaining} min remaining`;
//       }
//       return 'Break ended';
//     }
//     return '';
//   };

//   return (
//     <div className="pio-root">
//       <style>{style}</style>

//       {error && (
//         <div className="error-toast">
//           <FiAlertCircle />
//           <span>{error}</span>
//           <button onClick={() => setError('')} style={{background:'transparent',border:'none',color:'white',cursor:'pointer',marginLeft:'auto'}}>×</button>
//         </div>
//       )}

//       {showIdlePopup && (
//         <div className="idle-overlay">
//           <div className="idle-modal">
//             <div className="idle-icon-wrap"><FiAlertCircle style={{color:'#d97706',fontSize:24}}/></div>
//             <h3 className="idle-title">Hey there! 👋</h3>
//             <p className="idle-sub">You seem to be away from your desk</p>
//             <p className="idle-time">Idle for: {Math.floor(idleTime/60)}m {idleTime%60}s</p>
//             <p className="idle-cta">Time to get back to work! 🚀</p>
//             <button className="idle-btn" onClick={handleResumeWork}>
//               I'm Back! Let's Work 💪
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="pio-hdr">
//         <h1 className="pio-title">Smart Attendance System</h1>
//         <p className="pio-sub">Track your work hours with intelligent idle detection</p>
//       </div>

//       {/* User Info Bar */}
//       <div className="user-info-bar">
//         <div className="user-details">
//           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold" style={{width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold'}}>
//             {staffDetails?.employeeName?.charAt(0)}
//           </div>
//           <div>
//             <div className="user-name">{staffDetails?.employeeName}</div>
//             <div className="user-role">{staffDetails?.role} • {employeeId}</div>
//           </div>
//         </div>
//         <button onClick={handleLogout} className="logout-btn">
//           Logout
//         </button>
//       </div>

//       <div className="pio-grid">
//         {/* LEFT */}
//         <div>
//           <div className="card" style={{marginBottom:16}}>
//             <div className="status-row">
//               <div className="sec-title" style={{margin:0}}><span className="sec-icon"><FiClock/></span>Current Status</div>
//               <span className={`status-pill ${punchStatus==='in'?'sp-in':punchStatus==='break'?'sp-break':'sp-out'}`}>
//                 {getStatusText()}
//                 {breakInfo && <span className="break-timer">{getBreakRemainingText()}</span>}
//               </span>
//             </div>

//             <div className="clock-wrap">
//               <div className="clock-time">
//                 {currentTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
//               </div>
//               <p className="clock-date">
//                 {currentTime.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
//               </p>
//             </div>

//             <div className="location-row">
//               <FiMapPin style={{color:'var(--t400)',flexShrink:0}}/>
//               <span className="loc-label">Location:</span>
//               <select className="loc-select" value={location} onChange={e=>setLocation(e.target.value)}>
//                 <option value="Office">Office</option>
//                 <option value="Work From Home">Work From Home</option>
//                 <option value="Client Site">Client Site</option>
//               </select>
//             </div>

//             {punchStatus === 'out' ? (
//               <button className="btn-punch-in" onClick={handlePunchIn} disabled={isLoading}>
//                 {isLoading ? <div className="spinner-sm"/> : <FiClock style={{fontSize:14}}/>}
//                 START WORKING 🚀
//               </button>
//             ) : (
//               <div className="break-grid">
//                 <button className="btn-tea" onClick={()=>handleBreak('tea_break')} disabled={isLoading || punchStatus === 'break'}>
//                   {isLoading?<div className="spinner-sm spinner-tea"/>:<FiCoffee/>} Tea Break
//                 </button>
//                 <button className="btn-lunch" onClick={()=>handleBreak('lunch_break')} disabled={isLoading || punchStatus === 'break'}>
//                   {isLoading?<div className="spinner-sm spinner-lunch"/>:<FiSun/>} Lunch Break
//                 </button>
//                 <button className="btn-punch-out" onClick={handlePunchOut} disabled={isLoading}>
//                   {isLoading?<div className="spinner-sm spinner-out"/>:<FiCheckCircle/>} END WORK DAY
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="card">
//             <h3 className="sec-title"><span className="sec-icon"><FiBarChart2/></span>Work Analytics</h3>
//             <div className="stat-tiles">
//               {statTiles.map((t,i)=>(
//                 <div key={i} className="stat-tile" style={{background:t.bg,borderColor:t.border}}>
//                   <div className="st-icon">{t.icon}</div>
//                   <div className="st-label">{t.label}</div>
//                   <div className="st-val">{t.val}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div>
//           <div className="card" style={{marginBottom:16}}>
//             <div className="timeline-hdr">
//               <h3 className="sec-title" style={{margin:0}}><span className="sec-icon"><FiCalendar/></span>Today's Timeline</h3>
//               <button className="tl-dl-btn" onClick={() => {
//                 const dataStr = JSON.stringify(todayRecords, null, 2);
//                 const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//                 const exportFileDefaultName = `attendance_${employeeId}_${new Date().toISOString().split('T')[0]}.json`;
//                 const linkElement = document.createElement('a');
//                 linkElement.setAttribute('href', dataUri);
//                 linkElement.setAttribute('download', exportFileDefaultName);
//                 linkElement.click();
//               }}><FiDownload/></button>
//             </div>
//             <div className="tl-scroll">
//               {todayRecords.length > 0 ? todayRecords.map(rec => (
//                 <div key={rec.id} className="tl-item">
//                   <div className="tl-icon">{rec.icon}</div>
//                   <div className="tl-content">
//                     <p className="tl-label">{rec.title}</p>
//                     <div className="tl-meta">
//                       <span>🕒 {rec.time}</span>
//                       <span>📍 {rec.location}</span>
//                       {rec.duration && (
//                         <span className={`tl-badge ${rec.isOverdue ? 'tl-badge-overdue' : (rec.type === 'tea_break' ? 'tl-badge-tea' : 'tl-badge-lunch')}`}>
//                           ⏱ {rec.duration} / {rec.expectedDuration} mins
//                           {rec.isOverdue && ` (Overdue: ${rec.overdueMinutes} min)`}
//                         </span>
//                       )}
//                       {rec.endTime && <span>🏁 {rec.endTime}</span>}
//                     </div>
//                   </div>
//                   <div className="tl-dot" style={{background: rec.status==='completed'?'var(--t400)':'#f59e0b'}}/>
//                 </div>
//               )) : (
//                 <div className="empty">
//                   <div className="empty-icon"><FiClock/></div>
//                   <p className="empty-title">No activity recorded today</p>
//                   <p className="empty-sub">Start working to see your timeline</p>
//                 </div>
//               )}
//             </div>

//             <div className="summary-section">
//               <p className="summary-label">Daily Summary</p>
//               <div className="summary-grid">
//                 {summaryRows.map((r,i)=>(
//                   <div key={i} className="sum-row">
//                     <span className="sum-key">{r.key}</span>
//                     <span className="sum-val" style={r.color?{color:r.color}:{}}>{r.val}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <h3 className="sec-title"><span className="sec-icon"><FiZap/></span>Quick Actions</h3>
//             <div className="qa-grid">
//               {[
//                 { icon:<FiBarChart2/>, label:'Weekly Report', action: () => alert('Weekly Report - Coming Soon'), bg:'var(--t50)', border:'var(--t200)', color:'var(--t600)' },
//                 { icon:<FiDownload/>, label:'Export Data', action: () => {
//                   const dataStr = JSON.stringify(todayRecords, null, 2);
//                   const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
//                   const exportFileDefaultName = `attendance_${employeeId}_${new Date().toISOString().split('T')[0]}.json`;
//                   const linkElement = document.createElement('a');
//                   linkElement.setAttribute('href', dataUri);
//                   linkElement.setAttribute('download', exportFileDefaultName);
//                   linkElement.click();
//                 }, bg:'#ecfeff', border:'#a5f3fc', color:'#0e7490' },
//                 { icon:<FiUser/>, label:'My Performance', action: () => alert('Performance data coming soon'), bg:'#f0fdf4', border:'#bbf7d0', color:'#16a34a' },
//                 { icon:<FiCalendar/>, label:'Attendance History', action: () => alert('History data coming soon'), bg:'var(--t50)', border:'var(--t200)', color:'var(--t600)' },
//               ].map((a,i)=>(
//                 <button key={i} className="qa-btn" onClick={a.action}
//                   style={{background:a.bg,borderColor:a.border,color:a.color}}>
//                   <span style={{fontSize:14}}>{a.icon}</span>
//                   <span>{a.label}</span>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaffPunchInOut;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiClock, FiMapPin, FiCalendar, FiUser, FiCheckCircle,
  FiAlertCircle, FiDownload, FiBarChart2, FiCoffee, FiSun, FiZap,
} from 'react-icons/fi';

const API_BASE_URL = 'https://pmsbackend.pixelmindsolutions.com/api';

const StaffPunchInOut = () => {
  const navigate = useNavigate();
  const [staffDetails, setStaffDetails] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [breakInfo, setBreakInfo] = useState(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchStatus, setPunchStatus] = useState('out');
  const [todayRecords, setTodayRecords] = useState([]);
  const [location, setLocation] = useState('Office');
  const [isLoading, setIsLoading] = useState(false);
  const [showIdlePopup, setShowIdlePopup] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [error, setError] = useState('');
  const [workStats, setWorkStats] = useState({ 
    totalHours: 0, 
    effectiveHours: 0, 
    idleTime: 0, 
    teaBreakCount: 0, 
    lunchBreakCount: 0,
    totalBreakHours: 0,
    productivity: 0
  });

  const idleTimerRef = useRef(null);
  const activityTimerRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const punchInTimeRef = useRef(null);
  const idleTimeRef = useRef(0);
  const lastActivityTimeRef = useRef(Date.now());
  const workingSecondsRef = useRef(0);
  const lastHumanActivityReportRef = useRef(0);

  // Check authentication on mount
  useEffect(() => {
    const storedDetails = sessionStorage.getItem('staffDetails');
    if (!storedDetails) {
      navigate('/login');
      return;
    }
    
    const details = JSON.parse(storedDetails);
    if (!details.token || !details.user) {
      sessionStorage.removeItem('staffDetails');
      navigate('/login');
      return;
    }
    
    setStaffDetails(details.user);
    setEmployeeId(details.user.employeeId);
    setAuthToken(details.token);
    
    // Load initial data
    loadTodayTimeline(details.token, details.user.employeeId);
    checkCurrentStatus(details.token, details.user.employeeId);
  }, [navigate]);

  // Refresh status on tab focus / visibility
  useEffect(() => {
    const handleFocus = () => {
      const storedDetails = sessionStorage.getItem('staffDetails');
      if (!storedDetails || document.visibilityState === 'hidden') return;
      try {
        const details = JSON.parse(storedDetails);
        if (details.token && details.user?.employeeId) {
          checkCurrentStatus(details.token, details.user.employeeId);
          loadTodayTimeline(details.token, details.user.employeeId);
        }
      } catch (_) {}
    };
    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [authToken, employeeId]);

  // API helper with auth
  const apiCall = async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      };
      if (body) options.body = JSON.stringify(body);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();
      
      if (!data.success) {
        if (response.status === 401) {
          sessionStorage.removeItem('staffDetails');
          navigate('/login');
        }
        throw new Error(data.message || 'API call failed');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Load today's timeline from backend
  const loadTodayTimeline = async (token, empId) => {
    try {
      const data = await apiCall(`/work-session/timeline/${empId}`, 'GET', null);
      if (data.success && data.data) {
        // Transform timeline data for display
        const timeline = [];
        
        // Add work start
        if (data.data.timeline) {
          data.data.timeline.forEach((item, index) => {
            if (item.type === 'work_start') {
              timeline.push({
                id: `work-start-${index}`,
                type: 'in',
                title: 'Punched In — Work Started',
                time: item.formattedTime,
                location: item.location || 'Office',
                status: 'completed',
                icon: '💼'
              });
            } else if (item.type === 'break') {
              timeline.push({
                id: `break-${index}`,
                type: item.title === 'Tea Break' ? 'tea_break' : 'lunch_break',
                title: item.title,
                time: item.formattedTime,
                endTime: item.formattedEndTime,
                location: item.location,
                duration: item.duration,
                expectedDuration: item.expectedDuration,
                isOverdue: item.isOverdue,
                overdueMinutes: item.overdueMinutes,
                status: 'completed',
                icon: item.icon
              });
            } else if (item.type === 'work_end') {
              timeline.push({
                id: `work-end-${index}`,
                type: 'out',
                title: 'Punched Out — Work Ended',
                time: item.formattedTime,
                location: item.location || 'Office',
                status: 'completed',
                icon: '🏁'
              });
            }
          });
        }
        
        setTodayRecords(timeline);
        
        // Update work stats from summary
        if (data.data.summary) {
          const totalWorkHours = parseFloat(data.data.summary.totalWorkHours) || 0;
          const totalBreakHours = parseFloat(data.data.summary.totalBreakHours) || 0;
          const totalIdleTime = data.data.summary.idleTime || 0;
          const productivity = data.data.summary.productivity || 0;
          const totalWorkSec = data.data.summary.totalWorkSeconds !== undefined
            ? Number(data.data.summary.totalWorkSeconds)
            : Math.round(totalWorkHours * 3600);
          workingSecondsRef.current = totalWorkSec;
          
          setWorkStats({
            totalHours: (totalWorkHours + totalBreakHours).toFixed(2),
            effectiveHours: totalWorkHours.toFixed(2),
            idleTime: totalIdleTime,
            teaBreakCount: data.data.breaks?.filter(b => b.title === 'Tea Break').length || 0,
            lunchBreakCount: data.data.breaks?.filter(b => b.title === 'Lunch Break').length || 0,
            totalBreakHours: totalBreakHours,
            productivity: productivity
          });
        }
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  // Check current work status
  const checkCurrentStatus = async (token, empId) => {
    try {
      const data = await apiCall(`/work-session/summary/${empId}`, 'GET', null);
      if (data.success && data.data) {
        const status = String(data.data.status || '').toLowerCase();
        if (status === 'working' || status === 'idle' || status === 'on_break') {
          setPunchStatus(status === 'on_break' ? 'break' : 'in');
          punchInTimeRef.current = new Date(data.data.startTime).getTime();
          setSessionId(data.data.sessionId || null);

          // Restore exact accumulated work duration from backend
          const totalSec = data.data.totalWorkSeconds !== undefined
            ? Number(data.data.totalWorkSeconds)
            : Math.round((Number(data.data.totalWorkDuration) || 0) * 60);
          workingSecondsRef.current = totalSec;
          setWorkStats(prev => ({
            ...prev,
            effectiveHours: (totalSec / 3600).toFixed(2),
            totalHours: ((totalSec + ((Number(prev.totalBreakHours) || 0) * 3600)) / 3600).toFixed(2),
            idleTime: Number(data.data.totalIdleTime) || 0,
            totalBreakHours: Number(data.data.totalBreakHours) || 0
          }));

          startHeartbeat();

          if (status === 'idle') {
            setShowIdlePopup(true);
          } else {
            setShowIdlePopup(false);
          }

          // Check if on break
          if (status === 'on_break') {
            await checkBreakStatus(token, empId);
          }
        } else if (status === 'completed') {
          setPunchStatus('out');
          setShowIdlePopup(false);
          punchInTimeRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  // Check break status
  const checkBreakStatus = async (token, empId) => {
    try {
      const data = await apiCall(`/work-session/check-idle/${empId}`, 'GET', null);
      if (data.success && data.breakInfo) {
        setBreakInfo(data.breakInfo);
      }
    } catch (error) {
      console.error('Error checking break:', error);
    }
  };

  // Start heartbeat for activity tracking
  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    
    heartbeatIntervalRef.current = setInterval(async () => {
      if (punchStatus === 'in' && !breakInfo) {
        try {
          const now = Date.now();
          const timeSinceLastActivity = (now - lastActivityTimeRef.current) / 1000;
          const isIdle = timeSinceLastActivity > 60;
          
          await apiCall('/work-session/heartbeat', 'POST', {
            employeeId,
            isIdle: isIdle,
            activityType: 'heartbeat'
          });
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }
    }, 30000);
  };

  // Handle Punch In
  const handlePunchIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiCall('/work-session/start', 'POST', {
        employeeId,
        notes: `Started from ${location}`
      });
      
      setPunchStatus('in');
      setSessionId(data.data.sessionId);
      punchInTimeRef.current = new Date(data.data.startTime).getTime();
      const initialSec = data.data.totalWorkSeconds !== undefined
        ? Number(data.data.totalWorkSeconds)
        : Math.round((Number(data.data.totalWorkDuration) || 0) * 60);
      workingSecondsRef.current = initialSec;
      startHeartbeat();
      await loadTodayTimeline(authToken, employeeId);
      
    } catch (error) {
      console.error('Punch In Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Punch Out
  const handlePunchOut = async () => {
    setIsLoading(true);
    setError('');
    try {
      await apiCall('/work-session/end-work', 'POST', { employeeId });
      
      setPunchStatus('out');
      setSessionId(null);
      setBreakInfo(null);
      punchInTimeRef.current = null;
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      await loadTodayTimeline(authToken, employeeId);
      
    } catch (error) {
      console.error('Punch Out Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Break
  const handleBreak = async (breakType) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiCall('/work-session/start-break', 'POST', {
        employeeId,
        breakType: breakType === 'tea_break' ? 'tea' : 'lunch',
        durationMinutes: breakType === 'tea_break' ? 15 : 45
      });
      
      setPunchStatus('break');
      setBreakInfo({
        breakType: data.data.breakType,
        breakEndTime: data.data.breakEndTime,
        breakDuration: data.data.breakDuration
      });
      
      await loadTodayTimeline(authToken, employeeId);
      
    } catch (error) {
      console.error('Break Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Activity tracking for idle detection (keyboard + mouse)
  useEffect(() => {
    const handleActivity = async () => {
      const now = Date.now();
      lastActivityTimeRef.current = now;

      // When user is idle or popup is open, report human activity to backend
      if (showIdlePopup && punchStatus === 'in' && !breakInfo) {
        if (now - lastHumanActivityReportRef.current >= 1500 && employeeId && authToken) {
          lastHumanActivityReportRef.current = now;
          try {
            const res = await apiCall('/work-session/report-idle', 'POST', {
              employeeId,
              activityType: 'human'
            });
            if (res?.success) {
              setShowIdlePopup(false);
              setIdleTime(0);
              if (res.data?.totalWorkSeconds !== undefined) {
                workingSecondsRef.current = res.data.totalWorkSeconds;
              } else if (res.data?.totalWorkDuration !== undefined) {
                workingSecondsRef.current = Math.round(res.data.totalWorkDuration * 60);
              }
            }
          } catch (err) {
            console.error('Error reporting human activity:', err);
          }
        }
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (punchStatus === 'in' && !breakInfo) {
          setShowIdlePopup(true);
          startIdleTracking();
        }
      }, 60000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'keyup', 'click', 'scroll', 'touchstart'];
    events.forEach(e =>
      window.addEventListener(e, handleActivity, { passive: true })
    );
    const removeGlobalKeyboardListener = window.electronAPI?.onGlobalKeyboardActivity?.(handleActivity);

    return () => {
      events.forEach(e =>
        window.removeEventListener(e, handleActivity, { passive: true })
      );
      if (typeof removeGlobalKeyboardListener === 'function') removeGlobalKeyboardListener();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (activityTimerRef.current) clearInterval(activityTimerRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [punchStatus, breakInfo, showIdlePopup, employeeId, authToken]);

  const startIdleTracking = () => {
    if (activityTimerRef.current) clearInterval(activityTimerRef.current);
    activityTimerRef.current = setInterval(() => {
      const idleSeconds = Math.floor((Date.now() - lastActivityTimeRef.current) / 1000);
      if (idleSeconds > 60) {
        setIdleTime(idleSeconds - 60);
      }
    }, 1000);
  };

  const handleResumeWork = async () => {
    setShowIdlePopup(false);
    setIdleTime(0);
    lastActivityTimeRef.current = Date.now();

    try {
      const data = await apiCall('/work-session/handle-idle', 'POST', {
        employeeId,
        action: 'continue'
      });
      if (data?.data) {
        if (data.data.totalWorkSeconds !== undefined) {
          workingSecondsRef.current = data.data.totalWorkSeconds;
        } else if (data.data.totalWorkDuration !== undefined) {
          workingSecondsRef.current = Math.round(data.data.totalWorkDuration * 60);
        }
      }
      setPunchStatus('in');
    } catch (error) {
      console.error('Error resuming work:', error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('staffDetails');
    navigate('/login');
  };

  // Update current time and work stats
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Increment work timer only when actively working (not idle, not on break)
      if (punchStatus === 'in' && !showIdlePopup && !breakInfo) {
        workingSecondsRef.current += 1;
        const totalSec = workingSecondsRef.current;
        const effHours = (totalSec / 3600).toFixed(2);

        setWorkStats(prev => ({
          ...prev,
          effectiveHours: effHours,
          totalHours: ((totalSec + ((parseFloat(prev.totalBreakHours) || 0) * 3600)) / 3600).toFixed(2),
        }));
      }

      // Update break timer if on break
      if (breakInfo && breakInfo.breakEndTime) {
        const remaining = Math.ceil((new Date(breakInfo.breakEndTime) - new Date()) / 60000);
        if (remaining <= 0) {
          checkCurrentStatus(authToken, employeeId);
          setBreakInfo(null);
          setPunchStatus('in');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [punchStatus, showIdlePopup, breakInfo, authToken, employeeId]);

  const efficiency = workStats.productivity || (workStats.totalHours > 0 
    ? Math.round((workStats.effectiveHours / workStats.totalHours) * 100) 
    : 0);

  const statTiles = [
    { icon:<FiClock className="text-teal-500"/>, label:'Total Hours', val:`${workStats.totalHours}h`, bg:'bg-teal-50', border:'border-teal-100' },
    { icon:<FiUser className="text-green-600"/>, label:'Effective Hrs', val:`${workStats.effectiveHours}h`, bg:'bg-green-50', border:'border-green-100' },
    { icon:<FiAlertCircle className="text-red-600"/>, label:'Idle Time', val:`${Math.floor(workStats.idleTime)}m`, bg:'bg-red-50', border:'border-red-200' },
    { icon:<FiCoffee className="text-amber-500"/>, label:'Tea Breaks', val:workStats.teaBreakCount, bg:'bg-amber-50', border:'border-amber-200' },
    { icon:<FiSun className="text-orange-600"/>, label:'Lunch Breaks', val:workStats.lunchBreakCount, bg:'bg-orange-50', border:'border-orange-200' },
    { icon:<FiZap className="text-teal-500"/>, label:'Efficiency', val:`${efficiency}%`, bg:'bg-teal-50', border:'border-teal-100' },
  ];

  const summaryRows = [
    { key:'Work Started', val: todayRecords.find(r=>r.type==='in')?.time||'--:--' },
    { key:'Work Ended', val: todayRecords.find(r=>r.type==='out')?.time||'--:--' },
    { key:'Total Breaks', val: workStats.teaBreakCount + workStats.lunchBreakCount },
    { key:'Break Hours', val: `${workStats.totalBreakHours}h` },
    { key:'Productivity', val:`${efficiency}%`, color:'text-teal-600' },
    { key:'Idle Time', val:`${Math.floor(workStats.idleTime)} mins`, color:'text-red-600' },
  ];

  const getStatusText = () => {
    if (punchStatus === 'out') return 'Not Working';
    if (punchStatus === 'break') return 'On Break';
    if (breakInfo) return 'On Break';
    return 'Working';
  };

  const getBreakRemainingText = () => {
    if (breakInfo && breakInfo.breakEndTime) {
      const remaining = Math.ceil((new Date(breakInfo.breakEndTime) - new Date()) / 60000);
      if (remaining > 0) {
        return `${remaining} min remaining`;
      }
      return 'Break ended';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-50/90 to-emerald-50/60 relative overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-7 lg:px-10 lg:py-9 max-w-7xl mx-auto">
      {/* Background decorative elements */}
      <div className="fixed -top-44 -right-44 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed -bottom-36 -left-36 w-80 h-80 bg-teal-600/5 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="relative z-10">
        {error && (
          <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 shadow-lg animate-slide-in">
            <FiAlertCircle />
            <span>{error}</span>
            <button onClick={() => setError('')} className="bg-transparent border-none text-white cursor-pointer ml-auto hover:opacity-80">×</button>
          </div>
        )}

        {showIdlePopup && (
          <div className="fixed inset-0 bg-teal-800/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl border border-teal-100 shadow-xl p-6 max-w-sm w-full text-center">
              <div className="w-14 h-14 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="text-amber-600 text-2xl" />
              </div>
              <h3 className="font-syne font-extrabold text-teal-800 text-base mb-1">Hey there! 👋</h3>
              <p className="text-sm text-slate-500 mb-1">You seem to be away from your desk</p>
              <p className="text-xs text-slate-400 mb-2">Idle for: {Math.floor(idleTime/60)}m {idleTime%60}s</p>
              <p className="text-sm font-bold text-teal-600 mb-4">Time to get back to work! 🚀</p>
              <button 
                onClick={handleResumeWork}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200"
              >
                I'm Back to Cart
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-5">
          <h1 className="font-syne font-extrabold text-xl sm:text-2xl md:text-3xl text-teal-800 tracking-tight mb-1">
            Smart Attendance System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Track your work hours with intelligent idle detection</p>
        </div>

        {/* User Info Bar */}
        <div className="bg-white rounded-xl border border-teal-200/50 shadow-sm p-3 md:p-4 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
              {staffDetails?.employeeName?.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-teal-800 text-sm md:text-base">{staffDetails?.employeeName}</div>
              <div className="text-xs text-slate-500">{staffDetails?.role} • {employeeId}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* LEFT COLUMN */}
          <div>
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-teal-200/40 shadow-md p-4 md:p-5 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                    <FiClock className="text-teal-600 text-xs" />
                  </div>
                  <h3 className="font-syne font-bold text-teal-800 text-sm">Current Status</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  punchStatus === 'in' ? 'bg-teal-50 text-teal-600 border-teal-200' : 
                  punchStatus === 'break' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                  'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {getStatusText()}
                  {breakInfo && <span className="ml-2 text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full text-[10px] font-semibold">{getBreakRemainingText()}</span>}
                </span>
              </div>

              {/* Clock */}
              <div className="text-center mb-4">
                <div className="font-syne font-extrabold text-4xl sm:text-5xl text-teal-800 tracking-tighter tabular-nums">
                  {currentTime.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {currentTime.toLocaleDateString('en-US', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl p-2.5 mb-4">
                <FiMapPin className="text-teal-400 shrink-0" />
                <span className="text-xs font-semibold text-teal-500 shrink-0">Location:</span>
                <select 
                  className="flex-1 bg-transparent text-teal-700 text-xs font-semibold outline-none cursor-pointer"
                  value={location} 
                  onChange={e=>setLocation(e.target.value)}
                >
                  <option value="Office">Office</option>
                  <option value="Work From Home">Work From Home</option>
                  <option value="Client Site">Client Site</option>
                </select>
              </div>

              {/* Action Buttons */}
              {punchStatus === 'out' ? (
                <button 
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  onClick={handlePunchIn} 
                  disabled={isLoading}
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <FiClock className="text-sm"/>}
                  START WORKING 🚀
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-all disabled:opacity-50"
                    onClick={()=>handleBreak('tea_break')} 
                    disabled={isLoading || punchStatus === 'break'}
                  >
                    {isLoading ? <div className="w-3 h-3 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin"/> : <FiCoffee size={14}/>} Tea Break
                  </button>
                  <button 
                    className="bg-orange-50 text-orange-700 border border-orange-200 rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-orange-100 transition-all disabled:opacity-50"
                    onClick={()=>handleBreak('lunch_break')} 
                    disabled={isLoading || punchStatus === 'break'}
                  >
                    {isLoading ? <div className="w-3 h-3 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"/> : <FiSun size={14}/>} Lunch Break
                  </button>
                  <button 
                    className="col-span-2 bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-all disabled:opacity-50"
                    onClick={handlePunchOut} 
                    disabled={isLoading}
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"/> : <FiCheckCircle size={14}/>} END WORK DAY
                  </button>
                </div>
              )}
            </div>

            {/* Work Analytics Card */}
            <div className="bg-white rounded-2xl border border-teal-200/40 shadow-md p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                  <FiBarChart2 className="text-teal-600 text-xs" />
                </div>
                <h3 className="font-syne font-bold text-teal-800 text-sm">Work Analytics</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statTiles.map((t,i)=>(
                  <div key={i} className={`${t.bg} border ${t.border} rounded-xl p-3 text-center hover:-translate-y-0.5 transition-all`}>
                    <div className="text-base mb-1 flex justify-center">{t.icon}</div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{t.label}</div>
                    <div className="font-syne font-extrabold text-sm md:text-base text-teal-800">{t.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {/* Today's Timeline Card */}
            <div className="bg-white rounded-2xl border border-teal-200/40 shadow-md p-4 md:p-5 mb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                    <FiCalendar className="text-teal-600 text-xs" />
                  </div>
                  <h3 className="font-syne font-bold text-teal-800 text-sm">Today's Timeline</h3>
                </div>
                <button 
                  className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-400 hover:bg-teal-100 hover:text-teal-600 transition-all"
                  onClick={() => {
                    const dataStr = JSON.stringify(todayRecords, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `attendance_${employeeId}_${new Date().toISOString().split('T')[0]}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                >
                  <FiDownload size={12} />
                </button>
              </div>
              
              <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {todayRecords.length > 0 ? todayRecords.map(rec => (
                  <div key={rec.id} className="flex items-start gap-2.5 p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl hover:bg-teal-100/70 transition-colors">
                    <div className="text-lg shrink-0">{rec.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-teal-800 truncate">{rec.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>🕒 {rec.time}</span>
                        <span>📍 {rec.location}</span>
                        {rec.duration && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                            rec.isOverdue ? 'bg-red-100 text-red-600' : 
                            rec.type === 'tea_break' ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            ⏱ {rec.duration} / {rec.expectedDuration} mins
                            {rec.isOverdue && ` (Overdue: ${rec.overdueMinutes} min)`}
                          </span>
                        )}
                        {rec.endTime && <span>🏁 {rec.endTime}</span>}
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${rec.status==='completed' ? 'bg-teal-400' : 'bg-amber-500'}`}/>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="text-3xl text-teal-200 mb-2"><FiClock /></div>
                    <p className="text-sm font-semibold text-slate-500">No activity recorded today</p>
                    <p className="text-xs text-slate-400">Start working to see your timeline</p>
                  </div>
                )}
              </div>

              {/* Daily Summary */}
              <div className="mt-4 pt-4 border-t border-teal-100">
                <p className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wide mb-3">Daily Summary</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {summaryRows.map((r,i)=>(
                    <div key={i} className="flex justify-between items-center text-xs py-1">
                      <span className="text-slate-400">{r.key}</span>
                      <span className={`font-bold text-teal-700 ${r.color || ''}`}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-teal-200/40 shadow-md p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                  <FiZap className="text-teal-600 text-xs" />
                </div>
                <h3 className="font-syne font-bold text-teal-800 text-sm">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon:<FiBarChart2 size={14}/>, label:'Weekly Report', action: () => alert('Weekly Report - Coming Soon'), bg:'bg-teal-50', border:'border-teal-200', color:'text-teal-600' },
                  { icon:<FiDownload size={14}/>, label:'Export Data', action: () => {
                    const dataStr = JSON.stringify(todayRecords, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = `attendance_${employeeId}_${new Date().toISOString().split('T')[0]}.json`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }, bg:'bg-cyan-50', border:'border-cyan-200', color:'text-cyan-700' },
                  { icon:<FiUser size={14}/>, label:'My Performance', action: () => alert('Performance data coming soon'), bg:'bg-green-50', border:'border-green-200', color:'text-green-600' },
                  { icon:<FiCalendar size={14}/>, label:'Attendance History', action: () => alert('History data coming soon'), bg:'bg-teal-50', border:'border-teal-200', color:'text-teal-600' },
                ].map((a,i)=>(
                  <button 
                    key={i} 
                    onClick={a.action}
                    className={`${a.bg} border ${a.border} ${a.color} rounded-xl py-3 text-xs font-semibold flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all`}
                  >
                    {a.icon}
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        *{box-sizing:border-box;}
        .font-syne { font-family: 'Syne', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #ccfbf1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #5eead4;
          border-radius: 2px;
        }
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default StaffPunchInOut;