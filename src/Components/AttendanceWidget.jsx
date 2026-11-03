import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiCoffee,
  FiExternalLink,
  FiX,
  FiPlay,
  FiMinus,
  FiChevronDown,
} from "react-icons/fi";

const API_BASE_CANDIDATES = ["http://15.135.216.211:5000/api"];

export const getApiBaseUrl = () => {
  return "http://15.135.216.211:5000/api";
};

export const getStoredStaffDetails = () => {
  try {
    const rawSession = sessionStorage.getItem("staffDetails");
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed?.token && parsed?.user) {
        try {
          localStorage.setItem("staffDetails", rawSession);
        } catch (_) { }
        return parsed;
      }
    }
  } catch (_) { }

  try {
    const rawLocal = localStorage.getItem("staffDetails");
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed?.token && parsed?.user) {
        return parsed;
      }
    }
  } catch (_) { }
  return null;
};

// Login APIs return the user in different shapes (employeeName / name /
// fullName, employeeId / _id). Normalise to one shape so the widget never
// ends up with an empty id or name.
const normalizeStaffUser = (user = {}) => {
  const employeeId = user.employeeId || user._id || "";
  const nameFromParts = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ");
  const employeeName =
    user.employeeName ||
    user.name ||
    user.fullName ||
    user.staffName ||
    user.username ||
    nameFromParts ||
    "";
  return { ...user, employeeId, employeeName };
};

// Actual elapsed seconds for a break record. Prefers timestamps so time
// beyond the scheduled limit is preserved; never trusts planned duration
// when real timestamps or an anchor exist.
const getBreakSeconds = (b, anchorStartMs = null) => {
  const start = b?.startTime ? new Date(b.startTime).getTime() : null;
  const end = b?.endTime ? new Date(b.endTime).getTime() : null;
  if (start && end) return Math.max(0, Math.floor((end - start) / 1000));
  if (b?.durationSeconds != null) return Math.max(0, Number(b.durationSeconds));
  if (anchorStartMs != null)
    return Math.max(0, Math.floor((Date.now() - anchorStartMs) / 1000));
  if (start) return Math.max(0, Math.floor((Date.now() - start) / 1000));
  if (b?.duration != null)
    return Math.max(0, Math.round(Number(b.duration) * 60));
  return 0;
};

