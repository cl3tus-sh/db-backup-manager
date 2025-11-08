// Run all checks
import { checkDiscordWebhook } from './modules/discord';
import { checkGoogleDrive } from './modules/googleDrive';
import { checkMongoConnections } from './modules/mongoBackup';
import { checkPostgresConnections } from './modules/postgresBackup';
import { checkRemoteServer } from './modules/transfer';
import { checkCloudflare } from './modules/cloudflare';

async function runChecks() {
  console.log('\n🛠️ Running configuration checks...\n');

  await checkPostgresConnections();
  await checkMongoConnections();
  await checkDiscordWebhook();
  await checkGoogleDrive();
  await checkCloudflare();
  await checkRemoteServer();

  console.log('\n✅ Configuration checks completed.\n');
}

runChecks();
