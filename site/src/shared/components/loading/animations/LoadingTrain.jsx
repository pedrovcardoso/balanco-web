export default function LoadingTrain() {
  const wagonWheels = [21, 53, 98, 130, 175, 207, 252, 284, 329, 361];

  return (
    <div className="mg-train-scene" aria-label="Animação do Trem das Serras">
      <div className="train-sky-glow" />
      <div className="train-hills" />
      <div className="train-track">
        <div className="train-sleepers" />
      </div>

      <svg className="train-svg" viewBox="0 0 500 132" aria-hidden="true">
        <defs>
          <linearGradient id="train-gold" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#edc15b" />
            <stop offset="1" stopColor="#ce8d32" />
          </linearGradient>
          <linearGradient id="train-cabin" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#c97649" />
            <stop offset="1" stopColor="#964d35" />
          </linearGradient>
          <linearGradient id="wagon-green" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#78966c" />
            <stop offset="1" stopColor="#486249" />
          </linearGradient>
          <linearGradient id="wagon-blue" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#689294" />
            <stop offset="1" stopColor="#3d6163" />
          </linearGradient>
          <linearGradient id="wagon-earth" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#bd8a58" />
            <stop offset="1" stopColor="#80543a" />
          </linearGradient>
        </defs>

        {/* 5 Vagões com cores variadas */}
        <g stroke="#2d3932" strokeWidth="3" strokeLinejoin="round">
          <g transform="translate(3 55)">
            <rect width="68" height="42" rx="9" fill="url(#wagon-green)" />
            <rect x="8" y="10" width="52" height="19" rx="5" fill="#9caf7b" opacity="0.62" />
            <path d="M11 9h46" stroke="#d0d8ab" opacity="0.3" />
            <path d="M68 30h9" stroke="#554234" strokeWidth="5" />
          </g>
          <g transform="translate(80 55)">
            <rect width="68" height="42" rx="9" fill="url(#wagon-earth)" />
            <rect x="8" y="10" width="52" height="19" rx="5" fill="#c49a69" opacity="0.65" />
            <path d="M11 9h46" stroke="#ead0a5" opacity="0.28" />
            <path d="M68 30h9" stroke="#554234" strokeWidth="5" />
          </g>
          <g transform="translate(157 55)">
            <rect width="68" height="42" rx="9" fill="url(#wagon-blue)" />
            <rect x="8" y="10" width="52" height="19" rx="5" fill="#83a9a5" opacity="0.58" />
            <path d="M11 9h46" stroke="#c0d5cb" opacity="0.27" />
            <path d="M68 30h9" stroke="#554234" strokeWidth="5" />
          </g>
          <g transform="translate(234 55)">
            <rect width="68" height="42" rx="9" fill="url(#wagon-green)" />
            <rect x="8" y="10" width="52" height="19" rx="5" fill="#94a96f" opacity="0.62" />
            <path d="M11 9h46" stroke="#d2d9a9" opacity="0.27" />
            <path d="M68 30h9" stroke="#554234" strokeWidth="5" />
          </g>
          <g transform="translate(311 55)">
            <rect width="68" height="42" rx="9" fill="url(#wagon-earth)" />
            <rect x="8" y="10" width="52" height="19" rx="5" fill="#b77d56" opacity="0.64" />
            <path d="M11 9h46" stroke="#dfb697" opacity="0.27" />
            <path d="M68 30h9" stroke="#554234" strokeWidth="5" />
          </g>
        </g>

        {/* Locomotiva */}
        <g transform="translate(388 0)" stroke="#2d3932" strokeWidth="3" strokeLinejoin="round">
          <path d="M6 91V25c0-9 7-16 16-16h28c9 0 16 7 16 16v66z" fill="url(#train-cabin)" />
          <rect x="6" y="5" width="60" height="16" rx="8" fill="#397789" />
          <path d="M10 12h52" stroke="#76a4a8" opacity="0.42" />
          <rect x="17" y="32" width="28" height="28" rx="5" fill="#91c6c6" />
          <path d="M21 36h17L21 53z" fill="#e2f0e9" opacity="0.68" />
          <path d="M61 52h45c20 0 33 12 33 29v10H61c-6 0-10-4-10-10V62c0-6 4-10 10-10z" fill="url(#train-gold)" />
          <path d="M69 66h27M69 78h36" stroke="#b96937" strokeWidth="5" strokeLinecap="round" />
          <path d="M80 52V38c0-5 4-9 9-9h9c5 0 9 4 9 9v14" fill="#397789" />
          <path d="M113 53V25h14v31" fill="#a7603a" />
          <rect x="109" y="18" width="22" height="10" rx="4" fill="#aa4f42" />
          <ellipse cx="132" cy="71" rx="16" ry="20" fill="#c66c3b" />
          <ellipse cx="132" cy="71" rx="7" ry="11" fill="#e7c664" />
          <rect x="2" y="86" width="140" height="18" rx="6" fill="#ad513f" />
          <path d="M138 83h23l-5 24h-25z" fill="#ad513f" />
          <path d="M149 89l-3 11" stroke="#e7c664" strokeWidth="5" strokeLinecap="round" />
        </g>

        {/* Rodas dos vagões girando */}
        <g fill="#29332e" stroke="#2d3932" strokeWidth="3">
          {wagonWheels.map((x) => (
            <g key={x} className="train-wheel-spin">
              <circle cx={x} cy="102" r="11" />
              <circle cx={x} cy="102" r="5" fill="#b79d62" stroke="none" />
              <path d={`M${x} 92v20M${x - 10} 102h20`} stroke="#806f51" strokeWidth="2" />
            </g>
          ))}
          {/* Rodas grandes da locomotiva */}
          <g className="train-wheel-spin">
            <circle cx="421" cy="104" r="15" />
            <circle cx="421" cy="104" r="7" fill="#b79d62" stroke="none" />
            <path d="M421 90v28M407 104h28" stroke="#806f51" strokeWidth="2" />
          </g>
          <g className="train-wheel-spin">
            <circle cx="485" cy="104" r="15" />
            <circle cx="485" cy="104" r="7" fill="#b79d62" stroke="none" />
            <path d="M485 90v28M471 104h28" stroke="#806f51" strokeWidth="2" />
          </g>
        </g>

        {/* Biela da locomotiva */}
        <path d="M421 104h64" stroke="#d0c29b" strokeWidth="6" strokeLinecap="round" />
        <path d="M421 104h64" stroke="#2d3932" strokeWidth="2" strokeLinecap="round" />

        {/* Fumaça da locomotiva */}
        <g fill="rgba(255,255,255,0.55)" stroke="rgba(45,57,50,0.3)" strokeWidth="2">
          <circle className="train-smoke-puff s1" cx="510" cy="18" r="8" />
          <circle className="train-smoke-puff s2" cx="510" cy="18" r="8" />
          <circle className="train-smoke-puff s3" cx="510" cy="18" r="8" />
        </g>
      </svg>
    </div>
  );
}

