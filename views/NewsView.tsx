
import React, { useState, useEffect } from 'react';
import { Newspaper, Bell, Clock, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabase';
import { DailyUpdate, Alert } from '../types';

const NewsView: React.FC = () => {
  const [news, setNews] = useState<DailyUpdate[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [newsRes, alertsRes] = await Promise.all([
        supabase.from('daily_updates').select('*').order('created_at', { ascending: false }),
        supabase.from('alerts').select('*').order('created_at', { ascending: false })
      ]);

      if (newsRes.data) setNews(newsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
    } catch (err) {
      console.error("News fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">နေ့စဉ်သတင်းများ</h2>
        {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
      </div>

      {/* Alerts Section First */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-widest px-1">အရေးပေါ် သတိပေးချက်များ</h3>
          {alerts.map(item => (
            <div key={item.id} className="bg-red-50 border border-red-100 rounded-[30px] p-5 space-y-2 animate-in">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-red-600">
                  <Bell size={16} />
                  <span className="text-[10px] font-bold uppercase">{item.priority} Priority</span>
                </div>
                <span className="text-[10px] text-red-400 font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-red-800 leading-tight">{item.title}</h4>
              <p className="text-xs text-red-700 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* News Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest px-1">နောက်ဆုံးရ သတင်းများ</h3>
        {news.map(item => (
          <div key={item.id} className="bg-white rounded-[35px] overflow-hidden shadow-sm border border-slate-100 group animate-in">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter bg-blue-100 text-blue-600">
                  သတင်း
                </span>
                <div className="flex items-center text-[10px] text-slate-400">
                  <Clock size={12} className="mr-1" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {item.content}
              </p>
              <button className="flex items-center text-xs font-bold text-blue-600 space-x-1 pt-2">
                <span>အသေးစိတ်ဖတ်ရန်</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {!loading && news.length === 0 && alerts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <Newspaper size={32} className="mx-auto mb-2 text-slate-200" />
            <p className="text-sm text-slate-300 font-bold">သတင်းများ မရှိသေးပါ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsView;
