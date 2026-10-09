import { useState } from 'react';
import { Icon } from '@iconify/react';
import { issueCertificate } from '../services/conquistaService.js';

function downloadBase64Pdf(base64, fileName) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CertificateForm({ isLocked = true, participantName = 'Participante' }) {
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  async function handleDownloadPdf() {
    if (isLocked || downloading) return;
    setDownloading(true);
    setStatusMessage('Emitindo certificado...');

    try {
      const certificate = await issueCertificate(participantName);
      if (!certificate?.pdfBase64) {
        throw new Error('A API não retornou o arquivo PDF do certificado.');
      }
      const normalizedName = String(participantName || 'participante')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      downloadBase64Pdf(
        certificate.pdfBase64,
        `certificado-cidadao-fiscal-${normalizedName || 'participante'}.pdf`,
      );
      setStatusMessage(`Certificado emitido. Código: ${certificate.verificationCode}`);
    } catch (error) {
      setStatusMessage(error.message || 'Erro ao emitir certificado.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto mt-2 w-full max-w-[720px]">
      <button
        type="button"
        disabled={isLocked || downloading}
        onClick={handleDownloadPdf}
        title={isLocked ? 'Conclua os requisitos para liberar o certificado' : 'Baixar certificado em PDF'}
        className="mx-auto flex w-full max-w-[480px] items-center justify-center gap-3 rounded-2xl border-2 border-red-900 bg-gradient-to-r from-[#c0272d] to-[#8f1e23] px-6 py-4 font-display text-lg font-black text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-50"
      >
        <Icon
          icon={downloading ? 'fa6-solid:circle-notch' : 'fa6-solid:file-arrow-down'}
          className={downloading ? 'animate-spin text-xl' : 'text-2xl'}
        />
        <span>{downloading ? 'Emitindo certificado...' : 'Baixar certificado oficial'}</span>
      </button>
      {statusMessage && (
        <p role="status" aria-live="polite" className="mt-2 text-center text-sm font-black text-[#2d6a4f]">
          {statusMessage}
        </p>
      )}
    </div>
  );
}
