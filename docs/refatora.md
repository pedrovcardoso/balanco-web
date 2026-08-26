site/
├── public/                     # Arquivos estáticos disponibilizados diretamente
│   ├── fonts/
│   ├── images/
│   │   ├── historia/
│   │   ├── balanco/
│   │   └── ods/
│   ├── json/
│   ├── pdf/
│   └── vendor/                 # Bibliotecas externas distribuídas localmente
├── src/                        # Código-fonte da aplicação
│   ├── pages/
│   │   ├── home/
│   │   ├── historia/
│   │   ├── balanco/
│   │   ├── balanco-em-dados/
│   │   ├── simulador/
│   │   ├── trilha-jogos/
│   │   ├── jogo/
│   │   │   └── types/
│   │   ├── creditos/
│   │   ├── conquista/
│   │   └── not-found/
│   ├── shared/                 # Recursos reutilizados por diferentes páginas
│   │   ├── components/         # Componentes reutilizáveis de interface
│   │   ├── layout/             # Elementos estruturais
│   │   ├── accessibility/      # Recursos globais de acessibilidade
│   │   ├── services/           # Integrações e serviços compartilhados
│   │   ├── utils/              # Funções auxiliares genéricas
│   │   ├── constants/          # Valores fixos compartilhados
│   │   └── styles/             # Estilos globais, variáveis e utilitários CSS
│   └── config/                 # Configurações dependentes do ambiente
└── index.html                  # Ponto de entrada do site