import { useEffect, useState } from 'react';
import mgGeojsonUrl from '@assets/json/geojs-31-mun.json?url';

// Dados geográficos de Minas Gerais locais (Créditos: tbrugz/geodata-br / IBGE)
const MG_GEOJSON_URL = mgGeojsonUrl;

function buildGeoJsonSvg(geojson) {
  const rings = [];
  (Array.isArray(geojson.features) ? geojson.features : []).forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry?.coordinates) return;
    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach((ring) => ring.length && rings.push(ring));
    }
    if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => ring.length && rings.push(ring));
      });
    }
  });

  if (!rings.length) throw new Error('GeoJSON sem geometrias válidas');

  const points = rings.flat();
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = 240;
  const height = 190;
  const padding = 12;

  const rangeX = Math.max(maxX - minX, 0.0001);
  const rangeY = Math.max(maxY - minY, 0.0001);
  const scale = Math.min((width - padding * 2) / rangeX, (height - padding * 2) / rangeY);

  const offsetX = (width - rangeX * scale) / 2;
  const offsetY = (height - rangeY * scale) / 2;

  const project = ([lon, lat]) => [
    offsetX + (lon - minX) * scale,
    height - (offsetY + (lat - minY) * scale),
  ];

  const paths = rings
    .map((ring) => {
      const d = ring
        .map((point, i) => {
          const [x, y] = project(point);
          return `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');
      return `<path class="mg-map-feature" d="${d} Z" />`;
    })
    .join('');

  const outerD = buildOuterApproxPath(rings, project);
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Mapa de Minas Gerais">${paths}<path class="mg-map-outline" d="${outerD}" /></svg>`;
}

function buildOuterApproxPath(rings, project) {
  const all = rings.flat().map(project);
  const center = all.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  center.x /= all.length;
  center.y /= all.length;

  const buckets = new Map();
  const bucketCount = 96;

  all.forEach(([x, y]) => {
    const raw = Math.atan2(y - center.y, x - center.x);
    const angle = raw < 0 ? raw + Math.PI * 2 : raw;
    const bucket = Math.floor((angle / (Math.PI * 2)) * bucketCount);
    const distance = Math.hypot(x - center.x, y - center.y);
    const current = buckets.get(bucket);
    if (!current || distance > current.distance) {
      buckets.set(bucket, { x, y, distance });
    }
  });

  return (
    [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, p], i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ') + ' Z'
  );
}

export default function LoadingMap() {
  const [svgHtml, setSvgHtml] = useState(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetch(MG_GEOJSON_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((geojson) => {
        if (active) setSvgHtml(buildGeoJsonSvg(geojson));
      })
      .catch(() => {
        // Fallback estilizado de Minas Gerais caso offline
        if (active) {
          setSvgHtml(
            '<svg viewBox="0 0 260 220" role="img" aria-label="Representação de Minas Gerais"><path class="mg-map-outline" d="M58 83 L83 58 L105 65 L121 47 L151 51 L171 39 L196 51 L215 73 L206 99 L230 119 L214 144 L185 150 L168 174 L138 164 L118 181 L91 164 L61 167 L46 143 L59 119 L41 101 Z" /></svg>'
          );
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="mg-real-map" aria-label="Animação do Mapa de Minas Gerais">
      <div className="mg-map-scan" />
      <div className="mg-map-pin a" title="Finanças Públicas">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="m6 16.5l-3 2.94V11h3m5 3.66l-1.57-1.34L8 14.64V7h3m5 6l-3 3V3h3m2.81 9.81L17 11h5v5l-1.79-1.79L13 21.36l-3.47-3.02L5.75 22H3l6.47-6.34L13 18.64" />
        </svg>
      </div>
      <div className="mg-map-pin b" title="Cidadãos">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
          <path d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z" />
        </svg>
      </div>
      {svgHtml ? (
        <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
      ) : (
        <div className="mg-map-loading">Carregando mapa MG...</div>
      )}
    </div>
  );
}

