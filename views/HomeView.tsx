
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Search, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Crown, 
  Zap, 
  CheckCircle2, 
  Copy, 
  X,
  Clock,
  Info,
  LogIn
} from 'lucide-react';
import { CurrencyRates, Profile } from '../types';
import { askShaAI } from '../geminiService';
import { supabase } from '../supabase';

interface HomeViewProps {
  profile: Profile | null;
  onAdminClick: () => void;
  onUpdateProfile: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ profile, onAdminClick, onUpdateProfile }) => {
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    fetch('https://myanmar-currency-api.github.io/api/latest.json')
      .then(res => res.json())
      .then(data => setRates(data))
      .catch(err => console.error("Rates fetch error", err));
  }, []);

  const getChatLimit = () => {
    return profile?.has_survival_pack ? 20 : 5;
  };

  const checkAndIncrementChat = async () => {
    if (!profile) return { allowed: false, count: 0, reason: 'login_required' };

    const today = new Date().toISOString().split('T')[0];
    const maxChats = getChatLimit();

    let currentCount = profile.daily_chat_count || 0;
    const lastReset = profile.last_chat_reset || '';

    if (lastReset !== today) {
      currentCount = 0;
    }

    if (currentCount >= maxChats) {
      return { allowed: false, count: currentCount, reason: 'limit_reached' };
    }

    const newCount = currentCount + 1;
    await supabase
      .from('profiles')
      .update({ daily_chat_count: newCount, last_chat_reset: today })
      .eq('id', profile.id);
    
    onUpdateProfile();
    return { allowed: true, count: newCount };
  };

  const handleAiAsk = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAsking(true);
    setAiResponse('');

    const chatCheck = await checkAndIncrementChat();

    if (!chatCheck.allowed) {
      if (chatCheck.reason === 'login_required') {
        setAiResponse("⚠️ AI အား မေးမြန်းရန် အရင်ဆုံး အကောင့်ဝင်ပေးပါ။");
      } else {
        const limit = getChatLimit();
        setAiResponse(`⚠️ ယနေ့အတွက် AI မေးခွန်းကန့်သတ်ချက် (${limit} ကြိမ်) ပြည့်သွားပါပြီ။ ${!profile?.has_survival_pack ? 'Survival Pack ဝယ်ယူပြီး တစ်ရက်လျှင် အကြိမ် ၂၀ အထိ မေးမြန်းနိုင်ပါသည်။' : 'မနက်ဖြန်မှ ပြန်လည်မေးမြန်းနိုင်ပါမည်။'}`);
      }
      setIsAsking(false);
      return;
    }

    const answer = await askShaAI(aiPrompt);
    setAiResponse(answer || '');
    setIsAsking(false);
    setAiPrompt('');
  };

  const handleBuyClick = () => {
    if (!profile) {
      alert("Pro Plan ဝယ်ယူရန် အရင်ဆုံး အကောင့်ဝင်ပေးပါ။");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!profile?.id) return;
    setIsPurchasing(true);
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_survival_pack: true, survival_pack_expiry: expiryDate.toISOString() })
        .eq('id', profile.id);
      
      if (!error) {
        setShowPaymentModal(false);
        alert("Pro Plan (7 Days) ကို စတင်အသုံးပြုနိုင်ပါပြီ။");
        onUpdateProfile();
      }
    } catch (err) {
      alert("Error activating plan.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const thbData = rates?.data?.find(c => c.currency === 'THB');
  const thbToMmk = thbData ? thbData.buy : '...';

  const remainingChatsCount = () => {
    if (!profile) return 0;
    const today = new Date().toISOString().split('T')[0];
    const limit = getChatLimit();
    const count = profile.last_chat_reset === today ? profile.daily_chat_count : 0;
    return Math.max(0, limit - count);
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Greetings */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">မင်္ဂလာပါ 👋</h2>
          <p className="text-slate-500 text-sm">ထိုင်းရောက် မြန်မာလုပ်သားများအတွက်</p>
        </div>
        <div className="flex items-center space-x-2">
          {profile?.has_survival_pack && (
            <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-amber-200 flex items-center space-x-1">
              <Crown size={12} />
              <span>PRO PLAN</span>
            </div>
          )}
          {profile?.role === 'admin' && (
            <button 
              onClick={onAdminClick}
              className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-[10px] font-bold border border-blue-100 animate-pulse"
            >
              <ShieldCheck size={14} />
              <span>ADMIN CMS</span>
            </button>
          )}
        </div>
      </div>

      {/* Currency Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-6 text-white shadow-xl relative overflow-hidden animate-in">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Live Rates (THB/MMK)</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <h3 className="text-4xl font-bold">1 THB</h3>
            <span className="text-blue-200 text-2xl">≈</span>
            <h3 className="text-4xl font-bold text-yellow-300">{thbToMmk} MMK</h3>
          </div>
          <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-tight">
            Update: {rates?.timestamp || 'Fetching...'}
          </p>
        </div>
      </div>

      {/* Survival Pack Status Section */}
      <div className={`rounded-[40px] p-6 shadow-sm border animate-in [animation-delay:0.05s] ${
        profile?.has_survival_pack 
        ? 'bg-amber-50 border-amber-100' 
        : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              profile?.has_survival_pack ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              <Crown size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Survival Pack (Pro)</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                {profile?.has_survival_pack ? 'သင့်အကောင့်သည် Pro ဖြစ်ပါသည်' : 'ဝန်ဆောင်မှုအသစ်များ ရယူရန်'}
              </p>
            </div>
          </div>
          {profile?.has_survival_pack && (
            <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
              <CheckCircle2 size={12} />
              <span className="text-[10px] font-bold">ACTIVE</span>
            </div>
          )}
        </div>

        {profile?.has_survival_pack ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-[11px] text-amber-800">
              <Clock size={14} />
              <span>သက်တမ်းကုန်ဆုံးရက်: <strong>{profile.survival_pack_expiry ? new Date(profile.survival_pack_expiry).toLocaleDateString() : '-'}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/60 p-3 rounded-2xl border border-amber-100 flex items-center space-x-2">
                <Zap size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold">Agent Contacts</span>
              </div>
              <div className="bg-white/60 p-3 rounded-2xl border border-amber-100 flex items-center space-x-2">
                <Zap size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold">Line ID Access</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              အေးဂျင့်များ၏ ဖုန်းနံပါတ်၊ Line ID နှင့် အခြား အချက်အလက်များကို အကန့်အသတ်မရှိ ကြည့်ရှုနိုင်ပါမည်။
            </p>
            <button 
              onClick={handleBuyClick}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-amber-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Crown size={16} />
              <span>ယခုဝယ်ယူမည် (30 THB)</span>
            </button>
          </div>
        )}
      </div>

      {/* AI Assistant Section */}
      <div className={`bg-white rounded-[40px] p-6 shadow-sm border border-slate-100 space-y-4 animate-in [animation-delay:0.1s] ${!profile ? 'opacity-80 grayscale-[0.5]' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-600">
            <Sparkles size={18} />
            <h3 className="font-bold text-sm">Shar AI (AI အကူအညီ)</h3>
          </div>
          {profile ? (
            <div className="flex items-center space-x-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <MessageSquare size={10} />
              <span>ယနေ့ကျန်ရှိမှု: {remainingChatsCount()} ကြိမ်</span>
            </div>
          ) : (
            <div className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 flex items-center space-x-1">
              <LogIn size={10} />
              <span>LOGIN REQUIRED</span>
            </div>
          )}
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder={profile ? "ဥပဒေ သို့မဟုတ် အထွေထွေ မေးမြန်းရန်..." : "မေးမြန်းရန် အရင်ဆုံး အကောင့်ဝင်ပါ..."}
            className={`w-full bg-slate-50 border-none rounded-2xl px-4 py-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 transition-all ${!profile ? 'cursor-not-allowed opacity-50' : ''}`}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAiAsk()}
            disabled={!profile}
          />
          <button 
            disabled={isAsking || !profile}
            onClick={handleAiAsk}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {isAsking ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={18} />}
          </button>
        </div>

        {!profile && (
          <div className="bg-blue-50/50 p-4 rounded-2xl text-center border border-blue-100/50 animate-pulse">
            <p className="text-[11px] font-bold text-blue-800">
              AI အကူအညီရယူရန် အခမဲ့အကောင့် ဖွင့်ပါ။
            </p>
          </div>
        )}

        {profile && !profile?.has_survival_pack && remainingChatsCount() <= 1 && (
          <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-700 leading-tight">
            <Info size={14} className="shrink-0" />
            <p>မေးခွန်းကန့်သတ်ချက် ပြည့်တော့မည်ဖြစ်၍ Survival Pack ဝယ်ယူပြီး ၂၀ ကြိမ်အထိ တိုးမြှင့်လိုက်ပါ။</p>
          </div>
        )}

        {aiResponse && (
          <div className="bg-blue-50 rounded-2xl p-4 text-sm text-slate-700 animate-in leading-relaxed border border-blue-100">
            {aiResponse}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative animate-in overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white text-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Crown size={24} />
              </div>
              <h3 className="text-xl font-bold">Pro Plan ဝယ်ယူရန်</h3>
              <p className="text-xs text-amber-50">အောက်ပါ ဖုန်းနံပါတ်များသို့ ငွေလွှဲပေးပါ။</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#ff6b00] rounded-lg flex items-center justify-center text-white text-[10px] font-black">KP</div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">KPay / Wave</p>
                      <p className="text-sm font-bold text-slate-700">09 777 888 999</p>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard('09777888999')} className="p-2 text-slate-400 active:text-blue-600">
                    {copiedText === '09777888999' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">TH</div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">PromptPay (Thai)</p>
                      <p className="text-sm font-bold text-slate-700">088 123 4567</p>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard('0881234567')} className="p-2 text-slate-400 active:text-blue-600">
                    {copiedText === '0881234567' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl text-[11px] text-amber-800 leading-relaxed border border-amber-100">
                <strong>မှတ်ချက်:</strong> ငွေလွှဲပြီးလျှင် အောက်ပါခလုတ်ကို နှိပ်ပါ။ စစ်ဆေးပြီးပါက ဝန်ဆောင်မှုကိုချက်ချင်း ရရှိမည်ဖြစ်ပါသည်။
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-4 text-slate-400 font-bold text-sm"
                >
                  မလုပ်တော့ပါ
                </button>
                <button 
                  onClick={handleConfirmPayment}
                  disabled={isPurchasing}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isPurchasing ? "ခေတ္တစောင့်ပါ..." : "ငွေလွှဲပြီးပါပြီ (Confirm)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
