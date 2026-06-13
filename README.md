# GlobalAnalytics AI

Plataforma de análise inteligente de campanhas do Meta Ads. Você exporta o relatório em CSV direto do Gerenciador de Anúncios, faz o upload aqui e em segundos recebe um diagnóstico completo: anomalias detectadas, ROAS médio, CTR por campanha, gasto total e recomendações de otimização — tudo gerado por inteligência artificial.

**Acesse online:** [global-analytics-ia.vercel.app](https://global-analytics-ia.vercel.app)

---

## O que o sistema faz

O GlobalAnalytics AI tem três funcionalidades principais:

**1. Análise por Planilha**
Importe o CSV exportado do Gerenciador de Anúncios do Meta e receba automaticamente:
- Score de saúde geral das campanhas (0 a 100)
- Detecção de anomalias: CPA elevado, ROAS abaixo do esperado, fadiga de frequência, queda de CTR
- 4 gráficos interativos: ROAS por campanha, CTR ao longo do tempo, gasto por campanha e distribuição de severidade
- Botões para enviar o relatório por WhatsApp ou e-mail

**2. Análise ao Vivo**
Conecte sua conta Meta Ads via API e converse em tempo real com uma IA sobre o desempenho das suas campanhas. Pergunte em português, a IA responde com base nos dados reais da conta.

**3. Configurações**
Gerencie as credenciais da Meta Ads e escolha qual IA usar: Claude (Anthropic), GPT-4.1 (OpenAI) ou Gemini (Google).

---

## Screenshot da interface

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Global Analytics                  Relatórios                            │
│  INTELLIGENCE™                     2026-06-01 a 2026-06-07 · 6 campanhas│
│  ● Sistema de Análise Ativo                                              │
│                                    ┌─ PRINCIPAL DESCOBERTA ────────────┐ │
│  ANÁLISE POR PLANILHA              │ Análise de 42 registros.          │ │
│  ► Importar Dados   Enviar CSV     │ 10 anomalias detectadas.          │ │
│  ► Relatórios       Inteligência   │                                   │ │
│                     & Anomalias    │ ▲ Remarketing Checkout            │ │
│  PLATAFORMA                        │   CPA de R$88,41 — 2.1x acima    │ │
│  ► Análise ao Vivo  NOVO           └───────────────────────────────────┘ │
│  ► Configurações                                                         │
│                                    SCORE      ROAS MÉDIO    INVESTIMENTO │
│                                    15/100     10.27x        R$28.302     │
│                                                                          │
│                                    [Inteligência]  [Anomalias  7]        │
│                                                                          │
│                                    ┌─ CPA Elevado ─────── 3 críticas ─┐ │
│                                    ├─ ROAS Baixo ──────── 2 críticas ─┤ │
│                                    └─ Queda de CTR ─────── 2 críticas ┘ │
│                                                                          │
│                                    [ Enviar relatório via WhatsApp ]     │
│                                    [ Enviar relatório via E-mail    ]    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Como rodar localmente

### O que você precisa antes de começar

- **Node.js 18 ou superior** — [baixar em nodejs.org](https://nodejs.org)
- **npm** — já vem instalado com o Node.js
- **Uma chave de API** de pelo menos um dos provedores de IA (Claude, OpenAI ou Gemini)

### Passo a passo

**1. Baixe o projeto**

```bash
git clone https://github.com/eusoualessandrolima/globalanalytics-ai.git
cd globalanalytics-ai
```

**2. Instale as dependências**

```bash
npm install
```

Aguarde o npm baixar todos os pacotes. Isso pode levar 1 a 2 minutos na primeira vez.

**3. Configure as variáveis de ambiente**

```bash
cp .env.example .env.local
```

Abra o arquivo `.env.local` em qualquer editor de texto e preencha ao menos a chave da Anthropic (veja a seção abaixo com a explicação de cada variável).

**4. Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

**5. Acesse a plataforma**

Abra o navegador e acesse: `http://localhost:3000`

A plataforma estará funcionando. Para testar, exporte um relatório do Gerenciador de Anúncios do Meta em formato CSV e faça o upload.

### Comandos disponíveis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento com hot-reload |
| `npm run build` | Gera a versão de produção otimizada |
| `npm run start` | Inicia a versão de produção (requer `build` antes) |
| `npm run lint` | Verifica erros de código |

---

## Variáveis de ambiente

Todas as variáveis ficam no arquivo `.env.local` na raiz do projeto. As marcadas como **obrigatórias** precisam ser configuradas para o sistema funcionar. As demais são opcionais e ativam funcionalidades extras.

---

### ANTHROPIC_API_KEY — Obrigatória

```
ANTHROPIC_API_KEY=sk-ant-...
```

**Para que serve:** é a chave de acesso à API do Claude (Anthropic). O sistema usa o Claude para analisar os dados das campanhas e gerar o relatório com detecção de anomalias e recomendações em linguagem natural.

**Como obter:**
1. Acesse [console.anthropic.com](https://console.anthropic.com) e crie uma conta
2. Vá em **API Keys** e clique em **Create Key**
3. Copie a chave gerada (começa com `sk-ant-`)
4. Adicione créditos em **Billing** — o sistema usa poucos tokens por análise (estimativa: US$ 0,01 por relatório com o Sonnet)

**O que acontece sem ela:** o sistema ainda funciona, mas usa análise estatística local em vez da IA. O relatório fica mais simples, sem as recomendações personalizadas.

---

### Variáveis do WhatsApp — Opcionais

Necessárias apenas para o botão **Enviar relatório via WhatsApp**. Requer uma instância da [Evolution API](https://doc.evolution-api.com) rodando.

```
WHATSAPP_API_URL=https://sua-instancia.evolution-api.com
WHATSAPP_API_KEY=sua_chave_api_aqui
WHATSAPP_INSTANCE=nome_da_instancia
WHATSAPP_NUMBER_DESTINO=5562999999999
```

| Variável | O que é | Exemplo |
|----------|---------|---------|
| `WHATSAPP_API_URL` | URL completa da sua instância Evolution API | `https://api.seudominio.com` |
| `WHATSAPP_API_KEY` | Chave de autenticação da Evolution API | `abc123xyz` |
| `WHATSAPP_INSTANCE` | Nome da instância criada na Evolution API | `minha-instancia` |
| `WHATSAPP_NUMBER_DESTINO` | Número que receberá os relatórios (sem `+`, com código do país) | `5562999990000` |

**O que acontece sem elas:** o botão de WhatsApp aparece normalmente, mas ao clicar exibe uma mensagem informando que a integração não está configurada.

---

### Variáveis da Meta Ads — Opcionais

Essas credenciais **não vão no `.env.local`**. Elas são configuradas diretamente na tela de **Configurações** dentro da plataforma e ficam salvas localmente no seu navegador — nunca passam pelo servidor.

| Campo | O que é | Como obter |
|-------|---------|------------|
| Access Token | Token de acesso à Graph API | [developers.facebook.com](https://developers.facebook.com) → Ferramentas → Explorador da API → Gerar token |
| Ad Account ID | ID da conta de anúncios | Gerenciador de Anúncios → veja na URL: `act_XXXXXXXXX` |
| Business ID | ID do Business Manager (opcional) | Configurações do Business → Informações da empresa |

---

### Variáveis da plataforma — Opcionais

```
NEXT_PUBLIC_APP_NAME=GlobalAnalytics AI
NEXT_PUBLIC_APP_URL=https://global-analytics-ia.vercel.app
```

Usadas apenas para metadados internos. Podem ser deixadas como estão ou ajustadas se você fizer seu próprio deploy.

---

## Decisões de arquitetura

Esta seção explica as principais escolhas técnicas do projeto e o motivo de cada uma, de forma simples.

---

### Por que Next.js?

Next.js permite ter o site e a API no mesmo projeto, sem precisar de dois repositórios separados. As rotas de API (como `/api/analyze`) rodam como funções na nuvem — escalam automaticamente e não custam nada quando estão ociosas. Para um projeto desse porte, é a escolha mais simples e eficiente.

---

### Por que o CSV é processado no servidor, não direto no navegador?

Privacidade e segurança. Ao processar no servidor, a chave da API do Claude nunca é exposta ao navegador do usuário. Além disso, o arquivo CSV não é salvo em lugar nenhum — é lido na memória, processado e descartado imediatamente. Isso significa que dados sigilosos das campanhas nunca ficam armazenados na plataforma.

---

### Por que existe um plano B (fallback) quando a IA falha?

A API do Claude pode falhar por vários motivos: saldo zerado, sobrecarga, timeout de rede. Em vez de mostrar uma tela de erro, o sistema automaticamente usa análise estatística local — calcula as mesmas anomalias usando matemática simples (médias, desvio padrão) sem depender da IA. O usuário sempre recebe um relatório, mesmo que mais básico.

---

### Por que as chaves da Meta ficam no navegador e não no servidor?

Essas chaves são pessoais — pertencem ao usuário, não à plataforma. Guardá-las no servidor exigiria banco de dados, sistema de login e isolamento por conta. Isso triplicaria a complexidade do projeto. Salvar no navegador (localStorage) é seguro o suficiente para uso pessoal: as chaves ficam apenas no dispositivo do usuário e nunca passam por servidor externo.

---

### Por que validar a resposta da IA com Zod?

IAs podem retornar respostas inesperadas — um campo com nome errado, um número onde deveria haver texto, ou um JSON mal formatado. O Zod garante que o relatório gerado pelo Claude tem exatamente os campos esperados antes de ser exibido. Se a validação falhar, o sistema usa o fallback estatístico automaticamente, sem mostrar erro para o usuário.

---

### Por que os gráficos carregam separado da página?

A biblioteca de gráficos (Recharts) pesa cerca de 80KB. Se carregasse junto com a página principal, deixaria o upload mais lento para aparecer. Usando carregamento assíncrono (`next/dynamic`), a área de upload aparece imediatamente e os gráficos carregam depois, quando o relatório está pronto e o usuário precisa deles.

---

### Por que o WhatsApp é disparado sem esperar a resposta?

A Evolution API pode demorar até 10 segundos para confirmar o envio. Se o sistema ficasse esperando, o usuário teria que aguardar tudo isso antes de ver o relatório. Com o disparo "fire-and-forget", o relatório aparece na tela imediatamente e o WhatsApp é enviado em segundo plano. Se der erro, é registrado no log do servidor.

---

## Limitações conhecidas

| Limitação | Explicação |
|-----------|------------|
| **Relatórios não são salvos** | O sistema é projetado para não armazenar nada. Fechar o navegador descarta o relatório. Para ter histórico, seria necessário banco de dados e login de usuários. |
| **Só aceita CSV do Meta Ads** | O parser reconhece as colunas do Gerenciador de Anúncios do Meta. Planilhas do Google Ads, TikTok Ads ou outras plataformas não são compatíveis. |
| **WhatsApp requer Evolution API própria** | Não há integração direta com o WhatsApp Business oficial. É necessário ter uma instância da Evolution API configurada e funcionando. |
| **Token da Meta expira em 60 dias** | Tokens de usuário gerados pelo Explorador da API expiram. Tokens de sistema (via Business Manager) não expiram e são recomendados para uso contínuo. |
| **Sem autenticação de usuários** | Qualquer pessoa com o link pode acessar a plataforma. Ideal para uso pessoal ou em equipes pequenas com link privado. |
| **Limite de 10MB por arquivo** | Planilhas muito grandes (mais de ~100.000 linhas) podem ultrapassar o limite de tempo da função no Vercel. |
| **Análise ao Vivo requer conta Meta Business** | A Graph API do Meta exige permissões específicas da conta para acessar dados de campanhas em tempo real. |

---

## Estimativa de custo rodando diariamente

Considerando **10 análises por dia**, com planilhas de ~50 campanhas cada.

### Custo da IA (Anthropic / Claude)

Cada análise usa aproximadamente 2.000 tokens de entrada e 1.000 de saída.

| Modelo | Custo por análise | Custo mensal (10/dia) |
|--------|-------------------|----------------------|
| Claude Haiku 4.5 | ~US$ 0,001 | ~US$ 0,30 |
| Claude Sonnet 4.6 | ~US$ 0,01 | ~US$ 3,00 |
| Claude Opus 4.7 | ~US$ 0,08 | ~US$ 24,00 |

*Recomendação: use o Sonnet 4.6 para o melhor equilíbrio entre qualidade e custo.*

### Custo da hospedagem (Vercel)

| Plano | Custo | Adequado para |
|-------|-------|---------------|
| Hobby (gratuito) | US$ 0 | Uso pessoal — até ~300 análises/mês |
| Pro | US$ 20/mês | Uso intenso ou domínio personalizado |

### Custo total estimado por mês

| Perfil de uso | IA | Vercel | Total |
|---------------|-----|--------|-------|
| Pessoal (até 10 análises/dia) | US$ 3 | US$ 0 | **~US$ 3** |
| Equipe pequena (50 análises/dia) | US$ 15 | US$ 0 | **~US$ 15** |
| Agência (200 análises/dia) | US$ 60 | US$ 20 | **~US$ 80** |

*Valores em dólar americano. A Anthropic cobra apenas pelo uso — não há mensalidade fixa.*

---

## Estrutura do projeto

```
globalanalytics-ai/
├── app/                         # Páginas e rotas de API (Next.js App Router)
│   ├── api/
│   │   ├── analyze/route.ts     # Recebe CSV, analisa e retorna relatório
│   │   ├── notify/route.ts      # Envia relatório por WhatsApp
│   │   ├── chat/route.ts        # Chat em tempo real com streaming
│   │   ├── meta/                # Integração com Meta Ads API
│   │   └── ai/test/route.ts     # Testa conexão com provider de IA
│   ├── live/page.tsx            # Página: Análise ao Vivo
│   ├── settings/page.tsx        # Página: Configurações
│   └── page.tsx                 # Página: Upload e relatório
├── components/                  # Componentes visuais reutilizáveis
│   ├── Sidebar.tsx              # Menu lateral de navegação
│   ├── UploadArea.tsx           # Área de upload com drag-and-drop
│   ├── ReportView.tsx           # Relatório completo (abas internas)
│   ├── MetricCards.tsx          # Cards de KPIs (Score, ROAS, Gasto...)
│   ├── AnomalyList.tsx          # Lista de anomalias com acordeão
│   ├── Charts.tsx               # 4 gráficos com Recharts
│   ├── InsightHero.tsx          # Card "Principal Descoberta"
│   └── LoadingState.tsx         # Tela de carregamento animada
├── lib/                         # Lógica principal (roda no servidor)
│   ├── csv-parser.ts            # Lê e normaliza o CSV do Meta Ads
│   ├── claude-analyzer.ts       # Chama a IA e valida a resposta
│   ├── anomaly-detector.ts      # Análise estatística local (fallback)
│   ├── report-generator.ts      # Formata o relatório para WhatsApp/e-mail
│   ├── whatsapp-notify.ts       # Envia mensagem via Evolution API
│   ├── ai-providers/            # Abstração multi-provider (Claude/OpenAI/Gemini)
│   └── meta-ads/                # Cliente da Graph API do Meta
├── types/                       # Definições de tipos TypeScript
│   ├── campaign.ts              # Tipos: CampaignRow, AnalysisReport, Anomaly
│   └── ai.ts                   # Tipos: AISettings, MetaSettings, ChatMessage
├── .env.example                 # Modelo de variáveis de ambiente
├── CLAUDE.md                    # Instruções para o Claude Code (IA de desenvolvimento)
├── next.config.js               # Configurações de segurança HTTP
├── tailwind.config.ts           # Paleta de cores customizada
└── package.json                 # Dependências do projeto
```

---

## Deploy no Vercel

O projeto já está publicado. Se quiser fazer seu próprio deploy:

**Via terminal:**

```bash
npm install -g vercel
vercel login
vercel --prod
```

**Via dashboard:**

1. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório do GitHub
2. Configure a variável `ANTHROPIC_API_KEY` em **Settings → Environment Variables**
3. Clique em **Deploy** — o Vercel cuida do resto automaticamente

---

## Perguntas técnicas

Esta seção responde às perguntas dissertativas do processo seletivo, explicando as decisões de escalabilidade, confiabilidade e priorização do projeto.

---

### 1. O que quebraria se o sistema precisasse processar 1 milhão de linhas por dia, com 200 clientes simultâneos? O que você mudaria?

**O que quebraria no modelo atual:**

O sistema processa cada arquivo em memória dentro de uma única função serverless do Vercel, com timeout de 60 segundos. Com 200 clientes simultâneos enviando planilhas grandes, três coisas quebrariam:

1. **Timeout da função** — planilhas com dezenas de milhares de linhas ultrapassariam os 60s de processamento
2. **Rate limit da API do Claude** — a Anthropic limita requisições simultâneas; 200 uploads ao mesmo tempo causariam erros de throttling
3. **Sem fila de prioridade** — sem mecanismo de retry, qualquer falha seria silenciosa para o usuário

**O que eu mudaria:**

O maior redesenho seria separar o upload do processamento usando uma fila assíncrona (por exemplo, BullMQ com Redis). O fluxo ficaria:

```
Upload CSV → Fila de jobs → Worker processa → Resultado salvo no banco → Usuário notificado
```

Para o banco, usaria o Supabase (PostgreSQL) para guardar os relatórios por usuário. Para a IA, implementaria chunking — dividir planilhas grandes em lotes de 500 linhas, analisar separado e consolidar os resultados. O frontend mostraria progresso em tempo real via Server-Sent Events (já usado no chat ao vivo) em vez de esperar a análise completa.

Com isso, o sistema toleraria qualquer volume sem timeout, com fila gerenciando a carga e retry automático em caso de falha da API.

---

### 2. Como você garantiria que alucinações do modelo de linguagem não gerassem recomendações incorretas para os clientes?

**O que já existe no sistema:**

O sistema já tem duas camadas de proteção implementadas:

- **Validação estrutural com Zod** — a resposta do Claude é validada campo a campo antes de ser exibida. Se o JSON estiver malformado ou com tipos errados, o sistema descarta a resposta da IA e usa análise estatística local.
- **Fallback automático** — se a IA falhar ou retornar algo inválido, o sistema calcula as anomalias usando matemática pura (médias, desvio padrão, regras fixas) sem depender de linguagem natural.

**O que eu adicionaria para maior confiabilidade:**

O ponto fraco atual é que o Zod valida a *forma* da resposta, mas não o *conteúdo*. A IA poderia retornar um CPA de R$ 999 para uma campanha com CPA real de R$ 12 e o sistema exibiria sem questionar.

Para resolver isso, separaria claramente o que é **fato** do que é **interpretação**:

- **Fatos** (números, métricas) → sempre calculados localmente, nunca pela IA
- **Interpretação** (por que o CPA está alto, o que fazer) → pela IA, com contexto dos números já calculados

Assim, a IA receberia no prompt: *"O CPA desta campanha é R$ 88,41, 2,1x acima da média de R$ 42,10. Explique o que pode ter causado isso e o que recomenda."* A IA nunca "inventa" o número — apenas interpreta o número correto. Qualquer dado numérico no relatório viria da planilha, não do modelo.

---

### 3. Se você tivesse metade do tempo disponível, o que cortaria? Se tivesse o dobro, o que adicionaria?

**Com metade do tempo — o que cortaria:**

Manteria apenas o núcleo de valor: upload de CSV + análise com Claude + relatório na tela. Cortaria:

- **Análise ao Vivo** (chat em tempo real com Meta API) — funcionalidade avançada que exigiu a maior parte do esforço de integração
- **Suporte multi-provider de IA** (OpenAI, Gemini) — o Claude já resolve o problema principal; os outros providers são opção extra
- **Botão de WhatsApp** — requer infraestrutura externa (Evolution API) que o cliente precisa ter

Com metade do tempo, o sistema entregaria o essencial: um gestor faz upload do CSV e recebe o diagnóstico. Isso já é o valor principal do produto.

**Com o dobro do tempo — o que adicionaria:**

Em ordem de prioridade:

1. **Testes automatizados** — Jest para a lógica de parsing e detecção de anomalias, Playwright para testes end-to-end do fluxo de upload. Hoje o sistema não tem testes, o que torna difícil refatorar com segurança.
2. **Histórico de relatórios** — banco de dados + login com Google OAuth para o usuário acessar análises anteriores e comparar período a período.
3. **Suporte a outras plataformas** — parser para Google Ads e TikTok Ads, que seguem estrutura parecida de CSV.
4. **Relatórios agendados** — conexão permanente com a Meta API para enviar relatório diário automático por WhatsApp sem precisar fazer upload manual.

---

## Tecnologias utilizadas

| Tecnologia | Versão | Para que serve |
|------------|--------|----------------|
| Next.js | 14.2 | Framework principal (site + API) |
| TypeScript | 5 | Tipagem estática — evita erros em tempo de desenvolvimento |
| Tailwind CSS | 3.4 | Estilização rápida com classes utilitárias |
| Framer Motion | 12 | Animações de transição entre telas |
| Recharts | 3 | Gráficos interativos de campanha |
| PapaParse | 5.4 | Leitura e parsing do arquivo CSV |
| Zod | 3.23 | Validação de dados recebidos da IA |
| Anthropic SDK | 0.52 | Integração com Claude |
| Lucide React | 0.400 | Ícones da interface |

---

*Desenvolvido por Alessandro Lima · Projeto seletivo Global Platform*
