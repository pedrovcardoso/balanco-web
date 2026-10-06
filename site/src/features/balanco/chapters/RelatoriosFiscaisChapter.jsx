import { Icon } from '@iconify/react';
export default function RelatoriosFiscaisChapter() {
  return (
    <>
    <section aria-labelledby={'balance-title'} className={'content-section balance-section'} id={'balanco-geral'}>
      <header className={'balance-heading'}>
        <span className={'section-tag'}>
          Prestação de contas
        </span>
        <h3 id={'balance-title'}>
          Balanço Geral do Estado
        </h3>
        <p>
          Um dos documentos mais importantes da gestão pública.
        </p>
      </header>
      <div className={'balance-intro'}>
        <div className={'balance-icon'}>
          <Icon icon="fa6-solid:clock" aria-hidden="true"  />
        </div>
        <div>
          <p>
            O Balanço Geral do Estado reúne, de forma organizada:
          </p>
          <ul>
            <li>
              tudo o que o Estado arrecadou;
            </li>
            <li>
              tudo o que foi gasto;
            </li>
            <li>
              onde o dinheiro foi aplicado.
            </li>
          </ul>
        </div>
      </div>
      <div className={'transparency-message'}>
        <Icon icon="solar:eye-bold-duotone" aria-hidden="true"  />
        <div>
          <h4>
            Transparência que se transforma em cidadania
          </h4>
          <p>
            O Balanço mostra se os recursos públicos foram utilizados com responsabilidade e permite que qualquer pessoa acompanhe e fiscalize a gestão.
          </p>
        </div>
      </div>
      <a aria-describedby={'balance-link-note'} className={'balance-access'} href={'https://www.fazenda.mg.gov.br/governo/contadoria_geral/relatorio_contabil/'} rel={'noopener noreferrer'} target={'_blank'}>
        <Icon icon="fa6-solid:link" aria-hidden="true"  />
        <span>
          <strong>
            Acessar o Balanço Geral do Estado de Minas Gerais
          </strong>
          <small id={'balance-link-note'}>
            O endereço será aberto em uma nova guia.
          </small>
        </span>
        <Icon icon="fa6-solid:arrow-up-right-from-square" aria-hidden="true"  />
      </a>
    </section>
    <section aria-labelledby={'revenue-title'} className={'content-section revenue-section'} id={'receitas-despesas'}>
      <header className={'revenue-heading'}>
        <span className={'section-tag'}>
          Você sabia?
        </span>
        <h3 id={'revenue-title'}>
          Arrecadação e despesa
        </h3>
        <p>
          Receitas registram a entrada de recursos. Despesas mostram a aplicação desses recursos na manutenção do Estado e na prestação de serviços públicos.
        </p>
      </header>
      <div className={'money-concepts'}>
        <article className={'money-card income-card'}>
          <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
          <div>
            <span>
              Arrecadação
            </span>
            <p>
              É quando o dinheiro sai da conta do contribuinte — pessoa ou instituição — e entra na conta do governo por meio das receitas. O governo deve declarar e classificar cada centavo recebido.
            </p>
          </div>
        </article>
        <article className={'money-card expense-card'}>
          <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
          <div>
            <span>
              Despesa
            </span>
            <p>
              É a aplicação do dinheiro arrecadado para manter o funcionamento do Estado e a prestação de serviços públicos para a sociedade.
            </p>
          </div>
        </article>
      </div>
      <div aria-label={'Resumo das receitas e despesas de Minas Gerais em 2025'} className={'fiscal-numbers'}>
        <article>
          <span className={'metric-label'}>
            Receitas em 2025
          </span>
          <strong>
            R$ 132,67 bilhões
          </strong>
          <ul>
            <li>
              Impostos e taxas: R$ 73,43 bilhões
            </li>
            <li>
              Transferências correntes: R$ 24,27 bilhões
            </li>
            <li>
              Receita patrimonial: R$ 8,34 bilhões
            </li>
          </ul>
        </article>
        <article>
          <span className={'metric-label'}>
            Despesas em 2025
          </span>
          <strong>
            R$ 131,56 bilhões
          </strong>
          <ul>
            <li>
              Pessoal e encargos sociais: R$ 83,06 bilhões — 69,6%
            </li>
            <li>
              Juros e encargos da dívida: R$ 3,42 bilhões — 2,87%
            </li>
            <li>
              Outras despesas correntes: R$ 32,89 bilhões — 27,6%
            </li>
          </ul>
        </article>
      </div>
      <aside className={'surplus-callout'}>
        <Icon icon="solar:chart-2-bold-duotone" aria-hidden="true"  />
        <div>
          <small>
            Resultado orçamentário de 2025
          </small>
          <strong>
            Superávit de R$ 1,11 bilhão
          </strong>
          <p>
            Minas Gerais arrecadou mais do que gastou.
          </p>
        </div>
      </aside>
    </section>
    <section aria-labelledby={'fiscal-title'} className={'content-section fiscal-concepts-section'} id={'conceitos-fiscais'}>
      <header className={'fiscal-heading'}>
        <span className={'section-tag'}>
          Glossário fiscal
        </span>
        <h3 id={'fiscal-title'}>
          Conceitos importantes
        </h3>
        <p>
          Termos utilizados nos demonstrativos contábeis e nos relatórios previstos pela Lei de Responsabilidade Fiscal.
        </p>
      </header>
      <dl className={'fiscal-glossary'}>
        <div>
          <dt>
            <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
            Despesas obrigatórias
          </dt>
          <dd>
            Despesas que o Estado tem obrigação de pagar, como pessoal, previdência, repasses para municípios e despesas com saúde e educação.
          </dd>
        </div>
        <div>
          <dt>
            <Icon icon="fa6-solid:coins" aria-hidden="true"  />
            Dívida pública
          </dt>
          <dd>
            Valor total das obrigações financeiras — empréstimos, emissão de títulos públicos ou precatórios — assumidas pelo Estado com terceiros para complementar o caixa e realizar políticas públicas.
          </dd>
        </div>
        <div>
          <dt>
            <Icon icon="solar:calendar-bold-duotone" aria-hidden="true"  />
            Restos a pagar
          </dt>
          <dd>
            Despesas empenhadas em um ano, mas não pagas naquele exercício, que ficam registradas para pagamento no ano ou nos anos seguintes.
          </dd>
        </div>
        <div>
          <dt>
            <Icon icon="fa6-solid:calculator" aria-hidden="true"  />
            Receita Corrente Líquida — RCL
          </dt>
          <dd>
            Valor restante das receitas arrecadadas após a aplicação das deduções referentes a receitas com vinculações específicas.
          </dd>
          <p>
            A RCL é utilizada como base para calcular limites previstos na Lei de Responsabilidade Fiscal, como despesas com pessoal e dívida consolidada líquida.
          </p>
        </div>
      </dl>
    </section>
    <section aria-labelledby={'rgf-title'} className={'content-section rgf-section'} id={'rgf'}>
      <header className={'rgf-heading'}>
        <span className={'section-tag'}>
          Lei de Responsabilidade Fiscal
        </span>
        <h3 id={'rgf-title'}>
          Relatório de Gestão Fiscal
        </h3>
        <p>
          O RGF permite verificar se o governo utiliza os recursos públicos dentro dos limites e das regras fiscais.
        </p>
      </header>
      <div className={'rgf-overview'}>
        <div className={'rgf-law'}>
          <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          <div>
            <h4>
              Obrigatório pela LRF
            </h4>
            <p>
              A elaboração e a divulgação do Relatório de Gestão Fiscal são exigidas pela Lei Complementar nº 101/2000 — Lei de Responsabilidade Fiscal.
            </p>
          </div>
        </div>
        <p>
          O relatório apresenta a situação fiscal da Administração Pública e demonstra se os limites legais relacionados a despesas com pessoal, dívida pública, operações de crédito, concessão de garantias e disponibilidade de caixa ao final do exercício estão sendo cumpridos.
        </p>
      </div>
      <div aria-label={'Aspectos acompanhados pelo Relatório de Gestão Fiscal'} className={'rgf-checks'}>
        <article>
          <Icon icon="solar:users-group-rounded-bold-duotone" aria-hidden="true"  />
          <span>
            Despesa com pessoal
          </span>
        </article>
        <article>
          <Icon icon="fa6-solid:coins" aria-hidden="true"  />
          <span>
            Dívida pública
          </span>
        </article>
        <article>
          <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
          <span>
            Operações de crédito
          </span>
        </article>
        <article>
          <Icon icon="fa6-solid:shield-halved" aria-hidden="true"  />
          <span>
            Garantias concedidas
          </span>
        </article>
        <article>
          <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
          <span>
            Disponibilidade de caixa
          </span>
        </article>
      </div>
      <aside className={'rgf-citizenship'}>
        <Icon icon="solar:eye-bold-duotone" aria-hidden="true"  />
        <p>
          O RGF permite que a sociedade acompanhe se o governo administra os recursos com transparência, responsabilidade e respeito às regras previstas em lei.
        </p>
      </aside>
      <a aria-describedby={'rgf-link-note'} className={'rgf-access'} href={'https://www.fazenda.mg.gov.br/governo/contadoria_geral/gestaofiscal/2025/3quadrimestre2025.pdf'} rel={'noopener noreferrer'} target={'_blank'}>
        <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
        <span>
          <strong>
            Acessar o Relatório de Gestão Fiscal de 2025
          </strong>
          <small id={'rgf-link-note'}>
            Arquivo PDF aberto em uma nova guia.
          </small>
        </span>
        <Icon icon="fa6-solid:arrow-up-right-from-square" aria-hidden="true"  />
      </a>
    </section>
    <section aria-labelledby={'rgf-personnel-title'} className={'content-section rgf-concepts-section'} id={'rgf-pessoal'}>
      <header className={'rgf-concepts-heading'}>
        <span className={'section-tag'}>
          RGF — Conceitos
        </span>
        <h3 id={'rgf-personnel-title'}>
          Despesa com pessoal
        </h3>
        <p>
          Três medidas ajudam a verificar o comprometimento das receitas com servidores, aposentadorias, pensões e encargos.
        </p>
      </header>
      <div className={'formula-cards'}>
        <article className={'formula-card gross-card'}>
          <div className={'formula-icon'}>
            <Icon icon="solar:users-group-rounded-bold-duotone" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            DB
          </span>
          <h4>
            Despesa Bruta com Pessoal
          </h4>
          <p>
            Total gasto com servidores ativos, aposentadorias, pensões, gratificações e encargos previdenciários.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Existe limite legal para esse gasto. Quando o limite é ultrapassado, aplicam-se restrições.
            </p>
          </aside>
        </article>
        <article className={'formula-card excluded-card'}>
          <div className={'formula-icon'}>
            <Icon icon="fa6-solid:filter" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            DNC
          </span>
          <h4>
            Despesas Não Computadas
          </h4>
          <p>
            Gastos com pessoal que não entram no cálculo do limite da LRF, como indenizações, decisões judiciais específicas e programas de desligamento incentivado.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              As despesas existem, mas não são consideradas para verificar o limite legal.
            </p>
          </aside>
        </article>
        <article className={'formula-card net-card'}>
          <div className={'formula-icon'}>
            <Icon icon="fa6-solid:calculator" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            DL
          </span>
          <h4>
            Despesa Líquida com Pessoal
          </h4>
          <p>
            É a despesa bruta com pessoal menos as despesas não computadas.
          </p>
          <div aria-label={'Despesa líquida igual a despesa bruta menos despesas não computadas'} className={'formula'}>
            DL = DB − DNC
          </div>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Esse valor é comparado com a Receita Corrente Líquida para verificar o cumprimento do limite legal.
            </p>
          </aside>
        </article>
      </div>
    </section>
    <section aria-labelledby={'rgf-debt-title'} className={'content-section rgf-concepts-section debt-section'} id={'rgf-divida'}>
      <header className={'rgf-concepts-heading'}>
        <span className={'section-tag'}>
          RGF — Conceitos
        </span>
        <h3 id={'rgf-debt-title'}>
          Dívida consolidada
        </h3>
        <p>
          Os indicadores de dívida mostram as obrigações de longo prazo e os recursos disponíveis para reduzi-las.
        </p>
      </header>
      <div className={'formula-cards'}>
        <article className={'formula-card consolidated-card'}>
          <div className={'formula-icon'}>
            <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            DC
          </span>
          <h4>
            Dívida Consolidada
          </h4>
          <p>
            Total das dívidas de longo prazo, acima de 12 meses. Inclui empréstimos, financiamentos, parcelamentos previdenciários e precatórios parcelados.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Mostra o tamanho do estoque da dívida governamental.
            </p>
          </aside>
        </article>
        <article className={'formula-card deductions-card'}>
          <div className={'formula-icon'}>
            <Icon icon="fa6-solid:vault" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            D
          </span>
          <h4>
            Deduções
          </h4>
          <p>
            Valor que o Estado possui em caixa ou em aplicações financeiras e que pode ser considerado para pagar suas obrigações.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Ajuda a calcular quanto o governo efetivamente deve, considerando os recursos disponíveis.
            </p>
          </aside>
        </article>
        <article className={'formula-card liquid-debt-card'}>
          <div className={'formula-icon'}>
            <Icon icon="solar:chart-2-bold-duotone" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            DCL
          </span>
          <h4>
            Dívida Consolidada Líquida
          </h4>
          <p>
            É a dívida consolidada menos as deduções permitidas.
          </p>
          <div aria-label={'Dívida consolidada líquida igual a dívida consolidada menos deduções'} className={'formula'}>
            DCL = DC − D
          </div>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              É o principal indicador utilizado para avaliar o nível de endividamento de estados e municípios.
            </p>
          </aside>
        </article>
      </div>
    </section>
    <section aria-labelledby={'rgf-guarantees-title'} className={'content-section rgf-concepts-section guarantees-section'} id={'rgf-garantias'}>
      <header className={'rgf-concepts-heading'}>
        <span className={'section-tag'}>
          RGF — Conceitos
        </span>
        <h3 id={'rgf-guarantees-title'}>
          Garantias e operações de crédito
        </h3>
        <p>
          Esses indicadores mostram compromissos assumidos pelo governo, mecanismos de proteção e recursos obtidos por financiamento.
        </p>
      </header>
      <div className={'formula-cards'}>
        <article className={'formula-card guarantees-card'}>
          <div className={'formula-icon'}>
            <Icon icon="fa6-solid:shield" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            GC
          </span>
          <h4>
            Garantias Concedidas
          </h4>
          <p>
            Ocorrem quando o governo assume o compromisso de pagar uma dívida caso outra entidade não cumpra a obrigação.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              A concessão de garantia representa risco potencial para as contas públicas.
            </p>
          </aside>
        </article>
        <article className={'formula-card counter-card'}>
          <div className={'formula-icon'}>
            <Icon icon="fa6-solid:shield-halved" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            CR
          </span>
          <h4>
            Contragarantias Recebidas
          </h4>
          <p>
            São garantias exigidas pelo governo para proteção caso seja necessário pagar a dívida garantida.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Reduzem o risco de prejuízo aos cofres públicos.
            </p>
          </aside>
        </article>
        <article className={'formula-card credit-card'}>
          <div className={'formula-icon'}>
            <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            OC
          </span>
          <h4>
            Operações de Crédito
          </h4>
          <p>
            São empréstimos ou financiamentos contratados pelo governo.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              O recurso entra no presente, mas deverá ser pago futuramente.
            </p>
          </aside>
        </article>
      </div>
    </section>
    <section aria-labelledby={'rgf-cash-title'} className={'content-section rgf-concepts-section cash-section'} id={'rgf-caixa'}>
      <header className={'rgf-concepts-heading'}>
        <span className={'section-tag'}>
          RGF — Conceitos
        </span>
        <h3 id={'rgf-cash-title'}>
          Disponibilidade de caixa
        </h3>
        <p>
          O indicador compara os recursos disponíveis no fim do exercício com as obrigações que ainda precisam ser pagas.
        </p>
      </header>
      <div className={'formula-cards cash-formula-cards'}>
        <article className={'formula-card gross-cash-card'}>
          <div className={'formula-icon'}>
            <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            DCB
          </span>
          <h4>
            Disponibilidade de Caixa Bruta
          </h4>
          <p>
            Total de dinheiro disponível em caixa e em contas bancárias no encerramento do ano.
          </p>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Mostra quanto o governo possui disponível.
            </p>
          </aside>
        </article>
        <article className={'formula-card payable-card'}>
          <div className={'formula-icon'}>
            <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            OP
          </span>
          <h4>
            Obrigações a Pagar
          </h4>
          <p>
            Despesas empenhadas ou contratadas que não foram pagas até o fim do ano e outros valores que deveriam ter sido pagos no exercício.
          </p>
          <div className={'cash-types'}>
            <strong>
              Tipos
            </strong>
            <ul>
              <li>
                Restos a pagar processados: o serviço ou bem já foi entregue.
              </li>
              <li>
                Restos a pagar não processados: a entrega ainda ocorrerá.
              </li>
            </ul>
          </div>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Mostra quanto ficou pendente para pagamento no ano seguinte.
            </p>
          </aside>
        </article>
        <article className={'formula-card liquid-cash-card'}>
          <div className={'formula-icon'}>
            <Icon icon="fa6-solid:calculator" aria-hidden="true"  />
          </div>
          <span className={'formula-code'}>
            DCL
          </span>
          <h4>
            Disponibilidade de Caixa Líquida
          </h4>
          <p>
            É o dinheiro disponível após descontar as obrigações a pagar.
          </p>
          <div aria-label={'Disponibilidade de caixa líquida igual a disponibilidade de caixa bruta menos obrigações a pagar'} className={'formula'}>
            DCL = DCB − OP
          </div>
          <div className={'cash-warning'}>
            <Icon icon="fa6-solid:triangle-exclamation" aria-hidden="true"  />
            <p>
              <strong>
                Atenção:
              </strong>
              quando o resultado é negativo, existem mais contas pendentes do que recursos disponíveis.
            </p>
          </div>
          <aside>
            <strong>
              Por que importa?
            </strong>
            <p>
              Mostra se o governo deixou dinheiro suficiente para quitar as obrigações já assumidas.
            </p>
          </aside>
        </article>
      </div>
    </section>
    <section aria-labelledby={'function-expenses-title'} className={'content-section function-expenses-section'} id={'despesas-funcao'}>
      <header className={'function-heading'}>
        <span className={'section-tag'}>
          Destino do recurso público
        </span>
        <h3 id={'function-expenses-title'}>
          Execução das Despesas por Função
        </h3>
        <p>
          A classificação por função e subfunção mostra em qual área pública o recurso foi aplicado, independentemente do órgão que realizou o gasto.
        </p>
      </header>
      <article className={'function-explanation'}>
        <Icon icon="solar:map-point-wave-bold-duotone" aria-hidden="true"  />
        <div>
          <h4>
            O foco está na finalidade
          </h4>
          <p>
            Imagine que o governo compre uma frota de ambulâncias por meio de um órgão de infraestrutura. Como as ambulâncias atendem diretamente à saúde, a despesa recebe a classificação de
            <strong>
              Função Saúde
            </strong>
            .
          </p>
          <p>
            Essa organização permite verificar quanto foi efetivamente investido em cada área, sem depender de qual órgão executou a política pública.
          </p>
        </div>
      </article>
      <div aria-label={'Principais despesas por função em Minas Gerais em 2025'} className={'function-values'}>
        <article>
          <Icon icon="fa6-solid:graduation-cap" aria-hidden="true"  />
          <span>
            Educação
          </span>
          <strong>
            R$ 21,301 bilhões
          </strong>
        </article>
        <article>
          <Icon icon="fa6-solid:heart-pulse" aria-hidden="true"  />
          <span>
            Saúde
          </span>
          <strong>
            R$ 18,340 bilhões
          </strong>
        </article>
        <article>
          <Icon icon="fa6-solid:user-shield" aria-hidden="true"  />
          <span>
            Segurança Pública
          </span>
          <strong>
            R$ 25,378 bilhões
          </strong>
        </article>
        <article>
          <Icon icon="solar:users-group-rounded-bold-duotone" aria-hidden="true"  />
          <span>
            Previdência Social
          </span>
          <strong>
            R$ 25,818 bilhões
          </strong>
        </article>
        <article>
          <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
          <span>
            Encargos Especiais
          </span>
          <strong>
            R$ 8,479 bilhões
          </strong>
        </article>
        <article>
          <Icon icon="fa6-solid:flask" aria-hidden="true"  />
          <span>
            Ciência e Tecnologia
          </span>
          <strong>
            R$ 615,85 milhões
          </strong>
        </article>
        <article>
          <Icon icon="fa6-solid:bus" aria-hidden="true"  />
          <span>
            Transporte
          </span>
          <strong>
            R$ 1,728 bilhão
          </strong>
        </article>
        <article>
          <Icon icon="solar:pallete-2-bold-duotone" aria-hidden="true"  />
          <span>
            Cultura
          </span>
          <strong>
            R$ 381,15 milhões
          </strong>
        </article>
        <article>
          <Icon icon="fa6-solid:droplet" aria-hidden="true"  />
          <span>
            Saneamento
          </span>
          <strong>
            R$ 81,008 milhões
          </strong>
        </article>
      </div>
    </section>
    <section aria-labelledby={'constitutional-title'} className={'content-section constitutional-section'} id={'indices-constitucionais'}>
      <header className={'constitutional-heading'}>
        <span className={'section-tag'}>
          Investimentos mínimos obrigatórios
        </span>
        <h3 id={'constitutional-title'}>
          Índices Constitucionais
        </h3>
        <p>
          As constituições Federal e Estadual estabelecem aplicações mínimas para proteger áreas prioritárias e garantir a continuidade dos serviços públicos.
        </p>
      </header>
      <div className={'constitutional-copy'}>
        <p>
          O governo não pode concentrar todos os recursos em apenas uma área. Os índices constitucionais funcionam como obrigações legais de investimento mínimo.
        </p>
        <p>
          Cada índice possui critérios próprios de cálculo e define quais despesas podem ser aceitas. Isso evita, por exemplo, que uma despesa de propaganda seja classificada como investimento em saúde ou educação.
        </p>
      </div>
      <ol className={'constitutional-index-list'}>
        <li>
          <Icon icon="fa6-solid:heart-pulse" aria-hidden="true"  />
          <span>
            Ações e Serviços Públicos de Saúde
          </span>
        </li>
        <li>
          <Icon icon="fa6-solid:graduation-cap" aria-hidden="true"  />
          <span>
            Manutenção e Desenvolvimento do Ensino
          </span>
        </li>
        <li>
          <Icon icon="fa6-solid:graduation-cap" aria-hidden="true"  />
          <span>
            Valorização de Profissionais da Educação
          </span>
        </li>
        <li>
          <Icon icon="fa6-solid:flask" aria-hidden="true"  />
          <span>
            Pesquisa e Tecnologia
          </span>
        </li>
      </ol>
    </section>
    <section aria-labelledby={'social-index-title'} className={'content-section social-index-section'} id={'saude-educacao'}>
      <header className={'social-index-heading'}>
        <span className={'section-tag'}>
          Aplicação em 2025
        </span>
        <h3 id={'social-index-title'}>
          Saúde e educação
        </h3>
        <p>
          Dois índices mostram como os recursos vinculados sustentam serviços essenciais para a população.
        </p>
      </header>
      <div className={'social-index-grid'}>
        <article className={'social-index-card health-index'}>
          <div className={'social-index-icon'}>
            <Icon icon="fa6-solid:heart-pulse" aria-hidden="true"  />
          </div>
          <span className={'index-code'}>
            ASPS
          </span>
          <h4>
            Índice da Saúde
          </h4>
          <p className={'index-name'}>
            Ações e Serviços Públicos de Saúde
          </p>
          <p>
            Garante que parte relevante dos impostos seja aplicada no cuidado, no bem-estar e na assistência à população, incluindo hospitais, medicamentos e profissionais.
          </p>
          <dl>
            <div>
              <dt>
                Base legal
              </dt>
              <dd>
                Artigo 198 da Constituição Federal e Lei Complementar nº 141/2012.
              </dd>
            </div>
            <div>
              <dt>
                Aplicação mínima
              </dt>
              <dd>
                12% das receitas de impostos e transferências.
              </dd>
            </div>
          </dl>
          <div className={'index-result'}>
            <small>
              Aplicado em 2025
            </small>
            <strong>
              R$ 11,52 bilhões
            </strong>
            <span>
              12,3% da arrecadação de impostos e transferências
            </span>
          </div>
        </article>
        <article className={'social-index-card education-index'}>
          <div className={'social-index-icon'}>
            <Icon icon="fa6-solid:graduation-cap" aria-hidden="true"  />
          </div>
          <span className={'index-code'}>
            MDE
          </span>
          <h4>
            Índice da Educação
          </h4>
          <p className={'index-name'}>
            Manutenção e Desenvolvimento do Ensino
          </p>
          <p>
            Garante recursos para o funcionamento das escolas, desde materiais didáticos até a infraestrutura das salas de aula, com critérios definidos para a aplicação na educação.
          </p>
          <dl>
            <div>
              <dt>
                Base legal
              </dt>
              <dd>
                Artigo 212 da Constituição Federal e Lei nº 9.394/1996 — LDB.
              </dd>
            </div>
            <div>
              <dt>
                Aplicação mínima
              </dt>
              <dd>
                25% das receitas de impostos e transferências.
              </dd>
            </div>
          </dl>
          <div className={'index-result'}>
            <small>
              Aplicado em 2025
            </small>
            <strong>
              R$ 23,93 bilhões
            </strong>
            <span>
              25,5% da arrecadação de impostos e transferências
            </span>
          </div>
        </article>
      </div>
    </section>
    <section aria-labelledby={'fundeb-research-title'} className={'content-section social-index-section'} id={'fundeb-pesquisa'}>
      <header className={'social-index-heading'}>
        <span className={'section-tag'}>
          Aplicação em 2025
        </span>
        <h3 id={'fundeb-research-title'}>
          Educação, pesquisa e inovação
        </h3>
        <p>
          Os índices protegem recursos destinados à valorização profissional, à ciência, à tecnologia e à inovação em Minas Gerais.
        </p>
      </header>
      <div className={'social-index-grid'}>
        <article className={'social-index-card fundeb-index'}>
          <div className={'social-index-icon'}>
            <Icon icon="fa6-solid:graduation-cap" aria-hidden="true"  />
          </div>
          <span className={'index-code'}>
            FUNDEB
          </span>
          <h4>
            Valorização dos Profissionais da Educação
          </h4>
          <p className={'index-name'}>
            Fundo de Manutenção e Desenvolvimento da Educação Básica
          </p>
          <p>
            Garante que a maior parte dos recursos do principal fundo da educação básica seja utilizada para remunerar profissionais que atuam diretamente no ensino.
          </p>
          <dl>
            <div>
              <dt>
                Base legal
              </dt>
              <dd>
                Artigo 212-A, inciso XI, da Constituição Federal e Lei nº 14.113/2020 — Novo FUNDEB.
              </dd>
            </div>
            <div>
              <dt>
                Aplicação mínima
              </dt>
              <dd>
                70% dos recursos recebidos do FUNDEB.
              </dd>
            </div>
          </dl>
          <div className={'index-result'}>
            <small>
              Aplicado em 2025
            </small>
            <strong>
              R$ 12,57 bilhões
            </strong>
            <span>
              97,5% dos recursos recebidos do FUNDEB
            </span>
          </div>
        </article>
        <article className={'social-index-card research-index'}>
          <div className={'social-index-icon'}>
            <Icon icon="fa6-solid:flask" aria-hidden="true"  />
          </div>
          <span className={'index-code'}>
            FAPEMIG
          </span>
          <h4>
            Pesquisa e Inovação
          </h4>
          <p className={'index-name'}>
            Fundação de Amparo à Pesquisa do Estado de Minas Gerais
          </p>
          <p>
            Índice específico de Minas Gerais que garante recursos para ciência, tecnologia, inovação e projetos de pesquisa realizados no Estado.
          </p>
          <dl>
            <div>
              <dt>
                Base legal
              </dt>
              <dd>
                Artigo 212 da Constituição do Estado de Minas Gerais e Decreto nº 47.937/2020.
              </dd>
            </div>
            <div>
              <dt>
                Aplicação mínima
              </dt>
              <dd>
                1% da Receita Corrente Ordinária do Estado.
              </dd>
            </div>
          </dl>
          <div className={'index-result'}>
            <small>
              Repassado em 2025
            </small>
            <strong>
              R$ 573,67 milhões
            </strong>
            <span>
              100,56% do valor mínimo destinado à pesquisa
            </span>
          </div>
        </article>
      </div>
    </section>
    <section aria-labelledby={'dashboard-title'} className={'content-section indicators-dashboard-section'} id={'painel-indicadores'}>
      <header className={'dashboard-heading'}>
        <span className={'section-tag'}>
          Para ficar de olho
        </span>
        <h3 id={'dashboard-title'}>
          Painel de indicadores
        </h3>
        <p>
          Resumo dos principais resultados orçamentários, fiscais e constitucionais apresentados neste capítulo.
        </p>
      </header>
      <div aria-label={'Legenda de situação dos indicadores'} className={'status-legend'}>
        <span className={'status-ok'}>
          <Icon icon="fa6-solid:circle-check" aria-hidden="true"  />
          Dentro do limite legal
        </span>
        <span className={'status-warning'}>
          <Icon icon="fa6-solid:circle-exclamation" aria-hidden="true"  />
          No limite prudencial
        </span>
        <span className={'status-danger'}>
          <Icon icon="fa6-solid:circle-xmark" aria-hidden="true"  />
          Fora do limite legal
        </span>
      </div>
      <div className={'dashboard-grid'}>
        <div className={'dashboard-column'}>
          <article className={'dashboard-card compact-metric'}>
            <Icon icon="solar:wallet-money-bold-duotone" aria-hidden="true"  />
            <span>
              Receita Corrente Líquida
            </span>
            <strong>
              R$ 111,74 bilhões
            </strong>
          </article>
          <article className={'dashboard-card cash-summary'}>
            <h4>
              Disponibilidade de caixa
            </h4>
            <dl>
              <div>
                <dt>
                  Caixa bruta
                </dt>
                <dd>
                  R$ 21,13 bi
                </dd>
              </div>
              <div>
                <dt>
                  Obrigações financeiras e restos a pagar não processados
                </dt>
                <dd>
                  R$ 15,81 bi
                </dd>
              </div>
              <div>
                <dt>
                  Caixa líquida
                </dt>
                <dd>
                  R$ 5,32 bi
                </dd>
              </div>
            </dl>
          </article>
          <article className={'dashboard-card indicator-summary'}>
            <Icon icon="solar:users-group-rounded-bold-duotone" aria-hidden="true"  />
            <div>
              <span>
                Gastos com pessoal
              </span>
              <strong>
                R$ 53,87 bi
              </strong>
              <small>
                48,22% da RCL
              </small>
            </div>
            <span className={'indicator-status prudent'}>
              <span className={'sr-only'}>
                Situação: no limite prudencial
              </span>
              <Icon icon="fa6-solid:circle-exclamation" aria-hidden="true"  />
            </span>
          </article>
          <article className={'dashboard-card budget-chart-card'}>
            <h4>
              Balanço orçamentário
            </h4>
            <div aria-label={'Receitas realizadas de 132,67 bilhões de reais; despesas realizadas de 131,56 bilhões; superávit orçamentário de 1,11 bilhão.'} className={'accessible-bars'} role={'img'}>
              <div>
                <span>
                  Receitas
                </span>
                <i style={{ '--bar': '100%' }}></i>
                <strong>
                  132,67
                </strong>
              </div>
              <div>
                <span>
                  Despesas
                </span>
                <i style={{ '--bar': '99.16%' }}></i>
                <strong>
                  131,56
                </strong>
              </div>
              <div className={'surplus-bar'}>
                <span>
                  Superávit
                </span>
                <i style={{ '--bar': '8%' }}></i>
                <strong>
                  1,11
                </strong>
              </div>
            </div>
            <small>
              Valores em bilhões de reais
            </small>
          </article>
        </div>
        <div className={'dashboard-column'}>
          <article className={'dashboard-card compact-metric'}>
            <Icon icon="solar:document-text-bold-duotone" aria-hidden="true"  />
            <span>
              Restos a Pagar
            </span>
            <strong>
              R$ 16,55 bilhões
            </strong>
          </article>
          <article className={'dashboard-card indicator-summary'}>
            <Icon icon="fa6-solid:coins" aria-hidden="true"  />
            <div>
              <span>
                Dívida Consolidada Líquida
              </span>
              <strong>
                R$ 187,10 bi
              </strong>
              <small>
                167,46% da RCL
              </small>
            </div>
            <span className={'indicator-status ok'}>
              <span className={'sr-only'}>
                Situação: dentro do limite legal
              </span>
              <Icon icon="fa6-solid:circle-check" aria-hidden="true"  />
            </span>
          </article>
          <article className={'dashboard-card social-results'}>
            <h4>
              Índices constitucionais
            </h4>
            <div>
              <Icon icon="fa6-solid:graduation-cap" aria-hidden="true"  />
              <span>
                Manutenção e Desenvolvimento do Ensino
                <small>
                  R$ 23,93 bi · 25,5%
                </small>
              </span>
              <b className={'status-ok'}>
                <span className={'sr-only'}>
                  Dentro do limite legal
                </span>
                <Icon icon="fa6-solid:circle-check" aria-hidden="true"  />
              </b>
            </div>
            <div>
              <Icon icon="fa6-solid:graduation-cap" aria-hidden="true"  />
              <span>
                Profissionais da Educação Básica
                <small>
                  R$ 12,57 bi · 97,5%
                </small>
              </span>
              <b className={'status-ok'}>
                <span className={'sr-only'}>
                  Dentro do limite legal
                </span>
                <Icon icon="fa6-solid:circle-check" aria-hidden="true"  />
              </b>
            </div>
            <div>
              <Icon icon="fa6-solid:heart-pulse" aria-hidden="true"  />
              <span>
                Ações e Serviços Públicos de Saúde
                <small>
                  R$ 11,52 bi · 12,3%
                </small>
              </span>
              <b className={'status-ok'}>
                <span className={'sr-only'}>
                  Dentro do limite legal
                </span>
                <Icon icon="fa6-solid:circle-check" aria-hidden="true"  />
              </b>
            </div>
            <div>
              <Icon icon="fa6-solid:flask" aria-hidden="true"  />
              <span>
                Pesquisa e Inovação
                <small>
                  R$ 573,67 mi · 100,56%
                </small>
              </span>
              <b className={'status-ok'}>
                <span className={'sr-only'}>
                  Dentro do limite legal
                </span>
                <Icon icon="fa6-solid:circle-check" aria-hidden="true"  />
              </b>
            </div>
          </article>
        </div>
      </div>
    </section>
    </>
  );
}
