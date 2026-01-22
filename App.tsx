import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Loader2,
  Sparkles,
  User,
  ShieldCheck,
  X,
  Waves,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { analyzeChatLogs } from './geminiService';
import { AnalysisResult, UserState, Blocker } from './types';
import { apiService } from './apiService';

// Declare Google global for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

const GOOGLE_CLIENT_ID = "355007305929-g804tfrh3b9uf8o4gjgtekml3hqcf6l5.apps.googleusercontent.com";
const INITIAL_FREE_CREDITS = 25;
const ANALYSIS_COST = 2;
const STRIPE_BILLING_PORTAL = "https://billing.stripe.com/p/login/cNi6oI05abPU4rU4oKefC00";

// --- Types ---
interface ExtendedUserState extends UserState {
  email?: string;
  avatar?: string;
  name?: string;
}

// --- Custom Components ---

const LiquidityEngine: React.FC<{ pulse: string; hoverImpact: number | null }> = ({ pulse, hoverImpact }) => {
  const intensity = useMemo(() => {
    if (hoverImpact !== null) return 0.8 + (hoverImpact / 100) * 2.5;
    return 1.1;
  }, [hoverImpact]);

  const scale = useMemo(() => {
    if (hoverImpact !== null) return 0.35 + (hoverImpact / 100) * 0.9;
    return 0.85;
  }, [hoverImpact]);

  return (
    <motion.div 
      className="relative w-full h-52 flex flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-[#00555a]/5 border border-[#00555a]/20 mb-6 group"
      animate={{ 
        borderColor: hoverImpact !== null ? 'rgba(244, 211, 94, 0.4)' : 'rgba(0, 85, 90, 0.2)',
        boxShadow: hoverImpact !== null ? '0 0 40px rgba(244, 211, 94, 0.15)' : '0 0 0px rgba(0,0,0,0)'
      }}
      transition={{ duration: 0.6, ease: "circOut" }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [scale, scale * 1.2, scale],
            rotate: [0, 120 * intensity, 240 * intensity],
          }}
          transition={{
            duration: 10 / (intensity || 0.1),
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-[#00555a]/40 via-transparent to-[#f4d35e]/30 blur-[50px]"
        />
      </div>

      <div className="relative w-full h-32 flex items-center justify-center">
        <svg viewBox="-50 -50 300 300" className="w-full h-full p-4 overflow-visible">
          <motion.path
            animate={{
              scale: scale,
              d: [
                "M45,-62.1C58.9,-54.2,71.2,-42.1,77.5,-27.6C83.7,-13.2,83.9,3.7,78.2,18.8C72.5,33.9,60.9,47.2,46.9,56.5C32.9,65.8,16.4,71.1,0.2,70.7C-16,70.4,-32,64.4,-45.5,55C-59,45.7,-70,32.9,-75.4,17.7C-80.8,2.4,-80.5,-15.3,-73.8,-30.1C-67.1,-44.9,-54,-56.8,-40.1,-64.7C-26.2,-72.6,-11.5,-76.5,2.1,-79.8C15.7,-83.1,31.2,-70,45,-62.1Z",
                "M49.2,-64.1C63.2,-55.8,73.7,-41,78.8,-24.8C83.8,-8.6,83.5,8.9,77.1,24.1C70.6,39.3,58,52.2,43.3,60.9C28.6,69.5,11.8,73.8,-4.2,79.5C-20.2,85.3,-35.3,92.5,-47.9,87C-60.5,81.5,-70.6,63.2,-77.3,45.5C-84,27.8,-87.3,10.6,-85.4,-6.2C-83.5,-23.1,-76.4,-39.6,-64,-50.2C-51.7,-60.8,-34.1,-65.4,-18.3,-69C-2.5,-72.6,11.5,-75.3,25.4,-72.6C39.2,-69.9,52.8,-61.8,49.2,-64.1Z"
              ]
            }}
            transition={{
              duration: 6 / intensity,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              scale: { duration: 0.6, ease: "circOut" }
            }}
            transform="translate(100 100)"
            fill={hoverImpact !== null ? "#f4d35e" : "#00555a"}
            fillOpacity="0.25"
            stroke={hoverImpact !== null ? "#f4d35e" : "#00555a"}
            strokeWidth="1.2"
          />
        </svg>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={hoverImpact !== null ? 'impact' : 'idle'}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="relative mt-2 pb-4 flex flex-col items-center z-10"
        >
          <span className="text-[10px] font-grotesk font-black tracking-[0.6em] text-[#f4d35e] uppercase">
            {hoverImpact !== null ? `DEBT DENSITY: ${hoverImpact}%` : 'PULSE ENGINE ACTIVE'}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

const GeometricLogo = ({ className = "w-8 h-8", color = "#f4d35e" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path 
      d="M20 50L50 10L80 50L50 90L20 50Z" 
      stroke={color} 
      strokeWidth="4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.circle 
      cx="50" cy="50" r="10" 
      fill={color}
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </svg>
);

const AuthModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: (email: string, name?: string, avatar?: string) => void 
}> = ({ isOpen, onClose, onLogin }) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize if the modal is open and the script is loaded
    if (isOpen && typeof window.google !== 'undefined' && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          try {
            // Decode JWT payload safely
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            
            const payload = JSON.parse(jsonPayload);
            
            // Execute the login protocol
            onLogin(payload.email, payload.name, payload.picture);
          } catch (error) {
            console.error("Identity decode failed:", error);
          }
        },
      });

      // We use a small timeout to ensure the DOM ref is ready
      const renderTimeout = setTimeout(() => {
        if (googleBtnRef.current && window.google?.accounts?.id) {
          window.google.accounts.id.renderButton(
            googleBtnRef.current,
            { 
              theme: "filled_blue", 
              size: "large", 
              width: "320", 
              text: "continue_with",
              shape: "pill",
            }
          );
        }
      }, 100);
      
      return () => clearTimeout(renderTimeout);
    }
  }, [isOpen, onLogin]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative w-full max-w-md bg-[#000000] border border-[#00555a] p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(244,211,94,0.1)] overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <div className="flex justify-center mb-8">
              <div className="bg-[#f4d35e] p-5 rounded-[2rem] shadow-[0_0_30px_rgba(244,211,94,0.2)]">
                <Zap className="text-black w-10 h-10" fill="currentColor" />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-grotesk font-black text-center mb-4 uppercase tracking-tighter text-white">
                IDENTITY PROTOCOL
              </h2>
              <p className="text-gray-500 text-center mb-10 font-light leading-relaxed">
                Secure executive authentication via Google is required to maintain credit liquidity and signal history.
              </p>
              
              <div className="flex justify-center w-full min-h-[50px]">
                <div ref={googleBtnRef} />
              </div>
              
              <p className="text-[9px] text-gray-800 text-center uppercase tracking-[0.2em] leading-relaxed mt-4">
                ZEITGEIST PRIVACY SHIELD PROTECTED. NO DATA RETENTION ON LOG ANALYSIS.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Header: React.FC<{ user: ExtendedUserState; onSignIn: () => void; onLogout: () => void }> = ({ user, onSignIn, onLogout }) => (
  <header className="flex items-center justify-between py-6 px-6 md:px-16 border-b border-[#00555a]/20 backdrop-blur-xl sticky top-0 z-50">
    <div className="flex items-center gap-4">
      <GeometricLogo className="w-9 h-9" />
      <h1 className="text-xl font-grotesk font-black tracking-tighter uppercase text-white">ZEITGEIST</h1>
    </div>
    <div className="flex items-center gap-8">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-[8px] text-[#00555a] uppercase tracking-[0.4em] font-black">LIQUIDITY</span>
        <span className="text-[#f4d35e] font-mono font-bold tracking-tighter text-xl">{user.credits} <span className="text-[10px] ml-1">CR</span></span>
      </div>
      {user.isLoggedIn ? (
        <div className="flex items-center gap-4">
          {user.avatar && <img src={user.avatar} className="w-8 h-8 rounded-full border border-[#f4d35e]/30" alt="Avatar" />}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white font-grotesk font-black uppercase tracking-widest">{user.name || user.email?.split('@')[0]}</span>
            <span className="text-[8px] text-gray-500 uppercase">Executive Node</span>
          </div>
          <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
        </div>
      ) : (
        <button onClick={onSignIn} className="text-[10px] font-grotesk font-black text-black bg-[#f4d35e] px-6 py-2 rounded-lg uppercase tracking-widest hover:bg-white transition-all">Sign In</button>
      )}
    </div>
  </header>
);

const PricingCard: React.FC<{ title: string; price: string; link: string; user: ExtendedUserState; isPro?: boolean; onAuthNeeded: () => void; }> = ({ title, price, link, user, isPro, onAuthNeeded }) => {
  const handleBuy = (e: React.MouseEvent) => { 
    if (!user.isLoggedIn) { 
      e.preventDefault(); 
      onAuthNeeded(); 
    } 
  };
  
  const stripeLink = useMemo(() => {
    if (!user.isLoggedIn) return "#";
    const url = new URL(link);
    url.searchParams.append('client_reference_id', user.userId);
    if (user.email) url.searchParams.append('prefilled_email', user.email);
    url.searchParams.append('plan', isPro ? 'pro' : 'starter');
    return url.toString();
  }, [user, link, isPro]);

  return (
    <motion.div whileHover={{ y: -8 }} className={`p-8 rounded-[2.5rem] border transition-all duration-700 ${isPro ? 'border-[#f4d35e] bg-[#f4d35e]/5' : 'border-[#00555a]/40 bg-[#001a1a]/50'} flex flex-col relative overflow-hidden group`}>
      <h3 className="text-sm font-grotesk font-black mb-1 uppercase tracking-[0.2em] text-gray-400">{title}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <p className="text-4xl font-grotesk font-black text-white">{price}</p>
        {isPro && <span className="text-gray-600 font-bold uppercase text-[9px]">/ mo</span>}
      </div>
      <ul className="space-y-4 mb-8 text-[13px] text-gray-400 flex-grow font-light">
        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#f4d35e]" /> <span className="font-bold text-white">{isPro ? '500' : '100'} Credits</span></li>
        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#f4d35e]" /> Deep Reasoning Engine</li>
        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#f4d35e]" /> Account Sync Protocol</li>
      </ul>
      <a href={stripeLink} onClick={handleBuy} className={`py-4 rounded-xl font-black text-center transition-all uppercase tracking-[0.2em] text-[9px] ${isPro ? 'bg-[#f4d35e] text-black hover:bg-white' : 'border border-[#00555a] text-white hover:bg-[#00555a]/20'}`}>
        {user.isLoggedIn ? 'Activate Liquidity' : 'Sign In to Purchase'}
      </a>
    </motion.div>
  );
};

const ResultCard: React.FC<{ icon: React.ReactNode; title: string; content?: string; items?: string[]; blockers?: Blocker[]; delay: number; extra?: React.ReactNode; onItemHover?: (impact: number | null) => void; grid?: boolean; }> = ({ icon, title, content, items, blockers, delay, extra, onItemHover, grid }) => (
  <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="bg-[#001a1a]/30 border border-[#00555a]/20 p-8 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-black/60 rounded-2xl border border-[#00555a]/30">{icon}</div>
      <h4 className="text-[10px] font-grotesk font-black tracking-[0.5em] text-[#00555a] uppercase">{title}</h4>
    </div>
    {extra}
    {content && <p className="text-2xl md:text-3xl font-light leading-tight text-gray-200 tracking-tight mb-4">{content}</p>}
    {items && (
      <ul className={grid ? "grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6" : "space-y-6"}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-4 group/item">
            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#f4d35e] shrink-0 opacity-20 group-hover/item:opacity-100 transition-all shadow-[0_0_10px_#f4d35e]" />
            <span className="text-gray-400 font-light leading-relaxed text-lg group-hover/item:text-gray-100 transition-colors">{item}</span>
          </li>
        ))}
      </ul>
    )}
    {blockers && (
      <ul className="space-y-8">
        {blockers.map((blocker, i) => (
          <li key={i} className="flex flex-col gap-2 group/item cursor-help" onMouseEnter={() => onItemHover?.(blocker.impact)} onMouseLeave={() => onItemHover?.(null)}>
            <div className="flex items-start gap-4">
              <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#f4d35e] shrink-0 opacity-20 group-hover/item:opacity-100 transition-all shadow-[0_0_10px_#f4d35e]" />
              <span className="text-gray-400 font-light leading-relaxed text-lg group-hover/item:text-gray-100 transition-colors">{blocker.text}</span>
            </div>
            <div className="ml-5 flex items-center gap-3">
              <div className="flex-grow h-1 bg-[#00555a]/20 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${blocker.impact}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-[#00555a] to-[#f4d35e]" />
              </div>
              <span className="text-[10px] font-mono text-[#f4d35e] uppercase tracking-widest">{blocker.impact}%</span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </motion.div>
);

const App: React.FC = () => {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [hoveredImpact, setHoveredImpact] = useState<number | null>(null);
  
  const [user, setUser] = useState<ExtendedUserState>(() => {
    return { credits: INITIAL_FREE_CREDITS, userId: 'guest_' + Math.random().toString(36).substr(2, 9), isLoggedIn: false };
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('session_id')) {
      const sessionId = urlParams.get('session_id');
      const plan = urlParams.get('plan') as 'starter' | 'pro' | null;
      const emailFromUrl = urlParams.get('prefilled_email');
      
      if (plan && (plan === 'pro' || plan === 'starter')) {
        const creditsAdded = plan === 'pro' ? 500 : 100;
        const amountPaidCents = plan === 'pro' ? 4900 : 1900;
        
        const processPurchase = async () => {
          try {
            if (user.isLoggedIn && user.userId && !user.userId.startsWith('guest_')) {
              await apiService.recordPurchase({
                userId: user.userId,
                stripeSessionId: sessionId || undefined,
                planType: plan,
                creditsAdded,
                amountPaidCents,
              });
              
              if (user.email) {
                const updatedUser = await apiService.getUser(user.email);
                setUser(prev => ({
                  ...prev,
                  ...updatedUser,
                  email: updatedUser.email,
                }));
              }
            } else if (emailFromUrl) {
              setUser(prev => ({
                ...prev,
                credits: prev.credits + creditsAdded,
                email: emailFromUrl,
              }));
            } else {
              setUser(prev => ({
                ...prev,
                credits: prev.credits + creditsAdded,
              }));
            }
            
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
          } catch (error: any) {
            console.error('Failed to process purchase:', error);
            setApiError('Failed to process purchase. Credits may not have been added.');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
          }
        };
        
        processPurchase();
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [user.isLoggedIn, user.userId, user.email]);

  const handleLogin = async (email: string, name?: string, avatar?: string) => { 
    try {
      setApiError(null);
      const userData = await apiService.login(email);
      
      setUser({ 
        isLoggedIn: true, 
        email: userData.email,
        userId: userData.userId,
        credits: userData.credits,
        name,
        avatar
      }); 
      
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Login failed:', error);
      setApiError('Failed to authenticate. Please check your connection.');
    }
  };

  const handleLogout = () => { 
    setUser({ 
      credits: INITIAL_FREE_CREDITS, 
      userId: 'guest_' + Math.random().toString(36).substr(2, 9), 
      isLoggedIn: false,
      email: undefined
    }); 
  };

  const handleAnalyze = async () => {
    if (user.credits < ANALYSIS_COST) { 
      if (!user.isLoggedIn) setShowAuthModal(true); 
      else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); 
      return; 
    }
    if (!logs.trim()) return;
    setLoading(true);
    setApiError(null);
    try { 
      const data = await analyzeChatLogs(logs); 
      setResult(data); 
      
      if (user.isLoggedIn && user.userId && !user.userId.startsWith('guest_')) {
        try {
          const result = await apiService.updateCredits(user.userId, -ANALYSIS_COST, 'analysis');
          setUser(prev => ({ ...prev, credits: result.credits }));
        } catch (error: any) {
          console.error('Failed to update credits:', error);
          setUser(prev => ({ ...prev, credits: prev.credits - ANALYSIS_COST }));
          setApiError('Analysis completed but credit update failed.');
        }
      } else {
        setUser(prev => ({ ...prev, credits: prev.credits - ANALYSIS_COST }));
      }
    } 
    catch (e: any) { 
      console.error('Analysis error:', e);
      alert("AI Neural Handshake Timeout. Please retry."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-black selection:bg-[#f4d35e] selection:text-black text-white font-sans">
      <Header user={user} onSignIn={() => setShowAuthModal(true)} onLogout={handleLogout} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
      
      <AnimatePresence>
        {apiError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-red-900/90 border border-red-500/50 px-6 py-4 rounded-xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={20} />
              <p className="text-sm text-red-200">{apiError}</p>
              <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-200">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} className="text-center p-12">
              <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} className="p-8 bg-[#f4d35e] rounded-[3rem] shadow-[0_0_80px_rgba(244,211,94,0.4)] mx-auto mb-10 inline-block"><Sparkles className="text-black w-14 h-14" /></motion.div>
              <h2 className="text-5xl font-grotesk font-black text-[#f4d35e] uppercase tracking-tighter mb-4">RECHARGE SUCCESS</h2>
              <p className="text-gray-400 text-lg font-light italic">Signal Liquidity Synchronized. Account Registry Updated.</p>
              <button onClick={() => setShowSuccess(false)} className="mt-8 text-[10px] uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2 mx-auto">
                Protocol Acknowledged <ArrowRight size={12} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-6 mt-12 md:mt-20">
        <div className="text-center mb-16 md:mb-24">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f4d35e]/5 border border-[#f4d35e]/10 rounded-full mb-8">
            <ShieldCheck size={14} className="text-[#f4d35e]" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-400">Stateless Reasoning Architecture</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-grotesk font-black tracking-tighter mb-6 uppercase leading-[0.9] text-white">
            LIQUIDATE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00555a] via-[#f4d35e] to-[#00555a] bg-[length:200%_auto] animate-gradient-flow">SIGNAL DEBT</span>
          </motion.h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">Stop drowning in unread noise. Synthesize project truth instantly.</p>
        </div>

        <section className="mb-24 md:mb-32 relative">
          <div className="relative group">
            <div className="p-[1px] rounded-[3rem] bg-[#00555a]/30">
              <textarea 
                value={logs} 
                onChange={(e) => setLogs(e.target.value)} 
                placeholder="Paste the signal stream... Slack threads, Discord logs, Email chains." 
                className="w-full h-[320px] bg-[#050505] backdrop-blur-3xl rounded-[calc(3rem-1px)] p-10 md:p-12 outline-none text-xl md:text-2xl font-light placeholder-gray-800 resize-none transition-all group-hover:bg-[#080808]" 
              />
            </div>
            <div className="absolute bottom-10 right-10">
              <button 
                onClick={handleAnalyze} 
                disabled={loading || !logs} 
                className={`flex items-center gap-2 px-10 py-5 rounded-2xl font-black transition-all transform active:scale-95 uppercase tracking-[0.2em] text-[9px] shadow-2xl ${loading || !logs ? 'bg-gray-950 text-gray-800' : 'bg-[#f4d35e] text-black shadow-[0_0_30px_rgba(244,211,94,0.3)]'}`}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><ChevronRight size={14} /> LIQUIDATE (2 CR)</>}
              </button>
            </div>
          </div>
        </section>

        <AnimatePresence mode='wait'>
          {result && !loading && (
            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-8 mb-32">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResultCard icon={<Waves className="text-[#f4d35e]" />} title="SIGNAL PULSE" content={result.pulse} delay={0} extra={<LiquidityEngine pulse={result.pulse} hoverImpact={hoveredImpact} />} />
                <ResultCard icon={<AlertTriangle className="text-red-500" />} title="FRICTION BLOCKERS" blockers={result.blockers} delay={0.1} onItemHover={(impact) => setHoveredImpact(impact)} />
              </div>
              <ResultCard icon={<CheckCircle2 className="text-green-500" />} title="LIQUIDATION PLAN" items={result.actionItems} delay={0.2} grid />
            </motion.section>
          )}
        </AnimatePresence>

        <section id="pricing" className="pt-24 border-t border-[#00555a]/10">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-grotesk font-black uppercase tracking-tighter text-white mb-2">RECHARGE NODE</h3>
            <p className="text-gray-500 font-light">Acquire liquid credits to continue synthesis. Syncs across executive accounts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            <PricingCard title="Tactical Pack" price="$19" link="https://buy.stripe.com/cNi6oI05abPU4rU4oKefC00" user={user} onAuthNeeded={() => setShowAuthModal(true)} />
            <PricingCard title="Executive Node" price="$49" link="https://buy.stripe.com/14A14obNSbPU9MeaN8efC02" user={user} isPro onAuthNeeded={() => setShowAuthModal(true)} />
          </div>
        </section>
      </main>

      <footer className="mt-32 border-t border-[#00555a]/10 pt-24 pb-16 px-8 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center gap-4 mb-16">
            <GeometricLogo className="w-16 h-16" />
            <h2 className="text-3xl font-grotesk font-black tracking-tighter uppercase text-white">ZEITGEIST</h2>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#f4d35e] to-transparent opacity-50" />
          </div>
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-4 px-8 py-4 bg-[#001a1a]/40 border border-[#00555a]/20 rounded-2xl max-w-xl text-center">
              <ShieldCheck className="text-[#f4d35e] shrink-0" size={20} />
              <p className="text-[11px] text-gray-500 font-light leading-relaxed"><strong className="text-gray-300 italic">Zero-Retention Policy:</strong> Signal streams are ephemeral, processed in volatile memory and purged upon synthesis completion. We liquidate debt without building surveillance.</p>
            </div>
            <p className="text-gray-800 text-[9px] uppercase tracking-[0.5em] font-black mt-8">&copy; 2026 ZEITGEIST LABORATORIES. POWERED BY GEMINI NEURAL ARCHITECTURE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;