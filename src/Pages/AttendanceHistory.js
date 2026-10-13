

// // AttendanceHistory.jsx - Fixed with correct API endpoints
// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle,
//   FiSearch, FiDownload, FiEye, FiChevronLeft, FiChevronRight,
//   FiCoffee, FiBarChart2, FiLoader, FiRefreshCw, FiPlay, FiPause
// } from 'react-icons/fi';
// import axios from 'axios';

// const API_BASE_URL = 'https://pmsbackend.pixelmindsolutions.com/api';

// const AttendanceHistory = () => {
//   const [sessions, setSessions] = useState([]);
//   const [filteredSessions, setFilteredSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [employeeId, setEmployeeId] = useState(null);
//   const [employeeName, setEmployeeName] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
//   const [stats, setStats] = useState({ totalWork: 0, totalBreak: 0, totalIdle: 0, avgEfficiency: 0 });
//   const [showTimeline, setShowTimeline] = useState(false);
//   const [timeline, setTimeline] = useState(null);
  
//   const perPage = 10;

//   // Get employee data from session storage
//   const getUserDataFromStorage = () => {
//     try {
//       // First try to get staffDetails from login
//       const staffDetails = sessionStorage.getItem('staffDetails');
//       if (staffDetails) {
//         const parsed = JSON.parse(staffDetails);
//         return {
//           employeeId: parsed.user?.employeeId,
//           employeeName: parsed.user?.employeeName,
//           token: parsed.token
//         };
//       }
      
//       // Alternative: Check for individual items
//       const empId = sessionStorage.getItem('employeeId');
//       const token = sessionStorage.getItem('token');
//       const empName = sessionStorage.getItem('employeeName');
      
//       return {
//         employeeId: empId,
//         employeeName: empName,
//         token: token
//       };
//     } catch (err) {
//       console.error('Error parsing user data:', err);
//       return { employeeId: null, employeeName: null, token: null };
//     }
//   };

//   // Fetch all sessions from backend - using correct endpoint from your routes
//   const fetchSessions = useCallback(async () => {
//     const { employeeId: empId, employeeName: empName, token } = getUserDataFromStorage();
    
//     if (!empId) {
//       console.error('No employeeId found in session storage');
//       setError('Employee ID not found. Please login again.');
//       setLoading(false);
//       return;
//     }

//     setEmployeeId(empId);
//     setEmployeeName(empName);
//     setLoading(true);
//     setError(null);
    
//     try {
//       console.log('Fetching sessions for employee:', empId);
      
//       // Using the correct endpoint from your backend routes
//       // Based on your routes: GET /api/work-session/all-sessions/:employeeId
//       const response = await axios.get(
//         `${API_BASE_URL}/work-session/all-sessions/${empId}`,
//         { 
//           headers: { 
//             Authorization: token ? `Bearer ${token}` : '',
//             'Content-Type': 'application/json'
//           } 
//         }
//       );
      
//       console.log('API Response:', response.data);
      
//       if (response.data.success) {
//         const sessionsData = response.data.data?.sessions || [];
//         setSessions(sessionsData);
//         setFilteredSessions(sessionsData);
        
//         // Calculate statistics
//         const totalWork = sessionsData.reduce((sum, s) => sum + (s.totalWorkDuration || 0), 0) / 60;
//         const totalBreak = sessionsData.reduce((sum, s) => sum + (s.totalBreakDuration || 0), 0) / 60;
//         const totalIdle = sessionsData.reduce((sum, s) => sum + (s.totalIdleTime || 0), 0) / 60;
        
//         // Calculate average efficiency
//         const completedSessions = sessionsData.filter(s => s.status === 'completed' && s.totalWorkDuration > 0);
//         let avgEfficiency = 0;
//         if (completedSessions.length > 0) {
//           const totalEfficiency = completedSessions.reduce((sum, s) => {
//             const total = (s.totalWorkDuration || 0) + (s.totalBreakDuration || 0);
//             return sum + (total > 0 ? ((s.totalWorkDuration || 0) / total) * 100 : 0);
//           }, 0);
//           avgEfficiency = Math.round(totalEfficiency / completedSessions.length);
//         }
        
