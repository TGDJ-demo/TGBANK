import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  BankAccount,
  Transaction,
  Beneficiary,
  BillPayment,
  LoanApplication,
  CreditCardDetails,
  InvestmentAsset,
  SupportTicket,
  NotificationItem,
  ChaosFeatureFlags,
  MoneyTransferRequest,
  MoneyTransferResult,
  ApiAuditLog,
} from '../types';
import {
  DEMO_PERSONAS,
  DEFAULT_ACCOUNTS,
  DEFAULT_BENEFICIARIES,
  DEFAULT_BILLS,
  DEFAULT_LOANS,
  DEFAULT_CREDIT_CARDS,
  DEFAULT_INVESTMENTS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_CHAOS_FLAGS,
  generateSeedTransactions,
  generateSeedAuditLogs,
  PERSONA_DATASETS,
  INTERNAL_BANK_ACCOUNTS,
} from '../mockData';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface BankContextType {
  currentUser: UserProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  beneficiaries: Beneficiary[];
  bills: BillPayment[];
  loans: LoanApplication[];
  creditCards: CreditCardDetails[];
  investments: InvestmentAsset[];
  notifications: NotificationItem[];
  supportTickets: SupportTicket[];
  featureFlags: ChaosFeatureFlags;
  auditLogs: ApiAuditLog[];
  toasts: Toast[];
  currentPersonaKey: string;
  activeView: string;
  isAuthenticated: boolean;

  // Actions
  setActiveView: (view: string) => void;
  switchPersona: (personaKey: string) => void;
  login: (personaKey?: string) => void;
  logout: () => void;
  updateFeatureFlags: (flags: Partial<ChaosFeatureFlags>) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  executeTransfer: (req: MoneyTransferRequest) => Promise<MoneyTransferResult>;
  payBill: (billId: string, accountId: string, amount: number) => Promise<boolean>;
  payCreditCardBill: (cardId: string, sourceAccountId: string, amount: number) => Promise<boolean>;
  submitLoanApplication: (loan: Partial<LoanApplication>) => Promise<LoanApplication>;
  toggleFreezeCreditCard: (cardId: string) => void;
  addBeneficiary: (ben: Omit<Beneficiary, 'id'>) => void;
  createSupportTicket: (ticket: Partial<SupportTicket>) => void;
  updateLoanStatus: (loanId: string, status: LoanApplication['status'], notes?: string) => Promise<void>;
  advanceLoanStage: (loanId: string, nextStage: LoanApplication['stage'], notes?: string) => Promise<void>;
  disburseLoan: (loanId: string, targetAccountId: string) => Promise<void>;
  markAllNotificationsRead: () => void;
  exportTransactions: (format: 'CSV' | 'JSON') => void;
  downloadStatement: () => Promise<void>;

  // Custom Test Data Handlers
  addCustomAccount: (acc: Partial<BankAccount>) => void;
  addCustomTransaction: (tx: Partial<Transaction>) => void;
  addCustomBeneficiary: (ben: Partial<Beneficiary>) => void;
  addCustomBill: (bill: Partial<BillPayment>) => void;
  addCustomLoan: (loan: Partial<LoanApplication>) => void;
  importCustomData: (jsonStr: string) => boolean;
  resetToDefaultData: () => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPersonaKey, setCurrentPersonaKey] = useState<string>('customer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_PERSONAS.customer);
  const [accounts, setAccounts] = useState<BankAccount[]>(DEFAULT_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(generateSeedTransactions(120));
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(DEFAULT_BENEFICIARIES);
  const [bills, setBills] = useState<BillPayment[]>(DEFAULT_BILLS);
  const [loans, setLoans] = useState<LoanApplication[]>(DEFAULT_LOANS);
  const [creditCards, setCreditCards] = useState<CreditCardDetails[]>(DEFAULT_CREDIT_CARDS);
  const [investments, setInvestments] = useState<InvestmentAsset[]>(DEFAULT_INVESTMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'tkt_801',
      subject: 'Inquiry regarding Wire Transfer limits for Escrow',
      category: 'TRANSFER',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: '2026-07-29T14:20:00Z',
      updatedAt: '2026-07-30T09:15:00Z',
      messages: [
        {
          sender: 'John Doe',
          timestamp: '2026-07-29T14:20:00Z',
          message: 'Hello, I will need to wire $120,000 next Tuesday for home closing escrow. What documents are needed?',
          isAgent: false,
        },
        {
          sender: 'David Miller (Support Agent)',
          timestamp: '2026-07-30T09:15:00Z',
          message: 'Hello Mr. Doe, for transfers over $100k, please upload your purchase agreement under KYC Documents or present your photo ID at any branch.',
          isAgent: true,
        },
      ],
    },
  ]);
  const [featureFlags, setFeatureFlags] = useState<ChaosFeatureFlags>(DEFAULT_CHAOS_FLAGS);
  const [auditLogs, setAuditLogs] = useState<ApiAuditLog[]>(generateSeedAuditLogs(25));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeView, setActiveView] = useState<string>('dashboard');

  const loadPersonaData = (personaKey: string) => {
    const ds = PERSONA_DATASETS[personaKey] || PERSONA_DATASETS.customer;
    if (ds) {
      setAccounts(ds.accounts);
      setTransactions(ds.transactions);
      setLoans(ds.loans);
      setCreditCards(ds.cards);
      setInvestments(ds.investments);
      setBeneficiaries(ds.beneficiaries);
      setBills(ds.bills);
    }
  };

  const login = (personaKey?: string) => {
    const key = personaKey && DEMO_PERSONAS[personaKey] ? personaKey : 'customer';
    setCurrentPersonaKey(key);
    setCurrentUser(DEMO_PERSONAS[key]);
    loadPersonaData(key);
    setIsAuthenticated(true);
    setActiveView('dashboard');
    addToast({
      type: 'success',
      title: 'Welcome Back',
      message: `Signed in as ${DEMO_PERSONAS[key].name} (${DEMO_PERSONAS[key].role})`,
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been securely signed out of TestGrid Demo Bank.',
    });
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchPersona = (personaKey: string) => {
    if (DEMO_PERSONAS[personaKey]) {
      setCurrentPersonaKey(personaKey);
      setCurrentUser(DEMO_PERSONAS[personaKey]);
      loadPersonaData(personaKey);
      setActiveView('dashboard');
      addToast({
        type: 'info',
        title: 'Persona Switch',
        message: `Active User switched to ${DEMO_PERSONAS[personaKey].name} (${DEMO_PERSONAS[personaKey].role})`,
      });
    }
  };

  const updateFeatureFlags = (flags: Partial<ChaosFeatureFlags>) => {
    setFeatureFlags((prev) => {
      const updated = { ...prev, ...flags };
      addToast({
        type: 'warning',
        title: 'Chaos Test Suite Configured',
        message: 'Updated system feature flags & defect parameters.',
      });
      return updated;
    });
  };

  const simulateDelay = async () => {
    if (featureFlags.apiLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, featureFlags.apiLatencyMs));
    }
  };

  const requestDemoApi = async (endpoint: string, payload: Record<string, unknown>) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Request to ${endpoint} failed with HTTP ${response.status}.`);
      }
      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The demo API request failed.';
      addToast({ type: 'error', title: 'Demo API Request Failed', message });
      throw error;
    }
  };

  const executeTransfer = async (req: MoneyTransferRequest): Promise<MoneyTransferResult> => {
    await simulateDelay();

    if (featureFlags.randomApiFailures && Math.random() * 100 < featureFlags.failureRatePercent) {
      addToast({
        type: 'error',
        title: `Transfer Failed (Chaos Injected HTTP ${featureFlags.injectedErrorCode})`,
        message: 'Automated defect testing simulated transfer failure.',
      });
      throw new Error(`Injected Chaos API Error: HTTP ${featureFlags.injectedErrorCode}`);
    }

    const sourceAcc = accounts.find((a) => a.id === req.fromAccountId);
    if (!sourceAcc || sourceAcc.availableBalance < req.amount) {
      addToast({
        type: 'error',
        title: 'Insufficient Funds',
        message: `Account ${sourceAcc?.name || ''} has insufficient available balance for $${req.amount}.`,
      });
      throw new Error('Insufficient Funds');
    }

    await requestDemoApi('/api/transfers', {
      ...req,
      toAccountName:
        (req.toAccountId && (
          accounts.find((account) => account.id === req.toAccountId)?.name ||
          INTERNAL_BANK_ACCOUNTS.find((account) => account.id === req.toAccountId)?.name
        )) ||
        req.externalBankName ||
        'External Beneficiary',
    });

    // Deduct balance
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === req.fromAccountId) {
        return {
          ...acc,
          balance: acc.balance - req.amount,
          availableBalance: acc.availableBalance - req.amount,
        };
      }
      if (req.toAccountId && acc.id === req.toAccountId) {
        return {
          ...acc,
          balance: acc.balance + req.amount,
          availableBalance: acc.availableBalance + req.amount,
        };
      }
      return acc;
    });
    setAccounts(updatedAccounts);

    const refNum = `WTB-TRF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const corrId = `corr-wtb-${Math.random().toString(36).substring(2, 9)}`;

    // Add transaction record
    const targetName = req.toAccountId
      ? accounts.find((a) => a.id === req.toAccountId)?.name ||
        INTERNAL_BANK_ACCOUNTS.find((a) => a.id === req.toAccountId)?.name ||
        'Internal Account'
      : req.externalBankName || 'External Beneficiary';

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      accountId: req.fromAccountId,
      accountName: sourceAcc.name,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      merchant: `Transfer to ${targetName}`,
      category: 'Transfer',
      amount: -req.amount,
      status: 'COMPLETED',
      description: `Transfer ref ${refNum}. Memo: ${req.memo || 'None'}`,
      merchantLogo: '💸',
      referenceNumber: refNum,
      channel: req.transferType as any,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Add Audit Log
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        method: 'POST',
        endpoint: '/api/transfers',
        statusCode: 201,
        latencyMs: featureFlags.apiLatencyMs || 85,
        correlationId: corrId,
        clientIp: '192.168.1.102',
        requestBodyPreview: JSON.stringify({ amount: req.amount, refNum }),
      },
      ...prev,
    ]);

    const result: MoneyTransferResult = {
      id: `trf_${Date.now()}`,
      referenceNumber: refNum,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      fromAccountName: sourceAcc.name,
      toAccountName: targetName,
      amount: req.amount,
      fee: req.transferType === 'WIRE' ? 25.0 : req.transferType === 'INTERNATIONAL' ? 45.0 : 0.0,
      estimatedSettlement: req.transferType === 'INTERNAL' ? 'Immediate' : '1 Business Day',
      correlationId: corrId,
    };

    addToast({
      type: 'success',
      title: 'Transfer Completed',
      message: `Successfully transferred $${req.amount.toFixed(2)} (Ref: ${refNum})`,
    });

    return result;
  };

  const payCreditCardBill = async (cardId: string, sourceAccountId: string, amount: number): Promise<boolean> => {
    await simulateDelay();
    const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
    if (!sourceAcc || sourceAcc.availableBalance < amount) {
      addToast({
        type: 'error',
        title: 'Payment Failed',
        message: 'Insufficient balance in selected account to pay credit card bill.',
      });
      return false;
    }

    try {
      await requestDemoApi('/api/cards/payment', { cardId, sourceAccountId, amount });
    } catch {
      return false;
    }

    setAccounts((prev) =>
      prev.map((a) => (a.id === sourceAccountId ? { ...a, balance: a.balance - amount, availableBalance: a.availableBalance - amount } : a))
    );

    setCreditCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const newBalance = Math.max(0, card.currentBalance - amount);
          const newAvailable = card.creditLimit - newBalance;
          return {
            ...card,
            currentBalance: newBalance,
            availableCredit: newAvailable,
            lastPaymentAmount: amount,
            lastPaymentDate: new Date().toISOString().split('T')[0],
          };
        }
        return card;
      })
    );

    const cardObj = creditCards.find((c) => c.id === cardId);
    const refNum = `WTB-CCPAY-${Math.floor(10000000 + Math.random() * 90000000)}`;

    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        accountId: sourceAccountId,
        accountName: sourceAcc.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        merchant: `Credit Card Bill Payment (${cardObj?.cardType.replace('_', ' ') || 'Visa'})`,
        category: 'Credit Card Payment',
        amount: -amount,
        status: 'COMPLETED',
        description: `Statement payment for card ending in ${cardObj?.cardNumberMasked.slice(-4) || '4892'}. Ref: ${refNum}`,
        merchantLogo: '💳',
        referenceNumber: refNum,
        channel: 'INTERNAL',
      },
      ...prev,
    ]);

    addToast({
      type: 'success',
      title: 'Credit Card Bill Paid',
      message: `Payment of $${amount.toFixed(2)} applied to card ending in ${cardObj?.cardNumberMasked.slice(-4) || '4892'}.`,
    });

    return true;
  };

  const payBill = async (billId: string, accountId: string, amount: number): Promise<boolean> => {
    await simulateDelay();
    const sourceAcc = accounts.find((a) => a.id === accountId);
    if (!sourceAcc || sourceAcc.availableBalance < amount) {
      addToast({
        type: 'error',
        title: 'Payment Failed',
        message: 'Insufficient balance for bill payment.',
      });
      return false;
    }

    const billObj = bills.find((bill) => bill.id === billId);
    try {
      await requestDemoApi('/api/bills/pay', {
        billId,
        billerName: billObj?.billerName,
        accountId,
        amount,
      });
    } catch {
      return false;
    }

    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: a.balance - amount, availableBalance: a.availableBalance - amount } : a))
    );

    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: 'PAID',
              lastPaymentDate: new Date().toISOString().split('T')[0],
              lastPaymentAmount: amount,
            }
          : b
      )
    );

    const refNum = `WTB-PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        accountId,
        accountName: sourceAcc.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        merchant: billObj?.billerName || 'Bill Payment',
        category: 'Utilities',
        amount: -amount,
        status: 'COMPLETED',
        description: `Bill Payment for ${billObj?.accountNumber || 'Utility'}`,
        merchantLogo: '📄',
        referenceNumber: refNum,
        channel: 'ACH',
      },
      ...prev,
    ]);

    addToast({
      type: 'success',
      title: 'Bill Paid',
      message: `Paid $${amount.toFixed(2)} to ${billObj?.billerName}`,
    });

    return true;
  };

  const submitLoanApplication = async (loanData: Partial<LoanApplication>): Promise<LoanApplication> => {
    await simulateDelay();
    await requestDemoApi('/api/loans/apply', {
      ...loanData,
      applicantName: currentUser.name,
      userId: currentUser.id,
    });
    const newLoan: LoanApplication = {
      id: `loan_app_${Date.now()}`,
      userId: currentUser.id,
      applicantName: currentUser.name,
      loanType: loanData.loanType || 'PERSONAL',
      requestedAmount: loanData.requestedAmount || 10000,
      termMonths: loanData.termMonths || 36,
      estimatedInterestRate: loanData.estimatedInterestRate || 6.5,
      monthlyPayment: loanData.monthlyPayment || 320,
      purpose: loanData.purpose || 'General Financing',
      annualIncome: loanData.annualIncome || 120000,
      status: 'SUBMITTED',
      appliedDate: new Date().toISOString().split('T')[0],
      documents: loanData.documents || [
        { name: 'Income_Proof_W2.pdf', size: '1.1 MB', type: 'application/pdf', uploadedAt: new Date().toISOString().split('T')[0] },
      ],
    };

    setLoans((prev) => [newLoan, ...prev]);

    addToast({
      type: 'success',
      title: 'Loan Application Submitted',
      message: `Loan App ID ${newLoan.id} submitted for underwriting review.`,
    });

    return newLoan;
  };

  const updateLoanStatus = async (loanId: string, status: LoanApplication['status'], notes?: string) => {
    const loan = loans.find((item) => item.id === loanId);
    if (!loan) return;
    try {
      await requestDemoApi('/api/loans/stage', {
        loanId,
        nextStage: status === 'APPROVED' || status === 'REJECTED' || status === 'DISBURSED' ? status : loan.stage,
        status,
        notes,
      });
    } catch {
      return;
    }
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status, reviewerNotes: notes || l.reviewerNotes } : l))
    );
    addToast({
      type: 'info',
      title: 'Loan Application Updated',
      message: `Loan ${loanId} status set to ${status}`,
    });
  };

  const toggleFreezeCreditCard = (cardId: string) => {
    setCreditCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const isNowFrozen = !c.isFrozen;
          addToast({
            type: isNowFrozen ? 'warning' : 'success',
            title: isNowFrozen ? 'Card Frozen' : 'Card Unfrozen',
            message: `Card ending in ${c.cardNumberMasked.slice(-4)} is now ${isNowFrozen ? 'frozen' : 'active'}.`,
          });
          return { ...c, isFrozen: isNowFrozen };
        }
        return c;
      })
    );
  };

  const addBeneficiary = (ben: Omit<Beneficiary, 'id'>) => {
    const newBen = { ...ben, id: `ben_${Date.now()}` };
    setBeneficiaries((prev) => [...prev, newBen]);
    addToast({
      type: 'success',
      title: 'Beneficiary Added',
      message: `${ben.name} added to saved transfer beneficiaries.`,
    });
  };

  const createSupportTicket = (ticket: Partial<SupportTicket>) => {
    const newTkt: SupportTicket = {
      id: `tkt_${Date.now()}`,
      subject: ticket.subject || 'Support Inquiry',
      category: ticket.category || 'ACCOUNT',
      priority: ticket.priority || 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          sender: currentUser.name,
          timestamp: new Date().toISOString(),
          message: ticket.messages?.[0]?.message || 'Please assist with my request.',
          isAgent: false,
        },
      ],
    };

    setSupportTickets((prev) => [newTkt, ...prev]);
    addToast({
      type: 'success',
      title: 'Ticket Created',
      message: `Support ticket #${newTkt.id} submitted successfully.`,
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const exportTransactions = (format: 'CSV' | 'JSON') => {
    if (format === 'CSV') {
      const headers = ['ID', 'Date', 'Account', 'Merchant', 'Category', 'Amount', 'Status', 'RefNumber'];
      const rows = transactions.map((t) => [
        t.id,
        t.date,
        `"${t.accountName}"`,
        `"${t.merchant}"`,
        t.category,
        t.amount,
        t.status,
        t.referenceNumber,
      ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TestGrid_Demo_Bank_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TestGrid_Demo_Bank_Transactions_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  const downloadStatement = async () => {
    const account = accounts[0];
    const statementPeriod = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    try {
      await requestDemoApi('/api/statements/download', {
        accountId: account?.id,
        statementPeriod,
        format: 'CSV',
      });
    } catch {
      return;
    }

    const headers = ['Date', 'Account', 'Description', 'Category', 'Amount', 'Status', 'Reference'];
    const csvEscape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = transactions.map((transaction) => [
      transaction.date,
      transaction.accountName,
      transaction.merchant,
      transaction.category,
      transaction.amount.toFixed(2),
      transaction.status,
      transaction.referenceNumber,
    ]);
    const csvContent = [
      ['TestGrid Demo Bank Statement', statementPeriod].map(csvEscape).join(','),
      ['Account', account?.name || 'All accounts'].map(csvEscape).join(','),
      '',
      headers.map(csvEscape).join(','),
      ...rows.map((row) => row.map(csvEscape).join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `TestGrid_Demo_Bank_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    addToast({ type: 'success', title: 'Statement Downloaded', message: `${statementPeriod} statement saved as a CSV file.` });
  };

  const advanceLoanStage = async (loanId: string, nextStage: LoanApplication['stage'], notes?: string) => {
    try {
      await requestDemoApi('/api/loans/stage', { loanId, nextStage, notes });
    } catch {
      return;
    }
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          const updatedStatus = nextStage === 'APPROVED' ? 'APPROVED' : nextStage === 'DISBURSED' ? 'DISBURSED' : nextStage === 'REJECTED' ? 'REJECTED' : 'UNDER_REVIEW';
          return {
            ...l,
            stage: nextStage,
            status: updatedStatus,
            reviewerNotes: notes || l.reviewerNotes,
          };
        }
        return l;
      })
    );
    addToast({
      type: 'success',
      title: 'Loan Processing Advanced',
      message: `Application moved to stage: ${nextStage}`,
    });
  };

  const disburseLoan = async (loanId: string, targetAccountId: string): Promise<void> => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    try {
      await requestDemoApi('/api/loans/disburse', {
        loanId,
        targetAccountId,
        amount: loan.requestedAmount,
      });
    } catch {
      return;
    }

    // Credit target account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === targetAccountId) {
          return {
            ...acc,
            balance: acc.balance + loan.requestedAmount,
            availableBalance: acc.availableBalance + loan.requestedAmount,
          };
        }
        return acc;
      })
    );

    // Record credit transaction
    const targetAcc = accounts.find((a) => a.id === targetAccountId);
    const refNum = `WTB-DISBURSED-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: Transaction = {
      id: `tx_loan_disburse_${Date.now()}`,
      accountId: targetAccountId,
      accountName: targetAcc?.name || 'Bank Account',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      merchant: `Loan Disbursement - ${loan.loanType} Financing`,
      category: 'Transfer',
      amount: loan.requestedAmount,
      status: 'COMPLETED',
      description: `Disbursed loan funds ref ${refNum} into ${targetAcc?.name}.`,
      merchantLogo: '🏦',
      referenceNumber: refNum,
      channel: 'ACH',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update loan status
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? { ...l, status: 'DISBURSED', stage: 'DISBURSED', disbursedToAccountId: targetAccountId }
          : l
      )
    );

    addToast({
      type: 'success',
      title: 'Loan Disbursed!',
      message: `$${loan.requestedAmount.toLocaleString()} credited to ${targetAcc?.name || 'account'}.`,
    });
  };

  const addCustomAccount = (acc: Partial<BankAccount>) => {
    const newAcc: BankAccount = {
      id: `acc_custom_${Date.now()}`,
      accountNumber: acc.accountNumber || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      routingNumber: acc.routingNumber || '121000358',
      accountType: acc.accountType || 'CHECKING',
      name: acc.name || 'Custom Test Account',
      balance: acc.balance ?? 1000,
      availableBalance: acc.availableBalance ?? acc.balance ?? 1000,
      currency: acc.currency || 'USD',
      iban: acc.iban || `US89121000358${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      interestRate: acc.interestRate ?? 0.1,
      status: 'ACTIVE',
      lastUpdated: new Date().toISOString(),
    };
    setAccounts((prev) => [newAcc, ...prev]);
    addToast({ type: 'success', title: 'Test Account Created', message: `Added ${newAcc.name} ($${newAcc.balance.toLocaleString()})` });
  };

  const addCustomTransaction = (tx: Partial<Transaction>) => {
    const acc = accounts.find((a) => a.id === tx.accountId) || accounts[0];
    const newTx: Transaction = {
      id: `tx_custom_${Date.now()}`,
      accountId: acc?.id || 'acc_chk_101',
      accountName: acc?.name || 'Checking Account',
      date: tx.date || new Date().toISOString().replace('T', ' ').substring(0, 19),
      merchant: tx.merchant || 'Custom Test Merchant',
      category: tx.category || 'Shopping',
      amount: tx.amount ?? -50,
      status: tx.status || 'COMPLETED',
      description: tx.description || 'Manual custom test transaction entry',
      merchantLogo: tx.merchantLogo || '💳',
      referenceNumber: `WTB-TEST-${Math.floor(100000 + Math.random() * 900000)}`,
      channel: tx.channel || 'ONLINE',
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (acc) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === acc.id ? { ...a, balance: a.balance + newTx.amount, availableBalance: a.availableBalance + newTx.amount } : a))
      );
    }

    addToast({ type: 'success', title: 'Test Transaction Added', message: `Recorded ${newTx.merchant} (${newTx.amount >= 0 ? '+' : ''}$${newTx.amount})` });
  };

  const addCustomBeneficiary = (ben: Partial<Beneficiary>) => {
    const newBen: Beneficiary = {
      id: `ben_custom_${Date.now()}`,
      name: ben.name || 'Custom Test Beneficiary',
      bankName: ben.bankName || 'Test National Bank',
      accountNumber: ben.accountNumber || '9988776655',
      routingNumber: ben.routingNumber || '121000358',
      nickname: ben.nickname || ben.name || 'Custom Beneficiary',
      email: ben.email || 'test.beneficiary@example.com',
      type: ben.type || 'DOMESTIC_ACH',
    };
    setBeneficiaries((prev) => [...prev, newBen]);
    addToast({ type: 'success', title: 'Beneficiary Added', message: `Added ${newBen.name}` });
  };

  const addCustomBill = (bill: Partial<BillPayment>) => {
    const newBill: BillPayment = {
      id: `bill_custom_${Date.now()}`,
      billerName: bill.billerName || 'Custom Utility Biller',
      billerCategory: bill.billerCategory || 'Electricity',
      accountNumber: bill.accountNumber || 'UTIL-9901',
      amountDue: bill.amountDue ?? 100,
      dueDate: bill.dueDate || '2026-08-30',
      status: bill.status || 'UNPAID',
    };
    setBills((prev) => [...prev, newBill]);
    addToast({ type: 'success', title: 'Bill Created', message: `Created bill for ${newBill.billerName} ($${newBill.amountDue})` });
  };

  const addCustomLoan = (loan: Partial<LoanApplication>) => {
    const newLoan: LoanApplication = {
      id: `loan_custom_${Date.now()}`,
      userId: currentUser.id,
      applicantName: currentUser.name,
      loanType: loan.loanType || 'PERSONAL',
      requestedAmount: loan.requestedAmount || 20000,
      termMonths: loan.termMonths || 36,
      estimatedInterestRate: loan.estimatedInterestRate || 6.5,
      monthlyPayment: loan.monthlyPayment || 613,
      purpose: loan.purpose || 'Custom Test Loan Application',
      annualIncome: loan.annualIncome || 120000,
      status: loan.status || 'UNDER_REVIEW',
      stage: loan.stage || 'APPLICATION_RECEIVED',
      appliedDate: new Date().toISOString().split('T')[0],
      documents: loan.documents || [{ name: 'Income_Proof.pdf', size: '500 KB', type: 'application/pdf', uploadedAt: new Date().toISOString().split('T')[0] }],
      reviewerNotes: loan.reviewerNotes || 'Custom user testing loan entry',
    };
    setLoans((prev) => [newLoan, ...prev]);
    addToast({ type: 'success', title: 'Test Loan Created', message: `Created ${newLoan.loanType} loan for $${newLoan.requestedAmount}` });
  };

  const importCustomData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.accounts) setAccounts(parsed.accounts);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.beneficiaries) setBeneficiaries(parsed.beneficiaries);
      if (parsed.bills) setBills(parsed.bills);
      if (parsed.loans) setLoans(parsed.loans);
      addToast({ type: 'success', title: 'Data Import Successful', message: 'Custom test JSON dataset loaded into application state.' });
      return true;
    } catch (err) {
      addToast({ type: 'error', title: 'Data Import Failed', message: 'Invalid JSON payload structure provided.' });
      return false;
    }
  };

  const resetToDefaultData = () => {
    setAccounts(DEFAULT_ACCOUNTS);
    setTransactions(generateSeedTransactions(120));
    setBeneficiaries(DEFAULT_BENEFICIARIES);
    setBills(DEFAULT_BILLS);
    setLoans(DEFAULT_LOANS);
    addToast({ type: 'info', title: 'Data Reset', message: 'Restored system to initial enterprise seed dataset.' });
  };

  return (
    <BankContext.Provider
      value={{
        currentUser,
        accounts,
        transactions,
        beneficiaries,
        bills,
        loans,
        creditCards,
        investments,
        notifications,
        supportTickets,
        featureFlags,
        auditLogs,
        toasts,
        currentPersonaKey,
        activeView,
        isAuthenticated,
        setActiveView,
        switchPersona,
        login,
        logout,
        updateFeatureFlags,
        addToast,
        removeToast,
        executeTransfer,
        payBill,
        payCreditCardBill,
        submitLoanApplication,
        toggleFreezeCreditCard,
        addBeneficiary,
        createSupportTicket,
        updateLoanStatus,
        advanceLoanStage,
        disburseLoan,
        markAllNotificationsRead,
        exportTransactions,
        downloadStatement,
        addCustomAccount,
        addCustomTransaction,
        addCustomBeneficiary,
        addCustomBill,
        addCustomLoan,
        importCustomData,
        resetToDefaultData,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
