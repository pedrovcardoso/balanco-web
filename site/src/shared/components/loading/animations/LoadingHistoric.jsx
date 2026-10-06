export default function LoadingHistoric() {
  return (
    <div className="mg-historic-scene" aria-label="Animação de Cidades Históricas de Minas Gerais">
      <div className="historic-moonlight" />
      <div className="gold-spark a" />
      <div className="gold-spark b" />
      <div className="gold-spark c" />
      <div className="historic-arch" />

      {/* Lampião colonial balançando */}
      <div className="historic-lamp" title="Lampião Colonial">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="m16 5l-1-3h-2l-1 3l-6 3h2l.6 3H4V7H2v10h2v-4h5l1 5l2 2l1 2h2l1-2l2-2l2-10h2m-5.84 9h-4.32L10 8h8Z" />
        </svg>
      </div>

      {/* Sino tocando */}
      <div className="historic-bell" title="Sino Histórico">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 21h4a2 2 0 0 1-2 2a2 2 0 0 1-2-2m11-2v1H3v-1l2-2v-6c0-3.1 2.03-5.83 5-6.71V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v.29c2.97.88 5 3.61 5 6.71v6zm-4-8a5 5 0 0 0-5-5a5 5 0 0 0-5 5v7h10zm2.75-7.81l-1.42 1.42A8.98 8.98 0 0 1 21 11h2c0-2.93-1.16-5.75-3.25-7.81M1 11h2c0-2.4.96-4.7 2.67-6.39L4.25 3.19A10.96 10.96 0 0 0 1 11" />
        </svg>
      </div>

      {/* Calçamento de pedra sabão / pé de moleque */}
      <div className="stone-road" />
    </div>
  );
}

