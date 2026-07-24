import React, { useState, useEffect } from 'react';
import DashboardHeader from "../components/DashboardHeader";
import {
  Users, Calendar as CalendarIcon, History, Save, Search,
  ChevronLeft, ChevronRight, X
} from "lucide-react";

import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const AttendancePage = () => {
  const { t } = useLanguage();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classIdMap, setClassIdMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // 1. Fetch Classes (Secured with JWT)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/classes/getAllClasses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const classData = await res.json();
          setAvailableClasses(classData);

          const newClassMap = {};
          classData.forEach(c => {
            const gradeNum = String(c.grade).replace(/[^0-9]/g, '');
            newClassMap[c.id] = `Class ${gradeNum}`;
          });
          setClassIdMap(newClassMap);

          if (classData.length > 0) {
            setSelectedClassId(classData[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch classes", err);
      }
    };
    fetchClasses();
  }, []);

  // 2. Load Students and Attendance Data (Secured with JWT)
  const loadData = async () => {
    if (!selectedClassId) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formattedDate = selectedDate.toLocaleDateString('en-CA');
      const headers = { "Authorization": `Bearer ${token}` };

      const rosterRes = await fetch(`${API_URL}/api/students/getAllStudents?classId=${selectedClassId}`, { headers });
      const rosterData = rosterRes.ok ? await rosterRes.json() : [];

      const attRes = await fetch(`${API_URL}/api/attendance/class/${selectedClassId}/date/${formattedDate}`, { headers });
      const attData = attRes.ok ? await attRes.json() : [];

      const mergedRoster = rosterData.map(s => {
        const existingRecord = attData.find(a => a.studentId === s.id);
        return {
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          firstName: s.firstName,
          photo: s.photo,
          roll: s.rollNumber || "N/A",
          status: existingRecord ? existingRecord.status.toLowerCase() : null
        };
      });

      setStudents(mergedRoster);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, selectedDate]);

  // 3. Load History
  useEffect(() => {
    if (showHistory && selectedClassId) {
      const fetchHistory = async () => {
        const token = localStorage.getItem("token");
        try {
          const res = await fetch(`${API_URL}/api/attendance/history/${selectedClassId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) setHistoryData(await res.json());
        } catch (err) { console.error("History fetch error:", err); }
      };
      fetchHistory();
    }
  }, [showHistory, selectedClassId, historyRefreshKey]);

  // 4. Save Attendance
  const handleSubmit = async () => {
    const unmarked = students.filter(s => s.status === null);
    if (unmarked.length > 0) {
      if (!window.confirm(`${t('unmarked_warning_1')} ${unmarked.length} ${t('unmarked_warning_2')}`)) return;
    }

    try {
      const token = localStorage.getItem("token");
      const formattedDate = selectedDate.toLocaleDateString('en-CA');

      // 🚀 FIXED: Get the real Teacher ID from localStorage so it doesn't default to 1!
      const currentTeacherId = parseInt(localStorage.getItem("teacherId")) || 1;

      const attendanceData = students.filter(s => s.status !== null).map(s => ({
        studentId: s.id,
        classId: parseInt(selectedClassId),
        date: formattedDate,
        status: s.status.toUpperCase(),
        teacherId: currentTeacherId // 👈 Using dynamic ID
      }));

      if (attendanceData.length === 0) {
        alert(t('mark_at_least_one'));
        return;
      }

      const res = await fetch(`${API_URL}/api/attendance/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(attendanceData)
      });

      if (res.ok) {
        alert(t('attendance_saved'));
        loadData();
        setHistoryRefreshKey(prev => prev + 1);
      } else {
        alert(t('attendance_failed'));
      }
    } catch (err) {
      console.error(err);
      alert(t('attendance_error'));
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  };

  const handleMarkAllPresent = () => {
    setStudents(students.map(s => ({ ...s, status: 'present' })));
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll.includes(searchTerm)
  );

  const presentCount = students.filter(s => s.status === 'present').length;
  const lateCount = students.filter(s => s.status === 'late').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const attendanceRate = students.length > 0 ? Math.round(((presentCount + lateCount) / students.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <DashboardHeader title={t('attendance_title')} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('attendance_management')}</h1>
            <p className="text-slate-500 mt-1">{t('attendance_management_sub')}</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setShowHistory(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full font-medium hover:bg-slate-50 transition-all shadow-sm">
              <History size={18} /> {t('view_history')}
            </button>
            <button onClick={handleSubmit} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm">
              <Save size={18} /> {t('submit')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20} /></div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 w-full sm:w-48 cursor-pointer"
            >
              {availableClasses.map((cls) => {
                const gradeNum = String(cls.grade).replace(/[^0-9]/g, '');
                const gradeKey = `Class ${gradeNum}`;
                return (
                  <option key={cls.id} value={cls.id}>
                    {t(gradeKey)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex gap-4 text-sm font-medium">
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">{presentCount} {t('present')}</div>
            <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">{lateCount} {t('late')}</div>
            <div className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">{absentCount} {t('absent')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">{t('mark_attendance_heading')}</h2>
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
                  <CalendarIcon size={16} />
                  {selectedDate.toDateString()}
                </div>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={t('search_students')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
              ) : students.length === 0 ? (
                <div className="text-center p-10 text-slate-500 border border-dashed border-slate-200 rounded-xl">{t('no_students_found_class')}</div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-white gap-4">
                      <div className="flex items-center gap-3">

                        {student.photo ? (
                          <img
                            src={`${API_URL}/api/students/StudentPhoto/${student.id}?t=${new Date().getTime()}`}
                            alt={student.firstName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 font-black border-2 border-white shadow-sm flex-shrink-0">
                            {student.firstName ? student.firstName.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}

                        <div>
                          <h3 className="font-bold text-slate-900">{student.name}</h3>
                          <p className="text-xs text-slate-500">{t('roll_no')}: {student.roll}</p>
                        </div>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['present', 'late', 'absent'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${student.status === status
                                ? (status === 'present' ? 'bg-white shadow-sm text-emerald-600' : status === 'late' ? 'bg-white shadow-sm text-amber-600' : 'bg-white shadow-sm text-rose-600')
                                : 'text-slate-500 hover:bg-slate-200'
                              }`}
                          >
                            {t(status)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase text-slate-400">{t('select_date')}</h3>
                <div className="flex gap-1">
                  <button onClick={() => navigateMonth(-1)}><ChevronLeft size={18} /></button>
                  <button onClick={() => navigateMonth(1)}><ChevronRight size={18} /></button>
                </div>
              </div>
              <div className="text-center font-extrabold text-slate-800 mb-4">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                <div>{t('Su')}</div><div>{t('Mo')}</div><div>{t('Tu')}</div><div>{t('We')}</div><div>{t('Th')}</div><div>{t('Fr')}</div><div>{t('Sa')}</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day.date)}
                    className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-full transition-all ${day.date.toDateString() === selectedDate.toDateString() ? 'bg-indigo-600 text-white shadow-sm scale-110' : 'text-slate-700 hover:bg-indigo-50'
                      }`}
                  >
                    {day.date.getDate()}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-6 self-start">{t('attendance_rate')}</h3>
              <div className="text-4xl font-extrabold text-slate-900">{attendanceRate}%</div>
              <button onClick={handleMarkAllPresent} className="mt-6 w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors">{t('mark_all_present')}</button>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('attendance_history')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('class_label')} {t(classIdMap[selectedClassId]) || "..."} • {t('last_7_days')}</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-white space-y-4">

              {historyData.length === 0 ? (
                <div className="text-center p-8 text-slate-500 border border-dashed border-slate-200 rounded-xl">{t('no_attendance_records')}</div>
              ) : (
                historyData.map((record, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-all">
                    <div className="font-bold text-slate-800">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex gap-3 text-sm font-semibold">
                      <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{record.present} P</span>
                      <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">{record.late} L</span>
                      <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">{record.absent} A</span>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;