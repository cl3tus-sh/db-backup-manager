import fs from 'fs';
import path from 'path';

import { config } from '../config';

export async function deleteOldBackups(backupPath: string): Promise<void> {
  if (!config.retention.delete_old) return;

  const files = fs.readdirSync(backupPath);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(backupPath, file);
    if ((now - fs.statSync(filePath).mtime.getTime()) / 86400000 > config.retention.keep_days) {
      fs.unlinkSync(filePath);
    }
  }
}
