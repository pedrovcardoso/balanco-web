import { useContext } from 'react'; import { AccessibilityContext } from '../contexts/AccessibilityContext.jsx';
export function useAccessibility(){const value=useContext(AccessibilityContext);if(!value)throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider.');return value;}
