import { useEffect } from 'react';
export function useClickOutside(ref,handler){useEffect(()=>{const listener=(event)=>{if(ref.current&&!ref.current.contains(event.target))handler(event);};document.addEventListener('pointerdown',listener);return()=>document.removeEventListener('pointerdown',listener);},[ref,handler]);}
