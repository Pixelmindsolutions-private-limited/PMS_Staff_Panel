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

const API_BASE_CANDIDATES = ["https://pmsbackend.pixelmindsolutions.com/api"];

export const getApiBaseUrl = () => {
  return "https://pmsbackend.pixelmindsolutions.com/api";
};

export const getStoredStaffDetails = () => {
  try {
    const rawSession = sessionStorage.getItem("staffDetails");
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed?.token && parsed?.user) {
        try {
          localStorage.setItem("staffDetails", rawSession);
        } catch (_) {}
        return parsed;
      }
    }
  } catch (_) {}

  try {
    const rawLocal = localStorage.getItem("staffDetails");
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed?.token && parsed?.user) {
        return parsed;
      }
    }
  } catch (_) {}
  return null;
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
    if (typeof window !== "undefined" && window.electronAPI?.toggleSize) {
      window.electronAPI.toggleSize();
    }
    setIsCardMinimized((prev) => !prev);
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
        // Extra height for the "Finished" banner so the Finish button
        // does not scroll out of the fixed-height Electron window.
        const showFinishedBanner =
          (activeSeparateCard === "lunch" && showLunchFinished) ||
          (activeSeparateCard === "tea" && showTeaFinished);
        window.electronAPI.setHeight(showFinishedBanner ? 460 : 380);
      } else {
        window.electronAPI.setHeight(385);
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

  // ===== NEW: absolute timestamp anchors for break timers =====
  // These are the source of truth for break timing. All break display
  // values are derived from these on every tick and on every resume event.
  const scheduledBreakStartMsRef = useRef(null); // Date.now() of break start
  const scheduledBreakEndMsRef = useRef(null);   // expectedEndTime in ms
  const manualBreakStartMsRef = useRef(null);    // personal/meeting start
  const manualBreakEndMsRef = useRef(null);      // personal/meeting end
  const finishedNoticeShownRef = useRef(false);  // guard duplicate toasts

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
    } catch (_) {}
  };

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
      } catch (_) {}
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
        } catch (_) {}
      } else if (activeSeparateCard === "tea") {
        setTeaTakenSec(elapsed);
        try {
          localStorage.setItem(`pms_tea_taken_${todayStr}`, String(elapsed));
        } catch (_) {}
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
        } catch (_) {}
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
          const totalIdle = Math.floor(
            (Number(res.data.totalIdleTime) || 0) * 60,
          );

          setDelaySeconds(totalIdle);
          if (Array.isArray(res.data.breaks)) {
            let lunchSec = 0;
            let teaSec = 0;
            const customs = [];

            res.data.breaks.forEach((b, idx) => {
              const rawType = String(b.type || b.reason || "").toLowerCase();
              const durationSec = b.duration
                ? Math.round(b.duration * 60)
                : b.startTime && b.endTime
                  ? Math.max(
                      0,
                      Math.floor(
                        (new Date(b.endTime) - new Date(b.startTime)) / 1000,
                      ),
                    )
                  : 0;

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
              } catch (_) {}
            }
            if (teaSec > 0) {
              setTeaTakenSec(teaSec);
              try {
                localStorage.setItem(
                  `pms_tea_taken_${todayStr}`,
                  String(teaSec),
                );
              } catch (_) {}
            }
            if (customs.length > 0) {
              setCustomBreaksList(customs);
              try {
                localStorage.setItem(
                  `pms_custom_breaks_${todayStr}`,
                  JSON.stringify(customs),
                );
              } catch (_) {}
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
            setIsCurrentlyIdle(status === "idle");
            isCurrentlyIdleRef.current = status === "idle";
            setShowIdleModal(status === "idle");
            lastActivityTimeRef.current = Date.now();
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

  useEffect(() => {
    const removeAuthSync = window.electronAPI?.onAuthSync?.(async (payload) => {
      if (!payload?.token || !payload?.user) {
        console.warn("Invalid login-sync payload");
        return;
      }

      const user = payload.user;

      console.log("New login employee:", user.employeeId, user.employeeName);

      const newDetails = {
        token: payload.token,
        user,
      };

      try {
        sessionStorage.setItem("staffDetails", JSON.stringify(newDetails));
        localStorage.setItem("staffDetails", JSON.stringify(newDetails));
      } catch (error) {
        console.error("Unable to save staff details:", error);
      }

      setStaffDetails(user);
      setEmployeeId(user.employeeId || "");
      setAuthToken(payload.token);

      await refreshStatus(payload.token, user.employeeId);
    });

    return () => {
      if (typeof removeAuthSync === "function") {
        removeAuthSync();
      }
    };
  }, [refreshStatus]);

  // Mount setup
  useEffect(() => {
    const details = getStoredStaffDetails();
    console.log(
      "Stored employee:",
      details?.user?.employeeId,
      details?.user?.employeeName,
    );
    if (details) {
      setStaffDetails(details.user);
      setEmployeeId(details.user.employeeId);
      setAuthToken(details.token);
      refreshStatus(details.token, details.user.employeeId);
    }

    try {
      const channel = new BroadcastChannel("pms_attendance_sync");
      syncChannelRef.current = channel;
      channel.onmessage = (event) => {
        const { type } = event.data || {};
        if (type === "STATE_UPDATED") {
          const d = getStoredStaffDetails();
          if (d) refreshStatus(d.token, d.user.employeeId);
        }
      };
    } catch (_) {}

    return () => {
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
        // Report confirmed human input, even when currently Working.
        const res = await apiCall("/work-session/heartbeat", "POST", {
          employeeId,
          activityType: "human",
        });

        if (!mounted || !res?.success) return;

        if (res.data?.status === "working") {
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
            setIsCurrentlyIdle(true);
            setShowIdleModal(true);
          }
          setDelaySeconds((prev) => prev + 1);
        } else if (!isCurrentlyIdleRef.current) {
          setWorkingSeconds((prev) => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [punchStatus, activeSeparateCard, scheduledBreakRunning, recalcBreakTimers]);

  // ===== NEW: recompute on resume from sleep / screen-off / visibility / focus =====
  useEffect(() => {
    const onResume = () => {
      // Recompute locally first so the UI is correct instantly, then re-sync
      // with the backend (source of truth) to restore any changes made while
      // this window was asleep.
      recalcBreakTimers();
      const details = getStoredStaffDetails();
      if (details?.token && details?.user?.employeeId) {
        refreshStatus(details.token, details.user.employeeId);
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
        });
      } catch (_) {}
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
        });
      } catch (primaryError) {
        // Compatibility fallback for backends that resume through report-idle.
        res = await apiCall("/work-session/report-idle", "POST", {
          employeeId,
          activityType: "human",
        });
      }

      if (!res?.success) {
        throw new Error("The server did not confirm that the session resumed.");
      }

      lastActivityTimeRef.current = Date.now();
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

  // Start Scheduled Break (Lunch: 45m, Tea: 15m)
  const handleStartScheduledBreak = async (type, durationMin) => {
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
      setError(err.message || `Unable to start ${type} break`);
      // Local fallback: anchor to now (server was unreachable).
      const startMs = Date.now();
      const endMs = startMs + durationMin * 60 * 1000;
      scheduledBreakStartMsRef.current = startMs;
      scheduledBreakEndMsRef.current = endMs;
      finishedNoticeShownRef.current = false;
      setScheduledBreakRunning(true);
      setScheduledBreakRemaining(durationMin * 60);
      setScheduledBreakElapsed(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Finish Scheduled Break and Resume Work (Lunch / Tea)
  const handleFinishScheduledBreak = async () => {
    // Prevent duplicate /end-break calls
    if (finishingBreakRef.current) return;
    finishingBreakRef.current = true;
    setIsFinishingBreak(true);
    setError("");

    const todayStr = new Date().toISOString().split("T")[0];
    const breakType = activeSeparateCard;

    try {
      let res = null;
      let apiFailed = false;
      let apiErrorMessage = "";

      try {
        res = await apiCall("/work-session/end-break", "POST", {
          employeeId,
        });
      } catch (err) {
        apiFailed = true;
        apiErrorMessage = err?.message || "";

        // If the backend already auto-ended the break (scheduled expiry
        // handled server-side), this is not an error — proceed with the
        // local reset so the UI can move on.
        const lower = apiErrorMessage.toLowerCase();
        const looksLikeNoActiveBreak =
          lower.includes("no active break") ||
          lower.includes("break not found") ||
          lower.includes("no break") ||
          lower.includes("already ended") ||
          lower.includes("not currently on break");

        if (!looksLikeNoActiveBreak) {
          throw err;
        }
      }

      // Accept any response shape the backend uses
      const actualBreak =
        res?.data?.break ||
        res?.data?.endedBreak ||
        res?.data?.currentBreak ||
        res?.break ||
        null;

      // Compute actual seconds — prefer backend truth, else derive from anchors
      let actualSeconds = 0;
      if (actualBreak) {
        actualSeconds = Math.max(
          0,
          Number(
            actualBreak.durationSeconds ??
              Math.round(Number(actualBreak.duration || 0) * 60),
          ),
        );
      } else if (scheduledBreakStartMsRef.current != null) {
        actualSeconds = Math.max(
          0,
          Math.floor((Date.now() - scheduledBreakStartMsRef.current) / 1000),
        );
      }

      // Clear timestamp anchors
      scheduledBreakStartMsRef.current = null;
      scheduledBreakEndMsRef.current = null;
      finishedNoticeShownRef.current = false;

      // Reset break UI state
      setScheduledBreakRunning(false);
      setScheduledBreakElapsed(actualSeconds);
      setScheduledBreakRemaining(0);
      setActiveSeparateCard(null);
      setShowLunchFinished(false);
      setShowTeaFinished(false);
      setPunchStatus("in");

      // Mark this break as done for today
      if (breakType === "lunch") {
        localStorage.setItem(`pms_lunch_done_${todayStr}`, "1");
        try {
          localStorage.setItem(
            `pms_lunch_taken_${todayStr}`,
            String(actualSeconds),
          );
        } catch (_) {}
      }
      if (breakType === "tea") {
        localStorage.setItem(`pms_tea_done_${todayStr}`, "1");
        try {
          localStorage.setItem(
            `pms_tea_taken_${todayStr}`,
            String(actualSeconds),
          );
        } catch (_) {}
      }

      isCurrentlyIdleRef.current = false;
      setIsCurrentlyIdle(false);
      setShowIdleModal(false);
      lastActivityTimeRef.current = Date.now();

      broadcastSync("STATE_UPDATED", { status: "working" });

      // Best-effort re-sync
      refreshStatus(authToken, employeeId).catch((e) =>
        console.warn("Post-break refresh failed:", e?.message),
      );

      // ===== Open the End Work popup after finishing the break =====
      setShowEndConfirm(true);

      if (apiFailed) {
        console.warn(
          "end-break API reported no active break — UI advanced locally:",
          apiErrorMessage,
        );
      }
    } catch (err) {
      console.error("Finish break API failed:", err);
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
        } catch (_) {}
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
      let res = null;
      let apiFailed = false;
      let apiErrorMessage = "";

      try {
        res = await apiCall("/work-session/end-break", "POST", { employeeId });
      } catch (err) {
        apiFailed = true;
        apiErrorMessage = err?.message || "";
        const lower = apiErrorMessage.toLowerCase();
        const looksLikeNoActiveBreak =
          lower.includes("no active break") ||
          lower.includes("break not found") ||
          lower.includes("no break") ||
          lower.includes("already ended") ||
          lower.includes("not currently on break");
        if (!looksLikeNoActiveBreak) throw err;
      }

      const actualBreak =
        res?.data?.break ||
        res?.data?.endedBreak ||
        res?.data?.currentBreak ||
        res?.break ||
        null;

      let actualSeconds = 0;
      if (actualBreak) {
        actualSeconds = Math.max(
          0,
          Number(
            actualBreak.durationSeconds ??
              Math.round(Number(actualBreak.duration || 0) * 60),
          ),
        );
      } else if (manualBreakStartMsRef.current != null) {
        actualSeconds = Math.max(
          0,
          Math.floor((Date.now() - manualBreakStartMsRef.current) / 1000),
        );
      }

      const todayStr = new Date().toISOString().split("T")[0];

      setCustomBreaksList((prev) => {
        const next = prev.map((item) =>
          item.status === "active"
            ? {
                ...item,
                status: "ended",
                startTime: actualBreak?.startTime || item.startTime,
                endTime: actualBreak?.endTime || new Date().toISOString(),
                duration: actualBreak?.duration,
                takenSec: actualSeconds,
              }
            : item,
        );
        try {
          localStorage.setItem(
            `pms_custom_breaks_${todayStr}`,
            JSON.stringify(next),
          );
        } catch (_) {}
        return next;
      });

      manualBreakStartMsRef.current = null;
      manualBreakEndMsRef.current = null;

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

      // Open the End Work popup after finishing a manual break too
      setShowEndConfirm(true);

      if (apiFailed) {
        console.warn(
          "Manual end-break API reported no active break — UI advanced locally:",
          apiErrorMessage,
        );
      }
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

  const getStatusBadge = () => {
    if (punchStatus === "in") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-[#e6f7f4] text-[#00897b] border-[#a3e3d8] flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#00b09b] animate-pulse" />
          Working
        </span>
      );
    }
    if (punchStatus === "break") {
      const label = activeSeparateCard === "lunch" ? "Lunch Break" : "On Break";
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {label}
        </span>
      );
    }
    if (punchStatus === "completed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs">
          Work Ended
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-200 shadow-xs">
        Not Working
      </span>
    );
  };

  const renderWindowButtons = () => (
    <div
      className="flex items-center gap-1 bg-[#f8fafc] border border-slate-200 rounded-xl p-1"
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

  if (isCardMinimized) {
    return (
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl px-3.5 py-2 max-w-sm w-full mx-auto flex items-center justify-between select-none animate-slide-in font-sans"
        style={{ backgroundColor: "#ffffff", WebkitAppRegion: "drag" }}
      >
        <div className="flex items-center gap-2">
          <img
            src="/pms_logo.png"
            alt="PMS"
            className="w-5 h-5 object-contain rounded"
          />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-syne font-bold text-teal-900 text-xs tabular-nums">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            Work:{" "}
            <span className="font-bold text-teal-700 tabular-nums">
              {formatSecToHMS(workingSeconds)}
            </span>
          </span>
        </div>
        <div
          className="flex items-center gap-1"
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
    <div className="relative select-none font-sans">
      {/* ============================================================== */}
      {/* 🍱 SEPARATE CARD 1: ACTIVE LUNCH BREAK (1:00 PM - 1:45 PM)     */}
      {/* ============================================================== */}
      {activeSeparateCard === "lunch" && (
        <div
          className="bg-white rounded-3xl border border-amber-200 shadow-2xl p-3.5 sm:p-4 max-w-[650px] w-full mx-auto relative overflow-hidden animate-slide-in font-sans"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Draggable header bar */}
          <div
            className="flex justify-between items-center pb-2 mb-2 border-b border-amber-100"
            style={{ WebkitAppRegion: "drag" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white border border-amber-200 flex items-center justify-center p-1 shadow-sm overflow-hidden">
                <img
                  src="/pms_logo.png"
                  alt="PMS"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-syne font-extrabold text-amber-950 text-sm leading-tight">
                  LUNCH BREAK ACTIVE
                </h3>
                <p className="text-[10px] font-semibold text-amber-700">
                  1:00 PM – 1:45 PM (45 Minutes)
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                {scheduledBreakRunning ? "Active" : "1:00 PM"}
              </span>
              {renderWindowButtons()}
            </div>
          </div>

          {/* Clock Display */}
          <div className="text-center py-2 mb-3 bg-white border border-amber-100 rounded-2xl shadow-xs">
            <div className="font-syne font-extrabold text-3xl text-amber-900 tabular-nums">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              {scheduledBreakRunning
                ? "Lunch in progress"
                : "Lunch break is ready for you!"}
            </p>
          </div>

          {/* Countdown & Elapsed Box */}
          {scheduledBreakRunning && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white border border-amber-200 rounded-xl p-3 text-center shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                  Time Taken
                </div>
                <div className="font-syne font-extrabold text-xl text-amber-900 tabular-nums">
                  {formatSecToMS(lunchTakenSec)}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Remaining
                </div>
                <div className="font-syne font-extrabold text-xl text-slate-800 tabular-nums">
                  {formatSecToMS(scheduledBreakRemaining)}
                </div>
              </div>
            </div>
          )}

          {/* Lunch Finished Prompt Notification */}
          {showLunchFinished && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-center">
              <span className="text-2xl">🔔</span>
              <h4 className="font-syne font-bold text-emerald-900 text-xs mt-1">
                Lunch Time Finished!
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Continue your work, your lunch time finished!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2" style={{ WebkitAppRegion: "no-drag" }}>
            {!scheduledBreakRunning ? (
              <button
                type="button"
                onClick={() => handleStartScheduledBreak("lunch", 45)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiPlay />
                )}
                ACTIVE LUNCH (START 45 MINS) 🍱
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishScheduledBreak}
                disabled={isFinishingBreak}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {isFinishingBreak ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheckCircle />
                )}
                FINISH LUNCH & RESUME WORK 🚀
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ☕ SEPARATE CARD 2: ACTIVE TEA BREAK (5:00 PM - 5:15 PM)       */}
      {/* ============================================================== */}
      {activeSeparateCard === "tea" && (
        <div
          className="bg-white rounded-3xl border border-teal-200 shadow-2xl p-3.5 sm:p-4 max-w-[650px] w-full mx-auto relative overflow-hidden animate-slide-in font-sans"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div
            className="flex justify-between items-center pb-2 mb-2 border-b border-teal-100"
            style={{ WebkitAppRegion: "drag" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white border border-teal-200 flex items-center justify-center p-1 shadow-sm overflow-hidden">
                <img
                  src="/pms_logo.png"
                  alt="PMS"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-syne font-extrabold text-teal-950 text-sm leading-tight">
                  TEA BREAK ACTIVE
                </h3>
                <p className="text-[10px] font-semibold text-teal-700">
                  5:00 PM – 5:15 PM (15 Minutes)
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                {scheduledBreakRunning ? "Active" : "5:00 PM"}
              </span>
              {renderWindowButtons()}
            </div>
          </div>

          <div className="text-center py-2 mb-3 bg-white border border-teal-100 rounded-2xl shadow-xs">
            <div className="font-syne font-extrabold text-3xl text-teal-900 tabular-nums">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <p className="text-[11px] text-teal-700 mt-1">
              {scheduledBreakRunning
                ? "Tea break in progress"
                : "Time for a quick tea break!"}
            </p>
          </div>

          {scheduledBreakRunning && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white border border-teal-200 rounded-xl p-3 text-center shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-0.5">
                  Time Taken
                </div>
                <div className="font-syne font-extrabold text-xl text-teal-900 tabular-nums">
                  {formatSecToMS(teaTakenSec)}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Remaining
                </div>
                <div className="font-syne font-extrabold text-xl text-slate-800 tabular-nums">
                  {formatSecToMS(scheduledBreakRemaining)}
                </div>
              </div>
            </div>
          )}

          {showTeaFinished && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-center">
              <span className="text-2xl">🔔</span>
              <h4 className="font-syne font-bold text-emerald-900 text-xs mt-1">
                Tea Break Finished!
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium">
                Continue your work, your tea break finished!
              </p>
            </div>
          )}

          <div className="space-y-2" style={{ WebkitAppRegion: "no-drag" }}>
            {!scheduledBreakRunning ? (
              <button
                type="button"
                onClick={() => handleStartScheduledBreak("tea", 15)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiPlay />
                )}
                ACTIVE TEA BREAK (START 15 MINS) ☕
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishScheduledBreak}
                disabled={isFinishingBreak}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {isFinishingBreak ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheckCircle />
                )}
                FINISH TEA BREAK & RESUME WORK 🚀
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
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-3.5 max-w-[650px] w-full mx-auto relative overflow-hidden transition-all font-sans"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Top Header - Draggable on desktop wallpaper */}
          <div
            className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100"
            style={{ WebkitAppRegion: "drag" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs overflow-hidden">
                <img
                  src="/pms_logo.png"
                  alt="Pixel Mind Solutions"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div>
                <h3 className="font-syne font-black text-[#0f2e2e] text-sm leading-tight tracking-tight">
                  Pixel Mind Solutions
                </h3>

                <p className="text-[11px] text-slate-500 font-semibold truncate max-w-[180px]">
                  {staffDetails?.employeeName ||
                    staffDetails?.name ||
                    "Loading staff..."}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2"
              style={{ WebkitAppRegion: "no-drag" }}
            >
              {getStatusBadge()}
              {renderWindowButtons()}
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div className="mb-2 p-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <FiAlertCircle /> {error}
              </span>
              <button
                onClick={() => setError("")}
                className="text-red-500 font-bold ml-2"
              >
                ×
              </button>
            </div>
          )}

          {/* 2-COLUMN HALF-HEIGHT LAYOUT (Clock/Timers on Left, Breaks on Right) */}
          {punchStatus === "in" || punchStatus === "break" ? (
            <div className="grid grid-cols-2 gap-3 items-start">
              {/* ===== LEFT COLUMN: Clock, Location, Live Timers & End Work Day ===== */}
              <div className="space-y-2">
                {/* Compact Digital Clock Display */}
                <div className="text-center py-2 px-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl shadow-xs">
                  <div className="font-syne font-black text-2xl text-[#063330] tracking-wider tabular-nums leading-none">
                    {currentTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Location Row */}
                <div
                  className="relative flex items-center justify-between bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs"
                  style={{ WebkitAppRegion: "no-drag" }}
                >
                  <div className="flex items-center gap-1.5 flex-1">
                    <FiMapPin className="text-[#00897b] text-xs shrink-0" />
                    <span className="text-[11px] font-extrabold text-[#063330] shrink-0">
                      Location:
                    </span>
                    <select
                      className="flex-1 bg-transparent text-[11px] font-bold text-[#063330] outline-none cursor-pointer appearance-none"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={punchStatus !== "out"}
                    >
                      <option value="Office">Office</option>
                      <option value="Work From Home">Work From Home</option>
                      <option value="Client Site">Client Site</option>
                    </select>
                  </div>
                  <FiChevronDown className="text-slate-400 text-xs pointer-events-none shrink-0" />
                </div>

                {/* LIVE TIMERS: Working Time & Delay Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#f0faf8] border border-[#b2e2d9] rounded-xl p-2 text-center shadow-xs">
                    <div className="text-[9px] font-black uppercase tracking-wider text-[#00897b] flex items-center justify-center gap-1 mb-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isCurrentlyIdle ? "bg-slate-300" : "bg-[#00b09b] animate-pulse"}`}
                      />
                      WORKING
                    </div>
                    <div className="font-syne font-black text-lg text-[#04332d] tabular-nums tracking-wide">
                      {formatSecToHMS(workingSeconds)}
                    </div>
                  </div>

                  <div
                    className={`border rounded-xl p-2 text-center shadow-xs transition-all ${
                      isCurrentlyIdle
                        ? "border-amber-400 ring-1 ring-amber-300 bg-amber-50/40"
                        : "bg-[#f4f7fb] border-[#cbd5e1]"
                    }`}
                  >
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1 mb-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isCurrentlyIdle ? "bg-amber-500 animate-ping" : "bg-slate-400"}`}
                      />
                      DELAY
                    </div>
                    <div
                      className={`font-syne font-black text-lg tabular-nums tracking-wide ${isCurrentlyIdle ? "text-amber-700" : "text-[#1e293b]"}`}
                    >
                      {formatSecToHMS(delaySeconds)}
                    </div>
                  </div>
                </div>

                {/* END WORK DAY BUTTON */}
                <div style={{ WebkitAppRegion: "no-drag" }}>
                  <button
                    type="button"
                    className="w-full bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#dc2626] border border-[#fecdd3] rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    onClick={() => setShowEndConfirm(true)}
                    disabled={isLoading}
                  >
                    <FiCheckCircle className="text-red-500 text-xs" /> END WORK
                    DAY
                  </button>
                </div>
              </div>

              {/* ===== RIGHT COLUMN: Break Summary & Break Controls ===== */}
              <div className="space-y-2">
                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
                  <div className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="text-[#92400e]">BREAK SUMMARY</span>
                    <span className="text-[9px] font-bold text-slate-400">
                      OFFICE SCHEDULE
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-0.5">
                    {/* Lunch Row */}
                    <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🍱</span>
                        <div>
                          <span className="font-bold text-slate-800 text-[11px] block leading-tight">
                            Lunch (1:00 - 1:45 PM)
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            45 Mins standard
                          </span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        style={{ WebkitAppRegion: "no-drag" }}
                      >
                        {lunchTakenSec > 0 ||
                        (activeSeparateCard === "lunch" &&
                          scheduledBreakRunning) ? (
                          <>
                            <span
                              className={`font-syne font-black px-2 py-0.5 rounded-md border text-[10px] tabular-nums ${
                                activeSeparateCard === "lunch" &&
                                scheduledBreakRunning
                                  ? "text-amber-800 bg-amber-50 border-amber-300 animate-pulse"
                                  : "text-[#00897b] bg-[#e6f7f4] border-[#a3e3d8]"
                              }`}
                            >
                              Taken: {formatSecToMS(lunchTakenSec)}
                            </span>
                            {activeSeparateCard === "lunch" &&
                              scheduledBreakRunning && (
                                <button
                                  type="button"
                                  onClick={handleFinishScheduledBreak}
                                  disabled={isFinishingBreak}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                                >
                                  <FiPlay className="text-[8px]" /> Resume
                                </button>
                              )}
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSeparateCard("lunch");
                              handleStartScheduledBreak("lunch", 45);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <FiPlay className="text-[9px]" /> Lunch
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tea Row */}
                    <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">☕</span>
                        <div>
                          <span className="font-bold text-slate-800 text-[11px] block leading-tight">
                            Tea Break (5:00 - 5:15 PM)
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            15 Mins standard
                          </span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        style={{ WebkitAppRegion: "no-drag" }}
                      >
                        {teaTakenSec > 0 ||
                        (activeSeparateCard === "tea" &&
                          scheduledBreakRunning) ? (
                          <>
                            <span
                              className={`font-syne font-black px-2 py-0.5 rounded-md border text-[10px] tabular-nums ${
                                activeSeparateCard === "tea" &&
                                scheduledBreakRunning
                                  ? "text-teal-800 bg-teal-50 border-teal-300 animate-pulse"
                                  : "text-[#00897b] bg-[#e6f7f4] border-[#a3e3d8]"
                              }`}
                            >
                              Taken: {formatSecToMS(teaTakenSec)}
                            </span>
                            {activeSeparateCard === "tea" &&
                              scheduledBreakRunning && (
                                <button
                                  type="button"
                                  onClick={handleFinishScheduledBreak}
                                  disabled={isFinishingBreak}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                                >
                                  <FiPlay className="text-[8px]" /> Resume
                                </button>
                              )}
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSeparateCard("tea");
                              handleStartScheduledBreak("tea", 15);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                          >
                            <FiPlay className="text-[9px]" /> Tea
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Custom Break Row(s) */}
                    {customBreaksList && customBreaksList.length > 0 ? (
                      customBreaksList.map((cb, idx) => {
                        const isMeeting = String(cb.reason || cb.type || "")
                          .toLowerCase()
                          .includes("meeting");
                        const isActive =
                          cb.status === "active" && punchStatus === "break";
                        const displayReason =
                          cb.reason ||
                          (isMeeting ? "Meeting" : "Personal Break");
                        return (
                          <div
                            key={cb.id || idx}
                            className="flex items-center justify-between bg-slate-50/50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">
                                {isMeeting ? "💼" : "☕"}
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 text-[11px] block leading-tight">
                                  {displayReason}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">
                                  {cb.duration
                                    ? `${cb.duration} Mins custom`
                                    : "Custom"}
                                </span>
                              </div>
                            </div>
                            <div
                              className="flex items-center gap-1"
                              style={{ WebkitAppRegion: "no-drag" }}
                            >
                              <span
                                className={`font-syne font-black text-[10px] px-2 py-0.5 rounded-md border tabular-nums ${
                                  isActive
                                    ? "text-amber-800 bg-amber-50 border-amber-300 animate-pulse"
                                    : "text-[#00897b] bg-[#e6f7f4] border-[#a3e3d8]"
                                }`}
                              >
                                Taken: {formatSecToMS(cb.takenSec || 0)}
                              </span>
                              {isActive && (
                                <button
                                  type="button"
                                  onClick={handleResumeManualBreak}
                                  disabled={isFinishingBreak}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                                >
                                  <FiPlay className="text-[8px]" /> Resume
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">💼</span>
                          <div>
                            <span className="font-bold text-slate-800 text-[11px] block leading-tight">
                              {breakReason}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {breakDuration} Mins custom
                            </span>
                          </div>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          style={{ WebkitAppRegion: "no-drag" }}
                        >
                          <span className="font-syne font-black text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[10px] tabular-nums">
                            Taken: 00m 00s
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Break Selector & Action Box */}
                <div
                  className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs"
                  style={{ WebkitAppRegion: "no-drag" }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700 shrink-0">
                      ☕ Break:
                    </span>
                    <div className="relative flex-1">
                      <select
                        value={breakReason}
                        onChange={(e) => setBreakReason(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg pl-2 pr-5 py-1 text-[11px] font-bold text-slate-800 outline-none cursor-pointer appearance-none transition-all"
                      >
                        <option value="Personal Break">Personal Break</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Short Break">Short Break</option>
                      </select>
                      <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                    </div>
                    <div className="relative w-20 shrink-0">
                      <select
                        value={breakDuration}
                        onChange={(e) =>
                          setBreakDuration(Number(e.target.value))
                        }
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg pl-2 pr-4 py-1 text-[11px] font-bold text-slate-800 outline-none cursor-pointer appearance-none transition-all"
                      >
                        <option value={15}>15 Mins</option>
                        <option value={30}>30 Mins</option>
                        <option value={45}>45 Mins</option>
                        <option value={60}>60 Mins</option>
                      </select>
                      <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartManualBreak}
                    disabled={isLoading}
                    className="w-full bg-[#e8f7f4] hover:bg-[#d4f2ec] text-[#00897b] border border-[#a3e3d8] py-1.5 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    Take {breakReason} ({breakDuration}m){" "}
                    {breakReason.toLowerCase().includes("meeting")
                      ? "💼"
                      : "☕"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Punch Status = 'out' */
            <div className="space-y-2.5" style={{ WebkitAppRegion: "no-drag" }}>
              <div className="text-center py-2 px-3 bg-slate-50/70 border border-slate-200 rounded-2xl">
                <div className="font-syne font-black text-2xl text-[#063330] tracking-wider tabular-nums leading-none">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="relative flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
                <div className="flex items-center gap-2 flex-1">
                  <FiMapPin className="text-[#00897b] text-sm shrink-0" />
                  <span className="text-xs font-extrabold text-[#063330] shrink-0">
                    Location:
                  </span>
                  <select
                    className="flex-1 bg-transparent text-xs font-bold text-[#063330] outline-none cursor-pointer appearance-none"
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
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-xs cursor-pointer"
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
            <div className="space-y-2" style={{ WebkitAppRegion: "no-drag" }}>
              <div className="bg-white border border-amber-200 rounded-xl p-2.5 text-center shadow-xs">
                <div className="text-lg mb-0.5">
                  {breakReason.toLowerCase().includes("meeting") ? "💼" : "☕"}
                </div>
                <div className="font-syne font-bold text-amber-900 text-xs">
                  {breakReason} Active
                </div>
                <div className="flex items-center justify-center gap-3 mt-1 text-xs">
                  <div className="text-amber-800 font-semibold">
                    Time Taken:{" "}
                    <span className="font-extrabold font-syne tabular-nums text-amber-950">
                      {formatSecToMS(
                        customBreaksList.find((cb) => cb.status === "active")
                          ?.takenSec || 0,
                      )}
                    </span>
                  </div>
                  <div className="text-slate-400">•</div>
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
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60"
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
            <div className="bg-white border border-teal-200 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-2xl mb-1">🎉</div>
              <h4 className="font-syne font-bold text-teal-900 text-sm mb-1">
                Workday Completed!
              </h4>
              <p className="text-xs text-slate-500 mb-2">
                Great work today! You have successfully clocked out.
              </p>
              <div className="text-[10px] font-semibold text-teal-800 bg-white border border-teal-100 rounded-lg p-2 inline-block">
                Total Work: {formatSecToHMS(workingSeconds)} • Delay:{" "}
                {formatSecToHMS(delaySeconds)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: IDLE ALERT ================= */}
      {showIdleModal && punchStatus === "in" && (
        <div className="fixed inset-0 bg-teal-950/60 backdrop-blur-sm flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl border border-teal-100 shadow-2xl p-5 max-w-[320px] w-full text-center animate-slide-in">
            <div className="w-12 h-12 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl">
              ⚠️
            </div>
            <h3 className="font-syne font-extrabold text-teal-900 text-sm mb-1">
              Hey there! 👋
            </h3>
            <p className="text-xs text-slate-500 mb-1">
              You seem to be away from your desk.
            </p>
            <p className="text-xs font-semibold text-amber-700 mb-2">
              Delay Time: {formatSecToHMS(delaySeconds)}
            </p>
            <button
              onClick={handleResumeFromIdle}
              className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-bold shadow-md hover:bg-teal-700 text-xs"
            >
              I'm Back to Cart
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: END CONFIRM ================= */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-teal-950/60 backdrop-blur-sm flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl border border-red-100 shadow-2xl p-5 max-w-[320px] w-full text-center animate-slide-in">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2 text-xl font-bold">
              🛑
            </div>
            <h3 className="font-syne font-bold text-slate-800 text-sm mb-1">
              End Workday?
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Are you sure you want to clock out for today?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndWorkDay}
                disabled={isLoading}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md"
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