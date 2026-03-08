/**
 * SLA thresholds extracted from Automação 2 spec (README.md).
 *
 * Each stage maps to:
 *   - thresholdDays: max days without update before an alert fires
 *   - level: alert severity (info | warning | critical)
 *   - description: human-readable stage name
 */
export const SLA_RULES = {
  1: { thresholdDays: 2, level: 'info',     description: 'Registro da vaga' },
  2: { thresholdDays: 2, level: 'info',     description: 'Matching algorítmico' },
  3: { thresholdDays: 3, level: 'warning',  description: 'Alinhamento com cliente' },
  4: { thresholdDays: 2, level: 'info',     description: 'Outreach' },
  5: { thresholdDays: 2, level: 'info',     description: 'Envio de candidatos' },
  6: { thresholdDays: 7, level: 'critical', description: 'Feedback do cliente' },
};

export const ESCALATION_THRESHOLD = 2;

export const SUPPRESSED_JOB_STATUSES = ['pausada'];

export const OUTPUT_DIR = new URL('../output/', import.meta.url);

export const ALERT_LEVELS = ['info', 'warning', 'critical'];

export const LEVEL_PRIORITY = { info: 0, warning: 1, critical: 2 };
