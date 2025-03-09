import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';

import { config } from '../config';

const credentialsPath = path.resolve(__dirname, '../credentials.json');

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

export async function uploadToGoogleDrive(filePath: string): Promise<void> {
  if (!config.google_drive.enabled) return;

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`❌ Google Drive credentials file not found: ${credentialsPath}`);
  }

  const fileMetadata = {
    name: filePath.split('/').pop(),
    parents: [config.google_drive.folder_id],
  };
  const media = { mimeType: 'application/sql', body: fs.createReadStream(filePath) };

  await drive.files.create({ requestBody: fileMetadata, media });
}

export async function checkGoogleDrive() {
  console.log('🔍 Checking Google Drive API...');

  if (!config.google_drive.enabled) {
    console.log('⚠️ Google Drive backup is disabled in config.yml.');
    return;
  }

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`❌ Google Drive credentials file not found: ${credentialsPath}`);
  }

  try {
    const drive = google.drive({ version: 'v3', auth });
    await drive.files.list({ pageSize: 1 });
    console.log('✅ Google Drive API is working correctly.');
  } catch (error) {
    console.error(`❌ Google Drive API check failed: ${error}`);
  }
}
