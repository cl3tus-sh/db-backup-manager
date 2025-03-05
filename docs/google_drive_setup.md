# 🚀 Google Drive Setup for DB Backup Manager

This guide explains **how to configure Google Drive storage** for your database backups.

## 1️⃣ Create a Google Cloud Project
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Click **"Select a project"** (top left) → **"New Project"**.
3. Enter a **Project Name** (e.g., `DB Backup Manager`) and click **Create**.

---

## 2️⃣ Enable Google Drive API
1. Inside your **Google Cloud Project**, go to **"APIs & Services" > "Enable APIs & Services"**.
2. In the search bar, type **"Google Drive API"**.
3. Click on **"Google Drive API"**, then click **"Enable"**.

---

## 3️⃣ Create a Service Account
1. Open **[IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)**.
2. Click **"Create Service Account"**.
3. **Enter a name** (e.g., `db-backup-service`).
4. Click **"Create & Continue"**.
5. Under **Permissions**, assign the **Editor** role.
6. Click **"Done"**.

---

## 4️⃣ Generate a Service Account Key
1. In **IAM & Admin > Service Accounts**, find your service account.
2. Click on it, then go to the **"Keys"** tab.
3. Click **"Add Key" > "Create new key"**.
4. Select **JSON** format and click **Download**.
5. Rename the file to **`credentials.json`**.
6. Move it to the root of your **DB Backup Manager** project.

---

## 5️⃣ Share a Google Drive Folder
1. Open **[Google Drive](https://drive.google.com/)** and create a folder for backups.
2. Right-click the folder and select **"Share"**.
3. Open your `credentials.json` and find the `"client_email"` field:
```json
{
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com"
}
````
4. Copy this email and paste it in the "Share" field in Google Drive.
5. Set the permissions to "Editor", then click "Send".
6. Copy the Folder ID from the URL (drive.google.com/drive/folders/XXXXXXXXXX).

## 6️⃣ Update config.yml
Edit your config.yml file and add the Folder ID:

```yaml
google_drive:
    enabled: true
    folder_id: "your-google-drive-folder-id"
```

## 7️⃣ Verify the Setup
Run:

```sh
npm run check-config
```

If everything is set up correctly, you should see:

```bash
✅ Google Drive API is working correctly.
🚀 Google Drive Backup is Ready!
```

Now, all backups will be automatically uploaded to Google Drive.
If you have any issues, double-check your `credentials.json` and Google Drive permissions.
