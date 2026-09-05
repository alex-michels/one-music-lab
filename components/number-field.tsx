'use client';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
export function NumberField({ value, onValue, min, max, ...props }: Omit<ComponentProps<'input'>,'value'|'onChange'|'min'|'max'|'type'> & {value:number;onValue:(value:number)=>void;min:number;max:number}) {
  const [draft,setDraft]=useState(String(value));const focused=useRef(false);
  useEffect(()=>{if(!focused.current)setDraft(String(Number(value.toFixed(4))));},[value]);
  return <input {...props} type="number" min={min} max={max} value={draft} onFocus={()=>{focused.current=true;}} onChange={e=>{const raw=e.target.value;setDraft(raw);const n=Number(raw);if(raw!==''&&Number.isFinite(n)&&n>=min&&n<=max)onValue(n);}} onBlur={()=>{focused.current=false;const parsed=draft.trim()===''?value:Number(draft);const n=Number.isFinite(parsed)?Math.max(min,Math.min(max,parsed)):value;onValue(n);setDraft(String(Number(n.toFixed(4))));}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/>;
}
