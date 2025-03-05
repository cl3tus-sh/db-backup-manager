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

export async function checkMongoConnections(): Promise<boolean> {
  console.log('🔍 Checking MongoDB connections...');

  const mongoDatabases = config.databases.mongodb ?? {};

  if (Object.keys(mongoDatabases).length === 0) {
    console.warn('⚠️  No MongoDB databases found in config.yml.');
    return false;
  }

  let allSuccessful = true;

  for (const dbName of Object.keys(mongoDatabases)) {
    const { user, password, host, port, database } = mongoDatabases[dbName];

    try {
      let command = `mongosh "mongodb://${host}:${port}" --quiet --eval "db.adminCommand({ listDatabases: 1 })"`;
      if (user && password) {
        command = `mongosh "mongodb://${user}:${password}@${host}:${port}" --quiet --eval "db.adminCommand({ listDatabases: 1 })"`;
      }

      const output = execSync(command, { encoding: 'utf8' }).trim();

      if (!output || output.includes('failed to connect') || output.includes('ECONNREFUSED')) {
        console.error(`❌ Cannot connect to MongoDB server at ${host}:${port}`);
        allSuccessful = false;
        continue;
      }

      let databaseList: string[] = [];
      try {
        const parsedOutput = JSON.parse(output);
        databaseList = parsedOutput.databases.map((db: { name: string }) => db.name);
      } catch {
        console.error(`❌ Unexpected MongoDB response for ${dbName}: ${output}`);
        allSuccessful = false;
        continue;
      }

      if (!databaseList.includes(database)) {
        console.error(`❌ Database "${database}" does not exist.`);
        allSuccessful = false;
        continue;
      }

      console.log(`✅ MongoDB database exists: ${dbName} (${database})`);
    } catch (error) {
      console.error(
        `❌ MongoDB connection failed for ${dbName} (${database}): ${(error as Error).message}`,
      );
      allSuccessful = false;
    }
  }

  return allSuccessful;
}
