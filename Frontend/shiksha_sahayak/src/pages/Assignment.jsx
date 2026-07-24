import React, { useState, useEffect } from 'react';
import DashboardHeader from "../components/DashboardHeader";
import { 
  BookOpen, Send, Clock, Activity, Plus, Download, Zap, Bell, 
  Calendar, ChevronRight, X, FileText, CheckCircle, Trash2, Eye, Edit
} from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

// ==========================================
// 1. EXACT SUBJECT DICTIONARY (CLASSES 1-5)
// ==========================================
const PREDEFINED_SUBJECTS = {
  "1": ["Mathematics", "English","Marathi"],
  "2": ["Mathematics", "English", "Marathi"],
  "3": ["Mathematics", "English", "Marathi", "EVS"],
  "4": ["Mathematics", "English", "Marathi", "EVS Part-1", "EVS Part-2"],
  "5": ["Mathematics", "English", "Marathi", "Hindi", "EVS - Part 1", "EVS - Part 2"]
};

const Assignment = () => {
  const { t } = useLanguage(); 

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [classStudents, setClassStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [gradingDrafts, setGradingDrafts] = useState({});
  const [isSubmittingGrades, setIsSubmittingGrades] = useState(false);

  const [availableClasses, setAvailableClasses] = useState([]);
  const [classIdMap, setClassIdMap] = useState({});

  const [assignmentForm, setAssignmentForm] = useState({
    title: '', description: '', dueDate: '', classId: '', subject: '', totalPoints: '100'
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // 🚀 Using your fixed getAllClasses endpoint!
        const classRes = await fetch(`${API_URL}/api/classes/getAllClasses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (classRes.ok) {
          const classData = await classRes.json();
          const validClasses = classData.classes || classData.data || classData || [];
          setAvailableClasses(validClasses);
          
          const newClassMap = {};
          validClasses.forEach(c => {
            newClassMap[c.id] = c.grade || c.name;
          });
          setClassIdMap(newClassMap);
        }

        const assignRes = await fetch(`${API_URL}/api/assignments/getAllAssignments`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!assignRes.ok) throw new Error("Failed to fetch assignments");
        const assignData = await assignRes.json();
        setAssignments(assignData);

      } catch (err) {
        console.error(err);
        setError("Could not load data from the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchAssignmentsOnly = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/assignments/getAllAssignments`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setAssignmentForm({ 
      title: '', 
      description: '', 
      dueDate: '', 
      classId: '', 
      subject: '', 
      totalPoints: '100' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setModalMode('edit');
    setEditingAssignmentId(assignment.id);
    
    setAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate || '',
      classId: assignment.classId.toString(),
      subject: assignment.subject || '', 
      totalPoints: '100'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formattedDate = new Date(assignmentForm.dueDate).toISOString().split('T')[0];

      const payload = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        dueDate: formattedDate,
        classId: parseInt(assignmentForm.classId),
        subject: assignmentForm.subject 
      };

      const url = modalMode === 'add' 
        ? `${API_URL}/api/assignments/create` 
        : `${API_URL}/api/assignments/${editingAssignmentId}`;

      const res = await fetch(url, {
        method: modalMode === 'add' ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save assignment");
      
      await fetchAssignmentsOnly();
      setIsModalOpen(false);
      
    } catch(err) {
      console.error(err);
      alert("Error saving assignment to database.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/assignments/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      
      setAssignments(assignments.filter(a => a.id !== id));
      if (selectedAssignment?.id === id) {
        setSelectedAssignment(null);
        setActiveTab('overview');
      }
    } catch(err) {
      console.error(err);
      alert("Error deleting assignment.");
    }
  };

  const handleViewDetails = async (assignment) => {
    setSelectedAssignment(assignment);
    setActiveTab('details');
    setClassStudents([]);
    setSubmissions({});
    setGradingDrafts({});

    try {
      const token = localStorage.getItem("token");
      
      const studentRes = await fetch(`${API_URL}/api/students/getAllStudents?classId=${assignment.classId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const studentsData = await studentRes.ok ? await studentRes.json() : [];
      setClassStudents(studentsData);

      const submissionRes = await fetch(`${API_URL}/api/submissions/assignment/${assignment.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const submissionsData = await submissionRes.ok ? await submissionRes.json() : [];
      
      const subMap = {};
      submissionsData.forEach(sub => { subMap[sub.studentId] = sub; });
      setSubmissions(subMap);

    } catch(err) {
      console.error("Error fetching assignment details:", err);
    }
  };

  const handleDraftChange = (studentId, field, value) => {
    setGradingDrafts(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleGradeSubmit = async () => {
    setIsSubmittingGrades(true);
    try {
      const token = localStorage.getItem("token");
      const draftKeys = Object.keys(gradingDrafts);
      
      for (let studentId of draftKeys) {
        const draft = gradingDrafts[studentId];
        if (!draft.grade) continue;

        const payload = {
          assignmentId: selectedAssignment.id,
          studentId: parseInt(studentId),
          grade: draft.grade,
          comment: draft.comment || "",
          fileUrl: ""
        };

        await fetch(`${API_URL}/api/submissions/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      alert("Grades saved successfully!");
      handleViewDetails(selectedAssignment);

    } catch (err) {
      console.error(err);
      alert("Failed to submit some grades.");
    } finally {
      setIsSubmittingGrades(false);
    }
  };

  const totalStudents = classStudents.length;
  const gradedCount = Object.keys(submissions).length;
  const completionPercentage = totalStudents === 0 ? 0 : Math.round((gradedCount / totalStudents) * 100);

  const getStatusColor = (status) => {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  // ==========================================
  // 2. DYNAMIC SUBJECT EXTRACTION LOGIC (BULLETPROOF)
  // ==========================================
  const selectedClassObj = availableClasses.find(c => 
    (c.id && c.id.toString() === assignmentForm.classId.toString()) || 
    (c.grade && c.grade.toString() === assignmentForm.classId.toString()) ||
    (c.name && c.name.toString() === assignmentForm.classId.toString())
  );
  
  const gradeStr = selectedClassObj ? (selectedClassObj.grade || selectedClassObj.class_name || selectedClassObj.name || "") : assignmentForm.classId.toString();
  const gradeMatch = gradeStr.match(/\d+/);
  const gradeKey = gradeMatch ? gradeMatch[0] : assignmentForm.classId; 
  
  const currentAvailableSubjects = PREDEFINED_SUBJECTS[gradeKey] || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <DashboardHeader title={t('assignments')} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('assignment_management')}</h1>
            <p className="text-slate-500 mt-1">{t('assignment_management_sub')}</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            {t('create_assignment')}
          </button>
        </div>

        <div className="space-y-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600"/> {t('current_assignments')}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
            ) : assignments.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center text-slate-500 border border-slate-100">{t('no_assignments_found')}</div>
            ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-indigo-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-slate-900">{assignment.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor('active')} uppercase tracking-wider`}>
                        {t('active')}
                      </span>
                    </div>
                    <p className="text-slate-500 line-clamp-2">{assignment.description}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wide">
                    {t(classIdMap[assignment.classId] || "unknown_class")}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold tracking-wide">
                    {t(assignment.subject || "General")}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                    <Clock size={16} /> {t('due')}: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : t('no_date_set')}
                  </p>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => openEditModal(assignment)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={t('edit_assignment')}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(assignment.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('delete_assignment')}
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleViewDetails(assignment)}
                      className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Eye size={16}/> {t('view_details')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{modalMode === 'add' ? t('create_new_assignment') : t('edit_assignment')}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('assignment_title')}</label>
                  <input type="text" value={assignmentForm.title} onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('class_required')}</label>
                    <select 
                      value={assignmentForm.classId} 
                      onChange={(e) => {
                        // Reset subject when class changes
                        setAssignmentForm({
                          ...assignmentForm, 
                          classId: e.target.value,
                          subject: '' 
                        });
                      }} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold" required
                    >
                      <option value="" disabled>{t('select_class')}</option>
                      {availableClasses.map((cls, idx) => (
                        <option key={cls.id || idx} value={cls.id || cls.grade || cls.name}>
                          {t(cls.grade || cls.name) || cls.grade || cls.name} 
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('subject')}</label>
                    <select 
                      value={assignmentForm.subject} 
                      onChange={(e) => setAssignmentForm({...assignmentForm, subject: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                      required
                      disabled={!assignmentForm.classId || currentAvailableSubjects.length === 0}
                    >
                      <option value="" disabled>
                        {!assignmentForm.classId ? t('select_class_first') : t('select_subject')}
                      </option>
                      {currentAvailableSubjects.map((sub, index) => (
                        <option key={index} value={sub}>{t(sub) || sub}</option>
                      ))}
                    </select>
                    {assignmentForm.classId && currentAvailableSubjects.length === 0 && (
                      <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
                        <X size={12}/> Subjects only available up to Class 5
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('description_required')}</label>
                  <textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})} rows="3" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('due_date')}</label>
                    <input type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl">{t('cancel')}</button>
                <button type="submit" disabled={currentAvailableSubjects.length === 0} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {modalMode === 'add' ? t('create_assignment') : t('save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {selectedAssignment && activeTab === 'details' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl sticky top-0 z-10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedAssignment.title}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor('active')} uppercase tracking-wider`}>
                    {t('active')}
                  </span>
                </div>
                <p className="text-slate-600 text-sm font-medium">
                  {t(classIdMap[selectedAssignment.classId] || "unknown_class")} • {t(selectedAssignment.subject || "General")}
                </p>
              </div>
              <button onClick={() => { setSelectedAssignment(null); setActiveTab('overview'); }} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                <div className="xl:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-indigo-600"/> {t('assignment_description')}
                  </h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8 text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedAssignment.description}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t('student_grading')}</h3>
                  
                  {classStudents.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 border border-slate-200 border-dashed">
                      {t('no_students_enrolled')}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {classStudents.map((student) => {
                        const existingSub = submissions[student.id];
                        const currentGrade = gradingDrafts[student.id]?.grade ?? existingSub?.grade ?? "";
                        const currentComment = gradingDrafts[student.id]?.comment ?? existingSub?.comment ?? "";
                        
                        return (
                          <div key={student.id} className="border border-slate-200 rounded-xl p-5 bg-white">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                              <div className="flex items-center space-x-3">
                                
                                {student.photo ? (
                                  <img 
                                    // 🚀 FIXED: Removed cache buster here too!
                                    src={`${API_URL}/api/students/StudentPhoto/${student.id}`} 
                                    alt={student.firstName} 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 font-black border-2 border-white shadow-sm">
                                    {student.firstName ? student.firstName.charAt(0).toUpperCase() : "?"}
                                  </div>
                                )}

                                <div>
                                  <p className="font-bold text-slate-900">{student.firstName} {student.lastName}</p>
                                  <p className="text-xs text-slate-500 font-medium">{t('roll')}: {student.rollNumber || "N/A"}</p>
                                </div>
                              </div>
                              {existingSub && (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                  <CheckCircle size={14} /> {t('graded')}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('assign_grade')}</label>
                                <select 
                                  value={currentGrade}
                                  onChange={(e) => handleDraftChange(student.id, "grade", e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="">{t('select_grade')}</option>
                                  <option value="A+">A+</option>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="F">{t('fail')}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('teacher_comments')}</label>
                                <input 
                                  type="text" 
                                  value={currentComment}
                                  onChange={(e) => handleDraftChange(student.id, "comment", e.target.value)}
                                  placeholder={t('add_feedback')} 
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" 
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {classStudents.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <button 
                        onClick={handleGradeSubmit}
                        disabled={isSubmittingGrades}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingGrades ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <><CheckCircle size={20} /> {t('save_new_grades')}</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t('analytics_overview')}</h3>
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-extrabold text-indigo-600 mb-1">{completionPercentage}%</div>
                      <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">{t('completion_rate')}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-slate-600">{t('graded')}</span>
                        <span className="text-indigo-700">{gradedCount} / {totalStudents}</span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden shadow-inner">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;