import { Icon } from '@iconify/react';

export default function TeamSection() {
  return (
    <section
      aria-labelledby="equipe-title"
      className="team-section relative mt-6 overflow-hidden rounded-[28px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(253,246,227,.98),rgba(245,230,192,.96)_55%,rgba(237,217,163,.96))] p-4 md:p-6 shadow-[0_14px_38px_rgba(28,44,30,.22),inset_0_1px_0_rgba(255,255,255,.85)]"
    >
      <div className="section-header relative z-[1] mb-4 text-left">
        <p className="page-eyebrow mb-1 text-xs font-black uppercase tracking-widest text-[#9b6b2a]">
          Equipe
        </p>
        <h2
          className="relative z-[1] my-1 font-display text-2xl md:text-3xl font-black text-[#3d1a00]"
          id="equipe-title"
        >
          Créditos do projeto
        </h2>
      </div>

      <div className="team-grid relative z-[1] grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Elaboração */}
        <article className="team-card relative rounded-3xl border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(253,246,227,.92))] p-4 shadow-md">
          <h3 className="relative z-[1] flex items-center gap-2 font-display text-xl font-black text-[#3d1a00]">
            <Icon aria-hidden="true" icon="fa6-solid:pen-ruler" />
            Elaboração
          </h3>
          <ul className="role-list relative z-[1] mt-3 grid gap-2 list-none p-0">
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 p-3 font-black text-[#4b2a12]">
              <strong className="block text-[#3d1a00]">Pedro Henrique Vieira Cardoso</strong>
              <span className="mt-0.5 block text-xs text-[#8b5e3c]">Web developer e design</span>
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 p-3 font-black text-[#4b2a12]">
              <strong className="block text-[#3d1a00]">Michelle Souza do Espírito Santo</strong>
              <span className="mt-0.5 block text-xs text-[#8b5e3c]">História em Quadrinhos e Design Editorial</span>
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 p-3 font-black text-[#4b2a12]">
              <strong className="block text-[#3d1a00]">Higor Alfredo Damaso da Silva</strong>
              <span className="mt-0.5 block text-xs text-[#8b5e3c]">Conteúdo Técnico e Revisão Textual</span>
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 p-3 font-black text-[#4b2a12]">
              <strong className="block text-[#3d1a00]">Emília Vieira de Oliveira</strong>
              <span className="mt-0.5 block text-xs text-[#8b5e3c]">Revisão Ortográfica Final</span>
            </li>
          </ul>
        </article>

        {/* Equipe Técnica */}
        <article className="team-card relative rounded-3xl border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(253,246,227,.92))] p-4 shadow-md">
          <h3 className="relative z-[1] flex items-center gap-2 font-display text-xl font-black text-[#3d1a00]">
            <Icon aria-hidden="true" icon="fa6-solid:users-gear" />
            Equipe Técnica
          </h3>
          <ul className="person-grid relative z-[1] mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Bruno de Castro Santos
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Higor Alfredo Damaso da Silva
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Lecimaire Alzira Senra Soares
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Marcos Vinicius de Souza
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Michelle Souza do Espírito Santo
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Nelma Barbonaglia da Silva
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Philipp Augusto Krammer Soares
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Ricardo Augusto Zadra
            </li>
            <li className="rounded-2xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2.5 text-xs font-black text-[#4b2a12] shadow-sm">
              Roberto Ulisses Marques
            </li>
          </ul>
        </article>

        {/* Revisões */}
        <article className="team-card relative rounded-3xl border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(253,246,227,.92))] p-4 shadow-md col-span-1 md:col-span-2">
          <h3 className="relative z-[1] flex items-center gap-2 font-display text-xl font-black text-[#3d1a00]">
            <Icon aria-hidden="true" icon="fa6-solid:circle-check" />
            Revisões
          </h3>
          <div className="review-split relative z-[1] mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="review-block rounded-2xl border-2 border-[rgba(139,94,60,.16)] bg-white/80 p-3.5">
              <h4 className="m-0 font-display text-sm font-bold text-[#2d6a4f]">
                Revisão Técnica
              </h4>
              <ul className="person-grid mt-2 grid grid-cols-1 gap-2 list-none p-0">
                <li className="rounded-xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2 text-xs font-black text-[#4b2a12]">
                  Túlio Amorim Corrêa Garcias
                </li>
                <li className="rounded-xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2 text-xs font-black text-[#4b2a12]">
                  Dênis Robinson de Amorim Paixão
                </li>
              </ul>
            </div>
            <div className="review-block rounded-2xl border-2 border-[rgba(139,94,60,.16)] bg-white/80 p-3.5">
              <h4 className="m-0 font-display text-sm font-bold text-[#2d6a4f]">
                Revisão Final
              </h4>
              <ul className="person-grid mt-2 grid grid-cols-1 gap-2 list-none p-0">
                <li className="rounded-xl border-2 border-[rgba(139,94,60,.14)] bg-white/90 px-3 py-2 text-xs font-black text-[#4b2a12]">
                  Fábio Rodrigo Amaral de Assunção
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

