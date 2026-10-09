export function parseJson(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

export function normalizeEngineSlug(value) {
  const slug = String(value || 'quiz').trim().toLowerCase().replace(/_/g, '-');
  const aliases = {
    ordem: 'ordem-correta', sort: 'ordem-correta', ordering: 'ordem-correta',
    match: 'flow', ligacao: 'flow', associacao: 'flow',
    'word-search': 'caca-palavras', cacapalavras: 'caca-palavras',
    crossword: 'cruzadinha', 'true-false': 'swipe', 'verdadeiro-falso': 'swipe',
  };
  return aliases[slug] || slug;
}

function arrayValue(value) {
  const parsed = parseJson(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function normalizeQuestion(question, index = 0) {
  const metadata = parseJson(
    question?.metadata ?? question?.metadataJson ?? question?.metadata_json,
    {},
  );
  const options = arrayValue(
    question?.options ?? question?.optionsJson ?? question?.options_json ?? metadata.options,
  );
  const phaseOrder = Number(
    question?.phaseQuestionOrder ?? question?.phase_question_order ??
    question?.orderIndex ?? question?.order_index ?? metadata.order ?? metadata.orderIndex ?? index + 1,
  );
  const answer = question?.correctAnswer ?? question?.correct_answer ?? metadata.answer ?? '';
  const prompt = String(question?.prompt ?? metadata.prompt ?? metadata.text ?? metadata.term ?? '').trim();

  return {
    ...question,
    id: question?.questionId ?? question?.publicQuestionId ?? question?.public_id ?? question?.id ?? `question-${index}`,
    questionId: question?.questionId ?? question?.id ?? null,
    prompt,
    simpleExplanation: question?.simpleExplanation ?? question?.simple_explanation ?? metadata.explanation ?? metadata.description ?? '',
    correctAnswer: answer,
    options,
    metadata: {
      ...metadata,
      text: metadata.text ?? prompt,
      label: metadata.label ?? prompt,
      order: Number.isFinite(phaseOrder) ? phaseOrder : index + 1,
    },
    phaseQuestionOrder: Number.isFinite(phaseOrder) ? phaseOrder : index + 1,
  };
}

export function normalizePhaseQuestions(value) {
  const rows = Array.isArray(value) ? value : value?.items ?? value?.questions ?? [];
  return rows.map(normalizeQuestion).filter((row) => row.prompt || Object.keys(row.metadata).length);
}
