import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database State for Express REST APIs
  let mockAccounts = [
    { id: 'acc_chk_101', name: 'Enterprise Checking', type: 'CHECKING', accountNumber: '100849204122', balance: 148520.45, availableBalance: 145000.00, status: 'ACTIVE' },
    { id: 'acc_sav_202', name: 'High-Yield Reserve Savings', type: 'SAVINGS', accountNumber: '200918374910', balance: 520194.10, availableBalance: 520194.10, status: 'ACTIVE' },
    { id: 'acc_mm_303', name: 'Treasury Money Market', type: 'MONEY_MARKET', accountNumber: '300726154829', balance: 1250000.00, availableBalance: 1250000.00, status: 'ACTIVE' },
  ];

  let mockTransfers = [
    { id: 'tx_ach_901', fromAccountId: 'acc_chk_101', toAccountName: 'Acme Vendor Payroll', amount: 45000.00, type: 'ACH', status: 'COMPLETED', date: '2026-03-28' },
    { id: 'tx_wire_902', fromAccountId: 'acc_chk_101', toAccountName: 'Global Logistics Escrow', amount: 125000.00, type: 'WIRE', status: 'COMPLETED', date: '2026-03-29' },
  ];

  let mockFeatureFlags = {
    accessibilityDefects: false,
    apiLatencyMs: 0,
    randomApiFailures: false,
    visualBugs: false,
    weakSecurityMode: false,
    heavyDomMode: false,
    brokenWorkflows: false,
  };

  // REST API Endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'HEALTHY', bankName: 'Western Trust Bank', version: '2.5.0-ENTERPRISE', dbStatus: 'CONNECTED' });
  });

  app.post('/api/login', (req, res) => {
    const { username } = req.body;
    res.json({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.wtb_jwt_token',
      user: { username: username || 'john.doe', role: 'CUSTOMER', name: 'John Doe' },
      mfaRequired: true,
      mfaSessionId: 'mfa_sess_884920',
    });
  });

  app.get('/api/accounts', (req, res) => {
    res.json({ accounts: mockAccounts, count: mockAccounts.length });
  });

  app.get('/api/accounts/:id/balance', (req, res) => {
    const acc = mockAccounts.find((a) => a.id === req.params.id) || mockAccounts[0];
    res.json({ accountId: acc.id, balance: acc.balance, availableBalance: acc.availableBalance, currency: 'USD' });
  });

  app.get('/api/accounts/:id/transactions', (req, res) => {
    res.json({
      accountId: req.params.id,
      transactions: [
        { id: 'tx_1', merchant: 'AWS Cloud Hosting', amount: -1450.00, category: 'Technology', date: '2026-03-28' },
        { id: 'tx_2', merchant: 'Fedwire Transfer Deposit', amount: 50000.00, category: 'Income', date: '2026-03-27' },
      ],
    });
  });

  app.post('/api/transfers', (req, res) => {
    const { fromAccountId, amount, toAccountName, transferType } = req.body;
    const newTx = {
      id: `tx_${Date.now()}`,
      fromAccountId: fromAccountId || 'acc_chk_101',
      toAccountName: toAccountName || 'External Account',
      amount: parseFloat(amount) || 100,
      type: transferType || 'INTERNAL',
      status: 'COMPLETED',
      date: new Date().toISOString().split('T')[0],
    };
    mockTransfers.unshift(newTx);
    res.json({ status: 'SUCCESS', transfer: newTx, referenceNumber: `WTB-REF-${Math.floor(Math.random() * 900000 + 100000)}` });
  });

  app.get('/api/transfers', (req, res) => {
    res.json({ transfers: mockTransfers });
  });

  app.get('/api/cards', (req, res) => {
    res.json({
      cards: [
        { id: 'card_1', cardType: 'VISA_SIGNATURE', cardNumberMasked: '•••• •••• •••• 4892', isFrozen: false, creditLimit: 25000, currentBalance: 3420.50 },
      ],
    });
  });

  app.post('/api/cards/freeze', (req, res) => {
    res.json({ status: 'SUCCESS', isFrozen: true, message: 'Card successfully frozen.' });
  });

  app.post('/api/payments', (req, res) => {
    res.json({
      status: 'SUCCESS',
      paymentId: `pay_${Date.now()}`,
      billerName: req.body?.billerName || 'Pacific Gas & Electric',
      amountPaid: req.body?.amount || 245.50,
      confirmationNumber: `CONF-${Math.floor(Math.random() * 900000 + 100000)}`,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/loans', (req, res) => {
    res.json({
      loans: [
        { id: 'loan_app_101', loanType: 'HOME_EQUITY', requestedAmount: 250000, status: 'APPROVED', stage: 'APPROVED', APR: '5.85%' },
        { id: 'loan_app_102', loanType: 'COMMERCIAL_CREDIT', requestedAmount: 100000, status: 'SUBMITTED', stage: 'UNDERWRITING_RISK_SCORED', APR: '6.20%' },
      ],
    });
  });

  app.get('/api/admin/system', (req, res) => {
    res.json({
      systemStatus: 'ONLINE',
      clusterNode: 'us-central1-wtb-prod-02',
      uptimeSeconds: 849200,
      databaseConnections: 24,
      buildVersion: 'v2.5.0-ENTERPRISE-BUILD-992',
    });
  });

  app.get('/api/admin/feature-flags', (req, res) => {
    res.json({ featureFlags: mockFeatureFlags });
  });

  app.get('/api/admin/logs', (req, res) => {
    res.json({
      logs: [
        { id: 'log_1', correlationId: 'wtb-corr-99201', method: 'GET', endpoint: '/api/accounts', statusCode: 200, latencyMs: 12, clientIp: '127.0.0.1' },
        { id: 'log_2', correlationId: 'wtb-corr-99202', method: 'POST', endpoint: '/api/transfers', statusCode: 200, latencyMs: 45, clientIp: '127.0.0.1' },
      ],
    });
  });

  app.get('/api/v3/api-docs', (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: { title: 'Western Trust Bank REST API', version: '2.5.0-ENTERPRISE', description: 'Enterprise REST API backing Western Trust Bank Test Automation Playground.' },
      paths: {
        '/api/login': { post: { summary: 'User Authentication' } },
        '/api/accounts': { get: { summary: 'List Bank Accounts' } },
        '/api/transfers': { post: { summary: 'Execute Funds Transfer' } },
      },
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Western Trust Bank Server running on http://localhost:${PORT}`);
  });
}

startServer();
