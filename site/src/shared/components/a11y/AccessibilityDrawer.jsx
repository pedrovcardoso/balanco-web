import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { useAccessibility } from '../../hooks/useAccessibility.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';

const LINE_SPACING_MAP = ['normal', 'compact', 'wide', 'expanded', 'extra'];
const LETTER_SPACING_MAP = ['normal', 'compact', 'wide', 'expanded', 'extra'];

export default function AccessibilityDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    activeFeaturesCount,
    resetAll,

    // Text & Font
    fontScale,
    setFontScale,
    resetFont,
    font,
    setFont,
    lineSpacing,
    setLineSpacing,
    letterSpacing,
    setLetterSpacing,

    // Colors & Themes
    theme,
    setTheme,
    invertColors,
    toggleInvertColors,
    grayscale,
    toggleGrayscale,
    colorBlindness,
    setColorBlindness,

    // Navigation & Reading
    highlightLinks,
    toggleHighlightLinks,
    readingRuler,
    toggleReadingRuler,
    readingGuide,
    toggleReadingGuide,
    readingMode,
    toggleReadingMode,
    largeCursor,
    toggleLargeCursor,
    hideImages,
    toggleHideImages,
    reduceMotion,
    toggleReduceMotion,

    // Audio & Libras
    speakText,
    stopSpeaking,
    isSpeaking,
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState('navigation');
  const drawerRef = useRef(null);

  useFocusTrap(drawerRef, isDrawerOpen);

  // Lock Body Scroll when Drawer is Open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const requestVLibras = () => {
    const button = document.querySelector('[vw-access-button]');
    if (button instanceof HTMLElement) {
      button.click();
    } else {
      window.dispatchEvent(new CustomEvent('bc:open-vlibras'));
    }
  };

  if (!isDrawerOpen) return null;

  const lineIndex = Math.max(0, LINE_SPACING_MAP.indexOf(lineSpacing));
  const letterIndex = Math.max(0, LETTER_SPACING_MAP.indexOf(letterSpacing));

  return (
    <div className="fixed inset-0 z-[99990] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="a11y-drawer-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-over Content */}
      <div
        ref={drawerRef}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-white text-slate-800 shadow-2xl transition-transform duration-300 border-l-2 border-slate-300"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b-2 border-[#8f1e23] bg-gradient-to-r from-[#c0272d] to-[#8f1e23] px-5 py-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-xl font-black backdrop-blur-md">
              <Icon icon="fa6-solid:universal-access" />
            </div>
            <div>
              <h2 id="a11y-drawer-title" className="text-lg font-black tracking-tight leading-tight text-white">
                Acessibilidade
              </h2>
              <p className="text-xs text-orange-100 font-medium">
                Personalize sua navegação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeFeaturesCount > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="flex items-center gap-1 rounded-lg bg-black/25 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-black/40 active:scale-95"
                title="Restaurar todas as configurações originais"
              >
                <Icon icon="fa6-solid:rotate-left" className="text-xs" />
                <span>Restaurar</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeDrawer}
              className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/35 active:scale-95"
              aria-label="Fechar menu de acessibilidade"
            >
              <Icon icon="fa6-solid:xmark" className="text-lg" />
            </button>
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex border-b-2 border-slate-300 bg-slate-100 px-3 py-2.5 overflow-x-auto scrollbar-none gap-2">
          <TabButton id="navigation" label="Navegação" icon="fa6-solid:eye" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="text" label="Texto" icon="fa6-solid:font" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="colors" label="Cores" icon="fa6-solid:palette" activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton id="tools" label="Atalhos" icon="fa6-solid:keyboard" activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Scrollable Settings Panel */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
          {/* TAB 1: TEXTO & FONTE */}
          {activeTab === 'text' && (
            <div className="space-y-5">
              {/* Sliders Group Card */}
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm border-b border-slate-200 pb-2.5">
                  <Icon icon="fa6-solid:sliders" className="text-[#c0272d]" />
                  <span>Ajustes de Texto e Espaçamento</span>
                </div>

                {/* Slider 1: Tamanho do Texto */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">Tamanho do Texto</span>
                    <span className="rounded-md bg-red-50 border border-red-300 px-2.5 py-0.5 text-xs font-black text-[#8f1e23]">
                      {Math.round(fontScale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="150"
                    step="5"
                    value={Math.round(fontScale * 100)}
                    onChange={(e) => setFontScale(Number(e.target.value) / 100)}
                    className="w-full accent-[#c0272d] h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>80% (Pequeno)</span>
                    <button type="button" onClick={resetFont} className="text-[#c0272d] underline font-black hover:text-[#8f1e23]">
                      100% (Padrão)
                    </button>
                    <span>150% (Grande)</span>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Slider 2: Espaçamento de Linhas (5 Níveis) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">Espaçamento entre Linhas</span>
                    <span className="rounded-md bg-red-50 border border-red-300 px-2.5 py-0.5 text-xs font-black text-[#8f1e23]">
                      {lineIndex === 0 ? 'Normal (1.0x)' : lineIndex === 1 ? 'Confortável (1.3x)' : lineIndex === 2 ? 'Amplo (1.6x)' : lineIndex === 3 ? 'Expandido (1.9x)' : 'Extremo (2.2x)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={lineIndex}
                    onChange={(e) => setLineSpacing(LINE_SPACING_MAP[Number(e.target.value)])}
                    className="w-full accent-[#c0272d] h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Normal</span>
                    <span>1.6x</span>
                    <span>2.2x</span>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Slider 3: Espaçamento de Letras (5 Níveis) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">Espaçamento entre Letras</span>
                    <span className="rounded-md bg-red-50 border border-red-300 px-2.5 py-0.5 text-xs font-black text-[#8f1e23]">
                      {letterIndex === 0 ? 'Normal' : letterIndex === 1 ? '+0.04em' : letterIndex === 2 ? '+0.08em' : letterIndex === 3 ? '+0.12em' : '+0.16em'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="1"
                    value={letterIndex}
                    onChange={(e) => setLetterSpacing(LETTER_SPACING_MAP[Number(e.target.value)])}
                    className="w-full accent-[#c0272d] h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Normal</span>
                    <span>+0.08em</span>
                    <span>+0.16em</span>
                  </div>
                </div>
              </div>

              {/* Font Family Selection Card */}
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                  <Icon icon="fa6-solid:font" className="text-[#c0272d]" />
                  <span>Estilo de Fonte Tipográfica</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Selecione a fonte ideal para facilitar a leitura de todo o portal
                </p>

                <div className="space-y-2 pt-1">
                  <FontOption
                    id="default"
                    name="Padrão"
                    fontFamily="Nunito, sans-serif"
                    sample="Acessibilidade e transparência para todos os cidadãos."
                    active={font === 'default'}
                    onSelect={() => setFont('default')}
                  />
                  <FontOption
                    id="atkinson"
                    name="Atkinson Hyperlegible"
                    fontFamily="'Atkinson Hyperlegible', sans-serif"
                    sample="Desenvolvida para máxima distinção de caracteres."
                    active={font === 'atkinson'}
                    onSelect={() => setFont('atkinson')}
                  />
                  <FontOption
                    id="lexend"
                    name="Lexend"
                    fontFamily="'Lexend', sans-serif"
                    sample="Projetada para melhorar o rendimento e velocidade de leitura."
                    active={font === 'lexend'}
                    onSelect={() => setFont('lexend')}
                  />
                  <FontOption
                    id="opendyslexic"
                    name="OpenDyslexic"
                    fontFamily="'OpenDyslexic', sans-serif"
                    sample="Formatada com base mais pesada para mitigar troca de letras."
                    active={font === 'opendyslexic'}
                    onSelect={() => setFont('opendyslexic')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORES & CONTRASTE */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              {/* Color Themes Grid */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Temas de Cor da Interface
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <ThemeCard
                    id="default"
                    name="Padrão"
                    description="Claro institucional original"
                    colors={{ bg: '#ffffff', headerBg: '#c0272d', text: '#1f2937', accent: '#006b3f' }}
                    activeTheme={theme}
                    onSelect={() => setTheme('default')}
                  />
                  <ThemeCard
                    id="dark"
                    name="Modo Escuro"
                    description="Fundo escuro confort"
                    colors={{ bg: '#0f172a', headerBg: '#1e293b', text: '#f8fafc', accent: '#10b981' }}
                    activeTheme={theme}
                    onSelect={() => setTheme('dark')}
                  />
                  <ThemeCard
                    id="contrast-dark"
                    name="Alto Contraste Escuro"
                    description="Fundo preto com textos amarelos"
                    colors={{ bg: '#000000', headerBg: '#000000', text: '#ffffff', accent: '#ffff00' }}
                    activeTheme={theme}
                    onSelect={() => setTheme('contrast-dark')}
                  />
                  <ThemeCard
                    id="contrast-light"
                    name="Alto Contraste Claro"
                    description="Fundo branco com textos pretos"
                    colors={{ bg: '#ffffff', headerBg: '#ffffff', text: '#000000', accent: '#000000' }}
                    activeTheme={theme}
                    onSelect={() => setTheme('contrast-light')}
                  />
                  <ThemeCard
                    id="sepia"
                    name="Sepia / Conforto"
                    description="Tons quentes amarelados"
                    colors={{ bg: '#fbf0d9', headerBg: '#f7e7c4', text: '#5f4b32', accent: '#7c3aed' }}
                    activeTheme={theme}
                    onSelect={() => setTheme('sepia')}
                  />
                </div>
              </div>

              {/* Daltonismo SVG Filter Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon icon="fa6-solid:eye" className="text-[#c0272d] text-sm" />
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Filtros para Daltonismo (SVG)
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DaltonismCard
                    id="protanopia"
                    name="Protanopia"
                    description="Dificuldade com vermelho"
                    filterId="bc-filter-protanopia"
                    activeFilter={colorBlindness}
                    onSelect={() => setColorBlindness(colorBlindness === 'protanopia' ? 'none' : 'protanopia')}
                  />
                  <DaltonismCard
                    id="deuteranopia"
                    name="Deuteranopia"
                    description="Dificuldade com verde"
                    filterId="bc-filter-deuteranopia"
                    activeFilter={colorBlindness}
                    onSelect={() => setColorBlindness(colorBlindness === 'deuteranopia' ? 'none' : 'deuteranopia')}
                  />
                  <DaltonismCard
                    id="tritanopia"
                    name="Tritanopia"
                    description="Dificuldade com azul"
                    filterId="bc-filter-tritanopia"
                    activeFilter={colorBlindness}
                    onSelect={() => setColorBlindness(colorBlindness === 'tritanopia' ? 'none' : 'tritanopia')}
                  />
                  <DaltonismCard
                    id="achromatopsia"
                    name="Acromatopsia"
                    description="Escala de cinza pura"
                    filterId="bc-filter-achromatopsia"
                    activeFilter={colorBlindness}
                    onSelect={() => setColorBlindness(colorBlindness === 'achromatopsia' ? 'none' : 'achromatopsia')}
                  />
                </div>
              </div>

              {/* Color Modification Toggles (Inverter & Monocromático) */}
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 space-y-4 shadow-xs">
                <ToggleOption
                  icon="fa6-solid:circle-nodes"
                  title="Inverter Cores"
                  description="Inverte as tonalidades da página para adaptar à sensibilidade visual"
                  checked={invertColors}
                  onChange={toggleInvertColors}
                />
                <hr className="border-slate-300" />
                <ToggleOption
                  icon="fa6-solid:droplet-slash"
                  title="Monocromático (Escala de Cinza)"
                  description="Remove a saturação de cor de toda a interface"
                  checked={grayscale}
                  onChange={toggleGrayscale}
                />
              </div>
            </div>
          )}

          {/* TAB 3: NAVEGAÇÃO & ASSISTÊNCIA */}
          {activeTab === 'navigation' && (
            <div className="space-y-5">
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 space-y-4 shadow-xs">
                <ToggleOption
                  icon="fa6-solid:link"
                  title="Destacar Links e Botões"
                  description="Adiciona sublinhado e fundo de contraste a todos os elementos clicáveis"
                  checked={highlightLinks}
                  onChange={toggleHighlightLinks}
                />
                <hr className="border-slate-300" />
                <ToggleOption
                  icon="fa6-solid:ruler-horizontal"
                  title="Régua de Leitura (Com Foco e Blur Externa)"
                  description="Faixa transparente de leitura com escurecimento e blur ao redor"
                  checked={readingRuler}
                  onChange={toggleReadingRuler}
                />
                <hr className="border-slate-300" />
                <ToggleOption
                  icon="fa6-solid:grip-lines"
                  title="Guia / Linha de Leitura Simples"
                  description="Exibe uma linha vermelha de foco que acompanha o mouse"
                  checked={readingGuide}
                  onChange={toggleReadingGuide}
                />
                <hr className="border-slate-300" />
                <ToggleOption
                  icon="fa6-solid:book-open-reader"
                  title="Modo Leitura Limpo"
                  description="Remove distrações laterais e centraliza o texto para leitura de documento"
                  checked={readingMode}
                  onChange={toggleReadingMode}
                />
                <hr className="border-slate-300" />
                <ToggleOption
                  icon="fa6-solid:arrow-pointer"
                  title="Cursor Grande"
                  description="Aumenta o tamanho do ponteiro do mouse para facilitar a localização"
                  checked={largeCursor}
                  onChange={toggleLargeCursor}
                />
                <hr className="border-slate-300" />
                <ToggleOption
                  icon="fa6-solid:image"
                  title="Ocultar Imagens"
                  description="Oculta elementos visuais para focar estritamente na leitura de texto"
                  checked={hideImages}
                  onChange={toggleHideImages}
                />
                <hr className="border-slate-300" />
                <ToggleOption
                  icon="fa6-solid:film"
                  title="Reduzir Animações"
                  description="Desativa efeitos de transição e movimento dinâmico na tela"
                  checked={reduceMotion}
                  onChange={toggleReduceMotion}
                />
              </div>

              {/* Text to Speech Card */}
              <div className="rounded-2xl border-2 border-blue-300 bg-blue-50/60 p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xl font-black shadow-sm">
                    <Icon icon="fa6-solid:volume-high" />
                  </div>
                  <div>
                    <h3 className="font-black text-blue-950 text-sm">
                      Leitor de Voz (Sintetizador TTS)
                    </h3>
                    <p className="text-xs font-medium text-slate-700">
                      Ouça o texto selecionado na tela ou o conteúdo principal da página
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isSpeaking ? (
                    <button
                      type="button"
                      onClick={() => speakText()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-black text-white shadow-sm transition-all hover:bg-blue-700 active:scale-98"
                    >
                      <Icon icon="fa6-solid:play" />
                      <span>Ouvir Conteúdo</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-black text-white shadow-sm transition-all hover:bg-red-700 active:scale-98"
                    >
                      <Icon icon="fa6-solid:stop" />
                      <span>Parar Leitura</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ATALHOS DE TECLADO */}
          {activeTab === 'tools' && (
            <div className="space-y-5">
              {/* Keyboard Shortcuts Card */}
              <div className="rounded-2xl border-2 border-slate-300 bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Icon icon="fa6-solid:keyboard" className="text-[#c0272d] text-sm" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Navegação Rápida por Teclado
                  </h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  <ShortcutItem keys={['Alt', '1']} description="Ir para o Conteúdo Principal" />
                  <ShortcutItem keys={['Alt', '2']} description="Abrir Painel de Acessibilidade" />
                  <ShortcutItem keys={['Alt', '3']} description="Ativar VLibras" />
                  <ShortcutItem keys={['Esc']} description="Fechar menus e janelas modais" />
                  <ShortcutItem keys={['Tab']} description="Avançar entre elementos focáveis" />
                  <ShortcutItem keys={['Shift', 'Tab']} description="Voltar entre elementos focáveis" />
                </div>
              </div>

              {/* Libras VLibras Card */}
              <div className="rounded-2xl border-2 border-red-300 bg-red-50/60 p-4 space-y-2 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#c0272d] to-[#8f1e23] text-white text-xl font-black shadow-sm">
                    <Icon icon="fa6-solid:hands" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#8f1e23] text-sm">
                      Tradutor de Libras (VLibras)
                    </h3>
                    <p className="text-xs font-bold text-slate-700 leading-tight">
                      Para utilizar a Língua Brasileira de Sinais, clique no widget flutuante de Libras disponível no <span className="text-[#c0272d] font-black">lado esquerdo da tela</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ id, label, icon, activeTab, setActiveTab }) {
  const active = activeTab === id;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-black transition-all shrink-0 ${
        active
          ? 'bg-gradient-to-r from-[#c0272d] to-[#8f1e23] text-white shadow-sm'
          : 'bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon icon={icon} className="text-sm shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function ToggleOption({ icon, title, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer group">
      <div className="flex gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red-50 border border-red-300 text-[#c0272d] text-base font-black transition-colors group-hover:bg-[#c0272d] group-hover:text-white shadow-xs">
          <Icon icon={icon} />
        </div>
        <div>
          <div className="font-black text-slate-800 text-xs group-hover:text-[#c0272d]">
            {title}
          </div>
          <div className="text-[11px] font-medium text-slate-600 leading-tight">
            {description}
          </div>
        </div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out border-2 ${
          checked ? 'bg-[#c0272d] border-[#8f1e23]' : 'bg-slate-300 border-slate-400'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out self-center shadow-xs ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </label>
  );
}

// Unified Skeleton Component
function UnifiedSkeleton({ bg, headerBg, text, accent, style = {} }) {
  return (
    <div
      className="h-11 w-full rounded-xl border border-slate-300 p-1.5 flex flex-col justify-between overflow-hidden shadow-xs"
      style={{ backgroundColor: bg, ...style }}
    >
      <div className="h-2 w-full rounded-xs flex items-center justify-between px-1" style={{ backgroundColor: headerBg }}>
        <div className="h-1 w-5 rounded-full" style={{ backgroundColor: accent }} />
        <div className="h-1 w-2 rounded-full" style={{ backgroundColor: text, opacity: 0.6 }} />
      </div>

      <div className="space-y-1 py-0.5">
        <div className="h-1 w-3/4 rounded-full" style={{ backgroundColor: text, opacity: 0.7 }} />
        <div className="h-1 w-1/2 rounded-full" style={{ backgroundColor: text, opacity: 0.4 }} />
      </div>
    </div>
  );
}

function ThemeCard({ id, name, description, colors, activeTheme, onSelect }) {
  const active = activeTheme === id;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex flex-col justify-between gap-2 rounded-2xl border-2 p-2.5 text-left transition-all ${
        active
          ? 'border-[#c0272d] bg-red-50/60 ring-2 ring-[#c0272d] shadow-xs'
          : 'border-slate-300 bg-white hover:border-[#c0272d]/60 hover:bg-slate-50'
      }`}
    >
      <UnifiedSkeleton bg={colors.bg} headerBg={colors.headerBg} text={colors.text} accent={colors.accent} />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900">{name}</span>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full border border-black/20" style={{ backgroundColor: colors.bg }} />
            <span className="h-2.5 w-2.5 rounded-full border border-black/20" style={{ backgroundColor: colors.headerBg }} />
          </div>
        </div>
        <p className="text-[10px] font-medium text-slate-600 leading-tight mt-0.5">
          {description}
        </p>
      </div>
    </button>
  );
}

function DaltonismCard({ id, name, description, filterId, activeFilter, onSelect }) {
  const active = activeFilter === id;
  const filterStyle = filterId !== 'none' ? { filter: `url(#${filterId})` } : {};

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex flex-col justify-between gap-2 rounded-2xl border-2 p-2.5 text-left transition-all ${
        active
          ? 'border-[#c0272d] bg-red-50/60 ring-2 ring-[#c0272d] shadow-xs'
          : 'border-slate-300 bg-white hover:border-[#c0272d]/60 hover:bg-slate-50'
      }`}
    >
      <UnifiedSkeleton
        bg="#ffffff"
        headerBg="#c0272d"
        text="#1f2937"
        accent="#006b3f"
        style={filterStyle}
      />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900">{name}</span>
          {active && <Icon icon="fa6-solid:circle-check" className="text-xs text-[#c0272d]" />}
        </div>
        <p className="text-[10px] font-medium text-slate-600 leading-tight mt-0.5">
          {description}
        </p>
      </div>
    </button>
  );
}

function FontOption({ name, sample, fontFamily, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col gap-1 rounded-xl border-2 p-3 text-left transition-all ${
        active
          ? 'border-[#c0272d] bg-red-50/60 shadow-xs'
          : 'border-slate-300 bg-white hover:border-[#c0272d]/60 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-900" style={{ fontFamily }}>
          {name}
        </span>
        {active && <Icon icon="fa6-solid:circle-check" className="text-base text-[#c0272d]" />}
      </div>
      <span className="text-xs text-slate-700 italic leading-snug" style={{ fontFamily }}>
        {sample}
      </span>
    </button>
  );
}

function ShortcutItem({ keys, description }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-200 last:border-0">
      <span className="text-slate-700 font-bold">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="rounded-lg border-2 border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-black text-slate-800 shadow-xs"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
