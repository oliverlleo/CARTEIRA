# Checklist mestre de desenvolvimento — CARTEIRA

> Fonte de verdade: `Prompt mestre — Aplicativo PWA de Controle Financeiro Inteligente com Neon PostgreSQL.md`.
>
> Um item só recebe `[x]` quando estiver implementado de verdade e, quando aplicável, validado/testado. Tela fake, mock ou arquitetura apenas preparada não conta como concluída.

## Estado geral
- [x] Especificação mestre analisada integralmente
- [x] Repositório GitHub inspecionado (estava vazio)
- [x] Projeto Neon `CARTEIRA` criado
- [x] Neon Auth provisionado
- [x] Migration `0001_foundation` aplicada e registrada
- [x] Árvore inicial Next.js/TypeScript criada
- [x] Migration inicial versionada no código local
- [x] Integração do SDK Neon Auth criada no frontend/server
- [x] Cadastro e login implementados no código
- [x] Onboarding carteira + primeira conta implementado
- [x] Dashboard conectado ao banco implementado
- [x] Receita/despesa manual implementadas no código
- [ ] Aplicação completa aprovada pelo contrato de qualidade

## Fase 1 — Fundação
- [x] Next.js App Router + TypeScript
- [x] Neon PostgreSQL e migrations
- [x] Drizzle schema/query layer inicial
- [x] `.env.example` sem segredos
- [x] Validação de variáveis de ambiente
- [x] Managed Better Auth / Neon Auth provisionado
- [x] Handler de Auth para Next.js
- [x] Middleware/proxy de proteção de rotas
- [x] Cadastro por e-mail/senha no código
- [x] Login por e-mail/senha no código
- [x] Logout no código
- [ ] Recuperação de senha
- [ ] Verificação de e-mail UX
- [ ] Magic link/OAuth/passkeys quando apropriado
- [x] `wallets`, `wallet_members`, `wallet_invitations`
- [x] Papéis owner/admin/editor/viewer no banco
- [x] Funções can_read/can_edit/can_admin
- [ ] RLS efetiva nas tabelas de domínio
- [ ] Convite por link completo
- [ ] Alterar/remover membros e transferir propriedade
- [x] Shell mobile-first inicial
- [x] Navegação mobile principal inicial
- [x] Design premium responsivo inicial
- [x] Tema claro/escuro seguindo sistema
- [x] `prefers-reduced-motion`
- [x] Manifest PWA básico
- [x] Service worker básico
- [ ] Ícones PNG 192/512/maskable e validação de instalação
- [ ] Offline com fila local de lançamentos e sync

## Fase 2 — Financeiro principal
- [x] Estrutura de instituições/contas
- [x] Saldo inicial
- [x] View de saldo atual/projetado
- [x] Estrutura de categoria/subcategoria/tag
- [x] Categorias iniciais no onboarding
- [x] Estrutura de split
- [x] Receita manual
- [x] Despesa manual
- [x] Validação servidor de carteira/conta/categoria na criação manual
- [x] Timeline de lançamentos
- [x] Quick add com campos avançados recolhidos
- [x] Dashboard com saldo atual/projetado e entradas/saídas do mês
- [ ] CRUD completo de contas/instituições
- [ ] CRUD completo de categorias/subcategorias/tags
- [ ] Split funcional na UI + validação soma exata
- [ ] Editar/duplicar/reverter lançamento
- [ ] Busca/filtros/swipe/favoritos
- [ ] Transferência atômica funcional
- [ ] “Disponível com segurança”

## Fase 3 — Recorrências e salários
- [ ] Fontes de renda livre
- [ ] Schema fiscal versionado
- [ ] TaxRuleEngine CLT
- [ ] INSS/IRRF/deduções/reduções versionadas
- [ ] Testes com exemplos oficiais
- [ ] 13º e férias opcionais
- [ ] Salário em partes por valor/%/restante
- [ ] Regras de dia útil e feriado
- [ ] Scheduler idempotente
- [ ] Recorrências e edição de série

## Fase 4 — Cartões
- [ ] Cartões, limites e ciclos
- [ ] Faturas e fechamento
- [ ] Compras à vista/parceladas
- [ ] Arredondamento exato de parcelas
- [ ] Pagamento integral/parcial/antecipado sem duplicar despesa
- [ ] Estornos/chargeback/créditos
- [ ] Tela mobile de fatura

## Fase 5 — Planejamento
- [ ] Orçamentos e alertas
- [ ] Metas
- [ ] Dívidas/financiamentos
- [ ] Projeções 7/15/30 dias e meses seguintes
- [ ] Alerta de saldo futuro negativo
- [ ] Relatórios acionáveis
- [ ] Calendário financeiro

## Fase 6 — Importação
- [ ] FinancialDataProvider
- [ ] OFX/CSV/XLSX
- [ ] Mapeamento e perfis CSV/XLSX
- [ ] Import batch + fingerprint
- [ ] Deduplicação por confiança
- [ ] Conciliação sem duplicidade
- [ ] Importação de fatura
- [ ] Rollback/desfazer importação
- [ ] Arquitetura Open Finance

## Fase 7 — IA e anexos
- [ ] Object storage privado
- [ ] Upload seguro e URL assinada
- [ ] Câmera/galeria/PDF
- [ ] Extração estruturada com confidence score
- [ ] Preview obrigatório
- [ ] Proteção contra prompt injection em documentos
- [ ] Categorização determinística antes de IA
- [ ] Abstração de provider de IA e minimização de dados

## Fase 8 — Refinamento
- [ ] Offline completo e conflitos
- [ ] Notificações por usuário
- [ ] Exportação CSV/XLSX/JSON
- [ ] Fluxos LGPD
- [ ] Auditoria completa
- [ ] Performance/bundle/rede lenta
- [ ] Acessibilidade completa
- [ ] Testes críticos salário/cartão/recorrência/importação/permissões
- [ ] Testes de concorrência
- [ ] Revisão de vazamento cross-wallet
- [ ] Revisão final sem mock/TODO/botão falso

## Contrato de pronto
- [ ] Dados persistem de verdade em todos os módulos
- [ ] Autenticação/workspaces/convites/permissões funcionam ponta a ponta
- [ ] Lançamentos/saldos/cartões/parcelas/recorrências/salários funcionam
- [ ] Jobs são idempotentes
- [ ] Importações não duplicam dados
- [ ] PWA é instalável e offline é previsível
- [ ] Mobile está excelente
- [ ] Não existem vazamentos entre carteiras
- [ ] Testes críticos passam
