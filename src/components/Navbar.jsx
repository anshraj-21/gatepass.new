import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleLoginModal } from './RoleLoginModal';
import { ShieldCheck, User, Cpu, Sparkles, Clock, Lock, LogOut } from 'lucide-react';
import { isLiveFirebase } from '../config/firebase';

export function Navbar() {
  const { currentRole, authenticatedRole, logout, user, ROLES } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [loginModalRole, setLoginModalRole] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleClick = (targetRole) => {
    if (currentRole === targetRole) return;
    setLoginModalRole(targetRole);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-zinc-950/90 border-b border-zinc-800 px-4 lg:px-8 py-3 backdrop-blur-md mb-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Logo - Clean Black & White */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-white tracking-tight">HostelGate<span className="text-zinc-400">Pass</span></h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-zinc-300" /> Google Cloud AI
                </span>
              </div>
              <p className="text-xs text-zinc-400">Tamper-Proof Digital Hostel Out-Pass System</p>
            </div>
          </div>

          {/* Live Clock & GCP Status */}
          <div className="hidden lg:flex items-center gap-4 bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5 text-zinc-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{timeStr}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isLiveFirebase ? "GCP Live Firestore" : "GCP Cloud Emulated"}</span>
            </div>
          </div>

          {/* Role Switcher Bar - Black & White High Contrast */}
          <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto max-w-full">
            <span className="text-[11px] font-medium text-zinc-400 px-2 flex items-center gap-1 hidden sm:flex">
              <Lock className="w-3 h-3 text-zinc-300" /> Role Login:
            </span>
            
            <button
              onClick={() => handleRoleClick(ROLES.STUDENT)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === ROLES.STUDENT 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              🎓 Student
            </button>

            <button
              onClick={() => handleRoleClick(ROLES.WARDEN)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === ROLES.WARDEN 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              👨‍⚖️ Warden {currentRole !== ROLES.WARDEN && <Lock className="w-3 h-3 text-zinc-500 inline" />}
            </button>

            <button
              onClick={() => handleRoleClick(ROLES.GUARD)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === ROLES.GUARD 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              👮 Guard Scanner {currentRole !== ROLES.GUARD && <Lock className="w-3 h-3 text-zinc-500 inline" />}
            </button>

            <button
              onClick={() => handleRoleClick(ROLES.ADMIN)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === ROLES.ADMIN 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              📊 Analytics {currentRole !== ROLES.ADMIN && <Lock className="w-3 h-3 text-zinc-500 inline" />}
            </button>

            <button
              onClick={logout}
              title="Logout from active session"
              className="px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1 ml-1 border border-zinc-800"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {loginModalRole && (
        <RoleLoginModal 
          targetRole={loginModalRole} 
          onClose={() => setLoginModalRole(null)} 
        />
      )}
    </>
  );
}
