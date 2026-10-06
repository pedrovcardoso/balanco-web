import { Icon } from '@iconify/react';

const balancoImages = import.meta.glob('@assets/images/balanco/*', { eager: true, import: 'default' });
const getImg = (name) => balancoImages[`/src/assets/images/balanco/${name}`] || balancoImages[`src/assets/images/balanco/${name}`];

export default function MinasGeraisIntro() {
  return (
    <div className="minas-intro-container">
      <section aria-labelledby={'intro-title'} className={'content-section intro-section'} id={'boas-vindas'}>
        <div className={'intro-copy'}>
          <h3 id={'intro-title'}>
            <span>
              Oh!
            </span>
            Minas Gerais
          </h3>
          <p className={'anthem'}>
            <Icon icon="solar:music-notes-bold" aria-hidden="true"  />
            “Oh! Minas Gerais, quem te conhece não esquece jamais.”
          </p>
          <p className={'lead'}>
            Um território de histórias, sotaques, sabores e movimentos que ajudam a construir o país.
          </p>
        </div>
        <figure className={'state-map'}>
          <img alt={'Mapa tridimensional de Minas Gerais dividido em regiões, com o triângulo vermelho da bandeira estadual.'} height={'720'} src={getImg('1_minasgerais3d.png')} width={'900'} />
          <figcaption>
            Minas Gerais: diversidade em cada região.
          </figcaption>
        </figure>
      </section>
      <section aria-labelledby={'identity-title'} className={'content-section identity-section'} id={'identidade'}>
        <div className={'section-heading'}>
          <span>
            Identidade mineira
          </span>
          <h3 id={'identity-title'}>
            Muitas histórias em um só estado
          </h3>
          <p>
            Conheça alguns elementos que fazem parte da experiência de viver e conhecer Minas.
          </p>
        </div>
        <div className={'feature-grid'}>
          <article className={'feature-card'}>
            <span className={'icon-box'}>
              <Icon icon="solar:pallete-2-bold-duotone" aria-hidden="true"  />
            </span>
            <h4>
              História e cultura
            </h4>
            <p>
              Em Minas, história, arte, fé e cultura se cruzam.
            </p>
          </article>
          <article className={'feature-card'}>
            <span className={'icon-box'}>
              <Icon icon="fa6-solid:mountain-sun" aria-hidden="true"  />
            </span>
            <h4>
              Território e tradição
            </h4>
            <p>
              Entre montanhas e cidades nasceram tradições, sabores e movimentos.
            </p>
          </article>
          <article className={'feature-card'}>
            <span className={'icon-box'}>
              <Icon icon="solar:cup-hot-bold-duotone" aria-hidden="true"  />
            </span>
            <h4>
              Acolhimento
            </h4>
            <p>
              Uma boa prosa, um “cafezin” e tempo para compartilhar histórias.
            </p>
          </article>
          <article className={'feature-card quote-card'}>
            <span className={'icon-box'}>
              <Icon icon="solar:chat-round-dots-bold-duotone" aria-hidden="true"  />
            </span>
            <h4>
              Sotaque único
            </h4>
            <p>
              Expressões que já viraram patrimônio afetivo.
            </p>
            <strong>
              “Uai, sô! Trem bão!”
            </strong>
          </article>
        </div>
        <p className={'statement'}>
          Minas é história viva.
          <span>
            Minas é futuro em construção.
          </span>
        </p>
      </section>
      <section aria-labelledby={'data-title'} className={'content-section data-section'} id={'dados-gerais'}>
        <div className={'section-heading centered'}>
          <span>
            Dados gerais
          </span>
          <h3 id={'data-title'}>
            Minas são muitas
          </h3>
          <p>
            Em cada canto, existe uma Minas diferente.
          </p>
        </div>
        <div className={'editorial-grid'}>
          <div className={'story-card'}>
            <Icon icon="solar:map-point-wave-bold-duotone" aria-hidden="true"  />
            <p>
              A Minas das montanhas e do cerrado. A Minas das cidades modernas e das vilas históricas. A Minas do agronegócio, da mineração e da indústria em expansão.
            </p>
          </div>
          <div className={'story-card'}>
            <Icon icon="solar:users-group-rounded-bold-duotone" aria-hidden="true"  />
            <p>
              Cada região tem seu jeito de falar, de cozinhar, de viver e de contar histórias. Minas nasceu da história, cresceu com trabalho e segue se reinventando todos os dias.
            </p>
          </div>
        </div>
        <div className={'location-panel'}>
          <div className={'location-main'}>
            <div>
              <Icon icon="solar:map-point-bold-duotone" aria-hidden="true"  />
              <span>
                <small>
                  Localização
                </small>
                <strong>
                  Região Sudeste
                </strong>
              </span>
            </div>
            <div>
              <Icon icon="solar:buildings-3-bold-duotone" aria-hidden="true"  />
              <span>
                <small>
                  Municípios
                </small>
                <strong>
                  853
                </strong>
              </span>
            </div>
            <div>
              <Icon icon="solar:city-bold-duotone" aria-hidden="true"  />
              <span>
                <small>
                  Capital
                </small>
                <strong>
                  Belo Horizonte
                </strong>
              </span>
            </div>
          </div>
          <aside aria-label={'Capitais históricas de Minas Gerais'} className={'history-note'}>
            <Icon icon="solar:paperclip-2-bold" aria-hidden="true"  />
            <h4>
              Já foram capitais de MG
            </h4>
            <ul>
              <li>
                Mariana
                <span>
                  1696–1745
                </span>
              </li>
              <li>
                Vila Rica/Ouro Preto
                <span>
                  1720/1821–1897
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
      <section aria-labelledby={'metrics-title'} className={'content-section metrics-section'} id={'indicadores'}>
        <div className={'section-heading'}>
          <span>
            Minas em números
          </span>
          <h3 id={'metrics-title'}>
            Indicadores do estado
          </h3>
        </div>
        <div className={'metrics-grid'}>
          <article className={'metric-card'}>
            <Icon icon="solar:ruler-angular-bold-duotone" aria-hidden="true"  />
            <div>
              <span>
                Área territorial
              </span>
              <strong>
                586.513,984 km²
              </strong>
              <small>
                Censo 2024
              </small>
            </div>
          </article>
          <article className={'metric-card'}>
            <Icon icon="solar:users-group-rounded-bold-duotone" aria-hidden="true"  />
            <div>
              <span>
                População
              </span>
              <strong>
                20.539.989
              </strong>
              <small>
                habitantes · Censo 2022
              </small>
            </div>
          </article>
          <article className={'metric-card wide'}>
            <Icon icon="solar:chart-2-bold-duotone" aria-hidden="true"  />
            <div>
              <span>
                Produto Interno Bruto
              </span>
              <strong>
                R$ 1,157 trilhão
              </strong>
              <small>
                2025 · Fundação João Pinheiro · crescimento real de 1,4% em relação ao mesmo período de 2024
              </small>
            </div>
          </article>
        </div>
      </section>
      <section aria-labelledby={'history-title'} className={'content-section history-section'} id={'historia'}>
        <header className={'history-hero'}>
          <figure className={'tiradentes-figure'}>
            <img alt={'Ilustração em traços pretos que acompanha a seção sobre a história de Minas Gerais.'} height={'260'} loading={'lazy'} src={getImg('tiradentes.svg')} width={'260'} />
          </figure>
          <div className={'history-heading'}>
            <span className={'section-tag'}>
              Linha do tempo
            </span>
            <h3 id={'history-title'}>
              História
            </h3>
            <p>
              Da busca por ouro à diversificação da indústria mineira.
            </p>
          </div>
          <Icon icon="solar:document-text-bold-duotone" aria-hidden="true" className="parchment-icon"  />
        </header>
        <div aria-label={'Linha do tempo da história econômica de Minas Gerais'} className={'timeline'}>
          <article className={'timeline-item'}>
            <div className={'timeline-marker'}>
              <Icon icon="solar:map-bold-duotone" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                Século XVI
              </span>
              <h4>
                Expedições e busca por riquezas
              </h4>
              <p>
                A região que hoje corresponde ao estado de Minas Gerais foi inicialmente desbravada no século XVI pelos bandeirantes em busca de ouro e pedras preciosas.
              </p>
            </div>
          </article>
          <article className={'timeline-item'}>
            <div className={'timeline-marker'}>
              <Icon icon="fa6-solid:coins" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                Século XVIII
              </span>
              <h4>
                Ocupação e centro econômico
              </h4>
              <p>
                No século XVIII, a região foi povoada e se tornou um importante centro econômico para Portugal.
              </p>
            </div>
          </article>
          <article className={'timeline-item'}>
            <div className={'timeline-marker'}>
              <Icon icon="fa6-solid:coins" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                Por volta de 1750
              </span>
              <h4>
                Queda do ouro e aumento dos impostos
              </h4>
              <p>
                A queda na produção de ouro, por volta de 1750, levou a Coroa a aumentar a cobrança de impostos sobre a mineração.
              </p>
            </div>
          </article>
          <article className={'timeline-item timeline-highlight'}>
            <div className={'timeline-marker'}>
              <Icon icon="solar:flag-2-bold-duotone" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                1789
              </span>
              <h4>
                Inconfidência Mineira
              </h4>
              <p>
                O descontentamento com essa rigidez desencadeou o movimento político conhecido como Inconfidência Mineira, em 1789, que teve como principal personagem Joaquim José da Silva Xavier, o Tiradentes.
              </p>
            </div>
          </article>
          <article className={'timeline-item'}>
            <div className={'timeline-marker'}>
              <Icon icon="solar:cup-hot-bold-duotone" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                Século XIX
              </span>
              <h4>
                Expansão da cafeicultura
              </h4>
              <p>
                A predominância da mineração na economia do estado inibiu outras atividades, fazendo com que a cafeicultura despontasse somente no século XIX, quando passou a ser a principal atividade econômica da província, resultando em um período de prosperidade.
              </p>
            </div>
          </article>
          <article className={'timeline-item'}>
            <div className={'timeline-marker'}>
              <Icon icon="solar:buildings-2-bold-duotone" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                1929–1930
              </span>
              <h4>
                Crise do café e avanço industrial
              </h4>
              <p>
                A crise de 1929 e a Revolução de 1930 afetaram a produção de café e estimularam o avanço da indústria siderúrgica e da exploração mineral.
              </p>
            </div>
          </article>
          <article className={'timeline-item'}>
            <div className={'timeline-marker'}>
              <Icon icon="solar:structure-bold-duotone" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                Década de 1950
              </span>
              <h4>
                Substituição de importações
              </h4>
              <p>
                A indústria ganhou força com a política de substituição de importações, na década de 1950.
              </p>
            </div>
          </article>
          <article className={'timeline-item timeline-final'}>
            <div className={'timeline-marker'}>
              <Icon icon="solar:city-bold-duotone" aria-hidden="true"  />
            </div>
            <div className={'timeline-card'}>
              <span className={'timeline-date'}>
                Anos 1970
              </span>
              <h4>
                Diversificação industrial
              </h4>
              <p>
                Os anos 1970 marcaram um grande surto de industrialização em Minas Gerais, com diversificação e fortalecimento de novos setores industriais.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section aria-labelledby={'culture-title'} className={'content-section culture-section'} id={'cultura'}>
        <header className={'culture-hero'}>
          <div className={'culture-title-wrap'}>
            <span className={'section-tag'}>
              Cultura mineira
            </span>
            <h3 id={'culture-title'}>
              Minas Gerais
            </h3>
          </div>
          <p className={'culture-script'}>
            Onde religiosidade,
            <br />
            hospitalidade e gastronomia
            <br />
            se cruzam.
          </p>
        </header>
        <div className={'culture-intro'}>
          <Icon icon="fa6-solid:church" aria-hidden="true" className="culture-church"  />
          <img alt={'Ilustração de um queijo Minas com uma fatia retirada.'} className={'cheese-illustration'} height={'180'} loading={'lazy'} src={getImg('queijo.webp')} width={'220'} />
          <p>
            A cultura de Minas Gerais é uma das mais ricas e singulares do Brasil, moldada por uma história que remonta ao ciclo do ouro e caracterizada por uma identidade que mescla religiosidade, hospitalidade e uma gastronomia de renome mundial.
          </p>
          <aside aria-label={'Convite para um café'} className={'coffee-invitation'}>
            <Icon icon="solar:cup-hot-bold-duotone" aria-hidden="true" className="coffee-cup"  />
            <p>
              <strong>
                Fica mais um pouco.
              </strong>
              <span>
                Vai ter café!
              </span>
            </p>
          </aside>
        </div>
        <div className={'culture-layout'}>
          <section aria-labelledby={'table-title'} className={'photo-journal'}>
            <div aria-hidden={'true'} className={'journal-rings'}>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>
            <span className={'tape-label'} id={'table-title'}>
              Gastronomia e mineiridade
            </span>
            <figure className={'main-photo'}>
              <img alt={'Mesa com diferentes pratos da culinária mineira em um ambiente doméstico.'} height={'620'} loading={'lazy'} src={getImg('foto_mesa.png')} width={'760'} />
              <figcaption>
                A mesa mineira como espaço de encontro e convivência.
              </figcaption>
            </figure>
            <div className={'small-photos'}>
              <figure>
                <img alt={'Produção artesanal de queijo em Minas Gerais.'} height={'340'} loading={'lazy'} src={getImg('foto_queijo.png')} width={'400'} />
                <figcaption>
                  Queijo artesanal
                </figcaption>
              </figure>
              <figure>
                <img alt={'Garrafas que representam a produção artesanal de cachaça em Minas Gerais.'} height={'340'} loading={'lazy'} src={getImg('foto_cachaca.png')} width={'400'} />
                <figcaption>
                  Cachaça artesanal
                </figcaption>
              </figure>
            </div>
          </section>
          <div className={'culture-copy'}>
            <blockquote>
              <Icon icon="solar:chat-square-quote-bold-duotone" aria-hidden="true"  />
              <p>
                A mesa mineira é o centro da vida social, refletindo a hospitalidade de seu povo.
              </p>
            </blockquote>
            <div className={'gastronomy-note'}>
              <Icon icon="solar:paperclip-2-bold" aria-hidden="true" className="paperclip"  />
              <div className={'food-topic'}>
                <Icon icon="game-icons:cheese-wedge" aria-hidden="true"  />
                <p>
                  <strong>
                    Patrimônio cultural.
                  </strong>
                  O Queijo Minas é reconhecido como patrimônio imaterial brasileiro pelo IPHAN.
                </p>
              </div>
              <div className={'food-topic'}>
                <Icon icon="game-icons:meal" aria-hidden="true"  />
                <p>
                  <strong>
                    Pratos ícones.
                  </strong>
                  Destacam-se o pão de queijo, o feijão tropeiro, o frango com quiabo, o tutu à mineira e doces como o doce de leite e a goiabada com queijo.
                </p>
              </div>
              <div className={'food-topic'}>
                <Icon icon="game-icons:bottle-vapors" aria-hidden="true"  />
                <p>
                  <strong>
                    Bebidas.
                  </strong>
                  O estado é famoso pela produção de cachaças artesanais e café de alta qualidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby={'faith-title'} className={'content-section faith-section'} id={'tradicao-fe'}>
        <header className={'faith-heading'}>
          <span className={'section-tag'}>
            Patrimônio e devoção
          </span>
          <h3 id={'faith-title'}>
            Tradição e Fé
          </h3>
          <p>
            Expressões coletivas que unen memória, arte, religiosidade e participação comunitária.
          </p>
        </header>
        <article aria-labelledby={'congado-title'} className={'tradition-feature congada-feature'}>
          <div className={'feature-copy'}>
            <span aria-hidden={'true'} className={'feature-number'}>
              01
            </span>
            <div>
              <h4 id={'congado-title'}>
                Congado
              </h4>
              <p>
                O Congado é uma das expressões mais fortes, misturando elementos africanos e católicos em devoção a Nossa Senhora do Rosário.
              </p>
            </div>
            <Icon icon="solar:music-notes-bold" aria-hidden="true"  />
          </div>
          <div aria-label={'Registros visuais do Congado'} className={'congada-gallery'}>
            <figure className={'gallery-card gallery-main'}>
              <img alt={'Participantes de uma celebração do Congado tocando tambores em espaço público.'} decoding={'async'} height={'560'} loading={'lazy'} src={getImg('congado_tambor.png')} width={'760'} />
              <figcaption>
                O tambor marca o ritmo e acompanha a celebração.
              </figcaption>
            </figure>
            <figure className={'gallery-card gallery-secondary'}>
              <img alt={'Cortejo do Congado com participantes caminhando juntos durante a celebração.'} decoding={'async'} height={'560'} loading={'lazy'} src={getImg('congado.png')} width={'760'} />
              <figcaption>
                O cortejo reúne devoção, música e participação comunitária.
              </figcaption>
            </figure>
          </div>
        </article>
        <div aria-hidden={'true'} className={'faith-divider'}>
          <Icon icon="fa6-solid:cross" aria-hidden="true"  />
          <span></span>
          <Icon icon="solar:pallete-2-bold-duotone" aria-hidden="true"  />
        </div>
        <article aria-labelledby={'carpet-title'} className={'tradition-feature carpet-feature'}>
          <div className={'feature-copy aqua-copy'}>
            <span aria-hidden={'true'} className={'feature-number'}>
              02
            </span>
            <div>
              <h4 id={'carpet-title'}>
                Tapetes devocionais
              </h4>
              <p>
                Os Tapetes Devocionais são um dos símbolos mais marcantes da Semana Santa e de Corpus Christi em Minas Gerais. A tradição vem desde o século XVIII e acontece em praticamente todos os municípios e distritos mineiros, especialmente Ouro Preto, Mariana e Sabará.
              </p>
              <p>
                Os tapetes são confeccionados com serragem colorida, flores, farinha, entre outros materiais. É a mais pura arte da fé. Fiéis, famílias, crianças, pessoas idosas e turistas se unem para preparar os caminhos por onde passará a procissão.
              </p>
            </div>
            <Icon icon="solar:pallete-2-bold-duotone" aria-hidden="true"  />
          </div>
          <figure className={'carpet-photo'}>
            <img alt={'Rua histórica decorada com extensos tapetes devocionais coloridos formando desenhos florais e geométricos.'} decoding={'async'} height={'680'} loading={'lazy'} src={getImg('tapetes.png')} width={'1200'} />
            <figcaption>
              Tapetes devocionais preparados ao longo de uma rua histórica de Minas Gerais.
            </figcaption>
          </figure>
        </article>
      </section>
      <section aria-labelledby={'heritage-title'} className={'content-section heritage-section'} id={'patrimonio-arte'}>
        <header className={'heritage-heading'}>
          <span className={'section-tag'}>
            Acervo mineiro
          </span>
          <h3 id={'heritage-title'}>
            Patrimônio e Arte
          </h3>
          <p>
            Arquitetura, escultura e literatura conectam memória, território e criação.
          </p>
        </header>
        <div className={'heritage-summary'}>
          <Icon icon="solar:buildings-2-bold-duotone" aria-hidden="true"  />
          <p>
            Minas detém cerca de 60% do patrimônio histórico tombado do Brasil, com cidades que funcionam como museus a céu aberto.
          </p>
        </div>
        <div className={'heritage-topics'}>
          <article>
            <span className={'topic-icon'}>
              <Icon icon="fa6-solid:church" aria-hidden="true"  />
            </span>
            <div>
              <h4>
                Barroco mineiro
              </h4>
              <p>
                Estilo artístico que floresceu no século XVIII, com destaque para as obras de Aleijadinho em cidades como Ouro Preto, Congonhas e Diamantina.
              </p>
            </div>
          </article>
          <article>
            <span className={'topic-icon'}>
              <Icon icon="solar:medal-ribbon-star-bold-duotone" aria-hidden="true"  />
            </span>
            <div>
              <h4>
                Patrimônios da Humanidade
              </h4>
              <p>
                Incluem o Centro Histórico de Ouro Preto, o Santuário do Bom Jesus de Matosinhos, em Congonhas, o Centro Histórico de Diamantina e o Conjunto Arquitetônico da Pampulha, em Belo Horizonte.
              </p>
            </div>
          </article>
          <article>
            <span className={'topic-icon'}>
              <Icon icon="solar:book-2-bold-duotone" aria-hidden="true"  />
            </span>
            <div>
              <h4>
                Literatura
              </h4>
              <p>
                Berço de nomes como Adélia Prado, Carlos Drummond de Andrade, Carolina Maria de Jesus e Guimarães Rosa, que utilizaram as paisagens e os conflitos mineiros como cenário universal.
              </p>
            </div>
          </article>
        </div>
        <div aria-label={'Galeria de patrimônio e arte de Minas Gerais'} className={'heritage-gallery'}>
          <figure className={'heritage-photo pampulha'}>
            <img alt={'Vista do conjunto arquitetônico da Igrejinha da Pampulha junto à água e à paisagem arborizada.'} decoding={'async'} height={'480'} loading={'lazy'} src={getImg('igrejinha_pampulha.png')} width={'700'} />
            <figcaption>
              Conjunto Arquitetônico da Pampulha
            </figcaption>
          </figure>
          <figure className={'heritage-photo aleijadinho'}>
            <img alt={'Esculturas históricas atribuídas ao conjunto artístico associado a Aleijadinho, com paisagem urbana ao fundo.'} decoding={'async'} height={'480'} loading={'lazy'} src={getImg('aleijadinho.png')} width={'700'} />
            <figcaption>
              Obras associadas ao barroco mineiro
            </figcaption>
          </figure>
          <figure className={'heritage-photo book'}>
            <img alt={'Capa do livro Grande Sertão: Veredas, de João Guimarães Rosa.'} decoding={'async'} height={'650'} loading={'lazy'} src={getImg('grande_sertao_veredas.png')} width={'500'} />
            <figcaption>
              Literatura mineira
            </figcaption>
          </figure>
          <figure className={'heritage-photo church'}>
            <img alt={'Conjunto urbano histórico com igreja de duas torres em Minas Gerais.'} decoding={'async'} height={'480'} loading={'lazy'} src={getImg('igreja.png')} width={'700'} />
            <figcaption>
              Arquitetura religiosa e paisagem urbana
            </figcaption>
          </figure>
          <figure className={'heritage-photo statues'}>
            <img alt={'Conjunto de esculturas expostas em ambiente cultural.'} decoding={'async'} height={'480'} loading={'lazy'} src={getImg('estatuas.png')} width={'700'} />
            <figcaption>
              Escultura e imaginário religioso
            </figcaption>
          </figure>
          <figure className={'heritage-photo churches'}>
            <img alt={'Fachadas de igrejas históricas sob céu azul.'} decoding={'async'} height={'480'} loading={'lazy'} src={getImg('igrejas.png')} width={'700'} />
            <figcaption>
              Igrejas históricas mineiras
            </figcaption>
          </figure>
        </div>
        <div className={'heritage-closing'}>
          <Icon icon="solar:structure-bold-duotone" aria-hidden="true"  />
          <div>
            <h4>
              Arte em diálogo com o futuro
            </h4>
            <p>
              Em harmonioso contraste com a herança colonial, o estado abriga o Instituto Inhotim, em Brumadinho. Reconhecido como um dos maiores museus a céu aberto do planeta, o espaço projeta Minas Gerais para o futuro ao fundir um acervo botânico exuberante com obras de arte contemporânea de relevância mundial.
            </p>
            <p>
              Para além da arquitetura, arte e literatura, Minas se destaca na musicalidade de Clara Nunes e de movimentos como o Clube da Esquina.
            </p>
          </div>
        </div>
      </section>
      <section aria-labelledby={'country-title'} className={'content-section country-section'} id={'minas-pais'}>
        <header className={'country-heading'}>
          <span className={'section-tag'}>
            Dimensão e identidade
          </span>
          <h3 id={'country-title'}>
            Um “país” chamado
            <br />
            Minas Gerais
          </h3>
          <p>
            Um estado de escala continental, economia diversificada e identidade própria.
          </p>
        </header>
        <div className={'country-notes'}>
          <article className={'paper-note green-note'}>
            <span className={'paper-note-icon'}><Icon icon="solar:map-bold-duotone" aria-hidden="true" /></span>
            <h4>
              Território e população
            </h4>
            <p>
              Com mais de 20 milhões de habitantes e uma área territorial superior à de países como França ou Espanha, Minas é o quarto maior estado em extensão territorial e o segundo mais populoso do Brasil.
            </p>
          </article>
          <article className={'paper-note blue-note'}>
            <span className={'paper-note-icon'}><Icon icon="solar:chart-2-bold-duotone" aria-hidden="true" /></span>
            <h4>
              Força econômica
            </h4>
            <p>
              Se fosse um país, o estado teria uma economia superior à de nações como Marrocos, Tunísia, Croácia e Bolívia.
            </p>
            <p>
              A mineração, o agronegócio e as indústrias siderúrgica e automotiva são pilares econômicos.
            </p>
          </article>
          <article className={'paper-note white-note'}>
            <span className={'paper-note-icon'}><Icon icon="solar:cup-hot-bold-duotone" aria-hidden="true" /></span>
            <h4>
              Identidade local
            </h4>
            <p>
              O mineiro possui modo de vida, culinária e vocabulário próprios — o “mineirês” — que geram forte sentimento de identidade local, reforçado pela cultura do cafezinho, do “trem” e do acolhimento.
            </p>
          </article>
          <article className={'paper-note yellow-note'}>
            <span className={'paper-note-icon'}><Icon icon="solar:city-bold-duotone" aria-hidden="true" /></span>
            <h4>
              Complexidade administrativa
            </h4>
            <p>
              Minas Gerais possui 853 municípios, mais do que muitos países independentes, o que cria uma complexidade administrativa interna própria.
            </p>
          </article>
        </div>
        <aside aria-labelledby={'admin-title'} className={'public-admin-note'}>
          <Icon icon="solar:buildings-3-bold-duotone" aria-hidden="true"  />
          <div>
            <h4 id={'admin-title'}>
              Por que a Administração Pública é essencial?
            </h4>
            <p>
              Para cuidar de um estado tão grande e diverso, é preciso organização, planejamento e responsabilidade. É necessária uma estrutura que promova acesso à saúde, educação, segurança, estradas e oportunidades.
              <strong>
                Essa estrutura é chamada de Administração Pública.
              </strong>
            </p>
            <p>
              É por meio dela que o governo planeja ações, oferece serviços e cuida do que é de todos.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

