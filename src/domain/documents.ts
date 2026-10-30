import type {ClientDocument} from '../types/index.ts';

export function validateDocumentFile(file: {size:number;type:string}) {
  if (file.size <= 0 || file.size >= 25 * 1024 * 1024) throw new Error('Selecciona un archivo no vacío de menos de 25 MB.');
  if (!/^(application\/pdf|image\/(jpeg|png|webp)|application\/msword|application\/vnd\.openxmlformats-officedocument\.(wordprocessingml\.document|spreadsheetml\.sheet|presentationml\.presentation))$/.test(file.type)) throw new Error('Admitimos PDF, Word, Excel, PowerPoint e imágenes JPG, PNG o WebP.');
}

export function documentVersion(previous:ClientDocument|undefined,caseId:string,clientId:string,actorUid:string,staff:boolean) {
  if (!previous) return {version:1,previousVersionId:null};
  if (previous.caseId!==caseId || previous.clientId!==clientId) throw new Error('La versión anterior pertenece a otro asunto o cliente.');
  if (!staff && (previous.uploadedByUid!==actorUid || previous.kind!=='client_upload')) throw new Error('Solo puedes añadir versiones de tus propios recaudos.');
  if (!Number.isSafeInteger(previous.version) || previous.version<1) throw new Error('Revisa el número de versión del documento anterior.');
  return {version:previous.version+1,previousVersionId:previous.id};
}
