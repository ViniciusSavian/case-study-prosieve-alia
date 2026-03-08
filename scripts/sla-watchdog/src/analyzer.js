import dayjs from 'dayjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SLA_RULES,
  ESCALATION_THRESHOLD,
  SUPPRESSED_JOB_STATUSES,
  OUTPUT_DIR,
  LEVEL_PRIORITY,
} from './config.js';

function buildJobIndex(jobs) {
  const index = new Map();
  for (const job of jobs) {
    index.set(job.id, job);
  }
  return index;
}

function loadPreviousBreaches(today) {
  const outputDir = fileURLToPath(OUTPUT_DIR);
  const filePath = path.join(outputDir, `sla-breach-${today}.json`);

  if (!fs.existsSync(filePath)) return new Set();

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const keys = new Set();
  for (const b of data.breaches ?? []) {
    keys.add(`${b.candidate_id}:${b.stage}:${today}`);
  }
  return keys;
}

/**
 * Analyzes all candidates against SLA thresholds.
 * Returns { breaches, suppressed, healthy, stats }.
 */
export function analyze(pipelineData, now = dayjs()) {
  const today = now.format('YYYY-MM-DD');
  const jobIndex = buildJobIndex(pipelineData.jobs);
  const existingKeys = loadPreviousBreaches(today);

  const breaches = [];
  const suppressed = [];
  const healthy = [];

  for (const candidate of pipelineData.candidates) {
    const job = jobIndex.get(candidate.job_id);
    if (!job) continue;

    if (SUPPRESSED_JOB_STATUSES.includes(job.status)) {
      suppressed.push({ candidate, job, reason: `vaga ${job.status}` });
      continue;
    }

    const rule = SLA_RULES[candidate.current_stage];
    if (!rule) continue;

    const enteredAt = dayjs(candidate.stage_entered_at);
    const daysStuck = now.diff(enteredAt, 'day', true);
    const daysStuckRounded = Math.floor(daysStuck);

    if (daysStuck <= rule.thresholdDays) {
      healthy.push({ candidate, job, daysStuck: daysStuckRounded, rule });
      continue;
    }

    const idempotencyKey = `${candidate.id}:${candidate.current_stage}:${today}`;
    const isDuplicate = existingKeys.has(idempotencyKey);

    const previousAlerts = candidate.previous_alerts_count ?? 0;
    const shouldEscalate =
      rule.level === 'critical' && previousAlerts >= ESCALATION_THRESHOLD;

    breaches.push({
      timestamp: now.toISOString(),
      job_id: job.id,
      job_title: job.title,
      client: job.client,
      candidate_id: candidate.id,
      candidate_name: candidate.name,
      stage: candidate.current_stage,
      stage_description: rule.description,
      days_stuck: daysStuckRounded,
      alert_level: rule.level,
      alert_sent_to: job.owner,
      escalate_to_leadership: shouldEscalate,
      idempotency_key: idempotencyKey,
      is_duplicate: isDuplicate,
    });
  }

  breaches.sort(
    (a, b) =>
      LEVEL_PRIORITY[b.alert_level] - LEVEL_PRIORITY[a.alert_level] ||
      b.days_stuck - a.days_stuck
  );

  const newBreaches = breaches.filter((b) => !b.is_duplicate);

  const stats = {
    total_candidates_analyzed: pipelineData.candidates.length,
    total_breaches: newBreaches.length,
    total_suppressed: suppressed.length,
    total_healthy: healthy.length,
    by_level: {
      critical: newBreaches.filter((b) => b.alert_level === 'critical').length,
      warning: newBreaches.filter((b) => b.alert_level === 'warning').length,
      info: newBreaches.filter((b) => b.alert_level === 'info').length,
    },
    avg_days_stuck:
      newBreaches.length > 0
        ? +(
            newBreaches.reduce((sum, b) => sum + b.days_stuck, 0) /
            newBreaches.length
          ).toFixed(1)
        : 0,
  };

  return { breaches: newBreaches, allBreaches: breaches, suppressed, healthy, stats };
}
