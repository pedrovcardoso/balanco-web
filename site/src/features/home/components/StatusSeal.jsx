import { Icon } from '@iconify/react';

export default function StatusSeal({
  status = 'available',
  progressPercent = 0,
  loading = false,
  error = false,
}) {
  if (loading) {
    return (
      <span
        className="
          absolute -right-2 -top-2 z-20
          inline-flex h-7 items-center gap-1.5
          rounded-full 
          border border-sky-200
          bg-sky-50 px-2
          text-[10px] font-black text-sky-700
          shadow-md
        "
        role="status"
        aria-label="Carregando status da trilha"
      >
        <Icon icon="fa6-solid:circle-notch" className="animate-spin" aria-hidden="true" />
        Carregando
      </span>
    );
  }

  if (error) {
    return (
      <span
        className="absolute -right-2 -top-2 z-20 inline-flex h-7 items-center gap-1.5 rounded-full border-2 border-white bg-red-100 px-2.5 text-[10px] font-black text-red-900 shadow-md"
        role="status"
        aria-label="Status da trilha indisponível"
      >
        <Icon icon="fa6-solid:triangle-exclamation" aria-hidden="true" />
        Indisponível
      </span>
    );
  }

  const completed =
    String(status).toLowerCase() === 'completed' ||
    Number(progressPercent) >= 100;

  if (completed) {
    return (
      <span
        className="
          absolute -right-2 -top-2 z-20
          inline-flex h-7 items-center gap-1.5
          rounded-full border-2 border-white
          bg-emerald-600 px-2.5
          text-[10px] font-black text-white
          shadow-md
          transition-all duration-200
        "
        role="status"
        aria-label="Trilha concluída"
      >
        <Icon icon="fa6-solid:check" aria-hidden="true" />
        Concluída
      </span>
    );
  }

  return (
    <span
      className="
        absolute -right-2 -top-2 z-20
        inline-flex h-7 items-center gap-1.5
        rounded-full border-2 border-white
        bg-amber-100 px-2.5
        text-[10px] font-black text-amber-900
        shadow-md
        transition-all duration-200
      "
      role="status"
      aria-label="Trilha pendente"
    >
      <Icon icon="fa6-solid:clock" aria-hidden="true" />
      Pendente
    </span>
  );
}