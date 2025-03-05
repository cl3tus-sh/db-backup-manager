import axios from 'axios';

import { config } from '../config';

const COLORS = {
  success: 0x2ecc71, // Green
  failure: 0xe74c3c, // Red
};

export async function sendDiscordNotification(
  success: boolean,
  databases: { name: string; engine: string; status: string }[],
): Promise<void> {
  if (!config.discord.enabled) return;

  const title = success ? '✅ Database Backups Successful' : '❌ Database Backups Failed';
  const color = success ? COLORS.success : COLORS.failure;

  const description = databases
    .map((db) => `- **${db.name}** (${db.engine}) → ${db.status}`)
    .join('\n');

  const message = {
    embeds: [
      {
        title,
        description,
        color,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(config.discord.webhook_url, message);
    console.log(`📢 Sent Discord notification: ${title}`);
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', (error as Error).message);
  }
}

export async function checkDiscordWebhook() {
  console.log('🔍 Checking Discord webhook...');

  if (!config.discord.enabled) {
    console.log('⚠️ Discord notifications are disabled in config.yml.');
    return;
  }

  try {
    await axios.post(config.discord.webhook_url, {
      content: '🔍 Test message: Checking Discord webhook connection.',
    });

    console.log('✅ Discord webhook is working correctly.');
  } catch (error) {
    console.error(`❌ Discord webhook check failed: ${error}`);
  }
}
