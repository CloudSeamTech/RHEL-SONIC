'use client';
import {useState} from 'react';
import {estimateSecurityBudget, type SecurityBudgetInput} from '@/lib/security-budget';
import './security-budget.css';
const fields: {key:keyof SecurityBudgetInput; label:string; help:string}[] = [
  {key:'licenses',label:'Fixed monthly licenses (USD)',help:'Include the real monthly commitment for Microsoft licenses, even when the VM is off.'},
  {key:'hourly',label:'Azure VM price per hour (USD)',help:'Use your actual regional quote. Enter 0 for the VMware-only compute path.'},
  {key:'hours',label:'Total Azure VM hours this month',help:'Add hours across all cloud hosts. This is planned use, not a reading of your subscription.'},
  {key:'persistent',label:'Monthly disks, storage and network (USD)',help:'Include resources that can continue charging while a VM is deallocated.'},
  {key:'security',label:'Protection, logging and other services (USD)',help:'Enter the estimated total for accepted plans, logging and other services; do not assume a trial covers everything.'},
];
export function SecurityBudget(){
  const [values,setValues]=useState<SecurityBudgetInput>({licenses:'',hourly:'',hours:'',persistent:'',security:''});
  const total=estimateSecurityBudget(values);
  return <section className="security-budget" aria-label="Practice cost worksheet">
    <span className="eyebrow">PRACTICE WORKSHEET · NO AZURE CONNECTION</span>
    <h2>Will this plan fit your $25 goal?</h2>
    <p>Enter your own quoted rates and planned use, including zeros. This calculator does not create resources, turn on protection, charge you or stop Azure spending.</p>
    <div className="security-budget-fields">{fields.map(field=><label key={field.key} htmlFor={`security-${field.key}`}><strong>{field.label}</strong><input id={`security-${field.key}`} type="number" min="0" step="any" inputMode="decimal" value={values[field.key]} onChange={event=>setValues(current=>({...current,[field.key]:event.target.value}))}/><small>{field.help}</small></label>)}</div>
    <output aria-live="polite">{total===null ? 'Fill every field with a non-negative number before estimating.' : `Estimated monthly total: $${total.toFixed(2)}. ${total>25 ? 'Outside the $25 goal: reduce the design or keep the free local path.' : total>=10 ? 'At or above the suggested $10 early-review threshold. Check the buffer before enabling anything.' : 'Below the early-review threshold, based only on the values entered.'}`}</output>
    <p>Taxes, changing usage and delayed meters can increase the bill. A budget alert or ExpiresOn tag is not a hard cap. Turn a tag into savings by identifying an owner and carrying out a verified stop, cleanup or cancellation.</p>
  </section>;
}
