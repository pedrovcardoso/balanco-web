import { Icon } from '@iconify/react';
import { BALANCO_CHAPTERS, SECTION_TITLES } from '../constants/sections.js';

export default function ChapterNavigation({ open, activeSection, onClose, onNavigate }) {
  return (
    <>
      <aside className={`section-menu navigation-command ${open ? 'open' : ''}`} aria-label="Navegação por capítulos e seções">
        <div className="section-menu-head"><div><small>Mapa do conteúdo</small><strong>Escolha um capítulo ou seção</strong></div><button type="button" onClick={onClose} aria-label="Fechar navegação"><Icon icon="fa6-solid:xmark" /></button></div>
        <nav>
          <div className="chapter-details-list">
            {BALANCO_CHAPTERS.map((chapter) => (
              <details key={chapter.id} className="chapter-details" open={chapter.sections.includes(activeSection)}>
                <summary><span className="chapter-summary-copy"><small>{chapter.id.replace('chapter-', 'Capítulo ')}</small><strong>{chapter.title}</strong></span><Icon icon="fa6-solid:chevron-down" /></summary>
                <ol>{chapter.sections.map((section, index) => <li key={section}><a href={`#${section}`} aria-current={activeSection === section ? 'location' : undefined} onClick={(event) => { event.preventDefault(); onNavigate(section); }}><span>{String(index + 1).padStart(2, '0')}</span><b>{SECTION_TITLES[section]}</b></a></li>)}</ol>
              </details>
            ))}
          </div>
        </nav>
      </aside>
      <button type="button" className="section-menu-backdrop" aria-label="Fechar navegação" onClick={onClose} />
    </>
  );
}
