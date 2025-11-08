import { HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

import { config } from '../config';

export async function checkCloudflare() {
  console.log('🔍 Checking Cloudflare configuration...');

  if (!config.cloudflare_r2.enabled) return;

  const {
    access_key_id,
    account_id,
    secret_access_key,
    bucket_name,
    region = 'auto',
  } = config.cloudflare_r2;

  if (!access_key_id || !secret_access_key || !bucket_name || !region) {
    throw new Error('❌ Cloudflare R2 configuration is incomplete in config.yml.');
  }

  const endpoint = `https://${account_id}.r2.cloudflarestorage.com`;

  const s3 = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: secret_access_key,
    },
  });

  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket_name }));
    console.log(`✅ Cloudflare R2 API is working correctly with bucket: "${bucket_name}" !`);
  } catch (err) {
    console.error(`❌ Cloudflare R2 API check failed with bucket "${bucket_name}" :`);
    console.error(err);
  }
}

export async function uploadToCloudflareR2(filePath: string): Promise<void> {
  if (!config.cloudflare_r2.enabled) return;

  const {
    access_key_id,
    account_id,
    secret_access_key,
    bucket_name,
    region = 'auto',
  } = config.cloudflare_r2;

  const endpoint = `https://${account_id}.r2.cloudflarestorage.com`;

  const s3 = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: secret_access_key,
    },
  });

  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: bucket_name,
    Key: path.basename(filePath),
    Body: fileStream,
    mimeType: 'application/sql',
  };

  await s3.send(new PutObjectCommand(uploadParams));
}