#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dayjs from 'dayjs';
import chalk from 'chalk';
import { analyze } from './analyzer.js';
import { printReport, formatSlackMessage } from './reporter.js';
import { sendSlackNotification } from './slack-notifier.js';
import { OUTPUT_DIR } from './config.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function loadPipelineData(customPath) {
  const dataPath = customPath || path.resolve(__dirname, '..', 'data', 'mock-pipeline.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function persistBreachLog(result, now) {
  const outputDir = fileURLToPath(OUTPUT_DIR);
  fs.mkdirSync(outputDir, { recursive: true });

  const filename = `sla-breach-${now.format('YYYY-MM-DD')}.json`;
  const filePath = path.join(outputDir, filename);

  const output = {
    generated_at: now.toISOString(),
    summary: result.stats,
    breaches: result.breaches.map(({ is_duplicate, idempotency_key, ...rest }) => rest),
  };

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
  return filePath;
}

async function main() {
  const args = process.argv.slice(2);
  const enableSlack = args.includes('--slack');
  const dataPathArg = args.find((a) => a.startsWith('--data='));
  const customDataPath = dataPathArg ? dataPathArg.split('=')[1] : null;

  const now = dayjs();

  console.log(chalk.dim(`[${now.format('YYYY-MM-DD HH:mm:ss')}] SLA Watchdog iniciado`));

  const pipelineData = await loadPipelineData(customDataPath);
  const result = analyze(pipelineData, now);

  printReport(result);

  const logPath = persistBreachLog(result, now);
  console.log(chalk.dim(`Log salvo em: ${logPath}`));

  if (enableSlack) {
    const slackMessage = formatSlackMessage(result);
    const slackResult = await sendSlackNotification(slackMessage);

    if (slackResult.sent) {
      console.log(chalk.green('Notificação Slack enviada com sucesso.'));
    } else if (slackResult.reason === 'SLACK_WEBHOOK_URL not configured') {
      console.log(chalk.yellow('Slack: SLACK_WEBHOOK_URL não configurada. Pulando notificação.'));
    } else if (slackResult.reason === 'no_message') {
      console.log(chalk.dim('Slack: nenhum alerta critical — notificação não enviada.'));
    } else {
      console.log(chalk.red(`Slack: falha ao enviar — ${slackResult.reason}`));
    }
  }

  console.log();
  if (result.stats.by_level.critical > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(chalk.red('Erro fatal:'), err);
  process.exitCode = 2;
});
