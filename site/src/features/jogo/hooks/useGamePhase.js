import { useEffect, useState } from 'react';
import { getGameMap, getQuestionsForPhase } from '../services/jogoService';
import { normalizeEngineSlug, normalizePhaseQuestions, parseJson } from '../utils/gameData';

export function useGamePhase(phaseId) {
  const [phase, setPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      if (!phaseId) {
        setError('Fase não informada.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setPhase(null);

      try {
        const mapData = await getGameMap();
        if (controller.signal.aborted) return;

        const identifier = String(phaseId);
        const phaseInfo = mapData.find((item) =>
          [item.publicPhaseId, item.gamePhaseId, item.public_id, item.phase_id, item.id, item.slug]
            .filter((value) => value != null && value !== '')
            .some((value) => String(value) === identifier),
        );

        if (!phaseInfo) throw new Error('A fase não foi encontrada no mapa de jogos.');

        const questionsData = await getQuestionsForPhase(phaseId, { random: false, limit: 50 });
        if (controller.signal.aborted) return;

        const config = parseJson(phaseInfo.configJson ?? phaseInfo.config_json, {});
        const metadata = parseJson(
          phaseInfo.metadataJson ?? phaseInfo.metadata_json ?? phaseInfo.metadata,
          {},
        );
        const mergedMetadata = { ...config, ...metadata };
        const rowsFromApi = normalizePhaseQuestions(questionsData);
        const rowsFromConfig = normalizePhaseQuestions(mergedMetadata.questions);
        const rows = rowsFromApi.length ? rowsFromApi : rowsFromConfig;
        const engineSlug = normalizeEngineSlug(
          phaseInfo.engineSlug ?? mergedMetadata.engineSlug ?? mergedMetadata.mode ?? mergedMetadata.type,
        );

        if (!rows.length) {
          throw new Error(
            `A fase “${phaseInfo.phaseTitle ?? phaseInfo.title ?? phaseId}” existe, mas a API não retornou itens vinculados. Verifique tb_phase_question e se as perguntas estão ativas.`,
          );
        }

        setPhase({
          id: phaseInfo.publicPhaseId ?? phaseInfo.gamePhaseId ?? phaseInfo.id ?? phaseId,
          databaseId: phaseInfo.gamePhaseId ?? phaseInfo.phase_id ?? phaseInfo.id ?? null,
          title: phaseInfo.phaseTitle ?? phaseInfo.title ?? mergedMetadata.title ?? 'Missão do Jogo',
          subtitle: phaseInfo.description ?? mergedMetadata.subtitle ?? 'Complete o desafio para progredir',
          prompt: mergedMetadata.prompt ?? 'Responda com atenção para alcançar o objetivo.',
          engineSlug,
          passScore: Number(phaseInfo.passScore ?? phaseInfo.pass_score ?? 60),
          maxScore: Number(phaseInfo.maxScore ?? phaseInfo.max_score ?? 100),
          config,
          metadata: mergedMetadata,
          rows,
        });
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError.message || 'Falha ao carregar dados da fase.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [phaseId]);

  return { phase, loading, error };
}
