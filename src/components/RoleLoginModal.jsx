import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Key, ShieldCheck, UserCheck, AlertCircle, X } from 'lucide-react';

export function RoleLoginModal({ targetRole, onClose }) {
  const { loginToRole, MOCK_USERS } = useAuth();
  const targetUser = MOCK_USERS[targetRole];

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginToRole(targetRole, loginId, password);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleFillDemo = () => {
    if (targetUser) {
      setLoginId(targetUser.id);
      setPassword(targetUser.defaultPass);
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 lg:p-8 rounded-3xl border border-white/20 shadow-2xl relative space-y-6 animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Security Authentication</h3>
              <p className="text-xs text-gray-400">Switching to <strong className="text-purple-400">{targetRole}</strong> Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-amber-950/40 p-3.5 rounded-xl border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>Restricted Portal. Students cannot access Warden or Guard roles without authenticating with a valid Login ID & Password.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              {targetRole} Login ID / Email
            </label>
            <input 
              type="text" 
              placeholder={`Enter ID e.g. ${targetUser?.id}`}
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              className="custom-input text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              Security Password / PIN
            </label>
            <input 
              type="password" 
              placeholder="Enter Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="custom-input text-sm"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full custom-button custom-button-primary py-3 text-sm rounded-xl shadow-lg"
            >
              Authenticate & Open {targetRole} Portal
            </button>

            {/* Quick Demo Credentials Helper */}
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-purple-400 hover:text-purple-300 underline font-medium text-center"
            >
              ⚡ Auto-fill Demo Credentials ({targetUser?.id} / {targetUser?.defaultPass})
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
