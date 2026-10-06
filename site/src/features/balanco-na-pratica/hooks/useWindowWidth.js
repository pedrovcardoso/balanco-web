import { useState, useEffect } from 'react';

/**
 * Hook customizado para obter e monitorar a largura da janela.
 * Útil para ajustar dinamicamente opções de gráficos (ECharts) responsivos.
 */
export function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
