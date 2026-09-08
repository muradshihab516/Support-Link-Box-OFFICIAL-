import React from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  MessageCircle, 
  Clock, 
  HelpCircle, 
  UserCheck, 
  PhoneCall, 
  AlertOctagon,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SuspendedMemberNotice: React.FC = () => {
  const { currentUser, adminSupportLinks } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!currentUser || currentUser.status !== 'suspended') {
    return null;
  }

  const activeAdmins = adminSupportLinks.filter(a => a.isActive);

  const handleCopyDetails = () => {
    const text = `Member Name: ${currentUser.name}\nUsername: ${currentUser.username}\nMember ID: #${currentUser.memberNumber}\nStatus: Suspended (Late Support Cutoff Exceeded)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-gradient-to-b from-red-950/40 via-[#161214] to-[#121214] border border-red-500/40 rounded-2xl p-6 sm:p-8 space-y-6 text-gray-200 shadow-xl">
      
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-red-500/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-400 shadow-lg shadow-red-500/20">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-red-500/25 border border-red-500/50 rounded-full text-[11px] font-bold text-red-300 uppercase tracking-wide">
                Account Suspended
              </span>
              <span className="text-xs text-red-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Cutoff Exceeded (10:00 AM)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              আপনার অ্যাকাউন্টটি সাময়িকভাবে সাসপেন্ড রয়েছে
            </h2>
          </div>
        </div>

        <button
          onClick={handleCopyDetails}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700 transition-colors"
          title="অ্যাডমিনকে দেওয়ার জন্য তথ্য কপি করুন"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'কপি হয়েছে!' : 'মেম্বার তথ্য কপি করুন'}</span>
        </button>
      </div>

      {/* Explanation Box */}
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-200/90 leading-relaxed space-y-2">
        <p className="font-semibold text-red-300">
          ⚠️ কেন এই সাসপেনশন?
        </p>
        <p>
          রাত ১২:০০ টার পর আপনার সাপোর্ট বাকি থাকায় স্বয়ংক্রিয়ভাবে সাময়িক রিমুভ করা হয়েছিল। 
          পরবর্তী ১০ ঘণ্টার রিকভারি উইন্ডো (পরদিন সকাল ১০:০০ টা) অতিক্রম করার পরও সাপোর্ট সম্পন্ন না করায় অটো-এডমিন সিস্টেম অ্যাকাউন্টটি সাসপেন্ড করেছে।
        </p>
        <p className="text-xs text-red-300/80">
          * সাসপেন্ডেড অবস্থায় আপনি লিংক সাবমিট করতে পারবেন না। অ্যাকাউন্ট পুনরায় চালু (Re-Approval) করতে নিচে তালিকাভুক্ত অ্যাডমিনদের সাথে সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      {/* Admin Contact Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            সরাসরি অ্যাডমিন সাপোর্ট আইডি (Re-Approval Contact):
          </h4>
          <span className="text-xs text-gray-400">
            যেকোনো একজন অ্যাডমিনকে মেসেজ দিন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeAdmins.length > 0 ? (
            activeAdmins.map(admin => (
              <div 
                key={admin.id}
                className="p-4 rounded-xl bg-[#1a1a1e] border border-gray-800 hover:border-gray-700 flex flex-col justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={admin.adminAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={admin.adminName}
                    className="w-11 h-11 rounded-full object-cover border border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-sm text-white truncate">{admin.adminName}</h5>
                      <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-semibold">
                        {admin.adminRole === 'super_admin' ? 'Super Admin' : admin.adminRole === 'admin' ? 'Admin' : 'Moderator'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{admin.platformName}</p>
                    {admin.notes && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{admin.notes}</p>
                    )}
                  </div>
                </div>

                <a
                  href={admin.supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>মেসেজ দিন ({admin.platformName})</span>
                  <ExternalLink className="w-3 h-3 text-white/70" />
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-4 text-center text-xs text-gray-400 bg-gray-900/60 rounded-xl border border-gray-800">
              কোনো অ্যাডমিন সাপোর্ট লিংক যুক্ত করা হয়নি। অনুগ্রহ করে প্ল্যাটফর্মের মূল ফেসবুক গ্রুপ বা পেজে যোগাযোগ করুন।
            </div>
          )}
        </div>
      </div>

      {/* Member Details Reference */}
      <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
        <div>
          আপনার মেম্বার আইডি: <strong className="text-white">#{currentUser.memberNumber}</strong> ({currentUser.name})
        </div>
        <div className="text-gray-400">
          যোগাযোগের সময় আপনার মেম্বার আইডি ও ইউজারনেম <strong>@{currentUser.username}</strong> উল্লেখ করুন।
        </div>
      </div>
    </div>
  );
};
