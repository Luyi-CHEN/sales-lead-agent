# Deployment Guide

> Deploy the prototype for public access user testing.
>
> Architecture: **GitHub Pages (frontend hosting)** + **Alibaba Cloud FC 3.0 (analytics API)** + **OSS (data storage)**

## Architecture Overview

```
┌───────────────────────────┐
│  📱 Mobile / 💻 PC Browser │
└─────────┬─────────────────┘
          │ HTTPS
          ▼
┌───────────────────────────┐
│  GitHub Pages             │  ← Frontend static hosting (dist/)
│  React SPA                │
└─────────┬─────────────────┘
          │ CORS HTTPS
          ▼
┌───────────────────────────┐
│  Alibaba Cloud FC 3.0     │  ← Serverless analytics API
│  Node.js 18 event-driven  │
└─────────┬─────────────────┘
          │ ali-oss SDK
          ▼
┌───────────────────────────┐
│  Alibaba Cloud OSS        │  ← JSON file persistence
│  analytics-data/          │
│  ├── chat-logs.json       │
│  └── click-paths.json     │
└───────────────────────────┘
```

**Monthly cost**: < 1 RMB (FC free tier + minimal OSS storage)

## Prerequisites

- GitHub account (for repository & Pages)
- Alibaba Cloud account (aliyun.com) — for FC + OSS
- Node.js 18+ locally

## Step 1: Deploy Frontend to GitHub Pages

### 1.1 Push Code to GitHub

1. Create a GitHub repository (e.g. `sales-lead-agent`)
2. Push the project code to the `main` branch

### 1.2 Configure GitHub Actions Auto-Deploy

The project includes `.github/workflows/deploy.yml` which automatically builds and deploys to GitHub Pages on every push to `main`.

1. Go to repo **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` branch — the workflow will auto-build and deploy

The workflow:
- Installs dependencies with `npm ci`
- Builds with `npm run build`
- Deploys `dist/` to GitHub Pages

### 1.3 Configure Base Path

In `vite.config.ts`, the `base` path must match your repo name:

```ts
export default defineConfig({
  base: '/sales-lead-agent/',  // Must match GitHub repo name
  // ...
})
```

### 1.4 SPA Routing

GitHub Pages doesn't natively support SPA routing. The project uses a `public/404.html` redirect trick to handle client-side routing. No additional configuration needed — just make sure `404.html` is in the `public/` directory.

### 1.5 Access URLs

| Page | URL |
|------|-----|
| Mobile Prototype | `https://<username>.github.io/sales-lead-agent/` |
| PC Analytics Dashboard | `https://<username>.github.io/sales-lead-agent/analytics` |

## Step 2: Deploy FC Analytics API

### 2.1 Create RAM User (for FC to access OSS)

1. Go to [RAM Console](https://ram.console.aliyun.com/users)
2. Create a new user with **OpenAPI Access** (get AccessKey ID & Secret)
3. Grant permission: `AliyunOSSFullAccess`

> ⚠️ AccessKey Secret is shown only once — save it immediately.

### 2.2 Create FC Function

1. Go to [FC Console](https://fcnext.console.aliyun.com/)
2. Create a function:
   - **Name**: e.g. `sales-lead-analytics`
   - **Runtime**: Node.js 18
   - **Handler Type**: Handle HTTP Requests
   - **Memory**: 128 MB
   - **Timeout**: 30 seconds

3. Upload code:
   - Enter the **Code Editor** in FC console
   - Paste the contents of `aliyun-fc/index.js`
   - Run `npm install ali-oss` in the FC terminal
   - Click **Deploy**

4. Set **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `OSS_REGION` | `oss-cn-beijing` (match your bucket region) |
   | `OSS_BUCKET` | your bucket name |
   | `OSS_ACCESS_KEY_ID` | your RAM user's AccessKey ID |
   | `OSS_ACCESS_KEY_SECRET` | your RAM user's AccessKey Secret |

5. Create **HTTP Trigger**:
   - **Authentication**: Anonymous
   - **Methods**: GET, POST, DELETE, OPTIONS

   The URL will be in FC 3.0 format:
   ```
   https://<function-name>-<random-id>.cn-beijing.fcapp.run
   ```

### 2.3 Test the API

```bash
# Replace <FC_URL> with your actual FC trigger URL

# Test write
curl -X POST <FC_URL>/chat \
  -H "Content-Type: application/json" \
  -d '{"id":"test1","timestamp":"2025-01-01T00:00:00Z","userInput":"hello","systemResponse":"hi","detectedIntent":"greeting","responseType":"text","sessionId":"s_test"}'

# Test read
curl <FC_URL>/chat

# Test clear
curl -X DELETE <FC_URL>/chat
```

## Step 3: Create OSS Bucket

1. Go to [OSS Console](https://oss.console.aliyun.com/)
2. Create a new Bucket:
   - **Region**: e.g. China North 2 (Beijing) `oss-cn-beijing` (match FC region)
   - **Storage Class**: Standard
   - **Access Control**: Private (data is accessed via FC, not directly)
3. Create the `analytics-data/` directory with empty `chat-logs.json` (`[]`) and `click-paths.json` (`[]`)

## Step 4: Configure Frontend Environment

### 4.1 Set Analytics API URL

Create `.env.production` in project root:

```bash
# Set to your FC 3.0 HTTP trigger URL
VITE_ANALYTICS_API=https://<function-name>-<random-id>.cn-beijing.fcapp.run
```

### 4.2 Rebuild & Deploy

```bash
npm run build
```

Commit and push to `main` — GitHub Actions will auto-deploy the updated frontend.

## Step 5: Verify

1. Open `https://<username>.github.io/sales-lead-agent/` on a phone browser
2. Click bid cards to enter detail pages
3. Open `https://<username>.github.io/sales-lead-agent/analytics` on PC
4. Verify that user behavior data appears in the analytics dashboard
5. Test on different devices — data should aggregate to the same dashboard

## Cost Estimate

| Service | Free Tier | Prototype Usage | Cost |
|---------|-----------|-----------------|------|
| GitHub Pages | Free for public repos | Static file hosting | 0 RMB |
| FC | 1M requests/month | ~thousands of requests | 0 RMB |
| OSS | ~5GB egress/month | ~10MB storage + minimal traffic | < 1 RMB/month |
| **Total** | | | **< 1 RMB/month** |

## Troubleshooting

### CORS errors

1. FC HTTP trigger must be set to **Anonymous** authentication
2. FC HTTP trigger methods must include **OPTIONS**
3. FC 3.0 automatically handles CORS headers — do not add duplicate `Access-Control-Allow-Origin` in your function code

### Data not showing in PC dashboard

1. Check browser console for network errors
2. Verify `VITE_ANALYTICS_API` is set correctly in `.env.production`
3. Test FC endpoint directly with curl
4. Check FC function logs in the Alibaba Cloud console

### 404 on page refresh

The `public/404.html` handles SPA redirect for GitHub Pages. If it's missing or broken, copy it from the repository.
