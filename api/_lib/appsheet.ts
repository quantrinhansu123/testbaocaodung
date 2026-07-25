const DEFAULT_APP_ID = process.env.APPSHEET_APP_ID || '2a2f82f8-f846-41fe-b74a-6c6144cd385e';
const DEFAULT_API_KEY = process.env.APPSHEET_API_KEY || 'V2-PE81T-2jJcZ-Am0Kj-qMC8V-ZE6HR-V3cMc-aSO0M-Lx07l';
const DEFAULT_TABLE_NAME = process.env.APPSHEET_TABLE_NAME || 'Trinhbay';

export const KNOWN_TABLES = [
  { name: 'Trinhbay', id: 'Trinhbay' },
  { name: 'Co_so', id: 'Co_so' },
  { name: 'Dai_ly', id: 'Dai_ly' },
  { name: 'Khao_sat', id: 'Khao_sat' },
  { name: 'Phan_khuc', id: 'Phan_khuc' }
];

export function getAppSheetConfig(body: Record<string, any> = {}) {
  return {
    appId: body.appId || DEFAULT_APP_ID,
    apiKey: body.apiKey || DEFAULT_API_KEY,
    tableName: body.tableName || DEFAULT_TABLE_NAME
  };
}

export function appsheetHeaders(apiKey: string) {
  return {
    ApplicationAccessKey: apiKey,
    'Content-Type': 'application/json'
  };
}
