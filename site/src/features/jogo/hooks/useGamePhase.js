import { useState, useEffect } from 'react';
import { getGameMap, getQuestionsForPhase } from '../services/jogoService';
import { useAuth } from '../../../shared/hooks/useAuth';

export function useGamePhase(phaseId) {
  const { user } = useAuth();
  const [phase, setPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!phaseId) {
        setError('Fase não informada.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setPhase(null);

        const mapData = await getGameMap(user?.publicUserId || 'guest');
        const phaseInfo = Array.isArray(mapData)
          ? mapData.find((p) => String(p.publicPhaseId || p.phase_id || p.id) === String(phaseId))
          : null;

        const questions = await getQuestionsForPhase(phaseId);

        if (isMounted) {
          const rawMeta = phaseInfo?.metadataJson || phaseInfo?.metadata_json || phaseInfo?.metadata || {};
          const metadata = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : rawMeta;

          const engineSlug = phaseInfo?.engineSlug || metadata?.engineSlug || metadata?.type || 'quiz';
          const typeSlug = String(engineSlug).toLowerCase().replace(/_/g, '-');

          setPhase({
            id: phaseId,
            title: metadata?.title || phaseInfo?.title || phaseInfo?.phaseTitle || 'Missão do Jogo',
            subtitle: metadata?.subtitle || phaseInfo?.subtitle || 'Complete o desafio para progredir',
            prompt: metadata?.prompt || phaseInfo?.prompt || 'Responda com atenção.',
            engineSlug: typeSlug === 'ordem' ? 'ordem-correta' : typeSlug,
            metadata,
            rows: questions && questions.length > 0 ? questions : (metadata?.questions || []),
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('[useGamePhase] Erro ao carregar fase:', err);
        if (isMounted) {
          setError(err.message || 'Falha ao carregar dados da fase.');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [phaseId, user]);

  return { phase, loading, error };
}
