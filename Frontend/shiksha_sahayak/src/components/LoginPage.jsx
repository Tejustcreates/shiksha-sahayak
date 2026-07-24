import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Home } from "lucide-react";
import { API_URL } from '../config';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the JWT token and Teacher ID securely in the browser
        localStorage.setItem("token", data.token);
        localStorage.setItem("teacherId", data.teacherId);
        
        // ✅ FIXED: Added the teacher's first name here!
        localStorage.setItem("teacherFirstName", data.firstName); 
        
        // Redirect straight to the dashboard!
        navigate("/dashboard"); 
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Cannot connect to server. Is Flask running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl shadow-sm border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md transition-all font-bold"
      >
        <Home size={18} /> Home
      </button>

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Sign In</h2>
        <p className="text-gray-500 text-center mb-6">Welcome back to Shiksha Sahayak</p>

        {/* Display Errors from the server */}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <label>
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <span className="text-blue-500 cursor-pointer">Forgot password?</span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-all shadow-md"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/signup")} className="text-blue-500 cursor-pointer font-semibold">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;