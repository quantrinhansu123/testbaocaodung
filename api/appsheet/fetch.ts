import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAppSheetConfig, appsheetHeaders } from '../_lib/appsheet';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { appId, apiKey, tableName } = getAppSheetConfig(req.body || {});
    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${tableName}/Action`;

    const response = await fetch(url, {
      method: 'POST',
      headers: appsheetHeaders(apiKey),
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
        error: errorText,
        rows: []
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      data,
      rows: Array.isArray(data) ? data : (data.Rows || data.rows || [])
    });
  } catch (err: any) {
    return res.status(200).json({
      success: false,
      error: err?.message || 'Server error proxying AppSheet request',
      rows: []
    });
  }
}
