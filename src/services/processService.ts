import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { LegalProcess, ProcessStatus } from '../types';

export const INITIAL_DEMO_PROCESSES: LegalProcess[] = [
  {
    id: 'proc-101',
    userId: 'demo-client-uid-01',
    clientEmail: 'sofia@koragroup.ve',
    clientName: 'Sofía Colmenares',
    companyName: 'Kora Logistics',
    title: 'Constitución y Registro Mercantil C.A.',
    category: 'Corporativo',
    status: 'revision',
    progress: 75,
    assignedLawyer: 'María Fernández',
    nextMilestone: 'Firma definitiva en Registro Mercantil Segundo de Caracas',
    targetDate: '28 Octubre 2026',
    documents: [
      { name: 'Borrador_Estatutos_v3.pdf', category: 'Estatutos', date: '19 Oct 2026', status: 'aprobado' },
      { name: 'Reserva_Nombre_Comercial_Aprobada.pdf', category: 'Registro', date: '15 Oct 2026', status: 'aprobado' },
      { name: 'Planilla_Liquidacion_Aranceles.pdf', category: 'Tributario', date: '20 Oct 2026', status: 'pendiente' }
    ],
    milestones: [
      { date: '12 Oct 2026', title: 'Apertura de expediente y recaudos', note: 'Copia de cédulas y balance de apertura consignado.' },
      { date: '15 Oct 2026', title: 'Reserva de denominación comercial', note: 'Nombre Kora Logistics C.A. aprobado sin objeciones.' },
      { date: '19 Oct 2026', title: 'Redacción y revisión con socios', note: 'Pacto de socios y cláusula de vesting incorporados a los estatutos.' }
    ],
    createdAt: '2026-10-12',
    updatedAt: '2026-10-20'
  },
  {
    id: 'proc-102',
    userId: 'demo-client-uid-01',
    clientEmail: 'sofia@koragroup.ve',
    clientName: 'Sofía Colmenares',
    companyName: 'Kora Logistics',
    title: 'Registro de Marca Comercial ante SAPI',
    category: 'Propiedad Intelectual',
    status: 'tramite_publico',
    progress: 50,
    assignedLawyer: 'Ana Rivas',
    nextMilestone: 'Publicación en Boletín Oficial de la Propiedad Industrial',
    targetDate: '15 Noviembre 2026',
    documents: [
      { name: 'Informe_Busqueda_Fonetica_Favorable.pdf', category: 'Marcas', date: '14 Oct 2026', status: 'aprobado' },
      { name: 'Comprobante_Solicitud_SAPI_Nro_2026-08912.pdf', category: 'Trámite Oficial', date: '17 Oct 2026', status: 'aprobado' }
    ],
    milestones: [
      { date: '14 Oct 2026', title: 'Búsqueda de viabilidad fonética', note: '0 coincidencias idénticas en clase 39 (transporte y logística).' },
      { date: '17 Oct 2026', title: 'Consignación de expediente ante SAPI', note: 'Expediente admitido para examen formal de fondo.' }
    ],
    createdAt: '2026-10-14',
    updatedAt: '2026-10-18'
  },
  {
    id: 'proc-103',
    userId: 'demo-client-uid-01',
    clientEmail: 'sofia@koragroup.ve',
    clientName: 'Sofía Colmenares',
    companyName: 'Kora Logistics',
    title: 'Contratos Marco de Servicios y Políticas Laborales',
    category: 'Laboral',
    status: 'redaccion',
    progress: 30,
    assignedLawyer: 'José Rafael Vásquez',
    nextMilestone: 'Revisión preliminar de cláusulas de teletrabajo y confidencialidad',
    targetDate: '05 Noviembre 2026',
    documents: [
      { name: 'Matriz_Riesgos_Laborales_Kora.pdf', category: 'Auditoría', date: '18 Oct 2026', status: 'aprobado' },
      { name: 'Modelo_Contrato_Prestador_Independiente_v1.docx', category: 'Borrador', date: '20 Oct 2026', status: 'en_revision' }
    ],
    milestones: [
      { date: '18 Oct 2026', title: 'Auditoría inicial de esquema de colaboradores', note: 'Se determinó necesidad de separar contratos de servicios B2B de nómina.' }
    ],
    createdAt: '2026-10-18',
    updatedAt: '2026-10-20'
  }
];

export const processService = {
  // Realtime subscription for a user
  subscribeUserProcesses(userId: string, onUpdate: (processes: LegalProcess[]) => void) {
    const q = query(collection(db, 'processes'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // Real accounts must only see processes actually stored for their UID.
          onUpdate([]);
          return;
        }
        const procs = snapshot.docs.map(doc => doc.data() as LegalProcess);
        onUpdate(procs);
      },
      (error) => {
        console.warn('Process onSnapshot error:', error);
        // Never substitute sample or another user's processes for a real account.
        onUpdate([]);
        handleFirestoreError(error, OperationType.GET, 'processes');
      }
    );
  },

  // Realtime subscription for all processes (Admin / José Rafael Vásquez)
  subscribeAllProcesses(onUpdate: (processes: LegalProcess[]) => void) {
    return onSnapshot(
      collection(db, 'processes'),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate([]);
          return;
        }
        const procs = snapshot.docs.map(doc => doc.data() as LegalProcess);
        onUpdate(procs);
      },
      (error) => {
        console.warn('All processes subscription error:', error);
        onUpdate([]);
        handleFirestoreError(error, OperationType.GET, 'processes');
      }
    );
  },

  // Create a new process
  async createProcess(process: LegalProcess): Promise<void> {
    const path = `processes/${process.id}`;
    try {
      await setDoc(doc(db, 'processes', process.id), process);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Update process status and progress
  async updateProcessStatus(
    processId: string, 
    status: ProcessStatus, 
    progress: number, 
    nextMilestone?: string
  ): Promise<void> {
    const path = `processes/${processId}`;
    try {
      const updates: any = {
        status,
        progress,
        updatedAt: new Date().toISOString().slice(0, 10)
      };
      if (nextMilestone) updates.nextMilestone = nextMilestone;
      await updateDoc(doc(db, 'processes', processId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
