# Checklist mestre de desenvolvimento — CARTEIRA

> Fonte de verdade: `Prompt mestre — Aplicativo PWA de Controle Financeiro Inteligente com Neon PostgreSQL.md`.
>
> Regra: um item só recebe `[x]` quando existe implementação real e, quando aplicável, validação/teste. Tela fake, mock, botão sem ação, TODO de funcionalidade central ou arquitetura apenas preparada **não conta como concluído**.

## Arquitetura obrigatória
- [x] Especificação mestre analisada e convertida em fases verificáveis
- [x] Backend definido como **Neon PostgreSQL + Neon Auth + Neon Data API**
- [x] Frontend definido como **PWA estática React + TypeScript + Vite**, sem Next.js e sem servidor Node da aplicação
- [x] Hospedagem definida no **GitHub Pages**
- [x] Node limitado a ferramenta de build/teste no CI; não existe processo Node em produção
- [x] Credencial PostgreSQL proibida no navegador; frontend usa Auth/JWT + Data API/RLS
- [x] Jobs desenhados para execução transacional/idempotente no banco, disparáveis pelo GitHub Actions quando necessário
- [x] Projeto Neon `CARTEIRA` identificado e branch `main` validada
- [x] Neon Auth provisionado e endpoint ativo
- [ ] Neon Data API validada ponta a ponta com JWT
- [ ] GitHub Pages publicado e smoke test HTTP aprovado

## Fase 1 — Fundação e segurança
### Banco / multi-tenant
- [x] `wallets`
- [x] `wallet_members`
- [x] `wallet_invitations`
- [x] Papéis owner/admin/editor/viewer modelados
- [x] `can_read_wallet`, `can_edit_wallet`, `can_admin_wallet`
- [x] RLS habilitada nas tabelas de domínio por carteira
- [x] `wallet_id` nas entidades financeiras relevantes
- [x] Auditoria estruturada
- [x] Idempotency records estruturados
- [x] Histórico/revisões de lançamentos estruturado
- [ ] RPC criar carteira + categorias iniciais
- [ ] RPC convite seguro por token + expiração/revogação
- [ ] RPC aceitar convite
- [ ] RPC alterar/remover membro
- [ ] RPC transferir propriedade
- [ ] Teste real de isolamento cross-wallet

### Autenticação
- [x] Managed Better Auth / Neon Auth ativo
- [ ] Cadastro e login por e-mail/senha na PWA
- [ ] Logout
- [ ] Recuperação de senha
- [ ] Verificação de e-mail UX
- [ ] Sessão persistente/múltiplas abas
- [ ] Retorno automático ao convite após autenticação

### PWA / shell
- [ ] Vite/React/TypeScript substituindo Next.js
- [ ] Manifest completo
- [ ] Ícones 192/512/maskable
- [ ] Service worker
- [ ] Standalone/safe areas
- [ ] Shortcuts Nova despesa/Nova receita/Escanear
- [ ] Navegação mobile Início/Lançamentos/+/Planejamento/Mais
- [ ] Desktop responsivo coerente
- [ ] Tema claro/escuro/sistema
- [ ] `prefers-reduced-motion`
- [ ] Empty states e erros compreensíveis

## Fase 2 — Financeiro principal
### Contas, categorias e tags
- [x] Schema de instituições/contas
- [x] Saldo inicial e data do saldo inicial
- [x] View de saldo atual/projetado
- [x] Categorias/subcategorias hierárquicas
- [x] Tags e relacionamento com lançamentos
- [x] Split de lançamento modelado
- [ ] CRUD completo de contas/instituições na PWA
- [ ] Arquivar/restaurar contas
- [ ] CRUD completo de categorias/subcategorias/tags
- [ ] Arquivar/restaurar categoria usada historicamente
- [ ] Reordenação/ícone/cor

### Movimentações
- [ ] RPC transacional criar receita/despesa com split/tags/idempotência
- [ ] RPC editar lançamento com versionamento/auditoria
- [ ] RPC reverter/excluir preservando histórico
- [ ] RPC transferência atômica de duas pernas
- [ ] Quick add mobile
- [ ] Campos avançados por progressive disclosure
- [ ] Timeline agrupada por data
- [ ] Editar/duplicar/reverter
- [ ] Favoritos/atalhos
- [ ] Busca e filtros completos
- [ ] Swipe/context actions
- [ ] Offline queue para novo lançamento
- [ ] Sincronização/rollback de optimistic UI

### Dashboard e fluxo
- [ ] Saldo atual
- [ ] Saldo projetado
- [ ] Saldo disponível/“Disponível com segurança”
- [ ] Entradas/saídas do mês
- [ ] Faturas e compromissos próximos
- [ ] Projeções 7/15/30 dias/fim do mês
- [ ] Alerta de saldo futuro negativo com causas

## Fase 3 — Rendas, CLT, recorrências e jobs
### Rendas
- [x] `income_sources`
- [x] `salary_profiles`
- [x] `salary_payment_rules`
- [x] `salary_calculations`
- [ ] CRUD renda livre fixa/variável/recorrente/eventual
- [ ] CLT bruto/líquido
- [ ] Partes por valor/%/restante com soma exata
- [ ] Regras dia X/último dia/primeiro/último/Xº dia útil/ajustes
- [ ] 13º opcional
- [ ] Férias + 1/3 opcionais

### Motor fiscal
- [x] Tax rule sets versionados por vigência
- [x] Faixas INSS versionadas
- [x] Faixas IRRF versionadas
- [x] Regras de redução versionadas
- [ ] Motor CLT no banco usando competência
- [ ] INSS progressivo/teto
- [ ] IRRF + dependentes + pensão + simplificado mais vantajoso
- [ ] Adicionais e descontos opcionais
- [ ] Snapshot histórico do cálculo
- [ ] Dados tributários BR vigentes carregados e referenciados
- [ ] Testes de cálculo com exemplos oficiais

### Recorrência/jobs
- [x] `recurrence_rules`
- [x] `scheduled_occurrences`
- [x] Calendário de feriados estruturado
- [x] `background_jobs` e idempotência estruturados
- [ ] RPC gerar ocorrências de renda
- [ ] RPC gerar ocorrências recorrentes
- [ ] RPC efetivar ocorrências vencidas sem duplicar
- [ ] Edição somente esta/esta e próximas/toda série
- [ ] Timezone da carteira aplicado
- [ ] GitHub Actions cron chamando job seguro
- [ ] Teste de execução duplicada sem duplicar lançamento

## Fase 4 — Cartões
- [x] `credit_cards`
- [x] `card_invoices`
- [x] `card_purchases`
- [x] `installments`
- [x] `invoice_payments`
- [x] `card_adjustments`
- [x] Views de limite e saldo de fatura
- [ ] RPC criar cartão
- [ ] RPC atribuir compra à fatura pelo fechamento
- [ ] RPC compra à vista/parcelada
- [ ] Distribuição exata de centavos nas parcelas
- [ ] Limite comprometido pelo total restante
- [ ] RPC pagamento integral/parcial/antecipado
- [ ] Pagamento não duplicar despesa em relatórios
- [ ] RPC estorno total/parcial/chargeback/crédito
- [ ] CRUD/tela mobile de cartões
- [ ] Navegação horizontal entre faturas
- [ ] Testes fechamento/dezembro-janeiro/parcelas/pagamentos/estornos

## Fase 5 — Planejamento
- [x] `budgets`
- [x] `financial_goals`
- [x] `debts`
- [ ] Orçamento carteira/categoria/subcategoria
- [ ] Gasto/comprometido/restante/%
- [ ] Alertas 70/80/90/100/personalizado
- [ ] Metas + progresso + aporte mensal necessário
- [ ] Dívidas/financiamentos e parcelas
- [ ] Relatórios receitas x despesas
- [ ] Gastos por categoria/subcategoria
- [ ] Evolução mensal
- [ ] Fixos x variáveis
- [ ] Cartões/contas/patrimônio simplificado
- [ ] Compromissos futuros
- [ ] Calendário financeiro

## Fase 6 — Importação e conciliação
- [x] `import_batches`
- [x] `imported_records`
- [x] `import_profiles`
- [x] `reconciliation_matches`
- [x] `import_effects` para rollback
- [x] `categorization_rules`
- [x] Abstração de conexão Open Finance estruturada
- [ ] Parser OFX
- [ ] Parser CSV
- [ ] Parser XLSX
- [ ] Mapeamento de colunas e perfil salvo
- [ ] Fingerprint robusto + external ID
- [ ] Score de duplicidade
- [ ] Preview antes de confirmar
- [ ] Sugestão/aceite de conciliação
- [ ] Importação de fatura/cartão
- [ ] Rollback sem apagar lançamento pré-existente conciliado
- [ ] UI completa de importação

## Fase 7 — Anexos e inteligência
- [x] Metadados de anexos privados estruturados
- [x] Eventos/uso de IA estruturados
- [ ] Object Storage privado (não grandes binários no Postgres)
- [ ] Upload com MIME/tamanho/checksum/nome seguro
- [ ] URL assinada e isolamento por carteira
- [ ] Câmera/galeria/PDF/Web Share Target
- [ ] Parser local/regra determinística antes de IA
- [ ] Extração estruturada: estabelecimento/valor/data/pagamento/cartão/parcelas/categoria
- [ ] Confidence score
- [ ] Preview obrigatório antes de gravar
- [ ] Documento tratado como dado não confiável (prompt injection)
- [ ] Provider de IA desacoplado + minimização LGPD

## Fase 8 — Refinamento, privacidade e qualidade
### Offline/notificações/exportação
- [ ] Cache de dados recentes
- [ ] Fila IndexedDB
- [ ] Estado “Sincronização pendente”
- [ ] Resolução previsível de conflitos
- [x] Notificações/preferências/push estruturadas no banco
- [ ] UI de preferências por usuário
- [ ] Exportar CSV
- [ ] Exportar XLSX
- [ ] Backup JSON
- [x] Solicitações de privacidade estruturadas
- [ ] UX exportação/exclusão LGPD

### Design/acessibilidade/performance
- [ ] Design premium mobile-first
- [ ] Componentes de toque confortáveis
- [ ] Máscara BRL e datas pt-BR
- [ ] Skeletons/microinterações/transições curtas
- [ ] Contraste/foco/labels/ARIA/teclado/leitor de tela
- [ ] Lazy loading/paginação/cache
- [ ] Sem tabelas largas no mobile
- [ ] Lighthouse/PWA sem falha crítica

### Auditoria/testes
- [ ] Auditoria criação/edição/exclusão/pagamento/importação/conciliação/membros
- [ ] Testes salário: faixas/teto/dependentes/descontos/mudança de vigência
- [ ] Testes cartão: fechamento/parcelas/estorno/pagamento parcial/total
- [ ] Testes recorrência: 28/29/30/31/dia útil/fim de série
- [ ] Testes importação: duplicidade/reimportação/conciliação/rollback
- [ ] Testes permissões: A nunca acessa carteira B
- [ ] Testes concorrência/idempotência
- [ ] Build/typecheck/testes automatizados verdes
- [ ] Revisão sem mock/TODO/botão falso

## Contrato de pronto — só concluir quando TODOS estiverem [x]
- [ ] Dados persistem de verdade em todos os módulos visíveis
- [ ] Autenticação/workspaces/convites/permissões funcionam ponta a ponta
- [ ] Lançamentos/saldos/transferências funcionam e fecham matematicamente
- [ ] Cartões/faturas/parcelamentos/pagamentos/estornos funcionam
- [ ] Rendas/CLT/recorrências/jobs funcionam sem duplicação
- [ ] Planejamento/projeção/relatórios/calendário funcionam
- [ ] Importações possuem preview/deduplicação/conciliação/rollback
- [ ] PWA é instalável e o offline é previsível
- [ ] Mobile está excelente e acessível
- [ ] Não existem vazamentos entre carteiras
- [ ] Testes críticos passam
- [ ] GitHub Pages publicado, abre sem tela branca e smoke test aprovado
- [ ] **Aplicação completa aprovada pelo contrato de qualidade**
