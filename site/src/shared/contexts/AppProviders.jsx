import { AccessibilityProvider } from './AccessibilityContext.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { GameProgressProvider } from './GameProgressContext.jsx';
export function AppProviders({ children }) {
  return <AccessibilityProvider><AuthProvider><GameProgressProvider>{children}</GameProgressProvider></AuthProvider></AccessibilityProvider>;
}
