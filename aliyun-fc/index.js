'use strict';

/**
 * Analytics API - Alibaba Cloud Function Compute (FC)
 * 
 * Stores analytics data (chat logs + click paths) as JSON files in OSS.
 * Designed for prototype user testing with low concurrency.
 * 
 * Environment variables required:
 *   OSS_REGION          - e.g. "oss-cn-hangzhou"
 *   OSS_BUCKET          - e.g. "my-sales-agent"
 *   OSS_ACCESS_KEY_ID   - Alibaba Cloud AccessKey ID
 *   OSS_ACCESS_KEY_SECRET - Alibaba Cloud AccessKey Secret
 * 
 * Endpoints:
 *   GET    /chat    - Get all chat logs
 *   POST   /chat    - Add a chat log entry
 *   DELETE /chat    - Clear all chat logs
 *   GET    /clicks  - Get all click paths
 *   POST   /clicks  - Add a click path entry
 *   DELETE /clicks  - Clear all click paths
 */

const OSS = require('ali-oss');

const MAX_ENTRIES = 5000;
const CHAT_FILE = 'analytics-data/chat-logs.json';
const CLICKS_FILE = 'analytics-data/click-paths.json';

let ossClient = null;

function getOSSClient() {
  if (!ossClient) {
    ossClient = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    });
  }
  return ossClient;
}

// Read JSON array from OSS
async function readData(filePath) {
  try {
    const result = await getOSSClient().get(filePath);
    return JSON.parse(result.content.toString('utf-8'));
  } catch (e) {
    if (e.code === 'NoSuchKey') return [];
    throw e;
  }
}

// Write JSON array to OSS
async function writeData(filePath, data) {
  const trimmed = data.length > MAX_ENTRIES ? data.slice(-MAX_ENTRIES) : data;
  await getOSSClient().put(filePath, Buffer.from(JSON.stringify(trimmed), 'utf-8'), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// Set CORS headers
function setCorsHeaders(resp) {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  resp.setHeader('Content-Type', 'application/json; charset=utf-8');
}

// Send JSON response
function sendJSON(resp, statusCode, data) {
  setCorsHeaders(resp);
  resp.setStatusCode(statusCode);
  resp.send(JSON.stringify(data));
}

/**
 * FC HTTP Trigger handler
 */
module.exports.handler = async function(request, response, context) {
  setCorsHeaders(response);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    response.setStatusCode(204);
    response.send('');
    return;
  }

  const path = request.path || '';
  const method = request.method;

  // Determine which data file to use
  let dataFile = null;
  if (path === '/chat' || path.endsWith('/chat')) {
    dataFile = CHAT_FILE;
  } else if (path === '/clicks' || path.endsWith('/clicks')) {
    dataFile = CLICKS_FILE;
  } else {
    sendJSON(response, 404, { error: 'Not found. Use /chat or /clicks' });
    return;
  }

  try {
    if (method === 'GET') {
      const data = await readData(dataFile);
      sendJSON(response, 200, data);

    } else if (method === 'POST') {
      // Parse request body
      let body;
      try {
        body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      } catch {
        sendJSON(response, 400, { error: 'Invalid JSON body' });
        return;
      }

      // Read existing data, append new entry, write back
      const data = await readData(dataFile);
      data.push(body);
      await writeData(dataFile, data);
      sendJSON(response, 200, { ok: true, total: data.length });

    } else if (method === 'DELETE') {
      await writeData(dataFile, []);
      sendJSON(response, 200, { ok: true });

    } else {
      sendJSON(response, 405, { error: 'Method not allowed' });
    }

  } catch (e) {
    console.error('Analytics API error:', e);
    sendJSON(response, 500, { error: e.message || 'Internal server error' });
  }
};
