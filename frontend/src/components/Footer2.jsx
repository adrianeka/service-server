import React from "react";
import { Link } from "react-router-dom"; // Gunakan react-router-dom, bukan next/link

const Footer2 = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Bagian Kiri: Logo & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 leading-tight">UptimeKit</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-tight font-semibold">
                Monitor your services in real-time
              </p>
            </div>
          </div>

          <span className="hidden md:block h-6 w-[1px] bg-slate-200 mx-2"></span>

          <p className="text-sm text-slate-400 font-medium whitespace-nowrap">
            © 2025 PT. Padepokan Tujuh Sembilan <span className="mx-1">|</span> All rights reserved.
          </p>
        </div>

        {/* Bagian Kanan: Navigasi Links */}
        <nav className="flex items-center gap-6">
          <Link 
            to="/how-it-works" 
            className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
          >
            How it works
          </Link>
          <Link 
            to="/help-center" 
            className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
          >
            Help Center
          </Link>
          <Link 
            to="/contact" 
            className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
          >
            Contact Us
          </Link>
        </nav>

      </div>
    </footer>
  );
};

export default Footer2;