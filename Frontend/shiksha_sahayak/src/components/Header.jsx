import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 🚀 Persistent Auth: Check local storage on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("teacherFirstName");
    
    if (token) {
      setIsLoggedIn(true);
      setTeacherName(name || "Teacher");
    }
  }, []);

  // 🚀 Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("teacherFirstName");
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    navigate('/'); 
  };

  return (
    // 🚀 FIXED ALIGNMENT: left-0 and w-full makes it perfectly centered!
    <header className="fixed top-0 left-0 w-full h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* CENTER ZONE / LOGO */}
        <Link to="/" className="flex items-center gap-3 no-underline group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight cursor-pointer">
            Shiksha<span className="text-indigo-600">Sahayak</span>
          </span>
        </Link>

        {/* RIGHT ZONE / AUTH BUTTONS */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            /* SHOW THIS IF LOGGED OUT */
            <>
              <Link to="/login">
                <button className="px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            /* SHOW THIS IF LOGGED IN (Persistent Auth) */
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-full hover:bg-slate-50 transition-all text-slate-700 font-bold"
              >
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
                {teacherName}
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}

export default Header;