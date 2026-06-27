'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { Lead, STAGES, LeadStage } from '@/lib/types';
import KanbanBoard from './KanbanBoard';
import LeadTable from './LeadTable';
import { isAfter, subDays, parseISO } from 'date-fns';
import * as xlsx from 'xlsx';
import { Search } from 'lucide-react';

export default function Dashboard() {
  const { user, token, signOut } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLeads();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [token]);

  const fetchLeads = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    
    const formData = new FormData(e.currentTarget);
    const leadData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      notes: formData.get('notes'),
      stage: 'Novo Lead',
    };

    // Optimistic UI
    const tempId = Date.now();
    const tempLead = { ...leadData, id: tempId, userId: 0, createdAt: new Date().toISOString(), stage: 'Novo Lead' as LeadStage };
    setLeads([tempLead, ...leads]);
    setIsAdding(false);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(leadData)
      });
      if (res.ok) {
        const { lead } = await res.json();
        setLeads(prev => prev.map(l => l.id === tempId ? lead : l));
      } else {
        setLeads(prev => prev.filter(l => l.id !== tempId));
      }
    } catch (err) {
      console.error(err);
      setLeads(prev => prev.filter(l => l.id !== tempId));
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!token || !confirm('Excluir este lead?')) return;
    const previous = [...leads];
    setLeads(leads.filter(l => l.id !== id));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) setLeads(previous);
    } catch (e) {
      setLeads(previous);
    }
  };

  const updateLeadStage = async (id: number, stage: LeadStage) => {
    if (!token) return;
    const previous = [...leads];
    setLeads(leads.map(l => l.id === id ? { ...l, stage } : l));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stage })
      });
      if (!res.ok) setLeads(previous);
    } catch (e) {
      setLeads(previous);
    }
  };

  const updateLead = async (id: number, field: string, value: string) => {
    if (!token) return;
    const previous = [...leads];
    setLeads(leads.map(l => l.id === id ? { ...l, [field]: value } : l));
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) setLeads(previous);
    } catch (e) {
      setLeads(previous);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.phone && l.phone.includes(search))
  );

  const thirtyDaysAgo = subDays(new Date(), 30);
  const leadsWon30d = leads.filter(l => l.stage === 'Ganho' && isAfter(parseISO(l.createdAt), thirtyDaysAgo)).length;
  const leadsLost30d = leads.filter(l => l.stage === 'Perdido' && isAfter(parseISO(l.createdAt), thirtyDaysAgo)).length;
  const winRate = leadsWon30d + leadsLost30d > 0 ? Math.round((leadsWon30d / (leadsWon30d + leadsLost30d)) * 100) : 0;

  const exportExcel = () => {
    const ws = xlsx.utils.json_to_sheet(filteredLeads.map(l => ({
      Nome: l.name, Email: l.email, Telefone: l.phone || '', Etapa: l.stage,
      Criado: new Date(l.createdAt).toLocaleString()
    })));
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Leads");
    xlsx.writeFile(wb, "leads.xlsx");
  };

  if (loading) return <div className="flex-1 flex items-center justify-center bg-[#001F3F] text-white">Carregando...</div>;

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden bg-[#001F3F] font-sans text-white">
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-6 flex-shrink-0 border-b border-blue-900/50 bg-[#001F3F]/80 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF8C00] rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-orange-900/50">E</div>
            <span className="font-extrabold text-xl tracking-tight">Elo Imob</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FF8C00] transition-colors" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Busca global... (Cmd+K)" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#001224] text-sm text-white placeholder-slate-500 rounded-full pl-10 pr-4 py-2 w-72 border border-blue-900/50 focus:outline-none focus:border-[#FF8C00] focus:ring-1 focus:ring-[#FF8C00] transition-all"
            />
          </div>
          <button onClick={signOut} className="w-9 h-9 bg-blue-900 rounded-full border border-blue-700 flex items-center justify-center text-white text-sm font-bold hover:bg-blue-800 transition-colors">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>
        </div>
      </header>

      {/* DASHBOARD PULSE */}
      <section className="px-6 pt-8 pb-4 flex items-end justify-between flex-shrink-0">
        <div className="flex gap-16">
          <div>
            <p className="text-[11px] uppercase font-bold text-blue-400 tracking-widest mb-1">Total de Leads</p>
            <p className="text-4xl font-black text-white tracking-tighter">{leads.length}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-blue-400 tracking-widest mb-1">Win Rate (30 dias)</p>
            <p className="text-4xl font-black text-[#FF8C00] tracking-tighter">{winRate}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-bold text-blue-400 tracking-widest mb-1">Conversões</p>
            <p className="text-4xl font-black text-green-400 tracking-tighter">{leadsWon30d}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={exportExcel} className="flex items-center gap-2 bg-[#001224] hover:bg-[#001c38] text-blue-300 px-4 py-2.5 rounded-lg text-sm font-bold border border-blue-900/50 transition-colors">
            Exportar
          </button>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-[#FF8C00] hover:bg-orange-600 active:bg-orange-700 active:scale-95 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-orange-900/20 transition-all">
            + Novo Lead
          </button>
        </div>
      </section>

      {/* VIEW TOGGLE */}
      <div className="px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex bg-[#001224] rounded-lg p-1 border border-blue-900/30">
          <button onClick={() => setView('kanban')} className={`px-5 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'kanban' ? 'bg-[#002244] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Kanban</button>
          <button onClick={() => setView('table')} className={`px-5 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'table' ? 'bg-[#002244] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Tabela</button>
        </div>
      </div>

      {/* MAIN */}
      <main className="flex-grow overflow-hidden px-6 pb-6">
        {view === 'kanban' ? (
          <KanbanBoard leads={filteredLeads} updateStage={updateLeadStage} />
        ) : (
          <LeadTable leads={filteredLeads} onDelete={handleDeleteLead} onUpdateField={updateLead} />
        )}
      </main>

      {/* ADD LEAD MODAL */}
      {isAdding && (
        <div className="fixed inset-0 bg-[#000812]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#001F3F] border border-blue-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
            <div className="px-6 py-5 border-b border-blue-900/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white tracking-tight">Adicionar Lead</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSaveLead} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-wider">Nome</label>
                <input required name="name" autoFocus className="w-full px-4 py-2.5 bg-[#001224] border border-blue-900/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-wider">Email</label>
                <input required type="email" name="email" className="w-full px-4 py-2.5 bg-[#001224] border border-blue-900/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-blue-300 mb-1.5 uppercase tracking-wider">Telefone</label>
                <input name="phone" className="w-full px-4 py-2.5 bg-[#001224] border border-blue-900/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-all" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-[#FF8C00] hover:bg-orange-600 rounded-lg transition-colors shadow-lg shadow-orange-900/30">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
