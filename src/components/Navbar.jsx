import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, ShieldAlert, Cpu, Sparkles, Clock, Lock } from 'lucide-react';
import { isLiveFirebase } from '../config/firebase';

export function Navbar() {
  const { currentRole, switchRole, user, ROLES } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-4 lg:px-8 py-3 backdrop-blur-xl mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">HostelGate<span className="text-blue-400">Pass</span></h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> Google Cloud AI
              </span>
            </div>
            <p className="text-xs text-gray-400">Tamper-Proof Digital Hostel Out-Pass System</p>
          </div>
        </div>

        {/* Live Clock & GCP Status */}
        <div className="hidden lg:flex items-center gap-4 bg-gray-900/60 px-4 py-1.5 rounded-full border border-white/5 text-xs text-gray-300">
          <div className="flex items-center gap-1.5 text-blue-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeStr}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>{isLiveFirebase ? "GCP Live Firestore" : "GCP Cloud Emulated"}</span>
          </div>
        </div>

        {/* Interactive Role Switcher Bar */}
        <div className="flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
          <span className="text-[11px] font-medium text-gray-400 px-2 flex items-center gap-1 hidden sm:flex">
            <User className="w-3 h-3 text-blue-400" /> Switch Role:
          </span>
          
          <button
            onClick={() => switchRole(ROLES.STUDENT)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentRole === ROLES.STUDENT 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🎓 Student
          </button>

          <button
            onClick={() => switchRole(ROLES.WARDEN)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentRole === ROLES.WARDEN 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            👨‍⚖️ Warden
          </button>

          <button
            onClick={() => switchRole(ROLES.GUARD)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentRole === ROLES.GUARD 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            👮 Guard Scanner
          </button>

          <button
            onClick={() => switchRole(ROLES.ADMIN)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentRole === ROLES.ADMIN 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Analytics
          </button>
        </div>

      </div>
    </header>
  );
}
