import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../../shared/hooks/useAuth.js';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap.js';

export default function DeleteAccountModal() {
  const { deleteAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const titleId = useId();

  useFocusTrap(dialogRef, open);

  useEffect(() => {
    const show = () => {
      setConfirmText('');
      setError('');
      setOpen(true);
    };
    window.addEventListener('bc:open-delete-account', show);
    return () => window.removeEventListener('bc:open-delete-account', show);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && !submitting && setOpen(false);
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, submitting]);

  const handleDelete = async (event) => {
    event.preventDefault();

    if (confirmText.trim().toUpperCase() !== 'EXCLUIR') {
      setError('Digite exatamente "EXCLUIR" para confirmar.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await deleteAccount();
      setOpen(false);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
          requestError.message ||
          'Não foi possível excluir os dados no momento.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100000] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && !submitting && setOpen(false)}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-4 border-[#8f1e23] bg-gradient-to-br from-[#fffaf0] via-[#fdf6e3] to-[#ffe8aa] shadow-2xl"
      >
        <div className="h-2.5 bg-[linear-gradient(90deg,#c0272d,#8f1e23)]" />
        <button
          type="button"
          aria-label="Fechar"
          className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full text-[#5d2b0a] transition-all hover:rotate-90 hover:bg-white/70"
          onClick={() => setOpen(false)}
          disabled={submitting}
        >
          <Icon icon="fa6-solid:xmark" />
        </button>

        <form className="p-6" onSubmit={handleDelete} noValidate>
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-xl text-[#8f1e23]">
              <Icon icon="fa6-solid:trash-can" aria-hidden="true" />
            </span>
            <div>
              <h2 id={titleId} className="font-display text-xl font-black text-[#5d2b0a]">
                Excluir dados da conta
              </h2>
              <p className="text-xs font-bold text-[#8b5e3c]">
                Ação permanente (Conforme LGPD)
              </p>
            </div>
          </div>

          <p className="mb-4 text-xs md:text-sm font-bold leading-relaxed text-[#6b3a1f]">
            Esta ação removerá todo o seu histórico de leitura, progresso de jogos, conquistas e certificados salvos neste navegador/servidor.
            O progresso local de jogos é compartilhado neste navegador e também será removido. PDFs já baixados não serão apagados.
          </p>

          <label className="mb-1 block text-sm font-black text-[#5d2b0a]" htmlFor="confirm-delete">
            Digite <span className="text-[#c0272d]">EXCLUIR</span> para confirmar:
          </label>
          <input
            id="confirm-delete"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="EXCLUIR"
            autoComplete="off"
            className="w-full rounded-xl border-2 border-[#8b5e3c]/30 bg-white px-3 py-2.5 font-bold outline-none transition-all focus:border-[#c0272d] focus:ring-4 focus:ring-[#c0272d]/15"
          />

          <p className="min-h-6 pt-2 text-sm font-black text-red-700" role="alert" aria-live="polite">
            {error}
          </p>

          <button
            type="submit"
            disabled={submitting || confirmText.trim().toUpperCase() !== 'EXCLUIR'}
            className="mt-2 min-h-11 w-full rounded-full bg-gradient-to-br from-[#c0272d] to-[#8f1e23] px-5 font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </button>
        </form>
      </section>
    </div>
  );
}

