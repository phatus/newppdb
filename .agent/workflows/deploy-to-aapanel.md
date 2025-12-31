---
description: Deploy Application to aaPanel via GitHub
---

This workflow guides you through deploying your Next.js application to an aaPanel server using GitHub integration.

## Prerequisites
- An account on [GitHub](https://github.com/).
- An aaPanel server with "Node.js Version Manager" installed.
- SSH access to your aaPanel server (optional, but helpful).

## Step 1: Create a GitHub Repository
1.  Go to **GitHub** and create a **New Repository**.
2.  Name it `newppdb` (or any name you prefer).
3.  Make it **Private** (recommended) or Public.
4.  **Do not** initialize with README, .gitignore, or license (we already have these).

## Step 2: Push Local Code to GitHub
Since I have already initialized the local repository for you, run the following commands in your local terminal (VS Code):

```bash
# Replace <YOUR_GITHUB_URL> with the actual URL (e.g., https://github.com/username/newppdb.git)
git remote add origin <YOUR_GITHUB_URL>
git branch -M main
git push -u origin main
```

## Step 3: Configure aaPanel
1.  **Login** to your aaPanel dashboard.
2.  Go to **Website** > **Node Project** tab.
    *(If you don't see Node Project, go to App Store and install "Node.js Version Manager")*
3.  Click **Add Node Project**.
4.  **Fill in the details:**
    -   **Project Name:** `newppdb`
    -   **Run User:** `www`
    -   **Startup Mode:** `Start` (or `PM2` if available)
    -   **Project Path:** Use the folder icon to select a path (usually `/www/wwwroot/newppdb`).
    -   **Node Version:** Select a compatible version (v18 or v20 recommended).
    -   **Git/Upload:** Select **Git**.
    -   **Repository URL:** Paste your `<YOUR_GITHUB_URL>`.
    -   **Password/Token:** If private, enter your GitHub Personal Access Token (Classic).
    -   **Branch:** `main`
5.  Click **Submit** or **Clone**.

## Step 4: Install Dependencies & Build
Once the project is created in aaPanel:
1.  Click on the **Project Name** in the list to open settings.
2.  Go to **Project Config** or **Dependencies**.
3.  Click **Install dependencies** (this runs `npm install`).
4.  **Build the Project:**
    -   In the "Script" or "Command" section, look for a way to run `npm run build`.
    -   Alternatively, open the terminal in aaPanel, navigate to the folder, and run:
        ```bash
        npm run build
        ```

## Step 5: Start the Application
1.  Back in the Node Project settings, ensure the **Start Command** is set to `npm start`.
2.  Click **Start** or **Restart**.
3.  The status should change to "Running".

## Step 6: Configure Environment Variables
1.  In the Project settings, go to **Environment** or **Config**.
2.  You need to create a `.env` file or set the variables manually.
3.  Important variables to set (copy from your local `.env`):
    -   `DATABASE_URL`
    -   `NEXTAUTH_SECRET`
    -   `NEXTAUTH_URL` (Set this to your domain, e.g., `http://your-domain.com`)

## Step 7: Access the Site
1.  If you mapped a domain in step 3, try accessing it.
2.  If you only verified the local port, you might need to map a domain in the **Domain** tab of the project settings.
