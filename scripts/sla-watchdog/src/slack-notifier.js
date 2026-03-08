/**
 * Sends a Slack notification via incoming webhook.
 * Only fires when SLACK_WEBHOOK_URL is set as an environment variable.
 */
export async function sendSlackNotification(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return { sent: false, reason: 'SLACK_WEBHOOK_URL not configured' };
  }

  if (!message) {
    return { sent: false, reason: 'no_message' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { sent: false, reason: `slack_error_${response.status}`, details: body };
    }

    return { sent: true };
  } catch (err) {
    return { sent: false, reason: 'network_error', details: err.message };
  }
}
