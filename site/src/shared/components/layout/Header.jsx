import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { useAccessibility } from '../../hooks/useAccessibility.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import logoGovMg from '@assets/images/logo-govmg.png';
import logoSccg from '@assets/images/logo-sccg.png';
import logoGovBr from '@assets/images/govbr_logo.svg';

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const motion = 'transition-all duration-300 ease-out motion-reduce:transition-none';

export default function Header() {
  const { user, isGuest, logout } = useAuth();
  const { openDrawer, isDrawerOpen, activeFeaturesCount } = useAccessibility();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const profileRef = useRef(null);
  const displayName = !isGuest && user?.displayName ? user.displayName : 'Visitante';

  useClickOutside(profileRef, () => setMenuOpen(false));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.altKey && event.key === '2') {
        event.preventDefault();
        openDrawer();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openDrawer]);

  return (
    <header className={`sticky top-0 z-50 border-b-[3px] border-[#c0272d] bg-white/95 text-gray-800 shadow-[0_4px_14px_rgba(17,24,39,.12)] backdrop-blur-xl ${motion}`} aria-label="Barra institucional">
      <div className="mx-auto grid min-h-14 w-full max-w-[1240px] grid-cols-[auto_1fr] items-center gap-2 px-3 py-1 max-[900px]:grid-cols-1 max-[900px]:justify-items-center">
        <a href="/" className={`group flex min-w-0 items-center gap-2 rounded-lg ${motion} hover:scale-[1.02]`} aria-label="Ir para a página inicial">
          <img src={logoGovMg} alt="Governo de Minas Gerais" className={`h-7 w-auto max-w-32 object-contain ${motion} max-[900px]:h-5`} />
          <span className={`h-7 w-0.5 bg-[#c0272d]/20 ${motion} group-hover:bg-[#c0272d]/50`} aria-hidden="true" />
          <img src={logoSccg} alt="Superintendência Central de Contadoria Geral" className={`h-[18px] w-auto max-w-20 object-contain ${motion} max-[900px]:h-3.5`} />
        </a>

        <nav className="flex items-center justify-end gap-2" aria-label="Acessos rápidos">
          {/* Prominent Featured Accessibility Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Abrir menu de acessibilidade"
            aria-expanded={isDrawerOpen}
            aria-controls="a11y-drawer-title"
            title="Ferramentas de Acessibilidade (Alt + 2)"
            className={`group relative flex h-9 items-center gap-2 rounded-full border-2 border-[#c0272d] bg-white px-3.5 text-xs font-black text-[#8f1e23] shadow-sm ${motion} hover:-translate-y-0.5 hover:scale-105 hover:bg-[#c0272d] hover:text-white active:scale-95`}
          >
            <Icon icon="fa6-solid:universal-access" className="text-base text-[#c0272d] transition-colors group-hover:text-white" />
            <span className="tracking-tight">Acessibilidade</span>
            {activeFeaturesCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c0272d] text-[10px] font-black text-white group-hover:bg-white group-hover:text-[#c0272d]">
                {activeFeaturesCount}
              </span>
            )}
          </button>

          {/* Profile Trigger */}
          <div ref={profileRef} className="relative">
            <button type="button" className={`grid h-10 min-w-11 place-items-center rounded-xl border-2 border-white bg-gradient-to-br from-[#2d6a4f] to-emerald-500 text-lg text-white shadow-md ${motion} hover:-translate-y-0.5 hover:scale-105 hover:border-[#f5a800] hover:shadow-lg active:scale-95`} aria-label="Abrir perfil" aria-expanded={menuOpen} aria-controls={menuId} onClick={() => setMenuOpen((value) => !value)}><Icon icon="fa6-solid:user" aria-hidden="true" /></button>
            <div id={menuId} className={`absolute right-0 top-[calc(100%+10px)] w-[min(330px,calc(100vw-24px))] origin-top-right rounded-3xl border-[3px] border-[#8b6914] bg-gradient-to-br from-[#fffaf0] via-[#fdf6e3] to-[#ffe8aa] p-4 text-[#5d2b0a] shadow-2xl ${motion} ${menuOpen ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible pointer-events-none -translate-y-2 scale-95 opacity-0'}`} role="menu" aria-hidden={!menuOpen}>
              <strong className="mb-2 block text-sm font-black">{displayName}</strong>
              {isGuest ? (
                <button type="button" role="menuitem" className={`mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-3 font-black text-gray-900 ${motion} hover:-translate-y-0.5 hover:border-[#c0272d] hover:shadow-md active:scale-[.98]`} onClick={() => { setMenuOpen(false); emit('bc:open-login'); }}>
                  <span>Entrar com</span>
                  <img src={logoGovBr} alt="gov.br" className="h-6 w-auto max-w-24 object-contain" />
                </button>
              ) : (
                <>
                  <MenuButton icon={<Icon icon="fa6-solid:right-from-bracket" />} onClick={logout}>Sair neste navegador</MenuButton>
                  <MenuButton danger icon={<Icon icon="fa6-solid:trash-can" />} onClick={() => { setMenuOpen(false); emit('bc:open-delete-account', { user }); }}>Excluir dados</MenuButton>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function MenuButton({ danger=false, icon, onClick, children }) {
  return <button type="button" role="menuitem" className={`mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border-2 px-3 text-sm font-black ${motion} hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] ${danger ? 'border-[#8f1e23] bg-gradient-to-br from-[#c0272d] to-[#8f1e23] text-white' : 'border-gray-300 bg-white text-gray-900'}`} onClick={onClick}>{icon}{children}</button>;
}