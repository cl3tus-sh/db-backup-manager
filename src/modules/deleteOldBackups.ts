import fs from 'fs/promises';
import path from 'path';

import { config } from '../config';

export async function deleteOldBackups(dbName: string): Promise<void> {
  const retentionDays = config.retention?.keep_days || 30;
  const deleteOld = config.retention?.delete_old || false;

  if (!deleteOld) {
    console.log(`🚫 Retention policy is disabled. Skipping deletion of old backups for ${dbName}.`);
    return;
  }

  const backupPath = config.databases.mongodb[dbName]?.backup_path;

  if (!backupPath) {
    console.warn(`⚠️ No backup path found for ${dbName}. Skipping deletion.`);
    return;
  }

  console.log(`🗑️ Checking for old backups of ${dbName} in ${backupPath}...`);

  try {
    await fs.access(backupPath); // Check if directory exists
  } catch {
    console.warn(`⚠️ Backup directory does not exist: ${backupPath}`);
    return;
  }

  const now = Date.now();
  const retentionTime = retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  try {
    const files = (await fs.readdir(backupPath)).filter(
      (file) => file.startsWith(`backup-${dbName}-`) && file.endsWith('.gz'),
    );

    if (files.length === 0) {
      console.log(`✅ No old backups found for ${dbName}.`);
      return;
    }

    // Sort backups by timestamp (oldest to newest)
    const backups = files
      .map((file) => {
        const match = file.match(/^backup-(.+)-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.gz$/);
        if (!match) return null;

        const timestamp = match[2];
        return {
          file: path.join(backupPath, file),
          time: new Date(timestamp).getTime(),
        };
      })
      .filter(Boolean) as { file: string; time: number }[];

    // Ensure backups are sorted (oldest first)
    backups.sort((a, b) => a.time - b.time);

    console.log(`🕓 Found ${backups.length} backups for ${dbName}`);

    let keptBackups = 0;
    for (const { file, time } of backups) {
      const fileAge = now - time;

      if (fileAge > retentionTime) {
        await fs.unlink(file);
        console.log(`🗑️ Deleted old backup: ${file}`);
      } else {
        keptBackups++;
      }
    }

    console.log(`✅ Kept ${keptBackups} backups for ${dbName}`);
  } catch (error) {
    console.error(`❌ Error while deleting old backups for ${dbName}: ${(error as Error).message}`);
  }
}
