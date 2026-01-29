
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, MessageSquare, BarChart2, User, Sparkles } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <MessageSquare size={20} />, label: 'Classroom' },
    { path: '/stats', icon: <BarChart2 size={20} />, label: 'Progress' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Sparkles size={24} />
          </div>
          <span className="font-bold text-xl text-slate-800">SpeakFlow</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <h4 className="font-medium text-sm mb-1">Upgrade to Pro</h4>
            <p className="text-xs text-indigo-100 mb-3">Get unlimited voice conversations and advanced analytics.</p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Mobile & Desktop */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="font-bold text-lg text-slate-800">SpeakFlow</span>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-slate-800 font-semibold">
              {navItems.find(item => item.path === location.pathname)?.label || 'SpeakFlow'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-slate-600">Teacher Online</span>
            </div>
            <img 
              src="https://picsum.photos/seed/user123/100/100" 
              className="w-8 h-8 rounded-full border border-slate-200" 
              alt="Profile"
            />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {children}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around px-6 shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 ${
                location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
