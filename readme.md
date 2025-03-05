# 🚀 DB Backup Manager
A TypeScript-based automated backup system for PostgreSQL & MongoDB with:


## 📌 Features
- 📡 Multi-Database Support → PostgreSQL & MongoDB
- ☁️ Google Drive Integration → Cloud backups via Service Account
- 📤 Remote Server Transfer → Supports scp & rsync
- 🔔 Discord Alerts → Backup status notifications
- 🗑 Retention Policy → Auto-delete old backups
- ⏳ Automated Cron Jobs → No manual editing needed
- 🛠 Config Testing Tool → Detects setup issues before running backups

---

## 📦 Installation
1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/db-backup-manager.git
cd db-backup-manager
```

2️⃣ Install Dependencies
```sh
npm install
```

3️⃣ Install MongoDB Tools (if using MongoDB)
```sh
sudo apt install mongodb-org-tools
```

---

## ⚙️ Configuration (config.yml)
Edit config.yml to set up your databases, remote server, Google Drive, and Discord webhook.

```yaml
remote_server:
    enabled: false
    host: "your.remote.server.com"
    user: "your_ssh_user"
    path: "/remote/backup/path"
    password: "your_ssh_password"
    method: "rsync" # Options: "rsync" or "scp"

google_drive:
    enabled: false
    folder_id: "your-google-drive-folder-id"

discord:
    enabled: false
    webhook_url: "your-discord-webhook-url"

cron:
    enabled: false
    schedule: "daily" # Options: "daily", "weekly", "monthly"

retention:
    delete_old: false
    keep_days: 30 # Number of days before backups are deleted

databases:
    postgres:
        main:
            user: "your_main_user"
            password: "your_main_password"
            host: "localhost"
            port: 5432
            database: "main_database"
            backup_path: "./backups/postgres"

    mongodb:
        main:
            user: "your_mongo_user"
            password: "your_mongo_password"
            host: "localhost"
            port: 27017
            database: "my_mongo_db"
            backup_path: "./backups/mongodb"
```

---

## 🛠 Configuration Checker
Before running backups, test your setup to catch issues.

```sh
npm run check-config
```

✅ This checks:
- ✔ Database credentials & connection (PostgreSQL & MongoDB).
- ✔ Remote server access (via SSH).
- ✔ Google Drive API access.
- ✔ Discord webhook connectivity.

If an issue is found, the script explains why.

---

## 🚀 Running Backups
1️⃣ Build the Project
```sh
npm run build
```

2️⃣ Run a Manual Backup
```sh
npm start
```

3️⃣ Set Up Cron Jobs (Automated Backups)
```sh
npm run setup-cron
```

This automatically configures the cron job based on config.yml.

---

## 🛠 Restore a Backup
PostgreSQL
```sh
pg_restore -U your_user -d your_database -h localhost -p 5432 /path/to/backup-file.sql
```

MongoDB
```sh
mongorestore --gzip --archive=/path/to/backup-file.gz --username your_user --password your_password --host localhost --port 27017
```

---

## 🔹 Google Drive Setup
1. Create a Google Service Account:
   - Go to Google Cloud Console.
   - Create a new project.
   - Navigate to IAM & Admin > Service Accounts.
   - Click Create Service Account → Assign Editor role.
   - Under Keys, generate a JSON Key and download it.
   - Rename the file credentials.json and place it in the project root.


2. Share Google Drive Folder:
   - Create a Google Drive folder for backups.
   - Copy the Folder ID from the URL and paste it in config.yml.
   - Share the folder with your service account email.

---

## 💬 Discord Webhook Setup
1. Open Discord, go to Server Settings → Integrations → Webhooks.
2. Click "Create Webhook", copy the URL.
3. Paste it in config.yml under discord.webhook_url.