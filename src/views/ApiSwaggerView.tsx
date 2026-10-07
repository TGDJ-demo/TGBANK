import React, { useState } from 'react';
import { Code, Play, CheckCircle2, Copy, FileCode, RefreshCw, Server, ShieldCheck } from 'lucide-react';

export const ApiSwaggerView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/accounts');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints = [
    { method: 'POST', path: '/api/login', desc: 'Authenticate banking persona & obtain JWT + Refresh Token' },
    { method: 'GET', path: '/api/accounts', desc: 'List all active accounts, routing numbers & balances' },
    { method: 'GET', path: '/api/accounts/acc_chk_101/balance', desc: 'Fetch real-time available & ledger balance for account' },
    { method: 'GET', path: '/api/accounts/acc_chk_101/transactions', desc: 'Retrieve paginated transaction records' },
    { method: 'POST', path: '/api/transfers', desc: 'Execute ACH, Wire, or Internal money transfer' },
    { method: 'GET', path: '/api/transfers', desc: 'List historical transfer receipts & status' },
    { method: 'POST', path: '/api/payments', desc: 'Pay corporate or utility biller' },
    { method: 'GET', path: '/api/loans', desc: 'Fetch loan applications & underwriting status' },
    { method: 'GET', path: '/api/cards', desc: 'Retrieve credit card details & rewards balance' },
    { method: 'POST', path: '/api/cards/freeze', desc: 'Toggle instant card freeze state' },
    { method: 'GET', path: '/api/admin/feature-flags', desc: 'Query active chaos test flags & latencies' },
    { method: 'GET', path: '/api/admin/logs', desc: 'Stream API audit logs with correlation IDs' },
    { method: 'GET', path: '/api/admin/system', desc: 'Health status, DB status, and build metadata' },
    { method: 'GET', path: '/api/v3/api-docs', desc: 'Raw OpenAPI 3.0 JSON specification document' },
  ];

  const getFallbackJsonResponse = (method: string, path: string) => {
    if (path.includes('/login')) {
      return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.wtb_jwt_token',
        user: { username: 'john.doe', role: 'CUSTOMER', name: 'John Doe' },
        mfaRequired: true,
        mfaSessionId: 'mfa_sess_884920',
        status: 'AUTHENTICATED',
      };
    }
    if (path.includes('/accounts') && path.includes('/balance')) {
      return { accountId: 'acc_chk_101', balance: 148520.45, availableBalance: 145000.00, currency: 'USD' };
    }
    if (path.includes('/accounts') && path.includes('/transactions')) {
      return {
        accountId: 'acc_chk_101',
        transactions: [
          { id: 'tx_1', merchant: 'AWS Cloud Hosting', amount: -1450.00, category: 'Technology', date: '2026-03-28' },
          { id: 'tx_2', merchant: 'Fedwire Transfer Deposit', amount: 50000.00, category: 'Income', date: '2026-03-27' },
        ],
      };
    }
    if (path.includes('/accounts')) {
      return {
        accounts: [
          { id: 'acc_chk_101', name: 'Enterprise Checking', type: 'CHECKING', accountNumber: '100849204122', balance: 148520.45, availableBalance: 145000.00, status: 'ACTIVE' },
          { id: 'acc_sav_202', name: 'High-Yield Reserve Savings', type: 'SAVINGS', accountNumber: '200918374910', balance: 520194.10, availableBalance: 520194.10, status: 'ACTIVE' },
        ],
        count: 2,
      };
    }
    if (path.includes('/transfers') && method === 'POST') {
      return { status: 'SUCCESS', referenceNumber: 'WTB-REF-884920', timestamp: new Date().toISOString() };
    }
    if (path.includes('/transfers')) {
      return {
        transfers: [
          { id: 'tx_ach_901', fromAccountId: 'acc_chk_101', toAccountName: 'Acme Vendor Payroll', amount: 45000.00, type: 'ACH', status: 'COMPLETED', date: '2026-03-28' },
        ],
      };
    }
    if (path.includes('/payments')) {
      return { status: 'SUCCESS', paymentId: 'pay_99201', confirmationNumber: 'CONF-884910', timestamp: new Date().toISOString() };
    }
    if (path.includes('/loans')) {
      return {
        loans: [
          { id: 'loan_app_101', loanType: 'HOME_EQUITY', requestedAmount: 250000, status: 'APPROVED', stage: 'APPROVED', APR: '5.85%' },
        ],
      };
    }
    if (path.includes('/cards/freeze')) {
      return { status: 'SUCCESS', isFrozen: true, message: 'Card successfully frozen.' };
    }
    if (path.includes('/cards')) {
      return {
        cards: [
          { id: 'card_1', cardType: 'VISA_SIGNATURE', cardNumberMasked: '•••• •••• •••• 4892', isFrozen: false, creditLimit: 25000, currentBalance: 3420.50 },
        ],
      };
    }
    if (path.includes('/admin/feature-flags')) {
      return { featureFlags: { accessibilityDefects: false, apiLatencyMs: 0, randomApiFailures: false } };
    }
    if (path.includes('/admin/logs')) {
      return {
        logs: [
          { id: 'log_1', correlationId: 'wtb-corr-99201', method: 'GET', endpoint: '/api/accounts', statusCode: 200, latencyMs: 12, clientIp: '127.0.0.1' },
        ],
      };
    }
    if (path.includes('/admin/system')) {
      return { systemStatus: 'ONLINE', clusterNode: 'us-central1-wtb-prod-02', uptimeSeconds: 849200 };
    }
    if (path.includes('/v3/api-docs')) {
      return {
        openapi: '3.0.0',
        info: { title: 'Western Trust Bank REST API', version: '2.5.0-ENTERPRISE' },
        paths: { '/api/login': { post: { summary: 'User Authentication' } } },
      };
    }
    return { status: 'SUCCESS', message: 'API Endpoint Executed Successfully' };
  };

  const handleRunApiTest = async () => {
    setIsLoading(true);
    setTestResponse(null);

    const ep = endpoints.find((e) => `${e.method} ${e.path}` === selectedEndpoint);
    if (!ep) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(ep.path, {
        method: ep.method === 'GET' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ep.method === 'POST' ? JSON.stringify({ username: 'john.doe', amount: 100 }) : undefined,
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setTestResponse(JSON.stringify(data, null, 2));
      } else {
        // Fallback for Vercel or static SPA preview where static router serves index.html
        const mockData = getFallbackJsonResponse(ep.method, ep.path);
        setTestResponse(JSON.stringify(mockData, null, 2));
      }
    } catch {
      // Network or JSON parse error fallback
      const mockData = getFallbackJsonResponse(ep.method, ep.path);
      setTestResponse(JSON.stringify(mockData, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="swagger-view-container" data-testid="swagger-view-container" className="space-y-4">
      {/* Header */}
      <div>
        <h1 id="heading-swagger-title" data-testid="heading-swagger-title" className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>OpenAPI 3.0 / Swagger REST API Explorer</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold px-2 py-0.5 rounded uppercase">
            Vercel & Cloud Compatible
          </span>
        </h1>
        <p id="subheading-swagger" data-testid="subheading-swagger" className="text-xs text-slate-500 mt-0.5">
          Interactive REST API sandbox backing Western Trust Bank for headless API validation, Vercel deployments, & Postman testing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Endpoint List Sidebar (1 Col) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            API Directory ({endpoints.length} Endpoints)
          </label>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {endpoints.map((ep) => {
              const fullKey = `${ep.method} ${ep.path}`;
              const isSelected = selectedEndpoint === fullKey;
              return (
                <button
                  key={fullKey}
                  id={`btn-endpoint-${ep.method}-${ep.path.replace(/\//g, '-')}`}
                  data-testid={`btn-endpoint-${ep.method}-${ep.path.replace(/\//g, '-')}`}
                  onClick={() => {
                    setSelectedEndpoint(fullKey);
                    setTestResponse(null);
                  }}
                  className={`w-full p-2.5 rounded border text-left transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-[#002D72] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <span
                      className={`inline-block font-mono font-bold text-[10px] px-1.5 py-0.5 rounded mr-2 ${
                        ep.method === 'GET' ? 'bg-blue-100 text-[#002D72] border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">{ep.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* API Playground Runner (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-extrabold text-[#002D72] uppercase">Selected Endpoint Test Runner</span>
              <h3 id="text-selected-endpoint-title" data-testid="text-selected-endpoint-title" className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {selectedEndpoint}
              </h3>
            </div>

            <button
              id="btn-execute-api-call"
              data-testid="btn-execute-api-call"
              onClick={handleRunApiTest}
              disabled={isLoading}
              className="px-3.5 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>Execute Live API Request</span>
            </button>
          </div>

          <p className="text-xs text-slate-700">
            {endpoints.find((e) => `${e.method} ${e.path}` === selectedEndpoint)?.desc}
          </p>

          {/* JSON Output Viewer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                HTTP Response Payload (JSON)
              </span>
              {testResponse && (
                <button
                  onClick={() => navigator.clipboard.writeText(testResponse)}
                  className="text-xs text-[#002D72] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
              )}
            </div>

            <pre
              id="box-api-json-response"
              data-testid="box-api-json-response"
              className="p-3.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-400 overflow-x-auto min-h-[280px] max-h-[450px]"
            >
              {testResponse || '// Click "Execute Live API Request" above to test backend endpoint response...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
