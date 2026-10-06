export default function SVGFilters() {
  return (
    <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        {/* Protanopia (Deficiência de vermelho) */}
        <filter id="bc-filter-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.56667 0.43333 0       0 0
                    0.55833 0.44167 0       0 0
                    0       0.24167 0.75833 0 0
                    0       0       0       1 0"
          />
        </filter>

        {/* Deuteranopia (Deficiência de verde) */}
        <filter id="bc-filter-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0   0 0
                    0.7   0.3   0   0 0
                    0     0.3   0.7 0 0
                    0     0     0   1 0"
          />
        </filter>

        {/* Tritanopia (Deficiência de azul) */}
        <filter id="bc-filter-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05    0       0 0
                    0    0.43333 0.56667 0 0
                    0    0.475   0.525   0 0
                    0    0       0       1 0"
          />
        </filter>

        {/* Achromatopsia (Monocromático / Visão em escala de cinza pura) */}
        <filter id="bc-filter-achromatopsia">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0     0     0     1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
