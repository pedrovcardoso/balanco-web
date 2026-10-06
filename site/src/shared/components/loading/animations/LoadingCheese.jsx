import paoDeQueijoImg from '@assets/images/loading/pao-de-queijo.png';

export default function LoadingCheese() {
  return (
    <div className="mg-cheese-scene asset-cheese" aria-label="Animação do Queijo Minas e Pão de Queijo">
      <div className="cheese-halo" />
      <div className="cheese-board" />

      {/* Roda de Queijo Minas completando fatias */}
      <svg className="cheese-wheel-svg" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="cheese-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1a0" />
            <stop offset="0.56" stopColor="#f2c94c" />
            <stop offset="1" stopColor="#d7901c" />
          </linearGradient>
        </defs>

        <circle className="cheese-base-ring" cx="60" cy="60" r="51" />

        {/* 8 fatias preenchendo em sentido horário */}
        <g fill="url(#cheese-gold)">
          <path className="cheese-wedge w1" d="M60 60 L60 9 A51 51 0 0 1 96.06 23.94 Z" />
          <path className="cheese-wedge w2" d="M60 60 L96.06 23.94 A51 51 0 0 1 111 60 Z" />
          <path className="cheese-wedge w3" d="M60 60 L111 60 A51 51 0 0 1 96.06 96.06 Z" />
          <path className="cheese-wedge w4" d="M60 60 L96.06 96.06 A51 51 0 0 1 60 111 Z" />
          <path className="cheese-wedge w5" d="M60 60 L60 111 A51 51 0 0 1 23.94 96.06 Z" />
          <path className="cheese-wedge w6" d="M60 60 L23.94 96.06 A51 51 0 0 1 9 60 Z" />
          <path className="cheese-wedge w7" d="M60 60 L9 60 A51 51 0 0 1 23.94 23.94 Z" />
          <path className="cheese-wedge w8" d="M60 60 L23.94 23.94 A51 51 0 0 1 60 9 Z" />
        </g>

        {/* Olhos/furos do queijo curado */}
        <circle className="cheese-hole" cx="78" cy="31" r="4" />
        <circle className="cheese-hole" cx="91" cy="66" r="3.5" />
        <circle className="cheese-hole" cx="67" cy="91" r="4" />
        <circle className="cheese-hole" cx="34" cy="74" r="3.5" />
        <circle className="cheese-hole" cx="39" cy="39" r="3" />
        <circle className="cheese-rind" cx="60" cy="60" r="51" />
      </svg>

      {/* Cesta de pães de queijo */}
      <div className="pao-static-wrap">
        <img
          className="pao-static"
          src={paoDeQueijoImg}
          alt="Cesta de Pão de Queijo"
          loading="eager"
        />
      </div>
    </div>
  );
}

