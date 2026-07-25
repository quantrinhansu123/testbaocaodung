const DEFAULT_APP_ID = process.env.APPSHEET_APP_ID || '2a2f82f8-f846-41fe-b74a-6c6144cd385e';
const DEFAULT_API_KEY = process.env.APPSHEET_API_KEY || 'V2-PE81T-2jJcZ-Am0Kj-qMC8V-ZE6HR-V3cMc-aSO0M-Lx07l';

const KNOWN_TABLES = [
  { name: 'Trinhbay', id: 'Trinhbay' },
  { name: 'Co_so', id: 'Co_so' },
  { name: 'Dai_ly', id: 'Dai_ly' },
  { name: 'Khao_sat', id: 'Khao_sat' },
  { name: 'Phan_khuc', id: 'Phan_khuc' }
];

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const appId = body.appId || DEFAULT_APP_ID;
    const apiKey = body.apiKey || DEFAULT_API_KEY;
    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ApplicationAccessKey: apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(200).json({
        success: true,
        tables: { Tables: KNOWN_TABLES },
        warning: typeof data === 'string'
          ? data
          : (data?.message || data?.Message || `AppSheet tables API status ${response.status}`)
      });
    }

    return res.status(200).json({
      success: true,
      tables: data
    });
  } catch (err) {
    console.error('[api/appsheet/tables]', err);
    return res.status(200).json({
      success: true,
      tables: { Tables: KNOWN_TABLES },
      warning: err?.message || 'Server error fetching AppSheet table list'
    });
  }
};
