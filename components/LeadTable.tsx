'use client';

import { Lead, STAGES } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LeadTableProps {
  leads: Lead[];
  onDelete: (id: number) => void;
  onUpdateField: (id: number, field: string, value: string) => void;
}

export default function LeadTable({ leads, onDelete, onUpdateField }: LeadTableProps) {
  return (
    <div className="bg-[#00152b] rounded-lg shadow-xl border border-blue-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#000f1f] border-b border-blue-900/30 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Etapa</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-blue-900/20">
            {leads.map(lead => (
              <EditableRow key={lead.id} lead={lead} onDelete={onDelete} onUpdateField={onUpdateField} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditableRow({ lead, onDelete, onUpdateField }: { lead: Lead, onDelete: (id: number) => void, onUpdateField: (id: number, field: string, value: string) => void }) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const save = () => {
    if (editingField) {
      if (tempValue !== (lead as any)[editingField]) {
        onUpdateField(lead.id, editingField, tempValue);
      }
      setEditingField(null);
    }
  };

  return (
    <tr className="hover:bg-blue-900/10 transition-colors group">
      <td className="px-4 py-3 text-white font-medium" onClick={() => handleEdit('name', lead.name)}>
        {editingField === 'name' ? (
          <input ref={inputRef} className="bg-blue-950/50 text-white px-2 py-1 outline-none w-full border border-blue-500 rounded" value={tempValue} onChange={e => setTempValue(e.target.value)} onBlur={save} onKeyDown={e => e.key === 'Enter' && save()} />
        ) : <span className="cursor-pointer border-b border-transparent hover:border-slate-500">{lead.name}</span>}
      </td>
      <td className="px-4 py-3 text-slate-300" onClick={() => handleEdit('email', lead.email)}>
        {editingField === 'email' ? (
          <input ref={inputRef} className="bg-blue-950/50 text-white px-2 py-1 outline-none w-full border border-blue-500 rounded" value={tempValue} onChange={e => setTempValue(e.target.value)} onBlur={save} onKeyDown={e => e.key === 'Enter' && save()} />
        ) : <span className="cursor-pointer border-b border-transparent hover:border-slate-500">{lead.email}</span>}
      </td>
      <td className="px-4 py-3 text-slate-300" onClick={() => handleEdit('phone', lead.phone || '')}>
        {editingField === 'phone' ? (
          <input ref={inputRef} className="bg-blue-950/50 text-white px-2 py-1 outline-none w-full border border-blue-500 rounded" value={tempValue} onChange={e => setTempValue(e.target.value)} onBlur={save} onKeyDown={e => e.key === 'Enter' && save()} />
        ) : <span className="cursor-pointer border-b border-transparent hover:border-slate-500">{lead.phone || 'Adicionar'}</span>}
      </td>
      <td className="px-4 py-3">
        <select 
          className={`text-[11px] font-bold px-2 py-1 rounded outline-none cursor-pointer appearance-none ${lead.stage === 'Ganho' ? 'bg-green-500/20 text-green-400' : lead.stage === 'Perdido' ? 'bg-red-500/20 text-red-400' : 'bg-blue-900/50 text-blue-200'}`}
          value={lead.stage}
          onChange={(e) => onUpdateField(lead.id, 'stage', e.target.value)}
        >
          {STAGES.map(s => <option key={s} value={s} className="bg-[#001F3F] text-white">{s}</option>)}
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onDelete(lead.id)} className="p-1 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </td>
    </tr>
  );
}
