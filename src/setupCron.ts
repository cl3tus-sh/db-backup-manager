import { execSync } from 'child_process';
// Ensure logs directory exists
import fs from 'fs';
import path from 'path';

import { config } from './config';

// Get the absolute path to the project root
const projectRoot = process.cwd();
const nodePath = process.execPath; // Automatically detects the Node.js path

// Configurable log directory (fallback to project root if not set)
const logDir = config.cron.log_path || path.join(projectRoot, 'logs');
const logFile = path.join(logDir, 'backup.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const cronMap: Record<string, string> = {
  daily: '0 2 * * *', // Every day at 2 AM
  weekly: '0 2 * * 1', // Every Monday at 2 AM
  monthly: '0 2 1 * *', // Every 1st of the month at 2 AM
};

function setupCron() {
  if (!config.cron.enabled) {
    console.log('❌ Cron jobs are disabled in config.yml.');
    return;
  }

  const schedule = cronMap[config.cron.schedule];
  if (!schedule) {
    console.error('❌ Invalid cron schedule in config.yml.');
    process.exit(1);
  }

  // Use dynamic paths instead of hardcoded values
  const command = `${nodePath} ${projectRoot}/dist/index.js >> ${logFile} 2>&1`;
  const cronJob = `${schedule} ${command}`;

  try {
    execSync(`(crontab -l 2>/dev/null; echo "${cronJob}") | crontab -`);
    console.log(`✅ Cron job set up successfully: ${cronJob}`);
  } catch (error) {
    console.error('❌ Failed to set up cron job:', (error as Error).message);
  }
}

setupCron();
