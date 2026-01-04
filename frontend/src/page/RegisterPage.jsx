import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from "lucide-react";
import { register } from "@/service/AuthService";
import Footer from "../components/Footer";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await register(data);

      if (response.status) {
        setSuccess("Registration successful! Redirecting to login...");
        reset();
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.username?.[0] ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An error occurred during registration";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    <div className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Container Utama */}
      <div className="flex flex-col lg:flex-row flex-1 items-center justify-center px-6 lg:px-20 py-10 gap-12 lg:gap-20">
        
        {/* SISI KIRI: Form Register */}
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">Create An Account</h1>
            <p className="text-gray-500 text-lg">
              Create an account to monitor your website and server uptime.
            </p>
          </div>

          {/* Feedback Messages */}
          {success && (
            <div className="flex items-center gap-2 p-3 text-green-700 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Username<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Create a unique username"
                disabled={loading}
                className={`w-full h-11 px-4 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
                {...formRegister("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "At least 3 characters" },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers and underscores" },
                })}
              />
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g., example@gmail.com"
                disabled={loading}
                className={`w-full h-11 px-4 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
                {...formRegister("email", {
                  required: "Email is required",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  disabled={loading}
                  className={`w-full h-11 px-4 pr-12 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                  {...formRegister("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "At least 8 characters" },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex items-start gap-2 mt-2 text-[#2563EB] text-[11px]">
                <Info size={14} className="mt-0.5 shrink-0" />
                <p>Use 8 or more characters with a mix of letters and numbers.</p>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  disabled={loading}
                  className={`w-full h-11 px-4 pr-12 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password_confirmation ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                  {...formRegister("password_confirmation", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-600">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 mt-4 rounded-full font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                loading ? "bg-gray-400" : "bg-[#B1B5BD] hover:bg-blue-600"
              }`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-gray-600 font-medium text-sm">
              Already Have An Account?{" "}
              <Link to="/login" className="text-blue-600 font-bold hover:underline ml-1">
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* SISI KANAN: Hero Section (Dashboard & Laptop 3D) */}
        <div className="hidden lg:flex flex-1 w-full max-w-[650px] aspect-square bg-[#60A5FA] rounded-[50px] p-10 flex-col items-center justify-start relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="text-center z-20 mt-6 mb-8">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Monitor your website uptime <br /> effortlessly.
            </h2>
          </div>
          
          <div className="relative w-full h-full">
            {/* Dashboard Screenshot */}
            <div className="absolute top-0 left-[-20%] w-[130%] z-0 transform -rotate-1">
              <img 
                src="/Image1.png" 
                alt="Dashboard Monitor" 
                className="rounded-3xl shadow-2xl border-4 border-white/20 w-full object-cover"
              />
            </div>

            {/* Laptop 3D Illustration */}
            <div className="absolute bottom-[5%] right-[-10%] w-[75%] z-10 drop-shadow-[0_45px_45px_rgba(0,0,0,0.5)] animate-float">
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

      {/* Animasi Floating */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 5.5s ease-in-out infinite;
        }
      `}} />
    </div>
    <Footer/>
  </>
  );
}

export default RegisterPage;
