import MissionBox from './components/MissionBox.jsx';
import TreasureMap from './components/TreasureMap.jsx';
import { useTrailProgress } from './hooks/useTrailProgress.js';
import { useAuth } from '../../shared/hooks/useAuth.js';

export default function HomePage() {
  const { isGuest } = useAuth();
  const { progressBySlug, status, refresh } = useTrailProgress();

  const requireIdentification = () => {
    if (!isGuest) return true;
    window.dispatchEvent(new CustomEvent('bc:open-login'));
    return false;
  };

  return (
    <div className="mx-auto grid w-full max-w-[1260px] items-center gap-5 px-3 py-6 lg:grid-cols-[340px_minmax(560px,820px)] lg:justify-center lg:px-5">
      <section className="flex flex-col items-center gap-5 text-center">
        <div className="relative rounded-3xl border-[3px] border-[#8b6914] bg-gradient-to-br from-[#fdf6e3] via-[#f5e6c0] to-[#edd9a3] px-8 py-6 shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl before:pointer-events-none before:absolute before:inset-2 before:rounded-2xl before:border-2 before:border-dashed before:border-[#8b6914]/25">
          <p className="mb-1 text-xs font-black uppercase tracking-[0.25em] text-[#9b6b2a]">Bem-vindo ao</p>
          <h1 className="font-display text-4xl font-black leading-none text-[#5d2b0a] md:text-5xl">Balanço<br />Cidadão</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="h-0.5 w-10 rounded-full bg-[#f5a800]" />
            <span className="font-display font-black tracking-[0.2em] text-[#f5a800]">MINAS GERAIS</span>
            <span className="h-0.5 w-10 rounded-full bg-[#f5a800]" />
          </div>
        </div>
        <MissionBox />
        {status === 'error' && (
          <div role="alert" className="rounded-xl border-2 border-red-300 bg-red-50 p-3 text-sm font-bold text-red-800">
            Não foi possível consultar o progresso das trilhas.
            <button type="button" onClick={refresh} className="ml-2 underline">Tentar novamente</button>
          </div>
        )}
      </section>

      <TreasureMap
        progressBySlug={progressBySlug}
        progressStatus={status}
        onProtectedNavigation={requireIdentification}
      />
    </div>
  );
}
