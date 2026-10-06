import { Route, Routes } from 'react-router-dom';
import HomePage from '../features/home/HomePage.jsx';
import HistoriaPage from '../features/historia/HistoriaPage.jsx';
import BalancoPage from '../features/balanco/BalancoPage.jsx';
import BalancoNaPraticaPage from '../features/balanco-na-pratica/BalancoNaPraticaPage.jsx';
import SaibaMaisPage from '../features/saiba-mais/SaibaMaisPage.jsx';
import ConquistasPage from '../features/conquistas/ConquistasPage.jsx';
import TrilhaJogosPage from '../features/trilha-jogos/TrilhaJogosPage.jsx';
import JogoPage from '../features/jogo/JogoPage.jsx';
import MainLayout from '../shared/components/layout/MainLayout.jsx';
import NotFoundPage from '../features/errors/NotFoundPage.jsx';
import LoadingShowcase from '../shared/components/loading/LoadingShowcase.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="historia" element={<HistoriaPage />} />
        <Route path="balanco" element={<BalancoPage />} />
        <Route path="dados" element={<BalancoNaPraticaPage />} />
        <Route path="jogos" element={<TrilhaJogosPage />} />
        <Route path="jogos/:phaseId" element={<JogoPage />} />
        <Route path="conquistas" element={<ConquistasPage />} />
        <Route path="creditos" element={<SaibaMaisPage />} />
        <Route path="loading" element={<LoadingShowcase />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}


