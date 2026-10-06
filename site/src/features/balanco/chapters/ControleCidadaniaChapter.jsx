import { Icon } from '@iconify/react';
export default function ControleCidadaniaChapter() {
  return (
    <>
    <section aria-labelledby={'control-title'} className={'content-section control-accountability-section'} id={'controle-accountability'}>
      <header className={'control-heading'}>
        <span className={'section-tag'}>
          Quem controla a Administração Pública?
        </span>
        <h3 id={'control-title'}>
          Controle interno e controle externo
        </h3>
        <p>
          Os mecanismos de controle atuam de forma complementar para prevenir falhas, avaliar resultados e proteger o patrimônio público.
        </p>
      </header>
      <div className={'control-compare'}>
        <article className={'control-card internal-control'}>
          <div className={'control-icon'}>
            <Icon icon="fa6-solid:shield-halved" aria-hidden="true"  />
          </div>
          <span className={'control-label'}>
            Dentro da própria estrutura
          </span>
          <h4>
            Controle interno
          </h4>
          <p>
            É realizado pela própria Administração em cada Poder. Acompanha processos, riscos, legalidade, eficiência e resultados para prevenir problemas e apoiar o aperfeiçoamento da gestão.
          </p>
          <ul>
            <li>
              orienta gestores e unidades;
            </li>
            <li>
              realiza auditorias e avaliações;
            </li>
            <li>
              monitora riscos e recomendações;
            </li>
            <li>
              apoia a integridade e a prevenção de irregularidades.
            </li>
          </ul>
        </article>
        <article className={'control-card external-control'}>
          <div className={'control-icon'}>
            <Icon icon="solar:scale-bold-duotone" aria-hidden="true"  />
          </div>
          <span className={'control-label'}>
            Fiscalização institucional independente
          </span>
          <h4>
            Controle externo
          </h4>
          <p>
            É exercido pelo Poder Legislativo com o auxílio dos Tribunais de Contas. Analisa a legalidade, a legitimidade, a economicidade, os resultados e a prestação de contas dos responsáveis por recursos públicos.
          </p>
          <ul>
            <li>
              examina contas e atos de gestão;
            </li>
            <li>
              realiza auditorias e inspeções;
            </li>
            <li>
              emite determinações e recomendações;
            </li>
            <li>
              produz informações para o Legislativo e para a sociedade.
            </li>
          </ul>
        </article>
      </div>
      <aside className={'accountability-note'}>
        <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
        <div>
          <h4>
            Accountability
          </h4>
          <p>
            O termo reúne transparência, prestação de contas, responsabilização e capacidade de resposta. Na prática, significa que agentes públicos devem informar o que fizeram, justificar decisões, demonstrar resultados e responder por falhas ou irregularidades.
          </p>
        </div>
      </aside>
    </section>
    <section aria-labelledby={'rights-title'} className={'content-section rights-section'} id={'direitos-deveres'}>
      <header className={'rights-heading'}>
        <span className={'section-tag'}>
          Responsabilidade compartilhada
        </span>
        <h3 id={'rights-title'}>
          Direitos e deveres
        </h3>
        <p>
          Estado e cidadania possuem responsabilidades complementares para que os serviços públicos funcionem com qualidade, integridade e participação.
        </p>
      </header>
      <div className={'rights-grid'}>
        <article className={'responsibility-card state-responsibility'}>
          <Icon icon="solar:buildings-2-bold-duotone" aria-hidden="true"  />
          <h4>
            Deveres do Estado
          </h4>
          <ul>
            <li>
              prestar serviços públicos e implementar políticas;
            </li>
            <li>
              agir conforme a lei, com impessoalidade, ética, transparência e eficiência;
            </li>
            <li>
              publicar informações compreensíveis e acessíveis;
            </li>
            <li>
              proteger direitos e tratar as pessoas com igualdade;
            </li>
            <li>
              prestar contas e corrigir falhas identificadas.
            </li>
          </ul>
        </article>
        <article className={'responsibility-card citizen-rights'}>
          <Icon icon="fa6-solid:hand-sparkles" aria-hidden="true"  />
          <h4>
            Direitos da pessoa cidadã
          </h4>
          <ul>
            <li>
              acessar informações públicas, ressalvadas as hipóteses legais de sigilo;
            </li>
            <li>
              receber serviços adequados e atendimento respeitoso;
            </li>
            <li>
              participar da formulação e avaliação de políticas;
            </li>
            <li>
              apresentar pedidos, reclamações, sugestões, elogios e denúncias;
            </li>
            <li>
              acompanhar receitas, despesas, contratos e resultados.
            </li>
          </ul>
        </article>
        <article className={'responsibility-card citizen-duties'}>
          <Icon icon="solar:users-group-rounded-bold-duotone" aria-hidden="true"  />
          <h4>
            Deveres da pessoa cidadã
          </h4>
          <ul>
            <li>
              respeitar direitos coletivos e o patrimônio público;
            </li>
            <li>
              cumprir obrigações previstas em lei;
            </li>
            <li>
              usar os canais públicos com responsabilidade e boa-fé;
            </li>
            <li>
              verificar informações antes de compartilhá-las;
            </li>
            <li>
              participar e colaborar com o controle social.
            </li>
          </ul>
        </article>
      </div>
    </section>
    <section aria-labelledby={'social-control-title'} className={'content-section social-control-section'} id={'controle-social'}>
      <header className={'social-control-heading'}>
        <span className={'section-tag'}>
          Informação em ação
        </span>
        <h3 id={'social-control-title'}>
          Ferramentas de controle social
        </h3>
        <p>
          Controle social é a participação da sociedade no acompanhamento das decisões, dos gastos e dos resultados da Administração Pública.
        </p>
      </header>
      <div className={'social-tools-grid'}>
        <article className={'social-tool-card'}>
          <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          <h4>
            Relatórios contábeis e fiscais
          </h4>
          <p>
            Balanços, demonstrativos e relatórios da LRF permitem acompanhar arrecadação, despesas, patrimônio, dívida, limites e resultados.
          </p>
          <span>
            Use para comparar planejamento, execução e resultado.
          </span>
        </article>
        <article className={'social-tool-card'}>
          <Icon icon="solar:eye-bold-duotone" aria-hidden="true"  />
          <h4>
            Lei de Acesso à Informação — LAI
          </h4>
          <p>
            Garante o direito de solicitar informações públicas. A transparência ativa publica dados sem solicitação; a transparência passiva responde aos pedidos do cidadão.
          </p>
          <span>
            Use quando a informação não estiver disponível ou precisar de detalhamento.
          </span>
        </article>
        <article className={'social-tool-card'}>
          <Icon icon="solar:chart-2-bold-duotone" aria-hidden="true"  />
          <h4>
            Portal da Transparência
          </h4>
          <p>
            Reúne consultas sobre receitas, despesas, pessoal, contratos, convênios, planejamento, resultados, gestão fiscal e outros dados públicos.
          </p>
          <span>
            Use para pesquisar, filtrar, comparar e baixar dados.
          </span>
        </article>
        <article className={'social-tool-card'}>
          <Icon icon="solar:chat-round-dots-bold-duotone" aria-hidden="true"  />
          <h4>
            Ouvidoria
          </h4>
          <p>
            Recebe manifestações sobre serviços e condutas públicas, como reclamações, solicitações, sugestões, elogios e denúncias.
          </p>
          <span>
            Use para comunicar experiências, propor melhorias ou informar possíveis irregularidades.
          </span>
        </article>
      </div>
      <div aria-label={'Etapas sugeridas para exercer o controle social'} className={'social-control-flow'}>
        <span>
          <b>
            1
          </b>
          Identifique a questão
        </span>
        <Icon icon="fa6-solid:arrow-right" aria-hidden="true"  />
        <span>
          <b>
            2
          </b>
          Consulte dados públicos
        </span>
        <Icon icon="fa6-solid:arrow-right" aria-hidden="true"  />
        <span>
          <b>
            3
          </b>
          Compare metas e resultados
        </span>
        <Icon icon="fa6-solid:arrow-right" aria-hidden="true"  />
        <span>
          <b>
            4
          </b>
          Use o canal adequado
        </span>
        <Icon icon="fa6-solid:arrow-right" aria-hidden="true"  />
        <span>
          <b>
            5
          </b>
          Acompanhe a resposta
        </span>
      </div>
    </section>
    </>
  );
}
