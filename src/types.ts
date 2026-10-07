export type UserRole = 'CUSTOMER' | 'PREMIUM_CUSTOMER' | 'BUSINESS' | 'LOAN_OFFICER' | 'ADMIN' | 'SUPPORT';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'EXPIRED';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  mfaEnabled: boolean;
  creditScore: number;
  memberSince: string;
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'MORTGAGE' | 'PERSONAL_LOAN' | 'INVESTMENT' | 'BUSINESS_CHECKING' | 'JOINT_SAVINGS';

export interface BankAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  accountType: AccountType;
  name: string;
  balance: number;
  availableBalance: number;
  currency: string;
  iban: string;
  interestRate: number;
  status: 'ACTIVE' | 'FROZEN' | 'DORMANT' | 'CLOSED';
  lastUpdated: string;
  creditLimit?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  accountName: string;
  date: string;
  merchant: string;
  category: 'Groceries' | 'Dining' | 'Shopping' | 'Utilities' | 'Salary' | 'Transfer' | 'Investment' | 'Travel' | 'Healthcare' | 'Entertainment' | 'Services';
  amount: number; // positive for deposit, negative for debit
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED' | 'SCHEDULED' | 'RECURRING';
  description: string;
  merchantLogo?: string;
  referenceNumber: string;
  channel: 'ONLINE' | 'ACH' | 'WIRE' | 'ATM' | 'POS' | 'MOBILE';
}

export interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  nickname: string;
  email: string;
  type: 'INTERNAL' | 'DOMESTIC_ACH' | 'WIRE' | 'INTERNATIONAL';
}

export interface MoneyTransferRequest {
  fromAccountId: string;
  toAccountId?: string;
  beneficiaryId?: string;
  externalRoutingNumber?: string;
  externalAccountNumber?: string;
  externalBankName?: string;
  amount: number;
  transferType: 'INTERNAL' | 'EXTERNAL' | 'WIRE' | 'INTERNATIONAL';
  scheduledDate?: string;
  isRecurring?: boolean;
  frequency?: 'ONCE' | 'WEEKLY' | 'MONTHLY';
  memo: string;
  otpCode?: string;
}

export interface MoneyTransferResult {
  id: string;
  referenceNumber: string;
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'FLAGGED_FOR_REVIEW';
  fromAccountName: string;
  toAccountName: string;
  amount: number;
  fee: number;
  estimatedSettlement: string;
  correlationId: string;
}

export interface BillPayment {
  id: string;
  billerName: string;
  billerCategory: 'Electricity' | 'Water' | 'Gas' | 'Internet' | 'Insurance' | 'Credit Card' | 'Property Tax' | 'Mobile';
  accountNumber: string;
  amountDue: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'AUTOPAY_SCHEDULED' | 'OVERDUE';
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface LoanApplication {
  id: string;
  userId: string;
  applicantName: string;
  loanType: 'PERSONAL' | 'HOME' | 'AUTO' | 'BUSINESS' | 'EDUCATION';
  requestedAmount: number;
  termMonths: number;
  estimatedInterestRate: number;
  monthlyPayment: number;
  purpose: string;
  annualIncome: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED';
  stage?: 'APPLICATION_RECEIVED' | 'OCR_VERIFIED' | 'CREDIT_SCORE_CHECKED' | 'UNDERWRITING_RISK_SCORED' | 'APPROVED' | 'DISBURSED' | 'REJECTED';
  creditScoreAtApp?: number;
  dtiRatio?: number;
  disbursedToAccountId?: string;
  appliedDate: string;
  documents: { name: string; size: string; type: string; uploadedAt: string }[];
  reviewerNotes?: string;
}

export interface CreditCardDetails {
  id: string;
  cardNumberMasked: string;
  cardHolderName: string;
  expiryDate: string;
  cardType: 'VISA_SIGNATURE' | 'MASTERCARD_WORLD' | 'AMEX_PLATINUM';
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  rewardsPoints: number;
  isFrozen: boolean;
  isBlocked: boolean;
  billingCycleDay: number;
  minPaymentDue: number;
  paymentDueDate: string;
  virtualCardNumber?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
}

export interface InvestmentAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'MUTUAL_FUND' | 'STOCK' | 'ETF' | 'RETIREMENT_401K' | 'BOND';
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  unrealizedGainLoss: number;
  percentageChange24h: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'ACCOUNT' | 'TRANSFER' | 'CARD' | 'LOAN' | 'SECURITY' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  messages: { sender: string; timestamp: string; message: string; isAgent: boolean; attachments?: string[] }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'PROMO';
  read: boolean;
}

export interface ChaosFeatureFlags {
  // Accessibility Defects
  accessibilityDefects: boolean; // Removes aria-labels, alt texts, bad contrast
  // Network & Latency
  apiLatencyMs: number; // 0, 100, 500, 2000, 5000
  // API Failures
  randomApiFailures: boolean; // Randomly returns 400, 500, 403 etc.
  failureRatePercent: number; // 10%, 25%, 50%
  injectedErrorCode: number; // 500, 403, 404, 429, 502
  // Visual Regression
  visualBugs: boolean; // Misaligns buttons, overlaps text
  // Security
  weakSecurityMode: boolean; // Weak password rules, missing headers
  // Performance
  heavyDomMode: boolean; // Renders 5,000 extra hidden DOM elements
  // Workflow Defects
  brokenWorkflows: boolean; // Disables submit button randomly, broken step 2
}

export interface ApiAuditLog {
  id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  correlationId: string;
  clientIp: string;
  requestBodyPreview?: string;
}
