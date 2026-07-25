import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAppSheetConfig, appsheetHeaders, KNOWN_TABLES } from '../_lib/appsheet';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { appId, apiKey } = getAppSheetConfig(req.body || {});
    const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables`;

    const response = await fetch(url, {
      method: 'GET',
      headers: appsheetHeaders(apiKey)
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
  } catch (err: any) {
    return res.status(200).json({
      success: true,
      tables: { Tables: KNOWN_TABLES },
      warning: err?.message || 'Server error fetching AppSheet table list'
    });
  }
}
