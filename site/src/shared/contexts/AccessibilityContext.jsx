import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { announceToSR } from '../../lib/a11yUtils.js';

export const AccessibilityContext = createContext(null);

const STORAGE_KEY = 'bc_a11y_preferences_v2';

const DEFAULT_SETTINGS = {
  fontScale: 1,
  highContrast: false,
  theme: 'default', // 'default' | 'dark' | 'sepia' | 'contrast-dark' | 'contrast-light'
  font: 'default', // 'default' | 'atkinson' | 'lexend' | 'opendyslexic'
  lineSpacing: 'normal', // 'normal' | 'wide' | 'extra'
  letterSpacing: 'normal', // 'normal' | 'wide' | 'extra'
  invertColors: false,
  grayscale: false,
  colorBlindness: 'none', // 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'
  highlightLinks: false,
  largeCursor: false,
  hideImages: false,
  reduceMotion: false,
  readingRuler: false, // Régua com fenda limpa e blur externo
  readingGuide: false, // Guia/Linha de leitura simples
  readingMode: false,  // Modo leitura limpo e sem distrações
};

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (_) {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(loadSavedSettings);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {
      // ignore
    }
  }, [settings]);

  // Sync dataset and CSS variables to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-scale', String(settings.fontScale));
    root.dataset.fontScale = String(settings.fontScale);
    root.dataset.highContrast = String(settings.highContrast);
    root.dataset.theme = settings.highContrast ? 'contrast-dark' : settings.theme;
    root.dataset.font = settings.font;
    root.dataset.lineSpacing = settings.lineSpacing;
    root.dataset.letterSpacing = settings.letterSpacing;
    root.dataset.invertColors = String(settings.invertColors);
    root.dataset.grayscale = String(settings.grayscale);
    root.dataset.colorBlindness = settings.colorBlindness;
    root.dataset.highlightLinks = String(settings.highlightLinks);
    root.dataset.largeCursor = String(settings.largeCursor);
    root.dataset.hideImages = String(settings.hideImages);
    root.dataset.reduceMotion = String(settings.reduceMotion);
    root.dataset.readingRuler = String(settings.readingRuler);
    root.dataset.readingGuide = String(settings.readingGuide);
    root.dataset.readingMode = String(settings.readingMode);
  }, [settings]);

  // Individual Actions
  const setFontScale = useCallback((vOrFn) => {
    setSettings((prev) => {
      const target = typeof vOrFn === 'function' ? vOrFn(prev.fontScale) : vOrFn;
      const clamped = Math.min(1.5, Math.max(0.8, +target.toFixed(1)));
      announceToSR(`Tamanho do texto alterado para ${Math.round(clamped * 100)}%`);
      return { ...prev, fontScale: clamped };
    });
  }, []);

  const increaseFont = useCallback(() => setFontScale((v) => v + 0.1), [setFontScale]);
  const decreaseFont = useCallback(() => setFontScale((v) => v - 0.1), [setFontScale]);
  const resetFont = useCallback(() => setFontScale(1), [setFontScale]);

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.highContrast;
      announceToSR(next ? 'Alto contraste escuro ativado' : 'Alto contraste desativado');
      return { ...prev, highContrast: next, theme: next ? 'contrast-dark' : 'default' };
    });
  }, []);

  const setTheme = useCallback((themeName) => {
    setSettings((prev) => {
      announceToSR(`Tema alterado para ${themeName}`);
      return {
        ...prev,
        theme: themeName,
        highContrast: themeName === 'contrast-dark' || themeName === 'contrast-light',
      };
    });
  }, []);

  const setFont = useCallback((fontName) => {
    setSettings((prev) => {
      announceToSR(`Fonte alterada para ${fontName}`);
      return { ...prev, font: fontName };
    });
  }, []);

  const setLineSpacing = useCallback((val) => {
    setSettings((prev) => {
      announceToSR(`Espaçamento de linhas: ${val}`);
      return { ...prev, lineSpacing: val };
    });
  }, []);

  const setLetterSpacing = useCallback((val) => {
    setSettings((prev) => {
      announceToSR(`Espaçamento entre letras: ${val}`);
      return { ...prev, letterSpacing: val };
    });
  }, []);

  const toggleInvertColors = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.invertColors;
      announceToSR(next ? 'Cores invertidas' : 'Cores normais');
      return { ...prev, invertColors: next };
    });
  }, []);

  const toggleGrayscale = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.grayscale;
      announceToSR(next ? 'Modo monocromático ativado' : 'Modo monocromático desativado');
      return { ...prev, grayscale: next };
    });
  }, []);

  const setColorBlindness = useCallback((mode) => {
    setSettings((prev) => {
      announceToSR(`Filtro de daltonismo alterado para ${mode}`);
      return { ...prev, colorBlindness: mode };
    });
  }, []);

  const toggleHighlightLinks = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.highlightLinks;
      announceToSR(next ? 'Destaque de links ativado' : 'Destaque de links desativado');
      return { ...prev, highlightLinks: next };
    });
  }, []);

  const toggleLargeCursor = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.largeCursor;
      announceToSR(next ? 'Cursor grande ativado' : 'Cursor padrão ativado');
      return { ...prev, largeCursor: next };
    });
  }, []);

  const toggleHideImages = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.hideImages;
      announceToSR(next ? 'Imagens ocultadas' : 'Imagens visíveis');
      return { ...prev, hideImages: next };
    });
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.reduceMotion;
      announceToSR(next ? 'Animações reduzidas' : 'Animações normais');
      return { ...prev, reduceMotion: next };
    });
  }, []);

  const toggleReadingRuler = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.readingRuler;
      announceToSR(next ? 'Régua de leitura ativada' : 'Régua de leitura desativada');
      return { ...prev, readingRuler: next };
    });
  }, []);

  const toggleReadingGuide = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.readingGuide;
      announceToSR(next ? 'Guia de leitura ativada' : 'Guia de leitura desativada');
      return { ...prev, readingGuide: next };
    });
  }, []);

  const toggleReadingMode = useCallback(() => {
    setSettings((prev) => {
      const next = !prev.readingMode;
      announceToSR(next ? 'Modo leitura ativado' : 'Modo leitura desativado');
      return { ...prev, readingMode: next };
    });
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((v) => !v), []);

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    announceToSR('Todas as configurações de acessibilidade foram restauradas ao padrão.');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Text-To-Speech (TTS)
  const speakText = useCallback((textToSpeak) => {
    if (!('speechSynthesis' in window)) {
      announceToSR('Sintetizador de voz não suportado neste navegador.');
      return;
    }
    window.speechSynthesis.cancel();

    if (!textToSpeak) {
      const selection = window.getSelection()?.toString();
      const mainContent = document.getElementById('main-content')?.innerText;
      textToSpeak = selection || mainContent || document.body.innerText;
    }

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    announceToSR('Iniciando leitura de voz');
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      announceToSR('Leitura de voz interrompida');
    }
  }, []);

  // Count active non-default features
  const activeFeaturesCount = useMemo(() => {
    let count = 0;
    if (settings.fontScale !== 1) count++;
    if (settings.highContrast) count++;
    if (settings.theme !== 'default') count++;
    if (settings.font !== 'default') count++;
    if (settings.lineSpacing !== 'normal') count++;
    if (settings.letterSpacing !== 'normal') count++;
    if (settings.invertColors) count++;
    if (settings.grayscale) count++;
    if (settings.colorBlindness !== 'none') count++;
    if (settings.highlightLinks) count++;
    if (settings.largeCursor) count++;
    if (settings.hideImages) count++;
    if (settings.reduceMotion) count++;
    if (settings.readingRuler) count++;
    if (settings.readingGuide) count++;
    if (settings.readingMode) count++;
    return count;
  }, [settings]);

  const value = useMemo(
    () => ({
      ...settings,
      isDrawerOpen,
      activeFeaturesCount,
      isSpeaking,

      setFontScale,
      increaseFont,
      decreaseFont,
      resetFont,
      toggleHighContrast,
      setTheme,
      setFont,
      setLineSpacing,
      setLetterSpacing,
      toggleInvertColors,
      toggleGrayscale,
      setColorBlindness,
      toggleHighlightLinks,
      toggleLargeCursor,
      toggleHideImages,
      toggleReduceMotion,
      toggleReadingRuler,
      toggleReadingGuide,
      toggleReadingMode,

      openDrawer,
      closeDrawer,
      toggleDrawer,
      resetAll,

      speakText,
      stopSpeaking,
    }),
    [
      settings,
      isDrawerOpen,
      activeFeaturesCount,
      isSpeaking,
      setFontScale,
      increaseFont,
      decreaseFont,
      resetFont,
      toggleHighContrast,
      setTheme,
      setFont,
      setLineSpacing,
      setLetterSpacing,
      toggleInvertColors,
      toggleGrayscale,
      setColorBlindness,
      toggleHighlightLinks,
      toggleLargeCursor,
      toggleHideImages,
      toggleReduceMotion,
      toggleReadingRuler,
      toggleReadingGuide,
      toggleReadingMode,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      resetAll,
      speakText,
      stopSpeaking,
    ]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
