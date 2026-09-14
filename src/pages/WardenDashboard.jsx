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
      
      {/* Warden Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold">
                {user.designation}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">{user.assignedHostel}</p>
          </div>
        </div>

        {/* Quick Statistics Counters */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-gray-900/80 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-2xl font-extrabold text-amber-400">{pendingPasses.length}</span>
            <span className="text-[11px] text-gray-400 block uppercase font-medium">Pending</span>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-2xl font-extrabold text-blue-400">{activeOutsideStudents.length}</span>
            <span className="text-[11px] text-gray-400 block uppercase font-medium">Outside</span>
          </div>

          <div className="bg-gray-900/80 p-3 rounded-xl border border-red-500/30 text-center bg-red-950/20">
            <span className="text-2xl font-extrabold text-red-400 pulse-red rounded-full">{overduePasses.length}</span>
            <span className="text-[11px] text-red-300 block uppercase font-medium">Overdue</span>
          </div>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE WITH GEMINI AI RISK HIGHLIGHTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" />
            Pending Approval Requests ({pendingPasses.length})
          </h3>
          <span className="text-xs text-purple-300 bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Gemini AI Risk Filter Active
          </span>
        </div>

        {pendingPasses.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-white/10 text-gray-400">
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
                      ? 'border-red-500/60 bg-gradient-to-b from-red-950/20 to-gray-900/90 shadow-xl shadow-red-900/20' 
                      : 'border-white/10 hover:border-purple-500/40'
                  }`}
                >
                  {/* Header Student Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={pass.studentPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                        alt={pass.studentName} 
                        className="w-12 h-12 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="font-bold text-white text-base">{pass.studentName}</h4>
                        <p className="text-xs text-gray-400">{pass.rollNo} • {pass.hostelBlock}</p>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-500/30">
                      {pass.id}
                    </span>
                  </div>

                  {/* Gemini AI Risk Assessment Box */}
                  {pass.aiRiskAnalysis && (
                    <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      isHighRisk 
                        ? 'bg-red-950/50 border-red-500/40 text-red-200' 
                        : 'bg-purple-950/40 border-purple-500/30 text-purple-200'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          Gemini AI Risk Assessment:
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          isHighRisk ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {pass.aiRiskAnalysis.score} RISK ({pass.aiRiskAnalysis.confidence}%)
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">{pass.aiRiskAnalysis.riskReason}</p>
                    </div>
                  )}

                  {/* Request Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-950/50 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-gray-400 block">Category</span>
                      <strong className="text-white">{pass.passType}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Destination</span>
                      <strong className="text-white">{pass.destination}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Departure</span>
                      <span className="text-gray-200">{new Date(pass.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Expected Return</span>
                      <span className="text-emerald-400 font-semibold">{new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Stated Reason */}
                  <div className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-white/5">
                    <span className="text-gray-400 font-semibold block mb-0.5">Stated Purpose:</span>
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
                        className="custom-button custom-button-success text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/30"
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
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Hostel Live Roster & Exit Monitor
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search name, roll no, pass ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="custom-input pl-9 text-xs py-2"
              />
            </div>

            {/* Filter Dropdown */}
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
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Pass ID</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Expected Return</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPasses.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.studentPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="font-semibold text-white block text-xs">{p.studentName}</span>
                        <span className="text-[10px] text-gray-400">{p.rollNo} • {p.hostelBlock}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-xs text-purple-400">{p.id}</td>
                  <td className="py-3 px-4 text-xs text-gray-300">{p.destination}</td>
                  <td className="py-3 px-4 text-xs font-medium text-emerald-400">
                    {new Date(p.expectedReturnTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 flex items-center gap-1 mt-2">
                    <PhoneCall className="w-3 h-3 text-blue-400" />
                    {p.guardianPhone}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      p.status === 'CHECKED_OUT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      p.status === 'CHECKED_IN' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                      p.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400 border border-red-500/30 pulse-red font-extrabold' :
                      p.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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
