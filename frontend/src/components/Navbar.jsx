import { ChevronDown, User, Bell, LogOut } from "lucide-react"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import AddMonitorDialog from "./AddMonitorDialog"
import { ArrowRightCircle } from "lucide-react"

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState("English")
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthPage = location.pathname === '/Login' || location.pathname === '/Register'
  
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
  return (
    <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img
              src="/logouptime.png"
              alt="UptimeKit Logo"
              className="h-10 w-10"
            />

            <div className="flex flex-col gap-2">
              <h1 className="font-inter text-[28px] font-semibold leading-[73%] text-black">
                UptimeKit
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
                {/* Language Dropdown */}
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
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsLangDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-md z-20">
                        <button
                          onClick={() => {
                            setCurrentLanguage("English")
                            setIsLangDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            currentLanguage === "English"
                              ? "bg-gray-100 text-gray-900 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => {
                            setCurrentLanguage("Indonesia")
                            setIsLangDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            currentLanguage === "Indonesia"
                              ? "bg-gray-100 text-gray-900 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Indonesia
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Sign Up Button */}
                <button
                  onClick={() => navigate('/Register')}
                  className="h-10 px-4 rounded-full bg-[#E6F6F8] text-[#1A73E8] text-sm font-medium hover:bg-[#D9F1F4] transition-colors flex items-center justify-center w-[116px]"
                >
                  {t.signUp}
                </button>

                {/* Login Button */}
                <button
                  onClick={() => navigate('/Login')}
                  className="h-10 px-4 rounded-full bg-[#0B78D1] text-white text-sm font-medium hover:bg-[#0969B5] transition-colors flex items-center justify-center gap-2 w-[129px]"
                >
                  {t.login}
                  <ArrowRightCircle className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <AddMonitorDialog />

                {/* User Dropdown */}
                <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 h-10 px-3 rounded-full hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>

                {/* User Info */}
                <div className="text-left leading-tight">
                  <div className="text-sm font-medium text-gray-900">
                    User Name
                  </div>
                  <div className="text-[11px] text-green-600">
                    Online
                  </div>
                </div>

                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white py-1 shadow-lg z-20">
                    <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4" />
                      {t.profile}
                    </button>

                    <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                      <Bell className="h-4 w-4" />
                      {t.notification}
                    </button>

                    <div className="my-1 border-t" />

                    <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut className="h-4 w-4" />
                      {t.logout}
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
