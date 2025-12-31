---
description: Deploy Application to aaPanel via GitHub (Manual Method)
---

This workflow guides you through deploying your Next.js application to an aaPanel server manually via the terminal. This method works even if your aaPanel version lacks the direct "Git/Repository" UI fields.

## Prerequisites
- An account on [GitHub](https://github.com/).
- An aaPanel server with "Node.js Version Manager" installed.
- **Terminal Access** inside aaPanel (or via SSH).

## Step 1: Create a GitHub Repository
1.  Go to **GitHub** and create a **New Repository**.
2.  Name it `newppdb`.
3.  **Do not** initialize with README, .gitignore, or license.

## Step 2: Push Local Code to GitHub
Run these commands in your local VS Code terminal:

```bash
# Replace <YOUR_GITHUB_URL> with your actual repository URL
# e.g., https://github.com/username/newppdb.git
git remote add origin <YOUR_GITHUB_URL>
git branch -M main
git push -u origin main
```

## Step 3: Prepare Folder in aaPanel
1.  Login to **aaPanel**.
2.  Go to **Files**.
3.  Navigate to `/www/wwwroot`.
4.  Create a **New Directory** named `newppdb`.
5.  Open the **Terminal** in aaPanel (usually valid via the terminal icon or "Terminal" menu).

## Step 4: Clone and Build (via aaPanel Terminal)
Run the following commands inside the aaPanel terminal:

```bash
# 1. Navigate to the project folder
cd /www/wwwroot/newppdb

# 2. Initialize Git (if folder is empty) or Clone directly
# NOTE: If the folder is empty, just clone:
git clone <YOUR_GITHUB_URL> .

# 3. Install Dependencies
npm install

# 4. Build the Project
npm run build
```

*Note: If `git clone` fails because the folder is not empty, ensure the directory is empty first or use `git init` + `git pull`.*

## Step 5: Configure Node Project in aaPanel
1.  Go to **Website** > **Node Project**.
2.  Click **Add Node Project**.
3.  **Fill in the details:**
    -   **Project Name:** `newppdb`
    -   **Run User:** `www`
    -   **Project Path:** Select `/www/wwwroot/newppdb`.
    -   **Run Command:** `npm start` (or `next start`)
    -   **Port:** `3000` (or whichever port Next.js uses, verify in package.json/logs)
    -   **Node Version:** Select v18/v20.
4.  Click **Submit**.

## Step 6: Configure Environment Variables
1.  In the File Manager, go to `/www/wwwroot/newppdb`.
2.  Create a new file named `.env`.
3.  Paste the content from your local `.env`.
    *   `DATABASE_URL`
    *   `NEXTAUTH_SECRET`
    *   `NEXTAUTH_URL` (Set to your actual domain)
4.  Save the file.
5.  **Restart** the Node Project in the Website tab.

## Step 7: Updates
When you make changes locally:
1.  `git push` from your computer.
2.  Go to aaPanel Terminal:
    ```bash
    cd /www/wwwroot/newppdb
    git pull
    npm run build
    # Then restart the project in aaPanel Website tab
    ```
