import { Icon } from '@iconify/react';
import logoGovMg from '@assets/images/logo-govmg.png';
import logoSef from '@assets/images/logo-sef.png';
import logoTesouro from '@assets/images/logo-tesouro.png';
import logoSccg from '@assets/images/logo-sccg.png';

const logos = [
  [logoGovMg, 'Governo de Minas Gerais', 'max-h-10'],
  [
    logoSef,
    'Secretaria de Estado de Fazenda de Minas Gerais',
    'max-h-10',
  ],
  [
    logoTesouro,
    'Tesouro Estadual de Minas Gerais',
    'max-h-8',
  ],
  [
    logoSccg,
    'Superintendência Central de Contadoria Geral',
    'max-h-10',
  ],
];

const usefulLinks = [
  ['Portal MG', 'https://www.mg.gov.br/'],
  ['Fazenda', 'https://www.fazenda.mg.gov.br/'],
  [
    'Balanço Geral do Estado',
    'https://www.fazenda.mg.gov.br/tesouro-estadual/contadoria-geral/demonstracoes-contabeis-/balanco-geral-do-estado/',
  ],
  [
    'Balanço Cidadão',
    'https://www.fazenda.mg.gov.br/governo/contadoria_geral/relatorio_contabil/balanco_cidadao-00001/',
  ],
  ['Stefan', 'https://stefan.fazenda.mg.gov.br/'],
];

const socialLinks = [
  [
    'WhatsApp',
    'https://whatsapp.com/channel/0029Vb66F2v6GcG75k1fn00v',
    'fa6-brands:whatsapp',
  ],
  ['Instagram', 'https://www.instagram.com/sef.mg', 'fa6-brands:instagram'],
  [
    'Spotify',
    'https://open.spotify.com/show/5b241uJ8ZCS376atcFT4Gy',
    'fa6-brands:spotify',
  ],
  ['YouTube', 'https://www.youtube.com/@sef_mg', 'fa6-brands:youtube'],
  [
    'LinkedIn',
    'https://www.linkedin.com/company/secretaria-de-estado-de-fazenda-de-minas-gerais-pagina-oficial',
    'fa6-brands:linkedin',
  ],
];

export default function Footer() {
  return (
    <footer className="relative z-20 w-full border-t-2 border-[#f5a800]/55 bg-[#fdf6e3]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[#6b3a1f] shadow-[0_-10px_30px_rgba(25,45,30,0.12)] backdrop-blur-lg">
      <div className="mx-auto w-full max-w-[1180px] p-4">
        <div className="grid grid-cols-2 items-center justify-items-center gap-4 border-b border-[#8b5e3c]/20 pb-4 md:grid-cols-4">
          {logos.map(([src, alt, sizeClass]) => (
            <img
              key={src}
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={`${sizeClass} w-auto max-w-full object-contain opacity-95`}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(360px,1fr)_210px_170px]">
          <section aria-labelledby="footer-about">
            <h2
              id="footer-about"
              className="mb-1 text-sm font-black text-[#5d2b0a]"
            >
              Superintendência Central de Contadoria Geral
            </h2>

            <p className="text-xs font-bold leading-relaxed">
              A SCCG, vinculada à Subsecretaria do Tesouro Estadual da SEF/MG,
              atua na coordenação, normatização, supervisão e orientação técnica
              da contabilidade governamental do Estado de Minas Gerais,
              contribuindo para a qualidade das informações contábeis, fiscais e
              gerenciais e para a transparência da gestão pública.
            </p>
          </section>

          <nav aria-labelledby="footer-links" className="flex flex-col gap-0">
            <h2
              id="footer-links"
              className="mb-1 text-sm font-black text-[#5d2b0a]"
            >
              Links úteis
            </h2>

            {usefulLinks.map(([label, href]) => (
              <ExternalLink key={href} href={href} label={label}>
                {label}
              </ExternalLink>
            ))}
          </nav>

          <nav
            aria-labelledby="footer-social"
            className="grid grid-cols-2 content-start gap-x-2 gap-y-0 sm:grid-cols-3 lg:grid-cols-1"
          >
            <h2
              id="footer-social"
              className="col-span-full mb-1 text-sm font-black text-[#5d2b0a]"
            >
              Redes sociais
            </h2>

            {socialLinks.map(([label, href, icon]) => (
              <ExternalLink key={href} href={href} label={label}>
                <Icon icon={icon} className="text-base" aria-hidden="true" />
                {label}
              </ExternalLink>
            ))}
          </nav>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#8b5e3c]/20 pt-3 text-xs font-extrabold text-[#7a4b13] max-sm:justify-center">
          <span>SEF/MG · Educação Fiscal</span>
          <span>Trilha do Tesouro</span>
        </div>
      </div>
    </footer>
  );
}

function ExternalLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir ${label} em nova aba`}
      className="inline-flex min-h-0 items-center gap-2 rounded px-1 py-1 text-xs font-extrabold leading-normal text-[#8f1e23] transition-colors duration-200 hover:text-[#c0272d] hover:underline focus-visible:underline"
    >
      {children}
    </a>
  );
}
