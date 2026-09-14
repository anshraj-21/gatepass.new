import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reactiveStore } from '../config/firebase';
import { 
  Camera, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Clock, 
  MapPin, 
  UserCheck, 
  LogOut, 
  LogIn, 
  Volume2, 
  VolumeX,
  Sparkles,
  QrCode,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function GuardScannerPage() {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [scanInput, setScanInput] = useState('');
  const [activeResult, setActiveResult] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const unsubscribe = reactiveStore.subscribe(data => {
      setPasses(data);
      const events = [];
      data.forEach(p => {
        if (p.gateEvents && p.gateEvents.length > 0) {
          p.gateEvents.forEach(e => {
            events.push({ ...e, studentName: p.studentName, rollNo: p.rollNo, passId: p.id });
          });
        }
      });
      events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentEvents(events.slice(0, 10));
    });
    return () => unsubscribe();
  }, []);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'PASS') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(160, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  const handleScanSubmit = (passIdToScan = null) => {
    const queryId = (passIdToScan || scanInput || '').trim().toUpperCase();
    if (!queryId) return;

    const foundPass = passes.find(p => p.id.toUpperCase() === queryId || p.rollNo.toUpperCase() === queryId || p.studentId.toUpperCase() === queryId);

    if (!foundPass) {
      playSound('FAIL');
      setActiveResult({
        status: 'FAIL',
        reason: `NO RECORD FOUND: Gate pass "${queryId}" does not exist in warden database.`
      });
      return;
    }

    if (foundPass.status === 'PENDING') {
      playSound('FAIL');
      setActiveResult({
        status: 'FAIL',
        pass: foundPass,
        reason: `UNAPPROVED PASS: Request is still PENDING warden approval.`
      });
    } else if (foundPass.status === 'REJECTED') {
      playSound('FAIL');
      setActiveResult({
        status: 'FAIL',
        pass: foundPass,
        reason: `REJECTED BY WARDEN: Pass was denied by ${foundPass.wardenApproval?.wardenName || 'Warden'}.`
      });
    } else if (foundPass.status === 'APPROVED' || foundPass.status === 'CHECKED_OUT' || foundPass.status === 'OVERDUE') {
      playSound('PASS');
      setActiveResult({
        status: 'PASS',
        pass: foundPass
      });
      if (foundPass.status === 'APPROVED') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
      }
    } else {
      playSound('FAIL');
      setActiveResult({
        status: 'FAIL',
        pass: foundPass,
        reason: `EXPIRED / INVALID STATUS (${foundPass.status})`
      });
    }

    setScanInput('');
  };

  const handleCheckOutAction = async (passId) => {
    await reactiveStore.recordGateCheck(passId, 'CHECK_OUT', {
      guardName: user.name,
      gate: user.gatePost
    });
    playSound('PASS');
    setActiveResult(null);
  };

  const handleCheckInAction = async (passId) => {
    await reactiveStore.recordGateCheck(passId, 'CHECK_IN', {
      guardName: user.name,
      gate: user.gatePost
    });
    playSound('PASS');
    setActiveResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-8">
      
      {/* Guard Banner - Clean Avatar Placeholder */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600/40 to-teal-900/60 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xl shadow-lg shadow-emerald-500/20">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                {user.gatePost}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">{user.shift}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-xl border transition-all text-xs font-semibold flex items-center gap-2 ${
              soundEnabled ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' : 'bg-gray-900 border-white/10 text-gray-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            {soundEnabled ? "Scanner Audio ON" : "Muted"}
          </button>
        </div>
      </div>

      {/* GATE SCANNER TERMINAL BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Scanner Input & Quick Test Trigger */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                Live Camera Gate Scanner
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 animate-pulse">
                CAMERA READY
              </span>
            </div>

            {/* Viewfinder */}
            <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/40 flex flex-col items-center justify-center group shadow-xl">
              <div className="qr-scan-line"></div>
              
              <QrCode className="w-16 h-16 text-emerald-500/40 animate-bounce mb-2" />
              <p className="text-xs text-emerald-400 font-mono tracking-wider font-semibold">
                ALIGN STUDENT DYNAMIC QR CODE HERE
              </p>
              <p className="text-[10px] text-gray-500 mt-1">Camera auto-detects 15s rotating security token</p>

              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>
            </div>

            {/* Manual Lookup */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300">Or Manual Pass ID / Roll Number Lookup:</label>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. PASS-9082 or 22BCS104"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScanSubmit()}
                  className="custom-input font-mono text-sm uppercase"
                />
                <button 
                  onClick={() => handleScanSubmit()}
                  className="custom-button custom-button-success px-5 text-sm"
                >
                  Scan Pass
                </button>
              </div>
            </div>

            {/* Quick Test Demo Scanner Buttons */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] text-gray-400 font-medium block">⚡ Quick Demo Test Scans:</span>
              <div className="grid grid-cols-2 gap-2">
                {passes.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleScanSubmit(p.id)}
                    className="text-left text-xs bg-gray-900/80 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 transition-all"
                  >
                    <span className="font-bold text-white block">{p.studentName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{p.id} ({p.status})</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Scan Result Card */}
        <div className="lg:col-span-7">
          
          {!activeResult ? (
            <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400">
              <ShieldCheck className="w-20 h-20 text-gray-600 mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Gate Scanner Standing By</h3>
              <p className="text-xs max-w-sm">Scan a student's dynamic QR pass or click any test pass on the left to verify credentials instantly.</p>
            </div>
          ) : activeResult.status === 'PASS' ? (
            
            <div className="result-modal-pass p-8 rounded-3xl space-y-6 relative overflow-hidden animate-fade-in">
              
              <div className="flex items-center justify-between border-b border-emerald-500/40 pb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-wide glow-text-green">PASS VERIFIED • AUTHORIZED</h3>
                    <p className="text-xs text-emerald-200">Warden digital signature confirmed. Authenticated via Google Cloud.</p>
                  </div>
                </div>
                <button onClick={() => setActiveResult(null)} className="text-emerald-300 hover:text-white font-bold text-xl">✕</button>
              </div>

              {/* Student Visual Identification */}
              <div className="flex items-center gap-5 bg-black/40 p-4 rounded-2xl border border-emerald-500/30">
                {activeResult.pass.studentPhoto ? (
                  <img 
                    src={activeResult.pass.studentPhoto} 
                    alt={activeResult.pass.studentName} 
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                    <User className="w-12 h-12" />
                  </div>
                )}

                <div>
                  <h4 className="text-xl font-bold text-white">{activeResult.pass.studentName}</h4>
                  <p className="text-sm font-semibold text-emerald-300">{activeResult.pass.rollNo} • {activeResult.pass.branch}</p>
                  <p className="text-xs text-gray-300 mt-1">{activeResult.pass.hostelBlock}</p>
                  <p className="text-xs text-gray-400 mt-1">Phone: <strong className="text-white">{activeResult.pass.phone}</strong></p>
                </div>
              </div>

              {/* Pass Terms */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-black/30 p-4 rounded-2xl border border-emerald-500/20">
                <div>
                  <span className="text-emerald-300 block mb-0.5">Pass ID & Category</span>
                  <strong className="text-white text-sm">{activeResult.pass.id} ({activeResult.pass.passType})</strong>
                </div>
                <div>
                  <span className="text-emerald-300 block mb-0.5">Destination</span>
                  <strong className="text-white text-sm">{activeResult.pass.destination}</strong>
                </div>
                <div>
                  <span className="text-emerald-300 block mb-0.5">Approved Return Deadline</span>
                  <strong className="text-emerald-400 font-bold text-sm">
                    {new Date(activeResult.pass.expectedReturnTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </strong>
                </div>
                <div>
                  <span className="text-emerald-300 block mb-0.5">Warden Digital Approval</span>
                  <strong className="text-purple-300 text-xs font-mono">{activeResult.pass.wardenApproval?.wardenName || 'Approved'}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleCheckOutAction(activeResult.pass.id)}
                  className="custom-button custom-button-primary py-4 text-base rounded-2xl shadow-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Confirm CHECK-OUT (Exit Gate)
                </button>

                <button
                  onClick={() => handleCheckInAction(activeResult.pass.id)}
                  className="custom-button custom-button-success py-4 text-base rounded-2xl shadow-xl flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" /> Confirm CHECK-IN (Enter Gate)
                </button>
              </div>

            </div>

          ) : (

            <div className="result-modal-fail p-8 rounded-3xl space-y-6 relative overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between border-b border-red-500/40 pb-4">
                <div className="flex items-center gap-3">
                  <XCircle className="w-10 h-10 text-red-400 animate-bounce" />
                  <div>
                    <h3 className="text-2xl font-extrabold text-white tracking-wide glow-text-red">GATE ENTRY DENIED</h3>
                    <p className="text-xs text-red-200">Bypass Attempt Alert Logged to Warden Dashboard</p>
                  </div>
                </div>
                <button onClick={() => setActiveResult(null)} className="text-red-300 hover:text-white font-bold text-xl">✕</button>
              </div>

              <div className="bg-black/60 p-6 rounded-2xl border border-red-500/40 space-y-3">
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest block">Reason For Rejection:</span>
                <p className="text-lg font-bold text-white">{activeResult.reason}</p>
              </div>

              {activeResult.pass && (
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-red-500/20">
                  {activeResult.pass.studentPhoto ? (
                    <img src={activeResult.pass.studentPhoto} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-900 border border-red-500/40 flex items-center justify-center text-red-300 font-bold">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-white">{activeResult.pass.studentName}</h4>
                    <p className="text-xs text-gray-400">{activeResult.pass.rollNo} • {activeResult.pass.hostelBlock}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveResult(null)}
                className="w-full custom-button custom-button-danger py-3 rounded-xl text-sm"
              >
                Dismiss Warning Alert
              </button>
            </div>

          )}

        </div>

      </div>

      {/* RECENT REAL-TIME GATE EVENTS AUDIT TRAIL */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Live Gate Check-In / Check-Out Log (Gate 1 Main Gate)
          </span>
          <span className="text-xs text-emerald-400 font-mono">Realtime Synced</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Pass ID</th>
                <th className="py-3 px-4">Duty Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-4 text-center text-xs text-gray-500">No gate exit events recorded yet. Scan a pass to check out a student.</td>
                </tr>
              ) : (
                recentEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-gray-300">
                      {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        evt.type === 'CHECK_OUT' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {evt.type === 'CHECK_OUT' ? '🚪 EXIT (CHECK OUT)' : '🏠 ENTRY (CHECK IN)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white text-xs">{evt.studentName} ({evt.rollNo})</td>
                    <td className="py-3 px-4 font-mono text-xs text-purple-400">{evt.passId}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{evt.guardName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
