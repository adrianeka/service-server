import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white text-gray-500 py-12 px-6 md:px-20 font-sans border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Kontainer Utama dengan Flex justify-between */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          
          {/* Bagian Kiri: Logo & Deskripsi */}
          <div className="flex flex-col space-y-3 max-w-xs">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-md">
                <img src='https://seeklogo.com/images/P/padepokan-79-logo-5794F3FD14-seeklogo.com.png'/>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-800 leading-none">KeepUply</span>
                <span className="text-[10px] text-gray-400">Monitor your services in real-time</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              A website and server monitoring service that automatically tracks
              service availability (uptime).
            </p>
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