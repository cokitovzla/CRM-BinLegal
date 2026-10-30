import { collection, doc, onSnapshot, query, runTransaction, setDoc, where } from 'firebase/firestore';
import { commercialStatus,validateCommercial } from '../domain/commercial';
import { db } from '../lib/firebase';
import type { Lead } from '../types';
import { cleanLead, clientRecords, OFFICE_ID, publicIntake } from './leadModel';

export const leadService = {
  async submit(lead: Lead, source: 'diagnostic' | 'contact') {
    const intake = publicIntake(lead, source);
    await setDoc(doc(db, 'leads', intake.id), intake);
    return intake;
  },

  subscribe(onUpdate: (leads: Lead[]) => void, onError: (error: Error) => void) {
    // Legacy records are included for this first, single-office migration.
    // New records always carry officeId; other offices are never included here.
    return onSnapshot(collection(db, 'leads'), snapshot => {
      onUpdate(snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as Lead)
        .filter(lead => !lead.officeId || lead.officeId === OFFICE_ID)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, onError);
  },

  async createManual(input: Lead, actorUid: string) {
    const lead = cleanLead(input, 'manual');
    const records = clientRecords(lead);
    const saved: Lead = { ...lead, personId: records.person.id, companyId: records.company?.id || null, revision: 1 };
    return runTransaction(db, async transaction => {
      const target = doc(db, 'leads', lead.id);
      const existing = await transaction.get(target);
      if (existing.exists()) return { ...existing.data(), id: existing.id } as Lead;
      transaction.set(target, saved);
      transaction.set(doc(db, 'people', records.person.id), records.person);
      if (records.company) transaction.set(doc(db, 'companies', records.company.id), records.company);
      transaction.set(doc(db, 'leadActivity', `created-${lead.id}`), {
        officeId: OFFICE_ID, leadId: lead.id, actorUid, action: 'created', createdAt: new Date().toISOString(),
      });
      return saved;
    });
  },

  async update(input: Lead, actorUid: string) {
    const target = doc(db, 'leads', input.id);
    if(input.commercial)input={...input,commercial:validateCommercial(input.commercial)};
    const saved = cleanLead({...input,status:commercialStatus(input)}, input.source || 'legacy');
    return runTransaction(db, async transaction => {
      const snapshot = await transaction.get(target);
      if (!snapshot.exists()) throw new Error('La solicitud ya no existe. Recarga la bandeja.');
      const current = snapshot.data() as Lead;
      if ((current.revision || 0) !== (input.revision || 0)) {
        throw new Error('Otra persona actualizó esta solicitud. Revisa los datos y vuelve a guardar.');
      }
      if (current.acceptedBudget && (JSON.stringify(current.acceptedBudget) !== JSON.stringify(saved.acceptedBudget) || JSON.stringify(current.budget) !== JSON.stringify(saved.budget))) {
        throw new Error('El presupuesto aceptado se conserva como versión histórica y no puede sobrescribirse.');
      }
      const records = clientRecords(saved);
      const updated = { ...saved, personId: records.person.id, companyId: records.company?.id || null, revision: (current.revision || 0) + 1 };
      transaction.set(target, updated);
      // Create identities only once. Never silently merge people by email/name.
      if (!current.personId) transaction.set(doc(db, 'people', records.person.id), records.person);
      if (!current.companyId && records.company) transaction.set(doc(db, 'companies', records.company.id), records.company);
      transaction.set(doc(collection(db, 'leadActivity')), {
        officeId: OFFICE_ID, leadId: input.id, actorUid, action: 'updated',
        previousStatus: current.status, status: updated.status,
        followUp: updated.followUp || null, commercial: updated.commercial || null, createdAt: new Date().toISOString(),
      });
      return updated;
    });
  },

  subscribeActivity(leadId: string, onUpdate: (items: Array<{ id: string; action: string; createdAt: string }>) => void, onError: (error: Error) => void) {
    return onSnapshot(query(collection(db, 'leadActivity'), where('leadId', '==', leadId)), snapshot => {
      onUpdate(snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as { id: string; action: string; createdAt: string })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, onError);
  },
};
