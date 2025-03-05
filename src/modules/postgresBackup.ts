import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { config } from '../config';

const execPromise = promisify(exec);

export async function runPostgresBackup(dbName: string): Promise<string> {
  const dbConfig = config.databases.postgres[dbName];
  const { user, password, host, port, database, backup_path } = dbConfig;

  if (!fs.existsSync(backup_path)) {
    fs.mkdirSync(backup_path, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${database}-${timestamp}.sql`;
  const backupFilePath = path.join(backup_path, backupFileName);

  // Construct the command dynamically, avoiding empty credentials
  let dumpCommand = `pg_dump -h ${host} -p ${port} -d ${database} -F c -f ${backupFilePath}`;

  if (user) dumpCommand = `PGUSER="${user}" ` + dumpCommand;
  if (password) dumpCommand = `PGPASSWORD="${password}" ` + dumpCommand;

  console.log(`📌 Backing up PostgreSQL database: ${database} -> ${backupFilePath}`);

  try {
    await execPromise(dumpCommand);
    console.log(`✅ PostgreSQL backup completed successfully: ${backupFilePath}`);
    return backupFilePath;
  } catch (error) {
    console.error(`❌ PostgreSQL backup failed: ${(error as Error).message}`);
    throw error;
  }
}

export async function checkPostgresConnections() {
  console.log('🔍 Checking PostgreSQL connections...');
  for (const dbName of Object.keys(config.databases.postgres)) {
    const { user, password, host, port, database } = config.databases.postgres[dbName];

    try {
      const command = `PGPASSWORD="${password}" psql -U ${user} -h ${host} -p ${port} -d ${database} -c "SELECT 1;"`;
      execSync(command, { stdio: 'ignore' });
      console.log(`✅ PostgreSQL connection successful: ${dbName}`);
    } catch (error) {
      console.error(`❌ PostgreSQL connection failed for database ${dbName}: ${error}`);
    }
  }
}
