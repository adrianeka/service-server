import { ChevronDown, User, Bell, LogOut, RefreshCw, ArrowRightCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import AddMonitorDialog from "./AddMonitorDialog"
import { getUserProfile } from "@/service/AuthService" // Import fungsi profil

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("English")
  
  // State untuk menyimpan nama pengguna hasil integrasi
  const [userName, setUserName] = useState("User Name")
  
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthPage = location.pathname === '/Login' || location.pathname === '/Register'
  
  // Efek untuk mengambil data profil
  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.id) {
          const response = await getUserProfile(storedUser.id);
          if (response.status && response.data) {
            setUserName(response.data.username); // Set username dari API
          }
        }
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
        // Fallback: Gunakan data yang ada di localStorage jika API error
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) setUserName(storedUser.username);
      }
    };

    if (!isAuthPage) {
      fetchUserProfileData();
    }
  }, [isAuthPage]);

  const translations = {
    English: {
      addMonitor: "Add Monitor",
      signUp: "Sign Up",
      login: "Login",
      profile: "Profile",
      notification: "Setting Notification",
      logout: "Logout"
    },
    Indonesia: {
      addMonitor: "Tambah Monitor",
      signUp: "Daftar",
      login: "Masuk",
      profile: "Profil",
      notification: "Pengaturan Notifikasi",
      logout: "Keluar"
    }
  }
  
  const t = translations[currentLanguage]

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Logika refresh manual jika diperlukan
    window.location.reload(); 
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/Login");
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/Logo.jpg"
              alt="UptimeKit Logo"
              className="h-10 w-40"
            />
            <div className="flex flex-col gap-2">
              <h1 className="font-inter text-[28px] font-semibold leading-[73%] text-black">
                KeepUply
              </h1>
              <p className="font-inter text-[11px] font-normal leading-[8px] text-black hidden sm:block">
                Real-Time Monitoring You Can Trust.
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthPage ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-700">{currentLanguage}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {isLangDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsLangDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-36 rounded-md bg-white py-1 shadow-md z-20">
                        <button onClick={() => { setCurrentLanguage("English"); setIsLangDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${currentLanguage === "English" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>English</button>
                        <button onClick={() => { setCurrentLanguage("Indonesia"); setIsLangDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${currentLanguage === "Indonesia" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>Indonesia</button>
                      </div>
                    </>
                  )}
                </div>

                <button onClick={() => navigate('/Register')} className="h-10 px-4 rounded-full bg-[#E6F6F8] text-[#1A73E8] text-sm font-medium hover:bg-[#D9F1F4] transition-colors flex items-center justify-center w-[116px]">
                  {t.signUp}
                </button>

                <button onClick={() => navigate('/Login')} className="h-10 px-4 rounded-full bg-[#0B78D1] text-white text-sm font-medium hover:bg-[#0969B5] transition-colors flex items-center justify-center gap-2 w-[129px]">
                  {t.login}
                  <ArrowRightCircle className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleRefresh} className="p-2.5 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-all">
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
                <AddMonitorDialog />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 h-10 px-3 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>

                    <div className="text-left leading-tight">
                      <div className="text-sm font-medium text-gray-900">
                        {userName} {/* INTEGRASI USERNAME DISINI */}
                      </div>
                      <div className="text-[11px] text-green-600">
                        Online
                      </div>
                    </div>

                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white py-1 shadow-lg z-20">
                        <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                          <User className="h-4 w-4" /> {t.profile}
                        </button>
                        <button onClick={() => { navigate('/notification'); setIsDropdownOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                          <Bell className="h-4 w-4" /> {t.notification}
                        </button>
                        <div className="my-1 border-t" />
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium">
                          <LogOut className="h-4 w-4" /> {t.logout}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}