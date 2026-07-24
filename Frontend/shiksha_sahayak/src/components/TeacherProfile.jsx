import React, { useState, useEffect } from 'react';
import DashboardHeader from "../components/DashboardHeader";
import { 
  User, Mail, Phone, Lock, Shield, Save, 
  Camera, CheckCircle2, AlertCircle, Key, Briefcase, GraduationCap
} from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const TeacherProfile = () => {
  const { t } = useLanguage(); // 🚀 INITIALIZED THE TRANSLATOR

  const [isLoading, setIsLoading] = useState(true); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });
  
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '', birthdate: '',
    gender: '', school: '', experience: '', qualification: '', fieldOfStudy: '', bio: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  // 🚀 Changed arrays to use translation keys so they save correctly to DB
  const experienceOptions = [
    "tp_exp_0_1", "tp_exp_1_3", "tp_exp_3_5", "tp_exp_5_10", "tp_exp_10_plus"
  ];

  const qualificationOptions = [
    "tp_qual_ded", "tp_qual_bed", "tp_qual_ba", "tp_qual_bsc", "tp_qual_bcom", "tp_other"
  ];

  // 🚀 FETCH PROFILE DATA
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/teacher/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfile({
            firstName: data.firstName || '', lastName: data.lastName || '',
            email: data.email || '', phone: data.phone || '', birthdate: data.birthdate || '',
            gender: data.gender || '', school: data.school || '', experience: data.experience || '',
            qualification: data.qualification || '', fieldOfStudy: data.fieldOfStudy || '', bio: data.bio || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 🚀 SAVE PROFILE DATA
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/teacher/profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(profile)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("teacherFirstName", profile.firstName);
        setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Update failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection error.' });
    }
  };

  // 🚀 CHANGE PASSWORD
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassMessage({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/teacher/change-password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPassMessage({ type: 'success', text: data.message || 'Password changed successfully!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPassMessage({ type: '', text: '' }), 3000);
      } else {
        setPassMessage({ type: 'error', text: data.error || 'Password update failed.' });
      }
    } catch (err) {
      setPassMessage({ type: 'error', text: 'Server connection error.' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <DashboardHeader title={t("tp_title")} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* ================= LEFT COLUMN: Profile Summary ================= */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden sticky top-24">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center p-1.5 shadow-xl">
                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-4xl">
                  {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : "T"}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full shadow-lg hover:bg-indigo-600 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900">{profile.firstName} {profile.lastName || ''}</h2>
            <p className="text-slate-500 font-medium mb-1">
              {profile.qualification ? t(profile.qualification).split('(')[0].trim() : t("tp_educator")}
            </p>
            <p className="text-indigo-600 font-bold text-sm mb-6 bg-indigo-50 px-3 py-1 rounded-full inline-block">
              {profile.school || t("shikshaSahayak")}
            </p>
            
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Mail size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700 truncate">{profile.email || t("tp_no_email")}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Shield size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">{t("tp_verified")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Settings Forms ================= */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6">
            
            {/* --- Section 1: Personal Information --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="text-indigo-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-900">{t("tp_personal_info")}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_first_name")}</label>
                    <input type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_last_name")}</label>
                    <input type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_email")}</label>
                    <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_phone")}</label>
                    <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" placeholder="+91" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_dob")}</label>
                    <input type="date" value={profile.birthdate} onChange={(e) => setProfile({...profile, birthdate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_gender")}</label>
                    <select value={profile.gender} onChange={(e) => setProfile({...profile, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">{t("tp_select_gender")}</option>
                      <option value="Male">{t("tp_male")}</option>
                      <option value="Female">{t("tp_female")}</option>
                      <option value="Other">{t("tp_other")}</option>
                      <option value="Prefer not to say">{t("tp_prefer_not_to_say")}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Section 2: Professional Details --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <Briefcase className="text-purple-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">{t("tp_prof_details")}</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_school_name")}</label>
                    <input type="text" value={profile.school} onChange={(e) => setProfile({...profile, school: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" placeholder={t("tp_school_ph")} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_experience")}</label>
                    <select value={profile.experience} onChange={(e) => setProfile({...profile, experience: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">{t("tp_select_exp")}</option>
                      {experienceOptions.map(exp => <option key={exp} value={exp}>{t(exp)}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <GraduationCap size={18} className="text-indigo-500"/> {t("tp_edu_bg")}
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_highest_qual")}</label>
                    <select value={profile.qualification} onChange={(e) => setProfile({...profile, qualification: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800">
                      <option value="">{t("tp_select_qual")}</option>
                      {qualificationOptions.map(q => <option key={q} value={q}>{t(q)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_field_study")}</label>
                    <input 
                      type="text" 
                      value={profile.fieldOfStudy} 
                      onChange={(e) => setProfile({...profile, fieldOfStudy: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800" 
                      placeholder={t("tp_field_ph")} 
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t("tp_bio")}</label>
                      <span className={`text-xs font-bold ${profile.bio?.length >= 1000 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {profile.bio?.length || 0}/1000
                      </span>
                    </div>
                    <textarea 
                      value={profile.bio} 
                      onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                      maxLength={1000} 
                      rows="4" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800 resize-none custom-scrollbar" 
                      placeholder={t("tp_bio_ph")} 
                    />
                  </div>
                </div>

                {message.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                    {message.text}
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    <Save size={18} /> {t("tp_save_changes")}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* --- Section 3: Change Password --- */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
              <Key className="text-slate-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">{t("tp_security")}</h3>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="p-6">
              {passMessage.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${passMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {passMessage.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                  {passMessage.text}
                </div>
              )}

              <div className="space-y-5 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_current_pass")}</label>
                  <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full md:w-2/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_new_pass")}</label>
                  <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full md:w-2/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" required minLength={6} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("tp_confirm_pass")}</label>
                  <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full md:w-2/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" required minLength={6} />
                </div>
              </div>

              <div className="flex justify-start">
                <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm">
                  <Lock size={18} /> {t("tp_update_pass")}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;