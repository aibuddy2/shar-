
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Newspaper, BookOpen, Save, X, AlertCircle, RefreshCw, CheckCircle2, Terminal, Bell, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabase.ts';
import { Agent, DailyUpdate, KnowledgeItem, Alert } from '../types.ts';

interface AdminDashboardViewProps {
  onClose: () => void;
}

type CMSTab = 'agents' | 'news' | 'alerts' | 'knowledge' | 'setup';

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<CMSTab>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [news, setNews] = useState<DailyUpdate[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [agentForm, setAgentForm] = useState({ 
    name: '', category: 'VISA' as const, specialty: '', location: '', trust_score: 95, 
    description: '', phone: '', line_id: '', is_verified: true 
  });
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image_url: '' });
  const [alertForm, setAlertForm] = useState({ title: '', description: '', priority: 'medium' as const });
  const [knowledgeForm, setKnowledgeForm] = useState({ title: '', content: '', category: 'General' });

  useEffect(() => {
    if (activeTab !== 'setup') fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'agents') res = await supabase.from('agents').select('*').order('name');
      else if (activeTab === 'news') res = await supabase.from('daily_updates').select('*').order('created_at', { ascending: false });
      else if (activeTab === 'alerts') res = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
      else if (activeTab === 'knowledge') res = await supabase.from('knowledge_items').select('*').order('created_at', { ascending: false });
      
      if (res?.error) throw res.error;
      if (activeTab === 'agents') setAgents(res?.data || []);
      else if (activeTab === 'news') setNews(res?.data || []);
      else if (activeTab === 'alerts') setAlerts(res?.data || []);
      else if (activeTab === 'knowledge') setKnowledge(res?.data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    
    try {
      let payload: any = {};
      let table = '';
      const currentDate = new Date().toISOString();

      if (activeTab === 'agents') {
        table = 'agents';
        payload = { ...agentForm, trust_score: Number(agentForm.trust_score) || 0 };
      } else if (activeTab === 'news') {
        table = 'daily_updates';
        payload = { 
          title: newsForm.title, 
          content: newsForm.content, 
          image_url: newsForm.image_url || '', 
          date: currentDate 
        };
      } else if (activeTab === 'alerts') {
        table = 'alerts';
        payload = { 
          title: alertForm.title, 
          description: alertForm.description, 
          priority: alertForm.priority, 
          date: currentDate 
        };
      } else if (activeTab === 'knowledge') {
        table = 'knowledge_items';
        payload = { ...knowledgeForm };
      }

      const { error } = await supabase.from(table).insert([payload]);
      if (error) throw error;

      setSuccessMsg('သိမ်းဆည်းပြီးပါပြီ။');
      setIsAdding(false);
      await fetchData();
      
      setAgentForm({ name: '', category: 'VISA', specialty: '', location: '', trust_score: 95, description: '', phone: '', line_id: '', is_verified: true });
      setNewsForm({ title: '', content: '', image_url: '' });
      setAlertForm({ title: '', description: '', priority: 'medium' });
      setKnowledgeForm({ title: '', content: '', category: 'General' });
      
    } catch (err: any) {
      alert(`Save Failed: ${err.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('ဖျက်ရန် သေချာပါသလား?')) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from(table).delete().eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) alert("Delete Failed: Possible RLS Policy restriction.");
      else {
        setSuccessMsg('ဖျက်ပြီးပါပြီ။');
        setTimeout(() => setSuccessMsg(''), 2000);
        await fetchData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const sqlSetup = `-- RUN THIS IN SUPABASE SQL EDITOR
CREATE POLICY "Public Full Access" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON daily_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON knowledge_items FOR ALL USING (true) WITH CHECK (true);`;

  return (
    <div className="px-6 py-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin CMS</h2>
          <p className="text-xs text-slate-400">Content Management</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => fetchData()} className="p-3 bg-white border text-slate-400 rounded-2xl">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsAdding(!isAdding)} className={`p-3 rounded-2xl transition-all ${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg'}`}>
            {isAdding ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center space-x-2 border border-emerald-100 animate-in">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'agents', label: 'အေးဂျင့်', icon: Users },
          { id: 'news', label: 'သတင်း', icon: Newspaper },
          { id: 'alerts', label: 'သတိပေးချက်', icon: Bell },
          { id: 'knowledge', label: 'ဗဟုသုတ', icon: BookOpen },
          { id: 'setup', label: 'Setup', icon: Terminal }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as CMSTab); setIsAdding(false); }}
            className={`min-w-[100px] flex flex-col items-center py-3 rounded-2xl font-bold transition-all ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-[10px] mt-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'setup' ? (
        <div className="bg-slate-900 p-6 rounded-[35px] text-slate-300 space-y-4">
          <h3 className="font-bold text-amber-400 flex items-center gap-2"><AlertTriangle size={18}/> SQL Setup</h3>
          <textarea readOnly value={sqlSetup} className="w-full h-32 bg-black/40 p-3 rounded-xl text-[9px] font-mono text-emerald-400 border border-white/5" />
          <button onClick={() => { navigator.clipboard.writeText(sqlSetup); alert('SQL Copied!'); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Copy SQL</button>
        </div>
      ) : isAdding ? (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-[35px] shadow-xl border border-blue-100 space-y-4">
          <h3 className="font-bold text-slate-800 uppercase text-xs">Add {activeTab}</h3>
          {/* Form fields based on tab - simplified for update */}
          {activeTab === 'agents' && <input type="text" placeholder="အမည် *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" required value={agentForm.name} onChange={e => setAgentForm({...agentForm, name: e.target.value})} />}
          {activeTab === 'news' && <input type="text" placeholder="ခေါင်းစဉ် *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm" required value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Save</button>
        </form>
      ) : (
        <div className="space-y-3 pb-32">
          {activeTab === 'agents' && agents.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between">
              <span className="font-bold text-sm">{item.name}</span>
              <button onClick={() => handleDelete('agents', item.id)} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
          {activeTab === 'news' && news.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between">
              <span className="font-bold text-sm">{item.title}</span>
              <button onClick={() => handleDelete('daily_updates', item.id)} className="p-3 text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
