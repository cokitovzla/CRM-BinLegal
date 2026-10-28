import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CaseActivity, WorkflowComment, WorkflowTask, WorkflowTaskStatus } from '../types';

const tasksCollection = collection(db, 'workflowTasks');
const commentsCollection = collection(db, 'workflowComments');
const activityCollection = collection(db, 'caseActivity');

/**
 * Shared workflow persistence. Authorization is enforced by Firestore Security Rules;
 * UI role checks are convenience only and are never treated as a security boundary.
 */
export const workflowService = {
  subscribeCaseTasks(caseId: string, onUpdate: (tasks: WorkflowTask[]) => void, onError?: (error: Error) => void) {
    const q = query(tasksCollection, where('caseId', '==', caseId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, snapshot => {
      onUpdate(snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as WorkflowTask));
    }, error => onError?.(error));
  },

  subscribeCaseComments(caseId: string, onUpdate: (comments: WorkflowComment[]) => void, onError?: (error: Error) => void) {
    const q = query(commentsCollection, where('caseId', '==', caseId), orderBy('createdAt', 'asc'));
    return onSnapshot(q, snapshot => {
      onUpdate(snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as WorkflowComment));
    }, error => onError?.(error));
  },

  subscribeCaseActivity(caseId: string, onUpdate: (items: CaseActivity[]) => void, onError?: (error: Error) => void) {
    const q = query(activityCollection, where('caseId', '==', caseId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snapshot => {
      onUpdate(snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as CaseActivity));
    }, error => onError?.(error));
  },

  async createTask(task: Omit<WorkflowTask, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const result = await addDoc(tasksCollection, { ...task, createdAt: now, updatedAt: now });
    await addDoc(activityCollection, {
      caseId: task.caseId,
      taskId: result.id,
      actorUid: task.createdByUid,
      actorName: task.createdByUid === task.assignedByUid ? task.assignedByName : task.createdByUid,
      action: 'task_created',
      summary: `Trámite creado: ${task.title}`,
      visibility: 'internal',
      createdAt: now,
    });
    return result.id;
  },

  async updateTaskStatus(task: WorkflowTask, status: WorkflowTaskStatus, actorUid: string, actorName: string) {
    const now = new Date().toISOString();
    const completedAt = status === 'completed' ? now : null;
    await updateDoc(doc(db, 'workflowTasks', task.id), { status, completedAt, updatedAt: now });
    await addDoc(activityCollection, {
      caseId: task.caseId,
      taskId: task.id,
      actorUid,
      actorName,
      action: 'task_status_changed',
      summary: `${actorName} cambió “${task.title}” a ${status}`,
      visibility: task.visibility,
      createdAt: now,
    });
  },

  async proposeReassignment(task: WorkflowTask, nextUid: string, nextName: string, actorUid: string, actorName: string) {
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'workflowTasks', task.id), {
      reassignmentStatus: 'pending_approval',
      proposedAssigneeUid: nextUid,
      proposedAssigneeName: nextName,
      updatedAt: now,
    });
    await addDoc(activityCollection, {
      caseId: task.caseId,
      taskId: task.id,
      actorUid,
      actorName,
      action: 'reassignment_requested',
      summary: `${actorName} solicitó transferir “${task.title}” a ${nextName}; pendiente de aprobación de José`,
      visibility: 'internal',
      createdAt: now,
    });
  },

  async resolveReassignment(task: WorkflowTask, approve: boolean, actorUid: string, actorName: string) {
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      reassignmentStatus: approve ? 'approved' : 'rejected',
      approvedByUid: approve ? actorUid : null,
      approvedAt: approve ? now : null,
      updatedAt: now,
    };
    if (approve) {
      updates.assignedToUid = task.proposedAssigneeUid || null;
      updates.assignedToName = task.proposedAssigneeName || null;
      updates.status = updates.assignedToUid ? 'assigned' : 'unassigned';
    }
    await updateDoc(doc(db, 'workflowTasks', task.id), updates);
    await addDoc(activityCollection, {
      caseId: task.caseId,
      taskId: task.id,
      actorUid,
      actorName,
      action: approve ? 'reassignment_approved' : 'reassignment_rejected',
      summary: approve ? `${actorName} aprobó la reasignación de “${task.title}”` : `${actorName} rechazó la reasignación de “${task.title}”`,
      visibility: 'internal',
      createdAt: now,
    });
  },

  async addComment(comment: Omit<WorkflowComment, 'id' | 'createdAt'>) {
    const now = new Date().toISOString();
    const result = await addDoc(commentsCollection, { ...comment, createdAt: now });
    await addDoc(activityCollection, {
      caseId: comment.caseId,
      taskId: comment.taskId || null,
      actorUid: comment.authorUid,
      actorName: comment.authorName,
      action: 'comment_added',
      summary: comment.visibility === 'client' ? 'Se publicó una actualización para el cliente' : 'Se agregó un comentario interno',
      visibility: comment.visibility,
      createdAt: now,
    });
    return result.id;
  },
};
