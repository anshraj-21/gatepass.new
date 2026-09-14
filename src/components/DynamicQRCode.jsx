import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, RefreshCw, ShieldAlert, Clock, Sparkles } from 'lucide-react';

export function DynamicQRCode({ pass }) {
  const [token, setToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    const generateToken = () => {
      const timestamp = Math.floor(Date.now() / 15000);
      const randomSeed = Math.random().toString(36).substring(2, 7);
      const hash = `GCP-AUTH:${pass.id}:${pass.studentId}:${timestamp}:${randomSeed}`;
      setToken(hash);
      setTimeLeft(15);
    };

    generateToken();
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          generateToken();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pass.id, pass.studentId]);

  const qrPayload = JSON.stringify({
    passId: pass.id,
    studentId: pass.studentId,
    studentName: pass.studentName,
    rollNo: pass.rollNo,
    passType: pass.passType,
    status: pass.status,
    expReturn: pass.expectedReturnTime,
    securityToken: token
  });

  return (
    <div className="flex flex-col items-center">
      {/* Outer Glow Container */}
      <div className="relative group">
        
        {/* Anti-screenshot Watermark overlay */}
        <div className="qr-container border-4 border-emerald-500/80 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
          
          {/* Laser scanning line effect */}
          <div className="qr-scan-line"></div>

          {/* QR Code SVG */}
          <QRCodeSVG 
            value={qrPayload}
            size={220}
            bgColor={"#FFFFFF"}
            fgColor={"#0F172A"}
            level={"H"}
            includeMargin={true}
          />

          {/* Dynamic Anti-Screenshot Watermark Banner */}
          <div className="absolute inset-0 watermark-banner pointer-events-none flex items-center justify-center">
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-red-500/30 rotate-45 select-none text-center leading-tight">
              LIVE GATE PASS<br/>DO NOT SCREENSHOT<br/>SECURED BY GCP
            </span>
          </div>

        </div>

      </div>

      {/* Security Refresh Indicator */}
      <div className="mt-4 flex flex-col items-center gap-2 text-center max-w-xs">
        <div className="flex items-center gap-2 bg-gray-900/90 px-3 py-1.5 rounded-full border border-emerald-500/40 text-xs font-mono text-emerald-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          <span>Security Token Refreshes in: <strong className="text-white">{timeLeft}s</strong></span>
        </div>

        <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          Screenshots will fail at gate scanner. Present live screen to guard.
        </p>
      </div>

    </div>
  );
}
