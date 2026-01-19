
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Newspaper, BookOpen, Save, X, AlertCircle, RefreshCw, CheckCircle2, Terminal, Bell, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabase';
import { Agent, DailyUpdate, KnowledgeItem, Alert } from '../types';

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
      console.log(`CMS: Fetching data for ${activeTab}...`);
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

      console.log(`CMS: Attempting insert into ${table}...`, payload);
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
      console.error("Insert Failed:", err);
      alert(`Save Failed: ${err.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!id) {
      alert("Error: Missing ID for deletion");
      return;
    }
    
    if (!confirm('ဖျက်ရန် သေချာပါသလား?')) return;
    
    setLoading(true);
    try {
      console.log(`CMS: Requesting DELETE for table: ${table}, ID: ${id}`);
      
      // Use .select() to verify if the row was actually returned (deleted)
      const { data, error, status } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      // Supabase returns an empty array if the delete was blocked by RLS or if the row didn't exist
      if (!data || data.length === 0) {
        console.warn("CMS: Delete operation returned success but NO rows were affected. This is likely an RLS Policy issue.");
        alert("ဖျက်၍မရပါ (Delete Failed).\n\nအကြောင်းရင်း: Supabase RLS Policy က ခွင့်မပြုပါ။ Database permissions (Setup tab) ကို ပြန်စစ်ပေးပါ။");
      } else {
        console.log(`CMS: Successfully deleted row from ${table}`, data);
        setSuccessMsg('ဖျက်ပြီးပါပြီ။');
        setTimeout(() => setSuccessMsg(''), 2000);
        await fetchData();
      }
      
    } catch (err: any) {
      console.error("Delete Exception:", err);
      alert(`Error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const sqlSetup = `-- 1. RESET PERMISSIONS & POLICIES
-- Run this script to fix ALL save/delete issues instantly.

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access" ON agents;
DROP POLICY IF EXISTS "Public Full Access" ON daily_updates;
DROP POLICY IF EXISTS "Public Full Access" ON alerts;
DROP POLICY IF EXISTS "Public Full Access" ON knowledge_items;

CREATE POLICY "Public Full Access" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON daily_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON knowledge_items FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;`;

  return (
    <div className="px-6 py-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin CMS</h2>
          <p className="text-xs text-slate-400">Content Management</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => fetchData()} className="p-3 bg-white border text-slate-400 rounded-2xl active:rotate-180 transition-transform">
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

      {/* Tabs */}
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
        <div className="bg-slate-900 p-6 rounded-[35px] text-slate-300 space-y-4 animate-in">
          <h3 className="font-bold text-amber-400 flex items-center gap-2"><AlertTriangle size={18}/> Fix Deletion Permission</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            If you click delete and nothing happens, it's because Supabase is blocking the request. 
            Copy the script below, go to your <b>Supabase Dashboard > SQL Editor</b>, paste it, and click <b>Run</b>.
          </p>
          <textarea 
            readOnly 
            value={sqlSetup}
            className="w-full h-48 bg-black/40 p-3 rounded-xl text-[9px] font-mono text-emerald-400 border border-white/5 resize-none"
          />
          <button 
            onClick={() => { navigator.clipboard.writeText(sqlSetup); alert('SQL Copied!'); }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Copy SQL Script
          </button>
        </div>
      ) : isAdding ? (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-[35px] shadow-xl border border-blue-100 space-y-4 animate-in">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Add {activeTab}</h3>
          
          {activeTab === 'agents' && (
            <div className="space-y-3">
              <input type="text" placeholder="အမည် *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" required value={agentForm.name} onChange={e => setAgentForm({...agentForm, name: e.target.value})} />
              <select className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" value={agentForm.category} onChange={e => setAgentForm({...agentForm, category: e.target.value as any})}>
                <option value="VISA">VISA</option>
                <option value="HOUSING">HOUSING</option>
              </select>
              <input type="text" placeholder="Location" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" value={agentForm.location} onChange={e => setAgentForm({...agentForm, location: e.target.value})} />
              <input type="text" placeholder="Phone" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" value={agentForm.phone} onChange={e => setAgentForm({...agentForm, phone: e.target.value})} />
              <textarea placeholder="Description" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none h-20" value={agentForm.description} onChange={e => setAgentForm({...agentForm, description: e.target.value})} />
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-3">
              <input type="text" placeholder="ခေါင်းစဉ် *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" required value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />
              <textarea placeholder="သတင်းအကြောင်းအရာ *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none h-32" required value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} />
              <input type="text" placeholder="ပုံ (Image URL)" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" value={newsForm.image_url} onChange={e => setNewsForm({...newsForm, image_url: e.target.value})} />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <input type="text" placeholder="ခေါင်းစဉ် *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" required value={alertForm.title} onChange={e => setAlertForm({...alertForm, title: e.target.value})} />
              <select className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" value={alertForm.priority} onChange={e => setAlertForm({...alertForm, priority: e.target.value as any})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <textarea placeholder="ဖော်ပြချက် *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none h-32" required value={alertForm.description} onChange={e => setAlertForm({...alertForm, description: e.target.value})} />
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-3">
              <input type="text" placeholder="ခေါင်းစဉ် *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" required value={knowledgeForm.title} onChange={e => setKnowledgeForm({...knowledgeForm, title: e.target.value})} />
              <input type="text" placeholder="Category" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none" value={knowledgeForm.category} onChange={e => setKnowledgeForm({...knowledgeForm, category: e.target.value})} />
              <textarea placeholder="အကြောင်းအရာ *" className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border-none h-32" required value={knowledgeForm.content} onChange={e => setKnowledgeForm({...knowledgeForm, content: e.target.value})} />
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} /><span>သိမ်းဆည်းမည်</span></>}
          </button>
        </form>
      ) : (
        <div className="space-y-3 pb-32">
          {activeTab === 'agents' && agents.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between animate-in">
              <div className="flex-1 overflow-hidden pr-2">
                <p className="font-bold text-sm truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{item.category}</p>
              </div>
              <button onClick={() => handleDelete('agents', item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {activeTab === 'news' && news.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between animate-in">
              <div className="flex-1 overflow-hidden pr-2">
                <p className="font-bold text-sm truncate">{item.title}</p>
                <p className="text-[10px] text-slate-400">News • {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete('daily_updates', item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {activeTab === 'alerts' && alerts.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between animate-in">
              <div className="flex-1 overflow-hidden pr-2">
                <p className="font-bold text-sm truncate">{item.title}</p>
                <p className={`text-[10px] font-bold uppercase ${item.priority === 'high' ? 'text-red-500' : 'text-slate-400'}`}>{item.priority}</p>
              </div>
              <button onClick={() => handleDelete('alerts', item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {activeTab === 'knowledge' && knowledge.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between animate-in">
              <div className="flex-1 overflow-hidden pr-2">
                <p className="font-bold text-sm truncate">{item.title}</p>
                <p className="text-[10px] text-slate-400">{item.category}</p>
              </div>
              <button onClick={() => handleDelete('knowledge_items', item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {!loading && (
            (activeTab === 'agents' && agents.length === 0) ||
            (activeTab === 'news' && news.length === 0) ||
            (activeTab === 'alerts' && alerts.length === 0) ||
            (activeTab === 'knowledge' && knowledge.length === 0)
          ) && (
            <div className="text-center py-20 opacity-40">
              <AlertCircle size={48} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold">No Data Found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