//         setStats({ 
//           totalWork: totalWork.toFixed(1), 
//           totalBreak: totalBreak.toFixed(1), 
//           totalIdle: totalIdle.toFixed(1), 
//           avgEfficiency 
//         });
//       } else {
//         setError(response.data.message || 'Failed to fetch sessions');
//       }
//     } catch (err) {
//       console.error('Error fetching sessions:', err);
//       console.error('Error details:', err.response?.data);
      
//       // Check if it's a route error
//       if (err.response?.status === 404) {
//         setError('API endpoint not found. Please check if the backend route is registered correctly.');
//       } else {
//         setError(err.response?.data?.message || err.message || 'Network error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Fetch today's timeline - using correct endpoint
//   const fetchTimeline = async () => {
//     const { employeeId: empId, token } = getUserDataFromStorage();
//     if (!empId) {
//       setError('Employee ID not found');
//       return;
//     }

//     try {
//       // Using the correct endpoint from your routes: GET /api/work-session/timeline/:employeeId
//       const response = await axios.get(
//         `${API_BASE_URL}/work-session/timeline/${empId}`,
//         { headers: { Authorization: token ? `Bearer ${token}` : '' } }
//       );
//       if (response.data.success) {
//         setTimeline(response.data.data);
//         setShowTimeline(true);
//       } else {
//         console.error('Timeline fetch failed:', response.data.message);
//       }
//     } catch (err) {
//       console.error('Error fetching timeline:', err);
//     }
//   };

//   useEffect(() => {
//     fetchSessions();
//   }, [fetchSessions]);

