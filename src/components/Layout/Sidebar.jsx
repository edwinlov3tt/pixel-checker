import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Globe, AlertTriangle, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, path: '/', tooltip: 'Dashboard' },
    { icon: Globe, path: '/sites', tooltip: 'Sites' },
    { icon: AlertTriangle, path: '/alerts', tooltip: 'Alerts' },
    { icon: Settings, path: '/settings', tooltip: 'Settings' },
  ];

  return (
    <nav className="fixed left-0 top-20 bottom-0 w-20 z-40 glassmorphism py-6 flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`relative w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all group
              ${isActive
                ? 'text-brand-red bg-brand-red/10 shadow-lg shadow-brand-red/20'
                : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'}`}
          >
            <Icon className="w-5 h-5" />
            {isActive && (
              <div className="absolute right-[-12px] top-1/2 transform -translate-y-1/2 w-[3px] h-6 bg-brand-red rounded-full" />
            )}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
              {item.tooltip}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default Sidebar;