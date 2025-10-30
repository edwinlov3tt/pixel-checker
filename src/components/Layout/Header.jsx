import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-50 glassmorphism flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-red-500 rounded-lg flex items-center justify-center text-white font-bold">
          P
        </div>
        <div className="text-xl font-bold text-white">Pixel Monitor</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-brand-red rounded-full flex items-center justify-center text-[8px] text-white font-bold">
            3
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 cursor-pointer flex items-center justify-center text-white font-semibold hover:from-gray-500 hover:to-gray-600 transition-all">
          EL
        </div>
      </div>
    </header>
  );
};

export default Header;