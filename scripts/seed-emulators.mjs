import {initializeTestEnvironment} from '@firebase/rules-unit-testing';
import {doc,setDoc} from 'firebase/firestore';
import {randomBytes} from 'node:crypto';
const projectId='demo-binlegal-local';
if(process.env.FIRESTORE_EMULATOR_HOST!=='127.0.0.1:8080' || process.env.FIREBASE_AUTH_EMULATOR_HOST!=='127.0.0.1:9099')throw new Error('Solo se permite sembrar los emuladores locales previstos.');
const password=process.env.BINLEGAL_LOCAL_TEST_PASSWORD || randomBytes(18).toString('base64url');
const accounts=[['director@binlegal.test','Director de pruebas','admin'],['pasante@binlegal.test','Pasante de pruebas','intern'],['cliente@binlegal.test','Cliente de pruebas','client'],['ajeno@binlegal.test','Persona ajena de pruebas','client']];
const users=[];
for(const [email,name,role] of accounts){
 const body=JSON.stringify({email,password,returnSecureToken:true});
 let response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-local-only',{method:'POST',headers:{'Content-Type':'application/json'},body});
 let result=await response.json();
 if(result.error?.message==='EMAIL_EXISTS'){
  if(!process.env.BINLEGAL_LOCAL_TEST_PASSWORD)throw new Error('Las cuentas locales ya existen. Reinicia los emuladores con datos limpios o establece BINLEGAL_LOCAL_TEST_PASSWORD con la contraseña usada antes.');
  response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-local-only',{method:'POST',headers:{'Content-Type':'application/json'},body});result=await response.json();
 }
 if(!response.ok)throw new Error('No se pudo preparar '+email+': '+JSON.stringify(result.error));
 users.push({uid:result.localId,email,name,role});
}
const env=await initializeTestEnvironment({projectId,firestore:{host:'127.0.0.1',port:8080}});
try{await env.withSecurityRulesDisabled(async context=>{const db=context.firestore();for(const user of users){await setDoc(doc(db,'users',user.uid),{userId:user.uid,email:user.email,displayName:user.name,role:user.role,createdAt:new Date().toISOString()});if(user.role==='admin')await setDoc(doc(db,'admins',user.uid),{testOnly:true});}
 const [director,worker,client]=users;
 await setDoc(doc(db,'processes','local-case-001'),{id:'local-case-001',officeId:'binlegal',userId:client.uid,clientEmail:client.email,clientName:client.name,title:'Asunto ficticio de prueba integral',category:'Contratos',status:'redaccion',caseStage:'in_progress',progress:0,assignedLawyer:director.name,assignedLawyerId:director.uid,assignedLawyerIds:[director.uid,worker.uid],nextMilestone:'Crear y revisar tarea de prueba',targetDate:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),workRevision:0,controlsRevision:0});
});console.log('Cuentas locales listas. Contraseña exclusiva de pruebas: '+password);for(const user of users)console.log(user.role+': '+user.email); }finally{await env.cleanup();}
