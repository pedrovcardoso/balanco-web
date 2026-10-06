import { useState } from 'react';
import { Icon } from '@iconify/react';
import { issueCertificate } from '../services/conquistaService.js';
import { useAuth } from '../../../shared/hooks/useAuth.js';

export default function CertificateForm({
  isLocked = true,
  missingTrailsCount = 4,
  completedTrailsCount = 0,
  requiredTrailsCount = 4,
  participantName = 'Participante',
}) {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadHtml2Pdf = () => {
    return new Promise((resolve, reject) => {
      if (window.html2pdf) {
        resolve(window.html2pdf);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => resolve(window.html2pdf);
      script.onerror = () => reject(new Error('Não foi possível carregar a biblioteca de PDF.'));
      document.body.appendChild(script);
    });
  };

  const handleDownloadPdf = async () => {
    if (isLocked) return;

    setDownloading(true);
    setStatusMessage('Gerando PDF...');

    try {
      if (user?.publicUserId) {
        try {
          await issueCertificate(user.displayName || participantName);
        } catch (err) {
          // 409 = certificado já existe — não é um erro, apenas continua o download
          if (err?.status !== 409 && err?.response?.status !== 409) {
            console.warn('[CertificateForm] Registro server-side falhou:', err);
          }
        }
      }

      const html2pdf = await loadHtml2Pdf();
      const element = document.getElementById('certificate');

      if (!element) {
        throw new Error('Elemento do certificado não encontrado.');
      }

      const opt = {
        margin: 0,
        filename: `certificado-cidadao-fiscal-${(participantName || 'participante').toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' },
      };

      await html2pdf().set(opt).from(element).save();
      setStatusMessage('PDF gerado com sucesso!');
    } catch (error) {
      console.error('[CertificateForm] Erro ao baixar PDF:', error);
      setStatusMessage('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-[720px] mx-auto mt-2">
      <button
        id="downloadPdf"
        type="button"
        disabled={isLocked || downloading}
        onClick={handleDownloadPdf}
        title={isLocked ? 'Conclua as 4 trilhas para liberar o certificado' : 'Baixar certificado em PDF'}
        className="w-full max-w-[480px] mx-auto flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#c0272d] to-[#8f1e23] border-2 border-red-900 px-6 py-4 font-display text-lg font-black text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:grayscale disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        {downloading ? (
          <>
            <Icon icon="fa6-solid:circle-notch" className="animate-spin text-xl" />
            <span>Gerando arquivo PDF...</span>
          </>
        ) : (
          <>
            <Icon icon="fa6-solid:file-arrow-down" className="text-2xl" />
            <span>Baixar Certificado (PDF)</span>
          </>
        )}
      </button>

      <p className="mt-2.5 text-center text-xs font-extrabold text-stone-700">
        O PDF é gerado em formato A4 horizontal pronto para impressão.
      </p>

      {statusMessage && (
        <p role="status" aria-live="polite" className="mt-2 text-center text-sm font-black text-[#2d6a4f]">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
