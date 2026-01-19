
import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Scale, Home, Info, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { KnowledgeItem } from '../types';

const KnowledgeView: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setItems(data);
    } catch (err) {
      console.error("Knowledge fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('visa') || cat.includes('mou')) return FileText;
    if (cat.includes('right') || cat.includes('law')) return Scale;
    if (cat.includes('house') || cat.includes('rent')) return Home;
    return Info;
  };

  const getColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('visa') || cat.includes('mou')) return 'bg-blue-500';
    if (cat.includes('right') || cat.includes('law')) return 'bg-emerald-500';
    if (cat.includes('house') || cat.includes('rent')) return 'bg-orange-500';
    return 'bg-indigo-500';
  };

  if (selectedItem) {
    return (
      <div className="px-6 py-6 space-y-6 animate-in">
        <button 
          onClick={() => setSelectedItem(null)}
          className="text-blue-600 font-bold text-sm flex items-center space-x-1"
        >
          <ChevronRight size={18} className="rotate-180" />
          <span>နောက်သို့</span>
        </button>
        
        <div className="space-y-4">
          <div className={`w-16 h-16 ${getColor(selectedItem.category)} rounded-[25px] flex items-center justify-center text-white shadow-lg`}>
            {React.createElement(getIcon(selectedItem.category), { size: 32 })}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">{selectedItem.title}</h2>
          <div className="bg-slate-100 px-3 py-1 rounded-full inline-block text-[10px] font-bold text-slate-500 uppercase">
            {selectedItem.category}
          </div>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {selectedItem.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">ဗဟုသုတများ</h2>
        {loading && <Loader2 size={20} className="text-blue-500 animate-spin" />}
      </div>

      {!loading && items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm text-slate-400 font-bold">ဆောင်းပါးများ မရှိသေးပါ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => {
            const Icon = getIcon(item.category);
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white p-5 rounded-[35px] shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer animate-in"
              >
                <div className={`w-14 h-14 ${getColor(item.category)} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-slate-800 truncate">{item.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.category}</p>
                </div>
                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shrink-0">
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-[40px] border border-blue-100 mt-8">
        <h4 className="font-bold text-blue-800 mb-2">သိမှတ်ဖွယ်ရာ</h4>
        <p className="text-xs text-blue-700 leading-relaxed">
          ထိုင်းနိုင်ငံရှိ မြန်မာအလုပ်သမားများ သိထားသင့်သည့် ဥပဒေများနှင့် နေ့စဉ်လူနေမှုဘဝအတွက် လိုအပ်သော အချက်အလက်များကို ဤနေရာတွင် စုစည်းတင်ပြထားပါသည်။
        </p>
      </div>
    </div>
  );
};

export default KnowledgeView;
