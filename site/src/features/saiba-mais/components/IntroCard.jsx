import { Icon } from '@iconify/react';

export default function IntroCard() {
  return (
    <section
      aria-labelledby="sobre-projeto-title"
      className="intro-card relative mt-4 overflow-hidden rounded-[28px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(253,246,227,.98),rgba(245,230,192,.96)_55%,rgba(237,217,163,.96))] p-4 md:p-6 shadow-[0_14px_38px_rgba(28,44,30,.22),inset_0_1px_0_rgba(255,255,255,.85)]"
    >
      <div className="section-kicker relative z-[1] inline-flex items-center gap-2 rounded-full bg-[rgba(45,106,79,.12)] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#2d6a4f]">
        <Icon icon="fa6-solid:compass" />
        Sobre o projeto
      </div>
      <h2
        className="relative z-[1] my-3 font-display text-2xl md:text-3xl font-black text-[#3d1a00]"
        id="sobre-projeto-title"
      >
        Balanço Cidadão MG
      </h2>
      <p className="relative z-[1] font-extrabold leading-relaxed text-[#6b3a1f] mb-3">
        O Balanço Cidadão foi estruturado para aproximar a sociedade das
        informações públicas sobre arrecadação, despesas, investimentos e
        resultados do Estado de Minas Gerais. A proposta combina linguagem
        simples, recursos visuais e narrativa lúdica para tornar o conteúdo
        técnico mais compreensível, útil e participativo.
      </p>
      <p className="relative z-[1] font-extrabold leading-relaxed text-[#6b3a1f]">
        O projeto integra educação fiscal, transparência pública e cidadania,
        incentivando o acompanhamento das contas públicas e a participação
        social na gestão das políticas públicas.
      </p>
    </section>
  );
}

