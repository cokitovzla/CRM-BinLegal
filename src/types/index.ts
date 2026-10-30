export type BusinessStage = 
  | 'Idea / Pre-lanzamiento'
  | 'Recién constituida'
  | 'En crecimiento'
  | 'Consolidada';

export type LegalArea = 
  | 'Corporativo'
  | 'Propiedad Intelectual'
  | 'Regulatorio'
  | 'Laboral'
  | 'Contratos'
  | 'Mediación'
  | 'Negociación y mediación'
  | 'Asesoría General';

export type LeadStatus = 
  | 'nuevo_lead'
  | 'diagnostico_enviado'
  | 'sesion_programada'
  | 'propuesta_presentada'
  | 'cliente_activo';

export type ProcessStatus = 
  | 'recaudos'
  | 'redaccion'
  | 'tramite_publico'
  | 'revision'
  | 'completado';

export interface ProcessDocument {
  name: string;
  category: string;
  date: string;
  status: 'aprobado' | 'en_revision' | 'pendiente';
}

export interface ProcessMilestone {
  date: string;
  title: string;
  note: string;
}

export interface LegalProcess {
  officeId?: string; leadId?: string; personId?: string; companyId?: string | null;
  serviceItemId?: string; budgetVersionId?: string; scope?: string;
  assignedLawyerIds?: string[];
  assignmentStatus?: 'pending' | 'assigned';
  caseControls?: CaseControls;
  controlsRevision?: number;
  workRevision?: number;
  closure?: {summary:string;documentId:string;storagePath:string;storageGeneration:string;actorUid:string;recordedAt:string};
  startAuthorization?: { requirements: string; evidence: string; exceptionReason: string; actorUid?: string; recordedAt?: string };
  caseStage?: 'not_started' | 'in_progress' | 'final_review' | 'completed';
  id: string;
  userId: string;
  clientEmail: string;
  clientName?: string;
  companyName?: string;
  title: string;
  category: 'Corporativo' | 'Propiedad Intelectual' | 'Regulatorio' | 'Laboral' | 'Administrativo & Notarial' | 'Mediación' | 'Contratos';
  status: ProcessStatus;
  progress: number;
  assignedLawyer: string;
  assignedLawyerId?: string;
  nextMilestone: string;
  targetDate: string;
  documents?: ProcessDocument[];
  milestones?: ProcessMilestone[];
  createdAt: string;
  updatedAt: string;
  openedBy?: string;
  clientAcquiredBy?: string;
  activityHistory?: ProcessActivity[];
}

export interface ProcessActivity {
  id: string;
  date: string;
  title: string;
  description: string;
  actor: string;
  role: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  username?: string;
  companyName?: string;
  industry?: string;
  sectors?: string[];
  isSubscribedNewsletter?: boolean;
  role: 'client' | 'admin' | 'lawyer' | 'supervisor' | 'intern' | 'secretary';
  createdAt: string;
}

export interface InternalNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface RiskItem {
  area: string;
  level: 'Alto' | 'Medio' | 'Bajo';
  title: string;
  description: string;
  actionRequired: string;
}

export interface LeadBudgetItem {
  id: string;
  concept: string;
  area: string;
  quantity: number;
  unitPrice: number;
}

export interface LeadBudget {
  taxMode?: 'none' | 'included' | 'added';
  taxRate?: number;
  sentAt?: string;
  sentEvidence?: string;
  sentByUid?: string;
  sentByName?: string;
  items: LeadBudgetItem[];
  currency: 'USD' | 'EUR' | 'VES';
  discount?: number;
  notes?: string;
  status: 'borrador' | 'enviado' | 'aprobado' | 'rechazado';
  createdAt?: string;
  validUntil?: string;
}

export interface LeadDocument {
  id: string;
  name: string;
  category: string;
  status: 'recibido' | 'en_revision' | 'aprobado' | 'pendiente';
  uploadDate: string;
  size?: string;
  fileUrl?: string;
}

export interface Lead {
  commercial?: import('../domain/commercial').CommercialActivity;
  acceptedBudget?: import('../domain/operations').BudgetAcceptance;
  officeId?: string;
  source?: import('../services/leadModel').IntakeSource;
  personId?: string;
  companyId?: string | null;
  revision?: number;
  followUp?: import('../services/leadModel').LeadFollowUp;
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company: string;
  jobTitle?: string;
  isPrimaryContact?: boolean;
  rif?: string;
  industry: string;
  stage: BusinessStage;
  areasOfInterest: LegalArea[];
  notes?: string;
  status: LeadStatus;
  createdAt: string;
  calculatedRiskScore: number; // 0 - 100
  riskSummary: string;
  riskItems: RiskItem[];
  internalNotes: InternalNote[];
  assignedLawyer?: string;
  linkedProcessId?: string;
  budget?: LeadBudget;
  documents?: LeadDocument[];
}

