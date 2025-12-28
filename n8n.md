🚀 Plano de Ação: Implementação LicitaBot v1.0 (Architecture & Automation)
1. Visão Geral
Este documento orienta a implementação da camada de inteligência e automação do LicitaBot, utilizando Node.js, Vue.js 3 e n8n como motor de automação desacoplado. O objetivo é criar uma ferramenta SaaS B2B para licitantes com estética Cyberpunk/Dark Mode.

2. Pilares Tecnológicos (Stack)
Backend: Node.js (Express) + MongoDB (Mongoose).

Frontend: Vue.js 3 + PrimeVue + Tailwind CSS.

Automação: n8n (via Docker, comunicação via Webhooks/REST).

Infraestrutura: Docker Compose para orquestração de microserviços.

3. RoadMap de Implementação (Ação Imediata)
Fase 1: Infraestrutura e Orquestração (DevOps)
Objetivo: Colocar o motor de automação (n8n) para rodar junto ao sistema principal.

Ação 1: Atualizar o docker-compose.yml para incluir a imagem oficial do n8n.

Ação 2: Configurar Variáveis de Ambiente (.env) para garantir que o Backend e o n8n se autentiquem mutuamente (API Keys).

Ação 3: Configurar Nginx (Proxy Reverso) para permitir o carregamento do n8n via IFrame sob o mesmo domínio (evitando erros de Cross-Origin).

Fase 2: O Editor Visual Embarcado (Frontend)
Objetivo: Criar a experiência "White-label" onde o usuário gerencia seus robôs.

Ação 1: Implementar a View Automacao.vue utilizando IFrames protegidos por JWT.

Ação 2: Aplicar Custom CSS no n8n (via variáveis de ambiente N8N_CUSTOM_GRAPHICAL_UI) para que as cores do editor sigam o padrão Neon/Dark do LicitaBot.

Ação 3: Criar o componente de "Biblioteca de Templates" que injeta fluxos pré-prontos (JSON) diretamente na conta do usuário via API.

Fase 3: Camada de Integração (Backend)
Objetivo: Transformar o Backend no "orquestrador" do n8n.

Ação 1: Criar um AutomationService.js no Backend para centralizar chamadas axios para a API do n8n.

Ação 2: Implementar a rota de callback POST /api/webhooks/n8n-response para que o n8n devolva os resultados (certidões, preços, novos editais) de forma assíncrona.

Ação 3: Implementar WebSockets (Socket.io) para atualizar o Frontend em tempo real quando o n8n finalizar uma tarefa de longa duração.

4. O Coração da Inteligência: Workflows n8n
O time deve focar na criação de 3 Workflows mestres:

Radar PNCP: Varredura periódica na API do PNCP filtrando por códigos CATMAT salvos no MongoDB.

Price Analyzer: Consulta ao histórico de preços praticados e cálculo de desvio padrão para o "Semáforo de Risco".

Compliance Guard: Robô de extração de CNDs (Receita, FGTS, Trabalhista) e validação automática.

5. Orientações Essenciais para o Antigravity (Knowledge Base)
🚨 Regra de Ouro: Desacoplamento Total
O código-fonte do n8n não deve ser modificado. Todas as funcionalidades específicas devem ser feitas via Custom Nodes ou via chamadas de API externas. Isso permite que atualizemos o n8n sem quebrar o LicitaBot.

🛡️ Segurança e Multi-tenancy
Cada cliente no LicitaBot deve ter seus Workflows isolados no n8n.

Utilizar External ID (ID do usuário no Mongo) em todos os payloads enviados ao n8n para garantir que o dado retorne ao dono correto.

⚡ Resiliência (Retry Strategy)
As APIs do governo são instáveis. O time deve configurar os nós do n8n com:

Retry on Fail: 3 tentativas com backoff exponencial.

Error Trigger: Um fluxo de erro que notifica o Backend se o portal do governo (Sicaf/Receita) estiver offline por mais de 1 hora.

🎨 UI/UX: O "Efeito Neon"
Utilizar o PrimeVue com temas Dark.

Abusar de glow effects no Tailwind para destacar elementos de "Ganhos" (Azul Neon) e "Riscos" (Rosa Neon).

6. Próximos Passos Técnicos
Configuração do repositório monorepo ou submódulos para os Custom Nodes.

Definição do Schema final de ItemLicitacao no MongoDB para suportar o histórico de preços.

Primeiro "Sprint Zero" focado em conectar o n8n ao Backend e disparar um e-mail de teste via IFrame.

Assinado: Arquiteto de Sistemas LicitaBot