import { Link } from "react-router-dom";
import { GraduationCap, Mail, MapPin } from "lucide-react";

function Footer() {
  return (
    <div className="ml-16 bg-white border-t border-slate-200 px-6 lg:px-12 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* BRAND */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <GraduationCap className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Shiksha Sahayak
            </h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Empowering teachers with smart tools to transform education and improve learning outcomes across India.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Platform</h3>
          <ul className="space-y-3 text-slate-500 text-sm font-medium">
            <Link to="/" className="block hover:text-indigo-600 transition-colors">Home</Link>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">Features</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">Pricing</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">About Us</li>
          </ul>
        </div>

        {/* FEATURES */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Features</h3>
          <ul className="space-y-3 text-slate-500 text-sm font-medium">
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">Smart Assignments</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">AI Test Generator</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">Student Management</li>
            <li className="hover:text-indigo-600 cursor-pointer transition-colors">Progress Analytics</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Contact</h3>
          <div className="space-y-3 text-slate-500 text-sm font-medium">
            <p className="flex items-center gap-2 hover:text-indigo-600 cursor-pointer transition-colors">
              <Mail size={16} /> support@shikshasahayak.com
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} /> Pune, Maharashtra, India
            </p>
          </div>
        </div>

      </div>

      {/* BOTTOM LINE */}
      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm font-medium">
        <p>© {new Date().getFullYear()} Shiksha Sahayak. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>

    </div>
  );
}

export default Footer;