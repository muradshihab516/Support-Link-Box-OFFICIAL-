import React from 'react';
import { 
  Flame, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Star,
  Award,
  Lock,
  Wrench
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SponsoredBanner } from '../monetization/SponsoredBanner';
import { DisplayAdSlot } from '../monetization/DisplayAdSlot';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onNavigate }) => {
  const { members, dailyLinks, sponsors } = useApp();

  return (
    <div className="space-y-16 py-6 sm:py-12">
      
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Professional Facebook Support Community Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Submit • Support • <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500">Grow Together</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The all-in-one web platform for active Facebook creators and page managers to exchange verified reactions, comments, and boost post reach automatically.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
          >
            <span>Enter Member Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('free_tools')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Wrench className="w-4 h-4 text-emerald-500" />
            <span>Free Creator Tools</span>
          </button>
        </div>

        {/* Live Community Proof Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">2,000+</div>
            <div className="text-xs text-slate-500 mt-0.5">Active Community Members</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">200+</div>
            <div className="text-xs text-slate-500 mt-0.5">Daily Links Exchanged</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">98.4%</div>
            <div className="text-xs text-slate-500 mt-0.5">Support Fulfillment Rate</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">৳0 Free</div>
            <div className="text-xs text-slate-500 mt-0.5">No Charge for Members</div>
          </div>
        </div>
      </section>

      {/* Sponsored Banner Slot */}
      <div className="max-w-5xl mx-auto px-4">
        <SponsoredBanner position="top_banner" />
      </div>

      {/* Core Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Why Support Link Box Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Traditional Messenger groups are chaotic and messy. Support Link Box brings structured transparency and gamification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Instant "Today's Task" Focus
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every member knows exactly what to do. Submit 1 link per day and support today's submitted posts with real-time countdown progress.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Gamified Weekly Points & Streaks
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain daily streaks, unlock custom achievement badges, and climb the weekly leaderboard for sponsored prizes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fair Play & Anti-Abuse System
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated inactivity detection, freeze system for busy members, warning notices, and duplicate link prevention.
            </p>
          </div>
        </div>
      </section>

      {/* Rules & Fair Play Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Support Link Box Rules & Etiquette
          </h3>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>1 Daily Link:</strong> Each member can submit a maximum of 1 public Facebook post/reel per calendar day.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>100% Support Reciprocity:</strong> If you submit a link, you MUST react and leave meaningful comments on all other submitted links before 11:59 PM BST.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Inactivity Policy:</strong> 3 consecutive days of no support leads to an alert notice. 7+ days triggers automatic temporary freeze.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Quality Interactions:</strong> Genuine reactions and 4+ word comments are required. Bot spam or fake claims are banned.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Sponsored Partner Showcase */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Ecosystem Partners
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Supported by Leading Tech & Creator Brands
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sponsors.map(sponsor => (
            <a
              key={sponsor.id}
              href={sponsor.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 hover:border-indigo-300 transition-all text-left group"
            >
              {sponsor.imageUrl && (
                <img src={sponsor.imageUrl} alt={sponsor.sponsorName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 line-clamp-1">
                  {sponsor.sponsorName}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {sponsor.title}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <DisplayAdSlot format="leaderboard" />

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black">Ready to Supercharge Your Engagement?</h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-md mx-auto">
            Join 2,000+ active creators on Support Link Box today. 100% free forever.
          </p>
          <button
            onClick={onEnterApp}
            className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
