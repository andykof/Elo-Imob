export type LeadStage = 'Novo Lead' | 'Em atendimento' | 'Visita Agendada' | 'Proposta Enviada' | 'Ganho' | 'Perdido' | 'Sem interesse';

export const STAGES: LeadStage[] = [
  'Novo Lead',
  'Em atendimento',
  'Visita Agendada',
  'Proposta Enviada',
  'Ganho',
  'Perdido',
  'Sem interesse'
];

export interface Lead {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  stage: LeadStage;
  createdAt: string;
}
