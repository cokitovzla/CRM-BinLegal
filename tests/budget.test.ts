import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateBudget} from '../src/domain/budget.ts';
import type {LeadBudget} from '../src/types/index.ts';
const budget:LeadBudget={currency:'USD',status:'borrador',items:[{id:'one',concept:'Servicio',area:'Contratos',quantity:1,unitPrice:100}]};
test('included tax preserves the quoted total and reconciles base plus tax',()=>{
 const result=calculateBudget({...budget,taxMode:'included',taxRate:16});
 assert.equal(result.base,86.21);assert.equal(result.tax,13.79);assert.equal(result.total,100);
});
test('added tax and discount apply to the discounted base while legacy quotes keep their total',()=>{
 assert.equal(calculateBudget(budget).total,100);
 const result=calculateBudget({...budget,discount:10,taxMode:'added',taxRate:16});
 assert.equal(result.base,90);assert.equal(result.tax,14.4);assert.equal(result.total,104.4);
 assert.throws(()=>calculateBudget({...budget,discount:101}));
 assert.throws(()=>calculateBudget({...budget,taxRate:NaN}));
});
