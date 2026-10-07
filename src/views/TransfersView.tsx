import React, { useState, useEffect } from 'react';
import { useBank } from '../context/BankContext';
import { Send, Globe, ArrowRight, ShieldCheck, CheckCircle2, FileText, Plus, UserPlus, AlertTriangle } from 'lucide-react';
import { MoneyTransferResult } from '../types';
import { INTERNAL_BANK_ACCOUNTS } from '../mockData';

export const TransfersView: React.FC = () => {
  const { accounts, beneficiaries, executeTransfer, addBeneficiary, addToast } = useBank();

  const [transferType, setTransferType] = useState<'INTERNAL' | 'EXTERNAL' | 'WIRE' | 'INTERNATIONAL'>('INTERNAL');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || 'acc_chk_101');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || 'acc_sav_102');

  // Synchronize fromAccountId when accounts change
  useEffect(() => {
    if (accounts.length > 0 && !accounts.some((a) => a.id === fromAccountId)) {
      setFromAccountId(accounts[0].id);
    }
  }, [accounts, fromAccountId]);

  // Synchronize toAccountId when fromAccountId or accounts change
  useEffect(() => {
    const validDestIds = [
      ...accounts.filter((a) => a.id !== fromAccountId).map((a) => a.id),
      ...INTERNAL_BANK_ACCOUNTS.map((a) => a.id),
    ];
    if (validDestIds.length > 0 && (!validDestIds.includes(toAccountId) || toAccountId === fromAccountId)) {
      setToAccountId(validDestIds[0]);
    }
  }, [accounts, fromAccountId, toAccountId]);
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [extRouting, setExtRouting] = useState('021000021');
  const [extAccount, setExtAccount] = useState('8839201928');
  const [extBankName, setExtBankName] = useState('Chase Bank N.A.');
  const [amount, setAmount] = useState('500.00');
  const [memo, setMemo] = useState('Software Services Invoice Payment');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [executionSpeed, setExecutionSpeed] = useState<'STANDARD_ACH' | 'INSTANT_WIRE' | 'RTP_PAYMENT'>('STANDARD_ACH');
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [lastResult, setLastResult] = useState<MoneyTransferResult | null>(null);

  const [showAddBenModal, setShowAddBenModal] = useState(false);
  const [newBenName, setNewBenName] = useState('');
  const [newBenBank, setNewBenBank] = useState('');
  const [newBenAcc, setNewBenAcc] = useState('');
  const [newBenRouting, setNewBenRouting] = useState('');

  const selectedFromAcc = accounts.find((a) => a.id === fromAccountId) || accounts[0];

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast({ type: 'error', title: 'Invalid Amount', message: 'Please enter a valid transfer amount.' });
      return;
    }

    if (parsedAmount > selectedFromAcc.availableBalance) {
      addToast({
        type: 'error',
        title: 'Insufficient Balance',
        message: `Amount $${parsedAmount} exceeds available balance $${selectedFromAcc.availableBalance}.`,
      });
      return;
    }

    // Require OTP modal for amounts >= $1,000 or Wire/International transfers
    if (parsedAmount >= 1000 || transferType === 'WIRE' || transferType === 'INTERNATIONAL') {
      setShowOtpModal(true);
    } else {
      processTransfer();
    }
  };

  const processTransfer = async () => {
    setIsSubmitting(true);
    try {
      const res = await executeTransfer({
        fromAccountId,
        toAccountId: transferType === 'INTERNAL' ? toAccountId : undefined,
        beneficiaryId: beneficiaryId || undefined,
        externalRoutingNumber: transferType !== 'INTERNAL' ? extRouting : undefined,
        externalAccountNumber: transferType !== 'INTERNAL' ? extAccount : undefined,
        externalBankName: transferType !== 'INTERNAL' ? extBankName : undefined,
        amount: parseFloat(amount),
        transferType,
        memo,
        otpCode: otpCode || '123456',
      });
      setLastResult(res);
      setShowOtpModal(false);
      setOtpCode('');
    } catch (err) {
      // handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenName || !newBenAcc) return;
    addBeneficiary({
      name: newBenName,
      bankName: newBenBank || 'Domestic Bank',
      accountNumber: newBenAcc,
      routingNumber: newBenRouting || '121000358',
      nickname: newBenName,
      email: `${newBenName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      type: 'DOMESTIC_ACH',
    });
    setShowAddBenModal(false);
    setNewBenName('');
    setNewBenAcc('');
  };

  return (
    <div id="transfers-view-container" data-testid="transfers-view-container" className="space-y-4">
      {/* Header */}
      <div>
        <h1 id="heading-transfers-title" data-testid="heading-transfers-title" className="text-xl font-bold text-slate-900 tracking-tight">
          Enterprise Money Transfer Hub
        </h1>
        <p id="subheading-transfers" data-testid="subheading-transfers" className="text-xs text-slate-500 mt-0.5">
          Execute real-time internal account transfers, domestic ACH, Fedwire, and SWIFT international payments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transfer Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          {/* Transfer Type Tabs */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
              Payment Rail & Transfer Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'INTERNAL', label: 'Internal Bank', testId: 'btn-transfer-type-internal' },
                { type: 'EXTERNAL', label: 'External ACH', testId: 'btn-transfer-type-external' },
                { type: 'WIRE', label: 'Fedwire $25', testId: 'btn-transfer-type-wire' },
                { type: 'INTERNATIONAL', label: 'SWIFT Int’l', testId: 'btn-transfer-type-swift' },
              ].map((tab) => (
                <button
                  key={tab.type}
                  id={tab.testId}
                  data-testid={tab.testId}
                  type="button"
                  onClick={() => setTransferType(tab.type as any)}
                  className={`p-2 rounded border text-xs font-bold transition cursor-pointer text-center ${
                    transferType === tab.type
                      ? 'bg-[#002D72] border-[#001D4A] text-white shadow-sm'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form id="form-money-transfer" data-testid="form-money-transfer" onSubmit={handleInitiateTransfer} className="space-y-3">
            {/* From Account */}
            <div>
              <label id="lbl-transfer-source" data-testid="lbl-transfer-source" htmlFor="select-transfer-source" className="block text-xs font-bold text-slate-700 mb-1">
                From Account
              </label>
              <select
                id="select-transfer-source"
                data-testid="select-transfer-source"
                name="fromAccount"
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72] font-mono"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Available: ${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (****{acc.accountNumber.slice(-4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Selection */}
            {transferType === 'INTERNAL' ? (
              <div>
                <label
                  id="lbl-transfer-destination"
                  data-testid="lbl-transfer-destination"
                  htmlFor="select-transfer-destination"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  To Internal Account
                </label>
                <select
                  id="select-transfer-destination"
                  data-testid="select-transfer-destination"
                  data-automation-id="select-transfer-destination"
                  name="toAccount"
                  aria-label="To Internal Account"
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72] font-mono cursor-pointer"
                >
                  {accounts.filter((a) => a.id !== fromAccountId).length > 0 && (
                    <optgroup label="My Other Internal Accounts">
                      {accounts
                        .filter((a) => a.id !== fromAccountId)
                        .map((acc) => (
                          <option
                            key={acc.id}
                            id={`opt-dest-${acc.id}`}
                            data-testid={`opt-dest-${acc.id}`}
                            value={acc.id}
                          >
                            {acc.name} — ${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (****{acc.accountNumber.slice(-4)})
                          </option>
                        ))}
                    </optgroup>
                  )}
                  <optgroup label="TestGrid Demo Bank Internal Department Accounts">
                    {INTERNAL_BANK_ACCOUNTS.map((acc) => (
                      <option
                        key={acc.id}
                        id={`opt-dest-${acc.id}`}
                        data-testid={`opt-dest-${acc.id}`}
                        value={acc.id}
                      >
                        {acc.name} — {acc.accountType} (****{acc.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Instant internal settlement with zero transaction fees across all TestGrid Demo Bank accounts.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Saved Beneficiaries & External Routing</span>
                  <button
                    id="btn-open-add-ben-modal"
                    data-testid="btn-open-add-ben-modal"
                    type="button"
                    onClick={() => setShowAddBenModal(true)}
                    className="text-xs text-[#002D72] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Beneficiary</span>
                  </button>
                </div>

                <div>
                  <label id="lbl-select-beneficiary" data-testid="lbl-select-beneficiary" className="block text-[11px] font-bold text-slate-600 mb-1">
                    Select Saved Beneficiary
                  </label>
                  <select
                    id="select-beneficiary"
                    data-testid="select-beneficiary"
                    value={beneficiaryId}
                    onChange={(e) => {
                      setBeneficiaryId(e.target.value);
                      const ben = beneficiaries.find((b) => b.id === e.target.value);
                      if (ben) {
                        setExtRouting(ben.routingNumber);
                        setExtAccount(ben.accountNumber);
                        setExtBankName(ben.bankName);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  >
                    <option value="">-- Custom External Account Entry --</option>
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nickname} ({b.bankName} - ****{b.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">External Bank Name</label>
                    <input
                      id="input-external-bank-name"
                      data-testid="input-external-bank-name"
                      type="text"
                      value={extBankName}
                      onChange={(e) => setExtBankName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">ABA Routing / SWIFT</label>
                    <input
                      id="input-external-routing"
                      data-testid="input-external-routing"
                      type="text"
                      value={extRouting}
                      onChange={(e) => setExtRouting(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Account / IBAN Number</label>
                    <input
                      id="input-external-account"
                      data-testid="input-external-account"
                      type="text"
                      value={extAccount}
                      onChange={(e) => setExtAccount(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Speed Radio Selection */}
            <div id="section-transfer-speed" data-testid="section-transfer-speed">
              <label id="lbl-transfer-speed" data-testid="lbl-transfer-speed" className="block text-xs font-bold text-slate-700 mb-1.5">
                Transfer Execution Speed & Processing Rail
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  id="lbl-radio-speed-standard"
                  data-testid="lbl-radio-speed-standard"
                  htmlFor="radio-speed-standard"
                  className={`p-2.5 border rounded cursor-pointer flex items-start space-x-2 transition ${
                    executionSpeed === 'STANDARD_ACH'
                      ? 'bg-blue-50/70 border-[#002D72]'
                      : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <input
                    id="radio-speed-standard"
                    data-testid="radio-speed-standard"
                    data-automation-id="radio-speed-standard"
                    name="radio-speed-standard"
                    type="radio"
                    value="STANDARD_ACH"
                    checked={executionSpeed === 'STANDARD_ACH'}
                    onChange={() => setExecutionSpeed('STANDARD_ACH')}
                    aria-label="Standard ACH"
                    aria-checked={executionSpeed === 'STANDARD_ACH' ? 'true' : 'false'}
                    data-checked={executionSpeed === 'STANDARD_ACH' ? 'true' : 'false'}
                    data-state={executionSpeed === 'STANDARD_ACH' ? 'checked' : 'unchecked'}
                    className="mt-0.5 text-[#002D72] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Standard ACH</span>
                    <span className="text-[10px] text-slate-500 block">2-3 Business Days • $0.00 Fee</span>
                  </div>
                </label>

                <label
                  id="lbl-radio-speed-wire"
                  data-testid="lbl-radio-speed-wire"
                  htmlFor="radio-speed-wire"
                  className={`p-2.5 border rounded cursor-pointer flex items-start space-x-2 transition ${
                    executionSpeed === 'INSTANT_WIRE'
                      ? 'bg-blue-50/70 border-[#002D72]'
                      : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <input
                    id="radio-speed-wire"
                    data-testid="radio-speed-wire"
                    data-automation-id="radio-speed-wire"
                    name="radio-speed-wire"
                    type="radio"
                    value="INSTANT_WIRE"
                    checked={executionSpeed === 'INSTANT_WIRE'}
                    onChange={() => setExecutionSpeed('INSTANT_WIRE')}
                    aria-label="Fedwire Same-Day"
                    aria-checked={executionSpeed === 'INSTANT_WIRE' ? 'true' : 'false'}
                    data-checked={executionSpeed === 'INSTANT_WIRE' ? 'true' : 'false'}
                    data-state={executionSpeed === 'INSTANT_WIRE' ? 'checked' : 'unchecked'}
                    className="mt-0.5 text-[#002D72] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Fedwire Same-Day</span>
                    <span className="text-[10px] text-slate-500 block">Instant Real-Time • $15.00 Fee</span>
                  </div>
                </label>

                <label
                  id="lbl-radio-speed-rtp"
                  data-testid="lbl-radio-speed-rtp"
                  htmlFor="radio-speed-rtp"
                  className={`p-2.5 border rounded cursor-pointer flex items-start space-x-2 transition ${
                    executionSpeed === 'RTP_PAYMENT'
                      ? 'bg-blue-50/70 border-[#002D72]'
                      : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <input
                    id="radio-speed-rtp"
                    data-testid="radio-speed-rtp"
                    data-automation-id="radio-speed-rtp"
                    name="radio-speed-rtp"
                    type="radio"
                    value="RTP_PAYMENT"
                    checked={executionSpeed === 'RTP_PAYMENT'}
                    onChange={() => setExecutionSpeed('RTP_PAYMENT')}
                    aria-label="RTP Instant"
                    aria-checked={executionSpeed === 'RTP_PAYMENT' ? 'true' : 'false'}
                    data-checked={executionSpeed === 'RTP_PAYMENT' ? 'true' : 'false'}
                    data-state={executionSpeed === 'RTP_PAYMENT' ? 'checked' : 'unchecked'}
                    className="mt-0.5 text-[#002D72] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">RTP Instant</span>
                    <span className="text-[10px] text-slate-500 block">24/7/365 Direct • $2.50 Fee</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Schedule Date & Recurring Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label id="lbl-transfer-schedule-date" data-testid="lbl-transfer-schedule-date" htmlFor="input-transfer-schedule-date" className="block text-xs font-bold text-slate-700 mb-1">
                  Schedule Execution Date
                </label>
                <input
                  id="input-transfer-schedule-date"
                  data-testid="input-transfer-schedule-date"
                  name="scheduleDate"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                />
              </div>

              <div className="flex items-center pt-5">
                <label
                  id="lbl-checkbox-recurring-transfer"
                  data-testid="lbl-checkbox-recurring-transfer"
                  htmlFor="checkbox-recurring-transfer"
                  className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700 select-none"
                >
                  <input
                    id="checkbox-recurring-transfer"
                    data-testid="checkbox-recurring-transfer"
                    data-automation-id="checkbox-recurring-transfer"
                    name="isRecurring"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    value={isRecurring ? 'true' : 'false'}
                    aria-checked={isRecurring ? 'true' : 'false'}
                    data-checked={isRecurring ? 'true' : 'false'}
                    data-state={isRecurring ? 'checked' : 'unchecked'}
                    className="w-4 h-4 rounded text-[#002D72] focus:ring-0 cursor-pointer"
                  />
                  <span>Enable Monthly Recurring Schedule</span>
                </label>
              </div>
            </div>

            {/* Amount & Memo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label id="lbl-transfer-amount" data-testid="lbl-transfer-amount" htmlFor="input-transfer-amount" className="block text-xs font-bold text-slate-700">
                    Transfer Amount ($ USD)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">${amount}</span>
                </div>
                <input
                  id="input-transfer-amount"
                  data-testid="input-transfer-amount"
                  data-automation-id="input-transfer-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
                <input
                  id="slider-transfer-amount"
                  data-testid="slider-transfer-amount"
                  data-automation-id="slider-transfer-amount"
                  name="amountSlider"
                  type="range"
                  min="10"
                  max="5000"
                  step="25"
                  value={parseFloat(amount) || 100}
                  onChange={(e) => setAmount(Number(e.target.value).toFixed(2))}
                  aria-valuenow={parseFloat(amount) || 100}
                  aria-valuemin={10}
                  aria-valuemax={5000}
                  data-value={amount}
                  className="w-full accent-[#002D72] mt-2 cursor-pointer"
                />
              </div>

              <div>
                <label id="lbl-transfer-memo" data-testid="lbl-transfer-memo" htmlFor="input-transfer-memo" className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Memo / Reference Description
                </label>
                <input
                  id="input-transfer-memo"
                  data-testid="input-transfer-memo"
                  data-automation-id="input-transfer-memo"
                  name="memo"
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="e.g. Invoice #1029"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                />
              </div>
            </div>

            {/* Embedded iFrame for Legal Terms & Authorization Agreement */}
            <div className="space-y-1.5 pt-2">
              <label id="lbl-wire-disclosure" data-testid="lbl-wire-disclosure" className="block text-[11px] font-bold text-slate-600">
                Federal Wire & Regulation E Electronic Transfer Terms Disclosure:
              </label>
              <iframe
                id="iframe-wire-disclosure-terms"
                data-testid="iframe-wire-disclosure-terms"
                name="iframe-wire-disclosure-terms"
                title="Electronic Funds Transfer Disclosure"
                srcDoc={`<!DOCTYPE html><html><body style="font-family:sans-serif;font-size:11px;color:#334155;margin:0;padding:8px;background:#f8fafc;"><strong>TestGrid Demo Bank Electronic Funds Transfer Disclosure:</strong> By initiating this request, you authorize TestGrid Demo Bank to debit your selected source account. Wire transfers are final once processed through the Fedwire settlement ledger. International transfers are subject to FX currency conversion and intermediary bank fees. Rights under Regulation E apply to consumer account transactions.</body></html>`}
                className="w-full h-20 border border-slate-300 rounded bg-slate-50"
              />

              <label
                id="lbl-checkbox-transfer-terms"
                data-testid="lbl-checkbox-transfer-terms"
                htmlFor="checkbox-transfer-terms-agreed"
                className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 pt-1 select-none"
              >
                <input
                  id="checkbox-transfer-terms-agreed"
                  data-testid="checkbox-transfer-terms-agreed"
                  data-automation-id="checkbox-transfer-terms-agreed"
                  name="transferTermsAgreed"
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  value={termsAgreed ? 'true' : 'false'}
                  aria-checked={termsAgreed ? 'true' : 'false'}
                  data-checked={termsAgreed ? 'true' : 'false'}
                  data-state={termsAgreed ? 'checked' : 'unchecked'}
                  required
                  className="w-4 h-4 rounded text-[#002D72] focus:ring-0 cursor-pointer"
                />
                <span>I have read the disclosure and authorize TestGrid Demo Bank to execute this transfer.</span>
              </label>
            </div>

            <button
              id="btn-transfer-submit"
              data-testid="btn-transfer-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Payment Authorization...' : 'Review & Authorize Transfer'}</span>
            </button>
          </form>
        </div>

        {/* Transfer Confirmation / Receipt Sidebar (1 Col) */}
        <div className="space-y-4">
          {lastResult ? (
            <div id="receipt-confirmation-card" data-testid="receipt-confirmation-card" className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 shadow-sm space-y-3 text-emerald-900">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>Transfer Authorized</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs border-t border-emerald-200 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">Reference #:</span>
                  <span id="receipt-ref-num" data-testid="receipt-ref-num" className="font-bold text-slate-900">
                    {lastResult.referenceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">Amount:</span>
                  <span id="receipt-amount" data-testid="receipt-amount" className="font-bold text-slate-900">
                    ${lastResult.amount.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">Source:</span>
                  <span className="text-slate-800">{lastResult.fromAccountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">Destination:</span>
                  <span className="text-slate-800">{lastResult.toAccountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">Correlation ID:</span>
                  <span className="text-slate-600 text-[10px]">{lastResult.correlationId}</span>
                </div>
              </div>

              <button
                id="btn-download-receipt-pdf"
                data-testid="btn-download-receipt-pdf"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Transfer_Receipt_${lastResult.referenceNumber}.json`;
                  a.click();
                }}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Download Official Receipt</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#002D72]" />
                <span>TestGrid Demo Bank Security Limits</span>
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700 font-mono">
                <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                  <span>Daily Internal Limit:</span>
                  <span className="font-bold text-emerald-800">$250,000.00</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                  <span>Daily ACH External:</span>
                  <span className="font-bold text-[#002D72]">$50,000.00</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                  <span>Same-Day Fedwire:</span>
                  <span className="font-bold text-amber-800">$100,000.00</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div id="modal-transfer-otp" data-testid="modal-transfer-otp" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-3 text-slate-900">
            <h3 className="text-sm font-bold text-slate-900">Wire Payment High Value OTP Check</h3>
            <p className="text-xs text-slate-600">Enter security OTP code sent to your registered mobile device to authorize transfer of ${amount}.</p>
            <p className="text-xs text-amber-800 font-mono font-bold">Test Code: 123456</p>

            <input
              id="input-transfer-otp"
              data-testid="input-transfer-otp"
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-center text-lg font-mono font-bold text-slate-900 tracking-widest focus:outline-none focus:border-[#002D72]"
            />

            <div className="flex space-x-2 pt-1">
              <button
                id="btn-cancel-transfer-otp"
                data-testid="btn-cancel-transfer-otp"
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-transfer-otp"
                data-testid="btn-confirm-transfer-otp"
                type="button"
                onClick={processTransfer}
                className="w-2/3 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition"
              >
                Confirm & Disburse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Beneficiary Modal */}
      {showAddBenModal && (
        <div id="modal-add-beneficiary" data-testid="modal-add-beneficiary" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveBeneficiary} className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-3 text-slate-900">
            <h3 className="text-sm font-bold text-slate-900">Add New Saved Beneficiary</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Beneficiary Full Name</label>
              <input
                id="input-new-ben-name"
                data-testid="input-new-ben-name"
                type="text"
                value={newBenName}
                onChange={(e) => setNewBenName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                id="input-new-ben-bank"
                data-testid="input-new-ben-bank"
                type="text"
                value={newBenBank}
                onChange={(e) => setNewBenBank(e.target.value)}
                placeholder="e.g. Bank of America"
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Routing Number</label>
                <input
                  id="input-new-ben-routing"
                  data-testid="input-new-ben-routing"
                  type="text"
                  value={newBenRouting}
                  onChange={(e) => setNewBenRouting(e.target.value)}
                  placeholder="121000358"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  id="input-new-ben-acc"
                  data-testid="input-new-ben-acc"
                  type="text"
                  value={newBenAcc}
                  onChange={(e) => setNewBenAcc(e.target.value)}
                  placeholder="9988776655"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddBenModal(false)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                id="btn-save-beneficiary-submit"
                data-testid="btn-save-beneficiary-submit"
                type="submit"
                className="w-1/2 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition"
              >
                Save Beneficiary
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
