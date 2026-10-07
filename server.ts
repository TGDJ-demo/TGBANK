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

  app.post('/api/auth/login', (req, res) => {
    const { username, personaKey } = req.body;
    res.json({
      status: 'AUTHENTICATED',
      token: `wtb_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user: { username: username || 'admin.wtb', role: 'ADMIN', name: 'Sanjay G' },
      mfaVerified: true,
      sessionId: `sess_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ status: 'LOGGED_OUT', message: 'Session successfully revoked.', timestamp: new Date().toISOString() });
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
    const { fromAccountId, amount, toAccountName, toAccountId, transferType, memo, otpCode } = req.body;
    const refNum = `WTB-TRF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newTx = {
      id: `tx_${Date.now()}`,
      referenceNumber: refNum,
      fromAccountId: fromAccountId || 'acc_chk_101',
      toAccountId: toAccountId || 'acc_sav_102',
      toAccountName: toAccountName || 'Internal Account',
      amount: parseFloat(amount) || 100,
      transferType: transferType || 'INTERNAL',
      memo: memo || '',
      status: 'COMPLETED',
      rail: transferType === 'WIRE' ? 'FEDWIRE_RTGS' : transferType === 'INTERNATIONAL' ? 'SWIFT_GPI' : 'INTERNAL_ACH',
      timestamp: new Date().toISOString(),
    };
    mockTransfers.unshift(newTx);
    res.json({
      status: 'SUCCESS',
      transfer: newTx,
      referenceNumber: refNum,
      correlationId: `corr-wtb-${Math.random().toString(36).substring(2, 9)}`,
      settlementTime: new Date().toISOString(),
    });
  });

  app.get('/api/transfers', (req, res) => {
    res.json({ transfers: mockTransfers });
  });

  // Credit Cards Endpoints
  app.get('/api/cards', (req, res) => {
    res.json({
      cards: [
        {
          id: 'card_centurion_black',
          cardType: 'AMEX_CENTURION_BLACK',
          cardNumberMasked: '•••• •••• •••• 8821',
          cardNumberFull: '3782 822490 91008',
          cvv: '8492',
          expiryDate: '10/29',
          creditLimit: 150000,
          currentBalance: 4250.00,
          availableCredit: 145750.00,
          rewardsPoints: 245000,
          isFrozen: false,
          cardHolderName: 'SANJAY G',
        },
      ],
    });
  });

  app.post('/api/cards/freeze', (req, res) => {
    const { cardId, isFrozen } = req.body;
    res.json({
      status: 'SUCCESS',
      cardId: cardId || 'card_centurion_black',
      isFrozen: isFrozen ?? true,
      message: isFrozen ? 'Card security lock engaged.' : 'Card unlocked for domestic and international transactions.',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/cards/payment', (req, res) => {
    const { cardId, sourceAccountId, amount } = req.body;
    const refNum = `WTB-CCPAY-${Math.floor(10000000 + Math.random() * 90000000)}`;
    res.json({
      status: 'SUCCESS',
      referenceNumber: refNum,
      cardId: cardId || 'card_centurion_black',
      sourceAccountId: sourceAccountId || 'acc_admin_501',
      amountPaid: parseFloat(amount) || 500,
      authorizationCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
      clearingChannel: 'AMEX_DIRECT_CLEARING',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/cards/limit', (req, res) => {
    const { cardId, newLimit } = req.body;
    res.json({
      status: 'SUCCESS',
      cardId: cardId || 'card_centurion_black',
      newCreditLimit: parseFloat(newLimit) || 50000,
      approvedBy: 'Automated Real-Time Risk Engine',
      effectiveDate: new Date().toISOString(),
    });
  });

  // Bill Payment Endpoint
  app.post('/api/bills/pay', (req, res) => {
    const { billId, billerName, accountId, amount } = req.body;
    const conf = `CONF-ACH-${Math.floor(100000 + Math.random() * 900000)}`;
    res.json({
      status: 'SUCCESS',
      paymentId: `pay_${Date.now()}`,
      billId: billId || 'bill_001',
      billerName: billerName || 'Enterprise Biller',
      amountPaid: parseFloat(amount) || 120.00,
      confirmationNumber: conf,
      paymentRail: 'NACHA_DIRECT_DEBIT',
      timestamp: new Date().toISOString(),
    });
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

  // Loans Endpoints
  app.get('/api/loans', (req, res) => {
    res.json({
      loans: [
        { id: 'loan_app_101', loanType: 'HOME_EQUITY', requestedAmount: 250000, status: 'APPROVED', stage: 'APPROVED', APR: '5.85%' },
        { id: 'loan_app_102', loanType: 'COMMERCIAL_CREDIT', requestedAmount: 100000, status: 'SUBMITTED', stage: 'UNDERWRITING_RISK_SCORED', APR: '6.20%' },
      ],
    });
  });

  app.post('/api/loans/apply', (req, res) => {
    const { loanType, requestedAmount, purpose, annualIncome, termMonths } = req.body;
    const loanId = `loan_app_${Date.now()}`;
    res.json({
      status: 'SUBMITTED',
      loanId,
      loanType: loanType || 'PERSONAL',
      requestedAmount: parseFloat(requestedAmount) || 25000,
      stage: 'APPLICATION_RECEIVED',
      estimatedAPR: '5.45%',
      monthlyPayment: 485.50,
      underwritingTicket: `UW-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/loans/stage', (req, res) => {
    const { loanId, nextStage, status, notes } = req.body;
    res.json({
      status: 'UPDATED',
      loanId: loanId || 'loan_app_101',
      stage: nextStage || 'UNDERWRITING_RISK_SCORED',
      loanStatus: status || 'UNDER_REVIEW',
      reviewerNotes: notes || 'Automated score computed.',
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/loans/disburse', (req, res) => {
    const { loanId, targetAccountId, amount } = req.body;
    res.json({
      status: 'DISBURSED',
      loanId: loanId || 'loan_app_101',
      targetAccountId: targetAccountId || 'acc_admin_501',
      amountDisbursed: parseFloat(amount) || 50000,
      settlementRef: `DISB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Statement Download Endpoint
  app.post('/api/statements/download', (req, res) => {
    const { accountId, statementPeriod, format } = req.body;
    res.json({
      status: 'GENERATED',
      accountId: accountId || 'acc_admin_501',
      statementPeriod: statementPeriod || 'July 2026',
      format: format || 'PDF',
      fileSize: '1.24 MB',
      downloadToken: `stmt_dl_${Date.now()}`,
      verificationHash: `SHA256-${Math.random().toString(36).substring(2, 12)}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Beneficiaries Endpoint
  app.post('/api/beneficiaries', (req, res) => {
    const { name, accountNumber, routingNumber, bankName } = req.body;
    res.json({
      status: 'CREATED',
      beneficiaryId: `ben_${Date.now()}`,
      name: name || 'New Beneficiary',
      accountNumber: accountNumber || '9988776655',
      routingNumber: routingNumber || '121000358',
      ofacScreening: 'CLEARED',
      timestamp: new Date().toISOString(),
    });
  });

  // Support Ticket Endpoint
  app.post('/api/support/tickets', (req, res) => {
    const { subject, category, priority, message } = req.body;
    res.json({
      status: 'OPEN',
      ticketId: `tkt_wtb_${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject || 'Customer Inquiry',
      category: category || 'GENERAL',
      priority: priority || 'MEDIUM',
      assignedQueue: 'VIP_PRIVATE_CLIENT_DESK',
      timestamp: new Date().toISOString(),
    });
  });

  // Investment Trading Endpoint
  app.post('/api/investments/order', (req, res) => {
    const { symbol, orderType, shares, action } = req.body;
    res.json({
      status: 'FILLED',
      orderId: `ord_${Date.now()}`,
      symbol: symbol || 'VTI',
      action: action || 'BUY',
      shares: parseFloat(shares) || 10,
      executionPrice: 284.50,
      clearingBroker: 'Western Trust Securities LLC (FINRA/SIPC)',
      timestamp: new Date().toISOString(),
    });
  });

  // User Profile Settings Endpoint
  app.post('/api/user/profile', (req, res) => {
    res.json({
      status: 'UPDATED',
      message: 'Profile security & notification preferences persisted.',
      timestamp: new Date().toISOString(),
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
