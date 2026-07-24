import {
  Search, Trophy, Sparkles, Grid, User, Users,
  UserCheck, ScanFace, FileEdit, Calendar, FileText, GraduationCap, Presentation
} from "lucide-react";
import { Link } from "react-router-dom";

// 1. Import your Language Hook (Adjust path if needed)
import { useLanguage } from '../context/LanguageContext';

function Sidebar() {
  // 2. Initialize the translation function
  const { t } = useLanguage();

  return (
    <div className="group fixed top-0 left-0 h-screen bg-slate-900 border-r border-slate-800 transition-all z-[60] duration-300 w-16 hover:w-64 overflow-hidden flex flex-col shadow-2xl">

      {/* 🔷 BRAND LOGO AREA (NOW LINKS TO HOME) */}
      <Link to="/" className="h-20 flex items-center px-3 border-b border-slate-800 shrink-0 cursor-pointer hover:bg-slate-800/50 transition-colors no-underline">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-sm shrink-0">
          <GraduationCap className="text-white" size={24} />
        </div>
        <span className="ml-3.5 text-xl font-black text-white tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Shiksha<span className="text-indigo-400">Sahayak</span>
        </span>
      </Link>

      {/* 🔷 NAVIGATION MENU */}
      <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        <Link to="/dashboard" className="block no-underline">
          <SidebarItem icon={<Grid size={22} />} text={t("sb_dashboard")} />
        </Link>

        {/* Removed Home item from here! */}

        <Link to="/assignment" className="block no-underline">
          <SidebarItem icon={<FileText size={22} />} text={t("sb_assignments")} />
        </Link>

        <Link to="/timetable" className="block no-underline">
          <SidebarItem icon={<Calendar size={22} />} text={t("sb_timetable")} />
        </Link>

        <Link to="/attendance" className="block no-underline">
          <SidebarItem icon={<UserCheck size={22} />} text={t("sb_attendance")} />
        </Link>

        <Link to="/smart-attendance" className="block no-underline">
          <SidebarItem icon={<ScanFace size={22} />} text={t("sb_ai_attendance")} />
        </Link>

        <Link to="/ppt-generator" className="block no-underline">
          <SidebarItem icon={<Presentation size={22} />} text={t("sb_ppt_generator")} />
        </Link>

        <Link to="/test-generator" className="block no-underline">
          <SidebarItem icon={<FileEdit size={22} />} text={t("sb_test_generator")} />
        </Link>

        <Link to="/students" className="block no-underline">
          <SidebarItem icon={<Users size={22} />} text={t("sb_students")} />
        </Link>

        <div className="block no-underline mt-8 border-t border-slate-800 pt-4">
          <SidebarItem icon={<Trophy size={22} />} text={t("sb_leaderboards")} />
          <SidebarItem icon={<Sparkles size={22} />} text={t("sb_ai_insights")} />
          <Link to="/profile" className="block no-underline">
            <SidebarItem icon={<User size={22} />} text={t("sb_teacher_profile")} />
          </Link>
        </div>

      </nav>
    </div>
  );
}

// 🔷 HELPER COMPONENT FOR SIDEBAR LINKS
function SidebarItem({ icon, text }) {
  return (
    <div className="flex items-center px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-600 transition-all duration-200 cursor-pointer group/item">

      {/* Icon Container */}
      <div className="shrink-0 flex items-center justify-center">
        {icon}
      </div>

      {/* Text Container */}
      <span className="ml-3.5 font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {text}
      </span>

    </div>
  );
}

export default Sidebar;