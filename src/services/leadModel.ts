import type { Lead } from '../types';

export const OFFICE_ID = 'binlegal';

export type IntakeSource = 'diagnostic' | 'contact' | 'manual' | 'legacy';
export interface LeadFollowUp {
  responsibleName: string;
  nextAction: string;
  nextActionDate: string;
  assessment: string;
  diagnosticStatus: 'pending' | 'in_progress' | 'completed';
}

export interface Office { id: string; name: string }
export interface ClientCompany { id: string; officeId: string; name: string; createdAt: string }
export interface ContactPerson {
  id: string; officeId: string; fullName: string; email: string; phone: string;
  companyIds: string[]; accountUid: string | null; createdAt: string;
}

// Omit optional undefined values: Firestore does not accept them.
export function cleanLead(lead: Lead, source: IntakeSource): Lead {
  if (!lead.id || !lead.fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) {
    throw new Error('Indica el nombre y un correo válido.');
  }
  return JSON.parse(JSON.stringify({
    ...lead,
    officeId: OFFICE_ID,
    source,
    fullName: lead.fullName.trim(),
    email: lead.email.trim().toLowerCase(),
    company: lead.company.trim(),
  })) as Lead;
}

export function publicIntake(lead: Lead, source: 'diagnostic' | 'contact'): Lead {
  const value = cleanLead(lead, source);
  return JSON.parse(JSON.stringify({
    id: value.id, officeId: OFFICE_ID, source, fullName: value.fullName, email: value.email,
    phone: value.phone, company: value.company, industry: value.industry, stage: value.stage,
    areasOfInterest: value.areasOfInterest, notes: value.notes, status: 'nuevo_lead',
    createdAt: value.createdAt, calculatedRiskScore: value.calculatedRiskScore,
    riskSummary: value.riskSummary, riskItems: value.riskItems, internalNotes: [],
  })) as Lead;
}

export function clientRecords(lead: Lead): { company: ClientCompany | null; person: ContactPerson } {
  const companyId = lead.companyId || `company-${lead.id}`;
  const personId = lead.personId || `person-${lead.id}`;
  const hasCompany = Boolean(lead.company && lead.company !== 'Consulta particular');
  return {
    company: hasCompany ? { id: companyId, officeId: OFFICE_ID, name: lead.company, createdAt: lead.createdAt } : null,
    person: { id: personId, officeId: OFFICE_ID, fullName: lead.fullName, email: lead.email,
      phone: lead.phone || '', companyIds: hasCompany ? [companyId] : [], accountUid: null, createdAt: lead.createdAt },
  };
}

export function validateFollowUp(value: LeadFollowUp): LeadFollowUp {
  const result = { ...value, responsibleName: value.responsibleName.trim(), nextAction: value.nextAction.trim(), assessment: value.assessment.trim() };
  if (!result.responsibleName || !result.nextAction || !/^\d{4}-\d{2}-\d{2}$/.test(result.nextActionDate) || Number.isNaN(Date.parse(result.nextActionDate)) || new Date(result.nextActionDate).toISOString().slice(0,10) !== result.nextActionDate) {
    throw new Error('Completa el responsable, la próxima acción y una fecha válida.');
  }
  if (!['pending', 'in_progress', 'completed'].includes(result.diagnosticStatus)) throw new Error('Selecciona un estado válido.');
  if (result.diagnosticStatus === 'completed' && !result.assessment) throw new Error('Registra la valoración antes de completar el diagnóstico.');
  if (result.responsibleName.length > 120 || result.nextAction.length > 500 || result.assessment.length > 8000) throw new Error('El seguimiento supera el límite de texto permitido.');
  return result;
}
