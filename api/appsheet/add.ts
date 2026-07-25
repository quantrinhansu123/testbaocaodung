import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAppSheetConfig, appsheetHeaders } from '../_lib/appsheet';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const { appId, apiKey, tableName } = getAppSheetConfig(body);
    const row = body.row;

    if (!row) {
      return res.status(400).json({ success: false, error: 'Missing row data to add' });
    }

    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${tableName}/Action`;

    const response = await fetch(url, {
      method: 'POST',
      headers: appsheetHeaders(apiKey),
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
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to add row to AppSheet'
    });
  }
}
