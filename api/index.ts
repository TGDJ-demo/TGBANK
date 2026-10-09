const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

async function readBody(request: Request): Promise<Record<string, any> | Response> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return json({ error: 'Expected a JSON object request body.' }, 400);
    }
    return body as Record<string, any>;
  } catch {
    return json({ error: 'Invalid JSON request body.' }, 400);
  }
}

function isResponse(value: Record<string, any> | Response): value is Response {
  return value instanceof Response;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const route = url.searchParams.get('path') || url.pathname.replace(/^\/api(?:\/index)?\/?/, '');
    const path = `/${route.replace(/^\/+/, '')}`;
    const method = request.method.toUpperCase();
    const timestamp = new Date().toISOString();

    if (method === 'GET' && path === '/health') {
      return json({ status: 'HEALTHY', bankName: 'TestGrid Demo Bank', version: '2.5.0-ENTERPRISE', dbStatus: 'CONNECTED' });
    }
    if (method === 'POST' && (path === '/login' || path === '/auth/login')) {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'AUTHENTICATED',
        token: `wtb_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        user: { username: body.username || 'admin.wtb', role: 'ADMIN', name: 'Sanjay G' },
        mfaVerified: true,
        sessionId: `sess_${Date.now()}`,
        timestamp,
      });
    }
    if (method === 'POST' && path === '/auth/logout') {
      return json({ status: 'LOGGED_OUT', message: 'Session successfully revoked.', timestamp });
    }
    if (method === 'GET' && path === '/accounts') {
      const accounts = [
        { id: 'acc_chk_101', name: 'Enterprise Checking', type: 'CHECKING', accountNumber: '100849204122', balance: 148520.45, availableBalance: 145000, status: 'ACTIVE' },
        { id: 'acc_sav_202', name: 'High-Yield Reserve Savings', type: 'SAVINGS', accountNumber: '200918374910', balance: 520194.1, availableBalance: 520194.1, status: 'ACTIVE' },
        { id: 'acc_mm_303', name: 'Treasury Money Market', type: 'MONEY_MARKET', accountNumber: '300726154829', balance: 1250000, availableBalance: 1250000, status: 'ACTIVE' },
      ];
      return json({ accounts, count: accounts.length });
    }
    const accountBalance = path.match(/^\/accounts\/([^/]+)\/balance$/);
    if (method === 'GET' && accountBalance) {
      return json({ accountId: accountBalance[1], balance: 148520.45, availableBalance: 145000, currency: 'USD' });
    }
    const accountTransactions = path.match(/^\/accounts\/([^/]+)\/transactions$/);
    if (method === 'GET' && accountTransactions) {
      return json({
        accountId: accountTransactions[1],
        transactions: [
          { id: 'tx_1', merchant: 'AWS Cloud Hosting', amount: -1450, category: 'Technology', date: '2026-03-28' },
          { id: 'tx_2', merchant: 'Fedwire Transfer Deposit', amount: 50000, category: 'Income', date: '2026-03-27' },
        ],
      });
    }
    if (method === 'GET' && path === '/transfers') {
      return json({
        transfers: [
          { id: 'tx_ach_901', fromAccountId: 'acc_chk_101', toAccountName: 'Acme Vendor Payroll', amount: 45000, type: 'ACH', status: 'COMPLETED', date: '2026-03-28' },
          { id: 'tx_wire_902', fromAccountId: 'acc_chk_101', toAccountName: 'Global Logistics Escrow', amount: 125000, type: 'WIRE', status: 'COMPLETED', date: '2026-03-29' },
        ],
      });
    }
    if (method === 'POST' && path === '/transfers') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      const referenceNumber = `WTB-TRF-${Math.floor(10000000 + Math.random() * 90000000)}`;
      return json({
        status: 'SUCCESS',
        transfer: {
          id: `tx_${Date.now()}`,
          referenceNumber,
          fromAccountId: body.fromAccountId || 'acc_chk_101',
          toAccountId: body.toAccountId || 'acc_sav_102',
          toAccountName: body.toAccountName || 'Internal Account',
          amount: Number(body.amount) || 100,
          transferType: body.transferType || 'INTERNAL',
          type: body.transferType || 'INTERNAL',
          memo: body.memo || '',
          status: 'COMPLETED',
          timestamp,
          date: timestamp.slice(0, 10),
        },
        referenceNumber,
        correlationId: `corr-wtb-${Math.random().toString(36).substring(2, 9)}`,
        settlementTime: timestamp,
      });
    }
    if (method === 'GET' && path === '/cards') {
      return json({
        cards: [
          { id: 'card_centurion_black', cardType: 'AMEX_CENTURION_BLACK', cardNumberMasked: '•••• •••• •••• 8821', expiryDate: '10/29', creditLimit: 150000, currentBalance: 4250, availableCredit: 145750, rewardsPoints: 245000, isFrozen: false, cardHolderName: 'SANJAY G' },
        ],
      });
    }
    if (method === 'POST' && path === '/cards/freeze') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'SUCCESS',
        cardId: body.cardId || 'card_centurion_black',
        isFrozen: body.isFrozen ?? true,
        message: body.isFrozen ? 'Card security lock engaged.' : 'Card unlocked for domestic and international transactions.',
        timestamp,
      });
    }
    if (method === 'POST' && path === '/cards/payment') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'SUCCESS',
        referenceNumber: `WTB-CCPAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
        cardId: body.cardId || 'card_centurion_black',
        sourceAccountId: body.sourceAccountId || 'acc_admin_501',
        amountPaid: Number(body.amount) || 500,
        authorizationCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
        clearingChannel: 'AMEX_DIRECT_CLEARING',
        timestamp,
      });
    }
    if (method === 'POST' && path === '/cards/limit') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'SUCCESS',
        cardId: body.cardId || 'card_centurion_black',
        newCreditLimit: Number(body.newLimit) || 50000,
        approvedBy: 'Automated Real-Time Risk Engine',
        effectiveDate: timestamp,
      });
    }
    if (method === 'POST' && path === '/bills/pay') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'SUCCESS',
        paymentId: `pay_${Date.now()}`,
        billId: body.billId || 'bill_001',
        billerName: body.billerName || 'Enterprise Biller',
        amountPaid: Number(body.amount) || 120,
        confirmationNumber: `CONF-ACH-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentRail: 'NACHA_DIRECT_DEBIT',
        timestamp,
      });
    }
    if (method === 'POST' && path === '/payments') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'SUCCESS',
        paymentId: `pay_${Date.now()}`,
        billerName: body.billerName || 'Pacific Gas & Electric',
        amountPaid: body.amount || 245.5,
        confirmationNumber: `CONF-${Math.floor(Math.random() * 900000 + 100000)}`,
        timestamp,
      });
    }
    if (method === 'GET' && path === '/loans') {
      return json({
        loans: [
          { id: 'loan_app_101', loanType: 'HOME_EQUITY', requestedAmount: 250000, status: 'APPROVED', stage: 'APPROVED', APR: '5.85%' },
          { id: 'loan_app_102', loanType: 'COMMERCIAL_CREDIT', requestedAmount: 100000, status: 'SUBMITTED', stage: 'UNDERWRITING_RISK_SCORED', APR: '6.20%' },
        ],
      });
    }
    if (method === 'POST' && path === '/loans/apply') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'SUBMITTED',
        loanId: `loan_app_${Date.now()}`,
        loanType: body.loanType || 'PERSONAL',
        requestedAmount: Number(body.requestedAmount) || 25000,
        stage: 'APPLICATION_RECEIVED',
        estimatedAPR: '5.45%',
        monthlyPayment: 485.5,
        underwritingTicket: `UW-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp,
      });
    }
    if (method === 'POST' && path === '/loans/stage') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'UPDATED',
        loanId: body.loanId || 'loan_app_101',
        stage: body.nextStage || 'UNDERWRITING_RISK_SCORED',
        loanStatus: body.status || 'UNDER_REVIEW',
        reviewerNotes: body.notes || 'Automated score computed.',
        timestamp,
      });
    }
    if (method === 'POST' && path === '/loans/disburse') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'DISBURSED',
        loanId: body.loanId || 'loan_app_101',
        targetAccountId: body.targetAccountId || 'acc_admin_501',
        amountDisbursed: Number(body.amount) || 50000,
        settlementRef: `DISB-${Math.floor(10000000 + Math.random() * 90000000)}`,
        timestamp,
      });
    }
    if (method === 'POST' && path === '/statements/download') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'GENERATED',
        accountId: body.accountId || 'acc_admin_501',
        statementPeriod: body.statementPeriod || 'July 2026',
        format: body.format || 'PDF',
        fileSize: '1.24 MB',
        downloadToken: `stmt_dl_${Date.now()}`,
        verificationHash: `SHA256-${Math.random().toString(36).substring(2, 12)}`,
        timestamp,
      });
    }
    if (method === 'POST' && path === '/beneficiaries') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'CREATED',
        beneficiaryId: `ben_${Date.now()}`,
        name: body.name || 'New Beneficiary',
        accountNumber: body.accountNumber || '9988776655',
        routingNumber: body.routingNumber || '121000358',
        ofacScreening: 'CLEARED',
        timestamp,
      });
    }
    if (method === 'POST' && path === '/support/tickets') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'OPEN',
        ticketId: `tkt_wtb_${Math.floor(1000 + Math.random() * 9000)}`,
        subject: body.subject || 'Customer Inquiry',
        category: body.category || 'GENERAL',
        priority: body.priority || 'MEDIUM',
        assignedQueue: 'VIP_PRIVATE_CLIENT_DESK',
        timestamp,
      });
    }
    if (method === 'POST' && path === '/investments/order') {
      const body = await readBody(request);
      if (isResponse(body)) return body;
      return json({
        status: 'FILLED',
        orderId: `ord_${Date.now()}`,
        symbol: body.symbol || 'VTI',
        action: body.action || 'BUY',
        shares: Number(body.shares) || 10,
        executionPrice: 284.5,
        clearingBroker: 'TestGrid Demo Bank Securities (FINRA/SIPC)',
        timestamp,
      });
    }
    if (method === 'POST' && path === '/user/profile') {
      return json({ status: 'UPDATED', message: 'Profile security & notification preferences persisted.', timestamp });
    }
    if (method === 'GET' && path === '/admin/system') {
      return json({ systemStatus: 'ONLINE', clusterNode: 'us-central1-wtb-prod-02', uptimeSeconds: 849200, databaseConnections: 24, buildVersion: 'v2.5.0-ENTERPRISE-BUILD-992' });
    }
    if (method === 'GET' && path === '/admin/feature-flags') {
      return json({ featureFlags: { accessibilityDefects: false, apiLatencyMs: 0, randomApiFailures: false, visualBugs: false, weakSecurityMode: false, heavyDomMode: false, brokenWorkflows: false } });
    }
    if (method === 'GET' && path === '/admin/logs') {
      return json({
        logs: [
          { id: 'log_1', correlationId: 'wtb-corr-99201', method: 'GET', endpoint: '/api/accounts', statusCode: 200, latencyMs: 12, clientIp: '127.0.0.1' },
          { id: 'log_2', correlationId: 'wtb-corr-99202', method: 'POST', endpoint: '/api/transfers', statusCode: 200, latencyMs: 45, clientIp: '127.0.0.1' },
        ],
      });
    }
    if (method === 'GET' && path === '/v3/api-docs') {
      return json({
        openapi: '3.0.0',
        info: { title: 'TestGrid Demo Bank REST API', version: '2.5.0-ENTERPRISE', description: 'REST API backing the TestGrid Demo Bank banking playground.' },
        paths: {
          '/api/login': { post: { summary: 'User Authentication' } },
          '/api/accounts': { get: { summary: 'List Bank Accounts' } },
          '/api/transfers': { post: { summary: 'Execute Funds Transfer' } },
        },
      });
    }

    return json({ error: `No API route for ${method} ${path}.` }, 404);
  },
};
