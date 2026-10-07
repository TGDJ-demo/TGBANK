import React, { useState, useEffect } from 'react';
import { useBank } from '../context/BankContext';
import { INTERNAL_BANK_ACCOUNTS } from '../mockData';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  CreditCard,
  Building,
  TrendingUp,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Plus,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    accounts,
    transactions,
    bills,
    executeTransfer,
    setActiveView,
    addToast,
    featureFlags,
  } = useBank();

  const [showAccountDetails, setShowAccountDetails] = useState(true);
  const [quickTransferAmount, setQuickTransferAmount] = useState('250.00');
  const [quickTransferTarget, setQuickTransferTarget] = useState('acc_sav_102');
  const [sendQuickReceipt, setSendQuickReceipt] = useState<boolean>(true);
  const [isTransferring, setIsTransferring] = useState(false);

  const hasA11yDefects = featureFlags.accessibilityDefects;

  const checkingAcc = accounts.find((a) => a.accountType === 'CHECKING') || accounts[0];
  const savingsAcc = accounts.find((a) => a.accountType === 'SAVINGS') || accounts[1];
  const ccAcc = accounts.find((a) => a.accountType === 'CREDIT_CARD');
  const invAcc = accounts.find((a) => a.accountType === 'INVESTMENT');

  // Synchronize quickTransferTarget when accounts or checkingAcc changes
  useEffect(() => {
    const ownTargets = accounts.filter((a) => a.id !== checkingAcc?.id).map((a) => a.id);
    const validTargets = ownTargets.length > 0 ? ownTargets : INTERNAL_BANK_ACCOUNTS.map((a) => a.id);
    if (!validTargets.includes(quickTransferTarget) && validTargets.length > 0) {
      setQuickTransferTarget(validTargets[0]);
    }
  }, [accounts, checkingAcc?.id, quickTransferTarget]);

  const totalAssets = accounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = Math.abs(
    accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0)
  );

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingAcc) return;
    setIsTransferring(true);
    try {
      await executeTransfer({
        fromAccountId: checkingAcc.id,
        toAccountId: quickTransferTarget,
        amount: parseFloat(quickTransferAmount),
        transferType: 'INTERNAL',
        memo: 'Quick Transfer from Dashboard Widget',
      });
      setQuickTransferAmount('250.00');
    } catch (err: any) {
      // handled in context
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div id="dashboard-view-container" data-testid="dashboard-view-container" className="space-y-4">
      {/* Welcome & Net Worth Header */}
      <div
        id="dashboard-welcome-banner"
        data-testid="dashboard-welcome-banner"
        className="bg-[#002D72] border border-[#001D4A] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white"
      >
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 id="heading-dashboard-welcome" data-testid="heading-dashboard-welcome" className="text-xl font-bold tracking-tight text-white">
              Good day, {currentUser.name}
            </h1>
            <span
              id="badge-persona-role"
              data-testid="badge-persona-role"
              className="px-2 py-0.5 bg-blue-900/80 text-blue-100 border border-blue-400/30 rounded text-xs font-bold"
            >
              {currentUser.role}
            </span>
          </div>
          <p id="subtext-last-login" data-testid="subtext-last-login" className="text-xs text-blue-100 mt-0.5">
            Last secure login: Today at 11:30 AM PST • IP: 192.168.1.102 • TestGrid Security Shield Active
          </p>
        </div>

        <div className="flex items-center space-x-5 bg-white/10 p-3 rounded border border-white/20">
          <div>
            <div id="lbl-total-net-worth" data-testid="lbl-total-net-worth" className="text-[10px] font-extrabold text-blue-100 uppercase tracking-wider">
              Total Net Worth
            </div>
            <div
              id="val-total-net-worth"
              data-testid="val-total-net-worth"
              className="text-2xl font-bold font-mono text-emerald-300"
            >
              ${showAccountDetails ? (totalAssets - totalLiabilities).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••••••'}
            </div>
          </div>
          <button
            id="btn-toggle-balance-visibility"
            data-testid="btn-toggle-balance-visibility"
            name="toggle-balance-visibility"
            aria-label={hasA11yDefects ? undefined : 'Toggle Account Balance Visibility'}
            onClick={() => setShowAccountDetails(!showAccountDetails)}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
          >
            {showAccountDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Primary Account Cards Grid */}
      <div id="grid-account-cards" data-testid="grid-account-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Checking Card */}
        <div
          id="card-checking-account"
          data-testid="card-checking-account"
          className="bg-white border border-slate-200 hover:border-[#002D72] rounded-lg p-4 shadow-sm transition flex flex-col justify-between space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <span id="label-checking-type" data-testid="label-checking-type" className="text-[11px] font-extrabold text-[#002D72] uppercase tracking-wider">
                Checking
              </span>
              <h3 id="name-checking-account" data-testid="name-checking-account" className="text-xs font-bold text-slate-900 mt-0.5">
                {checkingAcc?.name}
              </h3>
              <p id="num-checking-account" data-testid="num-checking-account" className="text-[11px] text-slate-500 font-mono">
                ****{checkingAcc?.accountNumber.slice(-4)}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-50 text-[#002D72] rounded flex items-center justify-center border border-blue-200 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Available Balance</p>
            <p id="card-checking-balance" data-testid="card-checking-balance" className="text-lg font-bold font-mono text-slate-900">
              ${showAccountDetails ? checkingAcc?.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••••'}
            </p>
          </div>
          <button
            id="btn-view-checking-details"
            data-testid="btn-view-checking-details"
            onClick={() => setActiveView('accounts')}
            className="text-xs text-[#002D72] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>View Account Activity</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Savings Card */}
        <div
          id="card-savings-account"
          data-testid="card-savings-account"
          className="bg-white border border-slate-200 hover:border-emerald-600 rounded-lg p-4 shadow-sm transition flex flex-col justify-between space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <span id="label-savings-type" data-testid="label-savings-type" className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                High Yield Savings
              </span>
              <h3 id="name-savings-account" data-testid="name-savings-account" className="text-xs font-bold text-slate-900 mt-0.5">
                {savingsAcc?.name}
              </h3>
              <p id="num-savings-account" data-testid="num-savings-account" className="text-[11px] text-slate-500 font-mono">
                ****{savingsAcc?.accountNumber.slice(-4)}
              </p>
            </div>
            <div className="w-8 h-8 bg-emerald-50 text-emerald-700 rounded flex items-center justify-center border border-emerald-200 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Balance ({savingsAcc?.interestRate}% APY)</p>
            <p id="card-savings-balance" data-testid="card-savings-balance" className="text-lg font-bold font-mono text-slate-900">
              ${showAccountDetails ? savingsAcc?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••••'}
            </p>
          </div>
          <button
            id="btn-view-savings-details"
            data-testid="btn-view-savings-details"
            onClick={() => setActiveView('accounts')}
            className="text-xs text-emerald-800 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>Deposit & Transfer</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Credit Card Card */}
        <div
          id="card-credit-card-account"
          data-testid="card-credit-card-account"
          className="bg-white border border-slate-200 hover:border-purple-600 rounded-lg p-4 shadow-sm transition flex flex-col justify-between space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <span id="label-credit-type" data-testid="label-credit-type" className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider">
                Credit Card
              </span>
              <h3 id="name-credit-account" data-testid="name-credit-account" className="text-xs font-bold text-slate-900 mt-0.5">
                {ccAcc?.name}
              </h3>
              <p id="num-credit-account" data-testid="num-credit-account" className="text-[11px] text-slate-500 font-mono">
                ****{ccAcc?.accountNumber.slice(-4)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-50 text-purple-700 rounded flex items-center justify-center border border-purple-200 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Current Balance / Limit</p>
            <p id="card-credit-balance" data-testid="card-credit-balance" className="text-lg font-bold font-mono text-slate-900">
              ${showAccountDetails ? Math.abs(ccAcc?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••••'}
              <span className="text-xs font-normal text-slate-500 ml-1">/ ${ccAcc?.creditLimit?.toLocaleString()}</span>
            </p>
          </div>
          <button
            id="btn-view-credit-details"
            data-testid="btn-view-credit-details"
            onClick={() => setActiveView('cards')}
            className="text-xs text-purple-800 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>Manage Card & Rewards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Investments Card */}
        <div
          id="card-investments-account"
          data-testid="card-investments-account"
          className="bg-white border border-slate-200 hover:border-amber-600 rounded-lg p-4 shadow-sm transition flex flex-col justify-between space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <span id="label-investments-type" data-testid="label-investments-type" className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">
                Investments
              </span>
              <h3 id="name-investments-account" data-testid="name-investments-account" className="text-xs font-bold text-slate-900 mt-0.5">
                {invAcc?.name}
              </h3>
              <p id="num-investments-account" data-testid="num-investments-account" className="text-[11px] text-slate-500 font-mono">
                ****{invAcc?.accountNumber.slice(-4)}
              </p>
            </div>
            <div className="w-8 h-8 bg-amber-50 text-amber-700 rounded flex items-center justify-center border border-amber-200 shrink-0">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-medium">Total Portfolio Value</p>
            <p id="card-investment-balance" data-testid="card-investment-balance" className="text-lg font-bold font-mono text-slate-900">
              ${showAccountDetails ? invAcc?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '••••••'}
            </p>
          </div>
          <button
            id="btn-view-investments-details"
            data-testid="btn-view-investments-details"
            onClick={() => setActiveView('investments')}
            className="text-xs text-amber-800 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>View Holdings & Trades</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Columns: Recent Transactions + Spending Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Transactions Widget */}
          <div id="widget-recent-transactions" data-testid="widget-recent-transactions" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 id="heading-recent-transactions" data-testid="heading-recent-transactions" className="text-sm font-bold text-slate-900">
                  Recent Account Transactions
                </h3>
                <p className="text-[11px] text-slate-500">Live ledger activity across checking & savings</p>
              </div>
              <button
                id="btn-view-all-transactions"
                data-testid="btn-view-all-transactions"
                onClick={() => setActiveView('transactions')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#002D72] border border-slate-300 rounded text-xs font-bold transition cursor-pointer"
              >
                View Full Ledger
              </button>
            </div>

            <div className="space-y-1.5">
              {transactions.slice(0, 6).map((tx) => (
                <div
                  key={tx.id}
                  id={`transaction-row-${tx.id}`}
                  data-testid={`transaction-row-${tx.id}`}
                  className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded transition border border-slate-200"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-sm shrink-0 border border-slate-200">
                      {tx.merchantLogo || '💳'}
                    </div>
                    <div>
                      <div id={`tx-merchant-${tx.id}`} data-testid={`tx-merchant-${tx.id}`} className="text-xs font-bold text-slate-900">
                        {tx.merchant}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                        <span>{tx.date.split(' ')[0]}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      id={`tx-amount-${tx.id}`}
                      data-testid={`tx-amount-${tx.id}`}
                      className={`text-xs font-bold font-mono ${tx.amount > 0 ? 'text-emerald-700' : 'text-slate-900'}`}
                    >
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </div>
                    <span
                      id={`tx-status-${tx.id}`}
                      data-testid={`tx-status-${tx.id}`}
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Spending & Budget Breakdown */}
          <div id="widget-spending-chart" data-testid="widget-spending-chart" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 id="heading-monthly-spending" data-testid="heading-monthly-spending" className="text-sm font-bold text-slate-900 mb-3">
              Monthly Category Spending & Budget
            </h3>
            <div className="space-y-2.5">
              {[
                { category: 'Groceries & Household', spent: 680, budget: 850, pct: 80, color: 'bg-emerald-600' },
                { category: 'Dining & Restaurants', spent: 340, budget: 400, pct: 85, color: 'bg-blue-600' },
                { category: 'Shopping & Electronics', spent: 510, budget: 500, pct: 102, color: 'bg-amber-600' },
                { category: 'Utilities & Subscriptions', spent: 280, budget: 350, pct: 80, color: 'bg-purple-600' },
              ].map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-bold">{item.category}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      ${item.spent} / ${item.budget} ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded overflow-hidden border border-slate-200">
                    <div className={`h-full ${item.color} rounded`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: FICO Score, Quick Transfer Widget, Upcoming Bills */}
        <div className="space-y-4">
          {/* Credit Score Widget */}
          <div id="widget-credit-score" data-testid="widget-credit-score" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold text-[#002D72] uppercase tracking-wider">Credit Monitoring</span>
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-center py-1">
              <div id="val-credit-score-num" data-testid="val-credit-score-num" className="text-3xl font-extrabold text-slate-900 font-mono">
                {currentUser.creditScore}
              </div>
              <p id="label-credit-rating" data-testid="label-credit-rating" className="text-xs font-bold text-emerald-800 mt-0.5">
                VERY GOOD (FICO® Score 8)
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Updated 3 days ago • Powered by Experian</p>
            </div>
          </div>

          {/* Quick Internal Transfer Widget */}
          <div id="widget-quick-transfer" data-testid="widget-quick-transfer" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h3 id="heading-quick-transfer" data-testid="heading-quick-transfer" className="text-sm font-bold text-slate-900 mb-2.5">
              Quick Transfer
            </h3>
            <form onSubmit={handleQuickSend} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">From Account</label>
                <div className="p-2 bg-slate-50 rounded text-xs text-slate-800 font-mono border border-slate-200">
                  {checkingAcc?.name} (****{checkingAcc?.accountNumber.slice(-4)})
                </div>
              </div>

              <div>
                <label id="lbl-quick-dest" data-testid="lbl-quick-dest" htmlFor="select-quick-transfer-target" className="block text-[11px] font-bold text-slate-600 mb-1">
                  To Destination Account
                </label>
                <select
                  id="select-quick-transfer-target"
                  data-testid="select-quick-transfer-target"
                  data-automation-id="select-quick-transfer-target"
                  name="quickTransferTarget"
                  value={quickTransferTarget}
                  data-value={quickTransferTarget}
                  data-selected={quickTransferTarget}
                  onChange={(e) => setQuickTransferTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#002D72]"
                >
                  {accounts.filter((a) => a.id !== checkingAcc?.id).length > 0 ? (
                    accounts
                      .filter((a) => a.id !== checkingAcc?.id)
                      .map((acc) => (
                        <option key={acc.id} id={`opt-quick-dest-${acc.id}`} data-testid={`opt-quick-dest-${acc.id}`} value={acc.id}>
                          {acc.name} (****{acc.accountNumber.slice(-4)})
                        </option>
                      ))
                  ) : (
                    INTERNAL_BANK_ACCOUNTS.map((acc) => (
                      <option key={acc.id} id={`opt-quick-dest-${acc.id}`} data-testid={`opt-quick-dest-${acc.id}`} value={acc.id}>
                        {acc.name} (****{acc.accountNumber.slice(-4)})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label id="lbl-quick-amount" data-testid="lbl-quick-amount" htmlFor="input-quick-transfer-amount" className="block text-[11px] font-bold text-slate-600">
                    Amount ($ USD)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">${quickTransferAmount}</span>
                </div>
                <input
                  id="input-quick-transfer-amount"
                  data-testid="input-quick-transfer-amount"
                  data-automation-id="input-quick-transfer-amount"
                  name="quickAmount"
                  type="number"
                  step="0.01"
                  value={quickTransferAmount}
                  onChange={(e) => setQuickTransferAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
                <input
                  id="slider-quick-transfer-amount"
                  data-testid="slider-quick-transfer-amount"
                  data-automation-id="slider-quick-transfer-amount"
                  name="quickAmountSlider"
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={parseFloat(quickTransferAmount) || 50}
                  onChange={(e) => setQuickTransferAmount(Number(e.target.value).toFixed(2))}
                  aria-valuenow={parseFloat(quickTransferAmount) || 50}
                  aria-valuemin={10}
                  aria-valuemax={1000}
                  data-value={quickTransferAmount}
                  className="w-full accent-[#002D72] mt-1.5 cursor-pointer"
                />
              </div>

              {/* Instant Receipt Confirmation Checkbox */}
              <div className="pt-1">
                <label
                  id="lbl-checkbox-quick-receipt"
                  data-testid="lbl-checkbox-quick-receipt"
                  htmlFor="checkbox-quick-transfer-receipt"
                  className="flex items-center space-x-2 text-[11px] font-bold text-slate-700 cursor-pointer select-none"
                >
                  <input
                    id="checkbox-quick-transfer-receipt"
                    data-testid="checkbox-quick-transfer-receipt"
                    data-automation-id="checkbox-quick-transfer-receipt"
                    name="sendQuickReceipt"
                    type="checkbox"
                    checked={sendQuickReceipt}
                    onChange={(e) => setSendQuickReceipt(e.target.checked)}
                    value={sendQuickReceipt ? 'true' : 'false'}
                    aria-checked={sendQuickReceipt ? 'true' : 'false'}
                    data-checked={sendQuickReceipt ? 'true' : 'false'}
                    data-state={sendQuickReceipt ? 'checked' : 'unchecked'}
                    className="w-3.5 h-3.5 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                  />
                  <span>Dispatch SMS confirmation alert</span>
                </label>
              </div>

              <button
                id="btn-quick-transfer-send"
                data-testid="btn-quick-transfer-send"
                data-automation-id="btn-quick-transfer-send"
                type="submit"
                disabled={isTransferring}
                className="w-full py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isTransferring ? 'Processing Transfer...' : 'Execute Transfer'}</span>
              </button>
            </form>
          </div>

          {/* Upcoming Bills Widget */}
          <div id="widget-upcoming-bills" data-testid="widget-upcoming-bills" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <h3 id="heading-upcoming-bills" data-testid="heading-upcoming-bills" className="text-sm font-bold text-slate-900">
                Upcoming Bills
              </h3>
              <button
                id="btn-goto-billpay"
                data-testid="btn-goto-billpay"
                onClick={() => setActiveView('billpay')}
                className="text-xs text-[#002D72] font-bold hover:underline cursor-pointer"
              >
                Pay Bills
              </button>
            </div>
            <div className="space-y-2">
              {bills.slice(0, 3).map((bill) => (
                <div key={bill.id} id={`bill-row-${bill.id}`} data-testid={`bill-row-${bill.id}`} className="p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{bill.billerName}</div>
                    <div className="text-[10px] text-slate-500">Due {bill.dueDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 font-mono">${bill.amountDue.toFixed(2)}</div>
                    <span className="text-[9px] text-amber-800 font-bold">{bill.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
