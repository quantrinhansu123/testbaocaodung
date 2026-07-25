const DEFAULT_APP_ID = process.env.APPSHEET_APP_ID || '2a2f82f8-f846-41fe-b74a-6c6144cd385e';
const DEFAULT_API_KEY = process.env.APPSHEET_API_KEY || 'V2-PE81T-2jJcZ-Am0Kj-qMC8V-ZE6HR-V3cMc-aSO0M-Lx07l';
const DEFAULT_TABLE_NAME = process.env.APPSHEET_TABLE_NAME || 'Trinhbay';

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const appId = body.appId || DEFAULT_APP_ID;
    const apiKey = body.apiKey || DEFAULT_API_KEY;
    const tableName = body.tableName || DEFAULT_TABLE_NAME;
    const row = body.row;

    if (!row) {
      return res.status(400).json({ success: false, error: 'Missing row data to add' });
    }

    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${encodeURIComponent(tableName)}/Action`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ApplicationAccessKey: apiKey,
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
    const appSheetError =
      data?.error ||
      data?.Error ||
      data?.message ||
      data?.Message ||
      (!response.ok ? JSON.stringify(data) : undefined);

    return res.status(response.ok ? 200 : response.status).json({
      success: response.ok && !appSheetError,
      status: response.status,
      data,
      error: appSheetError
    });
  } catch (err) {
    console.error('[api/appsheet/add]', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to add row to AppSheet'
    });
  }
};
