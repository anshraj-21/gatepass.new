import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reactiveStore } from '../config/firebase';
import { 
  Check, 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  User, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  BellRing,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function WardenDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [wardenRemarks, setWardenRemarks] = useState({});

  useEffect(() => {
    const unsubscribe = reactiveStore.subscribe(data => {
      setPasses(data);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (passId) => {
    const remarks = wardenRemarks[passId] || "Approved. Follow hostel curfew rules strictly.";
    const wardenDetails = {
      wardenName: user.name,
      approvedAt: new Date().toISOString(),
      remarks,
      digitalSignature: `${user.digitalSignature || 'SIG-WARDEN'}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    await reactiveStore.updatePassStatus(passId, 'APPROVED', wardenDetails);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
  };

  const handleReject = async (passId) => {
    const remarks = wardenRemarks[passId] || "Pass rejected by warden due to timing / safety rules.";
    const wardenDetails = {
      wardenName: user.name,
      approvedAt: new Date().toISOString(),
      remarks,
      digitalSignature: `REJ-${user.digitalSignature || 'SIG'}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    await reactiveStore.updatePassStatus(passId, 'REJECTED', wardenDetails);
  };

  const pendingPasses = passes.filter(p => p.status === 'PENDING');
  const activeOutsideStudents = passes.filter(p => p.status === 'CHECKED_OUT' || p.status === 'OVERDUE');
  const overduePasses = passes.filter(p => p.status === 'OVERDUE');

  const filteredPasses = passes.filter(p => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.studentName.toLowerCase().includes(q) || p.rollNo.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-8">
      
      {/* Warden Header Banner - Minimalist Black & White */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-700 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xl shadow-md">
              <User className="w-8 h-8 text-zinc-300" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
                {user.designation}
              </span>
            </div>
            <p className="text-sm text-zinc-300 mt-1">{user.assignedHostel}</p>
          </div>
        </div>

        {/* Quick Statistics Counters */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-2xl font-extrabold text-amber-400">{pendingPasses.length}</span>
            <span className="text-[11px] text-zinc-400 block uppercase font-medium">Pending</span>
          </div>

          <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-center">
            <span className="text-2xl font-extrabold text-white">{activeOutsideStudents.length}</span>
            <span className="text-[11px] text-zinc-400 block uppercase font-medium">Outside</span>
          </div>

          <div className="bg-zinc-900 p-3 rounded-xl border border-red-500/30 text-center bg-red-950/20">
            <span className="text-2xl font-extrabold text-red-400 pulse-red rounded-full">{overduePasses.length}</span>
            <span className="text-[11px] text-red-300 block uppercase font-medium">Overdue</span>
          </div>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE WITH GEMINI AI RISK HIGHLIGHTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-zinc-300" />
            Pending Approval Requests ({pendingPasses.length})
          </h3>
          <span className="text-xs text-zinc-300 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" /> Gemini AI Risk Filter Active
          </span>
        </div>

        {pendingPasses.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-zinc-800 text-zinc-400">
            <Check className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-white">All pending pass applications reviewed!</p>
            <p className="text-xs mt-1">No new requests in warden queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingPasses.map(pass => {
              const aiScore = pass.aiRiskAnalysis?.score || 'LOW';
              const isHighRisk = aiScore === 'HIGH';

              return (
                <div 
                  key={pass.id} 
                  className={`glass-panel p-6 rounded-2xl border transition-all space-y-4 ${
                    isHighRisk 
                      ? 'border-red-500/60 bg-red-950/20 shadow-xl shadow-red-950/40' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Header Student Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {pass.studentPhoto ? (
                        <img 
                          src={pass.studentPhoto} 
                          alt={pass.studentName} 
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300">
                          <User className="w-6 h-6 text-zinc-400" />
                        </div>
                      )}

                      <div>
                        <h4 className="font-bold text-white text-base">{pass.studentName}</h4>
                        <p className="text-xs text-zinc-400">{pass.rollNo} • {pass.hostelBlock}</p>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                      {pass.id}
                    </span>
                  </div>

                  {/* Gemini AI Risk Assessment Box */}
                  {pass.aiRiskAnalysis && (
                    <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      isHighRisk 
                        ? 'bg-red-950/50 border-red-500/40 text-red-200' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-zinc-300" />
                          Gemini AI Risk Assessment:
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          isHighRisk ? 'bg-red-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        }`}>
                          {pass.aiRiskAnalysis.score} RISK ({pass.aiRiskAnalysis.confidence}%)
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">{pass.aiRiskAnalysis.riskReason}</p>
                    </div>
                  )}

                  {/* Request Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-black p-3 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-zinc-400 block">Category</span>
                      <strong className="text-white">{pass.passType}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Destination</span>
                      <strong className="text-white">{pass.destination}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Departure</span>
                      <span className="text-zinc-200">{new Date(pass.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Expected Return</span>
                      <span className="text-emerald-400 font-semibold">{new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Stated Reason */}
                  <div className="text-xs text-zinc-300 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                    <span className="text-zinc-400 font-semibold block mb-0.5">Stated Purpose:</span>
                    "{pass.reason}"
                  </div>

                  {/* Warden Remarks & Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <input 
                      type="text" 
                      placeholder="Add warden remarks or curfew notes..." 
                      value={wardenRemarks[pass.id] || ''}
                      onChange={e => setWardenRemarks({ ...wardenRemarks, [pass.id]: e.target.value })}
                      className="custom-input text-xs"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleReject(pass.id)}
                        className="custom-button custom-button-danger text-xs py-2.5 rounded-xl"
                      >
                        <X className="w-4 h-4" /> Reject Pass
                      </button>

                      <button
                        onClick={() => handleApprove(pass.id)}
                        className="custom-button custom-button-success text-xs py-2.5 rounded-xl shadow-lg"
                      >
                        <Check className="w-4 h-4" /> Approve & Sign Stamp
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* HOSTEL STUDENT ROSTER & OUTSIDE MONITOR */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-300" />
            Hostel Live Roster & Exit Monitor
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search name, roll no, pass ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="custom-input pl-9 text-xs py-2"
              />
            </div>

            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="custom-select text-xs py-2 px-3 w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="CHECKED_OUT">Currently Outside</option>
              <option value="OVERDUE">Overdue Only</option>
              <option value="APPROVED">Approved (Inside)</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Pass ID</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Expected Return</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPasses.map(p => (
                <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {p.studentPhoto ? (
                        <img src={p.studentPhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-bold">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-white block text-xs">{p.studentName}</span>
                        <span className="text-[10px] text-zinc-400">{p.rollNo} • {p.hostelBlock}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-xs text-zinc-300">{p.id}</td>
                  <td className="py-3 px-4 text-xs text-zinc-300">{p.destination}</td>
                  <td className="py-3 px-4 text-xs font-medium text-emerald-400">
                    {new Date(p.expectedReturnTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-xs text-zinc-400 flex items-center gap-1 mt-2">
                    <PhoneCall className="w-3 h-3 text-zinc-400" />
                    {p.guardianPhone}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      p.status === 'CHECKED_OUT' ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' :
                      p.status === 'CHECKED_IN' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
                      p.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400 border border-red-500/30 pulse-red font-extrabold' :
                      p.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
