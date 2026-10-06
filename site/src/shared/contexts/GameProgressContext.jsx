import { createContext, useCallback, useMemo, useState } from 'react';
export const GameProgressContext=createContext(null);
export function GameProgressProvider({ children }) {
  const [trailProgress,setTrailProgress]=useState([]); const [phaseProgress,setPhaseProgress]=useState(null);
  const refresh=useCallback(async()=>{},[]);
  const value=useMemo(()=>({trailProgress,phaseProgress,setTrailProgress,setPhaseProgress,refresh}),[trailProgress,phaseProgress,refresh]);
  return <GameProgressContext.Provider value={value}>{children}</GameProgressContext.Provider>;
}