const AttendanceWidget = ({ isStandalonePopup = false, onClose }) => {
  const [staffDetails, setStaffDetails] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // punchStatus: 'out' (Not Working) | 'in' (Working) | 'break' (On Break) | 'completed' (Work Ended)
  const [punchStatus, setPunchStatus] = useState("out");
  const [location, setLocation] = useState("Office");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Working & Delay (Idle) timers
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [isCurrentlyIdle, setIsCurrentlyIdle] = useState(false);

  // Separate Card states: null | 'lunch' | 'tea'
  const [activeSeparateCard, setActiveSeparateCard] = useState(null);
  const [scheduledBreakRunning, setScheduledBreakRunning] = useState(false);
  const [scheduledBreakElapsed, setScheduledBreakElapsed] = useState(0);
  const [scheduledBreakRemaining, setScheduledBreakRemaining] = useState(0);

  // Recorded Break Times for Today
  const [lunchTakenSec, setLunchTakenSec] = useState(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      return Number(localStorage.getItem(`pms_lunch_taken_${todayStr}`) || 0);
    } catch (_) {
      return 0;
    }
  });
  const [teaTakenSec, setTeaTakenSec] = useState(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      return Number(localStorage.getItem(`pms_tea_taken_${todayStr}`) || 0);
    } catch (_) {
      return 0;
    }
  });
  const [workSecondsAtLastScheduledBreakResume, setWorkSecondsAtLastScheduledBreakResume] = useState(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const saved = localStorage.getItem(`pms_scheduled_break_resume_${todayStr}`);
      return saved == null ? null : Number(saved);
    } catch (_) {
      return 0;
    }
  });

  // Recorded Custom Breaks for Today
  const [customBreaksList, setCustomBreaksList] = useState(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const saved = localStorage.getItem(`pms_custom_breaks_${todayStr}`);
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Manual Break selection
  const [breakReason, setBreakReason] = useState("Personal Break");
  const [breakDuration, setBreakDuration] = useState(15);
  const [breakInfo, setBreakInfo] = useState(null);
  const [breakRemainingSec, setBreakRemainingSec] = useState(0);

  // Modals & prompts
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [showLunchFinished, setShowLunchFinished] = useState(false);
  const [showTeaFinished, setShowTeaFinished] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isCardMinimized, setIsCardMinimized] = useState(false);

  const handleMinimize = () => {
    if (typeof window !== "undefined" && window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    } else {
      setIsCardMinimized(true);
    }
  };

  const handleMaximizeOrToggle = () => {
    if (isCardMinimized) {
      setIsCardMinimized(false);
    } else {
      setIsCardMinimized(true);
    }
  };

  // Dynamically adapt Electron window height based on current card view
  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI?.setHeight) {
      if (isCardMinimized) {
        window.electronAPI.setHeight(75);
      } else if (punchStatus === "out") {
        window.electronAPI.setHeight(280);
      } else if (
        activeSeparateCard === "lunch" ||
        activeSeparateCard === "tea"
      ) {
        const showFinishedBanner =
          (activeSeparateCard === "lunch" && showLunchFinished) ||
          (activeSeparateCard === "tea" && showTeaFinished);

        window.electronAPI.setHeight(showFinishedBanner ? 620 : 420);
      } else {
        window.electronAPI.setHeight(900);
      }
    }
  }, [
    punchStatus,
    isCardMinimized,
    activeSeparateCard,
    showLunchFinished,
    showTeaFinished,
  ]);

  // Refs for tracking activity & sync
  const lastActivityTimeRef = useRef(Date.now());
  const heartbeatIntervalRef = useRef(null);
  const syncChannelRef = useRef(null);
  const punchStartTimeRef = useRef(null);
  const lastActivityReportTimeRef = useRef(0);
  const isCurrentlyIdleRef = useRef(false);
  const activityReportInProgressRef = useRef(false);
  const statusRefreshRequestRef = useRef(0);
  // Delay reporting: latest delay value (safe to read inside intervals), when
  // the current idle period started, and the latest report function.
  const delaySecondsRef = useRef(0);
  const idleStartedAtRef = useRef(null);
  const reportDelayRef = useRef(null);

  // ===== NEW: absolute timestamp anchors for break timers =====
  // These are the source of truth for break timing. All break display
  // values are derived from these on every tick and on every resume event.
  const scheduledBreakStartMsRef = useRef(null); // Date.now() of break start
  const scheduledBreakEndMsRef = useRef(null); // expectedEndTime in ms
  const manualBreakStartMsRef = useRef(null); // personal/meeting start
  const manualBreakEndMsRef = useRef(null); // personal/meeting end
  const finishedNoticeShownRef = useRef(false); // guard duplicate toasts

  // ===== NEW: guard so we never fire two /end-break requests at once =====
  const finishingBreakRef = useRef(false);
  const [isFinishingBreak, setIsFinishingBreak] = useState(false);

  // Format helpers
  const formatSecToHMS = (totalSec) => {
    const sec = Math.max(0, Math.floor(totalSec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatSecToMS = (totalSec) => {
    const sec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  };

  // API caller with dual-candidate fallback
  const apiCall = useCallback(
    async (endpoint, method = "GET", body = null, tokenOverride = null) => {
      const token = tokenOverride || authToken;
      const candidates = [
        getApiBaseUrl(),
        ...API_BASE_CANDIDATES.filter((u) => u !== getApiBaseUrl()),
      ];
      let lastErr = null;

      for (const baseUrl of candidates) {
        try {
          const options = {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          };
          if (body) options.body = JSON.stringify(body);
          const res = await fetch(`${baseUrl}${endpoint}`, options);
          const data = await res.json();
          if (!data.success) {
            throw new Error(data.message || "API call failed");
          }
          return data;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error("Network error");
    },
    [authToken],
  );

  // Broadcast state changes across windows
  const broadcastSync = (type, payload = {}) => {
    try {
      if (syncChannelRef.current) {
        syncChannelRef.current.postMessage({
          type,
          payload,
          timestamp: Date.now(),
        });
      }
    } catch (_) { }
  };

  // Keep a ref copy of delay so intervals/handlers always send the latest value.
  useEffect(() => {
    delaySecondsRef.current = delaySeconds;
  }, [delaySeconds]);

  // Explicitly tell the backend about the delay (idle) time. Previously only
  // an "isIdle" flag was sent inside the heartbeat, never the delay itself.
  const reportDelayToServer = async (extra = {}) => {
    if (!employeeId || !authToken) return;
    const delaySec = delaySecondsRef.current;
    try {
      const res = await apiCall("/work-session/report-idle", "POST", {
        employeeId,
        isIdle: extra.isIdle ?? true,
        activityType:
          extra.activityType || (extra.isIdle === false ? "human" : "idle"),
        delaySeconds: delaySec,
        delayMinutes: Math.round((delaySec / 60) * 100) / 100,
        idleStartTime: idleStartedAtRef.current
          ? new Date(idleStartedAtRef.current).toISOString()
          : undefined,
        ...extra,
      });
      console.log("Delay reported to server:", delaySec, res);
      return true;
    } catch (err) {
      console.warn("Delay report failed:", err.message);
      return false;
    }
  };
  reportDelayRef.current = reportDelayToServer;

  const checkBreakDetails = useCallback(
    async (token, empId) => {
      try {
        const res = await apiCall(
          `/work-session/check-idle/${empId}`,
          "GET",
          null,
          token,
        );
        if (res?.success && res.currentBreak) {
          const br = res.currentBreak;
          setBreakInfo(br);
          if (br.expectedEndTime) {
            const rem = Math.floor(
              (new Date(br.expectedEndTime).getTime() - Date.now()) / 1000,
            );
            setBreakRemainingSec(Math.max(0, rem));
          }
        }
      } catch (_) { }
    },
    [apiCall],
  );

  // ===== NEW: recompute all break display values from timestamps =====
  // This is idempotent and safe to call many times per second. It reads
  // absolute timestamps (anchored from the backend's startTime /
  // expectedEndTime) so a paused or throttled setInterval, a sleeping
  // laptop, or a minimized window can never make the timer drift.
  const recalcBreakTimers = useCallback(() => {
    const now = Date.now();

    // --- Scheduled (lunch / tea) ---
    if (
      activeSeparateCard &&
      scheduledBreakRunning &&
      scheduledBreakStartMsRef.current != null &&
      scheduledBreakEndMsRef.current != null
    ) {
      const startMs = scheduledBreakStartMsRef.current;
      const endMs = scheduledBreakEndMsRef.current;
      const elapsed = Math.max(0, Math.floor((now - startMs) / 1000));
      const remaining = Math.max(0, Math.ceil((endMs - now) / 1000));

      setScheduledBreakElapsed(elapsed);
      setScheduledBreakRemaining(remaining);

      const todayStr = new Date().toISOString().split("T")[0];
      if (activeSeparateCard === "lunch") {
        setLunchTakenSec(elapsed);
        try {
          localStorage.setItem(`pms_lunch_taken_${todayStr}`, String(elapsed));
        } catch (_) { }
      } else if (activeSeparateCard === "tea") {
        setTeaTakenSec(elapsed);
        try {
          localStorage.setItem(`pms_tea_taken_${todayStr}`, String(elapsed));
        } catch (_) { }
      }

      // One-shot completion notice per break instance
      if (remaining === 0 && !finishedNoticeShownRef.current) {
        finishedNoticeShownRef.current = true;
        if (activeSeparateCard === "lunch") setShowLunchFinished(true);
        if (activeSeparateCard === "tea") setShowTeaFinished(true);
      }
      // If the server later extends the break, re-arm the notice
      if (remaining > 0) finishedNoticeShownRef.current = false;
      return;
    }

    // --- Manual (personal / meeting) ---
    if (
      punchStatus === "break" &&
      !activeSeparateCard &&
      manualBreakStartMsRef.current != null &&
      manualBreakEndMsRef.current != null
    ) {
      const startMs = manualBreakStartMsRef.current;
      const endMs = manualBreakEndMsRef.current;
      const elapsed = Math.max(0, Math.floor((now - startMs) / 1000));
      const remaining = Math.max(0, Math.ceil((endMs - now) / 1000));

      setBreakRemainingSec(remaining);

      setCustomBreaksList((prev) => {
        if (!prev || prev.length === 0) return prev;
        const idx = prev.findIndex((cb) => cb.status === "active");
        if (idx === -1) return prev;
        if (prev[idx].takenSec === elapsed) return prev; // no-op
        const next = [...prev];
        next[idx] = { ...next[idx], takenSec: elapsed };
        try {
          const todayStr = new Date().toISOString().split("T")[0];
          localStorage.setItem(
            `pms_custom_breaks_${todayStr}`,
            JSON.stringify(next),
          );
        } catch (_) { }
        return next;
      });
    }
  }, [activeSeparateCard, scheduledBreakRunning, punchStatus]);

  // Check current server status
  const refreshStatus = useCallback(
    async (token, empId) => {
      if (!token || !empId) return;
      const requestId = ++statusRefreshRequestRef.current;
      try {
        const res = await apiCall(
          `/work-session/summary/${empId}`,
          "GET",
          null,
          token,
        );
        if (res.success && res.data) {
          if (requestId !== statusRefreshRequestRef.current) return;
          const status = String(res.data.status || "").toLowerCase();
          // Delay should contain only actual idle time.
          // Lunch, tea, personal and other breaks must not be added.
          const totalIdle =
            res.data.totalIdleSeconds !== undefined
              ? Math.floor(Number(res.data.totalIdleSeconds) || 0)
              : Math.floor((Number(res.data.totalIdleTime) || 0) * 60);

          // Decide the idle state BEFORE touching the delay value.
          // If this widget already detected idle from real input and the
          // server has not caught up yet (it still says "working"), keep the
          // local idle state instead of letting the poll cancel it.
          const wasIdle = isCurrentlyIdleRef.current;
          const keepLocalIdle =
            status === "working" &&
            wasIdle &&
            (Date.now() - lastActivityTimeRef.current) / 1000 >= 120;
          const nextIdle = status === "idle" || keepLocalIdle;

          // While idle the local counter is ahead of the server (the server
          // value lags), so never let the poll move it backwards.
          setDelaySeconds((prev) =>
            nextIdle ? Math.max(prev, totalIdle) : totalIdle,
          );
          if (Array.isArray(res.data.breaks)) {
            let lunchSec = 0;
            let teaSec = 0;
            const customs = [];

            res.data.breaks.forEach((b, idx) => {
              const rawType = String(b.type || b.reason || "").toLowerCase();
              const durationSec = getBreakSeconds(b);

              if (rawType.includes("lunch")) {
                lunchSec += durationSec;
              } else if (rawType.includes("tea")) {
                teaSec += durationSec;
              } else {
                customs.push({
                  id: b._id || `cb_${idx}`,
                  type: b.type,
                  reason:
                    b.reason ||
                    (rawType.includes("meeting")
                      ? "Meeting"
                      : rawType.includes("short")
                        ? "Short Break"
                        : "Personal Break"),
                  duration: b.duration || Math.round(durationSec / 60) || 15,
                  takenSec: durationSec,
                  status: b.status || (b.endTime ? "ended" : "active"),
                  startTime: b.startTime,
                  endTime: b.endTime,
                });
              }
            });

            const todayStr = new Date().toISOString().split("T")[0];
            if (lunchSec > 0) {
              setLunchTakenSec(lunchSec);
              try {
                localStorage.setItem(
                  `pms_lunch_taken_${todayStr}`,
                  String(lunchSec),
                );
              } catch (_) { }
            }
            if (teaSec > 0) {
              setTeaTakenSec(teaSec);
              try {
                localStorage.setItem(
                  `pms_tea_taken_${todayStr}`,
                  String(teaSec),
                );
              } catch (_) { }
            }
            if (customs.length > 0) {
              setCustomBreaksList(customs);
              try {
                localStorage.setItem(
                  `pms_custom_breaks_${todayStr}`,
                  JSON.stringify(customs),
                );
              } catch (_) { }
            }
          }

          if (status === "completed") {
            setPunchStatus("completed");
            setBreakInfo(null);
          } else if (
            status === "working" ||
            status === "idle" ||
            status === "on_break"
          ) {
            setPunchStatus(status === "on_break" ? "break" : "in");
            if (res.data.startTime) {
              punchStartTimeRef.current = new Date(
                res.data.startTime,
              ).getTime();
            }
            if (
              res.data.totalWorkSeconds !== undefined ||
              res.data.totalWorkDuration !== undefined
            ) {
              // Restore accumulated work from the backend without counting
              // time while the widget was closed.
              const restoredWorkSec =
                res.data.totalWorkSeconds !== undefined
                  ? Number(res.data.totalWorkSeconds)
                  : Math.round((Number(res.data.totalWorkDuration) || 0) * 60);

              setWorkingSeconds(restoredWorkSec);
            }
            setIsCurrentlyIdle(nextIdle);
            isCurrentlyIdleRef.current = nextIdle;
            setShowIdleModal(nextIdle);
            // IMPORTANT: do NOT reset lastActivityTimeRef here. This runs
            // every 5s, so resetting it meant 120s of inactivity was never
            // reached and Delay never started. Only real input resets it.
            // If the server says idle and we were not idle yet (widget just
            // reopened), back-date the clock so the delay keeps counting.
            if (status === "idle" && !wasIdle) {
              lastActivityTimeRef.current = Date.now() - 120 * 1000;
              idleStartedAtRef.current = lastActivityTimeRef.current;
            }
            if (status === "on_break") {
              const currentBreak = res.data.currentBreak;
              if (currentBreak) {
                setBreakInfo(currentBreak);
                const breakType = String(
                  currentBreak.type || currentBreak.reason || "",
                ).toLowerCase();
                if (breakType.includes("lunch") || breakType.includes("tea")) {
                  const scheduledType = breakType.includes("lunch")
                    ? "lunch"
                    : "tea";
                  // ===== NEW: seed absolute anchors from backend =====
                  const startMs = currentBreak.startTime
                    ? new Date(currentBreak.startTime).getTime()
                    : Date.now();
                  const endMs = currentBreak.expectedEndTime
                    ? new Date(currentBreak.expectedEndTime).getTime()
                    : startMs +
                    (scheduledType === "lunch" ? 45 : 15) * 60 * 1000;

                  scheduledBreakStartMsRef.current = startMs;
                  scheduledBreakEndMsRef.current = endMs;
                  finishedNoticeShownRef.current = false;

                  setActiveSeparateCard(scheduledType);
                  setScheduledBreakRunning(true);

                  const elapsed = Math.max(
                    0,
                    Math.floor((Date.now() - startMs) / 1000),
                  );
                  const remaining = Math.max(
                    0,
                    Math.ceil((endMs - Date.now()) / 1000),
                  );
                  setScheduledBreakElapsed(elapsed);
                  setScheduledBreakRemaining(remaining);
                  if (scheduledType === "lunch") setLunchTakenSec(elapsed);
                  else setTeaTakenSec(elapsed);

                  // Break expired while widget was closed/asleep: surface
                  // the notice once instead of silently ticking.
                  if (remaining === 0 && !finishedNoticeShownRef.current) {
                    finishedNoticeShownRef.current = true;
                    if (scheduledType === "lunch") setShowLunchFinished(true);
                    else setShowTeaFinished(true);
                  }
                } else {
                  // ===== NEW: manual break restored from backend =====
                  const startMs = currentBreak.startTime
                    ? new Date(currentBreak.startTime).getTime()
                    : Date.now();
                  const endMs = currentBreak.expectedEndTime
                    ? new Date(currentBreak.expectedEndTime).getTime()
                    : startMs + (currentBreak.duration || 15) * 60 * 1000;
                  manualBreakStartMsRef.current = startMs;
                  manualBreakEndMsRef.current = endMs;
                  setBreakRemainingSec(
                    Math.max(0, Math.ceil((endMs - Date.now()) / 1000)),
                  );
                }
              }
              checkBreakDetails(token, empId);
            } else {
              setBreakInfo(null);
            }
          } else {
            setPunchStatus("out");
            setBreakInfo(null);
          }
        }
      } catch (err) {
        console.warn("Status refresh error:", err.message);
      }
    },
    [apiCall, checkBreakDetails],
  );
  // Sync active break from backend every 5 seconds
  // useEffect(() => {
  //   if (!authToken || !employeeId) return;

  //   const syncBreakStatus = () => {
  //     refreshStatus(authToken, employeeId);
  //   };

  //   syncBreakStatus();

  //   const intervalId = setInterval(syncBreakStatus, 5000);

  //   return () => clearInterval(intervalId);
  // }, [authToken, employeeId, refreshStatus]);
  useEffect(() => {
    const removeAuthSync = window.electronAPI?.onAuthSync?.(async (payload) => {
      const user = payload?.user;
      const nextEmployeeId = user?.employeeId || user?._id;
      if (!payload?.token || !user || !nextEmployeeId) {
        console.warn("Invalid login-sync payload");
        return;
      }

      const switchingEmployee = employeeId && employeeId !== nextEmployeeId;
      if (switchingEmployee) {
        statusRefreshRequestRef.current += 1;
        setPunchStatus("out");
        setBreakInfo(null);
        setWorkingSeconds(0);
        setDelaySeconds(0);
        setIsCurrentlyIdle(false);
        isCurrentlyIdleRef.current = false;
      }

      const newDetails = {
        token: payload.token,
        user: {
          ...normalizeStaffUser(user),
          employeeId: user.employeeId || nextEmployeeId,
        },
        type: "staff",
      };

      try {
        sessionStorage.setItem("staffDetails", JSON.stringify(newDetails));
        localStorage.setItem("staffDetails", JSON.stringify(newDetails));
      } catch (error) {
        console.error("Unable to save staff details:", error);
      }

      setStaffDetails(newDetails.user);
      setEmployeeId(nextEmployeeId);
      setAuthToken(payload.token);

      await refreshStatus(payload.token, nextEmployeeId);
    });

    return () => {
      if (typeof removeAuthSync === "function") {
        removeAuthSync();
      }
    };
  }, [employeeId, refreshStatus]);

  // Mount setup
  useEffect(() => {
    // Reads the stored login and pushes it into state. Used on mount, when
    // another window logs in (storage event / BroadcastChannel) and on resume.
    const syncStoredStaff = () => {
      const details = getStoredStaffDetails();
      if (!details) return null;
      const user = normalizeStaffUser(details.user);
      if (!user.employeeId) return null;
      setStaffDetails((prev) =>
        prev &&
          prev.employeeId === user.employeeId &&
          prev.employeeName === user.employeeName
          ? prev
          : user,
      );
      setEmployeeId(user.employeeId);
      setAuthToken(details.token);
      return { token: details.token, user };
    };

    const stored = syncStoredStaff();
    console.log(
      "Stored employee:",
      stored?.user?.employeeId,
      stored?.user?.employeeName,
    );
    if (stored) {
      refreshStatus(stored.token, stored.user.employeeId);
    }

    try {
      const channel = new BroadcastChannel("pms_attendance_sync");
      syncChannelRef.current = channel;
      channel.onmessage = (event) => {
        const { type } = event.data || {};
        if (type === "STATE_UPDATED") {
          const d = syncStoredStaff();
          if (d) refreshStatus(d.token, d.user.employeeId);
        }
      };
    } catch (_) { }

    // Login/logout done in another window of the same origin.
    const onStorage = (e) => {
      if (e.key && e.key !== "staffDetails") return;
      const d = syncStoredStaff();
      if (d) refreshStatus(d.token, d.user.employeeId);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (syncChannelRef.current) syncChannelRef.current.close();
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
    };
  }, [refreshStatus]);

  // Detect local and global mouse/keyboard activity.
  // Resume idle only after the server confirms it.
  useEffect(() => {
    let mounted = true;

    const onUserActivity = async () => {
      const now = Date.now();

      // Reset local inactivity timer on real input.
      lastActivityTimeRef.current = now;

      if (punchStatus !== "in") return;
      if (!employeeId || !authToken) return;

      // Prevent too many API requests.
      if (activityReportInProgressRef.current) return;
      if (now - lastActivityReportTimeRef.current < 10000) return;

      lastActivityReportTimeRef.current = now;
      activityReportInProgressRef.current = true;

      try {
        // The user moved while idle: send the final delay BEFORE telling the
        // server about human input, because that input flips the server back
        // to "working" and the idle period would otherwise be lost.
        if (isCurrentlyIdleRef.current && idleStartedAtRef.current) {
          const delayReported = await reportDelayRef.current?.({
            event: "idle_ended",
            isIdle: false,
            activityType: "human",
            idleDurationSeconds: Math.floor(
              (Date.now() - idleStartedAtRef.current) / 1000,
            ),
          });
          if (!delayReported) return;
        }

        // Report confirmed human input, even when currently Working.
        const res = await apiCall("/work-session/heartbeat", "POST", {
          employeeId,
          activityType: "human",
          delaySeconds: delaySecondsRef.current,
        });

        if (!mounted || !res?.success) return;

        if (res.data?.status === "working") {
          idleStartedAtRef.current = null;
          isCurrentlyIdleRef.current = false;
          setIsCurrentlyIdle(false);
          setShowIdleModal(false);
        }

        if (res.data?.totalWorkSeconds !== undefined) {
          setWorkingSeconds(Number(res.data.totalWorkSeconds));
        } else if (res.data?.totalWorkDuration !== undefined) {
          setWorkingSeconds(
            Math.round(Number(res.data.totalWorkDuration) * 60),
          );
        }

        broadcastSync("STATE_UPDATED", {
          status: res.data?.status,
        });
      } catch (err) {
        console.warn("Human activity report error:", err.message);
      } finally {
        activityReportInProgressRef.current = false;
      }
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "keyup",
      "input",
      "wheel",
      "touchstart",
      "pointerdown",
      "mousemove",
      "mouseup",
      "auxclick",
      "contextmenu",
      "pointerup",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, onUserActivity, {
        passive: true,
      });
    });

    // Electron global keyboard activity
    const removeGlobalKeyboardListener =
      window.electronAPI?.onGlobalKeyboardActivity?.(onUserActivity);

    // Electron global mouse activity
    const removeGlobalMouseListener =
      window.electronAPI?.onGlobalMouseActivity?.(onUserActivity);

    return () => {
      mounted = false;

      events.forEach((eventName) => {
        window.removeEventListener(eventName, onUserActivity);
      });

      if (typeof removeGlobalKeyboardListener === "function") {
        removeGlobalKeyboardListener();
      }

      if (typeof removeGlobalMouseListener === "function") {
        removeGlobalMouseListener();
      }
    };
  }, [punchStatus, showIdleModal, employeeId, authToken, apiCall]);

  // 1-second master clock & scheduler
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const nowHours = now.getHours();
      const todayStr = now.toISOString().split("T")[0];

      // 🍱 1:00 PM (13:00) Lunch Break Auto-Trigger
      if (
        nowHours === 13 &&
        punchStatus === "in" &&
        activeSeparateCard === null
      ) {
        const lunchDoneKey = `pms_lunch_done_${todayStr}`;
        if (!localStorage.getItem(lunchDoneKey)) {
          setActiveSeparateCard("lunch");
          setScheduledBreakRemaining(45 * 60);
          setScheduledBreakElapsed(0);
          setScheduledBreakRunning(false);
        }
      }

      // ☕ 5:00 PM (17:00) Tea Break Auto-Trigger
      if (
        nowHours === 17 &&
        punchStatus === "in" &&
        activeSeparateCard === null
      ) {
        const teaDoneKey = `pms_tea_done_${todayStr}`;
        if (!localStorage.getItem(teaDoneKey)) {
          setActiveSeparateCard("tea");
          setScheduledBreakRemaining(15 * 60);
          setScheduledBreakElapsed(0);
          setScheduledBreakRunning(false);
        }
      }

      // ===== NEW: always recompute break timers from timestamps =====
      // Do NOT increment counter state. setInterval may fire zero or one
      // times across a sleep; only absolute timestamps are reliable.
      recalcBreakTimers();

      // If working normally (not on scheduled break card):
      if (punchStatus === "in" && activeSeparateCard === null) {
        const idleForSec = (Date.now() - lastActivityTimeRef.current) / 1000;

        if (idleForSec >= 120) {
          // Enter idle once. Do not let this timer auto-resume the session.
          if (!isCurrentlyIdleRef.current) {
            isCurrentlyIdleRef.current = true;
            idleStartedAtRef.current = lastActivityTimeRef.current;
            setIsCurrentlyIdle(true);
            setShowIdleModal(true);
            // Tell the backend right away that the delay has started.
            reportDelayRef.current?.({ event: "idle_started" });
          }
          setDelaySeconds((prev) => prev + 1);
        } else if (!isCurrentlyIdleRef.current) {
          setWorkingSeconds((prev) => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    punchStatus,
    activeSeparateCard,
    scheduledBreakRunning,
    recalcBreakTimers,
  ]);

  // ===== NEW: recompute on resume from sleep / screen-off / visibility / focus =====
  useEffect(() => {
    const onResume = () => {
      // Recompute locally first so the UI is correct instantly, then re-sync
      // with the backend (source of truth) to restore any changes made while
      // this window was asleep.
      recalcBreakTimers();
      const details = getStoredStaffDetails();
      const resumeEmpId = details?.user?.employeeId || details?.user?._id;
      if (details?.token && resumeEmpId) {
        refreshStatus(details.token, resumeEmpId);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") onResume();
    };

    window.addEventListener("focus", onResume);
    window.addEventListener("online", onResume);
    window.addEventListener("pageshow", onResume);
    document.addEventListener("visibilitychange", onVisibility);

    // Optional Electron power-resume hook (if preload exposes it)
    const removePowerResume = window.electronAPI?.onPowerResume?.(onResume);

    return () => {
      window.removeEventListener("focus", onResume);
      window.removeEventListener("online", onResume);
      window.removeEventListener("pageshow", onResume);
      document.removeEventListener("visibilitychange", onVisibility);
      if (typeof removePowerResume === "function") removePowerResume();
    };
  }, [recalcBreakTimers, refreshStatus]);

  // Periodic Heartbeat to Server (every 30s)
  useEffect(() => {
    if (punchStatus !== "in" && punchStatus !== "break") {
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
      return;
    }

    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        const currentActiveSec =
          (Date.now() - lastActivityTimeRef.current) / 1000;
        await apiCall("/work-session/heartbeat", "POST", {
          employeeId,
          isIdle: currentActiveSec >= 120,
          activityType: "heartbeat",
          delaySeconds: delaySecondsRef.current,
        });
      } catch (err) {
        console.warn("Heartbeat failed:", err.message);
      }
    }, 30000);

    return () => {
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
    };
  }, [punchStatus, employeeId, apiCall]);

  // ================= ACTION HANDLERS =================
  const handleResumeFromIdle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      let res;

      try {
        res = await apiCall("/work-session/handle-idle", "POST", {
          employeeId,
          action: "continue",
          isIdle: false,
          activityType: "human",
          delaySeconds: delaySecondsRef.current,
          delayMinutes:
            Math.round((delaySecondsRef.current / 60) * 100) / 100,
          idleDurationSeconds: idleStartedAtRef.current
            ? Math.floor((Date.now() - idleStartedAtRef.current) / 1000)
            : undefined,
          idleStartTime: idleStartedAtRef.current
            ? new Date(idleStartedAtRef.current).toISOString()
            : undefined,
        });
      } catch (primaryError) {
        // Compatibility fallback for backends that resume through report-idle.
        res = await apiCall("/work-session/report-idle", "POST", {
          employeeId,
          activityType: "human",
          delaySeconds: delaySecondsRef.current,
        });
      }

      if (!res?.success) {
        throw new Error("The server did not confirm that the session resumed.");
      }

      lastActivityTimeRef.current = Date.now();
      idleStartedAtRef.current = null;
      isCurrentlyIdleRef.current = false;
      setIsCurrentlyIdle(false);
      setShowIdleModal(false);
      setPunchStatus("in");

      if (res.data?.totalWorkSeconds !== undefined) {
        setWorkingSeconds(Number(res.data.totalWorkSeconds));
      } else if (res.data?.totalWorkDuration !== undefined) {
        setWorkingSeconds(Math.round(Number(res.data.totalWorkDuration) * 60));
      }

      broadcastSync("STATE_UPDATED", { status: "working" });
    } catch (err) {
      // Keep the idle state visible when the server has not resumed the session.
      setIsCurrentlyIdle(true);
      isCurrentlyIdleRef.current = true;
      setShowIdleModal(true);
      setError(err.message || "Unable to resume work. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorking = async () => {
    setIsLoading(true);
    setError("");
    try {
      await apiCall("/work-session/start", "POST", {
        employeeId,
        notes: `Started from ${location}`,
      });
      setPunchStatus("in");
      isCurrentlyIdleRef.current = false;
      setIsCurrentlyIdle(false);
      setShowIdleModal(false);
      punchStartTimeRef.current = Date.now();
      lastActivityTimeRef.current = Date.now();
      broadcastSync("STATE_UPDATED", { status: "working" });
      await refreshStatus(authToken, employeeId);
    } catch (err) {
      setError(err.message || "Unable to start work");
    } finally {
      setIsLoading(false);
    }
  };

  // Ends the current break on the server. Resolves only when the backend
  // confirmed it, or when the summary endpoint verifies no break is active.
  const endBreakOnServer = async (matchFn) => {
    try {
      const res = await apiCall("/work-session/end-break", "POST", {
        employeeId,
      });
      const breakRecord =
        res?.data?.break ||
        res?.data?.endedBreak ||
        res?.data?.currentBreak ||
        res?.break ||
        null;
      return { breakRecord };
    } catch (err) {
      const lower = String(err?.message || "").toLowerCase();
      const looksLikeAlreadyEnded = [
        "no active break",
        "break not found",
        "no break",
        "already ended",
        "not currently on break",
      ].some((k) => lower.includes(k));
      if (!looksLikeAlreadyEnded) throw err;

      // Message alone is not proof: verify against server state.
      // If this call also fails, its error propagates and nothing is cleared.
      const summary = await apiCall(
        `/work-session/summary/${employeeId}`,
        "GET",
      );
      const d = summary?.data;
      const stillOnBreak =
        String(d?.status || "").toLowerCase() === "on_break" ||
        !!d?.currentBreak;
      if (stillOnBreak) throw err;

      const ended = Array.isArray(d?.breaks)
        ? [...d.breaks].reverse().find((b) => b.endTime && matchFn(b))
        : null;
      return { breakRecord: ended || null };
    }
  };

  // Start Scheduled Break (Lunch: 45m, Tea: 15m)
  const handleStartScheduledBreak = async (type, durationMin) => {
    if (isLoading) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const doneToday = localStorage.getItem(`pms_${type}_done_${todayStr}`) === "1";
    if (doneToday) {
      setError(`${type === "tea" ? "Tea" : "Lunch"} break has already been taken today.`);
      return;
    }
    const workAfterBreakSec = workSecondsAtLastScheduledBreakResume == null
      ? Infinity
      : Math.max(0, workingSeconds - workSecondsAtLastScheduledBreakResume);
    if (workAfterBreakSec < 15 * 60) {
      const remainingMinutes = Math.ceil((15 * 60 - workAfterBreakSec) / 60);
      setError(`Please work for ${remainingMinutes} more minute${remainingMinutes === 1 ? "" : "s"} before starting another break.`);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await apiCall("/work-session/break", "POST", {
        employeeId,
        type,
        breakType: type,
        duration: durationMin,
        durationMinutes: durationMin,
        reason: type,
      });

      // ===== NEW: anchor to backend timestamps =====
      const br = res?.data?.currentBreak || res?.data?.break || null;
      const startMs = br?.startTime
        ? new Date(br.startTime).getTime()
        : Date.now();
      const endMs = br?.expectedEndTime
        ? new Date(br.expectedEndTime).getTime()
        : startMs + durationMin * 60 * 1000;

      scheduledBreakStartMsRef.current = startMs;
      scheduledBreakEndMsRef.current = endMs;
      finishedNoticeShownRef.current = false;

      // Card is shown only after the server accepted the break.
      setActiveSeparateCard(type);
      setShowLunchFinished(false);
      setShowTeaFinished(false);
      setScheduledBreakRunning(true);
      setScheduledBreakRemaining(
        Math.max(0, Math.ceil((endMs - Date.now()) / 1000)),
      );
      setScheduledBreakElapsed(
        Math.max(0, Math.floor((Date.now() - startMs) / 1000)),
      );
      setPunchStatus("break");
      broadcastSync("STATE_UPDATED", { status: "on_break", type });
    } catch (err) {
      // No local fallback: a break the server doesn't know about can't be
      // ended later.
      setError(err.message || `Unable to start ${type} break`);
    } finally {
      setIsLoading(false);
    }
  };

  // Finish Scheduled Break and Resume Work (Lunch / Tea)
  const handleFinishScheduledBreak = async () => {
    // Prevent duplicate /end-break calls
    if (finishingBreakRef.current) return;
    const breakType = activeSeparateCard;
    if (breakType !== "lunch" && breakType !== "tea") return;

    finishingBreakRef.current = true;
    setIsFinishingBreak(true);
    setError("");

    const todayStr = new Date().toISOString().split("T")[0];

    try {
      const { breakRecord } = await endBreakOnServer((b) =>
        String(b.type || b.reason || "")
          .toLowerCase()
          .includes(breakType),
      );
      const actualSeconds = getBreakSeconds(
        breakRecord,
        scheduledBreakStartMsRef.current,
      );

      // Everything below runs only after backend success / verified end.
      scheduledBreakStartMsRef.current = null;
      scheduledBreakEndMsRef.current = null;
      finishedNoticeShownRef.current = false;

      setScheduledBreakRunning(false);
      setScheduledBreakElapsed(actualSeconds);
      setScheduledBreakRemaining(0);
      setActiveSeparateCard(null);
      setShowLunchFinished(false);
      setShowTeaFinished(false);
      setShowEndConfirm(false); // never open End Work confirmation from here
      setPunchStatus("in");
      setWorkSecondsAtLastScheduledBreakResume(workingSeconds);
      try {
        localStorage.setItem(`pms_scheduled_break_resume_${todayStr}`, String(workingSeconds));
      } catch (_) { }

      try {
        localStorage.setItem(`pms_${breakType}_done_${todayStr}`, "1");
        localStorage.setItem(
          `pms_${breakType}_taken_${todayStr}`,
          String(actualSeconds),
        );
      } catch (_) { }
      if (breakType === "lunch") setLunchTakenSec(actualSeconds);
      else setTeaTakenSec(actualSeconds);

      isCurrentlyIdleRef.current = false;
      setIsCurrentlyIdle(false);
      setShowIdleModal(false);
      lastActivityTimeRef.current = Date.now();

      broadcastSync("STATE_UPDATED", { status: "working" });

      // Best-effort re-sync
      refreshStatus(authToken, employeeId).catch((e) =>
        console.warn("Post-break refresh failed:", e?.message),
      );
    } catch (err) {
      console.error("Finish break failed:", err);
      setError(err?.message || "Unable to finish break. Check connection.");
      // The break card stays visible so the user can retry.
    } finally {
      finishingBreakRef.current = false;
      setIsFinishingBreak(false);
    }
  };

  // Manual generic break (Personal Break, Meeting, etc.)
  const handleStartManualBreak = async () => {
    setIsLoading(true);
    setError("");
    try {
      const normalizedType = breakReason.toLowerCase().includes("meeting")
        ? "other"
        : "personal";
      const res = await apiCall("/work-session/break", "POST", {
        employeeId,
        type: normalizedType,
        breakType: normalizedType,
        duration: breakDuration,
        durationMinutes: breakDuration,
        reason: normalizedType,
      });

      // ===== NEW: anchor to backend timestamps =====
      const br = res?.data?.currentBreak || res?.data?.break || null;
      const startMs = br?.startTime
        ? new Date(br.startTime).getTime()
        : Date.now();
      const endMs = br?.expectedEndTime
        ? new Date(br.expectedEndTime).getTime()
        : startMs + breakDuration * 60 * 1000;

      manualBreakStartMsRef.current = startMs;
      manualBreakEndMsRef.current = endMs;

      setPunchStatus("break");
      setBreakRemainingSec(Math.max(0, Math.ceil((endMs - Date.now()) / 1000)));
      if (br) setBreakInfo(br);

      const todayStr = new Date().toISOString().split("T")[0];
      const newCustomBreak = {
        id: "cb_" + Date.now(),
        type: normalizedType,
        reason: breakReason,
        duration: breakDuration,
        takenSec: Math.max(0, Math.floor((Date.now() - startMs) / 1000)),
        status: "active",
        startTime: new Date(startMs).toISOString(),
        endTime: null,
      };
      setCustomBreaksList((prev) => {
        const next = [...prev, newCustomBreak];
        try {
          localStorage.setItem(
            `pms_custom_breaks_${todayStr}`,
            JSON.stringify(next),
          );
        } catch (_) { }
        return next;
      });

      broadcastSync("STATE_UPDATED", {
        status: "on_break",
        reason: breakReason,
      });
    } catch (err) {
      setError(err.message || "Unable to take break");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeManualBreak = async () => {
    if (finishingBreakRef.current) return;
    finishingBreakRef.current = true;
    setIsFinishingBreak(true);
    setError("");

    try {
      const { breakRecord } = await endBreakOnServer(
        (b) =>
          !/lunch|tea/.test(String(b.type || b.reason || "").toLowerCase()),
      );
      const actualSeconds = getBreakSeconds(
        breakRecord,
        manualBreakStartMsRef.current,
      );

      const todayStr = new Date().toISOString().split("T")[0];

      setCustomBreaksList((prev) => {
        const next = prev.map((item) =>
          item.status === "active"
            ? {
              ...item,
              status: "ended",
              startTime: breakRecord?.startTime || item.startTime,
              endTime: breakRecord?.endTime || new Date().toISOString(),
              duration: breakRecord?.duration ?? item.duration,
              takenSec: actualSeconds,
            }
            : item,
        );
        try {
          localStorage.setItem(
            `pms_custom_breaks_${todayStr}`,
            JSON.stringify(next),
          );
        } catch (_) { }
        return next;
      });

      manualBreakStartMsRef.current = null;
      manualBreakEndMsRef.current = null;

      setShowEndConfirm(false); // never open End Work confirmation from here
      setPunchStatus("in");
      setBreakInfo(null);
      setBreakRemainingSec(0);

      isCurrentlyIdleRef.current = false;
      setIsCurrentlyIdle(false);
      setShowIdleModal(false);
      lastActivityTimeRef.current = Date.now();

      broadcastSync("STATE_UPDATED", { status: "working" });

      refreshStatus(authToken, employeeId).catch((e) =>
        console.warn("Post-break refresh failed:", e?.message),
      );
    } catch (err) {
      console.error("Resume manual break failed:", err);
      setError(err?.message || "Unable to resume work");
    } finally {
      finishingBreakRef.current = false;
      setIsFinishingBreak(false);
    }
  };

  const handleEndWorkDay = async () => {
    setIsLoading(true);
    setError("");
    try {
      try {
        await apiCall("/work-session/end-work", "POST", {
          employeeId,
          notes: `Work ended at ${new Date().toLocaleTimeString()}`,
        });
      } catch (_) {
        await apiCall("/work-session/end", "POST", {
          employeeId,
          notes: `Work ended at ${new Date().toLocaleTimeString()}`,
        });
      }
      setPunchStatus("completed");
      setActiveSeparateCard(null);
      setShowEndConfirm(false);
      broadcastSync("STATE_UPDATED", { status: "completed" });
    } catch (err) {
      setError(err.message || "Unable to end work session");
    } finally {
      setIsLoading(false);
    }
  };

  // ================= RESPONSIVE UI HELPERS (Tailwind only) =================
  const badgeBase =
    "px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border whitespace-nowrap shadow-xs";

  const getStatusBadge = () => {
    if (punchStatus === "in") {
      return (
        <span
          className={`${badgeBase} bg-[#e6f7f4] text-[#00897b] border-[#a3e3d8] flex items-center gap-1.5`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00b09b] animate-pulse" />
          Working
        </span>
      );
    }
    if (punchStatus === "break") {
      const label = activeSeparateCard === "lunch" ? "Lunch Break" : "On Break";
      return (
        <span
          className={`${badgeBase} bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {label}
        </span>
      );
    }
    if (punchStatus === "completed") {
      return (
        <span
          className={`${badgeBase} bg-emerald-50 text-emerald-700 border-emerald-200`}
        >
          Work Ended
        </span>
      );
    }
    return (
      <span className={`${badgeBase} bg-red-50 text-red-600 border-red-200`}>
        Not Working
      </span>
    );
  };

  const renderWindowButtons = () => (
    <div
      className="flex items-center gap-1 bg-[#f8fafc] border border-slate-200 rounded-xl p-1 shrink-0"
      style={{ WebkitAppRegion: "no-drag" }}
    >
      <button
        type="button"
        onClick={handleMinimize}
        title="Minimize"
        className="w-6 h-6 rounded-lg border border-amber-400 bg-amber-50/50 hover:bg-amber-100 flex items-center justify-center text-amber-600 font-bold transition-all cursor-pointer shadow-xs"
      >
        <span className="w-2.5 h-[2px] bg-amber-600 rounded-full block"></span>
      </button>
      <button
        type="button"
        onClick={handleMaximizeOrToggle}
        title={isCardMinimized ? "Maximize / Expand" : "Compact Mode"}
        className="w-6 h-6 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-xs"
      >
        <span className="w-2.5 h-2.5 border-[1.5px] border-slate-600 rounded-[2px] block"></span>
      </button>
    </div>
  );

  // Shared responsive error banner
  const renderError = (extraClass = "mb-2") =>
    error ? (
      <div
        className={`${extraClass} p-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[11px] sm:text-xs flex items-start justify-between gap-2 break-words`}
      >
        <span className="flex items-start gap-1.5 font-medium min-w-0">
          <FiAlertCircle className="shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">{error}</span>
        </span>
        <button
          type="button"
          onClick={() => setError("")}
          className="text-red-500 font-bold shrink-0 leading-none"
        >
          ×
        </button>
      </div>
    ) : null;

  const staffDisplayName =
    staffDetails?.employeeName ||
    staffDetails?.name ||
    staffDetails?.fullName ||
    "";
  const staffLabel =
    staffDisplayName ||
    employeeId ||
    (authToken ? "Staff" : "Please log in");

  const todayKey = new Date().toISOString().split("T")[0];
  const scheduledBreakBlocked =
    workSecondsAtLastScheduledBreakResume != null &&
    workingSeconds - workSecondsAtLastScheduledBreakResume < 15 * 60;

  // ================= COMPACT (MINIMIZED) CARD =================
  if (isCardMinimized) {
    return (
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl px-3 sm:px-3.5 py-2 w-full max-w-sm mx-auto flex items-center justify-between gap-2 select-none animate-slide-in font-sans"
        style={{ backgroundColor: "#ffffff", WebkitAppRegion: "drag" }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <img
            src="/pms_logo.png"
            alt="PMS"
            className="w-5 h-5 object-contain rounded shrink-0"
          />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-syne font-bold text-teal-900 text-[11px] sm:text-xs tabular-nums whitespace-nowrap">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 truncate">
            Work:{" "}
            <span className="font-bold text-teal-700 tabular-nums">
              {formatSecToHMS(workingSeconds)}
            </span>
          </span>
        </div>
        <div
          className="flex items-center gap-1 shrink-0"
          style={{ WebkitAppRegion: "no-drag" }}
        >
          <button
            type="button"
            onClick={handleMaximizeOrToggle}
            title="Expand Full Card"
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all border border-slate-200 cursor-pointer"
          >
            <span className="w-2.5 h-2.5 border-[1.5px] border-slate-700 rounded-[2px] block"></span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative select-none font-sans w-full min-w-0">
      {/* ============================================================== */}
      {/* 🍱 SEPARATE CARD 1: ACTIVE LUNCH BREAK (1:00 PM - 1:45 PM)     */}
      {/* ============================================================== */}
      {activeSeparateCard === "lunch" && (
        <div
          className="bg-white rounded-2xl border border-[#00a99d] shadow-xl p-4 sm:p-6 max-w-[520px] w-full mx-auto relative overflow-y-auto overflow-x-hidden max-h-[85vh] animate-slide-in font-sans"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Draggable header bar */}
          <div
            className="flex justify-center items-center pb-2 sm:pb-3 mb-3 sm:mb-4"
            style={{ WebkitAppRegion: "drag" }}
          >
            <div className="flex items-center justify-center gap-2 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src="/pms_logo.png"
                  alt="PMS"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-syne font-extrabold text-[#006b67] text-base sm:text-lg leading-tight">
                  Pixelmind Solutions
                </h3>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-600">
                  Solutions Pvt Ltd
                </p>
              </div>
            </div>
          </div>

          {/* Clock Display */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 sm:py-3 px-3 mb-3 sm:mb-4 bg-[#fafafa] border border-[#00a99d] rounded-lg shadow-xs">
            <div className="font-bold text-black text-sm sm:text-base">
              Lunch Break Started
            </div>
            <div className="font-syne font-extrabold text-lg sm:text-xl text-red-600 tabular-nums">
              {formatSecToHMS(scheduledBreakRemaining)}
            </div>
          </div>

          {/* Lunch Finished Prompt Notification */}
          {showLunchFinished && (
            <div className="mb-2 p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
              <span className="text-2xl">🔔</span>
              <h4 className="font-syne font-bold text-emerald-900 text-xs mt-1">
                Lunch Time Finished!
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Continue your work, your lunch time finished!
              </p>
            </div>
          )}

          {/* Error notification (visible on the break card too) */}
          {renderError("mb-2")}

          {/* Action Buttons */}
          <div
            className="space-y-2 sticky bottom-0 bg-white pt-1 pb-1 z-10"
            style={{ WebkitAppRegion: "no-drag" }}
          >
            {!scheduledBreakRunning ? (
              <button
                type="button"
                onClick={() => handleStartScheduledBreak("lunch", 45)}
                disabled={isLoading}
                className="w-full bg-[#00a99d] hover:bg-[#00998f] text-white py-3 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiPlay />
                )}
                Start Lunch Break
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishScheduledBreak}
                disabled={isFinishingBreak}
                className="w-full bg-[#00a99d] hover:bg-[#00998f] text-white py-3 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
              >
                {isFinishingBreak ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheckCircle />
                )}
                Start Work
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowEndConfirm(true)}
              disabled={isLoading}
              className="w-full bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#dc2626] border border-[#fecdd3] rounded-lg py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-all disabled:opacity-50"
            >
              END WORK DAY
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ☕ SEPARATE CARD 2: ACTIVE TEA BREAK (5:00 PM - 5:15 PM)       */}
      {/* ============================================================== */}
      {activeSeparateCard === "tea" && (
        <div
          className="bg-white rounded-2xl border border-[#00a99d] shadow-xl p-4 sm:p-6 max-w-[520px] w-full mx-auto relative overflow-y-auto overflow-x-hidden max-h-[85vh] animate-slide-in font-sans"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div
            className="flex justify-center items-center pb-2 sm:pb-3 mb-3 sm:mb-4"
            style={{ WebkitAppRegion: "drag" }}
          >
            <div className="flex items-center justify-center gap-2 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src="/pms_logo.png"
                  alt="PMS"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-syne font-extrabold text-teal-950 text-sm leading-tight">
                  TEA BREAK ACTIVE
                </h3>
                <p className="text-[10px] font-semibold text-teal-700">
                  5:00 PM – 5:15 PM (15 Minutes)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 sm:py-3 px-3 mb-3 sm:mb-4 bg-[#fafafa] border border-[#00a99d] rounded-lg shadow-xs">
            <div className="font-bold text-black text-sm sm:text-base">
              Tea Break Started
            </div>
            <div className="font-syne font-extrabold text-lg sm:text-xl text-red-600 tabular-nums">
              {formatSecToHMS(scheduledBreakRemaining)}
            </div>
          </div>

          {showTeaFinished && (
            <div className="mb-2 p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
              <span className="text-2xl">🔔</span>
              <h4 className="font-syne font-bold text-emerald-900 text-xs mt-1">
                Tea Break Finished!
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Continue your work, your tea break finished!
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowEndConfirm(true)}
            disabled={isLoading}
            className="w-full bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#dc2626] border border-[#fecdd3] rounded-lg py-2.5 sm:py-3 font-bold text-xs sm:text-sm transition-all disabled:opacity-50 mb-2"
          >
            END WORK DAY
          </button>

          {/* Error notification (visible on the break card too) */}
          {renderError("mb-2")}

          <div
            className="space-y-2 sticky bottom-0 bg-white pt-2 pb-1 z-10"
            style={{ WebkitAppRegion: "no-drag" }}
          >
            {!scheduledBreakRunning ? (
              <button
                type="button"
                onClick={() => handleStartScheduledBreak("tea", 15)}
                disabled={isLoading}
                className="w-full bg-[#00a99d] hover:bg-[#00998f] text-white py-3 sm:py-3.5 px-2 rounded-lg font-bold text-xs sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all text-center"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                ) : (
                  <FiPlay className="shrink-0" />
                )}
                ACTIVE TEA BREAK (START 15 MINS) ☕
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishScheduledBreak}
                disabled={isFinishingBreak}
                className="w-full bg-[#00a99d] hover:bg-[#00998f] text-white py-3 sm:py-3.5 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
              >
                {isFinishingBreak ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheckCircle />
                )}
                START WORK
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🚀 MAIN CARD: START WORK / WORKING WORKDAY CARD                */}
      {/* ============================================================== */}
      {activeSeparateCard === null && (
        <div
          className="bg-white rounded-[clamp(18px,2.5vw,28px)] border border-slate-200/90 shadow-[0_12px_35px_rgba(1,87,84,0.08)] p-3 min-[481px]:p-[clamp(14px,2.2vw,32px)] max-w-[1440px] w-full mx-auto relative overflow-visible transition-all font-sans"
          style={{ backgroundColor: "#ffffff" }}
        >
          {!(punchStatus === "in" || punchStatus === "break") && (
            <div
              className="flex flex-wrap justify-between items-center gap-2 mb-2.5 pb-2 border-b border-slate-100"
              style={{ WebkitAppRegion: "drag" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs overflow-hidden shrink-0">
                  <img
                    src="/pms_logo.png"
                    alt="Pixel Mind Solutions"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-syne font-black text-[#0f2e2e] text-xs sm:text-sm leading-tight tracking-tight truncate">
                    Pixel Mind Solutions
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate max-w-[140px] sm:max-w-[220px]">
                    {staffLabel}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-1.5 sm:gap-2 ml-auto"
                style={{ WebkitAppRegion: "no-drag" }}
              >
                {getStatusBadge()}
                {renderWindowButtons()}
              </div>
            </div>
          )}

          {/* Error notification */}
          {renderError("mb-2")}

          {/* ================= WORKING / ON-BREAK DASHBOARD ================= */}
          {punchStatus === "in" || punchStatus === "break" ? (
            <div
              className="flex flex-col gap-3 min-[481px]:gap-[clamp(12px,2.2vh,28px)] px-1 sm:px-3 pb-3"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              {/* Window Controls */}
              <div
                className="absolute right-3 top-3 sm:right-6 sm:top-6 lg:right-8 lg:top-8 z-10"
                style={{ WebkitAppRegion: "no-drag" }}
              >
                {renderWindowButtons()}
              </div>

              {/* Logo */}
              <div className="flex justify-center items-center pt-1 px-10 sm:px-14">
                <img
                  src="/pms_logo_long_dark.png"
                  alt="Pixelmind Solutions"
                  className="w-full h-[clamp(48px,8vw,96px)] object-contain"
                />
              </div>

              {/* Employee details */}
              <div className="w-fit max-w-full self-center -mt-1 rounded-xl border border-[#d9e8e6] bg-[#f8fbfb] px-3 py-2 shadow-sm">
                <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
                  <span className="min-w-0 max-w-full truncate text-[clamp(12px,1.5vw,20px)] font-bold text-[#0f2e2e]">
                    {staffLabel}
                  </span>

                  {staffDisplayName && employeeId ? (
                    <span className="shrink-0 whitespace-nowrap rounded-full border border-[#d9e8e6] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#015754] sm:text-xs">
                      ID: {employeeId}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Working Time */}
              <div className="rounded-[clamp(14px,1.6vw,20px)] border border-[#b9e4df] bg-[#e6f5f3] px-3 sm:px-4 py-[clamp(12px,2.1vw,28px)] text-center shadow-[0_4px_12px_rgba(1,87,84,0.04)]">
                <div className="text-[clamp(13px,1.5vw,22px)] font-bold text-slate-600 mb-1.5 sm:mb-2">
                  Working Time
                </div>
                <div className="text-[clamp(26px,3.4vw,48px)] leading-[1.15] font-extrabold text-[#015754] tabular-nums tracking-tight break-words">
                  {formatSecToHMS(workingSeconds)}
                </div>
              </div>

              {/* Delay Time | Lunch Break | Tea Break */}
              <div className="grid grid-cols-3 gap-[clamp(6px,2vw,24px)] w-full">
                {/* Delay Time */}
                <div className="min-w-0 rounded-[clamp(14px,1.6vw,20px)] border border-red-100 bg-[#fff5f5] px-1.5 sm:px-2 py-[clamp(12px,2.1vw,28px)] text-center">
                  <div className="text-[clamp(11px,1.5vw,22px)] font-semibold text-slate-600 mb-2 sm:mb-3">
                    Delay Time
                  </div>
                  <div className="text-[clamp(13px,2.2vw,30px)] font-extrabold text-red-600 tabular-nums tracking-tight break-words">
                    {formatSecToHMS(delaySeconds)}
                  </div>
                </div>

                {/* Lunch Break */}
                <button
                  type="button"
                  onClick={() => handleStartScheduledBreak("lunch", 45)}
                  disabled={
                    isLoading ||
                    punchStatus === "break" ||
                    localStorage.getItem(`pms_lunch_done_${todayKey}`) === "1" ||
                    scheduledBreakBlocked
                  }
                  className="min-w-0 rounded-[clamp(14px,1.6vw,20px)] border border-[#b9e4df] bg-[#f0fbf9] px-1.5 sm:px-2 py-[clamp(12px,2.1vw,28px)] text-center hover:bg-[#e2f5f2] enabled:hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="block text-[clamp(11px,1.5vw,22px)] font-semibold text-slate-600 mb-2 sm:mb-3">
                    Lunch Break
                  </span>
                  <span className="block text-[clamp(13px,2.2vw,30px)] font-extrabold text-[#00897b] tabular-nums tracking-tight break-words">
                    {activeSeparateCard === "lunch" && scheduledBreakRunning
                      ? formatSecToMS(scheduledBreakRemaining)
                      : "45:00"}
                  </span>
                </button>

                {/* Tea Break */}
                <button
                  type="button"
                  onClick={() => handleStartScheduledBreak("tea", 15)}
                  disabled={
                    isLoading ||
                    punchStatus === "break" ||
                    localStorage.getItem(`pms_tea_done_${todayKey}`) === "1" ||
                    scheduledBreakBlocked
                  }
                  className="min-w-0 rounded-[clamp(14px,1.6vw,20px)] border border-[#b9e4df] bg-[#f0fbf9] px-1.5 sm:px-2 py-[clamp(12px,2.1vw,28px)] text-center hover:bg-[#e2f5f2] enabled:hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="block text-[clamp(11px,1.5vw,22px)] font-semibold text-slate-600 mb-2 sm:mb-3">
                    Tea Break
                  </span>
                  <span className="block text-[clamp(13px,2.2vw,30px)] font-extrabold text-[#00897b] tabular-nums tracking-tight break-words">
                    {activeSeparateCard === "tea" && scheduledBreakRunning
                      ? formatSecToMS(scheduledBreakRemaining)
                      : "15:00"}
                  </span>
                </button>
              </div>

              {/* Login / Logout */}
              <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 border-t border-gray-200 pt-3 text-[clamp(12px,1.5vw,20px)] font-medium">
                <span className="text-[#00897b]">
                  Login :{" "}
                  {punchStartTimeRef.current
                    ? new Date(punchStartTimeRef.current).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "—"}
                </span>
                <span className="text-red-600">Logout : —</span>
              </div>

              {/* End Work Day */}
              <button
                type="button"
                onClick={() => setShowEndConfirm(true)}
                disabled={isLoading}
                className="w-full py-[clamp(10px,2vh,20px)] text-[clamp(14px,2vw,26px)] rounded-[18px] bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#dc2626] border border-slate-200 font-extrabold transition-all enabled:hover:-translate-y-px disabled:opacity-50"
              >
                END WORK DAY
              </button>
            </div>
          ) : (
            /* Punch Status = 'out' */
            <div
              className="space-y-2.5 w-full max-w-xl mx-auto"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              <div className="text-center py-2 px-3 bg-slate-50/70 border border-slate-200 rounded-2xl">
                <div className="font-syne font-black text-xl sm:text-2xl text-[#063330] tracking-wider tabular-nums leading-none">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-1">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="relative flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FiMapPin className="text-[#00897b] text-sm shrink-0" />
                  <span className="text-xs font-extrabold text-[#063330] shrink-0">
                    Location:
                  </span>
                  <select
                    className="flex-1 min-w-0 bg-transparent text-xs font-bold text-[#063330] outline-none cursor-pointer appearance-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <option value="Office">Office</option>
                    <option value="Work From Home">Work From Home</option>
                    <option value="Client Site">Client Site</option>
                  </select>
                </div>
                <FiChevronDown className="text-slate-400 text-xs pointer-events-none shrink-0" />
              </div>

              <button
                type="button"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer"
                onClick={handleStartWorking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiClock className="text-sm" />
                )}
                START WORKING 🚀
              </button>
            </div>
          )}

          {/* ================= STATE 3: MANUAL BREAK RUNNING ================= */}
          {punchStatus === "break" && (
            <div
              className="space-y-2 w-full max-w-xl mx-auto px-1 sm:px-3"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              <div className="bg-white border border-amber-200 rounded-xl p-2.5 sm:p-3 text-center shadow-xs">
                <div className="text-lg mb-0.5">
                  {breakReason.toLowerCase().includes("meeting") ? "💼" : "☕"}
                </div>
                <div className="font-syne font-bold text-amber-900 text-xs sm:text-sm">
                  {breakReason} Active
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1 text-[11px] sm:text-xs">
                  <div className="text-amber-800 font-semibold">
                    Time Taken:{" "}
                    <span className="font-extrabold font-syne tabular-nums text-amber-950">
                      {formatSecToMS(
                        customBreaksList.find((cb) => cb.status === "active")
                          ?.takenSec || 0,
                      )}
                    </span>
                  </div>
                  <div className="text-slate-400 hidden min-[360px]:block">•</div>
                  <div className="text-slate-500 font-medium">
                    Remaining:{" "}
                    <span className="font-bold font-syne tabular-nums text-slate-700">
                      {formatSecToMS(breakRemainingSec)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResumeManualBreak}
                disabled={isFinishingBreak}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isFinishingBreak ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiPlay />
                )}
                RESUME WORK 💪
              </button>
            </div>
          )}

          {/* ================= STATE 4: WORKDAY COMPLETED ================= */}
          {punchStatus === "completed" && (
            <div className="bg-white border border-teal-200 rounded-2xl p-4 text-center shadow-xs w-full max-w-xl mx-auto">
              <div className="text-2xl mb-1">🎉</div>
              <h4 className="font-syne font-bold text-teal-900 text-sm sm:text-base mb-1">
                Workday Completed!
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mb-2">
                Great work today! You have successfully clocked out.
              </p>
              <div className="text-[10px] sm:text-xs font-semibold text-teal-800 bg-white border border-teal-100 rounded-lg p-2 inline-block max-w-full break-words">
                Total Work: {formatSecToHMS(workingSeconds)} • Delay:{" "}
                {formatSecToHMS(delaySeconds)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: IDLE ALERT ================= */}
      {showIdleModal && punchStatus === "in" && (
        <div className="fixed inset-0 bg-teal-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-teal-100 shadow-2xl p-4 sm:p-6 w-full max-w-[320px] sm:max-w-sm text-center animate-slide-in">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
              ⚠️
            </div>
            <h3 className="font-syne font-extrabold text-teal-900 text-sm sm:text-base mb-1">
              Hey there! 👋
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-1">
              You seem to be away from your desk.
            </p>
            <p className="text-xs sm:text-sm font-semibold text-amber-700 mb-2">
              Delay Time: {formatSecToHMS(delaySeconds)}
            </p>
            <button
              onClick={handleResumeFromIdle}
              className="w-full bg-teal-600 text-white py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:bg-teal-700 text-xs sm:text-sm"
            >
              I'm Back to Cart
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: END CONFIRM ================= */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-teal-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-red-100 shadow-2xl p-4 sm:p-6 w-full max-w-[320px] sm:max-w-sm text-center animate-slide-in">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl font-bold">
              🛑
            </div>
            <h3 className="font-syne font-bold text-slate-800 text-sm sm:text-base mb-1">
              End Workday?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-3">
              Are you sure you want to clock out for today?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="w-full py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndWorkDay}
                disabled={isLoading}
                className="w-full py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
              >
                Yes, End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceWidget;