
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, MapPin, Phone, MessageCircle, Lock, Crown, Loader2, X, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabase.ts';
import { Agent, Profile } from '../types.ts';

interface AgentsViewProps {
  profile: Profile | null;
  onUpdateProfile: () => void;
}

const AgentsView: React.FC<AgentsViewProps> = ({ profile, onUpdateProfile }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'VISA' | 'HOUSING'>('ALL');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*');
      if (data) setAgents(data);
    } catch (err) {
      console.error("Agents fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = filter === 'ALL' ? agents : agents.filter(a => a.category === filter);

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

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">အေးဂျင့်များ</h2>
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl">
          {(['ALL', 'VISA', 'HOUSING'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                filter === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {cat === 'ALL' ? 'အားလုံး' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="text-blue-600 animate-spin" size={40} />
          <p className="text-slate-400 text-sm font-bold">ရှာဖွေနေပါသည်...</p>
        </div>
      )}

      {!loading && !profile?.has_survival_pack && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-[30px] p-6 text-white shadow-lg space-y-3 relative overflow-hidden animate-in">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Crown size={120} />
          </div>
          <div className="flex items-center space-x-2">
            <Crown size={24} />
            <h3 className="font-bold text-lg">Pro Plan (Survival Pack)</h3>
          </div>
          <p className="text-xs text-amber-50 leading-relaxed">ဆက်သွယ်ရန်ဖုန်းနံပါတ်များနှင့် Line ID များကို ကြည့်ရှုနိုင်ရန် Pro Plan လိုအပ်ပါသည်။</p>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-white text-orange-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-amber-50 transition-all active:scale-95 shadow-md relative z-10"
          >
            30 THB / 7 ရက် (ဝယ်ယူမည်)
          </button>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
              <ShieldCheck size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400 font-bold">အေးဂျင့်များ မရှိသေးပါ</p>
            </div>
          ) : (
            filteredAgents.map(agent => (
              <div key={agent.id} className="bg-white p-5 rounded-[35px] shadow-sm border border-slate-100 space-y-4 animate-in">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{agent.name}</h4>
                      <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {agent.category} • <MapPin size={10} className="mx-1" /> {agent.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-bold">{agent.trust_score}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl">
                  {agent.description}
                </p>

                <div className="flex space-x-2 pt-2">
                  {profile?.has_survival_pack ? (
                    <>
                      <a href={`tel:${agent.phone}`} className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200">
                        <Phone size={16} />
                        <span>ဖုန်းဆက်ရန်</span>
                      </a>
                      <button 
                        onClick={() => agent.line_id && alert(`Line ID: ${agent.line_id}`)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200"
                      >
                        <MessageCircle size={16} />
                        <span>Line ID</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-200 text-slate-500 py-3 rounded-2xl font-bold text-sm"
                    >
                      <Lock size={16} />
                      <span>ဆက်သွယ်ရန်သော့ခတ်ထားသည်</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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

export default AgentsView;
