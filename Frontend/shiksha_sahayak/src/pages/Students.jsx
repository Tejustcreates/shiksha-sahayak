import React, { useState, useEffect } from 'react';
import DashboardHeader from "../components/DashboardHeader";
import { 
  Users, Search, Plus, Download, X, Mail, Phone, Calendar, 
  GraduationCap, Activity, CheckCircle2, MessageSquare, 
  TrendingUp, BookOpen, Clock, ChevronRight, Edit, XCircle
} from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const Students = () => {
  const { t } = useLanguage(); 

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [editingStudentId, setEditingStudentId] = useState(null);

  //  AI Training Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPhotos, setAiPhotos] = useState([]);
  const [aiTrainingStatus, setAiTrainingStatus] = useState('idle'); // idle, processing, success, error
  const [aiMessage, setAiMessage] = useState("");
  const [trainAction, setTrainAction] = useState('append'); // 'append' or 'replace'

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 🚀 NEW: Smart Cache Buster State
  const [imageHash, setImageHash] = useState(Date.now());

  const [availableClasses, setAvailableClasses] = useState([]);
  const [classIdToName, setClassIdToName] = useState({});

  const [studentForm, setStudentForm] = useState({
    firstName: '', lastName: '', rollNumber: '', age: '', parentName: '', 
    parentContact: '', parentEmail: '', classId: '', parentPreferredLanguage: 'English', photoFile: null
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/classes/dropdown`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const classData = await response.json();
          setAvailableClasses(classData);
          
          const newClassMap = {};
          classData.forEach(c => {
            newClassMap[c.id] = `${c.grade}`;
          });
          setClassIdToName(newClassMap);
        }
      } catch (err) {
        console.error("Failed to fetch classes", err);
      }
    };
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/students/getAllStudents`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setStudents(data);
      
      // 🚀 SMART CACHE BUSTER: Update the hash only when we pull fresh data from the DB
      setImageHash(Date.now());
      
      if (selectedStudent) {
        const updatedSelected = data.find(s => s.id === selectedStudent.id);
        if (updatedSelected) setSelectedStudent(updatedSelected);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const filteredStudents = students.filter(s => {
    const className = classIdToName[s.classId] || "";
    const matchesSearch = s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.rollNumber && s.rollNumber.includes(searchTerm));
    const matchesClass = classFilter === 'All' || className === classFilter;
    return matchesSearch && matchesClass;
  });

  const openAddModal = () => {
    setModalMode('add');
    setStudentForm({
      firstName: '', lastName: '', rollNumber: '', age: '', parentName: '', 
      parentContact: '', parentEmail: '', 
      classId: availableClasses.length > 0 ? availableClasses[0].id.toString() : '', 
      parentPreferredLanguage: 'English', photoFile: null
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setModalMode('edit');
    setEditingStudentId(student.id);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.rollNumber || '',
      age: student.age || '',
      parentName: student.parentName,
      parentContact: student.parentContact || '',
      parentEmail: student.parentEmail || '',
      classId: student.classId.toString(),
      parentPreferredLanguage: student.parentPreferredLanguage || 'English',
      photoFile: null
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("firstName", studentForm.firstName);
      formData.append("lastName", studentForm.lastName);
      formData.append("rollNumber", studentForm.rollNumber);
      formData.append("age", studentForm.age);
      formData.append("parentName", studentForm.parentName);
      formData.append("parentContact", studentForm.parentContact);
      formData.append("parentEmail", studentForm.parentEmail);
      formData.append("parentPreferredLanguage", studentForm.parentPreferredLanguage);
      formData.append("classId", studentForm.classId);

      if (studentForm.photoFile) formData.append("photo", studentForm.photoFile);

      const url = modalMode === 'add' 
        ? `${API_URL}/api/students/createStudent` 
        : `${API_URL}/api/students/updateStudent/${editingStudentId}`;

      const res = await fetch(url, {
        method: modalMode === 'add' ? "POST" : "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Failed to save student");
      
      await fetchStudents();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(t('err_saving_student'));
    }
  };

  const handleTrainAI = async () => {
    if (aiPhotos.length === 0) return alert("Please select at least 1 photo.");
    if (aiPhotos.length > 5) return alert("Maximum 5 photos allowed for optimal performance.");

    setAiTrainingStatus('processing');
    
    const formData = new FormData();
    formData.append("student_id", selectedStudent.id);
    formData.append("class_id", selectedStudent.classId);
    formData.append("action", trainAction); 
    
    Array.from(aiPhotos).forEach(file => {
      formData.append("photos", file);
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/attendance/train-student`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Training failed");

      setAiTrainingStatus('success');
      setAiMessage(`Success! AI encoded ${data.faces_encoded} face angles. Total memory: ${data.total_memory} faces.`);
      
      setTimeout(() => {
        setIsAiModalOpen(false);
        setAiTrainingStatus('idle');
        setAiPhotos([]);
      }, 3500);

    } catch (err) {
      console.error(err);
      setAiTrainingStatus('error');
      setAiMessage(err.message);
    }
  };

  const AvatarIcon = ({ student, size = "md" }) => {
    const dimensions = size === "md" ? "w-12 h-12 text-lg" : "w-28 h-28 text-4xl";
    if (student.photo) {
      // 🚀 FIXED: Added the controlled imageHash here!
      return <img src={`${API_URL}/api/students/StudentPhoto/${student.id}?t=${imageHash}`} alt={student.firstName} className={`${dimensions} rounded-full object-cover border-4 border-white shadow-md`} />;
    }
    return (
      <div className={`${dimensions} rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-black border-4 border-white shadow-md`}>
        {student.firstName ? student.firstName.charAt(0).toUpperCase() : "?"}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 flex flex-col">
      <DashboardHeader title={t('student_management')} />
      
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 relative overflow-hidden">
        
        {/* LEFT PANE */}
        <div className={`flex-1 transition-all duration-500 ${selectedStudent ? 'hidden lg:block lg:pr-4' : ''}`}>
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('student_directory')}</h1>
            <p className="text-slate-500 mt-1 mb-6">{t('student_directory_sub')}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24}/></div>
                <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('total_students')}</p><h3 className="text-2xl font-black text-slate-800">{students.length}</h3></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen size={24}/></div>
                <div><p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('total_classes')}</p><h3 className="text-2xl font-black text-slate-800">{availableClasses.length}</h3></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex-1 flex gap-4 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" placeholder={t('search_student_placeholder')} 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select 
                value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
              >
                <option value="All">{t('all_classes')}</option>
                {availableClasses.map(cls => (
                  <option key={cls.id} value={`${cls.grade}`}>
                    {t(cls.grade)} 
                  </option>
                ))}
              </select>
            </div>
            
            <button onClick={openAddModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm">
              <Plus size={18} /> {t('add_student')}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
            {isLoading ? (
               <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : filteredStudents.length === 0 ? (
               <div className="flex justify-center items-center h-48 text-slate-500 font-medium">{t('no_students_found')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-0">
                {filteredStudents.map((student) => (
                  <div 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className={`flex items-center gap-4 p-5 cursor-pointer transition-all border-b border-r border-slate-100 hover:bg-indigo-50/50 group
                      ${selectedStudent?.id === student.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}
                    `}
                  >
                    <AvatarIcon student={student} size="md" />
                    <div className="flex-1">
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
                        {t(classIdToName[student.classId] || "unknown")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE (STUDENT PROFILE) */}
        {selectedStudent && (
          <div className="w-full lg:w-[480px] xl:w-[500px] flex-shrink-0 bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-500 h-[calc(100vh-8rem)] sticky top-24">
            
            <div className="p-4 flex justify-between items-center border-b border-slate-50">
              <span className="font-bold text-slate-400 text-sm tracking-wider uppercase px-2">{t('student_profile')}</span>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 flex-1 overflow-y-auto custom-scrollbar pb-8">
              <div className="relative mt-6 mb-4 flex flex-col items-center text-center">
                <AvatarIcon student={selectedStudent} size="lg" />
                <h2 className="text-2xl font-black text-slate-900 mt-4">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                <p className="text-indigo-600 font-bold flex items-center justify-center gap-1.5 mt-2 bg-indigo-50 px-3 py-1 rounded-full">
                  <GraduationCap size={16}/> {t(classIdToName[selectedStudent.classId])}
                </p>
              </div>

              <div className="flex justify-center gap-3 mb-6 border-b border-slate-100 pb-6">
                <button 
                  onClick={() => openEditModal(selectedStudent)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Edit size={16}/> {t('edit_profile')}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold text-sm border border-slate-200">
                  <Phone size={16}/> {t('call')}
                </button>
              </div>

              {/* 🚀 NEW: Train AI Button */}
              <div className="flex justify-center mb-8">
                 <button 
                  onClick={() => { setIsAiModalOpen(true); setAiTrainingStatus('idle'); setAiPhotos([]); setTrainAction('append'); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm shadow-sm"
                >
                  <Activity size={18} className="animate-pulse" /> Train AI Recognition
                </button>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Users size={14}/> {t('personal_details')}</h4>
              <div className="bg-white rounded-2xl border border-slate-200 mb-8 overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
                  <div className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('roll_number_label')}</p><p className="font-bold text-slate-800">{selectedStudent.rollNumber || t('n_a')}</p></div>
                  <div className="p-4"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('age_label')}</p><p className="font-bold text-slate-800">{selectedStudent.age || t('n_a')} {selectedStudent.age ? t('yrs') : ''}</p></div>
                  <div className="p-4 col-span-2 border-t"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('parent_guardian')}</p><p className="font-bold text-slate-800">{selectedStudent.parentName} <span className="text-sm text-slate-500 font-medium ml-2">{selectedStudent.parentContact}</span></p></div>
                  <div className="p-4 col-span-2 border-t"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('parent_email_label')}</p><p className="font-bold text-slate-800">{selectedStudent.parentEmail || t('not_provided')}</p></div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900">{modalMode === 'add' ? t('add_new_student') : t('edit_student_profile')}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('first_name_req')}</label><input type="text" required value={studentForm.firstName} onChange={e => setStudentForm({...studentForm, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('last_name_req')}</label><input type="text" required value={studentForm.lastName} onChange={e => setStudentForm({...studentForm, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" /></div>
                
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('roll_number_req')}</label><input type="text" required value={studentForm.rollNumber} onChange={e => setStudentForm({...studentForm, rollNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('age_opt')}</label><input type="number" required value={studentForm.age} onChange={e => setStudentForm({...studentForm, age: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" /></div>

                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('parent_name_req')}</label><input type="text" required value={studentForm.parentName} onChange={e => setStudentForm({...studentForm, parentName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('parent_contact_req')}</label><input type="text" required value={studentForm.parentContact} onChange={e => setStudentForm({...studentForm, parentContact: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" /></div>
                
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('parent_email_opt')}</label><input type="email" value={studentForm.parentEmail} onChange={e => setStudentForm({...studentForm, parentEmail: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" /></div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('class_required')}</label>
                  <select value={studentForm.classId} onChange={e => setStudentForm({...studentForm, classId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700">
                    {availableClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {t(cls.grade)} 
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('update_photo_opt')}</label>
                  <div className="w-full flex items-center px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl border-dashed">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setStudentForm({...studentForm, photoFile: e.target.files[0]})}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all">{t('cancel')}</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2">
                  {modalMode === 'add' ? <><Plus size={18}/> {t('enroll_student')}</> : <><Edit size={18}/> {t('save_changes')}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 AI TRAINING MODAL */}
      {isAiModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="text-indigo-600"/> Train AI Model
              </h2>
              {aiTrainingStatus !== 'processing' && (
                <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
              )}
            </div>

            <div className="p-6 text-center">
              {aiTrainingStatus === 'idle' && (
                <>
                  <p className="text-sm text-slate-500 mb-6 font-medium">
                    Upload 2 to 5 clear photos of <b>{selectedStudent.firstName}</b> from different angles or lighting to improve classroom detection accuracy.
                  </p>
                  
                  {/* 🚀 Replace vs Append Toggle */}
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                    <button
                      onClick={() => setTrainAction('append')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        trainAction === 'append' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Add to memory
                    </button>
                    <button
                      onClick={() => setTrainAction('replace')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        trainAction === 'replace' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Delete old & Replace
                    </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setAiPhotos(e.target.files)}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer w-full"
                    />
                    <p className="text-xs text-indigo-500 mt-3 font-semibold">
                      {aiPhotos.length > 0 ? `${aiPhotos.length} photos selected` : "Select 2-5 photos"}
                    </p>
                  </div>

                  <button 
                    onClick={handleTrainAI}
                    disabled={aiPhotos.length === 0}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Activity size={18} /> Start AI Training
                  </button>
                </>
              )}

              {aiTrainingStatus === 'processing' && (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <Activity size={24} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Extracting Facial Features...</h3>
                  <p className="text-sm text-slate-500">The AI is analyzing {aiPhotos.length} photos to build a robust mathematical model. This may take a minute.</p>
                </div>
              )}

              {aiTrainingStatus === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-700 mb-2">Training Complete!</h3>
                  <p className="text-sm text-slate-500">{aiMessage}</p>
                </div>
              )}

              {aiTrainingStatus === 'error' && (
                <div className="py-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                    <XCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-rose-700 mb-2">Training Failed</h3>
                  <p className="text-sm text-slate-500 mb-6">{aiMessage}</p>
                  <button onClick={() => setAiTrainingStatus('idle')} className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">Try Again</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;