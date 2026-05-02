# Alibaba Cloud Deployment Guide

> Deploy the prototype to Alibaba Cloud for public access user testing.
>
> Architecture: **OSS (frontend hosting)** + **FC (analytics API)** + **OSS (data storage)**

## Prerequisites

- Alibaba Cloud account (aliyun.com)
- Alibaba Cloud CLI (`aliyun`) or use the web console
- Node.js 18+ locally

## Step 1: Create OSS Bucket

1. Login to [Alibaba Cloud Console](https://oss.console.aliyun.com/)
2. Create a new Bucket:
   - **Name**: e.g. `sales-lead-agent`
   - **Region**: e.g. China East 1 (Hangzhou) `oss-cn-hangzhou`
   - **Storage Class**: Standard
   - **Access Control**: Public Read
3. In Bucket settings, enable **Static Website Hosting**:
   - Index Document: `index.html`
   - Error Document: `index.html` (for SPA routing)

## Step 2: Deploy FC Analytics API

### 2.1 Create RAM User (for FC to access OSS)

1. Go to [RAM Console](https://ram.console.aliyun.com/)
2. Create a new user with **API Access** (get AccessKey ID & Secret)
3. Grant permission: `AliyunOSSFullAccess`

### 2.2 Create FC Function

1. Go to [FC Console](https://fc.console.aliyun.com/)
2. Create a **Service**: `analytics-service`
3. Create a **Function**:
   - **Name**: `analytics-api`
   - **Runtime**: Node.js 18
   - **Handler**: `index.handler`
   - **Memory**: 128 MB
   - **Timeout**: 30 seconds

4. Upload code:
   ```bash
   cd aliyun-fc
   npm install
   # Zip the directory contents (index.js + node_modules + package.json)
   # Upload the zip in FC console
   ```

5. Set **Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `OSS_REGION` | `oss-cn-hangzhou` |
   | `OSS_BUCKET` | your bucket name (e.g. `sales-lead-agent`) |
   | `OSS_ACCESS_KEY_ID` | your RAM user's AccessKey ID |
   | `OSS_ACCESS_KEY_SECRET` | your RAM user's AccessKey Secret |

6. Create **HTTP Trigger**:
   - **Name**: `http-trigger`
   - **Authentication**: Anonymous
   - **Methods**: GET, POST, DELETE, OPTIONS
   - **URL format**: Get the public URL after creation

   The URL will look like:
   ```
   https://<account-id>.<region>.fc.aliyuncs.com/2016-08-15/proxy/analytics-service/analytics-api
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

## Step 3: Build & Deploy Frontend

### 3.1 Configure Environment

Create `.env.production` in project root:

```bash
# Set to your FC HTTP trigger URL
VITE_ANALYTICS_API=https://<account-id>.<region>.fc.aliyuncs.com/2016-08-15/proxy/analytics-service/analytics-api
```

### 3.2 Build

```bash
npm run build
```

This creates the `dist/` directory with the production build.

### 3.3 Upload to OSS

**Option A: Via OSS Console**

1. Go to your OSS Bucket in the console
2. Navigate to `sales-lead-agent/` directory (create if needed)
3. Upload all files from `dist/` directory

**Option B: Via ossutil CLI**

```bash
# Install ossutil: https://help.aliyun.com/document_detail/120075.html

ossutil cp -r dist/ oss://your-bucket-name/sales-lead-agent/ \
  --access-key-id <your-key-id> \
  --access-key-secret <your-key-secret> \
  --endpoint oss-cn-hangzhou.aliyuncs.com
```

### 3.4 Access URLs

After upload, the application is accessible at:

| Page | URL |
|------|-----|
| Mobile Prototype | `http://<bucket>.oss-cn-hangzhou.aliyuncs.com/sales-lead-agent/index.html` |
| PC Analytics Dashboard | `http://<bucket>.oss-cn-hangzhou.aliyuncs.com/sales-lead-agent/index.html` then navigate to `/analytics` |

> **Note**: Since this is a SPA with client-side routing, you may need to always access via `index.html`. If you bind a custom domain and configure rewrite rules, the URLs will be cleaner.

## Step 4: SPA Routing Fix (Optional)

OSS static hosting doesn't natively support SPA routing (visiting `/analytics` directly returns 404). Two solutions:

### Option A: Use Hash Router (Simplest)

Change `BrowserRouter` to `HashRouter` in `src/App.tsx`:

```diff
- import { BrowserRouter } from 'react-router-dom'
+ import { HashRouter } from 'react-router-dom'

- <BrowserRouter basename={import.meta.env.BASE_URL}>
+ <HashRouter>
```

Then URLs become:
- Mobile: `http://<bucket>.oss-cn-hangzhou.aliyuncs.com/sales-lead-agent/index.html#/`
- Analytics: `http://<bucket>.oss-cn-hangzhou.aliyuncs.com/sales-lead-agent/index.html#/analytics`

### Option B: Bind Custom Domain + CDN

1. Bind a custom domain to the OSS bucket
2. Use Alibaba Cloud CDN with "Redirect to index.html on 404" rule
3. This allows clean URLs like `https://your-domain.com/analytics`

## Cost Estimate

| Service | Free Tier | Prototype Usage | Cost |
|---------|-----------|-----------------|------|
| OSS | ~5GB egress/month | ~10MB storage + minimal traffic | < 1 RMB/month |
| FC | 1M requests/month | ~thousands of requests | 0 RMB |
| Total | | | **< 1 RMB/month** |

## Troubleshooting

### CORS errors

If you see CORS errors in the browser console, verify:
1. FC function returns proper `Access-Control-Allow-Origin: *` headers (already in the code)
2. HTTP trigger is set to **Anonymous** authentication
3. HTTP trigger methods include **OPTIONS**

### Data not showing in PC dashboard

1. Check browser console for network errors
2. Verify `VITE_ANALYTICS_API` is set correctly in `.env.production`
3. Test FC endpoint directly with curl
4. Check FC function logs in the Alibaba Cloud console

### 404 on page refresh

This is the SPA routing issue. Use **Option A (Hash Router)** above for the quickest fix.
