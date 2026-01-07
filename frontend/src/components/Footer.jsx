import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white text-gray-500 py-12 px-6 md:px-20 font-sans border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Kontainer Utama dengan Flex justify-between */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          
          {/* Bagian Kiri: Logo & Deskripsi */}
          <div className="flex flex-col space-y-4 max-w-xs group">
  {/* Logo & Brand Section */}
  <div className="flex items-center space-x-3">
    {/* Container Logo dengan Background Halus */}
    <div className="relative p-2 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
      <img 
        src='/Logo.jpg' 
        alt="KeepUply Logo" 
        className="w-10 h-10 object-contain rounded"
      />
      {/* Indikator "Up" Dot */}
      <span className="absolute top-1 right-1 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
    </div>

    <div className="flex flex-col">
      <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
        KeepUp<span className="text-indigo-600">ly</span>
      </h1>
      <span className="text-[11px] font-medium text-indigo-500/80 uppercase tracking-wider mt-1">
        Real-Time Monitoring
      </span>
    </div>
  </div>

  {/* Description Section */}
  <div className="relative pl-4 border-l-2 border-slate-100 transition-colors duration-300 group-hover:border-indigo-200">
    <p className="text-sm leading-relaxed text-slate-600 font-medium">
      A powerful <span className="text-slate-900">website and server monitoring</span> service that automatically tracks availability with precision.
    </p>
  </div>
</div>

          {/* Bagian Kanan: Menu Links (Dikelompokkan dalam satu flex container) */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            {/* Kolom Features */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-sm">Features</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-600">Website & Server Monitoring</a></li>
                <li><a href="#" className="hover:text-blue-600">Real-Time Status Dashboard</a></li>
                <li><a href="#" className="hover:text-blue-600">Downtime Detection</a></li>
                <li><a href="#" className="hover:text-blue-600">Email Notification</a></li>
              </ul>
            </div>

            {/* Kolom Support & Resources */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-sm">Support & Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-600">How It works</a></li>
                <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600">API Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact Us</a></li>
              </ul>
            </div>

            {/* Kolom Company & Legal */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-sm">Company & Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Garis Pemisah dan Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>© 2025 PT. Padepokan Tujuh Sembilan | All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;