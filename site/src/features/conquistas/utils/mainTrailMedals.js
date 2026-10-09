export const MAIN_TRAIL_DEFINITIONS = [
  {
    key: 'HISTORIA_HQ',
    title: 'História em Quadrinhos',
    shortName: 'História HQ',
    description: 'Concedida por concluir e resgatar a História em Quadrinhos da trilha principal.',
    icon: 'book-open',
    ribbon: 'red',
    coin: 'bronze',
  },
  {
    key: 'LIVRO_1',
    title: 'Livro 1 Concluído',
    shortName: 'Livro 1',
    description: 'Concedida por concluir e resgatar o primeiro livro da trilha principal.',
    icon: 'book',
    ribbon: 'blue',
    coin: 'bronze',
  },
  {
    key: 'LIVRO_2',
    title: 'Livro 2 Concluído',
    shortName: 'Livro 2',
    description: 'Concedida por concluir e resgatar o segundo livro da trilha principal.',
    icon: 'book',
    ribbon: 'purple',
    coin: 'silver',
  },
  {
    key: 'LIVRO_3',
    title: 'Livro 3 Concluído',
    shortName: 'Livro 3',
    description: 'Concedida por concluir e resgatar o terceiro livro da trilha principal.',
    icon: 'book',
    ribbon: 'green',
    coin: 'gold',
  },
  {
    key: 'BALANCO_DADOS',
    title: 'Balanço em Dados',
    shortName: 'Balanço Dados',
    description: 'Concedida por concluir e resgatar a etapa Balanço em Dados.',
    icon: 'chart-column',
    ribbon: 'blue',
    coin: 'silver',
  },
  {
    key: 'SAIBA_MAIS',
    title: 'Saiba Mais Concluído',
    shortName: 'Saiba Mais',
    description: 'Concedida por concluir e resgatar a etapa Saiba Mais da trilha principal.',
    icon: 'graduation-cap',
    ribbon: 'gold',
    coin: 'gold',
  },
];

export function buildMainTrailMedals(trailProgress) {
  const progressMap = new Map(
    (Array.isArray(trailProgress) ? trailProgress : [])
      .filter(Boolean)
      .map((item) => [String(item.itemKey || item.item_key || ''), item]),
  );

  return MAIN_TRAIL_DEFINITIONS.map((definition) => {
    const progress = progressMap.get(definition.key);
    const unlocked = Boolean(progress?.redeemed);
    const redeemedAt = progress?.redeemedAt || progress?.redeemed_at;

    return {
      ...definition,
      type: 'Trilha principal',
      key: `main-trail-${definition.key.toLowerCase()}`,
      unlocked,
      meta: unlocked
        ? redeemedAt
          ? `Concluída em ${new Date(redeemedAt).toLocaleDateString('pt-BR')}`
          : 'Etapa concluída'
        : 'Bloqueada · conclua esta etapa da trilha principal',
    };
  });
}
