import { config } from './config';
import { deleteOldBackups } from './modules/deleteOldBackups';
import { sendDiscordNotification } from './modules/discord';
import { uploadToGoogleDrive } from './modules/googleDrive';
import { runMongoBackup } from './modules/mongoBackup';
import { runPostgresBackup } from './modules/postgresBackup';
import { sendToRemote } from './modules/transfer';

async function main() {
  console.log('🚀 Starting database backups...');

  const backupResults: { name: string; engine: string; status: string }[] = [];
  let overallSuccess = true;

  // PostgreSQL Backups
  if (config.databases.postgres) {
    for (const dbName of Object.keys(config.databases.postgres)) {
      console.log(`📌 Backing up PostgreSQL: ${dbName}`);
      try {
        const file = await runPostgresBackup(dbName);
        await sendToRemote(file);
        await uploadToGoogleDrive(file);
        await deleteOldBackups(file);
        console.log(`✅ PostgreSQL backup completed: ${dbName}`);
        backupResults.push({ name: dbName, engine: 'PostgreSQL', status: '✅ Success' });
      } catch {
        console.error(`❌ PostgreSQL backup failed: ${dbName}`);
        backupResults.push({ name: dbName, engine: 'PostgreSQL', status: '❌ Failed' });
        overallSuccess = false;
      }
    }
  }

  // MongoDB Backups
  if (config.databases.mongodb) {
    for (const dbName of Object.keys(config.databases.mongodb)) {
      try {
        console.log(`📌 Backing up MongoDB: ${dbName}`);
        const file = await runMongoBackup(dbName);
        await sendToRemote(file);
        await uploadToGoogleDrive(file);
        await deleteOldBackups(file);
        console.log(`✅ MongoDB backup completed: ${dbName}`);
        backupResults.push({ name: dbName, engine: 'MongoDB', status: '✅ Success' });
      } catch {
        console.error(`❌ MongoDB backup failed: ${dbName}`);
        backupResults.push({ name: dbName, engine: 'MongoDB', status: '❌ Failed' });
        overallSuccess = false;
      }
    }
  }

  await sendDiscordNotification(overallSuccess, backupResults);
  console.log(overallSuccess ? '🎉 All backups completed!' : '❌ Some backups failed.');

  if (!overallSuccess) {
    process.exit(1);
  }
}

main();
