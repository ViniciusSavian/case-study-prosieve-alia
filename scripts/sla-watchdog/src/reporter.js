import chalk from 'chalk';
import { SLA_RULES } from './config.js';

const LEVEL_STYLES = {
  critical: { badge: chalk.bgRed.white.bold(' CRITICAL '), text: chalk.red },
  warning:  { badge: chalk.bgYellow.black.bold(' WARNING  '), text: chalk.yellow },
  info:     { badge: chalk.bgGray.white(' INFO     '), text: chalk.gray },
};

function hr() {
  return chalk.dim('─'.repeat(72));
}

export function printReport({ breaches, suppressed, healthy, stats }) {
  console.log();
  console.log(chalk.bold.cyan('╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║           SLA WATCHDOG — Relatório de Aging                  ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════════╝'));
  console.log();

  console.log(chalk.bold('Resumo'));
  console.log(hr());
  console.log(`  Candidatos analisados:  ${chalk.bold(stats.total_candidates_analyzed)}`);
  console.log(`  Em breach (novos):      ${chalk.bold.red(stats.total_breaches)}`);
  console.log(`  Saudáveis:              ${chalk.bold.green(stats.total_healthy)}`);
  console.log(`  Suprimidos (pausadas):  ${chalk.bold.dim(stats.total_suppressed)}`);
  console.log(`  Aging médio (breach):   ${chalk.bold(stats.avg_days_stuck)} dias`);
  console.log();
  console.log(`  ${chalk.red('●')} Critical: ${stats.by_level.critical}    ${chalk.yellow('●')} Warning: ${stats.by_level.warning}    ${chalk.gray('●')} Info: ${stats.by_level.info}`);
  console.log();

  if (breaches.length === 0) {
    console.log(chalk.green.bold('  ✓ Nenhum breach de SLA detectado. Pipeline saudável.'));
    console.log();
    return;
  }

  console.log(chalk.bold('Breaches de SLA'));
  console.log(hr());

  for (const breach of breaches) {
    const style = LEVEL_STYLES[breach.alert_level];
    const escalation = breach.escalate_to_leadership
      ? chalk.red.bold(' ⚠ ESCALAR PARA LIDERANÇA')
      : '';

    console.log();
    console.log(`  ${style.badge}  ${style.text.bold(breach.candidate_name)} (${breach.candidate_id})`);
    console.log(`  ${chalk.dim('Vaga:')}      ${breach.job_title} — ${breach.client} (${breach.job_id})`);
    console.log(`  ${chalk.dim('Estágio:')}   ${breach.stage} - ${breach.stage_description}`);
    console.log(`  ${chalk.dim('Parado:')}    ${style.text(breach.days_stuck + ' dias')} (threshold: ${SLA_RULES[breach.stage].thresholdDays} dias)`);
    console.log(`  ${chalk.dim('Owner:')}     ${breach.alert_sent_to}${escalation}`);
  }

  console.log();
  console.log(hr());

  if (suppressed.length > 0) {
    console.log();
    console.log(chalk.dim.bold('Suprimidos (vagas pausadas)'));
    console.log(hr());
    for (const s of suppressed) {
      console.log(chalk.dim(`  ○ ${s.candidate.name} (${s.candidate.id}) — ${s.job.title} [${s.reason}]`));
    }
    console.log();
  }
}

export function formatSlackMessage({ breaches, stats }) {
  const criticals = breaches.filter((b) => b.alert_level === 'critical');

  if (criticals.length === 0) {
    return null;
  }

  const header = `🚨 *SLA Watchdog — ${stats.total_breaches} breach(es) detectado(s)*\n`;
  const summary = `Critical: ${stats.by_level.critical} | Warning: ${stats.by_level.warning} | Info: ${stats.by_level.info}\n\n`;

  const lines = criticals.map((b) => {
    const escalation = b.escalate_to_leadership ? ' ⚠️ *ESCALAR*' : '';
    return `• *${b.candidate_name}* — Estágio ${b.stage} (${b.stage_description}) — *${b.days_stuck} dias* parado — Vaga: ${b.job_title} (${b.client})${escalation}`;
  });

  return header + summary + lines.join('\n');
}
