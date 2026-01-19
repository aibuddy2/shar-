
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, User, LogIn, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';

interface AuthViewProps {
  onBack?: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const translateError = (msg: string) => {
    if (msg.includes('Invalid login credentials')) return 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။';
    if (msg.includes('User already registered')) return 'ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည်။';
    return 'မှားယွင်းမှုတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ အီးမေးလ်စစ်ဆေးပေးပါ။");
      }
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8 animate-in">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-blue-600 transition-colors font-bold text-sm mb-4"
          >
            <ArrowLeft size={18} />
            <span>ကျော်သွားမည်</span>
          </button>
        )}

        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-blue-600 rounded-[35px] flex items-center justify-center text-white text-5xl font-bold mx-auto shadow-xl shadow-blue-200 mb-4">
            ရှာ
          </div>
          <h1 className="text-3xl font-bold text-slate-800">ရှာ (Shar)</h1>
          <p className="text-slate-500">ရှာဖွေမှုတိုင်းအတွက် အကောင်းဆုံးအကူအညီ</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 space-y-5">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {isLogin ? 'အကောင့်ဝင်ရန်' : 'အကောင့်သစ်ဖွင့်ရန်'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-xs flex items-center space-x-2 border border-red-100 animate-pulse">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder="အီးမေးလ်"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="စကားဝှက်"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
              <>
                <span>{isLogin ? 'ဝင်မည်' : 'ဖွင့်မည်'}</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-400 hover:text-blue-600 font-bold transition-colors"
            >
              {isLogin ? "အကောင့်မရှိသေးပါက ဤနေရာတွင် ဖွင့်ပါ" : "အကောင့်ရှိပြီးသားဆိုပါက ဝင်ရောက်ပါ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthView;