export interface ServiceDetail {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  keyDeliverables: string[];
  commonRisks: string[];
  idealStage: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialty: string;
  experience: string;
  email: string;
  photoUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  author: string;
}

export interface EcosystemStartup {
  id: string;
  name: string;
  founder: string;
  sector: string;
  stage: BusinessStage;
  description: string;
  synergies: string[];
  verifiedClient: boolean;
  city: string;
}

export interface ForumPost {
  id: string;
  author: string;
  authorRole: string;
  company: string;
  category: 'Rondas de Inversión' | 'Contratos y Proveedores' | 'Permisología y Marcas' | 'Alianzas Comerciales';
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Array<{
    id: string;
    author: string;
    role: string;
    company: string;
    content: string;
    createdAt: string;
  }>;
}


// --- BinLegal shared workflow, collaboration and client-library model ---

export type InternalRole = 'admin' | 'lawyer' | 'supervisor' | 'intern' | 'secretary';
export type CaseVisibility = 'internal' | 'client';
export type WorkflowTaskStatus = 'unassigned' | 'assigned' | 'in_progress' | 'pending_approval' | 'changes_requested' | 'completed' | 'cancelled';
export type WorkflowTaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ReassignmentStatus = 'not_required' | 'pending_approval' | 'approved' | 'rejected';

export interface WorkflowTask {
  expectedResult?: string; reviewerUid?: string | null; reviewerName?: string | null;
  requiresReview?: boolean; reviewNote?: string; revision?: number; blockedReason?: string;
  id: string;
  caseId: string;
  clientId: string;
  title: string;
  description: string;
  status: WorkflowTaskStatus;
  priority: WorkflowTaskPriority;
  assignedToUid: string | null;
  assignedToName: string | null;
  assignedByUid: string;
  assignedByName: string;
  createdByUid: string;
  createdAt: string;
  updatedAt: string;
  dueAt?: string | null;
  completedAt?: string | null;
  requiresJoseApproval: boolean;
  reassignmentStatus: ReassignmentStatus;
  proposedAssigneeUid?: string | null;
  proposedAssigneeName?: string | null;
  approvedByUid?: string | null;
  approvedAt?: string | null;
  visibility: CaseVisibility;
}

export interface WorkflowComment {
  id: string;
  caseId: string;
  taskId?: string | null;
  documentId?: string | null;
  authorUid: string;
  authorName: string;
  authorRole: InternalRole | 'client';
  body: string;
  visibility: CaseVisibility;
  createdAt: string;
  mentions?: string[];
}

export type ClientDocumentStatus = 'received' | 'in_review' | 'changes_requested' | 'draft' | 'pending_approval' | 'delivered' | 'superseded' | 'archived';
export type ClientDocumentKind = 'client_upload' | 'team_working_file' | 'draft' | 'final_deliverable' | 'scanned_copy' | 'official_receipt' | 'other';

export interface ClientDocument {
  id: string;
  clientId: string;
  caseId: string;
  taskId?: string | null;
  name: string;
  description?: string;
  category: string;
  kind: ClientDocumentKind;
  status: ClientDocumentStatus;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
  version: number;
  previousVersionId?: string | null;
  uploadedByUid: string;
  uploadedByName: string;
  uploadedAt: string;
  reviewedByUid?: string | null;
  reviewedAt?: string | null;
  publishedByUid?: string | null;
  publishedAt?: string | null;
  visibleToClient: boolean;
  checksum?: string;
}

export interface CaseActivity {
  id: string;
  caseId: string;
  taskId?: string | null;
  actorUid: string;
  actorName: string;
  action: string;
  summary: string;
  visibility: CaseVisibility;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface CaseControls {
 requirements: Array<{id:string;title:string;responsible:string;evidence:string}>;
 hold: {state:'none'|'waiting'|'blocked'|'suspended';reason:string;dependsOn:string;nextAction:string};
}

export interface WorkNotification {id:string;caseId:string;taskId:string;recipientUid:string;actorUid:string;summary:string;createdAt:string;readAt?:string;}
