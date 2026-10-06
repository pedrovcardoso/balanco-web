import { Icon } from '@iconify/react';

const BOOK_THEMES = {
  orange: {
    bg: 'bg-[#ff9f43]',
    border: 'border-[#d97706]',
    shadow: '3px 3px 0 #fff, 6px 6px 0 #fff, 9px 9px 0 #d97706',
    activeShadow: '1px 1px 0 #fff, 2px 2px 0 #fff, 3px 3px 0 #d97706',
  },
  blue: {
    bg: 'bg-[#54a0ff]',
    border: 'border-[#2563eb]',
    shadow: '3px 3px 0 #fff, 6px 6px 0 #fff, 9px 9px 0 #2563eb',
    activeShadow: '1px 1px 0 #fff, 2px 2px 0 #fff, 3px 3px 0 #2563eb',
  },
  green: {
    bg: 'bg-[#1dd1a1]',
    border: 'border-[#059669]',
    shadow: '3px 3px 0 #fff, 6px 6px 0 #fff, 9px 9px 0 #059669',
    activeShadow: '1px 1px 0 #fff, 2px 2px 0 #fff, 3px 3px 0 #059669',
  },
  purple: {
    bg: 'bg-[#cd84f1]',
    border: 'border-[#7e22ce]',
    shadow: '3px 3px 0 #fff, 6px 6px 0 #fff, 9px 9px 0 #7e22ce',
    activeShadow: '1px 1px 0 #fff, 2px 2px 0 #fff, 3px 3px 0 #7e22ce',
  },
};

export default function BalancoBookCard({
  volume,
  title,
  icon,
  themeColor = 'orange',
  status = 'unread', // 'read' | 'in_progress' | 'unread'
  onClick,
}) {
  const theme = BOOK_THEMES[themeColor] || BOOK_THEMES.orange;

  const isRead = status === 'read';
  const isInProgress = status === 'in_progress';

  return (
    <div className="relative flex flex-col items-center group cursor-pointer" onClick={onClick}>
      {/* Container do Livro */}
      <div
        className={`relative w-[145px] sm:w-[155px] h-[195px] sm:h-[205px] rounded-l-md rounded-r-xl p-3 pt-4 flex flex-col items-center text-center transition-all duration-150 border-[3px] select-none z-10 ${theme.bg} ${theme.border} hover:-translate-y-1 active:translate-x-[3px] active:translate-y-[3px]`}
        style={{
          boxShadow: theme.shadow,
        }}
      >
        {/* Linha do Lombo (Spine line) */}
        <div className="absolute top-0 bottom-0 left-2 w-[3px] bg-black/15 pointer-events-none" />

        {/* Badge do Volume */}
        <span className="bg-white/95 text-stone-800 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border border-black/15 uppercase tracking-wider mb-2 shadow-xs">
          {volume}
        </span>

        {/* Ícone Iconify (Substitui Emoji) */}
        <div className="text-white my-1 text-3xl sm:text-4xl drop-shadow-[0_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center">
          <Icon icon={icon} />
        </div>

        {/* Título do Livro */}
        <h3 className="text-white text-xs sm:text-[13px] font-extrabold leading-tight text-shadow-sm mt-auto mb-1 break-words">
          {title}
        </h3>

        {/* Badge de Status de Leitura */}
        <div className="mt-auto">
          {isRead ? (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-emerald-400 uppercase tracking-tight">
              <Icon icon="fa6-solid:circle-check" className="text-xs" />
              Lido
            </span>
          ) : isInProgress ? (
            <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs border border-amber-300 uppercase tracking-tight">
              <Icon icon="fa6-solid:book-open-reader" className="text-xs" />
              Lendo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-stone-900/40 text-white/90 text-[10px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/20 uppercase tracking-tight">
              <Icon icon="fa6-regular:circle" className="text-[9px]" />
              Não lido
            </span>
          )}
        </div>
      </div>

      {/* Sombra do Chão (Floor Shadow) */}
      <div className="absolute -bottom-2.5 w-[75%] h-3.5 bg-amber-950/20 rounded-full blur-[2px] z-0 transition-transform group-hover:scale-95" />
    </div>
  );
}

