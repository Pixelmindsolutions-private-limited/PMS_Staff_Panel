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
      // if (typeof removeGlobalKeyboardListener === 'function') removeGlobalKeyboardListener();
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