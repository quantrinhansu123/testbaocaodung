module.exports = async function handler(_req, res) {
  return res.status(200).json({
    status: 'ok',
    appId: process.env.APPSHEET_APP_ID || '2a2f82f8-f846-41fe-b74a-6c6144cd385e',
    tableName: process.env.APPSHEET_TABLE_NAME || 'Trinhbay',
    time: new Date().toISOString(),
    runtime: 'vercel'
  });
};
