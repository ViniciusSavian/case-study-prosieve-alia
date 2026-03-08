# Case Ops — AliaHire / Prosieve

## Sumário

1. [Parte 1 - Diagnóstico](#parte-1---diagnóstico)
   - [1.1 Tempo total do dia de trabalho](#11-tempo-total-do-dia-de-trabalho)
   - [1.2 Tabela de prioridades](#12-tabela-de-prioridades)
   - [1.3 Estágio com maior aging](#13-estágio-com-maior-aging)
   - [1.4 Estágio mais ineficiente](#14-estágio-mais-ineficiente)
   - [1.5 Hipóteses de atraso](#15-hipóteses-de-atraso)
   - [1.6 Duplicidade](#16-duplicidade)
   - [1.7 Viabilidade matemática da meta de candidatos](#17-viabilidade-matemática-da-meta-de-candidatos)
   - [1.8 Métricas mínimas esperadas](#18-métricas-mínimas-esperadas)
2. [Parte 2 - Melhorias via Automação](#parte-2---melhorias-via-automação)
3. [Parte 3 - Implementação V1](#parte-3---implementação-v1)

---

## Parte 1 - Diagnóstico

### 1.1 Tempo total do dia de trabalho

**Metodologia:** Os valores foram calculados usando a média das faixas fornecidas nas tabelas do case. Tarefas classificadas como semanais (Reporting delivery metrics, Marketing research, Product improvement) foram divididas por 5 dias úteis para obter o custo diário proporcional.

#### Tarefas diárias

| Categoria | Mínimo (min) | Máximo (min) | Média (min) |
|---|---|---|---|
| Finding candidates | 61 | 155 | 108 |
| Messaging candidates | 205 | 210 | 207 |
| Documenting numbers & processes | 80 | 120 | 100 |
| Creating reports & measuring performance | 16 | 16 | 16 |
| Daily improvements to processes | 15 | 25 | 20 |
| Meetings | 30 | 30 | 30 |

#### Tarefas semanais (proporcional diário, dividido por 5)

| Categoria | Total semanal (min) | Custo diário proporcional (min) |
|---|---|---|
| Reporting delivery metrics to client | 480 | 96 |
| Marketing research | 420+ | 96 |
| Product improvement | 240 | 48 |

#### Totalização

| Cenário | Total (min) | Total (horas) |
|---|---|---|
| Mínimo | 647 | 10h47 |
| Máximo | 796 | 13h16 |
| Média | 721 | 12h01 |

**Conclusão:** O workload diário excede entre 35% e 65% uma jornada padrão de 8 horas (480 min). O surplus médio é de 241 minutos por dia. Esse dado por si só demonstra que a operação atual não é sustentável sem redução significativa de trabalho manual. Automação não é uma melhoria incremental: é uma pré-condição para a operação funcionar dentro de horário humano razoável.

O maior consumidor isolado de tempo é o Messaging candidates com 207 minutos diários, impulsionado principalmente pelas respostas manuais a candidatos (200 minutos), que representam 28% do total do dia.

---

### 1.2 Tabela de prioridades

**Critério de pontuação:**
- **5** - Trabalho que bloqueia diretamente a entrega ao cliente. Sem ele, a operação para.
- **4** - Trabalho que garante qualidade e relacionamento. Sua ausência degrada o serviço de forma perceptível ao cliente.
- **3** - Trabalho que melhora a operação no médio prazo. Importante, mas não urgente.
- **2** - Trabalho necessário mas que pode ser reduzido, adiado ou assincronizado.
- **1** - Trabalho não essencial no curto prazo. Pode ser eliminado ou terceirizado.

| Tarefa | Nota | Motivo da priorização |
|---|---|---|
| Finding candidates | **5** | É o início de toda a esteira de recrutamento. Sem um pipeline de candidatos qualificados, nenhuma outra etapa tem insumo para funcionar. Impacto direto no throughput e na meta de 3 candidatos/vaga/semana. |
| Messaging candidates | **5** | É o único ponto de contato ativo com candidatos. A taxa de conversão de outreach determina diretamente quantos candidatos chegam ao cliente. Um dia sem outreach é um dia de atraso irrecuperável no pipeline. |
| Documenting numbers & processes | **4** | Garante rastreabilidade do processo, evita retrabalho por falta de histórico, e é a base dos relatórios ao cliente. Sem documentação, o processo opera no escuro e erros se repetem. |
| Reporting delivery metrics to client | **4** | Crítico para a percepção de valor pelo cliente e para a retenção de contrato. Um cliente sem visibilidade do progresso perde confiança, independente de quantos candidatos estejam sendo processados internamente. |
| Creating reports & measuring performance | **3** | Importante para gestão interna e para identificar desvios de performance, mas não bloqueia a operação diária. Pode ser batched e otimizado. |
| Daily improvements to processes | **3** | Alto valor acumulado a longo prazo. Porém, sem um sistema estruturado de priorização de melhorias, pode consumir tempo sem gerar impacto mensurável. Deve ser time-boxed. |
| Product improvement | **3** | Essencial para evolução do produto, mas de ciclo mais longo. Sugestões sem dados de performance são fracas; deve ser executado após acúmulo de evidências operacionais. |
| Meetings | **2** | Necessário para alinhamento, mas alto custo de contexto. A maioria dos alinhamentos operacionais pode ser feita de forma assíncrona (Slack, Notion updates). Um standup diário de 30 minutos deve ser protegido; reuniões adicionais devem ser questionadas. |
| Market research | **2** | Valor estratégico alto no longo prazo, mas sem urgência operacional imediata. Deve ser executado por demanda ou em ciclos mensais, não diariamente. |

---

### 1.3 Estágio com maior aging

**Estágio 6 - Feedback sobre candidatos enviados** apresenta o maior aging do processo, com SLA declarado de **1 a 30 dias**, a faixa mais ampla e imprecisa de todo o fluxo.

**Justificativa detalhada:**

Todos os estágios anteriores possuem SLAs internos que o time de Ops pode controlar diretamente:

- Estágio 1: 1 dia (registro de vaga, ação interna)
- Estágio 2: 1 dia (matching algorítmico, ação interna)
- Estágio 3: 1 a 5 dias (alinhamento, depende do cliente, mas com canal definido)
- Estágio 4: 1 a 5 dias (outreach, ação interna)
- Estágio 5: 3 candidatos a cada 7 dias (envio, ação interna)

O Estágio 6 quebra esse padrão porque **depende exclusivamente de ação do cliente**, sem nenhum mecanismo de enforcement, reminder automático ou SLA contratual implícito. Um candidato entregue pode ficar 4 semanas em "pendente" sem que o time de Ops perceba em tempo hábil.

O impacto prático é duplo: o candidato fica parado no pipeline (pode receber outra oferta enquanto espera), e o time não sabe se deve continuar buscando mais candidatos para aquela vaga ou pausar.

O **Estágio 3 (Alinhamento com cliente)** é o segundo maior risco de aging. O canal utilizado é Slack/WhatsApp, informal, sem acuse de recibo estruturado e sujeito a mensagens perdidas em threads ativas.

---

### 1.4 Estágio mais ineficiente (tempo por resultado)

**Messaging candidates - subtarefa "Replying to candidates"** é o estágio com pior relação tempo/resultado.

**Cálculo:**

| Métrica | Valor |
|---|---|
| Tempo gasto por dia em respostas | 200 minutos |
| Volume de mensagens/dia | 50 mensagens |
| Taxa de conversão declarada | 10% |
| Candidatos convertidos por dia | 5 |
| Tempo de trabalho por candidato convertido | **40 minutos** |

Para comparação, o Finding candidates entrega 50 candidatos qualificados em 61 a 155 minutos, com custo de 1,2 a 3,1 minutos por candidato qualificado, uma eficiência 13x a 33x maior.

**Causa estrutural:** o problema não é a taxa de conversão em si (10% é razoável para outreach frio), mas o fato de que cada resposta é tratada manualmente, individualmente, sem templates, sem triagem automática por intenção (interessado / não interessado / dúvida sobre salário / não é o momento certo). Um sistema de triagem que categoriza automaticamente as respostas e prioriza as de alta intenção poderia reduzir esse tempo em 50 a 70% sem perda de qualidade de relacionamento.

---

### 1.5 Hipóteses de atraso

**Hipótese 1 - Cap do LinkedIn cria gargalo estrutural de volume**

Com o limite de 30 mensagens por conta por dia, o teto semanal de outreach com 1 conta é 150 contatos. Para uma operação com 10 vagas simultâneas buscando 3 candidatos entregues por vaga por semana, são necessárias 300 conversões, o que requereria 3.000 outreaches semanais com taxa de 10%. A operação atual nem chega perto desse volume, o que significa que o atraso na entrega de candidatos é estrutural e não comportamental: o operador não pode trabalhar mais rápido porque o canal tem um teto físico.

**Hipótese 2 - Dependência de ação do cliente sem mecanismo de enforcement**

O Estágio 6 pode ficar parado por até 30 dias sem nenhum alerta automático. Sem visibilidade de aging por estágio, o operador não sabe quais vagas estão travadas por falta de feedback até que o cliente se manifeste ou até uma revisão manual do pipeline. Isso cria uma ilusão de progresso: tecnicamente candidatos foram entregues, mas a vaga não avança.

**Hipótese 3 - Falta de padronização no alinhamento com o cliente gera retrabalho no Estágio 3**

O alinhamento com o cliente ocorre via Slack/WhatsApp com SLA de 1 a 5 dias. Sem um template padronizado de briefing (critérios obrigatórios, faixas salariais, deal-breakers, preferências de perfil), é provável que o output do Estágio 3 seja um "feedback escrito sobre perfis" inconsistente entre clientes e entre operadores. Isso leva a ciclos de revisão no matching (Estágio 2) que não estão contabilizados nos SLAs declarados: um retrabalho invisível que consome tempo sem aparecer nas métricas.

---

### 1.6 Duplicidade

**Sim, existe duplicidade relevante em três dimensões:**

**Tipo A - Mesmo candidato em múltiplas vagas ativas simultaneamente**

Um candidato encontrado em buscas para roles similares (ex: Backend Engineer Pleno para dois clientes diferentes) pode entrar em duas cadências do LemList ao mesmo tempo, recebendo mensagens paralelas com abordagens diferentes. Além de confuso para o candidato, compromete a credibilidade da empresa.

**Tipo B - Recontato de candidato que já recusou ou não respondeu**

Sem um campo de `last_contacted_at` e `last_outcome` como constraint obrigatório no Prosieve, um candidato que recusou há 60 dias pode ser encontrado novamente em uma nova busca e reabordado como se fosse o primeiro contato.

**Tipo C - Perfil duplicado no shortlist enviado ao cliente**

Sem controle de versionamento e sem flag `already_sent_to_client` por candidato, o mesmo perfil pode aparecer em envios de semanas diferentes para o mesmo cliente, gerando percepção de falta de controle operacional.

**Como detectar:**

```sql
-- Candidatos em mais de uma sequência ativa simultaneamente
SELECT candidate_id, COUNT(DISTINCT sequence_id) AS active_sequences
FROM lemlist_enrollments
WHERE status = 'active'
GROUP BY candidate_id
HAVING COUNT(DISTINCT sequence_id) > 1;

-- Candidatos contatados há menos de 90 dias sendo adicionados a nova sequência
SELECT e.candidate_id, c.last_contacted_at, e.enrolled_at
FROM lemlist_enrollments e
JOIN candidates c ON e.candidate_id = c.id
WHERE e.enrolled_at - c.last_contacted_at < INTERVAL '90 days'
  AND c.last_contacted_at IS NOT NULL;
```

**Como tratar:**

- Definir `linkedin_url` e `email` como chaves únicas no Prosieve, com constraint de unicidade no banco
- Implementar regra de negócio pré-enrollment: verificar se candidato já está em qualquer sequência ativa antes de enrollar
- Cooldown obrigatório de 90 dias entre o último contato e qualquer novo enrollment
- Flag `sent_to_client_at` por candidato por vaga, verificado antes de incluir em qualquer novo shortlist

---

### 1.7 Viabilidade matemática da meta de candidatos

**Pergunta:** Com 10 vagas simultâneas, é possível entregar 3 candidatos por vaga por semana?

**Com 1 conta de LinkedIn: Não.**

| Parâmetro | Cálculo | Resultado |
|---|---|---|
| Meta de entrega | 10 vagas x 3 candidatos | 30 candidatos/semana |
| Taxa de conversão | 10% de outreach para resposta positiva | - |
| Outreaches necessários | 30 / 0,10 | 300 outreaches/semana |
| Cap LinkedIn (1 conta) | 30 mensagens/dia x 5 dias | 150 outreaches/semana |
| Candidatos entregues possíveis | 150 x 10% | **15 candidatos (1,5/vaga)** |

**Com 2 contas de LinkedIn:**

| Parâmetro | Cálculo | Resultado |
|---|---|---|
| Cap LinkedIn (2 contas) | 60 mensagens/dia x 5 dias | 300 outreaches/semana |
| Candidatos entregues possíveis | 300 x 10% | **30 candidatos (3/vaga)** |

Com 2 contas, a meta é matematicamente atingível, mas opera exatamente no limite, sem margem para dias de menor volume, respostas tardias ou candidatos reprovados pelo cliente.

**Tempo de trabalho estimado para 10 vagas com 2 contas:**

| Categoria | Cálculo | Tempo semanal (min) |
|---|---|---|
| Finding candidates | 10 vagas x 108 min | 1.080 |
| Messaging - enrollment | 2 contas x 10 min/dia x 5 dias | 100 |
| Messaging - respostas | 200 min/dia x 5 dias | 1.000 |
| Documenting | 100 min/dia x 5 dias | 500 |
| Meetings | 30 min/dia x 5 dias | 150 |
| **Total** | | **2.830 min (aprox. 47h/semana)** |

Isso confirma que atingir a meta com 1 operador é humanamente insustentável sem automação significativa, especialmente no tratamento de respostas (1.000 min/semana apenas para mensagens).

---

### 1.8 Métricas mínimas esperadas

#### As 5 principais métricas da operação

| # | Métrica | Definição | Valor razoável |
|---|---|---|---|
| 1 | **Outreach Conversion Rate** | Percentual de candidatos contatados que respondem positivamente (aceitam continuar o processo) | maior ou igual a 15% |
| 2 | **Time-to-First-Candidate (TTFC)** | Dias corridos entre o recebimento da vaga (Estágio 1) e o primeiro candidato enviado ao cliente (Estágio 5) | menor ou igual a 5 dias úteis |
| 3 | **Client Feedback SLA Compliance** | Percentual de feedbacks de clientes recebidos em até 7 dias após o envio do shortlist | maior ou igual a 80% |
| 4 | **Profiles Delivered per Role per Week** | Média de candidatos detalhados entregues ao cliente por vaga ativa por semana | maior ou igual a 3 |
| 5 | **Manual Hours per Active Role** | Horas de trabalho manual alocadas por vaga ativa por semana, excluindo tarefas automatizadas | menor ou igual a 2 horas |

**Justificativa de escolha das métricas:**

As métricas 1 e 4 medem diretamente a eficácia do pipeline de recrutamento: são as métricas que o cliente percebe. As métricas 2 e 3 medem a velocidade e a qualidade do ciclo de feedback, que impactam diretamente o NPS e a retenção de contratos. A métrica 5 é a única que mede eficiência interna e serve como indicador líder: se as horas manuais por vaga aumentam, é sinal de que algo no processo regrediu ou que o volume cresceu sem acompanhamento de automação.

---

## Parte 2 - Melhorias via Automação

As 4 automações foram priorizadas pelo critério de maior redução de trabalho manual no caminho crítico do processo (Finding + Messaging + Feedback loop), combinada com menor risco operacional de implementação.

---

### Automação 1 (Interna) - Auto-enrollment no LemList ao marcar candidato como "pronto para contato"

**Impacto estimado:** Alto
**Esforço estimado:** Médio
**Gargalo que resolve:** Delay entre matching e início do outreach; enrollment manual sujeito a esquecimento e erro humano

| Campo | Detalhe |
|---|---|
| **Gatilho** | Status do candidato no Prosieve muda para `pronto_para_contato` |
| **Regras** | Candidato possui `linkedin_url` ou `email` preenchido; candidato não está em nenhuma sequência ativa no LemList; último contato ocorreu há mais de 90 dias ou nunca houve contato; vaga associada está com status `ativa` |
| **Ação** | Webhook Prosieve dispara para n8n, que chama a API do LemList e enrola o candidato na sequência mapeada para o `role_id`, com variáveis personalizadas (nome, cargo atual, título da vaga, empresa do cliente) |
| **Exceções e riscos** | Candidato sem email e sem LinkedIn: bloquear enrollment, criar task no Notion com label `dados_incompletos`; candidato já em sequência ativa: skip com log de motivo `duplicate_sequence`; vaga pausada: mover candidato para fila de espera até reativação; API do LemList indisponível: retry 3x com backoff exponencial, após falha persistente criar task manual |
| **Rastreabilidade** | Tabela `automation_log` no Notion com campos: `log_id`, `timestamp`, `rule_applied`, `entity_id`, `job_id`, `sequence_id`, `status` (success/skipped/error/blocked), `reason`, `error_details` |
| **Métrica de sucesso** | Tempo médio de enrollment: de 5 a 10 min (manual) para menos de 30 segundos. Percentual de candidatos com enrollment no mesmo dia do status change: de 40% estimado para maior ou igual a 95%. Candidatos duplicados em sequências ativas: menor que 2% |

---

### Automação 2 (Interna) - SLA Watchdog com alertas de aging por estágio

**Impacto estimado:** Alto
**Esforço estimado:** Baixo
**Gargalo que resolve:** Aging invisível no Estágio 6 (feedback do cliente) e no Estágio 3 (alinhamento); ausência de visibilidade proativa de vagas travadas

| Campo | Detalhe |
|---|---|
| **Gatilho** | Cron diário executado às 9h, varrendo todos os candidatos ativos por estágio e comparando com o timestamp da última atualização |
| **Regras** | Estágio 3 sem update há mais de 3 dias: alerta amarelo (aviso ao operador); Estágio 6 sem update há mais de 7 dias: alerta vermelho (escalar para responsável pelo cliente); qualquer estágio 1 a 5 sem update há mais de 2 dias: alerta informativo; vaga com status `pausada`: suprimir todos os alertas |
| **Ação** | Notificação via Slack para o owner da vaga com nome da vaga, candidato(s) em espera, dias parado, estágio atual e link direto para o record no Prosieve; criação automática de task no Notion com due date igual a hoje e label `followup_sla` |
| **Exceções e riscos** | Idempotência por chave `(candidate_id, stage, alert_date)`: não reenviar o mesmo alerta mais de uma vez por dia; após 2 alertas consecutivos sem resolução, escalar para liderança; desabilitar alertas em feriados nacionais via calendário configurado |
| **Rastreabilidade** | Tabela `sla_breach_log` no Notion: `timestamp`, `job_id`, `candidate_id`, `stage`, `days_stuck`, `alert_level`, `alert_sent_to`, `resolved_at`, `resolved_by` |
| **Métrica de sucesso** | Aging médio no Estágio 6: de até 30 dias para menos de 10 dias. Percentual de SLAs resolvidos antes de atingir o máximo declarado: maior ou igual a 80% |

---

### Automação 3 (Cliente) - Entrega automática de shortlist via Slack ou WhatsApp

**Impacto estimado:** Alto
**Esforço estimado:** Médio
**Gargalo que resolve:** Preparação e envio manual de shortlist (30 a 80 min por envio); inconsistência de formato entre operadores; ausência de deadline explícito para feedback do cliente

| Campo | Detalhe |
|---|---|
| **Gatilho** | Três ou mais candidatos para uma mesma vaga são marcados como `aprovado_para_envio` no Prosieve, ou automaticamente toda sexta-feira às 16h para vagas com ao menos um candidato pronto não enviado |
| **Regras** | Somente candidatos com perfil completo são incluídos (nome, cargo atual, LinkedIn, nota de fit, resumo do matching gerado pelo Prosieve); cliente deve ter canal de comunicação configurado no cadastro da vaga (Slack channel ID ou número WhatsApp) |
| **Ação** | Geração automática de Google Sheets com dados padronizados dos candidatos; compartilhamento com o cliente via link com permissão de comentário; envio de mensagem no canal configurado informando o número de novos candidatos, o link do shortlist e a data limite sugerida para feedback (5 dias úteis a partir do envio) |
| **Exceções e riscos** | Perfil incompleto: candidato entra em fila `aguardando_dados` e não é incluído no envio; evitar reenvio do mesmo candidato verificando a flag `already_sent_to_client` por vaga; canal não configurado: criar task manual para o operador; não enviar em fins de semana ou feriados |
| **Rastreabilidade** | Tabela `client_delivery_log`: `timestamp`, `job_id`, `candidates_ids`, `sheet_url`, `channel`, `feedback_deadline`, `client_acknowledged`, `feedback_received_at` |
| **Métrica de sucesso** | Tempo de preparação e envio de shortlist: de 30 a 80 min para menos de 5 min. Percentual de feedback recebido até o prazo sugerido: referência inicial a ser medida nos primeiros 30 dias |

---

### Automação 4 (Cliente) - Reminder automático de feedback após envio do shortlist

**Impacto estimado:** Médio
**Esforço estimado:** Baixo
**Gargalo que resolve:** Aging no Estágio 6 por inação do cliente; ausência de mecanismo de follow-up sistemático sem depender de memória do operador

| Campo | Detalhe |
|---|---|
| **Gatilho** | 5 dias corridos após o envio do shortlist (registrado no `client_delivery_log`) sem nenhum feedback registrado no Prosieve para aquele envio |
| **Regras** | Máximo de 2 reminders automáticos por shortlist; após o 2º reminder sem resposta, criar task com flag `cliente_sem_resposta_escalado` para ação humana; verificar se o cliente já abriu o Google Sheets antes de enviar (via Drive activity API) e ajustar o tom da mensagem |
| **Ação** | 1º reminder (dia 5): mensagem amigável com link para formulário simplificado de feedback (três opções por candidato: Avançar, Rejeitar, Pendente); 2º reminder (dia 10): mensagem mais direta, informando que a vaga pode ter candidatos realocados por falta de retorno |
| **Exceções e riscos** | Se o cliente respondeu parcialmente, enviar reminder somente para os candidatos ainda pendentes; não enviar reminders em fins de semana ou feriados; se o cliente respondeu informalmente via Slack fora do sistema, o operador deve registrar o feedback manualmente para evitar reminder indevido |
| **Rastreabilidade** | Tabela `feedback_chase_log`: `timestamp`, `job_id`, `shortlist_id`, `reminder_number`, `channel`, `client_opened_sheet`, `resolved_at` |
| **Métrica de sucesso** | Percentual de feedbacks recebidos em até 7 dias após envio: meta maior ou igual a 80%. Aging médio no Estágio 6: redução de 30 dias para menos de 10 dias (compartilhada com Automação 2) |

---

## Parte 3 - Implementação V1

### Automação escolhida: Auto-enrollment no LemList (Automação 1)

**Justificativa de escolha:** Esta automação ataca o maior gargalo operacional mensurável: o tempo manual de adicionar candidatos ao LemList e o risco de delay ou esquecimento entre o matching e o início do outreach. É a automação com maior impacto direto na métrica principal (Profiles Delivered per Role per Week) e com idempotência clara de implementar. Além disso, é a base sobre a qual as demais automações dependem: sem outreach consistente e sem delay, o restante do pipeline não tem insumo.

---

### Spec Técnica - LemList Auto-Enrollment via Prosieve Webhook

**Stack:** Prosieve (webhook emitter) -> n8n (orquestrador) -> LemList API + Notion API

---

### Diagrama de estados do candidato

```
[novo]
  |
  v
[matched]
  |
  v
[revisado]
  |
  v
[pronto_para_contato] -----> [enrolled_lemlist] -----> [em_cadencia]
        |
        |-----> [blocked_no_contact_data]    (sem email e sem linkedin)
        |-----> [blocked_duplicate_sequence] (já em sequência ativa)
        |-----> [blocked_job_paused]         (vaga pausada)
        |-----> [queued_for_job_reactivation] (vaga temporariamente pausada)
```

---

### Fluxo de execução no n8n (pseudocódigo estruturado)

```
[Webhook Prosieve: POST /webhooks/candidate-status-changed]
  |
  v
[Node 1: Filter Trigger]
  Condição: event_type == "status_changed" AND new_status == "pronto_para_contato"
  Se não satisfeito: encerrar execução sem log (evento irrelevante)
  |
  v
[Node 2: Fetch Candidate Data]
  GET /prosieve/candidates/{candidate_id}
  Campos necessários: id, first_name, last_name, email, linkedin_url,
                      current_title, current_company, last_contacted_at,
                      active_sequences[], job_id
  |
  v
[Node 3: Fetch Job Data]
  GET /prosieve/jobs/{job_id}
  Campos necessários: id, title, status, sequence_id (mapeado no cadastro da vaga)
  |
  v
[Node 4: Idempotency Check]
  Query Notion automation_log:
    WHERE entity_id = candidate_id
      AND rule_applied = "lemlist_enrollment"
      AND sequence_id = job.sequence_id
      AND status = "success"
      AND timestamp > NOW() - 90 days
  Se encontrado: SKIP -> log reason="idempotency_check_failed" -> encerrar
  |
  v
[Node 5: Validation Gate - Contact Data]
  Se candidate.email == null AND candidate.linkedin_url == null:
    -> Update Prosieve status: "blocked_no_contact_data"
    -> Create Notion task: "Completar dados de contato - {candidate_id}"
    -> Log: status=blocked, reason=no_contact_data
    -> Encerrar
  |
  v
[Node 6: Validation Gate - Job Status]
  Se job.status == "pausada":
    -> Update Prosieve status: "queued_for_job_reactivation"
    -> Log: status=skipped, reason=job_paused
    -> Encerrar
  Se job.sequence_id == null:
    -> Create Notion task: "Mapear sequência para vaga {job_id}"
    -> Log: status=blocked, reason=sequence_not_mapped
    -> Encerrar
  |
  v
[Node 7: LemList Duplicate Check]
  GET /lemlist/sequences?email={candidate.email}
  Se candidate já está em sequência ativa (status != "completed" e != "stopped"):
    -> Log: status=skipped, reason=duplicate_active_sequence
    -> Encerrar
  |
  v
[Node 8: Cooldown Check]
  Se candidate.last_contacted_at != null:
    Se (NOW() - candidate.last_contacted_at) < 90 dias:
      -> Log: status=skipped, reason=cooldown_active, last_contact=candidate.last_contacted_at
      -> Encerrar
  |
  v
[Node 9: Determine Sequence Type]
  Se candidate.email != null: sequence_type = "email_and_linkedin"
  Se candidate.email == null E candidate.linkedin_url != null: sequence_type = "linkedin_only"
  |
  v
[Node 10: Enroll in LemList]
  POST /lemlist/sequences/{job.sequence_id}/leads
  Headers: X-Idempotency-Key: SHA256(candidate_id + job.sequence_id + week_number)
  Payload: ver exemplo abaixo
  |
  |--> SUCCESS (201):
  |      -> Update Prosieve candidate status: "enrolled_lemlist"
  |      -> Update candidate.last_contacted_at: NOW()
  |      -> Log: status=success
  |
  |--> ERROR (4xx ou 5xx):
  |         -> Retry 3x com backoff: 5s, 15s, 45s
  |         -> Se persistir:
  |             -> Create Notion task: "Enrollment falhou - {candidate_id} - {error_code}"
  |             -> Log: status=error, error_details=response_body
```

---

### Exemplos de payload

**Webhook de entrada (Prosieve -> n8n):**

```json
{
  "event_type": "status_changed",
  "timestamp": "2026-03-08T09:14:32Z",
  "candidate_id": "cand_0482",
  "previous_status": "revisado",
  "new_status": "pronto_para_contato",
  "job_id": "job_0091",
  "changed_by": "ops_user_3"
}
```

**Dados do candidato (resposta do Prosieve):**

```json
{
  "candidate_id": "cand_0482",
  "first_name": "Ana",
  "last_name": "Silva",
  "email": "ana.silva@email.com",
  "linkedin_url": "https://linkedin.com/in/anasilva",
  "current_title": "Backend Engineer",
  "current_company": "TechCorp",
  "last_contacted_at": null,
  "active_sequences": [],
  "job_id": "job_0091"
}
```

**Payload de enrollment enviado ao LemList:**

```json
{
  "email": "ana.silva@email.com",
  "firstName": "Ana",
  "lastName": "Silva",
  "linkedinUrl": "https://linkedin.com/in/anasilva",
  "currentTitle": "Backend Engineer",
  "currentCompany": "TechCorp",
  "vagaId": "job_0091",
  "vagaTitle": "Senior Backend Engineer",
  "clientName": "Empresa XYZ",
  "sequenceType": "email_and_linkedin",
  "deduplicate": true
}
```

**Resposta de sucesso do LemList:**

```json
{
  "leadId": "lead_8821",
  "sequenceId": "seq_backend_senior",
  "status": "enrolled",
  "firstStepScheduledAt": "2026-03-09T10:00:00Z"
}
```

---

### Prevenção de execução duplicada (idempotência)

A idempotência é garantida em três camadas independentes:

**Camada 1 - Checagem no automation_log antes de qualquer ação (Node 4):**
Antes de executar qualquer validação ou chamada de API, a automação consulta o log histórico para verificar se aquela combinação de `candidate_id + sequence_id` já foi processada com sucesso nos últimos 90 dias. Se sim, encerra imediatamente.

**Camada 2 - Header de idempotência na chamada ao LemList (Node 10):**

```
X-Idempotency-Key: SHA256(candidate_id + sequence_id + week_number)
```

Se a chamada for reprocessada por qualquer motivo (retry, re-execução manual do webhook), o LemList reconhece a chave e não cria um enrollment duplicado.

**Camada 3 - Flag `deduplicate: true` no payload:**
O próprio LemList oferece um parâmetro nativo de deduplicação por email. É a última linha de defesa caso as camadas anteriores falhem.

---

### Tratamento de dados faltantes

| Cenário | Verificação | Ação da automação | Status final do candidato |
|---|---|---|---|
| Sem email E sem LinkedIn | Node 5 | Bloquear; criar task Notion `dados_incompletos`; log com reason | `blocked_no_contact_data` |
| Sem email, COM LinkedIn | Node 9 | Enrollar somente em sequência `linkedin_only` (sem steps de email) | `enrolled_lemlist` |
| Sem nome (firstName null) | Node 10 (pré-envio) | Substituir por fallback `"Candidato"`; adicionar flag `name_fallback: true` no log para revisão humana | `enrolled_lemlist` (com alerta) |
| job_id sem sequência mapeada | Node 6 | Bloquear; criar task Notion `sequencia_nao_mapeada`; log com reason | `blocked_no_sequence` |
| LemList API com timeout ou 5xx | Node 10 | Retry 3x (5s, 15s, 45s); após falha persistente, criar task e logar erro com response body | Candidato permanece em `pronto_para_contato` até resolução manual |
| Vaga pausada | Node 6 | Mover para fila de espera; log com reason | `queued_for_job_reactivation` |
| Candidato em cooldown (contatado há menos de 90 dias) | Node 8 | Skip; log com data do último contato | Status não alterado |

---

### Tabela de log - Notion "Automation Log"

| Campo | Tipo | Exemplo |
|---|---|---|
| `log_id` | UUID gerado pelo n8n | `log_7f3a2c91` |
| `timestamp` | ISO 8601 | `2026-03-08T09:14:38Z` |
| `rule_applied` | String enum | `lemlist_enrollment` |
| `entity_id` | String | `cand_0482` |
| `job_id` | String | `job_0091` |
| `sequence_id` | String | `seq_backend_senior` |
| `sequence_type` | String | `email_and_linkedin` ou `linkedin_only` |
| `status` | Enum | `success`, `skipped`, `error`, `blocked` |
| `reason` | String | `enrolled`, `duplicate_active_sequence`, `no_contact_data`, `cooldown_active`, `job_paused`, `idempotency_check_failed` |
| `name_fallback_used` | Boolean | `false` |
| `changed_by` | String | `automation_v1_lemlist_enrollment` |
| `error_details` | Text | Corpo da resposta de erro da API (se aplicável) |
| `resolved_at` | DateTime | Preenchido manualmente pelo operador após resolução de task |

---

### Métricas de sucesso - antes e depois

| Métrica | Estado atual (estimado) | Meta em 30 dias |
|---|---|---|
| Tempo médio de enrollment por candidato | 5 a 10 minutos (manual, em lotes) | Menos de 30 segundos |
| Percentual de candidatos com enrollment no mesmo dia do status change | 40% (dependente de atenção humana) | Maior ou igual a 95% |
| Candidatos duplicados em sequências ativas | Não monitorado | Menor que 2% |
| Enrollments com dados incompletos que causaram erro silencioso | Não monitorado | Zero (todos bloqueados antes do enrollment) |
| Tasks manuais criadas por falha de dados | Não monitorado | Rastreadas no Notion; meta de resolução em menos de 1 dia útil |

---

### Considerações finais

A automação de enrollment no LemList foi escolhida como V1 porque resolve o gargalo mais imediato (delay e inconsistência no início do outreach), tem risco operacional controlado (não envia nada sem validação prévia), e gera rastreabilidade desde o primeiro dia. O impacto esperado é uma redução imediata no tempo de ativação de candidatos e uma base de dados de log que alimenta as demais automações, especialmente o SLA Watchdog (Automação 2), que depende de timestamps confiáveis de status change para calcular aging corretamente.

As quatro automações propostas, implementadas em sequência, reduzem o workload diário estimado de 721 minutos para aproximadamente 420 a 450 minutos, dentro de uma jornada de 8 horas, e criam as condições operacionais para escalar o volume de vagas simultâneas sem crescimento linear de headcount.
