import React from "react";
import { Link } from "react-router-dom"; // Gunakan react-router-dom, bukan next/link

const Footer2 = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      
        {/* Bagian Kiri: Logo & Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-5 group">
  {/* Logo Icon - Dibuat lebih besar dan lebih stand out */}
  <div className="relative w-24 h-14 flex items-center justify-center bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 transition-all duration-300 group-hover:shadow-indigo-100 group-hover:scale-105 flex-shrink-0 p-2">
    <img 
      src="/Logo.jpg" 
      alt="KeepUply"
      className="max-w-full max-h-full object-contain"
    />
    {/* Aksen Status Online */}
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
    </span>
  </div>
  
  <div className="flex flex-col">
    {/* Penyesuaian Warna Brand */}
    <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 leading-none">
      KeepUp<span className="text-indigo-600">ly</span>
    </h2>
    <p className="text-[11px] mt-1.5 text-indigo-500/70 uppercase tracking-widest font-bold">
      Real-Time Monitoring
    </p>
    <div className="h-0.5 w-6 bg-emerald-400 mt-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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