//   // Filter and sort
//   useEffect(() => {
//     let filtered = [...sessions];
    
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(s => 
//         new Date(s.date).toLocaleDateString().includes(term) ||
//         s.status?.includes(term)
//       );
//     }
    
//     filtered.sort((a, b) => {
//       let aVal = sortConfig.key === 'date' ? new Date(a.date) : (a[sortConfig.key] || 0);
//       let bVal = sortConfig.key === 'date' ? new Date(b.date) : (b[sortConfig.key] || 0);
//       return sortConfig.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
//     });
    
//     setFilteredSessions(filtered);
//     setCurrentPage(1);
//   }, [searchTerm, sortConfig, sessions]);

//   const formatDuration = (minutes) => {
//     if (!minutes) return '0h';
//     const hrs = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
//   };

//   const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
//   const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';

//   const getEfficiency = (session) => {
//     const work = session.totalWorkDuration || 0;
//     const breaks = session.totalBreakDuration || 0;
//     const total = work + breaks;
//     return total > 0 ? Math.round((work / total) * 100) : 0;
//   };

//   const exportCSV = () => {
//     const headers = ['Date', 'Status', 'Start', 'End', 'Work Hours', 'Break', 'Idle', 'Efficiency'];
//     const rows = filteredSessions.map(s => [
//       formatDate(s.date), s.status, formatTime(s.startTime), formatTime(s.endTime),
//       ((s.totalWorkDuration || 0) / 60).toFixed(2),
//       ((s.totalBreakDuration || 0) / 60).toFixed(2),
//       ((s.totalIdleTime || 0) / 60).toFixed(2),
//       `${getEfficiency(s)}%`
//     ]);
    
//     const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `attendance_${employeeId}_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const paginatedSessions = filteredSessions.slice((currentPage - 1) * perPage, currentPage * perPage);
//   const totalPages = Math.ceil(filteredSessions.length / perPage);

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
//         <div className="text-center">
//           <FiLoader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Loading attendance history...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
//           <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
//           <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
//           <p className="text-red-600 mb-4">{error}</p>
//           <button 
//             onClick={fetchSessions}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl sm:text-3xl font-bold text-teal-900">Attendance History</h1>
//           <p className="text-sm text-gray-500 mt-1">Track your work sessions, breaks, and performance</p>
//           {employeeName && (
//             <p className="text-sm text-teal-600 mt-2 font-medium">Welcome, {employeeName}</p>
//           )}
//           {employeeId && (
//             <p className="text-xs text-gray-400">Employee ID: {employeeId}</p>
//           )}
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
//                 <FiCalendar className="w-5 h-5 text-teal-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase">Total Days</p>
//                 <p className="text-xl font-bold text-teal-700">{filteredSessions.length}</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
//                 <FiClock className="w-5 h-5 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase">Work Hours</p>
//                 <p className="text-xl font-bold text-emerald-700">{stats.totalWork}h</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
//                 <FiCoffee className="w-5 h-5 text-orange-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase">Break Hours</p>
//                 <p className="text-xl font-bold text-orange-700">{stats.totalBreak}h</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
//                 <FiBarChart2 className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-400 uppercase">Efficiency</p>
//                 <p className="text-xl font-bold text-blue-700">{stats.avgEfficiency}%</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4 mb-6">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="flex-1 relative">
//               <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by date..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none text-sm"
//               />
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={exportCSV}
//                 className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm font-medium"
//               >
//                 <FiDownload /> Export
//               </button>
//               <button
//                 onClick={fetchTimeline}
//                 className="flex items-center gap-2 px-4 py-2 border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 transition text-sm font-medium"
//               >
//                 <FiEye /> Today's Timeline
//               </button>
//               <button
//                 onClick={fetchSessions}
//                 className="flex items-center gap-2 px-4 py-2 border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 transition text-sm font-medium"
//               >
//                 <FiRefreshCw /> Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-sm border border-teal-100 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b-2 border-teal-100">
//                 <tr>
//                   {['Date', 'Status', 'Start', 'End', 'Work Hours', 'Break', 'Idle', 'Efficiency', ''].map((col, idx) => (
//                     <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
//                       {col}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-teal-50">
//                 {paginatedSessions.length > 0 ? (
//                   paginatedSessions.map((session) => {
//                     const efficiency = getEfficiency(session);
//                     return (
//                       <tr key={session._id} className="hover:bg-teal-50/50 transition">
//                         <td className="px-4 py-3 font-medium text-gray-800 text-sm">{formatDate(session.date)}</td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
//                             session.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
//                             session.status === 'working' ? 'bg-teal-100 text-teal-800 border-teal-200' :
//                             'bg-gray-100 text-gray-600 border-gray-200'
//                           }`}>
//                             {session.status === 'completed' ? <FiCheckCircle className="w-3 h-3" /> :
//                              session.status === 'working' ? <FiPlay className="w-3 h-3" /> :
//                              <FiPause className="w-3 h-3" />}
//                             {session.status?.replace('_', ' ')}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-sm text-gray-600">{formatTime(session.startTime)}</td>
//                         <td className="px-4 py-3 text-sm text-gray-600">{formatTime(session.endTime)}</td>
//                         <td className="px-4 py-3 font-semibold text-emerald-700">{formatDuration(session.totalWorkDuration)}</td>
//                         <td className="px-4 py-3 text-orange-600">{formatDuration(session.totalBreakDuration)}</td>
//                         <td className="px-4 py-3 text-purple-600">{formatDuration(session.totalIdleTime)}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                               <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" style={{ width: `${efficiency}%` }} />
//                             </div>
//                             <span className="text-xs font-medium">{efficiency}%</span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3">
//                           <button onClick={fetchTimeline} className="text-teal-500 hover:bg-teal-50 p-1 rounded">
//                             <FiEye className="w-4 h-4" />
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="9" className="text-center py-12">
//                       <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                       <p className="text-gray-500">No attendance records found</p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {filteredSessions.length > 0 && (
//             <div className="px-4 py-3 border-t border-teal-100 flex justify-between items-center">
//               <p className="text-xs text-gray-500">
//                 Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredSessions.length)} of {filteredSessions.length}
//               </p>
//               <div className="flex gap-1">
//                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
//                   className="p-2 border border-teal-200 rounded-lg disabled:opacity-50 hover:bg-teal-50">
//                   <FiChevronLeft className="w-4 h-4" />
//                 </button>
//                 <span className="px-3 py-1 text-sm">{currentPage} / {totalPages}</span>
//                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
//                   className="p-2 border border-teal-200 rounded-lg disabled:opacity-50 hover:bg-teal-50">
//                   <FiChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Timeline Modal */}
//       {showTimeline && timeline && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTimeline(false)}>
//           <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
//             <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
//               <h3 className="font-bold text-lg">Today's Timeline</h3>
//               <button onClick={() => setShowTimeline(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded">✕</button>
//             </div>
//             <div className="p-4">
//               <div className="grid grid-cols-2 gap-3 mb-6">
//                 <div className="bg-teal-50 p-3 rounded"><p className="text-xs text-teal-600">Work Hours</p><p className="text-xl font-bold">{timeline.summary?.totalWorkHours || '0'}h</p></div>
//                 <div className="bg-orange-50 p-3 rounded"><p className="text-xs text-orange-600">Break Hours</p><p className="text-xl font-bold">{timeline.summary?.totalBreakHours || '0'}h</p></div>
//                 <div className="bg-purple-50 p-3 rounded"><p className="text-xs text-purple-600">Idle Time</p><p className="text-xl font-bold">{timeline.summary?.totalIdleHours || '0'}h</p></div>
//                 <div className="bg-blue-50 p-3 rounded"><p className="text-xs text-blue-600">Productivity</p><p className="text-xl font-bold">{timeline.summary?.productivity || 0}%</p></div>
//               </div>
//               <div className="space-y-3">
//                 {timeline.timeline?.map((event, i) => (
//                   <div key={i} className="flex gap-3">
//                     <div className="w-16 text-xs text-gray-500">{event.formattedTime}</div>
//                     <div className="flex-1 flex gap-3 pb-3 border-b">
//                       <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-lg">{event.icon || '📋'}</div>
//                       <div>
//                         <p className="font-medium">{event.title}</p>
//                         <p className="text-xs text-gray-500">{event.location}</p>
//                         {event.duration && <p className="text-xs text-teal-600 mt-1">Duration: {event.duration} min</p>}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendanceHistory;


// AttendanceHistory.jsx - With date picker to view timeline for any day
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiSearch, FiDownload, FiEye, FiChevronLeft, FiChevronRight,
  FiCoffee, FiBarChart2, FiLoader, FiRefreshCw, FiPlay, FiPause,
  FiChevronDown
} from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = 'https://pmsbackend.pixelmindsolutions.com/api';

const AttendanceHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [stats, setStats] = useState({ totalWork: 0, totalBreak: 0, totalIdle: 0, avgEfficiency: 0 });
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  
  const perPage = 10;

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

  // Extract unique dates from sessions for dropdown
  const extractAvailableDates = (sessionsData) => {
    const dates = sessionsData.map(session => 
      new Date(session.date).toLocaleDateString('en-CA') // YYYY-MM-DD format
    );
    const uniqueDates = [...new Set(dates)].sort().reverse();
    setAvailableDates(uniqueDates);
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]); // Default to most recent date
    }
  };

  // Fetch all sessions from backend
  const fetchSessions = useCallback(async () => {
    const { employeeId: empId, employeeName: empName, token } = getUserDataFromStorage();
    
    if (!empId) {
      console.error('No employeeId found in session storage');
      setError('Employee ID not found. Please login again.');
      setLoading(false);
      return;
    }

    setEmployeeId(empId);
    setEmployeeName(empName);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching sessions for employee:', empId);
      
      const response = await axios.get(
        `${API_BASE_URL}/work-session/all-sessions/${empId}`,
        { 
          headers: { 
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const sessionsData = response.data.data?.sessions || [];
        setSessions(sessionsData);
        setFilteredSessions(sessionsData);
        
        // Extract available dates for dropdown
        extractAvailableDates(sessionsData);
        
        // Calculate statistics
        const totalWork = sessionsData.reduce((sum, s) => sum + (s.totalWorkDuration || 0), 0) / 60;
        const totalBreak = sessionsData.reduce((sum, s) => sum + (s.totalBreakDuration || 0), 0) / 60;
        const totalIdle = sessionsData.reduce((sum, s) => sum + (s.totalIdleTime || 0), 0) / 60;
        
        // Calculate average efficiency
        const completedSessions = sessionsData.filter(s => s.status === 'completed' && s.totalWorkDuration > 0);
        let avgEfficiency = 0;
        if (completedSessions.length > 0) {
          const totalEfficiency = completedSessions.reduce((sum, s) => {
            const total = (s.totalWorkDuration || 0) + (s.totalBreakDuration || 0);
            return sum + (total > 0 ? ((s.totalWorkDuration || 0) / total) * 100 : 0);
          }, 0);
          avgEfficiency = Math.round(totalEfficiency / completedSessions.length);
        }
        
        setStats({ 
          totalWork: totalWork.toFixed(1), 
          totalBreak: totalBreak.toFixed(1), 
          totalIdle: totalIdle.toFixed(1), 
          avgEfficiency 
        });
      } else {
        setError(response.data.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      if (err.response?.status === 404) {
        setError('API endpoint not found. Please check if the backend route is registered correctly.');
      } else {
        setError(err.response?.data?.message || err.message || 'Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch timeline for specific date
  const fetchTimelineForDate = async (date) => {
    const { employeeId: empId, token } = getUserDataFromStorage();
    if (!empId) {
      setError('Employee ID not found');
      return;
    }

    try {
      setLoading(true);
      // Find session for selected date
      const sessionForDate = sessions.find(s => 
        new Date(s.date).toLocaleDateString('en-CA') === date
      );
      
      if (!sessionForDate) {
        setTimeline(null);
        setShowTimeline(true);
        return;
      }
      
      // Fetch timeline for that session (you might need a new endpoint)
      // For now, we'll use the session data directly
      const timelineData = {
        timeline: [],
        breaks: [],
        summary: {
          workStarted: sessionForDate.startTime,
          workStartedFormatted: formatTime(sessionForDate.startTime),
          workEnded: sessionForDate.endTime,
          workEndedFormatted: formatTime(sessionForDate.endTime),
          totalBreaks: sessionForDate.activityLogs?.filter(l => l.type === 'break_start').length || 0,
          productivity: getEfficiency(sessionForDate),
          idleTime: Math.round(sessionForDate.totalIdleTime || 0),
          totalWorkHours: ((sessionForDate.totalWorkDuration || 0) / 60).toFixed(2),
          totalBreakHours: ((sessionForDate.totalBreakDuration || 0) / 60).toFixed(2),
          totalIdleHours: ((sessionForDate.totalIdleTime || 0) / 60).toFixed(2),
          workStatus: sessionForDate.status === 'completed' ? 'Completed' : 'In Progress',
          totalElapsedHours: (((sessionForDate.totalWorkDuration || 0) + (sessionForDate.totalBreakDuration || 0)) / 60).toFixed(2)
        }
      };
      
      // Build timeline from activity logs
      if (sessionForDate.startTime) {
        timelineData.timeline.push({
          id: 'work-start',
          type: 'work_start',
          title: 'Punched In — Work Started',
          time: sessionForDate.startTime,
          formattedTime: formatTime(sessionForDate.startTime),
          location: 'Office',
          icon: '💼'
        });
      }
      
      // Process breaks from activity logs
      let breakCounter = 1;
      let currentBreak = null;
      
      if (sessionForDate.activityLogs) {
        for (const log of sessionForDate.activityLogs) {
          if (log.type === 'break_start') {
            const isTea = log.breakType === 'tea' || (log.details && log.details.includes('tea'));
            currentBreak = {
              id: `break-${breakCounter}`,
              type: 'break',
              title: isTea ? 'Tea Break' : 'Lunch Break',
              startTime: log.timestamp,
              location: isTea ? 'Pantry' : 'Cafeteria',
              icon: isTea ? '☕' : '🍽️',
              expectedDuration: log.breakDuration || (isTea ? 15 : 60),
              breakType: log.breakType || (isTea ? 'tea' : 'lunch')
            };
          }
          
          if (log.type === 'break_end' && currentBreak) {
            const actualDuration = log.actualDuration || Math.round((new Date(log.timestamp) - new Date(currentBreak.startTime)) / 60000);
            const breakItem = {
              ...currentBreak,
              time: currentBreak.startTime,
              formattedTime: formatTime(currentBreak.startTime),
              endTime: log.timestamp,
              formattedEndTime: formatTime(log.timestamp),
              duration: actualDuration,
              expectedDuration: currentBreak.expectedDuration,
              isOverdue: actualDuration > currentBreak.expectedDuration,
              overdueMinutes: actualDuration > currentBreak.expectedDuration ? actualDuration - currentBreak.expectedDuration : 0
            };
            timelineData.timeline.push(breakItem);
            timelineData.breaks.push(breakItem);
            currentBreak = null;
            breakCounter++;
          }
        }
      }
      
      if (sessionForDate.endTime) {
        timelineData.timeline.push({
          id: 'work-end',
          type: 'work_end',
          title: 'Punched Out — Work Ended',
          time: sessionForDate.endTime,
          formattedTime: formatTime(sessionForDate.endTime),
          location: 'Office',
          icon: '🏁'
        });
      }
      
      setTimeline(timelineData);
      setShowTimeline(true);
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError('Failed to load timeline for selected date');
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection change
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchTimelineForDate(date);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Filter and sort
  useEffect(() => {
    let filtered = [...sessions];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        new Date(s.date).toLocaleDateString().includes(term) ||
        s.status?.includes(term)
      );
    }
    
    filtered.sort((a, b) => {
      let aVal = sortConfig.key === 'date' ? new Date(a.date) : (a[sortConfig.key] || 0);
      let bVal = sortConfig.key === 'date' ? new Date(b.date) : (b[sortConfig.key] || 0);
      return sortConfig.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    
    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortConfig, sessions]);

  const formatDuration = (minutes) => {
    const totalMinutes = Math.floor(Number(minutes) || 0);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
  const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';

  const getEfficiency = (session) => {
    const work = session.totalWorkDuration || 0;
    const breaks = session.totalBreakDuration || 0;
    const total = work + breaks;
    return total > 0 ? Math.round((work / total) * 100) : 0;
  };

  const exportCSV = () => {
    const headers = ['Date', 'Status', 'Start', 'End', 'Work Hours', 'Break', 'Idle', 'Efficiency'];
    const rows = filteredSessions.map(s => [
      formatDate(s.date), s.status, formatTime(s.startTime), formatTime(s.endTime),
      ((s.totalWorkDuration || 0) / 60).toFixed(2),
      ((s.totalBreakDuration || 0) / 60).toFixed(2),
      ((s.totalIdleTime || 0) / 60).toFixed(2),
      `${getEfficiency(s)}%`
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${employeeId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const paginatedSessions = filteredSessions.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filteredSessions.length / perPage);

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchSessions}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-900">Attendance History</h1>
          <p className="text-sm text-gray-500 mt-1">Track your work sessions, breaks, and performance</p>
          {employeeName && (
            <p className="text-sm text-teal-600 mt-2 font-medium">Welcome, {employeeName}</p>
          )}
          {employeeId && (
            <p className="text-xs text-gray-400">Employee ID: {employeeId}</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Total Days</p>
                <p className="text-xl font-bold text-teal-700">{filteredSessions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Work Hours</p>
                <p className="text-xl font-bold text-emerald-700">{stats.totalWork}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <FiCoffee className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Break Hours</p>
                <p className="text-xl font-bold text-orange-700">{stats.totalBreak}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FiBarChart2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Efficiency</p>
                <p className="text-xl font-bold text-blue-700">{stats.avgEfficiency}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              {/* Date Selector Dropdown */}
              <div className="relative">
                <select
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="appearance-none pl-4 pr-10 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none text-sm bg-white cursor-pointer"
                >
                  <option value="">Select a date to view timeline</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition text-sm font-medium"
              >
                <FiDownload /> Export
              </button>
              
              <button
                onClick={fetchSessions}
                className="flex items-center gap-2 px-4 py-2 border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 transition text-sm font-medium"
              >
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-teal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b-2 border-teal-100">
                <tr>
                  {['Date', 'Status', 'Start', 'End', 'Work Hours', 'Break', 'Idle', 'Efficiency', 'Actions'].map((col, idx) => (
                    <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
                {paginatedSessions.length > 0 ? (
                  paginatedSessions.map((session) => {
                    const efficiency = getEfficiency(session);
                    const sessionDate = new Date(session.date).toLocaleDateString('en-CA');
                    return (
                      <tr key={session._id} className="hover:bg-teal-50/50 transition">
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">{formatDate(session.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                            session.status === 'working' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                            'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {session.status === 'completed' ? <FiCheckCircle className="w-3 h-3" /> :
                             session.status === 'working' ? <FiPlay className="w-3 h-3" /> :
                             <FiPause className="w-3 h-3" />}
                            {session.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatTime(session.startTime)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatTime(session.endTime)}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">{formatDuration(session.totalWorkDuration)}</td>
                        <td className="px-4 py-3 text-orange-600">{formatDuration(session.totalBreakDuration)}</td>
                        <td className="px-4 py-3 text-purple-600">{formatDuration(session.totalIdleTime)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" style={{ width: `${efficiency}%` }} />
                            </div>
                            <span className="text-xs font-medium">{efficiency}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => fetchTimelineForDate(sessionDate)} 
                            className="text-teal-500 hover:bg-teal-50 p-1 rounded transition-colors"
                            title="View timeline for this day"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                        </td>
                       </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No attendance records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredSessions.length > 0 && (
            <div className="px-4 py-3 border-t border-teal-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredSessions.length)} of {filteredSessions.length}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 border border-teal-200 rounded-lg disabled:opacity-50 hover:bg-teal-50">
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 border border-teal-200 rounded-lg disabled:opacity-50 hover:bg-teal-50">
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Modal */}
      {showTimeline && timeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTimeline(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                Timeline - {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setShowTimeline(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded">✕</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-teal-50 p-3 rounded"><p className="text-xs text-teal-600">Work Hours</p><p className="text-xl font-bold">{timeline.summary?.totalWorkHours || '0'}h</p></div>
                <div className="bg-orange-50 p-3 rounded"><p className="text-xs text-orange-600">Break Hours</p><p className="text-xl font-bold">{timeline.summary?.totalBreakHours || '0'}h</p></div>
                <div className="bg-purple-50 p-3 rounded"><p className="text-xs text-purple-600">Idle Time</p><p className="text-xl font-bold">{timeline.summary?.totalIdleHours || '0'}h</p></div>
                <div className="bg-blue-50 p-3 rounded"><p className="text-xs text-blue-600">Productivity</p><p className="text-xl font-bold">{timeline.summary?.productivity || 0}%</p></div>
              </div>
              <div className="space-y-3">
                {timeline.timeline?.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 text-xs text-gray-500">{event.formattedTime}</div>
                    <div className="flex-1 flex gap-3 pb-3 border-b">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-lg">{event.icon || '📋'}</div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.location}</p>
                        {event.duration && <p className="text-xs text-teal-600 mt-1">Duration: {event.duration} min</p>}
                        {event.isOverdue && <p className="text-xs text-red-500 mt-1">⚠️ Overdue by {event.overdueMinutes} min</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
