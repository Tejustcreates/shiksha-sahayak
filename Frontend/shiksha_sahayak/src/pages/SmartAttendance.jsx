import React, { useState, useRef, useEffect } from 'react';
import DashboardHeader from "../components/DashboardHeader";
import {
  Camera, UploadCloud, ScanLine, CheckCircle2, XCircle,
  AlertCircle, Users, Save, RefreshCw, Check, X, BookOpen, Database
} from "lucide-react";

import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

// ==========================================
// 1. REBUILD BUTTON COMPONENT
// ==========================================
const RebuildMemoryButton = ({ classId }) => {
  const [isRebuilding, setIsRebuilding] = useState(false);

  const handleRebuild = async () => {
    if (!classId) return alert("Please select a class from the dropdown first!");

    if (!window.confirm("This will scan all student photos in this class and rebuild the AI memory. Continue?")) {
      return;
    }

    setIsRebuilding(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/attendance/rebuild-encodings/${classId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Success: ${data.message}\nEncoded: ${data.encoded_students} students.\nFailed: ${data.failed_students} students.`);
      } else {
        alert(`❌ Error: ${data.error || "Failed to rebuild."}`);
      }
    } catch (error) {
      console.error("Rebuild error:", error);
      alert("Failed to connect to the server.");
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <button
      onClick={handleRebuild}
      disabled={isRebuilding || !classId}
      className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm w-full sm:w-auto ${isRebuilding || !classId
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 hover:shadow-md'
        }`}
    >
      <Database size={18} className={isRebuilding ? "animate-pulse" : ""} />
      {isRebuilding ? "Rebuilding..." : "Rebuild AI Memory"}
    </button>
  );
};

// ==========================================
// 2. MAIN SMART ATTENDANCE COMPONENT
// ==========================================
const SmartAttendance = () => {
  const { t } = useLanguage();

  const [scanState, setScanState] = useState('idle');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);

  // 🚀 FIXED: Fetch URL is now getAllClasses
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/classes/getAllClasses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || data.data || data || []);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when a class is selected
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/students/getAllStudents?classId=${selectedClassId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();

          let rawStudents = [];
          if (Array.isArray(data)) rawStudents = data;
          else if (data.students && Array.isArray(data.students)) rawStudents = data.students;
          else if (data.data && Array.isArray(data.data)) rawStudents = data.data;

          const mappedStudents = rawStudents.map(dbStudent => ({
            id: dbStudent.id,
            name: `${dbStudent.first_name || dbStudent.firstName || ""} ${dbStudent.last_name || dbStudent.lastName || ""}`.trim(),
            firstName: dbStudent.first_name || dbStudent.firstName,
            roll: dbStudent.roll_number || dbStudent.rollNumber || "N/A",
            status: "unmarked",
            confidence: 0
          }));

          setStudents(mappedStudents);

          setScanState('idle');
          setSelectedImage(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [selectedClassId]);

  // Handle Image Upload and AI Scan
  const handleImageUpload = async (e) => {
    if (!selectedClassId) {
      alert(t("sa_alert_select_class"));
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setScanState('analyzing');

    const formData = new FormData();
    formData.append("file", file);
    formData.append("class_id", selectedClassId);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/attendance/process-photo`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to process image");
      }

      const data = await response.json();

      setStudents(prevStudents => {
        if (prevStudents.length === 0) {
          const fallbackList = [];
          data.present.forEach((name, i) => fallbackList.push({ id: `p${i}`, name, firstName: name, roll: '?', status: 'present', confidence: 95 }));
          data.absent.forEach((name, i) => fallbackList.push({ id: `a${i}`, name, firstName: name, roll: '?', status: 'absent', confidence: 0 }));
          return fallbackList;
        }

        return prevStudents.map(student => {
          const cleanDbName = (student.name || "").toLowerCase().replace(/\s+/g, '');

          const isMatch = data.present.some(aiName =>
            (aiName || "").toLowerCase().replace(/\s+/g, '') === cleanDbName
          );

          if (isMatch) {
            return { ...student, status: 'present', confidence: Math.floor(Math.random() * 10) + 90 };
          } else {
            return { ...student, status: 'absent', confidence: 0 };
          }
        });
      });

      setScanState('review');

    } catch (error) {
      console.error("AI Scan Error:", error);
      alert("Error scanning photo: " + error.message);
      setScanState('idle');
      setSelectedImage(null);
    }
  };

  const handleManualToggle = (id, newStatus) => {
    setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleReset = () => {
    setScanState('idle');
    setSelectedImage(null);
    setStudents(prev => prev.map(s => ({ ...s, status: 'unmarked', confidence: 0 })));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    const unmarked = students.filter(s => s.status === 'unmarked');
    if (unmarked.length > 0) {
      return alert(t("sa_alert_mark_all"));
    }

    const formattedDate = new Date().toLocaleDateString('en-CA');
    const currentTeacherId = parseInt(localStorage.getItem("teacherId")) || 1;

    const attendancePayload = students.map(student => ({
      studentId: typeof student.id === 'string' ? 999 : student.id,
      classId: parseInt(selectedClassId),
      date: formattedDate,
      status: student.status === 'present' ? 'PRESENT' : 'ABSENT',
      teacherId: currentTeacherId
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/attendance/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(attendancePayload)
      });

      if (!response.ok) throw new Error("Failed to save attendance in the database.");

      alert(t("sa_alert_success"));
      handleReset();

    } catch (error) {
      console.error("Database Save Error:", error);
      alert(t("sa_alert_error") + error.message);
    }
  };

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <DashboardHeader title={t("sa_title")} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {t("sa_heading")} <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{t("sa_beta")}</span>
            </h1>
            <p className="text-slate-500 mt-1">{t("sa_subtitle")}</p>
          </div>
        </div>

        {scanState === 'idle' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-16 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="max-w-xl mx-auto">

              <div className="mb-8 text-left bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <label className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wider">
                  <BookOpen size={16} /> {t("sa_select_class")}
                </label>

                {/* 🚀 ADDED A FLEX WRAPPER FOR DROPDOWN AND BUTTON */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="flex-1 border-2 border-indigo-200 rounded-xl px-4 py-3.5 bg-white text-slate-700 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="" disabled>{t("sa_choose_class")}</option>
                    {classes.map(cls => {
                      // Extract the number and format to "Class X"
                      const gradeNum = String(cls.grade || cls.name || cls.class_name || cls.id).replace(/[^0-9]/g, '');
                      const gradeKey = `Class ${gradeNum}`;
                      return (
                        <option key={cls.id} value={cls.id}>
                          {t(gradeKey)}
                        </option>
                      );
                    })}
                  </select>

                  {/* <RebuildMemoryButton classId={selectedClassId} /> */}
                </div>
              </div>

              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <Camera size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">{t("sa_upload_title")}</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                {t("sa_upload_desc")}
              </p>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedClassId}
                  className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm ${selectedClassId
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  <UploadCloud size={20} /> {t("sa_browse_files")}
                </button>
                <button
                  disabled={!selectedClassId}
                  className={`flex items-center justify-center gap-2 border-2 px-8 py-3.5 rounded-xl font-bold transition-all ${selectedClassId
                      ? "bg-white border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 cursor-pointer"
                      : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                >
                  <Camera size={20} /> {t("sa_open_camera")}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-6 font-medium tracking-wide uppercase">{t("sa_supported_formats")}</p>
            </div>
          </div>
        )}

        {scanState === 'analyzing' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl mb-8">
              {selectedImage && (
                <img src={selectedImage} alt="Classroom" className="w-full h-full object-cover opacity-60" />
              )}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>

              <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
                <ScanLine size={48} className="animate-pulse text-blue-400 mb-4" />
                <h3 className="text-xl font-bold tracking-widest">{t("sa_analyzing")}</h3>
                <p className="text-sm text-blue-200 mt-2">{t("sa_cross_referencing")}</p>
              </div>
            </div>
          </div>
        )}

        {scanState === 'review' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-500">

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden">
                  {selectedImage && (
                    <img src={selectedImage} alt="Classroom Analyzed" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-4 left-4 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 shadow-lg">
                    <ScanLine size={14} /> {t("sa_scan_complete")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center">
                  <div className="text-3xl font-extrabold text-emerald-600 mb-1">{presentCount}</div>
                  <div className="text-xs font-bold text-emerald-700/60 uppercase tracking-wider">{t("sa_detected")}</div>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl text-center">
                  <div className="text-3xl font-extrabold text-rose-600 mb-1">{absentCount}</div>
                  <div className="text-xs font-bold text-rose-700/60 uppercase tracking-wider">{t("sa_missing")}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" /> {t("sa_verify_results")}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">{t("sa_review_findings")}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {students.length === 0 ? (
                  <p className="text-center text-slate-400 mt-10">{t("sa_no_students")}</p>
                ) : (
                  students.map(student => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${student.status === 'present' ? 'bg-emerald-50/50 border-emerald-100' :
                          student.status === 'absent' ? 'bg-rose-50/50 border-rose-100' : 'bg-white border-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${student.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                            student.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                          {student.name ? student.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{student.name}</h3>
                          <p className="text-xs font-medium text-slate-500">
                            {t("sa_roll")} {student.roll}
                            {student.status === 'present' && <span className="ml-2 text-emerald-600 font-semibold">• {t("sa_match_found")}</span>}
                            {student.status === 'absent' && <span className="ml-2 text-rose-600 font-semibold">• {t("sa_absent")}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                        <button
                          onClick={() => handleManualToggle(student.id, 'present')}
                          className={`p-1.5 rounded-md transition-all ${student.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-700'}`}
                          title={t("sa_mark_present")}
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleManualToggle(student.id, 'absent')}
                          className={`p-1.5 rounded-md transition-all ${student.status === 'absent' ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:text-slate-700'}`}
                          title={t("sa_mark_absent")}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  <RefreshCw size={18} /> {t("sa_rescan")}
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition-all"
                >
                  <Save size={18} /> {t("sa_confirm_save")}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>


      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default SmartAttendance;