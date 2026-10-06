export default function LoadingPampulha() {
  return (
    <div className="mg-pampulha-scene pampulha-v4" aria-label="Animação da Igrejinha da Pampulha de Niemeyer">
      <div className="pampulha-sun" />
      <div className="pampulha-cloud" />
      <div className="pampulha-shore" />

      {/* Conjunto arquitetônico da Igreja São Francisco de Assis */}
      <div className="pampulha-church">
        <svg className="pampulha-church-svg" viewBox="0 0 185 108" aria-hidden="true">
          {/* Curvas parabólicas de concreto armado */}
          <path
            className="pampulha-shell pampulha-draw"
            d="M4 99 C7 81 14 68 27 64 C31 48 40 39 52 42 C59 25 70 17 81 23 C90 7 103 2 114 10 C127 20 130 46 133 65 C143 66 150 77 153 99 Z"
          />
          {/* Painel envidraçado / azulejos */}
          <path
            className="pampulha-glass pampulha-fill"
            d="M82 95 C84 46 96 16 113 11 C126 23 130 56 131 95 Z"
          />
          <g className="pampulha-glass-grid pampulha-fill">
            <path d="M89 93 L91 50 M98 94 L101 27 M107 95 L112 13 M117 95 L120 21 M126 94 L127 54" />
            <path d="M84 70 L130 70 M87 48 L127 48 M95 28 L121 28" />
          </g>
          {/* Entrada principal e marquise */}
          <path className="pampulha-door pampulha-fill" d="M91 95 L92 79 Q105 70 121 79 L123 95 Z" />
          <path className="pampulha-canopy pampulha-fill" d="M50 80 Q71 74 92 79" />
          {/* Campanário e cruz */}
          <path className="pampulha-tower pampulha-draw" d="M151 99 L157 13 L180 8 L176 99 Z" />
          <g className="pampulha-tower-grid pampulha-fill">
            <path d="M159 19 L176 91 M158 37 L174 99 M162 12 L178 73" />
            <path d="M177 20 L158 88 M176 40 L157 99 M174 11 L160 72" />
          </g>
          <path className="pampulha-cross pampulha-fill" d="M149 26 L149 7 M143 15 L155 15" />
        </svg>
      </div>

      {/* Águas da Lagoa da Pampulha e reflexo */}
      <div className="pampulha-water" />
      <div className="pampulha-reflection" />
      <div className="pampulha-ripple" />
    </div>
  );
}

