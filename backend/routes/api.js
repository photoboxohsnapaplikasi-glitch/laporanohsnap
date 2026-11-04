/**
 * REST API Router — Oh Snap! Photobox 5 Cabang
 * Mendukung Express maupun Native Node.js HTTP Server
 */
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const reportController = require('../controllers/reportController');

function handleApiRequest(req, res, parsedUrl, bodyObj) {
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  const sendJson = (statusCode, payload) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
  };

  if (method === 'OPTIONS') {
    return sendJson(200, { status: 'ok' });
  }

  if (pathname === '/api/health' && method === 'GET') {
    const state = db.readDb();
    return sendJson(200, {
      status: 'ok',
      app: 'Oh Snap! Photobox 5 Cabang API',
      todayLocalWib: reportController.getLocalIsoDate(),
      yesterdayLocalWib: reportController.getYesterdayLocalIsoDate(),
      branchesCount: (state.branches || []).length,
      totalLogsCount: (state.op_logs_history || []).length,
      deletedLogsCount: (state.deleted_oplog_ids || []).length
    });
  }

  if (pathname === '/api/seed-data' && method === 'GET') {
    const dummyPath = path.join(__dirname, '..', '..', 'seeders', 'dummy_data.json');
    if (fs.existsSync(dummyPath)) {
      const dummy = JSON.parse(fs.readFileSync(dummyPath, 'utf8'));
      return sendJson(200, dummy);
    }
    return sendJson(200, db.readDb());
  }

  if (pathname === '/api/config' && method === 'GET') {
    const state = db.readDb();
    const cfg = state.cloud_config && Object.keys(state.cloud_config).length > 0
      ? state.cloud_config
      : {
          branches: state.branches,
          schedules: state.schedules,
          closeRules: state.closeRules,
          employees: state.employees,
          stockCatalogMeta: state.stock_catalog,
          deletedOpLogIds: state.deleted_oplog_ids,
          opLogsSummary: (state.op_logs_history || []).slice(0, 80),
          updatedAt: Date.now()
        };
    return sendJson(200, { status: 'success', version: 'v4_cloud_sync', cloudConfig: cfg });
  }

  if (pathname === '/api/config' && method === 'POST') {
    const result = reportController.handleAdminConfigSync(bodyObj);
    return sendJson(200, result);
  }

  if (pathname === '/api/webhook' && method === 'POST') {
    const payload = bodyObj && bodyObj.payload
      ? (typeof bodyObj.payload === 'string' ? JSON.parse(bodyObj.payload) : bodyObj.payload)
      : bodyObj;
    const result = reportController.saveReportFromPayload(payload);
    return sendJson(200, result);
  }

  if (pathname === '/api/logs' && method === 'GET') {
    const period = parsedUrl.searchParams.get('period') || '1_TAHUN';
    const branch = parsedUrl.searchParams.get('branch') || 'ALL';
    const recordType = parsedUrl.searchParams.get('recordType') || 'ALL';
    const result = reportController.queryLogsByPeriodAndBranch({ period, branch, recordType });
    return sendJson(200, { status: 'success', ...result });
  }

  if (pathname === '/api/logs/delete' && method === 'POST') {
    const ids = bodyObj && (bodyObj.ids || bodyObj.id) ? (bodyObj.ids || [bodyObj.id]) : [];
    const result = reportController.deleteOpLogRecords(ids);
    return sendJson(200, result);
  }

  if (pathname.startsWith('/api/logs/') && method === 'DELETE') {
    const logId = decodeURIComponent(pathname.slice('/api/logs/'.length));
    const result = reportController.deleteOpLogRecords([logId]);
    return sendJson(200, result);
  }

  return sendJson(404, { status: 'error', message: `Endpoint not found: ${method} ${pathname}` });
}

module.exports = { handleApiRequest };
