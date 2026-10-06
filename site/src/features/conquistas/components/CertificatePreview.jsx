import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import CertificateForm from './CertificateForm.jsx';

export default function CertificatePreview({
  participantName = 'Participante',
  formattedDate = 'Minas Gerais',
  isLocked = true,
  missingTrailsCount = 4,
  completedTrailsCount = 0,
  requiredTrailsCount = 4,
}) {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(0.42);

  useEffect(() => {
    const updatePreviewScale = () => {
      if (!stageRef.current || !stageRef.current.parentElement) return;
      const parentWidth = stageRef.current.parentElement.clientWidth || 500;
      const available = Math.max(300, Math.min(parentWidth, 680));
      const calculatedScale = Math.min(available / 1123, 0.55);
      setScale(calculatedScale);
    };

    updatePreviewScale();
    window.addEventListener('resize', updatePreviewScale);
    return () => window.removeEventListener('resize', updatePreviewScale);
  }, []);

  return (
    <div className="certificate-shell relative w-full overflow-hidden rounded-[32px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,#fffdf7,#fbf4e2)] p-4 sm:p-6 shadow-[0_20px_50px_rgba(76,38,10,.18)] flex flex-col gap-6">
      {/* Top Banner inside certificate section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#8b6914]/20 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,#f5a800,#c0272d)] text-white shadow-md">
            <Icon icon="fa6-solid:award" className="text-xl" />
          </span>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#2d6a4f]">
              Certificado Oficial de Conclusão
            </h2>
            <p className="text-xs font-black text-[#6b3a1f]">
              Emitido pelo Governo do Estado de Minas Gerais · Balanço Cidadão
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-600/30 bg-amber-100 px-3.5 py-1.5 text-xs font-black text-amber-900 shadow-xs">
              <Icon icon="fa6-solid:lock" className="text-amber-700" />
              <span>Pré-visualização (Bloqueado)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-600/30 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 shadow-xs">
              <Icon icon="fa6-solid:circle-check" className="text-emerald-700" />
              <span>Pronto para Download</span>
            </span>
          )}
        </div>
      </div>

      {/* Certificate Stage / Canvas */}
      <div className="relative min-w-0 flex flex-col items-center">
        <div
          ref={stageRef}
          className={`certificate-stage relative max-w-full mx-auto overflow-hidden rounded-2xl border-[4px] shadow-xl transition-all duration-300 ${
            isLocked
              ? 'border-amber-600/50 shadow-[0_0_25px_rgba(245,168,0,0.25)]'
              : 'border-[#8b6914] shadow-[0_0_35px_rgba(45,106,79,0.3)]'
          }`}
          style={{
            width: `${1123 * scale + 8}px`,
            height: `${794 * scale + 8}px`,
          }}
        >
          <div
            className="block origin-top-left"
            style={{ transform: `scale(${scale})` }}
          >
            <div
              id="certificate"
              className={`certificate relative h-[794px] w-[1123px] overflow-hidden border-[12px] border-double border-[#8b6914] bg-[radial-gradient(ellipse_at_top,#ffffff,#fefcf5_60%,#fbf2d8_100%)] text-[#26211b] transition-all duration-300 ${
                isLocked ? 'saturate-[0.85] opacity-[0.92]' : ''
              }`}
            >
              {/* Background Watermark Pattern */}
              <div className="certificate-watermark pointer-events-none absolute inset-0 grid place-items-center text-[280px] text-[#8b6914] opacity-[0.06]">
                <Icon icon="fa6-solid:scale-balanced" />
              </div>

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-4 left-4 h-12 w-12 border-t-2 border-l-2 border-[#8b6914]" />
              <div className="absolute top-4 right-4 h-12 w-12 border-t-2 border-r-2 border-[#8b6914]" />
              <div className="absolute bottom-4 left-4 h-12 w-12 border-b-2 border-l-2 border-[#8b6914]" />
              <div className="absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-[#8b6914]" />

              <div className="certificate-content relative z-[1] flex h-full flex-col p-[48px_64px_42px] text-center">
                <header className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-formal text-xs uppercase tracking-[0.28em] font-bold text-[#8b5e3c]">
                      Estado de Minas Gerais
                    </p>
                    <p className="font-formal text-sm uppercase tracking-[0.2em] text-[#5d351d] font-bold">
                      Secretaria de Estado de Fazenda
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#fdf6e3] border border-[#8b6914]/40 px-3 py-1 font-formal text-xs font-bold text-[#8b6914]">
                      SEF / MG
                    </span>
                  </div>
                </header>

                <section className="mt-6 flex items-center justify-center gap-8">
                  <div className="seal text-4xl grid h-[96px] w-[96px] place-items-center rounded-full border-[5px] border-[#7a4b13] bg-[radial-gradient(circle_at_35%_25%,#fff5bd,#f5a800_45%,#8b6914)] text-[#5d2b0a] shadow-xl">
                    <Icon icon="fa6-solid:landmark" />
                  </div>
                  <div className="text-left">
                    <h1 className="font-formal text-5xl font-bold uppercase tracking-wider text-[#2d2a24]">
                      Certificado
                    </h1>
                    <p className="mt-1 font-formal text-xl text-[#8f1e23] font-bold tracking-wide">
                      DE RECONHECIMENTO & CONCLUSAO
                    </p>
                  </div>
                </section>

                <section className="mt-8 px-12">
                  <p className="font-formal text-lg leading-8 text-[#2d2a24]">
                    Certificamos, para os devidos fins, que
                  </p>
                  <h2
                    id="certificateName"
                    className="mx-auto mt-4 max-w-[780px] border-b-3 border-[#8b6914] pb-3 font-formal text-4xl font-bold leading-tight text-[#8f1e23] tracking-wide"
                  >
                    {participantName}
                  </h2>
                  <p className="mx-auto mt-6 max-w-[880px] font-formal text-lg leading-8 text-[#2d2a24]">
                    concluiu com êxito a jornada educativa do{' '}
                    <strong className="text-[#8f1e23]">Balanço Cidadão MG</strong>, completando as etapas da{' '}
                    <strong className="text-[#2d6a4f]">Trilha do Tesouro</strong> e demonstrando
                    comprometimento com a transparência pública, controle social e educação fiscal.
                  </p>
                </section>

                <footer className="mt-auto">
                  <p id="certificateDate" className="font-formal text-base font-bold text-[#2d2a24]">
                    {formattedDate}
                  </p>
                  <div className="mx-auto mt-8 grid max-w-[650px] grid-cols-2 gap-12">
                    <div>
                      <div className="signature-line mx-auto mb-2 h-px w-[230px] bg-[#5d351d]" />
                      <p className="font-formal text-xs font-bold uppercase tracking-wide text-[#5d351d]">
                        Programa Educação Fiscal MG
                      </p>
                    </div>
                    <div>
                      <div className="signature-line mx-auto mb-2 h-px w-[230px] bg-[#5d351d]" />
                      <p className="font-formal text-xs font-bold uppercase tracking-wide text-[#5d351d]">
                        Balanço Cidadão MG
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a4b13]">
                    Autenticidade e emissão digital validadas via Balanço Cidadão MG
                  </p>
                </footer>
              </div>
            </div>
          </div>

          {/* Floating motivational lock badge overlay (non-blocking visually so certificate shines through) */}
          {isLocked && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-end p-4 bg-gradient-to-t from-[#233324]/80 via-[#233324]/30 to-transparent backdrop-blur-[1px]">
              <div className="pointer-events-auto mb-2 w-full max-w-[460px] rounded-2xl border-2 border-[#f5a800] bg-[linear-gradient(135deg,#fffaf0,#fdf0ce)] p-4 text-center text-[#5d2b0a] shadow-2xl">
                <div className="flex items-center justify-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ea580c] to-[#c0272d] text-white text-lg shadow-md">
                    <Icon icon="fa6-solid:lock" />
                  </span>
                  <div className="text-left">
                    <h3 className="font-display text-lg font-black leading-tight text-[#8f1e23]">
                      Quer emitir o seu certificado oficial?
                    </h3>
                    <p className="text-xs font-extrabold text-[#6b3a1f]">
                      Conclua mais <span className="text-[#c0272d] font-black">{missingTrailsCount} trilha{missingTrailsCount !== 1 ? 's' : ''}</span> para liberar a versão em PDF com seu nome!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Form (Download Button + Subtitle) inside Container */}
      <div className="pt-2 border-t border-[#8b6914]/20">
        <CertificateForm
          isLocked={isLocked}
          missingTrailsCount={missingTrailsCount}
          completedTrailsCount={completedTrailsCount}
          requiredTrailsCount={requiredTrailsCount}
          participantName={participantName}
        />
      </div>
    </div>
  );
}
