import React, { useState } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Hash, 
  Type, 
  Calculator, 
  Link as LinkIcon, 
  ExternalLink,
  MessageSquareQuote,
  Flame
} from 'lucide-react';
import { DisplayAdSlot } from '../monetization/DisplayAdSlot';
import { SponsoredBanner } from '../monetization/SponsoredBanner';

export const FreeToolsHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'link_checker' | 'caption_gen' | 'hashtags' | 'text_formatter' | 'engagement_calc' | 'char_counter'>('caption_gen');

  // Tool 1: Link Validator State
  const [testUrl, setTestUrl] = useState('');
  const [linkAnalysis, setLinkAnalysis] = useState<{ valid: boolean; type: string; id: string; tips: string } | null>(null);

  // Tool 2: Caption Gen State
  const [niche, setNiche] = useState('Tech & Gadgets');
  const [language, setLanguage] = useState<'bangla' | 'english'>('bangla');
  const [tone, setTone] = useState('engaging');
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Tool 3: Hashtag Generator State
  const [hashNiche, setHashNiche] = useState('Technology');
  const [hashResult, setHashResult] = useState<string[]>([]);
  const [hashCopied, setHashCopied] = useState(false);

  // Tool 4: Fancy Text Formatter State
  const [inputText, setInputText] = useState('Support Link Box helps your content grow faster!');
  const [fontCopied, setFontCopied] = useState<string | null>(null);

  // Tool 5: Engagement Calculator State
  const [reactions, setReactions] = useState<number>(150);
  const [comments, setComments] = useState<number>(45);
  const [shares, setShares] = useState<number>(12);
  const [reach, setReach] = useState<number>(1800);

  // Tool 6: Character Counter State
  const [counterText, setCounterText] = useState('');

  // Link Validator Logic
  const handleAnalyzeLink = () => {
    if (!testUrl.trim()) return;
    const url = testUrl.trim();
    if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) {
      let type = 'Standard Facebook Post';
      if (url.includes('/reel/')) type = 'Facebook Reel';
      else if (url.includes('/videos/') || url.includes('fb.watch')) type = 'Facebook Video';
      else if (url.includes('/groups/')) type = 'Group Discussion Post';

      const matchId = url.match(/(posts\/|videos\/|reel\/|fbid=)(\d+)/);
      const extractedId = matchId ? matchId[2] : 'Direct URL Validated';

      setLinkAnalysis({
        valid: true,
        type,
        id: extractedId,
        tips: 'Post link format is valid! Make sure the post privacy is set to "Public" for mutual community reactions.'
      });
    } else {
      setLinkAnalysis({
        valid: false,
        type: 'Invalid Link',
        id: 'None',
        tips: 'Please enter a valid Facebook post, video, reel or group URL.'
      });
    }
  };

  // Caption Generator Logic
  const generateCaptions = () => {
    if (language === 'bangla') {
      const templates = [
        `🔥 নতুন পোস্ট আপনাদের জন্য! সম্পূর্ণ রিভিউ ও অভিজ্ঞতা জানতে পোস্টটি শেষ পর্যন্ত পড়ুন।\n\nআপনার মূল্যবান মতামত কমেন্টে জানান এবং লাইক দিয়ে পাশে থাকুন! ❤️\n#SupportLinkBox #${niche.replace(/\s+/g, '')} #BanglaPost`,
        `✨ আজকের বিশেষ শেয়ার! এই ট্রিকটি কি আপনার আগে জানা ছিল? নিচে কমেন্টে জানিয়ে দিন।\n\nপোস্টটি ভালো লাগলে লাইক ও শেয়ার করতে ভুলবেন না! 🚀\n#Engagement #${niche.replace(/\s+/g, '')} #ViralBD`,
        `💡 বন্ধুদের সাথে শেয়ার করার মতো একটি দারুণ কনটেন্ট! আপনার অভিজ্ঞতা কী? নিচে অবশ্যই কমেন্ট করবেন।\n\nসবার সাপোর্ট একান্ত কাম্য 🙏 #SupportLinkBox #${niche.replace(/\s+/g, '')}`
      ];
      setGeneratedCaptions(templates);
    } else {
      const templates = [
        `🔥 Dropping something valuable today! If you love this insight, smash that like button and drop your thoughts in the comments! 🚀\n#SupportLinkBox #${niche.replace(/\s+/g, '')} #CreatorGrowth`,
        `✨ What do you think about this? Let me know your honest opinion in the comments below! 👇\n#ViralPost #${niche.replace(/\s+/g, '')} #EngagementBoost`,
        `💡 A quick breakdown you can't miss! Share your feedback in the comments and let's discuss! ❤️\n#ContentCreator #${niche.replace(/\s+/g, '')}`
      ];
      setGeneratedCaptions(templates);
    }
  };

  // Hashtag Generator Logic
  const generateHashtags = (selectedNiche: string) => {
    const map: Record<string, string[]> = {
      Technology: ['#TechBD', '#GadgetReview', '#TechNews', '#Innovations', '#TechDaily', '#BanglaTech', '#AItools', '#GadgetsWorld'],
      Vlogs: ['#BanglaVlog', '#DailyLifeBD', '#LifestyleVlogger', '#DhakaLife', '#VlogCommunity', '#ContentCreator', '#ViralVlog'],
      Fashion: ['#FashionBD', '#OutfitOfTheDay', '#DesiFashion', '#StyleInspiration', '#FashionTrendsBD', '#TrendyOutfits'],
      Business: ['#EntrepreneurBD', '#StartupBangladesh', '#DigitalMarketingBD', '#BusinessGrowth', '#SmallBusinessBD', '#EcommerceBD'],
      Fitness: ['#FitnessBD', '#WorkoutMotivation', '#HealthyLivingBD', '#GymLife', '#FitnessGoals', '#NutritionTips']
    };
    const res = map[selectedNiche] || map['Technology'];
    setHashResult(res);
  };

  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  // Unicode text conversion helpers
  const toBold = (str: string) => {
    const boldChars: Record<string, string> = {
      a: '𝗮', b: '𝗯', c: '𝗰', d: '𝗱', e: '𝗲', f: '𝗳', g: '𝗴', h: '𝗵', i: '𝗶', j: '𝗷', k: '𝗸', l: '𝗹', m: '𝗺', n: '𝗻', o: '𝗼', p: '𝗽', q: '𝗾', r: '𝗿', s: '𝘀', t: '𝘁', u: '𝘂', v: '𝘃', w: '𝘄', x: '𝘅', y: '𝘆', z: '𝘇',
      A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗤'
    };
    return str.split('').map(c => boldChars[c] || c).join('');
  };

  const toItalic = (str: string) => {
    const italicChars: Record<string, string> = {
      a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪', j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮', n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳', s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻',
      A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐', J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔', N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙', S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡'
    };
    return str.split('').map(c => italicChars[c] || c).join('');
  };

  const toMonospace = (str: string) => {
    const monoChars: Record<string, string> = {
      a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏', g: '𝚐', h: '𝚑', i: '𝚒', j: '𝚓', k: '𝚔', l: '𝚕', m: '𝚖', n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛', s: '𝚜', t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡', y: '𝚢', z: '𝚣',
      A: '𝙰', B: '𝙱', C: '𝙲', D: '𝙳', E: '𝙴', F: '𝙵', G: '𝙶', H: '𝙷', I: '𝙸', J: '𝙹', K: '𝙺', L: '𝙻', M: '𝙼', N: '𝙽', O: '𝙾', P: '𝙿', Q: '𝚀', R: '𝚁', S: '𝚂', T: '𝚃', U: '𝚄', V: '𝚅', W: '𝚆', X: '𝚇', Y: '𝚈', Z: '𝚉'
    };
    return str.split('').map(c => monoChars[c] || c).join('');
  };

  // Engagement calculation
  const totalEngagements = Number(reactions || 0) + Number(comments || 0) + Number(shares || 0);
  const engagementRate = reach > 0 ? ((totalEngagements / reach) * 100).toFixed(2) : '0.00';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Wrench className="w-6 h-6 text-indigo-400" />
              Creator & Community Free Tools Hub
            </h1>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full">
              100% Free
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Free viral tools to optimize your Facebook posts, engagement rates, hashtags and captions.
          </p>
        </div>
      </div>

      {/* Top Banner Sponsor */}
      <SponsoredBanner position="top_banner" />

      {/* Tool Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => setActiveTool('caption_gen')}
          className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
            activeTool === 'caption_gen'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white hover:border-indigo-500/40'
          }`}
        >
          <MessageSquareQuote className="w-5 h-5 mb-1 text-inherit" />
          <span className="text-xs font-bold">Caption Generator</span>
        </button>

        <button
          onClick={() => { setActiveTool('hashtags'); generateHashtags('Technology'); }}
          className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
            activeTool === 'hashtags'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white hover:border-indigo-500/40'
          }`}
        >
          <Hash className="w-5 h-5 mb-1 text-inherit" />
          <span className="text-xs font-bold">Hashtag Finder</span>
        </button>

        <button
          onClick={() => setActiveTool('text_formatter')}
          className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
            activeTool === 'text_formatter'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white hover:border-indigo-500/40'
          }`}
        >
          <Type className="w-5 h-5 mb-1 text-inherit" />
          <span className="text-xs font-bold">Fancy FB Fonts</span>
        </button>

        <button
          onClick={() => setActiveTool('link_checker')}
          className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
            activeTool === 'link_checker'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white hover:border-indigo-500/40'
          }`}
        >
          <LinkIcon className="w-5 h-5 mb-1 text-inherit" />
          <span className="text-xs font-bold">FB Link Checker</span>
        </button>

        <button
          onClick={() => setActiveTool('engagement_calc')}
          className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
            activeTool === 'engagement_calc'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white hover:border-indigo-500/40'
          }`}
        >
          <Calculator className="w-5 h-5 mb-1 text-inherit" />
          <span className="text-xs font-bold">Engagement Rate</span>
        </button>

        <button
          onClick={() => setActiveTool('char_counter')}
          className={`p-3 rounded-xl border text-left flex flex-col items-center text-center transition-all ${
            activeTool === 'char_counter'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white hover:border-indigo-500/40'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-1 text-inherit" />
          <span className="text-xs font-bold">Word Counter</span>
        </button>
      </div>

      {/* TOOL 1: CAPTION GENERATOR */}
      {activeTool === 'caption_gen' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-indigo-400" />
              Viral Facebook Caption & Engagement Hook Generator
            </h3>
            <p className="text-xs text-gray-500">
              Generate proven engagement hooks and call-to-action captions in Bangla and English.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Content Niche</label>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white"
              >
                <option value="Tech & Gadgets" className="bg-[#131315]">Tech & Gadgets</option>
                <option value="Daily Life & Vlogs" className="bg-[#131315]">Daily Life & Vlogs</option>
                <option value="Business & Ecommerce" className="bg-[#131315]">Business & Ecommerce</option>
                <option value="Educational & Tips" className="bg-[#131315]">Educational & Tips</option>
                <option value="Entertainment & Humor" className="bg-[#131315]">Entertainment & Humor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white"
              >
                <option value="bangla" className="bg-[#131315]">Bangla (বাংলা)</option>
                <option value="english" className="bg-[#131315]">English</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateCaptions}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" /> Generate Captions
              </button>
            </div>
          </div>

          {generatedCaptions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Generated Engagement Captions ({generatedCaptions.length}):
              </div>

              {generatedCaptions.map((cap, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0E0E10] border border-[#1E1E20] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs text-gray-200 whitespace-pre-line flex-1">
                    {cap}
                  </p>
                  <button
                    onClick={() => copyToClipboard(cap, i)}
                    className="px-3 py-1.5 bg-[#131315] border border-[#1E1E20] text-gray-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 hover:bg-[#1E1E20] transition-colors"
                  >
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    <span>{copiedIndex === i ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: HASHTAG FINDER */}
      {activeTool === 'hashtags' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-400" />
              High-Reach Bangladeshi Facebook Hashtags
            </h3>
            <p className="text-xs text-gray-500">
              Pick your niche and copy curated trending tags for higher organic feed distribution.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Technology', 'Vlogs', 'Fashion', 'Business', 'Fitness'].map(cat => (
              <button
                key={cat}
                onClick={() => { setHashNiche(cat); generateHashtags(cat); }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  hashNiche === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-[#0E0E10] border border-[#1E1E20] text-gray-300 hover:text-white hover:bg-[#1E1E20]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="p-4 bg-[#0E0E10] rounded-xl border border-[#1E1E20]">
            <div className="flex flex-wrap gap-2 mb-4">
              {hashResult.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-[#131315] border border-[#1E1E20] rounded-lg text-xs font-mono text-indigo-400 font-semibold">
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(hashResult.join(' '));
                setHashCopied(true);
                setTimeout(() => setHashCopied(false), 1500);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {hashCopied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hashCopied ? 'All Hashtags Copied!' : 'Copy All Hashtags'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TOOL 3: FANCY TEXT FORMATTER */}
      {activeTool === 'text_formatter' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Type className="w-5 h-5 text-indigo-400" />
              Fancy Unicode Text Formatter for Facebook Posts
            </h3>
            <p className="text-xs text-gray-500">
              Make your headlines and bullet points stand out with bold, italic, and monospace styles.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Your Normal Text</label>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-600"
            />
          </div>

          <div className="space-y-3">
            {/* Bold */}
            <div className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1E1E20] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Bold Sans</span>
                <div className="text-sm text-white">{toBold(inputText)}</div>
              </div>
              <button
                onClick={() => { copyToClipboard(toBold(inputText)); setFontCopied('bold'); setTimeout(() => setFontCopied(null), 1500); }}
                className="px-3 py-1.5 bg-[#131315] border border-[#1E1E20] text-xs font-semibold rounded-lg flex items-center gap-1 text-gray-300 hover:text-white hover:bg-[#1E1E20]"
              >
                {fontCopied === 'bold' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                <span>{fontCopied === 'bold' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Italic */}
            <div className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1E1E20] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Italic Sans</span>
                <div className="text-sm text-white">{toItalic(inputText)}</div>
              </div>
              <button
                onClick={() => { copyToClipboard(toItalic(inputText)); setFontCopied('italic'); setTimeout(() => setFontCopied(null), 1500); }}
                className="px-3 py-1.5 bg-[#131315] border border-[#1E1E20] text-xs font-semibold rounded-lg flex items-center gap-1 text-gray-300 hover:text-white hover:bg-[#1E1E20]"
              >
                {fontCopied === 'italic' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                <span>{fontCopied === 'italic' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Monospace */}
            <div className="p-3.5 rounded-xl bg-[#0E0E10] border border-[#1E1E20] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Monospace Code</span>
                <div className="text-sm text-white font-mono">{toMonospace(inputText)}</div>
              </div>
              <button
                onClick={() => { copyToClipboard(toMonospace(inputText)); setFontCopied('mono'); setTimeout(() => setFontCopied(null), 1500); }}
                className="px-3 py-1.5 bg-[#131315] border border-[#1E1E20] text-xs font-semibold rounded-lg flex items-center gap-1 text-gray-300 hover:text-white hover:bg-[#1E1E20]"
              >
                {fontCopied === 'mono' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                <span>{fontCopied === 'mono' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 4: FACEBOOK LINK VALIDATOR */}
      {activeTool === 'link_checker' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-indigo-400" />
              Facebook Link Checker & ID Extractor
            </h3>
            <p className="text-xs text-gray-500">
              Verify if your Facebook post URL is formatted properly for community submission and public viewing.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste Facebook link here (e.g. https://facebook.com/...)"
              value={testUrl}
              onChange={e => setTestUrl(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-600"
            />
            <button
              onClick={handleAnalyzeLink}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shrink-0 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Analyze Link
            </button>
          </div>

          {linkAnalysis && (
            <div className={`p-4 rounded-xl border ${
              linkAnalysis.valid
                ? 'bg-green-500/10 border-green-500/20 text-green-300'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              <div className="text-sm font-bold flex items-center gap-1.5">
                {linkAnalysis.valid ? '✓ Valid Facebook URL' : '✕ Invalid Link Format'}
              </div>
              <div className="text-xs mt-1">
                <strong>Type:</strong> {linkAnalysis.type} • <strong>Target ID:</strong> {linkAnalysis.id}
              </div>
              <p className="text-xs mt-1.5 opacity-90">{linkAnalysis.tips}</p>
            </div>
          )}
        </div>
      )}

      {/* TOOL 5: ENGAGEMENT CALCULATOR */}
      {activeTool === 'engagement_calc' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              Post Engagement Rate Calculator
            </h3>
            <p className="text-xs text-gray-500">
              Calculate your Facebook post engagement percentage based on Reactions, Comments, Shares, and Reach.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Reactions ❤️</label>
              <input
                type="number"
                value={reactions}
                onChange={e => setReactions(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Comments 💬</label>
              <input
                type="number"
                value={comments}
                onChange={e => setComments(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Shares 🔄</label>
              <input
                type="number"
                value={shares}
                onChange={e => setShares(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Total Reach 👁️</label>
              <input
                type="number"
                value={reach}
                onChange={e => setReach(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0E0E10] border border-[#1E1E20] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calculated Engagement Rate</span>
              <div className="text-3xl font-bold text-indigo-400 mt-0.5">
                {engagementRate}%
              </div>
              <span className="text-xs text-gray-500">
                {totalEngagements} total interactions on {reach} post reach
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                Number(engagementRate) > 5 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {Number(engagementRate) > 5 ? '🔥 High Engagement' : 'Standard Rate'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 6: CHARACTER & WORD COUNTER */}
      {activeTool === 'char_counter' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-7 space-y-5 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Facebook Post Character & Word Counter
            </h3>
            <p className="text-xs text-gray-500">
              Check character counts, word counts, and see where Facebook cuts off the "See More" preview text.
            </p>
          </div>

          <textarea
            rows={5}
            placeholder="Type or paste your Facebook post text here..."
            value={counterText}
            onChange={e => setCounterText(e.target.value)}
            className="w-full p-3.5 text-xs sm:text-sm bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-600"
          />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Characters</span>
              <div className="text-xl font-bold text-white">{counterText.length}</div>
            </div>
            <div className="p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Words</span>
              <div className="text-xl font-bold text-white">
                {counterText.trim() ? counterText.trim().split(/\s+/).length : 0}
              </div>
            </div>
            <div className="p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase">See More Cutoff</span>
              <div className={`text-xl font-bold ${counterText.length > 400 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {counterText.length > 400 ? 'Triggers Cutoff' : 'Full Preview'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad slot */}
      <DisplayAdSlot format="horizontal_banner" />
    </div>
  );
};
