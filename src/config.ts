import fs from 'fs';
import yaml from 'yaml';

// Define PostgreSQL & MongoDB database configuration structure
export type DatabaseConfig = {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  backup_path: string;
};

// Define Remote Server configuration
export type RemoteServerConfig = {
  enabled: boolean;
  host: string;
  user: string;
  path: string;
  password: string;
  method: 'rsync' | 'scp';
};

// Define Google Drive configuration
export type GoogleDriveConfig = {
  enabled: boolean;
  folder_id: string;
};

// Define Discord Webhook configuration
export type DiscordConfig = {
  enabled: boolean;
  webhook_url: string;
};

// Define Cron Job scheduling configuration
export type CronConfig = {
  enabled: boolean;
  schedule: 'daily' | 'weekly' | 'monthly';
};

// Define Retention Policy configuration
export type RetentionConfig = {
  delete_old: boolean;
  keep_days: number;
};

// Define full configuration structure
export type Config = {
  remote_server: RemoteServerConfig;
  google_drive: GoogleDriveConfig;
  discord: DiscordConfig;
  cron: CronConfig;
  retention: RetentionConfig;
  databases: {
    postgres: Record<string, DatabaseConfig>;
    mongodb: Record<string, DatabaseConfig>;
  };
};

// Load YAML config file
const configFile = fs.readFileSync('config.yml', 'utf8');
const config: Config = yaml.parse(configFile);

// Ensure required fields exist
if (!config.databases) {
  throw new Error("Missing 'databases' section in config.yml");
}

export { config };
