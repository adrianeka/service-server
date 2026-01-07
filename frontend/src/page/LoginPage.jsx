import Navbar from "@/components/Navbar";
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react"; 
import { useState } from "react";
import { login } from "@/service/AuthService";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../components/Footer";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [emailError, setEmailError] = useState(""); 
  const [passwordError, setPasswordError] = useState(""); 
  // --- STATE UNTUK WARNA HIJAU ---
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setIsSuccess(false);

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.status) {
        // 1. Set state success menjadi true
        setIsSuccess(true);
        
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        
        // 2. Beri jeda sebentar agar user melihat warna hijau sebelum pindah halaman
        setTimeout(() => {
          navigate("/dashboard");
        }, 800); 
      }
    } catch (err) {
      setPasswordError("The email or password you entered is incorrect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
        <Navbar />
        
        <div className="flex flex-col lg:flex-row flex-1 items-center justify-center px-6 lg:px-20 py-10 gap-12 lg:gap-20">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">Welcome Back</h1>
              <p className="text-gray-500 text-lg">Enter your email and password to access your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* --- FIELD EMAIL --- */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email*</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  disabled={isSuccess}
                  placeholder="alex123.com"
                  className={`w-full h-12 px-4 border rounded-xl focus:outline-none transition-all duration-300 ${
                    isSuccess 
                      ? "border-green-500 bg-green-50 text-green-700" // Warna Hijau saat Berhasil
                      : emailError 
                        ? "border-orange-500 bg-gray-50" 
                        : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                  }`}
                />
                {emailError && (
                  <div className="flex items-center gap-1.5 mt-2 text-orange-600 text-xs font-medium">
                    <AlertTriangle size={14} />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              {/* --- FIELD PASSWORD --- */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password*</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    disabled={isSuccess}
                    className={`w-full h-12 px-4 pr-12 border rounded-xl focus:outline-none transition-all duration-300 ${
                      isSuccess 
                        ? "border-green-500 bg-green-50 text-green-700" // Warna Hijau saat Berhasil
                        : passwordError 
                          ? "border-orange-500 bg-gray-50" 
                          : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {!isSuccess && (
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  )}
                  {isSuccess && (
                    <CheckCircle2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 animate-pulse" />
                  )}
                </div>
                {passwordError && (
                  <div className="flex items-start gap-1.5 mt-2 text-orange-600 text-xs font-medium">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isSuccess}
                className={`w-full h-12 rounded-full font-bold text-white shadow-lg transition-all ${
                  isSuccess 
                    ? "bg-green-600 shadow-green-200" 
                    : loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {isSuccess ? "Redirecting..." : loading ? "Logging in..." : "Log In"}
              </button>
            </form>
            <div className="text-center pt-2">
              <p className="text-gray-600 font-medium">
                Don’t Have An Account?{" "}
                <Link to="/Register" className="text-blue-500 font-bold hover:underline ml-1">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
{/* SISI KANAN: Hero Section */}
<div className="hidden lg:flex flex-1 w-full max-w-[650px] aspect-square bg-[#60A5FA] rounded-[50px] p-10 flex-col items-center justify-start relative overflow-hidden shadow-2xl">
            <div className="text-center z-20 mt-6 mb-8">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Monitor your website uptime <br /> effortlessly.
              </h2>
            </div>
            <div className="relative w-full h-full">
              <div className="absolute top-0 right-[-20%] w-[130%] h-full z-0 flex justify-end">
                <img 
                  src="/Image1.png" 
                  alt="Dashboard Monitor" 
                  className="rounded-3xl shadow-2xl border-4 border-white/20 w-[90%] h-full object-cover"
                />
              </div>
              <div className="absolute bottom-[5%] right-[-10%] w-[75%] z-10 drop-shadow-[0_45px_45px_rgba(0,0,0,0.5)]">
                <img 
                  src="/Image2.png" 
                  alt="3D Illustration" 
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-blue-400/20 to-transparent blur-3xl rounded-full pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default LoginPage;