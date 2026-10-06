import { Icon } from '@iconify/react';

export default function PrinciplesSection() {
  return (
    <section
      aria-labelledby="principios-title"
      className="principles-section relative mt-6 overflow-hidden rounded-[28px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(253,246,227,.98),rgba(245,230,192,.96)_55%,rgba(237,217,163,.96))] p-4 md:p-6 shadow-[0_14px_38px_rgba(28,44,30,.22),inset_0_1px_0_rgba(255,255,255,.85)]"
    >
      <div className="section-header relative z-[1] mb-4 text-left">
        <p className="page-eyebrow mb-1 text-xs font-black uppercase tracking-widest text-[#9b6b2a]">
          Comunicação pública
        </p>
        <h2
          className="relative z-[1] my-1 font-display text-2xl md:text-3xl font-black text-[#3d1a00]"
          id="principios-title"
        >
          Linguagem simples e acessibilidade
        </h2>
      </div>

      <div className="principle-grid relative z-[1] grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Linguagem Simples */}
        <article className="principle-card relative overflow-hidden rounded-[26px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(255,255,255,.96),rgba(253,246,227,.93))] p-4 shadow-md">
          <div className="principle-title-row relative z-[1] mb-3 flex items-center gap-3">
            <span className="principle-icon grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#c0272d,#f5a800)] text-2xl text-white shadow-md">
              <Icon aria-hidden="true" icon="fa6-solid:comment-dots" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(45,106,79,.12)] px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-[#2d6a4f]">
                Clareza
              </span>
              <h3 className="mb-0 mt-1 font-display text-xl md:text-2xl font-black leading-none text-[#3d1a00]">
                Linguagem Simples
              </h3>
            </div>
          </div>

          <div
            aria-label="Benefícios da linguagem simples"
            className="postit-wall relative z-[1] my-4 grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            <div className="postit yellow rounded-xl p-3 shadow bg-[#fef3c7]">
              <strong className="block font-display text-sm text-[#3d1a00]">Entender</strong>
              <span className="mt-1 block text-xs font-black leading-snug text-[#5d2b0a]">
                Informações técnicas viram conteúdo direto.
              </span>
            </div>
            <div className="postit green rounded-xl p-3 shadow bg-[#dcfce7]">
              <strong className="block font-display text-sm text-[#3d1a00]">Acompanhar</strong>
              <span className="mt-1 block text-xs font-black leading-snug text-[#5d2b0a]">
                O cidadão identifica como os recursos são usados.
              </span>
            </div>
            <div className="postit blue rounded-xl p-3 shadow bg-[#dbeafe]">
              <strong className="block font-display text-sm text-[#3d1a00]">Participar</strong>
              <span className="mt-1 block text-xs font-black leading-snug text-[#5d2b0a]">
                Menos barreiras, mais controle social.
              </span>
            </div>
          </div>

          <p className="relative z-[1] font-extrabold leading-relaxed text-[#6b3a1f] text-sm mb-3">
            Quando informações sobre as contas do governo são apresentadas de forma clara, acessível e com recursos visuais que facilitam a compreensão, qualquer pessoa — independentemente de formação técnica — consegue entender como o dinheiro público é arrecadado e utilizado.
          </p>
          <p className="relative z-[1] font-extrabold leading-relaxed text-[#6b3a1f] text-sm">
            A linguagem simples e a linguagem lúdica são ferramentas essenciais para fortalecer a transparência pública. Elas aproximam o cidadão do orçamento, reduzem barreiras técnicas e ampliam a capacidade de participação social.
          </p>
        </article>

        {/* Acessibilidade */}
        <article className="principle-card relative overflow-hidden rounded-[26px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(255,255,255,.96),rgba(253,246,227,.93))] p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="principle-title-row relative z-[1] mb-3 flex items-center gap-3">
              <span className="principle-icon grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#c0272d,#f5a800)] text-2xl text-white shadow-md">
                <Icon aria-hidden="true" icon="fa6-solid:universal-access" />
              </span>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(45,106,79,.12)] px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-[#2d6a4f]">
                  Inclusão digital
                </span>
                <h3 className="mb-0 mt-1 font-display text-xl md:text-2xl font-black leading-none text-[#3d1a00]">
                  Acessibilidade
                </h3>
              </div>
            </div>

            <div
              aria-label="Exemplos de acessibilidade aplicados"
              className="a11y-example-grid relative z-[1] my-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              <div className="a11y-example flex items-center gap-2 rounded-xl border-2 border-[rgba(45,106,79,.16)] bg-white/85 p-2.5 font-black text-[#4b2a12] text-xs">
                <Icon
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2d6a4f] text-white p-1.5"
                  icon="fa6-solid:keyboard"
                />
                <span>Navegação por teclado</span>
              </div>
              <div className="a11y-example flex items-center gap-2 rounded-xl border-2 border-[rgba(45,106,79,.16)] bg-white/85 p-2.5 font-black text-[#4b2a12] text-xs">
                <Icon
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2d6a4f] text-white p-1.5"
                  icon="fa6-solid:eye"
                />
                <span>Contraste e leitura visual</span>
              </div>
              <div className="a11y-example flex items-center gap-2 rounded-xl border-2 border-[rgba(45,106,79,.16)] bg-white/85 p-2.5 font-black text-[#4b2a12] text-xs">
                <Icon
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2d6a4f] text-white p-1.5"
                  icon="fa6-solid:heading"
                />
                <span>Hierarquia semântica</span>
              </div>
              <div className="a11y-example flex items-center gap-2 rounded-xl border-2 border-[rgba(45,106,79,.16)] bg-white/85 p-2.5 font-black text-[#4b2a12] text-xs">
                <Icon
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2d6a4f] text-white p-1.5"
                  icon="fa6-solid:person-walking-arrow-right"
                />
                <span>Uso com tecnologias assistivas</span>
              </div>
            </div>

            <p className="relative z-[1] font-extrabold leading-relaxed text-[#6b3a1f] text-sm mb-3">
              A página considera boas práticas de acessibilidade digital, com atenção a contraste, hierarquia visual, navegação por teclado, textos alternativos, foco visível e organização semântica do conteúdo.
            </p>
          </div>

          <div className="standards-box relative z-[1] grid gap-2">
            <a
              className="flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-[rgba(139,94,60,.28)] bg-[#fffaf0] px-3 py-2 text-xs font-black text-[#5d2b0a] no-underline transition hover:-translate-y-0.5 hover:border-[#f5a800] hover:bg-[#fff7df] focus-visible:outline-none"
              href="https://www.w3.org/TR/WCAG22/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>
                <strong className="font-display text-[#c0272d]">WCAG</strong> Web Content Accessibility Guidelines
              </span>
              <Icon aria-hidden="true" icon="fa6-solid:arrow-up-right-from-square" />
            </a>
            <a
              className="flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-[rgba(139,94,60,.28)] bg-[#fffaf0] px-3 py-2 text-xs font-black text-[#5d2b0a] no-underline transition hover:-translate-y-0.5 hover:border-[#f5a800] hover:bg-[#fff7df] focus-visible:outline-none"
              href="https://emag.governoeletronico.gov.br/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>
                <strong className="font-display text-[#c0272d]">eMAG</strong> Modelo de Acessibilidade em Governo Eletrônico
              </span>
              <Icon aria-hidden="true" icon="fa6-solid:arrow-up-right-from-square" />
            </a>
            <a
              className="flex items-center justify-between gap-2 rounded-xl border-2 border-dashed border-[rgba(139,94,60,.28)] bg-[#fffaf0] px-3 py-2 text-xs font-black text-[#5d2b0a] no-underline transition hover:-translate-y-0.5 hover:border-[#f5a800] hover:bg-[#fff7df] focus-visible:outline-none"
              href="https://www2.camara.leg.br/a-camara/estruturaadm/gestao-na-camara-dos-deputados/responsabilidade-social-e-ambiental/acessibilidade/pdfs/ABNTNBR17225AcessibilidadeDigitalparaWeb.pdf"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>
                <strong className="font-display text-[#c0272d]">ABNT NBR 17225</strong> Acessibilidade em conteúdo e aplicações web
              </span>
              <Icon aria-hidden="true" icon="fa6-solid:arrow-up-right-from-square" />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

