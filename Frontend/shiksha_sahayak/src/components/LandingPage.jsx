import { useNavigate } from "react-router-dom";
import edu from "../assets/edu.jpg";
import { 
  ArrowRight, BookOpen, BrainCircuit, Users, 
  BarChart3, CheckCircle2, Sparkles, Zap, ShieldCheck 
} from "lucide-react";
import Header from "../components/Header"; // Make sure to import your Header!

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center bg-slate-50 min-h-screen overflow-hidden font-sans relative">
      
      {/* Include the Header here! */}
      <Header />
      
      {/* Decorative Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* ================= HERO SECTION ================= */}
      {/* 🚀 FIXED: Added pt-32 so the hero text clears the fixed header! */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 flex flex-col-reverse lg:flex-row items-center justify-between gap-16 relative z-10">
        
        {/* LEFT SIDE - TEXT */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-sm mb-6 shadow-sm">
            <Sparkles size={16} /> Empowering Rural Educators
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Transforming Education with <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Smart Technology</span>
          </h2>

          <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-xl">
            Shiksha Sahayak bridges the gap between traditional teaching and modern digital education. Generate AI test papers, manage students, and automate attendance—all in one place.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              Start Teaching Smarter <ArrowRight size={20} />
            </button>
            <button 
              className="px-8 py-4 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - IMAGE */}
        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2.5rem] transform rotate-3 scale-105 opacity-20 blur-xl"></div>
          <img
            src={edu}
            alt="Education"
            className="relative w-full max-w-[600px] h-auto rounded-[2rem] shadow-2xl border-8 border-white object-cover"
          />
          
          {/* Floating Badge */}
          <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><ShieldCheck size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Trusted By</p>
              <p className="text-lg font-black text-slate-800">1,000+ Teachers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS BANNER ================= */}
      <div className="w-full border-y border-slate-200 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
          <div className="text-center">
            <div className="text-indigo-600 text-4xl font-black mb-1">50K+</div>
            <p className="text-slate-500 font-semibold">Students Reached</p>
          </div>
          <div className="text-center">
            <div className="text-purple-600 text-4xl font-black mb-1">200+</div>
            <p className="text-slate-500 font-semibold">Partner Schools</p>
          </div>
          <div className="text-center">
            <div className="text-emerald-600 text-4xl font-black mb-1">15+</div>
            <p className="text-slate-500 font-semibold">States Covered</p>
          </div>
          <div className="text-center">
            <div className="text-amber-500 text-4xl font-black mb-1">100%</div>
            <p className="text-slate-500 font-semibold">Free for Teachers</p>
          </div>
        </div>
      </div>

      {/* ================= FEATURES SECTION ================= */}
      <div className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Everything You Need for Modern Teaching
          </h2>
          <p className="text-slate-500 text-lg">
            Cutting-edge tools designed specifically to help rural educators enhance learning outcomes and eliminate administrative busywork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<BookOpen size={28} />} color="text-blue-600" bg="bg-blue-100"
            title="Smart Assignments" 
            desc="Create, distribute, and grade assignments effortlessly with our intuitive tracking system."
          />
          <FeatureCard 
            icon={<BrainCircuit size={28} />} color="text-purple-600" bg="bg-purple-100"
            title="AI Test Generator" 
            desc="Generate syllabus-accurate question papers in seconds using our advanced AI engine."
          />
          <FeatureCard 
            icon={<Users size={28} />} color="text-emerald-600" bg="bg-emerald-100"
            title="Student Directory" 
            desc="Maintain detailed profiles, track attendance, and communicate with parents easily."
          />
          <FeatureCard 
            icon={<BarChart3 size={28} />} color="text-orange-600" bg="bg-orange-100"
            title="Progress Analytics" 
            desc="Visualize class performance and identify students who need extra help instantly."
          />
        </div>
      </div>

      {/* ================= EXTRA: HOW IT WORKS ================= */}
      <div className="w-full bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">How Shiksha Sahayak Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Three simple steps to digitize your classroom and save hours of manual work every week.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Hidden on Mobile) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-slate-700 via-indigo-500 to-slate-700"></div>

            <StepCard number="1" title="Setup Your Space" desc="Add your classes, enroll students, and set up your weekly timetable in minutes." />
            <StepCard number="2" title="Engage AI Tools" desc="Upload photos for smart attendance or let AI draft your next major test paper." />
            <StepCard number="3" title="Track & Grow" desc="Watch our analytics dashboard automatically visualize student progress over time." />
          </div>
        </div>
      </div>

      {/* ================= CTA SECTION ================= */}
      <div className="w-full max-w-5xl mx-auto px-6 py-24 text-center relative z-10">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <Zap size={48} className="text-amber-300 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to Revolutionize Your Teaching?
          </h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join the community of educators who are saving time, engaging students, and transforming rural education.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-4 rounded-xl text-indigo-700 font-black bg-white hover:bg-slate-50 hover:scale-105 shadow-xl transition-all text-lg flex items-center gap-2 mx-auto"
          >
            Start Your Journey Free <ArrowRight size={20} />
          </button>
        </div>
      </div>

    </div>
  );
}

// Small helper component for feature cards
function FeatureCard({ icon, title, desc, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
      <div className={`${bg} ${color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

// Small helper component for step cards
function StepCard({ number, title, desc }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-6 z-10">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400">{desc}</p>
    </div>
  );
}

export default LandingPage;