import { Icon } from '@iconify/react';
export default function AdministracaoPublicaChapter() {
  return (
    <>
    <section aria-labelledby={'admin-section-title'} className={'content-section admin-section'} id={'administracao-publica'}>
      <header className={'admin-heading'}>
        <span className={'section-tag'}>
          Conceito, estrutura e princípios
        </span>
        <h3 id={'admin-section-title'}>
          Administração Pública
        </h3>
      </header>
      <article aria-labelledby={'concept-title'} className={'concept-card'}>
        <div className={'concept-icon'}>
          <Icon icon="solar:eye-bold-duotone" aria-hidden="true"  />
        </div>
        <div>
          <h4 id={'concept-title'}>
            Conceito
          </h4>
          <p>
            Refere-se tanto ao conjunto de órgãos, entidades e agentes estatais que executam atividades visando aos interesses coletivos e à prestação de serviços públicos — aspecto formal — como à atividade exercida propriamente dita: prestação de serviços, poder de polícia, fomento e intervenção — aspecto material.
          </p>
        </div>
      </article>
      <div className={'admin-columns'}>
        <section aria-labelledby={'structure-title'} className={'structure-panel'}>
          <div className={'panel-title'}>
            <Icon icon="solar:buildings-2-bold-duotone" aria-hidden="true"  />
            <h4 id={'structure-title'}>
              Estrutura
            </h4>
          </div>
          <article className={'structure-item'}>
            <span className={'structure-label'}>
              Administração Direta
            </span>
            <p>
              Órgãos ligados diretamente aos entes federativos — União, estados e municípios — como ministérios e secretarias.
            </p>
          </article>
          <article className={'structure-item'}>
            <span className={'structure-label'}>
              Administração Indireta
            </span>
            <p>
              Entidades com personalidade jurídica própria, descentralizadas para executar atividades específicas: autarquias, fundações públicas, empresas públicas e sociedades de economia mista.
            </p>
          </article>
        </section>
        <section aria-labelledby={'principles-title'} className={'principles-panel'}>
          <div className={'panel-title'}>
            <Icon icon="solar:lightbulb-bolt-bold-duotone" aria-hidden="true"  />
            <h4 id={'principles-title'}>
              Princípios
            </h4>
          </div>
          <p>
            De acordo com o artigo 37 da Constituição Federal, a Administração Pública deve seguir cinco pilares:
          </p>
          <ol aria-label={'Princípios constitucionais da Administração Pública'} className={'limpe-list'}>
            <li>
              <span aria-hidden={'true'}>
                L
              </span>
              <div>
                <strong>
                  Legalidade
                </strong>
                <p>
                  Atuar estritamente conforme a lei.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden={'true'}>
                I
              </span>
              <div>
                <strong>
                  Impessoalidade
                </strong>
                <p>
                  Tratamento igualitário e sem promoção pessoal de agentes.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden={'true'}>
                M
              </span>
              <div>
                <strong>
                  Moralidade
                </strong>
                <p>
                  Ética e boa-fé na conduta administrativa.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden={'true'}>
                P
              </span>
              <div>
                <strong>
                  Publicidade
                </strong>
                <p>
                  Transparência nos atos e nas contas públicas.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden={'true'}>
                E
              </span>
              <div>
                <strong>
                  Eficiência
                </strong>
                <p>
                  Busca pelo melhor resultado com o menor custo.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>
    </section>
    <section aria-labelledby={'government-title'} className={'content-section government-section'} id={'esferas-poderes'}>
      <header className={'government-heading'}>
        <span className={'section-tag'}>
          Organização do Estado
        </span>
        <h3 id={'government-title'}>
          Esferas da Administração Pública
        </h3>
        <p>
          O Estado brasileiro se organiza em níveis autônomos e em poderes com funções distintas.
        </p>
      </header>
      <aside className={'federalism-note'}>
        <Icon icon="solar:lightbulb-bolt-bold-duotone" aria-hidden="true"  />
        <p>
          Para compreender a dinâmica da Administração Pública brasileira, é preciso considerar três esferas ou níveis de governo: Federal, Estadual e Municipal. As três representam a descentralização do poder para atender melhor aos interesses dos cidadãos, sendo autônomas entre si, conforme definido na Constituição Federal, artigo 18.
        </p>
      </aside>
      <div aria-label={'Três esferas da Administração Pública'} className={'spheres-grid'}>
        <article className={'sphere-card federal-card'}>
          <Icon icon="solar:flag-2-bold-duotone" aria-hidden="true"  />
          <span className={'sphere-level'}>
            Federal
          </span>
          <h4>
            União
          </h4>
          <p>
            Responsável por questões de interesse nacional, como defesa, emissão de moeda e relações exteriores.
          </p>
        </article>
        <article className={'sphere-card state-card'}>
          <Icon icon="solar:map-point-wave-bold-duotone" aria-hidden="true"  />
          <span className={'sphere-level'}>
            Estadual
          </span>
          <h4>
            Estados e Distrito Federal
          </h4>
          <p>
            Foca em interesses regionais, como segurança pública, saúde, educação e transporte intermunicipal.
          </p>
        </article>
        <article className={'sphere-card municipal-card'}>
          <Icon icon="solar:city-bold-duotone" aria-hidden="true"  />
          <span className={'sphere-level'}>
            Municipal
          </span>
          <h4>
            Municípios
          </h4>
          <p>
            Trata de questões locais, como transporte coletivo urbano, limpeza pública e educação infantil.
          </p>
        </article>
      </div>
      <section aria-labelledby={'powers-title'} className={'powers-panel'}>
        <div className={'powers-intro'}>
          <Icon icon="solar:pen-new-square-bold-duotone" aria-hidden="true"  />
          <div>
            <h4 id={'powers-title'}>
              Três Poderes
            </h4>
            <p>
              Para que tudo funcione com equilíbrio e justiça, o Estado é dividido em três poderes. Cada poder tem uma missão diferente, mas todos trabalham em harmonia para o bem da população.
            </p>
          </div>
        </div>
        <div className={'powers-list'}>
          <article>
            <span>
              E
            </span>
            <div>
              <h5>
                Poder Executivo
              </h5>
              <p>
                Governa e administra.
              </p>
            </div>
          </article>
          <article>
            <span>
              L
            </span>
            <div>
              <h5>
                Poder Legislativo
              </h5>
              <p>
                Cria as leis e fiscaliza.
              </p>
            </div>
          </article>
          <article>
            <span>
              J
            </span>
            <div>
              <h5>
                Poder Judiciário
              </h5>
              <p>
                Garante que as leis sejam cumpridas.
              </p>
            </div>
          </article>
        </div>
      </section>
    </section>
    <section aria-labelledby={'state-powers-title'} className={'content-section state-powers-section'} id={'poderes-estado'}>
      <header className={'state-powers-heading'}>
        <span className={'section-tag'}>
          Independentes e harmônicos
        </span>
        <h3 id={'state-powers-title'}>
          Poderes do Estado
        </h3>
        <p>
          A Constituição Federal, em seu artigo 2º, estabelece que são Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.
        </p>
      </header>
      <div className={'power-detail-list'}>
        <article className={'power-detail executive-detail'}>
          <div className={'power-detail-icon'}>
            <Icon icon="solar:buildings-3-bold-duotone" aria-hidden="true"  />
          </div>
          <div className={'power-detail-body'}>
            <span className={'power-kicker'}>
              Administração e execução
            </span>
            <h4>
              Poder Executivo
            </h4>
            <p>
              O Poder Executivo administra o Estado. Por meio do Poder Executivo são construídas escolas e hospitais; são cuidadas as estradas; são organizados os serviços de saúde; são pagos os servidores públicos; e são colocados em prática os programas de governo. Na esfera federal, o Poder Executivo é liderado pela Presidência da República; na estadual, pelos governos estaduais; e na municipal, pelas prefeituras.
            </p>
            <aside className={'everyday-example'}>
              <Icon icon="solar:map-point-bold-duotone" aria-hidden="true"  />
              <div>
                <strong>
                  Exemplos do cotidiano
                </strong>
                <ul>
                  <li>
                    Uma escola é reformada.
                  </li>
                  <li>
                    Um hospital recebe novos equipamentos.
                  </li>
                  <li>
                    Uma estrada é asfaltada.
                  </li>
                </ul>
                <p>
                  O Executivo transforma os planos em realidade.
                </p>
              </div>
            </aside>
          </div>
        </article>
        <article className={'power-detail legislative-detail'}>
          <div className={'power-detail-icon'}>
            <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          </div>
          <div className={'power-detail-body'}>
            <span className={'power-kicker'}>
              Leis e fiscalização
            </span>
            <h4>
              Poder Legislativo
            </h4>
            <p>
              O Poder Legislativo cria as leis que organizam a vida da sociedade. Além disso, acompanha e fiscaliza o governo, verifica se o dinheiro público está sendo bem utilizado e se o governo está cumprindo as leis.
            </p>
            <aside className={'everyday-example'}>
              <Icon icon="solar:map-point-bold-duotone" aria-hidden="true"  />
              <div>
                <strong>
                  Exemplos do cotidiano
                </strong>
                <ul>
                  <li>
                    Uma lei é criada para melhorar a educação.
                  </li>
                  <li>
                    Os gastos do governo são analisados.
                  </li>
                </ul>
                <p>
                  O Legislativo representa a população e ajuda a garantir que tudo seja feito corretamente.
                </p>
              </div>
            </aside>
          </div>
        </article>
        <article className={'power-detail judiciary-detail'}>
          <div className={'power-detail-icon'}>
            <Icon icon="solar:scale-bold-duotone" aria-hidden="true"  />
          </div>
          <div className={'power-detail-body'}>
            <span className={'power-kicker'}>
              Direitos e justiça
            </span>
            <h4>
              Poder Judiciário
            </h4>
            <p>
              O Poder Judiciário resolve conflitos, garante que as leis sejam cumpridas, protege os direitos das pessoas e decide quando alguém age de forma errada.
            </p>
            <aside className={'everyday-example'}>
              <Icon icon="solar:map-point-bold-duotone" aria-hidden="true"  />
              <div>
                <strong>
                  Exemplos do cotidiano
                </strong>
                <ul>
                  <li>
                    Uma pessoa busca seus direitos na Justiça.
                  </li>
                  <li>
                    Crimes são julgados.
                  </li>
                </ul>
                <p>
                  O Judiciário existe para manter a ordem e a justiça na sociedade.
                </p>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </section>
    <section aria-labelledby={'resource-title'} className={'content-section public-resource-section'} id={'recurso-publico'}>
      <header className={'resource-heading'}>
        <span className={'section-tag'}>
          Do plano à política pública
        </span>
        <h3 id={'resource-title'}>
          O Recurso Público
        </h3>
        <p>
          Para que o Poder Executivo coloque em prática os programas do governo, o Estado precisa de dinheiro: o chamado recurso público.
        </p>
      </header>
      <article aria-labelledby={'planning-title'} className={'planning-panel'}>
        <div className={'planning-visual'}>
          <Icon icon="solar:map-point-wave-bold-duotone" aria-hidden="true"  />
        </div>
        <div>
          <h4 id={'planning-title'}>
            Planejamento
          </h4>
          <p>
            Para que o recurso seja liberado e transformado efetivamente em ações para a sociedade, é necessário planejar: definir o que se pretende realizar e quanto será necessário para isso.
          </p>
        </div>
      </article>
      <div aria-label={'Fluxo de autorização do recurso público'} className={'resource-flow'}>
        <article>
          <span>
            1
          </span>
          <Icon icon="solar:pen-new-square-bold-duotone" aria-hidden="true"  />
          <h4>
            Plano
          </h4>
          <p>
            O governo organiza a necessidade e define a ação pública.
          </p>
        </article>
        <Icon icon="fa6-solid:arrow-right" aria-hidden="true"  />
        <article>
          <span>
            2
          </span>
          <Icon icon="fa6-solid:file-circle-plus" aria-hidden="true"  />
          <h4>
            Projeto de lei
          </h4>
          <p>
            O plano é convertido em uma proposta e enviado ao Poder Legislativo.
          </p>
        </article>
        <Icon icon="fa6-solid:arrow-right" aria-hidden="true"  />
        <article>
          <span>
            3
          </span>
          <Icon icon="fa6-solid:circle-check" aria-hidden="true"  />
          <h4>
            Autorização
          </h4>
          <p>
            Após a aprovação, o recurso é autorizado e a política pública pode sair do papel.
          </p>
        </article>
      </div>
      <article aria-labelledby={'pte-title'} className={'pte-case'}>
        <div className={'pte-badge'}>
          <Icon icon="fa6-solid:bus" aria-hidden="true"  />
          <span>
            Exemplo real
          </span>
        </div>
        <div className={'pte-copy'}>
          <h4 id={'pte-title'}>
            Programa Estadual de Transporte Escolar — PTE/MG
          </h4>
          <p>
            Por meio do PTE/MG, a Secretaria de Estado de Educação repassa recursos aos municípios para garantir o transporte de estudantes da rede estadual que moram na zona rural.
          </p>
          <p>
            Embora o programa exista desde 2015, os recursos continuam sendo analisados e aprovados a cada ano pela Assembleia Legislativa. Esse processo permite que o serviço continue funcionando e atendendo quem precisa.
          </p>
        </div>
        <div className={'pte-investment'}>
          <small>
            Investimento em 2025
          </small>
          <strong>
            R$ 980,32 milhões
          </strong>
        </div>
      </article>
    </section>
    <section aria-labelledby={'budget-cycle-title'} className={'content-section budget-cycle-section'} id={'ciclo-orcamentario'}>
      <header className={'budget-cycle-heading'}>
        <span className={'section-tag'}>
          Planejar, aprovar, executar e controlar
        </span>
        <h3 id={'budget-cycle-title'}>
          O Ciclo Orçamentário
        </h3>
        <p>
          O orçamento público percorre quatro etapas conectadas. Cada etapa transforma prioridades governamentais em serviços, obras e políticas públicas acompanhadas pela sociedade.
        </p>
      </header>
      <aside aria-labelledby={'pmdi-title'} className={'pmdi-note'}>
        <Icon icon="solar:map-point-wave-bold-duotone" aria-hidden="true"  />
        <div>
          <h4 id={'pmdi-title'}>
            Planejamento de longo prazo em Minas Gerais
          </h4>
          <p>
            A Constituição mineira prevê o Plano Mineiro de Desenvolvimento Integrado — PMDI. O instrumento define grandes escolhas estratégicas, visão de futuro e prioridades para um horizonte de vários anos.
          </p>
        </div>
      </aside>
      <ol aria-label={'Quatro etapas do ciclo orçamentário'} className={'budget-steps'}>
        <li className={'budget-step planning-step'}>
          <span className={'step-number'}>
            Etapa 01
          </span>
          <div className={'step-icon'}>
            <Icon icon="fa6-solid:calendar-check" aria-hidden="true"  />
          </div>
          <div className={'step-content'}>
            <h4>
              Planejamento e elaboração
            </h4>
            <p>
              O Poder Executivo faz as contas e desenha a proposta. A Constituição Federal de 1988, nos artigos 165 a 169, institui o PPA, a LDO e a LOA.
            </p>
            <div className={'budget-tools'}>
              <article>
                <strong>
                  PPA
                </strong>
                <span>
                  Plano Plurianual
                </span>
                <p>
                  É a visão de médio prazo. O governo planeja o que pretende realizar nos próximos quatro anos.
                </p>
              </article>
              <article>
                <strong>
                  LDO
                </strong>
                <span>
                  Lei de Diretrizes Orçamentárias
                </span>
                <p>
                  Define prioridades e metas para o ano seguinte e orienta a elaboração do orçamento.
                </p>
              </article>
              <article>
                <strong>
                  LOA
                </strong>
                <span>
                  Lei Orçamentária Anual
                </span>
                <p>
                  Detalha quanto será destinado, no ano seguinte, a hospitais, escolas, rodovias e outras ações.
                </p>
              </article>
            </div>
            <small>
              Em Minas Gerais, o PPA corresponde ao PPAG — Plano Plurianual de Ação Governamental.
            </small>
          </div>
        </li>
        <li className={'budget-step approval-step'}>
          <span className={'step-number'}>
            Etapa 02
          </span>
          <div className={'step-icon'}>
            <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          </div>
          <div className={'step-content'}>
            <h4>
              Análise, debate e aprovação
            </h4>
            <p>
              O governo não aprova o próprio plano. A proposta é enviada ao Poder Legislativo — em Minas Gerais, à Assembleia Legislativa de Minas Gerais. Representantes eleitos analisam, debatem, sugerem mudanças, chamadas emendas, e votam o projeto de lei.
            </p>
          </div>
        </li>
        <li className={'budget-step execution-step'}>
          <span className={'step-number'}>
            Etapa 03
          </span>
          <div className={'step-icon'}>
            <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
          </div>
          <div className={'step-content'}>
            <h4>
              Execução: o planejamento sai do papel
            </h4>
            <p>
              Após a aprovação da lei e o início do novo ano, começa a execução. O governo arrecada impostos, como IPVA e ICMS, paga contas e servidores, compra medicamentos e realiza obras, seguindo o que foi autorizado na LOA.
            </p>
          </div>
        </li>
        <li className={'budget-step control-step compact-budget-step'}>
          <span className={'step-number'}>
            Etapa 04
          </span>
          <div className={'step-icon'}>
            <Icon icon="solar:chart-2-bold-duotone" aria-hidden="true"  />
          </div>
          <div className={'step-content'}>
            <h4>
              Controle e avaliação
            </h4>
            <p>
              O governo e os órgãos de controle acompanham a execução, verificam riscos, resultados e o uso correto dos recursos.
            </p>
            <p>
              A avaliação baseada em evidências utiliza dados e indicadores para identificar o que funciona e aperfeiçoar as políticas públicas.
            </p>
            <div className={'evaluation-evidence'}>
              <span>
                <Icon icon="fa6-solid:database" aria-hidden="true"  />
                Dados
              </span>
              <span>
                <Icon icon="solar:chart-2-bold-duotone" aria-hidden="true"  />
                Indicadores
              </span>
              <span>
                <Icon icon="solar:chart-2-bold-duotone" aria-hidden="true"  />
                Resultados
              </span>
            </div>
          </div>
        </li>
        <li className={'budget-step accountability-step compact-budget-step'}>
          <span className={'step-number'}>
            Etapa 05
          </span>
          <div className={'step-icon'}>
            <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          </div>
          <div className={'step-content'}>
            <h4>
              Prestação de contas
            </h4>
            <p>
              A Administração Pública apresenta o que arrecadou, gastou e realizou, permitindo a fiscalização da gestão.
            </p>
            <p>
              Essas informações são organizadas em
              <strong>
                relatórios e demonstrativos
              </strong>
              , como veremos no próximo capítulo.
            </p>
            <p className={'next-chapter-note'}>
              <strong>
                Esses relatórios e demonstrativos serão apresentados no próximo capítulo.
              </strong>
            </p>
          </div>
        </li>
      </ol>
    </section>
    </>
  );
}
