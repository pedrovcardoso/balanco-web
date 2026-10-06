import AppRoutes from './routes/AppRoutes.jsx';
import ErrorBoundary from './shared/components/ui/ErrorBoundary.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
