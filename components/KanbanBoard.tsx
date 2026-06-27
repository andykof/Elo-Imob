'use client';

import { Lead, LeadStage, STAGES } from '@/lib/types';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useMemo, useEffect } from 'react';

interface KanbanBoardProps {
  leads: Lead[];
  updateStage: (id: number, stage: LeadStage) => void;
}

export default function KanbanBoard({ leads, updateStage }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = useMemo(() => {
    const cols: Record<string, Lead[]> = {};
    STAGES.forEach(s => cols[s] = leads.filter(l => l.stage === s));
    return cols;
  }, [leads]);

  const activeLead = useMemo(() => leads.find(l => l.id.toString() === activeId), [activeId, leads]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeLeadId = parseInt(active.id.toString());
    const overId = over.id.toString();

    // If dropped over a column
    if (STAGES.includes(overId as LeadStage)) {
      updateStage(activeLeadId, overId as LeadStage);
      return;
    }

    // If dropped over another lead
    const overLead = leads.find(l => l.id.toString() === overId);
    if (overLead && overLead.stage) {
      updateStage(activeLeadId, overLead.stage);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        {STAGES.map(stage => (
          <KanbanColumn key={stage} stage={stage} items={columns[stage] || []} />
        ))}
      </div>
      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ stage, items }: { stage: LeadStage; items: Lead[] }) {
  const { setNodeRef } = useSortable({
    id: stage,
    data: { type: 'Column', stage }
  });

  const getStyle = () => {
    if (stage === 'Ganho') return 'border-green-500/30 bg-green-900/10';
    if (stage === 'Perdido') return 'border-red-500/30 bg-red-900/10 opacity-70';
    return 'border-blue-900/50 bg-[#00152b]';
  };

  return (
    <div ref={setNodeRef} className={`flex-shrink-0 w-72 flex flex-col h-full rounded-xl border p-3 ${getStyle()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {stage} <span className="text-slate-500 ml-1">({items.length})</span>
        </h3>
      </div>
      <SortableContext items={items.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
        <div className="flex-grow space-y-3 min-h-[200px]">
          {items.map(lead => (
            <SortableLead key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableLead({ lead }: { lead: Lead }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: lead.id.toString(),
    data: { type: 'Lead', lead }
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="bg-blue-900/20 border border-blue-500/50 h-24 rounded-lg opacity-50" />;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, isOverlay }: { lead: Lead; isOverlay?: boolean }) {
  return (
    <div className={`bg-[#002244] p-4 rounded-lg border border-blue-800/50 shadow-md flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:border-blue-500 transition-colors ${isOverlay ? 'rotate-2 scale-105 shadow-2xl border-[#FF8C00]' : ''}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-bold text-white">{lead.name}</p>
      </div>
      <p className="text-xs text-slate-400 truncate">{lead.email}</p>
    </div>
  );
}
