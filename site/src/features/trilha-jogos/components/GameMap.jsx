import { MAP_WIDTH, buildSmoothPath } from '../hooks/useGameMap.js';
import SectionLabel from './SectionLabel.jsx';
import PhaseNode from './PhaseNode.jsx';

export default function GameMap({
  mapSections,
  levelPositions,
  mapHeight,
  onSelectLevel,
  onOpenMedal,
}) {
  const smoothPath = buildSmoothPath(levelPositions);

  return (
    <section className="map-board" style={{ height: `${mapHeight}px` }} aria-label="Mapa de fases dos jogos">
      <div className="map-inner">
        {/* Camada de fundos das seções */}
        <div id="sectionBackgrounds" aria-hidden="true">
          {mapSections.map((section, index) => {
            const next = mapSections[index + 1];
            const top = Math.max(0, section.labelY - 56);
            const bottom = next ? Math.max(top + 130, next.labelY - 58) : mapHeight;
            return (
              <div
                key={section.id || index}
                className="section-background"
                style={{
                  top: `${top}px`,
                  height: `${Math.max(120, bottom - top)}px`,
                  background: section.color,
                }}
              />
            );
          })}
        </div>

        {/* Camada SVG da rota */}
        <div id="routeLayer" aria-hidden="true">
          <svg
            className="route-svg integrated-route"
            viewBox={`0 0 ${MAP_WIDTH} ${mapHeight}`}
            preserveAspectRatio="none"
          >
            <path className="route-base" d={smoothPath} />
            <path className="route-stripe" d={smoothPath} />
          </svg>
        </div>

        {/* Rótulos e medalhas de cada seção */}
        <div id="sectionLabels">
          {mapSections.map((section, index) => (
            <SectionLabel
              key={section.id || index}
              section={section}
              sectionIndex={index}
              mapHeight={mapHeight}
              onOpenMedal={onOpenMedal}
            />
          ))}
        </div>

        {/* Nós das fases */}
        <div id="levelsLayer">
          {mapSections.flatMap((section, sectionIndex) => {
            let runningIndex = 0;
            for (let i = 0; i < sectionIndex; i++) {
              runningIndex += mapSections[i].phases.length;
            }

            return section.phases.map((row, phaseIndex) => {
              const globalIndex = runningIndex + phaseIndex;
              const pos = levelPositions[globalIndex] || { x: MAP_WIDTH / 2, y: 105 };

              return (
                <PhaseNode
                  key={row.gamePhaseId || globalIndex}
                  row={row}
                  sectionColor={section.color}
                  sectionIndex={sectionIndex}
                  phaseIndex={phaseIndex}
                  globalIndex={globalIndex}
                  position={pos}
                  mapHeight={mapHeight}
                  onSelect={onSelectLevel}
                />
              );
            });
          })}
        </div>
      </div>
    </section>
  );
}
