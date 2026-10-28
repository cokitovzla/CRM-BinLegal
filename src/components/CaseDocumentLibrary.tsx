import React, { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, query, updateDoc, doc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Download, FileCheck2, FileText, LoaderCircle, Upload, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { ClientDocument, LegalProcess } from '../types';

interface CaseDocumentLibraryProps {
  process: LegalProcess;
  staffMode?: boolean;
  onClose?: () => void;
}

export const CaseDocumentLibrary: React.FC<CaseDocumentLibraryProps> = ({ process, staffMode = false, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const demoMode = window.location.pathname.replace(/\/$/, '') === '/crm-preview';
  const demoKey = `binlegal_preview_documents_${process.id}`;
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<ClientDocument['kind']>(staffMode ? 'team_working_file' : 'client_upload');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (demoMode) {
      try {
        const saved = localStorage.getItem(demoKey);
        const now = new Date().toISOString();
        const sampleDocuments: ClientDocument[] = [
          { id: 'demo-doc-' + process.id + '-01', clientId: process.userId, caseId: process.id, name: 'Ficha_de_apertura.pdf', description: 'Ficha inicial del expediente (archivo de muestra).', category: 'Apertura', kind: 'team_working_file', status: 'in_review', storagePath: 'demo://sample-file-not-included', contentType: 'application/pdf', sizeBytes: 248000, version: 1, uploadedByUid: 'demo-admin-uid-01', uploadedByName: 'Equipo BinLegal', uploadedAt: now, visibleToClient: false },
          { id: 'demo-doc-' + process.id + '-02', clientId: process.userId, caseId: process.id, name: 'Actualizacion_de_estado.pdf', description: 'Resumen de estado visible al cliente (archivo de muestra).', category: 'Actualización', kind: 'final_deliverable', status: 'delivered', storagePath: 'demo://sample-file-not-included', contentType: 'application/pdf', sizeBytes: 186000, version: 1, uploadedByUid: 'demo-admin-uid-01', uploadedByName: 'Equipo BinLegal', uploadedAt: now, publishedByUid: 'demo-admin-uid-01', publishedAt: now, visibleToClient: true },
        ];
        const initial = saved ? JSON.parse(saved) as ClientDocument[] : sampleDocuments;
        setDocuments(initial);
        if (!saved) localStorage.setItem(demoKey, JSON.stringify(initial));
      } catch { setDocuments([]); }
      return;
    }
    const base = collection(db, 'clientDocuments');
    if (staffMode) {
      const q = query(base, where('caseId', '==', process.id));
      return onSnapshot(q, snap => {
        setDocuments(snap.docs.map(item => ({ ...item.data(), id: item.id }) as ClientDocument).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
      }, err => setError(err.message || 'No se pudieron cargar los documentos.'));
    }
    if (!currentUser) {
      setDocuments([]);
      return;
    }
    const ownUploads = new Map<string, ClientDocument>();
    const published = new Map<string, ClientDocument>();
    const emit = () => setDocuments(Array.from(new Map([...ownUploads, ...published]).values()).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)));
    const stopOwn = onSnapshot(query(base, where('caseId', '==', process.id), where('clientId', '==', process.userId), where('uploadedByUid', '==', currentUser.uid)), snap => {
      ownUploads.clear();
      snap.docs.forEach(item => ownUploads.set(item.id, { ...item.data(), id: item.id } as ClientDocument));
      emit();
    }, err => setError(err.message || 'No se pudieron cargar los documentos enviados.'));
    const stopPublished = onSnapshot(query(base, where('caseId', '==', process.id), where('clientId', '==', process.userId), where('visibleToClient', '==', true), where('status', '==', 'delivered')), snap => {
      published.clear();
      snap.docs.forEach(item => published.set(item.id, { ...item.data(), id: item.id } as ClientDocument));
      emit();
    }, err => setError(err.message || 'No se pudieron cargar los documentos entregados.'));
    return () => { stopOwn(); stopPublished(); };
  }, [process.id, currentUser?.uid, staffMode, demoMode]);

  const visibleDocuments = staffMode
    ? documents
    : documents.filter(item => (item.visibleToClient && item.status === 'delivered') || item.uploadedByUid === currentUser?.uid);

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || (!currentUser && !demoMode)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (demoMode) {
        const now = new Date().toISOString();
        const actorUid = currentUser?.uid || 'demo-admin-uid-01';
        const nextDocument: ClientDocument = { id: `demo-document-${Date.now()}`, clientId: process.userId, caseId: process.id, name: file.name, description: description.trim(), category: kind === 'client_upload' ? 'Documento recibido del cliente' : kind === 'final_deliverable' ? 'Documento final' : 'Documento del expediente', kind, status: staffMode ? (kind === 'final_deliverable' ? 'pending_approval' : 'in_review') : 'received', storagePath: 'demo://local-file-not-persisted', contentType: file.type || 'application/octet-stream', sizeBytes: file.size, version: 1, uploadedByUid: actorUid, uploadedByName: userProfile?.displayName || currentUser?.displayName || 'Usuario de demostración', uploadedAt: now, visibleToClient: false };
        const next = [nextDocument, ...documents]; setDocuments(next); localStorage.setItem(demoKey, JSON.stringify(next));
        setFile(null); setDescription('');
        const demoInput = document.getElementById('case-document-file') as HTMLInputElement | null; if (demoInput) demoInput.value = '';
        setNotice('Documento de muestra agregado a la maqueta. El archivo binario no se guarda en modo demostración.');
        setBusy(false);
        return;
      }
      if (!currentUser) {
        setError('Debes iniciar sesión para cargar documentos.');
        return;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `client-documents/${process.id}/${currentUser.uid}/${Date.now()}_${safeName}`;
      const storage = getStorage();
      const objectRef = ref(storage, storagePath);
      await uploadBytes(objectRef, file, { contentType: file.type || 'application/octet-stream' });
      const now = new Date().toISOString();
      await addDoc(collection(db, 'clientDocuments'), {
        clientId: process.userId,
        caseId: process.id,
        name: file.name,
        description: description.trim(),
        category: kind === 'client_upload' ? 'Documento recibido del cliente' : kind === 'final_deliverable' ? 'Documento final' : 'Documento del expediente',
        kind,
        status: staffMode ? (kind === 'final_deliverable' ? 'pending_approval' : 'in_review') : 'received',
        storagePath,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        version: 1,
        uploadedByUid: currentUser.uid,
        uploadedByName: userProfile?.displayName || currentUser.displayName || currentUser.email || 'Usuario',
        uploadedAt: now,
        visibleToClient: false,
      });
      setFile(null); setDescription('');
      const input = document.getElementById('case-document-file') as HTMLInputElement | null;
      if (input) input.value = '';
      setNotice(staffMode ? 'Documento cargado. Publícalo cuando esté listo para el cliente.' : 'Documento recibido y agregado al expediente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo. Verifica que Firebase Storage esté habilitado.');
    } finally { setBusy(false); }
  };

  const download = async (item: ClientDocument) => {
    setError('');
    if (demoMode) { setNotice('Este es un documento de muestra: la maqueta conserva sus metadatos, pero el archivo binario no está disponible para descarga.'); return; }
    try {
      const url = await getDownloadURL(ref(getStorage(), item.storagePath));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo abrir el archivo.');
    }
  };

  const publish = async (item: ClientDocument) => {
    setBusy(true); setError(''); setNotice('');
    try {
      if (demoMode) { const next = documents.map(docItem => docItem.id === item.id ? { ...docItem, status: 'delivered' as const, visibleToClient: true, publishedByUid: currentUser?.uid || 'demo-admin-uid-01', publishedAt: new Date().toISOString() } : docItem); setDocuments(next); localStorage.setItem(demoKey, JSON.stringify(next)); setNotice('Documento de muestra publicado para el cliente.'); setBusy(false); return; }
      await updateDoc(doc(db, 'clientDocuments', item.id), {
        status: 'delivered',
        visibleToClient: true,
        publishedByUid: currentUser?.uid || '',
        publishedAt: new Date().toISOString(),
      });
      setNotice('Documento publicado en la biblioteca del cliente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar el documento.');
    } finally { setBusy(false); }
  };

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return <section className={staffMode ? 'fixed inset-0 z-[75] bg-neutral-100 overflow-y-auto' : 'bg-white rounded-xl border border-neutral-200 overflow-hidden'}>
    <header className="flex items-start justify-between gap-3 border-b border-neutral-200 bg-white p-4 sm:p-5">
      <div><div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Biblioteca documental</div><h2 className="text-lg font-extrabold mt-1">{process.title}</h2><p className="text-xs text-neutral-500">{process.clientName || process.clientEmail} · Archivos del expediente y entregables</p></div>
      {onClose && <button onClick={onClose} aria-label="Cerrar biblioteca" className="rounded-lg p-2 hover:bg-neutral-100"><X className="w-5 h-5" /></button>}
    </header>
    <div className="p-4 sm:p-5 space-y-4">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
      <form onSubmit={upload} className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold"><Upload className="w-4 h-4" />{staffMode ? 'Cargar documento al expediente' : 'Enviar documento al equipo legal'}</div>
        <input id="case-document-file" type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-neutral-700" />
        {staffMode && <label className="block text-xs font-semibold">Tipo de documento<select value={kind} onChange={e => setKind(e.target.value as ClientDocument['kind'])} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-normal"><option value="team_working_file">Archivo interno de trabajo</option><option value="draft">Borrador para revisión</option><option value="final_deliverable">Documento final para entregar</option><option value="scanned_copy">Copia escaneada</option><option value="official_receipt">Constancia o recibo oficial</option><option value="other">Otro</option></select></label>}
        <label className="block text-xs font-semibold">Descripción (opcional)<input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. RIF actualizado, copia escaneada…" className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-normal" /></label>
        <button disabled={busy || !file} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}{busy ? 'Subiendo…' : 'Subir archivo'}</button>
        <p className="text-[11px] text-neutral-500">Los documentos finales quedan pendientes hasta que el equipo los publique como entregados.</p>
      </form>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><h3 className="text-sm font-extrabold">Documentos {staffMode ? 'del expediente' : 'entregados'}</h3><span className="text-xs text-neutral-500">{visibleDocuments.length} archivos</span></div>
        {visibleDocuments.length === 0 && <div className="rounded-lg border border-neutral-200 p-8 text-center text-sm text-neutral-500"><FileText className="mx-auto mb-2 h-6 w-6" />Todavía no hay documentos para mostrar.</div>}
        {visibleDocuments.map(item => <article key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3">
          <div className="flex min-w-0 items-start gap-3"><div className="rounded-lg bg-blue-50 text-blue-700 p-2"><FileText className="w-5 h-5" /></div><div className="min-w-0"><div className="font-bold text-sm break-words">{item.name}</div><p className="text-xs text-neutral-500 mt-1">{item.category} · {formatSize(item.sizeBytes)} · {new Date(item.uploadedAt).toLocaleDateString()}</p>{item.description && <p className="text-xs text-neutral-600 mt-1">{item.description}</p>}<p className="text-[10px] uppercase tracking-wide text-neutral-500 mt-1">{item.status === 'delivered' ? 'Entregado al cliente' : item.status === 'received' ? 'Recibido' : item.status === 'pending_approval' ? 'Pendiente de aprobación' : 'En revisión'}</p></div></div>
          <div className="flex shrink-0 gap-2"><button onClick={() => download(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold"><Download className="w-4 h-4" />Abrir / descargar</button>{staffMode && item.status !== 'delivered' && <button disabled={busy} onClick={() => publish(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><FileCheck2 className="w-4 h-4" />Entregar al cliente</button>}</div>
        </article>)}
      </div>
    </div>
  </section>;
};
