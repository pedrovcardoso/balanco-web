export default function LoadingCoffee() {
  return (
    <div className="mg-coffee-scene" aria-label="Animação do Café Mineiro">
      <div className="coffee-halo" />

      {/* Chaleira inclinando para servir */}
      <div className="kettle-wrap">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.5 3C7.8 3 4 5.7 4 9c0 1.2.5 2.3 1.4 3.3A6.8 6.8 0 0 0 4 16.5V20c0 1.1.9 2 2 2h13a2 2 0 0 0 2-2v-3.5c0-1.2-.3-2.4-1-3.5l2-2l-3-3l-2.1 2.1a9.2 9.2 0 0 0-9.3.3A2 2 0 0 1 7 9c0-1.8 2.5-3.3 5.5-3.3c1.4 0 2.8.4 3.8 1l2-2A10 10 0 0 0 12.5 3m0 8c3.5 0 6.5 3 6.5 5.5V20H6v-3.5C6 14 9 11 12.5 11m.5 1.5c-3 0-5 1.5-5 4.5v1h2v-1c0-1 0-3.5 3-4.5" />
        </svg>
      </div>

      {/* Gotas de café caindo */}
      <svg className="coffee-drops" viewBox="0 0 195 180" aria-hidden="true">
        <g fill="#744320">
          <ellipse cx="113" cy="73" rx="2.1" ry="4.2">
            <animate attributeName="cy" dur="1.05s" repeatCount="indefinite" values="73;105;128" />
            <animate attributeName="opacity" dur="1.05s" repeatCount="indefinite" values="0;1;0" />
          </ellipse>
          <ellipse cx="117" cy="73" rx="1.8" ry="3.7">
            <animate attributeName="cy" dur="1.05s" begin="0.34s" repeatCount="indefinite" values="73;105;128" />
            <animate attributeName="opacity" dur="1.05s" begin="0.34s" repeatCount="indefinite" values="0;1;0" />
          </ellipse>
          <ellipse cx="121" cy="73" rx="1.6" ry="3.3">
            <animate attributeName="cy" dur="1.05s" begin="0.68s" repeatCount="indefinite" values="73;105;128" />
            <animate attributeName="opacity" dur="1.05s" begin="0.68s" repeatCount="indefinite" values="0;1;0" />
          </ellipse>
        </g>
      </svg>

      {/* Vapor do café quente */}
      <div className="coffee-steam s1" />
      <div className="coffee-steam s2" />

      {/* Xícara e pires com preenchimento líquido */}
      <div className="coffee-cup">
        <div className="cup-saucer" />
        <div className="cup-handle" />
        <div className="cup-shell">
          <svg className="coffee-svg" viewBox="0 0 69 48" preserveAspectRatio="none" aria-hidden="true">
            <path fill="#6b3b1d">
              <animate
                attributeName="d"
                dur="9.2s"
                repeatCount="indefinite"
                values="M3 43 Q18 40 34 43 T66 43 L66 48 L3 48 Z;M3 43 Q18 40 34 43 T66 43 L66 48 L3 48 Z;M3 38 Q18 34 34 38 T66 38 L66 48 L3 48 Z;M3 33 Q18 38 34 33 T66 33 L66 48 L3 48 Z;M3 27 Q18 22 34 27 T66 27 L66 48 L3 48 Z;M3 21 Q18 26 34 21 T66 21 L66 48 L3 48 Z;M3 15 Q18 10 34 15 T66 15 L66 48 L3 48 Z;M3 11 Q18 16 34 11 T66 11 L66 48 L3 48 Z;M3 12 Q18 8 34 12 T66 12 L66 48 L3 48 Z;M3 43 Q18 40 34 43 T66 43 L66 48 L3 48 Z"
                keyTimes="0;.28;.36;.44;.52;.6;.68;.74;.86;1"
                calcMode="spline"
                keySplines=".42 0 .58 1;.3 0 .25 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
              />
            </path>
            <ellipse cx="34.5" cy="12" rx="31" ry="4" fill="#8b572d" opacity="0">
              <animate
                attributeName="cy"
                dur="9.2s"
                repeatCount="indefinite"
                values="43;43;38;33;27;21;15;11;12;43"
                keyTimes="0;.28;.36;.44;.52;.6;.68;.74;.86;1"
              />
              <animate attributeName="ry" dur="2.1s" repeatCount="indefinite" values="3;4.5;3" />
              <animate
                attributeName="opacity"
                dur="9.2s"
                repeatCount="indefinite"
                values="0;0;.34;.48;.58;.66;.72;.76;.72;0"
                keyTimes="0;.28;.36;.44;.52;.6;.68;.74;.86;1"
              />
            </ellipse>
          </svg>
        </div>
      </div>
    </div>
  );
}

