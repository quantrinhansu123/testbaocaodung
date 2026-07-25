const DEFAULT_APP_ID = process.env.APPSHEET_APP_ID || '2a2f82f8-f846-41fe-b74a-6c6144cd385e';
const DEFAULT_API_KEY = process.env.APPSHEET_API_KEY || 'V2-PE81T-2jJcZ-Am0Kj-qMC8V-ZE6HR-V3cMc-aSO0M-Lx07l';
const DEFAULT_TABLE_NAME = process.env.APPSHEET_TABLE_NAME || 'Trinhbay';

function getConfig(body = {}) {
  return {
    appId: body.appId || DEFAULT_APP_ID,
    apiKey: body.apiKey || DEFAULT_API_KEY,
    tableName: body.tableName || DEFAULT_TABLE_NAME
  };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { appId, apiKey, tableName } = getConfig(body);
    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${encodeURIComponent(tableName)}/Action`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ApplicationAccessKey: apiKey,
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
      return res.status(200).json({
        success: false,
        status: response.status,
        error: errorText || `AppSheet status ${response.status}`,
        rows: []
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      data,
      rows: Array.isArray(data) ? data : (data.Rows || data.rows || [])
    });
  } catch (err) {
    console.error('[api/appsheet/fetch]', err);
    return res.status(200).json({
      success: false,
      error: err?.message || 'Server error proxying AppSheet request',
      rows: []
    });
  }
};
