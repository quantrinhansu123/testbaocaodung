import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Credentials default from user request
const DEFAULT_APP_ID = process.env.APPSHEET_APP_ID || '2a2f82f8-f846-41fe-b74a-6c6144cd385e';
const DEFAULT_API_KEY = process.env.APPSHEET_API_KEY || 'V2-PE81T-2jJcZ-Am0Kj-qMC8V-ZE6HR-V3cMc-aSO0M-Lx07l';
const DEFAULT_TABLE_NAME = process.env.APPSHEET_TABLE_NAME || 'Trinhbay';

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appId: DEFAULT_APP_ID,
    tableName: DEFAULT_TABLE_NAME,
    time: new Date().toISOString()
  });
});

// AppSheet API Proxy: Fetch / Find records
app.post('/api/appsheet/fetch', async (req, res) => {
  try {
    const {
      appId = DEFAULT_APP_ID,
      apiKey = DEFAULT_API_KEY,
      tableName = DEFAULT_TABLE_NAME
    } = req.body || {};

    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${tableName}/Action`;

    console.log(`[AppSheet API] Fetching rows from table: ${tableName} (AppId: ${appId})`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'ApplicationAccessKey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Action: 'Find',
        Properties: {
          Locale: 'en-US',
          Timezone: 'SE Asia Standard Time'
        },
        Rows: []
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[AppSheet API Warning] Status ${response.status}: ${errorText}`);
      return res.status(200).json({
        success: false,
        status: response.status,
        error: errorText,
        rows: []
      });
    }

    const data = await response.json();
    return res.json({
      success: true,
      data,
      rows: Array.isArray(data) ? data : (data.Rows || data.rows || [])
    });
  } catch (err: any) {
    console.error('[AppSheet Proxy Error]:', err?.message || err);
    return res.status(200).json({
      success: false,
      error: err?.message || 'Server error proxying AppSheet request',
      rows: []
    });
  }
});

// AppSheet API Proxy: Add record
app.post('/api/appsheet/add', async (req, res) => {
  try {
    const {
      appId = DEFAULT_APP_ID,
      apiKey = DEFAULT_API_KEY,
      tableName = DEFAULT_TABLE_NAME,
      row
    } = req.body || {};

    if (!row) {
      return res.status(400).json({ success: false, error: 'Missing row data to add' });
    }

    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${tableName}/Action`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'ApplicationAccessKey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Action: 'Add',
        Properties: {
          Locale: 'en-US',
          Timezone: 'SE Asia Standard Time'
        },
        Rows: [row]
      })
    });

    const data = await response.json().catch(() => ({}));
    return res.json({
      success: response.ok,
      status: response.status,
      data
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to add row to AppSheet'
    });
  }
});

// Start Express + Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
