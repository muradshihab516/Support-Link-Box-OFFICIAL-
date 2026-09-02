import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User, Shield, KeyRound, UserPlus, Check, Sparkles, ExternalLink } from 'lucide-react';
import { Member } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'switch' | 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'switch' }) => {
  const { members, currentUser, loginAs, registerMember } = useApp();
  const [tab, setTab] = useState<'switch' | 'login' | 'register'>(initialTab);
  
  // Registration form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchMember, setSearchMember] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !username.trim() || !email.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const res = registerMember({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      facebookUrl: facebookUrl.trim() || `https://facebook.com/${username.trim()}`
    });

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchMember.toLowerCase()) || 
    m.username.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.memberNumber.toString().includes(searchMember)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Account & Role Switcher
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Support Link Box — Instant demo role simulation or new registration
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 p-1 m-3 rounded-xl">
          <button
            onClick={() => setTab('switch')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'switch'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            Quick Switch
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register New
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {tab === 'switch' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-xs text-indigo-800 dark:text-indigo-300">
                ⚡ <strong>One-Click Simulation:</strong> Select any persona below to experience the platform from a Member, Admin, or Super Admin perspective instantly.
              </div>

              {/* Quick Persona Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { loginAs('user_emon'); onClose(); }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
                    currentUser?.id === 'user_emon'
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-slate-800'
                  }`}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" 
                    alt="Emon" 
                    className="w-10 h-10 rounded-full mb-1.5 object-cover"
                  />
                  <span className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">Md Emon</span>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Member #103</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Link #10 Submitted</span>
                </button>

                <button
                  onClick={() => { loginAs('user_admin_shihab'); onClose(); }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
                    currentUser?.id === 'user_admin_shihab'
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-slate-800'
                  }`}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                    alt="Shihab" 
                    className="w-10 h-10 rounded-full mb-1.5 object-cover"
                  />
                  <span className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">Admin Shihab</span>
                  <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Community Admin</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Mod Controls</span>
                </button>

                <button
                  onClick={() => { loginAs('user_super_admin'); onClose(); }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
                    currentUser?.id === 'user_super_admin'
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-slate-800'
                  }`}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                    alt="Murad" 
                    className="w-10 h-10 rounded-full mb-1.5 object-cover"
                  />
                  <span className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">Murad Shihab</span>
                  <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">Super Admin</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Full System Access</span>
                </button>
              </div>

              {/* Search all members */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Or pick from all community members ({members.length}):
                </label>
                <input
                  type="text"
                  placeholder="Search by name, @username or #ID..."
                  value={searchMember}
                  onChange={e => setSearchMember(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {filteredMembers.slice(0, 15).map(m => (
                  <div
                    key={m.id}
                    onClick={() => { loginAs(m.id); onClose(); }}
                    className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      currentUser?.id === m.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {m.name}
                          <span className="text-[10px] text-slate-400">#{m.memberNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                          <span>@{m.username}</span>
                          <span>•</span>
                          <span className={
                            m.status === 'active' ? 'text-emerald-500 font-medium' :
                            m.status === 'frozen' ? 'text-blue-500 font-medium' :
                            m.status === 'inactive' ? 'text-amber-500 font-medium' : 'text-rose-500'
                          }>
                            {m.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {currentUser?.id === m.id && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-600 dark:text-emerald-300 font-medium">
                  {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username (without @) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. tanvir_ahmed22"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tanvir@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Facebook Profile URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/your.profile"
                  value={facebookUrl}
                  onChange={e => setFacebookUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Create Member Account & Join Community
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
