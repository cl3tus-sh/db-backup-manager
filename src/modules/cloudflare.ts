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

  if (!access_key_id || !secret_access_key || !bucket_name || !region || !account_id) {
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

  let fileStream;

  try {
    fileStream = fs.createReadStream(filePath);
  } catch (err) {
    console.error(`❌ Failed to read file "${filePath}":`);
    console.error(err);
    return;
  }

  const uploadParams = {
    Bucket: bucket_name,
    Key: path.basename(filePath),
    Body: fileStream,
    ContentType: 'application/sql',
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    console.log(`✅ Successfully uploaded "${path.basename(filePath)}" to Cloudflare R2 bucket "${bucket_name}".`);
  } catch (err) {
    console.error(`❌ Failed to upload "${path.basename(filePath)}" to Cloudflare R2 bucket "${bucket_name}":`);
    console.error(err);
  }
}