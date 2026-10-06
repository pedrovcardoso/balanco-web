import { Icon } from '@iconify/react';
import balancoGeralCapa from '@assets/images/balanco-geral-capa-2026.jpg';
import balancoCidadaoCapa from '@assets/images/balanco-cidadao-capa-2025.png';

export default function MoreSection() {
  return (
    <section
      aria-labelledby="ver-mais-title"
      className="more-section relative mt-6 overflow-hidden rounded-[28px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(253,246,227,.98),rgba(245,230,192,.96)_55%,rgba(237,217,163,.96))] p-4 md:p-6 shadow-[0_14px_38px_rgba(28,44,30,.22),inset_0_1px_0_rgba(255,255,255,.85)]"
    >
      <div className="section-header relative z-[1] mb-4 text-left">
        <p className="page-eyebrow mb-1 text-xs font-black uppercase tracking-widest text-[#9b6b2a]">
          Ver mais
        </p>
        <h2
          className="relative z-[1] my-1 font-display text-2xl md:text-3xl font-black text-[#3d1a00]"
          id="ver-mais-title"
        >
          Mais demonstrativos da Contadoria
        </h2>
        <p className="mt-3 text-sm md:text-base font-extrabold leading-relaxed text-[#6b3a1f]">
          A Superintendência Central de Contadoria Geral (SCCG) reúne e disponibiliza demonstrações contábeis, relatórios e publicações que apoiam a transparência das contas públicas de Minas Gerais. Nesses materiais, é possível consultar informações consolidadas sobre a situação orçamentária, financeira e patrimonial do Estado, além de conteúdos preparados para diferentes públicos.
        </p>
      </div>

      <div className="resource-grid relative z-[1] grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balanço Geral */}
        <a
          aria-label="Acessar Balanço Geral"
          className="resource-card flex flex-col overflow-hidden rounded-[22px] border-2 border-[rgba(139,105,20,.35)] bg-white/90 no-underline shadow-[0_10px_22px_rgba(76,38,10,.13)] transition hover:-translate-y-1 hover:border-[#f5a800] hover:shadow-[0_16px_30px_rgba(76,38,10,.2)] focus-visible:-translate-y-1 focus-visible:border-[#f5a800] focus-visible:outline-none"
          href="https://www.fazenda.mg.gov.br/governo/contadoria_geral/relatorio_contabil/balanco_2025/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            alt="Capa do Balanço Geral"
            className="aspect-[4/3] w-full bg-[#fdf6e3] object-cover"
            loading="lazy"
            src={balancoGeralCapa}
          />
          <div className="resource-body p-4 flex-1 flex flex-col justify-between">
            <div>
              <span className="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-black uppercase bg-[#dbeafe] text-[#1d4ed8]">
                Balanço Geral
              </span>
              <h3 className="font-display text-lg font-black text-[#3d1a00] leading-snug">
                Balanço Geral
              </h3>
              <p className="mt-1 font-extrabold text-xs md:text-sm text-[#6b3a1f]">
                Consulta técnica completa das contas públicas estaduais.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 font-black text-[#c0272d] text-sm">
              Acessar
              <Icon icon="fa6-solid:arrow-right" />
            </span>
          </div>
        </a>

        {/* Acervo Cidadão */}
        <a
          aria-label="Acessar outras edições do Balanço Cidadão"
          className="resource-card flex flex-col overflow-hidden rounded-[22px] border-2 border-[rgba(139,105,20,.35)] bg-white/90 no-underline shadow-[0_10px_22px_rgba(76,38,10,.13)] transition hover:-translate-y-1 hover:border-[#f5a800] hover:shadow-[0_16px_30px_rgba(76,38,10,.2)] focus-visible:-translate-y-1 focus-visible:border-[#f5a800] focus-visible:outline-none"
          href="https://www.fazenda.mg.gov.br/governo/contadoria_geral/relatorio_contabil/balanco_cidadao-00001/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            alt="Capa de edição anterior do Balanço Cidadão"
            className="aspect-[4/3] w-full bg-[#fdf6e3] object-cover"
            loading="lazy"
            src={balancoCidadaoCapa}
          />
          <div className="resource-body p-4 flex-1 flex flex-col justify-between">
            <div>
              <span className="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-black uppercase bg-[#dcfce7] text-[#047857]">
                Acervo cidadão
              </span>
              <h3 className="font-display text-lg font-black text-[#3d1a00] leading-snug">
                Outras edições do Balanço Cidadão
              </h3>
              <p className="mt-1 font-extrabold text-xs md:text-sm text-[#6b3a1f]">
                Histórico de publicações em linguagem acessível sobre as contas públicas.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 font-black text-[#c0272d] text-sm">
              Ver edições
              <Icon icon="fa6-solid:arrow-right" />
            </span>
          </div>
        </a>

        {/* Outros Demonstrativos */}
        <a
          aria-label="Acessar outros demonstrativos contábeis e fiscais"
          className="resource-card flex flex-col overflow-hidden rounded-[22px] border-2 border-[rgba(139,105,20,.35)] bg-white/90 no-underline shadow-[0_10px_22px_rgba(76,38,10,.13)] transition hover:-translate-y-1 hover:border-[#f5a800] hover:shadow-[0_16px_30px_rgba(76,38,10,.2)] focus-visible:-translate-y-1 focus-visible:border-[#f5a800] focus-visible:outline-none"
          href="https://www.fazenda.mg.gov.br/governo/contadoria_geral/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div
            aria-hidden="true"
            className="report-visual relative grid place-items-center overflow-hidden bg-[linear-gradient(135deg,#fff7ed,#fef3c7)] aspect-[4/3] w-full shrink-0"
          >
            <span className="paper paper-a absolute grid h-24 w-20 place-items-center rounded-xl border-2 border-[rgba(139,94,60,.28)] bg-[#fffaf0] text-xl text-[#8b5e3c] shadow-md -translate-x-10 -rotate-12">
              <Icon icon="fa6-solid:scale-balanced" />
            </span>
            <span className="paper paper-b absolute grid h-24 w-20 place-items-center rounded-xl border-2 border-[rgba(139,94,60,.28)] bg-[#fffaf0] text-xl text-[#c0272d] shadow-md z-[2] -translate-y-1 rotate-3">
              <Icon icon="fa6-solid:file-invoice-dollar" />
            </span>
            <span className="paper paper-c absolute grid h-24 w-20 place-items-center rounded-xl border-2 border-[rgba(139,94,60,.28)] bg-[#fffaf0] text-xl text-[#2d6a4f] shadow-md translate-x-10 translate-y-2 rotate-12">
              <Icon icon="fa6-solid:chart-pie" />
            </span>
          </div>
          <div className="resource-body p-4 flex-1 flex flex-col justify-between">
            <div>
              <span className="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-black uppercase bg-[#ffedd5] text-[#c2410c]">
                Transparência
              </span>
              <h3 className="font-display text-lg font-black text-[#3d1a00] leading-snug">
                Outros demonstrativos
              </h3>
              <p className="mt-1 font-extrabold text-xs md:text-sm text-[#6b3a1f]">
                Documentos técnicos de acompanhamento fiscal, contábil, orçamentário e financeiro.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 font-black text-[#c0272d] text-sm">
              Consultar
              <Icon icon="fa6-solid:arrow-right" />
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}

