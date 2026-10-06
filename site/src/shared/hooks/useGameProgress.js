import { useContext } from 'react'; import { GameProgressContext } from '../contexts/GameProgressContext.jsx';
export function useGameProgress(){const value=useContext(GameProgressContext);if(!value)throw new Error('useGameProgress deve ser usado dentro de GameProgressProvider.');return value;}
