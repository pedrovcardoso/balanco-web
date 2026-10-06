import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';

const TOAST_VARIANTS = {
  error: {
    bgColor: 'bg-red-500',
    iconColor: 'text-red-500',
    icon: 'fa6-solid:circle-xmark',
  },
  success: {
    bgColor: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
    icon: 'fa6-solid:circle-check',
  },
  warning: {
    bgColor: 'bg-amber-500',
    iconColor: 'text-amber-500',
    icon: 'fa6-solid:triangle-exclamation',
  },
  info: {
    bgColor: 'bg-blue-500',
    iconColor: 'text-blue-500',
    icon: 'fa6-solid:circle-info',
  },
};

export function Toast({
  message,
  type = 'error',
  duration = 3200,
  onClose,
  className = '',
  position = 'top-right',
}) {
  const [topOffset, setTopOffset] = useState(80);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Cálculo dinâmico da altura do header + margem
  useEffect(() => {
    function updatePosition() {
      const headerEl = document.querySelector('header') || document.querySelector('.topbar');
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        setTopOffset(Math.max(12, Math.round(rect.bottom + 12)));
      } else {
        setTopOffset(80);
      }
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, []);

  // Temporizador de encerramento automático
  useEffect(() => {
    if (!message || duration <= 0) return;
    const timer = setTimeout(() => {
      onCloseRef.current?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message) return null;

  const style = TOAST_VARIANTS[type] || TOAST_VARIANTS.error;

  const positionStyles = {
    'top-right': { top: `${topOffset}px`, right: '20px' },
    'top-center': { top: `${topOffset}px`, left: '50%', transform: 'translateX(-50%)' },
    'top-left': { top: `${topOffset}px`, left: '20px' },
  }[position] || { top: `${topOffset}px`, right: '20px' };

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      onClick={() => onCloseRef.current?.()}
      className={`fixed z-[9999] flex max-w-[min(90vw,340px)] cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200/80 bg-white/95 px-3.5 py-2.5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-200 hover:shadow-xl ${className}`}
      style={{
        ...positionStyles,
        animation: 'toast-pop-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* Barra fina de destaque na lateral */}
      <span
        className={`h-5 w-1 shrink-0 rounded-full ${style.bgColor}`}
        aria-hidden="true"
      />

      {/* Ícone indicativo */}
      <Icon
        icon={style.icon}
        className={`text-base shrink-0 ${style.iconColor}`}
        aria-hidden="true"
      />

      {/* Mensagem compacta */}
      <span className="flex-1 font-sans text-[0.82rem] font-extrabold leading-snug text-slate-800">
        {message}
      </span>

      {/* Botão fechar discreto */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCloseRef.current?.();
        }}
        type="button"
        aria-label="Fechar notificação"
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
      >
        <Icon icon="fa6-solid:xmark" className="text-[11px]" aria-hidden="true" />
      </button>

      <style>{`
        @keyframes toast-pop-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

