import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reactiveStore } from '../config/firebase';
import { analyzePassWithGemini } from '../config/gemini';
import { DynamicQRCode } from '../components/DynamicQRCode';
import { 
  Send, 
  MapPin, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  User, 
  PhoneCall, 
  Calendar,
  Sparkles,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function StudentDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [passType, setPassType] = useState('Day Outing');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [expectedReturnTime, setExpectedReturnTime] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const unsubscribe = reactiveStore.subscribe(data => {
      const myPasses = data.filter(p => p.studentId === user.id || p.studentName === user.name);
      setPasses(myPasses.length > 0 ? myPasses : data);
    });

    const now = new Date();
    const depStr = new Date(now.getTime() + 15 * 60000).toISOString().slice(0, 16);
    const retStr = new Date(now.getTime() + 3 * 3600000).toISOString().slice(0, 16);
    setDepartureTime(depStr);
    setExpectedReturnTime(retStr);

    return () => unsubscribe();
  }, [user]);

  const handleApplyPass = async (e) => {
    e.preventDefault();
    if (!destination || !reason) {
      alert('Please fill in destination and reason for gate pass.');
      return;
    }

    setIsSubmitting(true);

    try {
      const aiResult = await analyzePassWithGemini({
        studentName: user.name,
        passType,
        destination,
        departureTime,
        expectedReturnTime,
        reason
      });

      const newPassData = {
        studentId: user.id,
        studentName: user.name,
        rollNo: user.rollNo || "22BCS104",
        branch: user.branch || "Computer Science",
        year: user.year || "3rd Year",
        hostelBlock: user.hostelBlock || "Block A - Room 304",
        studentPhoto: user.avatar || "",
        phone: user.phone,
        guardianPhone: user.guardianPhone,
        passType,
        destination,
        departureTime,
        expectedReturnTime,
        reason,
        aiRiskAnalysis: aiResult
      };

      await reactiveStore.createPass(newPassData);
      setIsSubmitting(false);
      setShowApplyModal(false);
      setDestination('');
      setReason('');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Pass creation failed:', err);
      setIsSubmitting(false);
    }
  };

  const activeApprovedPass = passes.find(p => p.status === 'APPROVED' || p.status === 'CHECKED_OUT');
  const pendingPasses = passes.filter(p => p.status === 'PENDING');
  const pastPasses = passes.filter(p => p.status !== 'PENDING' && p.status !== 'APPROVED' && p.status !== 'CHECKED_OUT');

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-8">
      
      {/* Student Profile Banner - Blank Avatar Placeholder */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 z-10">
          
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/50 shadow-lg shadow-blue-500/20"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/40 to-indigo-900/60 border-2 border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-2xl shadow-lg shadow-blue-500/20">
              <User className="w-10 h-10 text-blue-400" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                {user.rollNo}
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">{user.branch} • {user.year}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {user.hostelBlock}
            </p>
          </div>
        </div>

        {/* Location & Apply Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full md:w-auto">
          <div className="bg-gray-900/80 px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-400 font-semibold">Google Maps Geofence:</span>
            <span className="text-gray-300">Hostel Main Gate Active</span>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="w-full sm:w-auto custom-button custom-button-primary shadow-xl shadow-blue-600/30 text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Apply For Gate Pass
          </button>
        </div>

        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* ACTIVE APPROVED PASS DISPLAY */}
      {activeApprovedPass && (
        <div className="glass-panel p-6 lg:p-8 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-gray-900/90 shadow-2xl relative">
          <div className="flex items-center justify-between mb-6 border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Active Approved Gate Pass
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono pulse-green">
                    {activeApprovedPass.status}
                  </span>
                </h3>
                <p className="text-xs text-gray-400">Present live dynamic QR code to guard scanner at main gate</p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs text-gray-400 block">Pass Reference ID</span>
              <span className="font-mono text-sm font-bold text-blue-400">{activeApprovedPass.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Dynamic Anti-Screenshot QR Code */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gray-950/60 p-6 rounded-2xl border border-white/5">
              <DynamicQRCode pass={activeApprovedPass} />
            </div>

            {/* Pass Details */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/60 p-3.5 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Pass Category</span>
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    {activeApprovedPass.passType}
                  </span>
                </div>

                <div className="bg-gray-900/60 p-3.5 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Destination</span>
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-400" />
                    {activeApprovedPass.destination}
                  </span>
                </div>

                <div className="bg-gray-900/60 p-3.5 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Departure Schedule</span>
                  <span className="font-semibold text-gray-200 text-xs">
                    {new Date(activeApprovedPass.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="bg-gray-900/60 p-3.5 rounded-xl border border-white/5">
                  <span className="text-xs text-gray-400 block mb-1">Return Curfew Deadline</span>
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(activeApprovedPass.expectedReturnTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="bg-gray-900/60 p-4 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 block mb-1">Stated Reason</span>
                <p className="text-sm text-gray-200">{activeApprovedPass.reason}</p>
              </div>

              {activeApprovedPass.wardenApproval && (
                <div className="bg-purple-950/30 p-4 rounded-xl border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-purple-300 block">Digitally Signed by Warden</span>
                      <span className="text-sm font-semibold text-white">{activeApprovedPass.wardenApproval.wardenName}</span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">"{activeApprovedPass.wardenApproval.remarks}"</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-purple-400 bg-purple-900/40 px-2.5 py-1 rounded-md border border-purple-500/20">
                    {activeApprovedPass.wardenApproval.digitalSignature}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* PENDING APPROVAL REQUESTS */}
      {pendingPasses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pending Warden Approvals ({pendingPasses.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPasses.map(pass => (
              <div key={pass.id} className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                    ⏳ AWAITING WARDEN SIGNATURE
                  </span>
                  <span className="text-xs font-mono text-gray-400">{pass.id}</span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base">{pass.passType} → {pass.destination}</h4>
                  <p className="text-xs text-gray-300 mt-1">{pass.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 bg-gray-900/60 p-2.5 rounded-xl border border-white/5">
                  <div>Dep: <strong className="text-white">{new Date(pass.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                  <div>Ret: <strong className="text-white">{new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                </div>

                {pass.aiRiskAnalysis && (
                  <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-900/30 p-2 rounded-lg border border-purple-500/20">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Gemini AI Safety Score: <strong className="text-white">{pass.aiRiskAnalysis.score} RISK</strong> ({pass.aiRiskAnalysis.confidence}% confidence)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT PASS HISTORY TABLE */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center justify-between">
          <span>Gate Pass Request History</span>
          <span className="text-xs text-gray-400 font-normal">Showing recent 10 records</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Pass ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Departure / Return</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {passes.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-400">{p.id}</td>
                  <td className="py-3 px-4 font-medium text-white">{p.passType}</td>
                  <td className="py-3 px-4 text-gray-300">{p.destination}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {new Date(p.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(p.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      p.status === 'CHECKED_OUT' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      p.status === 'CHECKED_IN' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                      p.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400 border border-red-500/30 pulse-red' :
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

      {/* APPLY PASS MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 lg:p-8 rounded-3xl border border-white/20 shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                New Gate Pass Application
              </h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyPass} className="space-y-4">
              
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Pass Category</label>
                <select 
                  value={passType} 
                  onChange={e => setPassType(e.target.value)}
                  className="custom-select"
                >
                  <option value="Day Outing">Day Outing (Return same evening)</option>
                  <option value="Night Out">Night Out (Home / Relative stay)</option>
                  <option value="Emergency">Emergency / Medical Pass</option>
                  <option value="Academic">Academic / Internship Duty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Destination Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Phoenix Market City, Vasant Kunj, New Delhi"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="custom-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Departure Time</label>
                  <input 
                    type="datetime-local" 
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className="custom-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Expected Return</label>
                  <input 
                    type="datetime-local" 
                    value={expectedReturnTime}
                    onChange={e => setExpectedReturnTime(e.target.value)}
                    className="custom-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Detailed Purpose / Reason</label>
                <textarea 
                  rows="3"
                  placeholder="Describe your reason clearly. Gemini AI will evaluate safety & risk parameters for warden approval."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="custom-input"
                  required
                ></textarea>
              </div>

              <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 flex items-start gap-2 text-xs text-purple-200">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Google Gemini AI will automatically analyze your reason and assign a risk score to assist the Warden's approval process.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="custom-button custom-button-primary px-6 py-2.5 rounded-xl text-sm"
                >
                  {isSubmitting ? 'Analyzing & Submitting...' : 'Submit Request to Warden'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
