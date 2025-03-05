import { exec, execSync } from 'child_process';
import { promisify } from 'util';

import { config } from '../config';

const execPromise = promisify(exec);

export async function sendToRemote(filePath: string): Promise<void> {
  if (!config.remote_server.enabled) return;

  const { user, host, path, password, method } = config.remote_server;
  const command =
    method === 'rsync'
      ? `rsync -avz ${filePath} ${user}@${host}:${path}`
      : `sshpass -p '${password}' scp ${filePath} ${user}@${host}:${path}`;

  await execPromise(command);
}

export async function checkRemoteServer() {
  console.log('🔍 Checking remote server access...');
  const { enabled, host, user } = config.remote_server;

  if (!enabled) {
    console.log('⚠️ Remote server backup is disabled in config.yml.');
    return;
  }

  try {
    execSync(`ssh -o BatchMode=yes -o ConnectTimeout=5 ${user}@${host} "echo 'SSH Test'"`, {
      stdio: 'ignore',
    });
    console.log(`✅ Remote server SSH connection successful: ${host}`);
  } catch (error) {
    console.error(`❌ Remote server SSH connection failed: ${error}`);
  }
}
