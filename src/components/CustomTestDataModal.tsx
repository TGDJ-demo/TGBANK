import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import {
  X,
  PlusCircle,
  CreditCard,
  Receipt,
  Landmark,
  UserPlus,
  FileJson,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { AccountType, Transaction } from '../types';

interface CustomTestDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomTestDataModal: React.FC<CustomTestDataModalProps> = ({ isOpen, onClose }) => {
  const {
    accounts,
    addCustomAccount,
    addCustomTransaction,
    addCustomBeneficiary,
    addCustomBill,
    addCustomLoan,
    importCustomData,
    resetToDefaultData,
    addToast,
  } = useBank();

  const [activeTab, setActiveTab] = useState<'ACCOUNT' | 'TRANSACTION' | 'LOAN' | 'BENEFICIARY' | 'JSON'>('ACCOUNT');

  // Account Form
  const [accName, setAccName] = useState('My Custom Checking');
  const [accType, setAccType] = useState<AccountType>('CHECKING');
  const [accBalance, setAccBalance] = useState('5000');
  const [accRouting, setAccRouting] = useState('121000358');

  // Transaction Form
  const [txAccountId, setTxAccountId] = useState(accounts[0]?.id || 'acc_chk_101');
  const [txMerchant, setTxMerchant] = useState('Acme Test Store');
  const [txCategory, setTxCategory] = useState<Transaction['category']>('Shopping');
  const [txAmount, setTxAmount] = useState('-125.50');
  const [txDescription, setTxDescription] = useState('Custom test transaction');

  // Loan Form
  const [loanType, setLoanType] = useState<'PERSONAL' | 'HOME' | 'AUTO' | 'BUSINESS'>('PERSONAL');
  const [loanAmount, setLoanAmount] = useState('15000');
  const [loanTerm, setLoanTerm] = useState('36');
  const [loanIncome, setLoanIncome] = useState('110000');

  // Beneficiary / Bill Form
  const [benName, setBenName] = useState('Test Beneficiary Corp');
  const [benBank, setBenBank] = useState('Test Union Bank');
  const [benAccNum, setBenAccNum] = useState('9876543210');

  // JSON Import Form
  const [jsonInput, setJsonInput] = useState('');

  if (!isOpen) return null;

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomAccount({
      name: accName,
      accountType: accType,
      balance: parseFloat(accBalance) || 0,
      availableBalance: parseFloat(accBalance) || 0,
      routingNumber: accRouting,
    });
    onClose();
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomTransaction({
      accountId: txAccountId,
      merchant: txMerchant,
      category: txCategory,
      amount: parseFloat(txAmount) || 0,
      description: txDescription,
    });
    onClose();
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomLoan({
      loanType,
      requestedAmount: parseFloat(loanAmount) || 10000,
      termMonths: parseInt(loanTerm, 10) || 36,
      annualIncome: parseFloat(loanIncome) || 100000,
      purpose: 'Custom test loan application',
    });
    onClose();
  };

  const handleAddBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomBeneficiary({
      name: benName,
      bankName: benBank,
      accountNumber: benAccNum,
    });
    onClose();
  };

  const handleImportJson = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = importCustomData(jsonInput);
    if (ok) onClose();
  };

  return (
    <div
      id="test-data-modal-overlay"
      data-testid="test-data-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="test-data-modal-card"
        data-testid="test-data-modal-card"
        className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-[#002D72] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-amber-400" />
            <div>
              <h2 id="heading-test-data-title" data-testid="heading-test-data-title" className="text-sm font-bold">
                Custom Test Data Injector Portal
              </h2>
              <p className="text-[11px] text-blue-200">
                Add custom accounts, transactions, loans, beneficiaries, or import JSON datasets.
              </p>
            </div>
          </div>
          <button
            id="btn-close-test-data-modal"
            data-testid="btn-close-test-data-modal"
            onClick={onClose}
            className="p-1 text-blue-200 hover:text-white rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 overflow-x-auto">
          <button
            id="tab-add-account"
            data-testid="tab-add-account"
            onClick={() => setActiveTab('ACCOUNT')}
            className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 cursor-pointer transition ${
              activeTab === 'ACCOUNT' ? 'border-[#002D72] text-[#002D72] bg-white' : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Add Account</span>
          </button>

          <button
            id="tab-add-transaction"
            data-testid="tab-add-transaction"
            onClick={() => setActiveTab('TRANSACTION')}
            className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 cursor-pointer transition ${
              activeTab === 'TRANSACTION' ? 'border-[#002D72] text-[#002D72] bg-white' : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>

          <button
            id="tab-add-loan"
            data-testid="tab-add-loan"
            onClick={() => setActiveTab('LOAN')}
            className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 cursor-pointer transition ${
              activeTab === 'LOAN' ? 'border-[#002D72] text-[#002D72] bg-white' : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Add Loan</span>
          </button>

          <button
            id="tab-add-beneficiary"
            data-testid="tab-add-beneficiary"
            onClick={() => setActiveTab('BENEFICIARY')}
            className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 cursor-pointer transition ${
              activeTab === 'BENEFICIARY' ? 'border-[#002D72] text-[#002D72] bg-white' : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Beneficiary</span>
          </button>

          <button
            id="tab-import-json"
            data-testid="tab-import-json"
            onClick={() => setActiveTab('JSON')}
            className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 cursor-pointer transition ${
              activeTab === 'JSON' ? 'border-[#002D72] text-[#002D72] bg-white' : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Import / Reset</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-5">
          {/* TAB 1: Add Account */}
          {activeTab === 'ACCOUNT' && (
            <form onSubmit={handleAddAccount} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Display Name</label>
                  <input
                    id="input-custom-acc-name"
                    data-testid="input-custom-acc-name"
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Product Category</label>
                  <select
                    id="select-custom-acc-type"
                    data-testid="select-custom-acc-type"
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  >
                    <option value="CHECKING">Checking Account</option>
                    <option value="SAVINGS">High-Yield Savings</option>
                    <option value="BUSINESS_CHECKING">Business Checking</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="INVESTMENT">Investment Brokerage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Opening Balance ($ USD)</label>
                  <input
                    id="input-custom-acc-balance"
                    data-testid="input-custom-acc-balance"
                    type="number"
                    step="0.01"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Routing ABA Number</label>
                  <input
                    id="input-custom-acc-routing"
                    data-testid="input-custom-acc-routing"
                    type="text"
                    value={accRouting}
                    onChange={(e) => setAccRouting(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>
              </div>

              <button
                id="btn-submit-custom-account"
                data-testid="btn-submit-custom-account"
                type="submit"
                className="w-full py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inject Custom Account Record</span>
              </button>
            </form>
          )}

          {/* TAB 2: Add Transaction */}
          {activeTab === 'TRANSACTION' && (
            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Account</label>
                <select
                  id="select-custom-tx-account"
                  data-testid="select-custom-tx-account"
                  value={txAccountId}
                  onChange={(e) => setTxAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (${acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Merchant / Payee Name</label>
                  <input
                    id="input-custom-tx-merchant"
                    data-testid="input-custom-tx-merchant"
                    type="text"
                    value={txMerchant}
                    onChange={(e) => setTxMerchant(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    id="select-custom-tx-category"
                    data-testid="select-custom-tx-category"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Dining">Dining</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salary">Salary (Income)</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount ($ USD) <span className="text-[10px] text-slate-500">(Negative for debit, positive for credit)</span>
                  </label>
                  <input
                    id="input-custom-tx-amount"
                    data-testid="input-custom-tx-amount"
                    type="number"
                    step="0.01"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Memo / Description</label>
                  <input
                    id="input-custom-tx-desc"
                    data-testid="input-custom-tx-desc"
                    type="text"
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  />
                </div>
              </div>

              <button
                id="btn-submit-custom-tx"
                data-testid="btn-submit-custom-tx"
                type="submit"
                className="w-full py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inject Transaction & Update Balance</span>
              </button>
            </form>
          )}

          {/* TAB 3: Add Loan */}
          {activeTab === 'LOAN' && (
            <form onSubmit={handleAddLoan} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loan Category</label>
                  <select
                    id="select-custom-loan-type"
                    data-testid="select-custom-loan-type"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  >
                    <option value="PERSONAL">Personal Loan</option>
                    <option value="HOME">Home Mortgage</option>
                    <option value="AUTO">Auto Vehicle Loan</option>
                    <option value="BUSINESS">Commercial Business Capital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requested Principal ($)</label>
                  <input
                    id="input-custom-loan-amount"
                    data-testid="input-custom-loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Term Months</label>
                  <input
                    id="input-custom-loan-term"
                    data-testid="input-custom-loan-term"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Gross Income ($)</label>
                  <input
                    id="input-custom-loan-income"
                    data-testid="input-custom-loan-income"
                    type="number"
                    value={loanIncome}
                    onChange={(e) => setLoanIncome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>
              </div>

              <button
                id="btn-submit-custom-loan"
                data-testid="btn-submit-custom-loan"
                type="submit"
                className="w-full py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inject Loan Application</span>
              </button>
            </form>
          )}

          {/* TAB 4: Add Beneficiary */}
          {activeTab === 'BENEFICIARY' && (
            <form onSubmit={handleAddBeneficiary} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Full Name</label>
                <input
                  id="input-custom-ben-name"
                  data-testid="input-custom-ben-name"
                  type="text"
                  value={benName}
                  onChange={(e) => setBenName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bank Institution Name</label>
                  <input
                    id="input-custom-ben-bank"
                    data-testid="input-custom-ben-bank"
                    type="text"
                    value={benBank}
                    onChange={(e) => setBenBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                  <input
                    id="input-custom-ben-acc"
                    data-testid="input-custom-ben-acc"
                    type="text"
                    value={benAccNum}
                    onChange={(e) => setBenAccNum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>
              </div>

              <button
                id="btn-submit-custom-ben"
                data-testid="btn-submit-custom-ben"
                type="submit"
                className="w-full py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Inject Beneficiary</span>
              </button>
            </form>
          )}

          {/* TAB 5: JSON Import / Reset */}
          {activeTab === 'JSON' && (
            <div className="space-y-4">
              <form onSubmit={handleImportJson} className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Paste Custom Test Data Payload (JSON format)
                </label>
                <textarea
                  id="textarea-json-import"
                  data-testid="textarea-json-import"
                  rows={5}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{ "accounts": [...], "transactions": [...], "loans": [...] }'
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-emerald-400 focus:outline-none"
                />
                <button
                  id="btn-import-json-submit"
                  data-testid="btn-import-json-submit"
                  type="submit"
                  className="w-full py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition cursor-pointer"
                >
                  Apply JSON Dataset to Application
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Reset to Default Enterprise Seed</span>
                  <span className="text-[10px] text-slate-500">Restores initial TestGrid Bank Demo records.</span>
                </div>
                <button
                  id="btn-reset-seed-data"
                  data-testid="btn-reset-seed-data"
                  onClick={() => {
                    resetToDefaultData();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
