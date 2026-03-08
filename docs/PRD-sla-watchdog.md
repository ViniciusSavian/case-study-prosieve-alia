# PRD — SLA Watchdog (Automação 2)

## Visão geral

Script Node.js que monitora o aging de candidatos por estágio do pipeline de recrutamento, gera alertas classificados por severidade, e opcionalmente notifica via Slack. Substitui a revisão manual diária do pipeline, que depende da memória do operador e não escala com o volume de vagas.

## Problema

O pipeline de recrutamento possui 6 estágios com SLAs distintos. Os estágios 3 (alinhamento com cliente) e 6 (feedback do cliente) são os que mais sofrem com aging invisível — candidatos ficam parados sem que ninguém perceba. O Estágio 6 pode ficar até 30 dias sem ação, causando perda de candidatos (que aceitam outras ofertas) e ilusão de progresso operacional.

Não existe nenhum mecanismo automático de detecção ou alerta. A identificação depende de revisão manual ou da manifestação espontânea do cliente.

## Solução

Um script executável via CLI ou cron que:

1. Lê dados do pipeline (mock JSON para demonstração, substituível por API)
2. Calcula o tempo de permanência de cada candidato ativo no estágio atual
3. Aplica regras de threshold por estágio
4. Gera relatório no console com cores por severidade
5. Persiste log de breaches em arquivo JSON
6. Envia notificação Slack (opcional, via webhook)

## Regras de negócio

### Thresholds de alerta por estágio

| Estágio | Descrição | Threshold | Nível |
|---|---|---|---|
| 1 | Registro da vaga | > 2 dias | info |
| 2 | Matching algorítmico | > 2 dias | info |
| 3 | Alinhamento com cliente | > 3 dias | warning |
| 4 | Outreach | > 2 dias | info |
| 5 | Envio de candidatos | > 2 dias | info |
| 6 | Feedback do cliente | > 7 dias | critical |

### Regras adicionais

- **Vagas pausadas**: suprimir todos os alertas para candidatos vinculados a vagas com status `pausada`
- **Idempotência**: chave composta `(candidate_id, stage, alert_date)` — não gerar o mesmo alerta mais de uma vez por dia
- **Escalação**: após 2 alertas consecutivos sem resolução no Estágio 6, flag `escalate_to_leadership: true`

## Requisitos funcionais

| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-01 | Ler dados de candidatos de arquivo JSON | Script executa com mock data sem erro |
| RF-02 | Calcular dias parados por estágio | Resultado correto para datas passadas, hoje, e edge cases |
| RF-03 | Aplicar thresholds diferenciados por estágio | Estágio 3 usa 3 dias, Estágio 6 usa 7 dias, demais usam 2 dias |
| RF-04 | Classificar alertas em 3 níveis (info, warning, critical) | Output mostra níveis corretos por candidato |
| RF-05 | Suprimir alertas de vagas pausadas | Candidatos em vagas pausadas não aparecem nos alertas |
| RF-06 | Gerar relatório colorido no console | Vermelho para critical, amarelo para warning, cinza para info |
| RF-07 | Persistir log de breaches em JSON | Arquivo criado em `output/sla-breach-YYYY-MM-DD.json` |
| RF-08 | Enviar notificação Slack (opcional) | Se `SLACK_WEBHOOK_URL` definida, envia resumo dos criticals |
| RF-09 | Idempotência diária | Re-executar no mesmo dia não duplica alertas no log |
| RF-10 | Resumo estatístico | Exibir totais por nível e tempo médio de aging |

## Requisitos não-funcionais

- Execução completa em < 2 segundos com dataset de até 1.000 candidatos
- Zero dependências de serviços externos para funcionar (Slack é opcional)
- Compatível com cron (`crontab -e`) para execução diária às 9h
- Logs estruturados em JSON para integração futura com sistemas de monitoramento

## Schema de dados

### Input: Pipeline data (`mock-pipeline.json`)

```json
{
  "jobs": [
    {
      "id": "job_001",
      "title": "Senior Backend Engineer",
      "client": "TechCorp",
      "status": "ativa",
      "owner": "ops_user_1",
      "sequence_id": "seq_backend_senior"
    }
  ],
  "candidates": [
    {
      "id": "cand_001",
      "name": "Ana Silva",
      "job_id": "job_001",
      "current_stage": 6,
      "stage_entered_at": "2026-02-25T10:00:00Z",
      "last_updated_at": "2026-02-25T10:00:00Z"
    }
  ]
}
```

### Output: Breach log (`sla-breach-YYYY-MM-DD.json`)

```json
{
  "generated_at": "2026-03-08T09:00:00Z",
  "summary": {
    "total_candidates_analyzed": 18,
    "total_breaches": 5,
    "by_level": { "critical": 2, "warning": 1, "info": 2 }
  },
  "breaches": [
    {
      "timestamp": "2026-03-08T09:00:00Z",
      "job_id": "job_001",
      "job_title": "Senior Backend Engineer",
      "candidate_id": "cand_001",
      "candidate_name": "Ana Silva",
      "stage": 6,
      "days_stuck": 11,
      "alert_level": "critical",
      "alert_sent_to": "ops_user_1",
      "escalate_to_leadership": true
    }
  ]
}
```

## Métricas de sucesso

| Métrica | Antes | Meta |
|---|---|---|
| Aging médio no Estágio 6 | Até 30 dias | < 10 dias |
| SLAs resolvidos antes do máximo | Não monitorado | >= 80% |
| Tempo para detectar vaga travada | Dias (revisão manual) | < 1 hora (cron diário) |

## Fora de escopo (V1)

- Integração direta com Prosieve API (usa mock data)
- Criação automática de tasks no Notion
- Dashboard web
- Alertas por WhatsApp
- Calendário de feriados para supressão
