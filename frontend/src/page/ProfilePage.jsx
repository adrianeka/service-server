import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Card } from "../components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import {
  getUserProfile,
  updateProfile,
  changePassword,
  logout,
  getProfilePicture,
  uploadProfilePicture,
  deleteprofile
} from "@/service/AuthService";
import Footer2 from "../components/Footer2";

function ProfilePage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch("new_password");

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      
      if (!userData?.id) {
        navigate("/Login");
        return;
      }

      const [profileRes, pictureRes] = await Promise.all([
        getUserProfile(userData.id),
        getProfilePicture(userData.id),
      ]);

      if (profileRes.status && profileRes.data) {
        setUser(profileRes.data);
        resetProfile({
          username: profileRes.data.username,
          email: profileRes.data.email,
        });
      }

      console.log("📸 Picture Response:", pictureRes); // Debug
      
      if (pictureRes && pictureRes.status && pictureRes.data) {
        const imageUrl = pictureRes.data.full_url;
        console.log("🖼️ Setting profile picture to:", imageUrl); // Debug
        setProfilePicture(imageUrl);
      } else {
        console.log("❌ No profile picture data"); // Debug
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      setProfileError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  fetchUserProfile();
}, [navigate, resetProfile]);

const handleRemoveClick = async () => {
  // 1. Pastikan user sudah load dan memiliki ID
  if (!user || !user.id) {
    alert("User data not loaded yet.");
    return;
  }

  if (!window.confirm("Apakah Anda yakin ingin menghapus foto profil?")) return;

  try {
    setProfileLoading(true); 
    
    await deleteprofile(user.id);
    
    setProfileSuccess("Profile picture removed successfully!");
    
    // 4. Reload halaman
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } catch (err) {
    setProfileError("Gagal menghapus foto: " + (err.response?.data?.message || err.message));
  } finally {
    setProfileLoading(false);
  }
};

  const onProfileSubmit = async (data) => {
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    try {
      const response = await updateProfile(user.id, data);
      if (response.status) {
        setProfileSuccess("Profile updated successfully!");
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    } catch (error) {
      setProfileError(error.response?.data?.message || "Error updating profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);
    try {
      const response = await changePassword(user.id, data);
      if (response.status) {
        setPasswordSuccess("Password changed successfully!");
        resetPassword();
        setTimeout(async () => {
          await logout();
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/Login");
        }, 2000);
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Error changing password");
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleUploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi sederhana
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("File too large. Max 2MB.");
      return;
    }

    try {
      setProfileLoading(true); // Gunakan profileLoading agar UI konsisten
      const userData = JSON.parse(localStorage.getItem("user"));
      
      const response = await uploadProfilePicture(userData.id, file);

      if (response.status) {
        setProfilePicture(response.data.full_url);
        setProfileSuccess("Profile picture updated!");
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    } catch (err) {
      setProfileError("Failed to upload image.");
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
<>
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <Navbar />

      <div className="max-w-5xl px-4 py-8 mx-auto md:px-8">
        {/* Navigation Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-blue-500 transition-all hover:opacity-70"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          Go to Dashboard
        </Link>

        {/* 1. Header Banner Profile */}
        <div className="relative h-48 md:h-56 bg-gradient-to-r from-blue-400 to-blue-500 rounded-[2.5rem] overflow-hidden shadow-lg shadow-blue-100 mb-10">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="absolute w-96 h-96 border-[40px] border-white rounded-full -left-20 -bottom-20"></div>
            <div className="absolute w-64 h-64 border-[30px] border-white rounded-full right-10 -top-10"></div>
          </div>
          <div className="relative flex items-center h-full px-12">
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              My Profile
            </h1>
          </div>
          <div className="absolute w-48 h-48 right-12 bottom-0 hidden md:block">
            <img 
              src="/Image4.png" // Ganti dengan asset 3D karakter Anda
              alt="Illustration" 
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        {/* 2. Avatar & Change Image */}
        <div className="flex items-center gap-6 px-4 mb-10">
<div className="flex-shrink-0 w-24 h-24 bg-white border-4 border-white shadow-xl rounded-full overflow-hidden relative">
  {profileLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
      <Loader2 className="w-6 h-6 animate-spin text-white" />
    </div>
  )}
  <img
    src={profilePicture || "/default.jpg"}
    alt="Profile"
    className="w-24 h-24 rounded-full object-cover"
    onError={(e) => {
      console.error("❌ Image failed to load:", profilePicture);
      e.target.src = "/default.jpg"; // Fallback
    }}
    onLoad={() => {
      console.log("✅ Image loaded successfully:", profilePicture);
    }}
  />
</div>

  <div className="flex flex-wrap gap-4">
    {/* Input File Tersembunyi */}
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleUploadProfilePicture}
      className="hidden"
      accept="image/*"
    />
    
    <button 
      type="button"
      onClick={triggerFileInput}
      disabled={profileLoading}
      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-slate-400"
    >
      <Plus size={18} strokeWidth={3} /> 
      {profileLoading ? "Uploading..." : "Change Image"}
    </button>
    
    <button className="text-sm font-bold text-blue-500 hover:underline" onClick={handleRemoveClick}>
      Remove Image
    </button>
  </div>
</div>

        <div className="space-y-8">
          {/* 3. Profile Information Card */}
          <Card className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="mb-1 text-2xl font-black text-slate-800">Profile Information</h2>
            <p className="mb-8 text-sm font-medium text-slate-400">
              Manage your account username and email address.
            </p>

            {(profileSuccess || profileError) && (
              <div className={`flex items-center gap-2 p-4 mb-6 rounded-2xl border ${profileSuccess ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                {profileSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-bold">{profileSuccess || profileError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Username</label>
                <input
                  {...registerProfile("username", { required: "Username is required" })}
                  className="w-full px-6 py-4 transition-all bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-bold text-slate-700"
                  disabled={profileLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
                <input
                  type="email"
                  {...registerProfile("email", { required: "Email is required" })}
                  className="w-full px-6 py-4 transition-all bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-bold text-slate-700"
                  disabled={profileLoading}
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading || !isProfileDirty}
                className={`px-10 py-3.5 rounded-full font-black text-sm shadow-xl transition-all ${
                  !isProfileDirty || profileLoading
                    ? "bg-slate-300 text-white cursor-not-allowed shadow-slate-100"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </Card>

          {/* 4. Update Password Card */}
          <Card className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="mb-1 text-2xl font-black text-slate-800">Update Password</h2>
            <p className="mb-8 text-sm font-medium text-slate-400">
              Use a strong password to keep your account secure.
            </p>

            {(passwordSuccess || passwordError) && (
              <div className={`flex items-center gap-2 p-4 mb-6 rounded-2xl border ${passwordSuccess ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                {passwordSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="text-sm font-bold">{passwordSuccess || passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    {...registerPassword("current_password", { required: "Required" })}
                    className="w-full px-6 py-4 transition-all bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-bold text-slate-700"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute text-slate-400 right-5 top-1/2 -translate-y-1/2">
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword("new_password", { required: "Required", minLength: 8 })}
                    className="w-full px-6 py-4 transition-all bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-bold text-slate-700"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute text-slate-400 right-5 top-1/2 -translate-y-1/2">
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-[10px] font-bold text-blue-500 ml-1 italic tracking-tight">
                  ● Use 8 or more characters with a mix of letters, numbers, and symbols.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPassword("new_password_confirmation", { 
                      required: "Required", 
                      validate: v => v === newPassword || "Mismatch" 
                    })}
                    className="w-full px-6 py-4 transition-all bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white font-bold text-slate-700"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute text-slate-400 right-5 top-1/2 -translate-y-1/2">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-[10px] font-bold text-blue-500 ml-1 italic tracking-tight">
                  ● Make sure both passwords match.
                </p>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="bg-slate-300 text-white px-10 py-3.5 rounded-full font-black text-sm shadow-xl shadow-slate-100 hover:bg-blue-600 hover:shadow-blue-200 transition-all"
              >
                {passwordLoading ? "Processing..." : "Update Password"}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
          <Footer2/>
</>
  );
}

export default ProfilePage;