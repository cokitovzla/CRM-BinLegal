import type {LeadBudget} from '../types/index.ts';

const cents=(amount:number)=>Math.round((amount+Number.EPSILON)*100);
export function calculateBudget(budget:LeadBudget) {
 if(budget.items.some(item=>!Number.isFinite(item.quantity)||item.quantity<=0||!Number.isFinite(item.unitPrice)||item.unitPrice<0))throw new Error('Revisa las cantidades y tarifas.');
 const subtotal=budget.items.reduce((sum,item)=>sum+cents(item.quantity*item.unitPrice),0);
 const discount=cents(budget.discount||0);
 if(!Number.isFinite(discount)||discount<0||discount>subtotal)throw new Error('El descuento debe estar entre cero y el subtotal.');
 const mode=budget.taxMode||'none';
 if(!['none','included','added'].includes(mode))throw new Error('Selecciona un tratamiento del impuesto válido.');
 const rate=budget.taxRate??16;
 if(!Number.isFinite(rate)||rate<0||rate>100)throw new Error('La tasa debe estar entre 0 y 100.');
 const net=subtotal-discount;
 const base=mode==='included'?Math.round(net/(1+rate/100)):net;
 const tax=mode==='included'?net-base:mode==='added'?Math.round(base*rate/100):0;
 return {subtotal:subtotal/100,discount:discount/100,base:base/100,tax:tax/100,total:(base+tax)/100,rate,mode};
}
