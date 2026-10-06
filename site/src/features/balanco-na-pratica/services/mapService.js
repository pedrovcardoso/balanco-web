import * as echarts from 'echarts/core';
import { dissolve } from '@turf/dissolve';
import { featureCollection } from '@turf/helpers';
import geoJsonUrl from '@assets/json/geojs-31-mun.json?url';

const GEOJSON_URL = geoJsonUrl;
export const MAP_NAME = 'mg-regioes-intermediarias';

let geoJsonPromise = null;
let registeredGeoJson = null;

function municipalityCode(feature) {
  const properties = feature?.properties || {};
  return String(
    properties.id ||
      properties.codarea ||
      properties.codArea ||
      properties.CD_MUN ||
      properties.codigo ||
      feature?.id ||
      '',
  ).replace(/\D/g, '');
}

async function requestJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`A requisição para ${url} retornou HTTP ${response.status}.`);
  }

  return response.json();
}

/**
 * Carrega e sintetiza o GeoJSON por regiões geográficas de Minas Gerais.
 * O resultado fica em cache global e localStorage para evitar refazer fetch e Turf dissolve a cada carregamento.
 */
export async function loadAndRegisterRegionsMap(municipios = []) {
  if (registeredGeoJson) {
    return registeredGeoJson;
  }

  if (geoJsonPromise) {
    return geoJsonPromise;
  }

  geoJsonPromise = (async () => {
    // 1. Tenta recuperar do localStorage para evitar execução do Turf dissolve
    const cachedString = localStorage.getItem('mg_regioes_geojson_cache');
    if (cachedString) {
      try {
        const cachedGeoJson = JSON.parse(cachedString);
        echarts.registerMap(MAP_NAME, cachedGeoJson);
        registeredGeoJson = cachedGeoJson;
        return cachedGeoJson;
      } catch {
        localStorage.removeItem('mg_regioes_geojson_cache');
      }
    }

    // 2. Carga e síntese
    const municipalGeoJson = await requestJson(GEOJSON_URL);

    const regionByMunicipality = new Map(
      municipios.map((item) => [
        String(item?.municipioIbgeCod ?? '').replace(/\D/g, ''),
        {
          code: String(item?.regiaoCod ?? ''),
          name: String(item?.regiao ?? '').trim(),
        },
      ]),
    );

    const matchedFeatures = (municipalGeoJson?.features || []).flatMap((feature) => {
      const code = municipalityCode(feature);
      const region = regionByMunicipality.get(code);
      if (!region?.name || !feature?.geometry) return [];

      return [
        {
          ...feature,
          properties: {
            ...(feature.properties || {}),
            municipioIbgeCod: code,
            regiaoCod: region.code,
            regiao: region.name,
          },
        },
      ];
    });

    if (!matchedFeatures.length) {
      throw new Error('Nenhum município do GeoJSON coincidiu com os códigos retornados pelo backend.');
    }

    // Libera a main thread antes de rodar o dissolve pesado
    await new Promise((resolve) => setTimeout(resolve, 0));

    const regionsGeoJson = dissolve(featureCollection(matchedFeatures), {
      propertyName: 'regiao',
    });

    regionsGeoJson.features = (regionsGeoJson.features || []).map((feature) => ({
      ...feature,
      properties: {
        ...(feature.properties || {}),
        name: feature.properties?.regiao || 'Não informado',
      },
    }));

    try {
      localStorage.setItem('mg_regioes_geojson_cache', JSON.stringify(regionsGeoJson));
    } catch {
      // Caso localStorage atinja limite de quota
    }

    echarts.registerMap(MAP_NAME, regionsGeoJson);
    registeredGeoJson = regionsGeoJson;
    return regionsGeoJson;
  })();

  try {
    return await geoJsonPromise;
  } catch (err) {
    geoJsonPromise = null;
    throw err;
  }
}

