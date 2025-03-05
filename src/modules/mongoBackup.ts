import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import { config } from '../config';

export async function runMongoBackup(dbName: string): Promise<string> {
  const dbConfig = config.databases.mongodb[dbName];
  const { user, password, host, port, database, backup_path } = dbConfig;

  if (!fs.existsSync(backup_path)) {
    fs.mkdirSync(backup_path, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${database}-${timestamp}.gz`;
  const backupFilePath = path.join(backup_path, backupFileName);

  // Build the command dynamically, avoiding empty username/password
  const args = [
    '--host',
    host,
    '--port',
    String(port),
    '--db',
    database,
    '--gzip',
    '--archive=' + backupFilePath,
  ];

  if (user) args.push('--username', user);
  if (password) args.push('--password', password);

  console.log(`📌 Backing up MongoDB database: ${database} -> ${backupFilePath}`);

  return new Promise((resolve, reject) => {
    const process = spawn('mongodump', args);
    let errorMessage = '';

    const timeout = setTimeout(() => {
      process.kill();
      reject(new Error(`MongoDB backup timed out for database: ${database}`));
    }, 5_000); // 30 seconds timeout

    process.stdout.on('data', (data) => console.log(`[mongodump]: ${data}`));
    process.stderr.on('data', (data) => {
      console.error(`[mongodump error]: ${data}`);
      errorMessage += data.toString();
    });

    process.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        console.log(`✅ MongoDB backup completed successfully: ${backupFilePath}`);
        resolve(backupFilePath);
      } else {
        reject(new Error(`MongoDB backup failed for database ${database}. Error: ${errorMessage}`));
      }
    });

    process.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`MongoDB backup error: ${err.message}`));
    });
  });
}

export async function checkMongoConnections() {
  console.log('🔍 Checking MongoDB connections...');

  for (const dbName of Object.keys(config.databases.mongodb)) {
    const { user, password, host, port, database } = config.databases.mongodb[dbName];

    try {
      let command = `mongosh "mongodb://${host}:${port}" --quiet --eval "db.adminCommand({ listDatabases: 1 }).databases.map(db => db.name).join(',')"`;
      if (user && password) {
        command = `mongosh "mongodb://${user}:${password}@${host}:${port}" --quiet --eval "db.adminCommand({ listDatabases: 1 }).databases.map(db => db.name).join(',')"`;
      }

      const output = execSync(command, { encoding: 'utf8' }).trim();
      const existingDatabases = output.split(',');

      if (!existingDatabases.includes(database)) {
        throw new Error(`Database "${database}" does not exist.`);
      }

      console.log(`✅ MongoDB database exists: ${dbName} (${database})`);
    } catch (error) {
      const message = (error as Error).message;
      console.error(
        `❌ MongoDB connection failed for database ${dbName} (${database}): ${message}`,
      );
    }
  }
}
