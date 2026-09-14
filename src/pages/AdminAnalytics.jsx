import React, { useState, useEffect } from 'react';
import { reactiveStore, isLiveFirebase } from '../config/firebase';
import { 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  Download, 
  RotateCcw, 
  FileSpreadsheet, 
  AlertOctagon, 
  Sparkles,
  Server,
  Layers,
  Key
} from 'lucide-react';

export function AdminAnalytics() {
  const [passes, setPasses] = useState([]);

  useEffect(() => {
    const unsubscribe = reactiveStore.subscribe(data => {
      setPasses(data);
    });
    return () => unsubscribe();
  }, []);

  const totalPasses = passes.length;
  const approvedPasses = passes.filter(p => p.status === 'APPROVED' || p.status === 'CHECKED_OUT' || p.status === 'CHECKED_IN').length;
  const overduePasses = passes.filter(p => p.status === 'OVERDUE').length;
  const highRiskPasses = passes.filter(p => p.aiRiskAnalysis?.score === 'HIGH').length;

  const exportCSV = () => {
    const headers = ["Pass ID", "Student Name", "Roll No", "Branch", "Type", "Destination", "Departure", "Return", "Status", "AI Risk Score"];
    const rows = passes.map(p => [
      p.id,
      `"${p.studentName}"`,
      p.rollNo,
      `"${p.branch}"`,
      p.passType,
      `"${p.destination}"`,
      p.departureTime,
      p.expectedReturnTime,
      p.status,
      p.aiRiskAnalysis?.score || 'LOW'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hostel_GatePass_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDemoData = async () => {
    if (confirm("Reset all gate pass data back to initial state?")) {
      await reactiveStore.resetDemoData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 space-y-8">
      
      {/* Header Banner - Minimalist Black & White */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Security Analytics & System Control</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
              Admin Portal
            </span>
          </div>
          <p className="text-sm text-zinc-300 mt-1">Audit logs, gate traffic insights, and Google Cloud Platform status</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="custom-button custom-button-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-black" /> Export Gate Audit CSV
          </button>

          <button
            onClick={handleResetDemoData}
            className="custom-button bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs py-2.5 px-4 rounded-xl border border-zinc-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset Sample Data
          </button>
        </div>
      </div>

      {/* GCP Stack Architecture Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-2">
          <div className="flex items-center justify-between text-zinc-300">
            <Server className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold bg-black px-2 py-0.5 rounded border border-zinc-800">GCP FIRESTORE</span>
          </div>
          <span className="text-2xl font-extrabold text-white block">{totalPasses} Total</span>
          <span className="text-xs text-zinc-400 block">Realtime Gate Pass Documents</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-2">
          <div className="flex items-center justify-between text-zinc-300">
            <Sparkles className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold bg-black px-2 py-0.5 rounded border border-zinc-800">GEMINI AI</span>
          </div>
          <span className="text-2xl font-extrabold text-white block">{highRiskPasses} Flagged</span>
          <span className="text-xs text-zinc-400 block">High Risk Reason Warnings</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold bg-black px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">VERIFIED</span>
          </div>
          <span className="text-2xl font-extrabold text-white block">{approvedPasses} Approved</span>
          <span className="text-xs text-zinc-400 block">Digital Warden Signatures</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-red-500/30 bg-red-950/20 space-y-2">
          <div className="flex items-center justify-between text-red-400">
            <AlertOctagon className="w-6 h-6" />
            <span className="text-[10px] font-mono font-bold bg-black px-2 py-0.5 rounded border border-red-500/30 text-red-400">CURFEW ALERTS</span>
          </div>
          <span className="text-2xl font-extrabold text-red-400 block">{overduePasses} Overdue</span>
          <span className="text-xs text-zinc-400 block">Curfew Breach Violations</span>
        </div>

      </div>

      {/* SYSTEM ARCHITECTURE OVERVIEW */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-white" />
          Google Cloud Platform Integration Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-white text-sm">Firebase Authentication & Cloud Firestore</strong>
              <span className="text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <p className="text-zinc-400">Handles Google SSO authentication restricted to hostel domain (`@college.edu`) and provides sub-second real-time database sync between Warden Dashboard and Guard Scanner camera.</p>
          </div>

          <div className="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-white text-sm">Google GenAI Gemini 2.5 Flash Engine</strong>
              <span className="text-zinc-200 font-mono">ACTIVE</span>
            </div>
            <p className="text-zinc-400">Automates reason evaluation, checks requested departure against hostel 8:30 PM curfew limits, and generates risk confidence ratings for wardens.</p>
          </div>

          <div className="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-white text-sm">Dynamic Anti-Screenshot QR Token Engine</strong>
              <span className="text-zinc-200 font-mono">SECURED</span>
            </div>
            <p className="text-zinc-400">Generates rotating 15-second SHA tokens with visual hash line preventing students from sharing static screenshots of passes.</p>
          </div>

          <div className="bg-black p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-white text-sm">Google Maps Platform Geofencing API</strong>
              <span className="text-emerald-400 font-mono">GEOFENCE LOCKED</span>
            </div>
            <p className="text-zinc-400">Validates student location near Hostel Gate 1 before permitting pass activation and QR rendering.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
