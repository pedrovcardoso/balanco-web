import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useGameMap } from './hooks/useGameMap.js';
import GameMap from './components/GameMap.jsx';
import LevelModal from './components/LevelModal.jsx';
import MedalModal from './components/MedalModal.jsx';
import AchievementCard from '../../shared/components/ui/AchievementCard.jsx';
import api from '../../lib/api.js';
import { Loading } from '../../shared/components/loading/index.js';
import './trilhaJogos.css';

export default function TrilhaJogosPage() {
  const {
    loading,
    error,
    mapSections,
    levelPositions,
    mapHeight,
    selectedLevel,
    setSelectedLevel,
    selectedMedalSection,
    setSelectedMedalSection,
    user,
    isGuest,
    allGamesCompleted,
    claimed,
    setClaimed,
    reloadMap,
  } = useGameMap();

  const [claiming, setClaiming] = useState(false);

  const handleClaimMedal = useCallback(async () => {
    if (claimed) return { success: true };

    if (!user || isGuest) {
      window.dispatchEvent(new CustomEvent('bc:open-login'));
      return { requiresLogin: true };
    }

    setClaiming(true);
    try {
      await api.post('/trails/redeem', { itemKey: 'JOGOS_COMPLETOS' });
      setClaimed(true);
      window.dispatchEvent(
        new CustomEvent('bc:trail-progress-changed', {
          detail: { itemKey: 'JOGOS_COMPLETOS', status: 'completed', progressPercent: 100 },
        })
      );
      return { success: true };
    } catch (err) {
      console.error('[TrilhaJogosPage] Erro ao resgatar medalha:', err);
      throw err;
    } finally {
      setClaiming(false);
    }
  }, [claimed, user, isGuest, setClaimed]);

  const handleSelectLevel = (sectionIndex, phaseIndex) => {
    const section = mapSections[sectionIndex];
    const row = section?.phases?.[phaseIndex];
    if (section && row) {
      const state =
        row.status === 'completed'
          ? 'completed'
          : row.status === 'available'
            ? 'available'
            : Number(row.phaseOrder || 0) === 1
              ? 'available'
              : 'locked';
      setSelectedLevel({ section, row, state });
    }
  };

  const handleOpenMedal = (sectionIndex) => {
    const section = mapSections[sectionIndex];
    if (section) {
      setSelectedMedalSection(section);
    }
  };

  if (loading) {
    return (
      <Loading
        animation="random"
        progress={0}
        message="Carregando a trilha de jogos..."
      />
    );
  }

  return (
    <main id="conteudo-principal" tabIndex={-1} className="page-shell">
      <div className="top-actions">
        <Link className="back-btn" to="/">
          <Icon icon="fa6-solid:arrow-left" aria-hidden="true" />
          Voltar
        </Link>
        {user && (
          <span className="game-user-chip">
            <Icon icon="fa6-solid:user" aria-hidden="true" />
            <span>Olá, {(user.displayName || 'Participante').split(' ')[0]}</span>
          </span>
        )}
      </div>

      <header className="hero" aria-labelledby="pageTitle">
        <h1 id="pageTitle" className="hero-title">
          Sessão dos Jogos
        </h1>
        <p className="hero-description">
          Avance pelas fases, conquiste estrelas e libere medalhas em cada seção. Complete toda a jornada para receber seu certificado final de participação.
        </p>
      </header>

      {error ? (
        <div className="text-center p-8 bg-red-50 border-2 border-red-300 rounded-2xl my-4">
          <Icon icon="fa6-solid:triangle-exclamation" className="text-4xl text-red-500 mb-2" />
          <h2 className="text-xl font-bold text-red-700">Não foi possível carregar a trilha</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition"
            onClick={reloadMap}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <GameMap
            mapSections={mapSections}
            levelPositions={levelPositions}
            mapHeight={mapHeight}
            onSelectLevel={handleSelectLevel}
            onOpenMedal={handleOpenMedal}
          />

          {/* Card de Medalha de Conquista da Trilha de Jogos */}
          <div className="w-full mt-6">
            <AchievementCard
              id="trilhaJogosAchievement"
              kicker="Conquista dos Jogos"
              title="Mestre das Etapas!"
              description="Complete todas as fases e seções dos jogos educativos para resgatar sua medalha especial da jornada."
              messageText={
                claimed
                  ? 'Conquista registrada com sucesso! Ela já está disponível na sua estante de medalhas.'
                  : allGamesCompleted
                  ? 'Parabéns! Você concluiu todos os jogos da trilha. Clique no botão abaixo para resgatar sua medalha.'
                  : 'Complete todas as fases de todas as seções para liberar o resgate da medalha.'
              }
              medalIcon="fa6-solid:gamepad"
              reachedEnd={allGamesCompleted}
              claimed={claimed}
              loading={claiming}
              onClaim={handleClaimMedal}
              showClaimButton={true}
              statusLockedText="Em progresso"
              statusReadyText="Pronta para resgate"
              statusClaimedText="Medalha conquistada"
            />
          </div>
        </>
      )}

      {/* Modais */}
      <LevelModal
        selected={selectedLevel}
        onClose={() => setSelectedLevel(null)}
      />
      <MedalModal
        section={selectedMedalSection}
        onClose={() => setSelectedMedalSection(null)}
      />
    </main>
  );
}

