import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import { Users, BookOpen, Activity, CheckCircle, Sparkles, FileText, Presentation } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useLanguage(); 

    const [stats, setStats] = useState({
        totalStudents: 0,
        totalClasses: 0,
        activeAssignments: 0,
        attendanceRate: 0,
        attendanceData: [],  
        performanceData: []  
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Grab the token
                const token = localStorage.getItem("token");
                
                // 2. Fetch with the Authorization Header
                const res = await fetch(`${API_URL}/api/dashboard/stats`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else if (res.status === 401) {
                    // Optional: If token expires, boot them to login
                    console.error("Token expired or invalid");
                    navigate("/login"); 
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <DashboardHeader title={t('overview')} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('welcome_back')}</h1>
                    <p className="text-slate-500 mt-1">{t('dashboard_subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={28}/></div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('total_students')}</p>
                            <h3 className="text-3xl font-black text-slate-800">
                                {isLoading ? "-" : stats.totalStudents}
                            </h3>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><BookOpen size={28}/></div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('total_classes')}</p>
                            <h3 className="text-3xl font-black text-slate-800">
                                {isLoading ? "-" : stats.totalClasses}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><FileText size={28}/></div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('assignments')}</p>
                            <h3 className="text-3xl font-black text-slate-800">
                                {isLoading ? "-" : stats.activeAssignments}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={28}/></div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('todays_attendance')}</p>
                            <h3 className="text-3xl font-black text-slate-800">
                                {isLoading ? "-" : `${stats.attendanceRate}%`}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">{t('weekly_attendance')}</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.attendanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => t(val)} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                    
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }} 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                        labelFormatter={(label) => t(label)}
                                        formatter={(value) => [value, t('attendance')]}
                                    />
                                    <Bar dataKey="attendance" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">{t('class_average')}</h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => t(val)} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                    
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                        labelFormatter={(label) => t(label)}
                                        formatter={(value) => [value, t('avgScore')]}
                                    />
                                    <Line type="monotone" dataKey="avgScore" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-4">{t('quick_actions')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    <div onClick={() => navigate('/test-generator')} className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-md text-white cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all">
                        <Sparkles size={32} className="mb-4 opacity-90" />
                        <h3 className="text-xl font-bold mb-2">{t('generate_test')}</h3>
                        <p className="text-indigo-100 text-sm">{t('generate_test_sub')}</p>
                    </div>

                    <div onClick={() => navigate('/ppt-generator')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group">
                        <Presentation size={32} className="mb-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('create_ppt')}</h3>
                        <p className="text-slate-500 text-sm">{t('create_ppt_sub')}</p>
                    </div>

                    <div onClick={() => navigate('/attendance')} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group">
                        <CheckCircle size={32} className="mb-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('mark_attendance')}</h3>
                        <p className="text-slate-500 text-sm">{t('mark_attendance_sub')}</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;