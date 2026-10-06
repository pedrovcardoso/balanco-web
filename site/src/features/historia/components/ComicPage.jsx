import { forwardRef } from 'react';

const ComicPage = forwardRef(function ComicPage({ page }, ref) {
  if (!page) return null;

  const regions = [...(page.regions || [])].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0),
  );

  return (
    <div ref={ref} className="history-comic-page">
      <img
        src={page.resolvedImage}
        alt={page.alt || `Página ${page.page} da história em quadrinhos`}
        draggable="false"
        decoding="async"
      />

      <div className="history-speech-layer">
        {regions.map((region, index) => {
          const character = region.character ? `${region.character}: ` : '';

          return (
            <button
              key={`${page.page}-${region.order || index}`}
              type="button"
              className="history-hotspot"
              style={{
                left: `${region.x}%`,
                top: `${region.y}%`,
                width: `${region.width}%`,
                height: `${region.height}%`,
                borderRadius: region.shape === 'oval' ? '50%' : '10px',
              }}
              aria-label={`${region.typeLabel || 'Trecho'} ${index + 1}: ${character}${region.text}`}
              onClick={(event) => event.stopPropagation()}
            >
              <span className="sr-only">
                {character}
                {region.text}
              </span>
            </button>
          );
        })}
      </div>

      <span className="history-page-number">Página {page.page}</span>
    </div>
  );
});

export default ComicPage;
