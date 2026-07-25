import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_APP_ID = process.env.APPSHEET_APP_ID || '2a2f82f8-f846-41fe-b74a-6c6144cd385e';
const DEFAULT_TABLE_NAME = process.env.APPSHEET_TABLE_NAME || 'Trinhbay';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'ok',
    appId: DEFAULT_APP_ID,
    tableName: DEFAULT_TABLE_NAME,
    time: new Date().toISOString(),
    runtime: 'vercel'
  });
}
