// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext"; 

import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/LoginPage";
import Signup from "./components/SignUpPage";
import TimeTable from "./components/TimeTable";
import TeacherProfile from "./components/TeacherProfile";

import Dashboard from "./pages/Dashboard"; 
import Assignment from "./pages/Assignment";
import AI from "./pages/AI";
import Students from "./pages/Students";
import Analytics from "./pages/Analytics";
import AttendancePage from "./pages/Attendance";
import SmartAttendance from "./pages/SmartAttendance";
import TestGenerator from "./pages/TestGenerator";
import PPTGenerator from "./pages/PPTGenerator";

// ✅ 1. IMPORT YOUR NEW CHATBOT WIDGET
import ChatBotWidget from "./components/ChatBotWidget";

function Layout() {
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage = path === "/login" || path === "/signup";
  const isLandingPage = path === "/";
  const isDashboardPage = !isAuthPage && !isLandingPage; 

  // LAYOUT 1: LANDING PAGE 
  if (isLandingPage) {
    return (
      <>
        <Header />
        <div className="mt-20 p-5"> 
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </div>
        <Footer />
      </>
    );
  }

  // LAYOUT 2: AUTH PAGES
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  // LAYOUT 3: DASHBOARD PAGES
  if (isDashboardPage) {
    return (
      <>
        <Sidebar />
        <div className="ml-16 bg-slate-50 min-h-screen relative">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} /> 
            <Route path="/timetable" element={<TimeTable />} />
            <Route path="/assignment" element={<Assignment />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/students" element={<Students />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/smart-attendance" element={<SmartAttendance />} />
            <Route path="/test-generator" element={<TestGenerator />} />
            <Route path="/ppt-generator" element={<PPTGenerator />} />
            <Route path="/profile" element={<TeacherProfile />} />
          </Routes>
          
          {/* ✅ 2. DROP THE CHATBOT HERE! It will now float on all dashboard pages */}
          <ChatBotWidget />
          
        </div>
      </>
    );
  }

  return null;
}

// ✅ WRAP THE ROUTER IN THE LANGUAGE PROVIDER
function App() {
  return (
    <LanguageProvider>
      <Router>
        <Layout />
      </Router>
    </LanguageProvider>
  );
}

export default App;