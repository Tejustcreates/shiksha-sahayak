import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Phone, School, Eye, EyeOff, Home } from "lucide-react";
import { API_URL } from '../config';

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    school: "",
    experience: "", 
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const experienceOptions = [
    "0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          teachingExperience: formData.experience,
          schoolName: formData.school
          // 🚀 FIXED: We no longer send classIds! The teacher starts fresh.
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account Created Successfully! Welcome to your fresh dashboard.");
        navigate("/login");
      } else {
        setError(data.error || "Failed to register");
      }
    } catch (err) {
      setError("Cannot connect to server. Is Flask running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 relative">
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl shadow-sm border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all font-bold"
      >
        <Home size={18} /> Home
      </button>

      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-gray-500 text-center mb-6">Join Shiksha Sahayak</p>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="firstName" placeholder="First Name" className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full font-medium" onChange={handleChange} required />
            <input name="lastName" placeholder="Last Name" className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full font-medium" onChange={handleChange} required />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input name="email" type="email" placeholder="Email" className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" onChange={handleChange} required />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input name="phone" placeholder="Phone Number" className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" onChange={handleChange} required />
          </div>

          <div className="relative">
            <School className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input name="school" placeholder="School Name" className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" onChange={handleChange} required />
          </div>

          <div>
            <select name="experience" className="border p-2 rounded-lg text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none w-full font-medium" onChange={handleChange} required>
              <option value="">Years of Teaching Experience</option>
              {experienceOptions.map((exp) => <option key={exp} value={exp}>{exp}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" className="w-full pl-10 pr-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" onChange={handleChange} required />
              <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" className="w-full pl-10 pr-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium" onChange={handleChange} required />
              <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="w-full py-3 mt-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transition-all shadow-md">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="text-indigo-600 cursor-pointer font-bold hover:underline">
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;