(function () {
  // Evita duplicação verificando se o CSS já foi injetado
  if (document.getElementById("balanco-cidadao-footer-styles")) {
    return;
  }

  // Cria e injeta o CSS isolado para o footer imediatamente
  const style = document.createElement("style");
  style.id = "balanco-cidadao-footer-styles";
  style.textContent = `
    :root {
      --footer-wine: #8f1e23;
      --footer-wine-hover: #c0272d;
      --footer-logo-height: 36px;
      --footer-logo-max-width: 200px;
      --footer-logo-gap: 1.15rem;
    }
    #balanco-cidadao-footer {
      position: relative;
      z-index: 20;
      width: 100%;
      opacity: 0;
      animation: contentFooter 0.75s ease 0.28s forwards;
      will-change: opacity;
      font-family: "Nunito", sans-serif;
    }
    #balanco-cidadao-footer * {
      box-sizing: border-box;
    }
    @keyframes contentFooter {
      to { opacity: 1; }
    }
    #balanco-cidadao-footer .footer-bar {
      width: 100%;
      max-width: none;
      margin: 0;
      background: rgba(253, 246, 227, 0.97);
      backdrop-filter: blur(10px);
      border-top: 2px solid rgba(245, 168, 0, 0.55);
      box-shadow: 0 -10px 30px rgba(25, 45, 30, 0.12);
      padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
      border-radius: 0;
    }
    #balanco-cidadao-footer .institutional-footer-inner {
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
      padding: 1rem;
      content-visibility: auto;
      contain-intrinsic-size: 420px;
    }
    #balanco-cidadao-footer .institutional-logo-sequence {
      padding-bottom: 0.9rem;
      border-bottom: 1px solid rgba(139, 94, 60, 0.22);
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      align-items: center !important;
      justify-items: center !important;
      gap: var(--footer-logo-gap) !important;
      width: 100% !important;
    }
    #balanco-cidadao-footer .institutional-logo {
      display: block;
      filter: saturate(0.96);
      opacity: 0.96;
      width: auto !important;
      height: auto !important;
      max-height: var(--footer-logo-height) !important;
      max-width: min(100%, var(--footer-logo-max-width)) !important;
      object-fit: contain !important;
    }
    #balanco-cidadao-footer .institutional-info {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.9rem;
      margin-top: 0.9rem;
    }
    #balanco-cidadao-footer .institutional-description h3,
    #balanco-cidadao-footer .institutional-links h4,
    #balanco-cidadao-footer .institutional-social h4 {
      margin: 0 0 0.35rem;
      font-size: 0.82rem;
      font-weight: 900;
      color: #5d2b0a;
    }
    #balanco-cidadao-footer .institutional-description p {
      margin: 0;
      font-size: 0.76rem;
      line-height: 1.45;
      font-weight: 700;
      color: #6b3a1f;
    }
    #balanco-cidadao-footer .institutional-links,
    #balanco-cidadao-footer .institutional-social {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    #balanco-cidadao-footer .institutional-links a,
    #balanco-cidadao-footer .institutional-social a {
      font-size: 0.74rem;
      font-weight: 800;
      text-decoration: none;
      line-height: 1.2;
      color: var(--footer-wine) !important;
    }
    #balanco-cidadao-footer .institutional-links a:hover,
    #balanco-cidadao-footer .institutional-social a:hover,
    #balanco-cidadao-footer .institutional-links a:focus-visible,
    #balanco-cidadao-footer .institutional-social a:focus-visible {
      text-decoration: underline;
      color: var(--footer-wine-hover) !important;
    }
    #balanco-cidadao-footer .institutional-social a {
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.55rem !important;
    }
    #balanco-cidadao-footer .social-icon {
      width: 1.35rem !important;
      height: 1.35rem !important;
      min-width: 1.35rem !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      color: var(--footer-wine) !important;
      -webkit-text-stroke: 0 !important;
      font-size: 1.08rem !important;
      line-height: 1 !important;
      box-shadow: none !important;
      transform: none !important;
    }
    #balanco-cidadao-footer .institutional-social a:hover .social-icon,
    #balanco-cidadao-footer .institutional-social a:focus-visible .social-icon {
      color: var(--footer-wine-hover) !important;
    }
    #balanco-cidadao-footer .institutional-footer-bottom {
      margin-top: 0.85rem;
      padding-top: 0.65rem;
      border-top: 1px solid rgba(139, 94, 60, 0.18);
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      justify-content: space-between;
      font-size: 0.68rem;
      font-weight: 800;
      color: #7a4b13;
    }
    
    @media (min-width: 1024px) {
      #balanco-cidadao-footer .footer-bar {
        border-left: 0;
        border-right: 0;
        border-bottom: 0;
        border-radius: 0;
      }
      #balanco-cidadao-footer .institutional-logo-sequence {
        justify-content: flex-start;
      }
      #balanco-cidadao-footer .institutional-info {
        grid-template-columns: minmax(360px, 1fr) 210px 170px;
        gap: 1.35rem;
      }
      #balanco-cidadao-footer .institutional-logo-gov { max-width: 180px; max-height: 60px; }
      #balanco-cidadao-footer .institutional-logo-sef { max-width: 210px; max-height: 54px; }
      #balanco-cidadao-footer .institutional-logo-tesouro,
      #balanco-cidadao-footer .institutional-logo-sccg { max-width: 160px; max-height: 48px; }
      
      #balanco-cidadao-footer .social-icon {
        width: 1.45rem !important;
        height: 1.45rem !important;
        min-width: 1.45rem !important;
        font-size: 1.18rem !important;
      }
    }
    
    @media (max-width: 767px) {
      #balanco-cidadao-footer {
        opacity: 1 !important;
        transform: none !important;
        animation: none !important;
      }
      #balanco-cidadao-footer .institutional-footer-inner {
        padding: 0.85rem 0.75rem !important;
      }
      #balanco-cidadao-footer .institutional-logo-sequence {
        --footer-logo-height: 34px;
        --footer-logo-max-width: 176px;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 0.8rem 0.95rem !important;
        justify-items: center !important;
      }
      #balanco-cidadao-footer .institutional-info {
        grid-template-columns: 1fr !important;
        gap: 0.75rem !important;
        margin-top: 0.8rem !important;
      }
      #balanco-cidadao-footer .institutional-description h3,
      #balanco-cidadao-footer .institutional-links h4,
      #balanco-cidadao-footer .institutional-social h4 {
        font-size: 0.78rem !important;
      }
      #balanco-cidadao-footer .institutional-description p {
        font-size: 0.71rem !important;
        line-height: 1.38 !important;
      }
      #balanco-cidadao-footer .institutional-links,
      #balanco-cidadao-footer .institutional-social {
        gap: 0.32rem !important;
      }
      #balanco-cidadao-footer .institutional-links a,
      #balanco-cidadao-footer .institutional-social a {
        font-size: 0.73rem !important;
      }
      #balanco-cidadao-footer .institutional-footer-bottom {
        justify-content: center !important;
        text-align: center !important;
      }
      #balanco-cidadao-footer .institutional-social {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 0.45rem !important;
      }
      #balanco-cidadao-footer .institutional-social h4 {
        grid-column: 1 / -1 !important;
      }
      #balanco-cidadao-footer .institutional-social a {
        min-height: 2rem !important;
        padding: 0.25rem 0.35rem !important;
        border-radius: 0.5rem !important;
        background: rgba(255, 255, 255, 0.42) !important;
      }
    }
    
    @media (max-width: 390px) {
      #balanco-cidadao-footer .institutional-logo-sequence {
        --footer-logo-height: 30px;
        --footer-logo-max-width: 154px;
        gap: 0.7rem !important;
      }
      #balanco-cidadao-footer .institutional-social {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  // Função para criar e injetar o HTML do footer
  function renderFooter() {
    if (document.getElementById("balanco-cidadao-footer")) {
      return;
    }

    const footer = document.createElement("footer");
    footer.id = "balanco-cidadao-footer";
    footer.innerHTML = `
      <div class="footer-bar">
        <div class="institutional-footer-inner">
          <div class="institutional-logo-sequence">
            <img alt="Governo de Minas Gerais" class="institutional-logo institutional-logo-gov" decoding="async" height="93" loading="lazy" src="../../../public/images/logo-govmg.png" width="396" /><img alt="Secretaria de Estado de Fazenda de Minas Gerais" class="institutional-logo institutional-logo-sef" decoding="async" height="93" loading="lazy" src="../../../public/images/logo-sef.png" width="372" /><img alt="Tesouro Estadual de Minas Gerais" class="institutional-logo institutional-logo-tesouro" decoding="async" height="93" loading="lazy" src="../../../public/images/logo-tesouro.png" width="585" /><img alt="Superintendência Central de Contadoria Geral" class="institutional-logo institutional-logo-sccg" decoding="async" height="93" loading="lazy" src="../../../public/images/logo-sccg.png" width="315" />
          </div>
          <div class="institutional-info">
            <div class="institutional-description">
              <h3>Superintendência Central de Contadoria Geral</h3>
              <p>A SCCG, vinculada à Subsecretaria do Tesouro Estadual da SEF/MG, atua na coordenação, normatização, supervisão e orientação técnica da contabilidade governamental do Estado de Minas Gerais, contribuindo para a qualidade das informações contábeis, fiscais e gerenciais e para a transparência da gestão pública.</p>
            </div>
            <div class="institutional-links">
              <h4>Links úteis</h4>
              <a aria-label="Abrir Portal MG em nova aba" href="https://www.mg.gov.br/" rel="noopener" target="_blank">Portal MG</a><a aria-label="Abrir site da Fazenda de Minas Gerais em nova aba" href="https://www.fazenda.mg.gov.br/" rel="noopener" target="_blank">Fazenda</a><a aria-label="Abrir Balanço Geral do Estado em nova aba" href="https://www.fazenda.mg.gov.br/tesouro-estadual/contadoria-geral/demonstracoes-contabeis-/balanco-geral-do-estado/" rel="noopener" target="_blank">Balanço Geral do Estado</a><a aria-label="Abrir Balanço Cidadão em nova aba" href="https://www.fazenda.mg.gov.br/governo/contadoria_geral/relatorio_contabil/balanco_cidadao-00001/" rel="noopener" target="_blank">Balanço Cidadão</a><a aria-label="Abrir Stefan em nova aba" href="https://stefan.fazenda.mg.gov.br/" rel="noopener" target="_blank">Stefan</a>
            </div>
            <div class="institutional-social">
              <h4>Redes sociais</h4>
              <a aria-label="Abrir canal da SEF/MG no WhatsApp em nova aba" href="https://whatsapp.com/channel/0029Vb66F2v6GcG75k1fn00v" rel="noopener" target="_blank"><iconify-icon aria-hidden="true" class="social-icon" icon="fa6-brands:whatsapp"></iconify-icon><span>WhatsApp</span></a><a aria-label="Abrir SEF/MG no Instagram em nova aba" href="https://www.instagram.com/sef.mg" rel="noopener" target="_blank"><iconify-icon aria-hidden="true" class="social-icon" icon="fa6-brands:instagram"></iconify-icon><span>Instagram</span></a><a aria-label="Abrir podcast Fazenda em Notícia no Spotify em nova aba" href="https://open.spotify.com/show/5b241uJ8ZCS376atcFT4Gy" rel="noopener" target="_blank"><iconify-icon aria-hidden="true" class="social-icon" icon="fa6-brands:spotify"></iconify-icon><span>Spotify</span></a><a aria-label="Abrir SEF/MG no YouTube em nova aba" href="https://www.youtube.com/@sef_mg" rel="noopener" target="_blank"><iconify-icon aria-hidden="true" class="social-icon" icon="fa6-brands:youtube"></iconify-icon><span>YouTube</span></a><a aria-label="Abrir SEF/MG no LinkedIn em nova aba" href="https://www.linkedin.com/company/secretaria-de-estado-de-fazenda-de-minas-gerais-pagina-oficial" rel="noopener" target="_blank"><iconify-icon aria-hidden="true" class="social-icon" icon="fa6-brands:linkedin"></iconify-icon><span>LinkedIn</span></a>
            </div>
          </div>
          <div class="institutional-footer-bottom">
            <span>SEF/MG · Educação Fiscal 2025</span><span>Trilha do Tesouro</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  }

  // Verifica se o DOM já carregou o <body> antes de adicionar o HTML
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderFooter);
  } else {
    renderFooter();
  }
})();
