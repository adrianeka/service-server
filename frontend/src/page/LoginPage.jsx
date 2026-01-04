import Navbar from "@/components/Navbar";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { login } from "@/service/AuthService";
import { useNavigate, Link } from "react-router-dom";
import Footer from "../components/Footer";

function LoginPage() {
  // --- TAMBAHKAN DEKLARASI STATE DI SINI ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // -----------------------------------------

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sekarang variabel email dan password sudah terdefinisi dari state
      const res = await login(email, password);
      if (res.status) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/dashboard");
      }
    } catch (err) {
      // Menampilkan pesan error spesifik dari server jika ada
      setError(err.response?.data?.message || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
        <Navbar />
        
        <div className="flex flex-col lg:flex-row flex-1 items-center justify-center px-6 lg:px-20 py-10 gap-12 lg:gap-20">
          
          {/* SISI KIRI: Form Login */}
          <div className="w-full max-w-md space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">Welcome Back</h1>
              <p className="text-gray-500 text-lg">
                Enter your email and password to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  placeholder="youremail@gmail.com"
                  value={email} // Menggunakan state email
                  onChange={(e) => setEmail(e.target.value)} // Update state email
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password} // Menggunakan state password
                    onChange={(e) => setPassword(e.target.value)} // Update state password
                    required
                    className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-medium">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                  <span className="text-gray-500 group-hover:text-gray-800">Remember me</span>
                </label>
                <Link to="/forgot-password" intrinsic="sm" className="text-blue-500 hover:text-blue-700 transition-colors">
                  Forgot Your Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 rounded-full font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                  loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {loading ? "Logging in..." : "Log In"}
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