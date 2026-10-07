import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import {
  CreditCard,
  Snowflake,
  Lock,
  Gift,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  PlusCircle,
  DollarSign,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Download,
  Receipt,
} from 'lucide-react';

export const CardsView: React.FC = () => {
  const { creditCards, accounts, toggleFreezeCreditCard, payCreditCardBill, addToast } = useBank();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newRequestedLimit, setNewRequestedLimit] = useState('30000');

  // Credit Card Bill Payment Multi-Step Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payStep, setPayStep] = useState<1 | 2 | 3>(1);
  const [selectedSourceAccId, setSelectedSourceAccId] = useState(accounts[0]?.id || 'acc_chk_101');
  const [amountType, setAmountType] = useState<'MIN' | 'FULL' | 'CUSTOM'>('FULL');
  const [customAmount, setCustomAmount] = useState<string>('500');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAutoPay, setIsAutoPay] = useState(false);
  const [otpCode, setOtpCode] = useState('884920');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [payTermsAgreed, setPayTermsAgreed] = useState<boolean>(true);
  const [paymentReceipt, setPaymentReceipt] = useState<{ refNum: string; amountPaid: number; timestamp: string } | null>(null);

  const activeCard = creditCards[0];

  const getEffectivePaymentAmount = (): number => {
    if (!activeCard) return 0;
    if (amountType === 'MIN') return activeCard.minPaymentDue || 100;
    if (amountType === 'FULL') return activeCard.currentBalance || 3420.50;
    return parseFloat(customAmount) || 0;
  };

  const handleRequestLimitIncrease = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLimitModal(false);
    addToast({
      type: 'success',
      title: 'Credit Limit Increase Approved',
      message: `Your credit line has been adjusted to $${parseInt(newRequestedLimit).toLocaleString()}.00 USD.`,
    });
  };

  const handleStep1Proceed = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = getEffectivePaymentAmount();
    if (payAmt <= 0) {
      addToast({ type: 'error', title: 'Invalid Amount', message: 'Please enter a valid payment amount.' });
      return;
    }
    const sourceAcc = accounts.find((a) => a.id === selectedSourceAccId);
    if (sourceAcc && sourceAcc.availableBalance < payAmt) {
      addToast({ type: 'error', title: 'Insufficient Balance', message: `${sourceAcc.name} does not have enough balance.` });
      return;
    }
    setPayStep(2);
  };

  const handleExecutePayment = async () => {
    if (!activeCard) return;
    const payAmt = getEffectivePaymentAmount();
    setIsSubmittingPay(true);

    const success = await payCreditCardBill(activeCard.id, selectedSourceAccId, payAmt);
    setIsSubmittingPay(false);

    if (success) {
      setPaymentReceipt({
        refNum: `WTB-CCPAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
        amountPaid: payAmt,
        timestamp: new Date().toLocaleString(),
      });
      setPayStep(3);
    }
  };

  const handleResetPayModal = () => {
    setShowPayModal(false);
    setPayStep(1);
    setPaymentReceipt(null);
  };

  return (
    <div id="cards-view-container" data-testid="cards-view-container" className="space-y-4">
      {/* Header */}
      <div>
        <h1 id="heading-cards-title" data-testid="heading-cards-title" className="text-xl font-bold text-slate-900 tracking-tight">
          Card Management & Reward Center
        </h1>
        <p id="subheading-cards" data-testid="subheading-cards" className="text-xs text-slate-500 mt-0.5">
          Lock cards instantly, view virtual numbers, redeem points, and pay monthly statement bills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card Visual & Primary Actions (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Physical Visa Card Visual Box */}
          <div
            id="visual-credit-card-container"
            data-testid="visual-credit-card-container"
            className={`relative p-5 rounded-lg bg-gradient-to-tr from-[#001D4A] via-[#002D72] to-blue-900 border ${
              activeCard?.isFrozen ? 'border-amber-500 grayscale opacity-80' : 'border-blue-400/40'
            } shadow-md text-white space-y-6 overflow-hidden`}
          >
            {activeCard?.isFrozen && (
              <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded text-[10px] font-extrabold flex items-center space-x-1 shadow-sm">
                <Snowflake className="w-3.5 h-3.5 animate-spin" />
                <span>CARD FROZEN</span>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-blue-200 font-mono tracking-widest uppercase">Western Trust Premier</p>
                <p className="text-base font-black tracking-tight">{activeCard?.cardType.replace('_', ' ')}</p>
              </div>
              <CreditCard className="w-7 h-7 text-blue-200" />
            </div>

            <div className="font-mono text-lg tracking-widest font-bold text-slate-100">
              {activeCard?.cardNumberMasked}
            </div>

            <div className="flex justify-between items-end text-xs font-mono">
              <div>
                <p className="text-[9px] text-blue-200/80">Cardholder</p>
                <p className="font-bold text-slate-100">{activeCard?.cardHolderName}</p>
              </div>
              <div>
                <p className="text-[9px] text-blue-200/80">Expires</p>
                <p className="font-bold text-slate-100">{activeCard?.expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Dedicated Credit Card Bill Payment Banner Widget */}
          <div
            id="box-cc-bill-pay-banner"
            data-testid="box-cc-bill-pay-banner"
            className="bg-emerald-950 text-white border border-emerald-800/80 rounded-lg p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Statement Bill Payment Center</span>
                </div>
                <h3 className="text-sm font-extrabold text-white mt-1">
                  Current Statement Balance: ${activeCard?.currentBalance.toFixed(2)} USD
                </h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Payment due by <span className="font-bold text-white">{activeCard?.paymentDueDate || 'April 15, 2026'}</span> • Minimum Due: ${activeCard?.minPaymentDue.toFixed(2)}
                </p>
              </div>

              <button
                id="btn-open-cc-payment-modal"
                data-testid="btn-open-cc-payment-modal"
                onClick={() => {
                  setPayStep(1);
                  setShowPayModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Credit Card Bill</span>
              </button>
            </div>

            {activeCard?.lastPaymentDate && (
              <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300">
                <span>Last Payment Received: ${activeCard.lastPaymentAmount?.toFixed(2)} on {activeCard.lastPaymentDate}</span>
                <span className="bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">ACH Processed</span>
              </div>
            )}
          </div>

          {/* Quick Security Controls */}
          <div id="box-card-controls" data-testid="box-card-controls" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Instant Card Security Controls</h3>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center space-x-3">
                <Snowflake className="w-5 h-5 text-[#002D72]" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Freeze Physical & Digital Card</div>
                  <div className="text-[10px] text-slate-500">Instantly block new POS authorizations</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id={`checkbox-freeze-card-${activeCard?.id || 'card_sig_001'}`}
                  data-testid={`checkbox-freeze-card-${activeCard?.id || 'card_sig_001'}`}
                  data-automation-id={`checkbox-freeze-card-${activeCard?.id || 'card_sig_001'}`}
                  name="freezeCard"
                  type="checkbox"
                  role="switch"
                  checked={activeCard?.isFrozen || false}
                  onChange={() => toggleFreezeCreditCard(activeCard?.id || 'card_sig_001')}
                  value={activeCard?.isFrozen ? 'true' : 'false'}
                  aria-checked={activeCard?.isFrozen ? 'true' : 'false'}
                  data-checked={activeCard?.isFrozen ? 'true' : 'false'}
                  data-state={activeCard?.isFrozen ? 'checked' : 'unchecked'}
                  className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <button
                  id={`switch-freeze-card-${activeCard?.id || 'card_sig_001'}`}
                  data-testid={`switch-freeze-card-${activeCard?.id || 'card_sig_001'}`}
                  data-automation-id={`switch-freeze-card-${activeCard?.id || 'card_sig_001'}`}
                  role="switch"
                  aria-checked={activeCard?.isFrozen ? 'true' : 'false'}
                  data-checked={activeCard?.isFrozen ? 'true' : 'false'}
                  data-state={activeCard?.isFrozen ? 'checked' : 'unchecked'}
                  onClick={() => toggleFreezeCreditCard(activeCard?.id || 'card_sig_001')}
                  className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer border ${
                    activeCard?.isFrozen
                      ? 'bg-amber-500 border-amber-600 text-slate-950'
                      : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {activeCard?.isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                id="btn-request-limit-increase"
                data-testid="btn-request-limit-increase"
                onClick={() => setShowLimitModal(true)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>Request Credit Limit Increase</span>
              </button>

              <button
                id="btn-report-lost-card"
                data-testid="btn-report-lost-card"
                onClick={() => addToast({ type: 'warning', title: 'Card Replacement Dispatched', message: 'Current card blocked. Replacement card ordered via FedEx Express.' })}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-red-800 rounded border border-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-red-700" />
                <span>Report Lost / Stolen Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rewards & Balances Sidebar (1 Col) */}
        <div className="space-y-4">
          {/* Rewards Points Widget */}
          <div id="widget-reward-points" data-testid="widget-reward-points" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-[#002D72] font-bold text-xs">
              <span>Rewards & Cashback</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div id="val-reward-points" data-testid="val-reward-points" className="text-2xl font-extrabold text-slate-900 font-mono">
                {activeCard?.rewardsPoints.toLocaleString()} PTS
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Equivalent to $482.50 Cashback Statement Credit</p>
            </div>
            <button
              id="btn-redeem-rewards"
              data-testid="btn-redeem-rewards"
              onClick={() => addToast({ type: 'success', title: 'Rewards Redeemed', message: 'Applied $100 statement credit from 10,000 pts.' })}
              className="w-full py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition cursor-pointer"
            >
              Redeem Points For Cash
            </button>
          </div>

          {/* Statement Balance Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2.5 text-xs">
            <h3 className="font-bold text-slate-900">Credit Line Specifications</h3>
            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Credit Line Limit:</span>
                <span className="text-slate-900 font-bold">${activeCard?.creditLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Current Balance:</span>
                <span className="text-amber-800 font-bold">${activeCard?.currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Available Credit:</span>
                <span className="text-emerald-800 font-bold">${activeCard?.availableCredit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                <span>Min Payment Due:</span>
                <span className="text-slate-900 font-bold">${activeCard?.minPaymentDue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Due Date:</span>
                <span className="text-slate-900 font-bold">{activeCard?.paymentDueDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Card Bill Payment Multi-Step Workflow Modal */}
      {showPayModal && (
        <div id="modal-cc-payment-workflow" data-testid="modal-cc-payment-workflow" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 text-slate-900 relative">
            {/* Modal Step Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#002D72] uppercase tracking-wider">
                  Workflow Step {payStep} of 3
                </span>
                <h3 id="heading-cc-modal-step-title" data-testid="heading-cc-modal-step-title" className="text-sm font-bold text-slate-900 mt-0.5">
                  {payStep === 1 && '1. Select Source Account & Payment Amount'}
                  {payStep === 2 && '2. Security OTP Verification & Authorization'}
                  {payStep === 3 && '3. Official Payment Receipt'}
                </h3>
              </div>
              <button
                onClick={handleResetPayModal}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Form Inputs */}
            {payStep === 1 && (
              <form onSubmit={handleStep1Proceed} className="space-y-4">
                <div>
                  <label id="lbl-cc-pay-source-acc" data-testid="lbl-cc-pay-source-acc" className="block text-xs font-bold text-slate-700 mb-1">
                    Debit Source Account
                  </label>
                  <select
                    id="select-cc-pay-source-acc"
                    data-testid="select-cc-pay-source-acc"
                    value={selectedSourceAccId}
                    onChange={(e) => setSelectedSourceAccId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.accountNumber.slice(-4)}) — Available: ${acc.availableBalance.toLocaleString()} USD
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label id="lbl-cc-pay-amount-option" data-testid="lbl-cc-pay-amount-option" className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Amount Option
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      id="btn-pay-option-min"
                      data-testid="btn-pay-option-min"
                      onClick={() => setAmountType('MIN')}
                      className={`p-2.5 rounded border text-left transition cursor-pointer ${
                        amountType === 'MIN' ? 'bg-blue-50 border-[#002D72] text-[#002D72]' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Minimum Due</span>
                      <span className="block text-xs font-extrabold font-mono">${activeCard?.minPaymentDue.toFixed(2)}</span>
                    </button>

                    <button
                      type="button"
                      id="btn-pay-option-full"
                      data-testid="btn-pay-option-full"
                      onClick={() => setAmountType('FULL')}
                      className={`p-2.5 rounded border text-left transition cursor-pointer ${
                        amountType === 'FULL' ? 'bg-blue-50 border-[#002D72] text-[#002D72]' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Statement Balance</span>
                      <span className="block text-xs font-extrabold font-mono">${activeCard?.currentBalance.toFixed(2)}</span>
                    </button>

                    <button
                      type="button"
                      id="btn-pay-option-custom"
                      data-testid="btn-pay-option-custom"
                      onClick={() => setAmountType('CUSTOM')}
                      className={`p-2.5 rounded border text-left transition cursor-pointer ${
                        amountType === 'CUSTOM' ? 'bg-blue-50 border-[#002D72] text-[#002D72]' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">Other Amount</span>
                      <span className="block text-xs font-extrabold font-mono">Custom $</span>
                    </button>
                  </div>
                </div>

                {amountType === 'CUSTOM' && (
                  <div>
                    <label id="lbl-custom-cc-amount" data-testid="lbl-custom-cc-amount" className="block text-xs font-bold text-slate-700 mb-1">
                      Enter Custom Payment Amount ($ USD)
                    </label>
                    <input
                      id="input-custom-cc-amount"
                      data-testid="input-custom-cc-amount"
                      type="number"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label id="lbl-cc-pay-date" data-testid="lbl-cc-pay-date" className="block text-xs font-bold text-slate-700 mb-1">
                      Execution Date
                    </label>
                    <input
                      id="input-cc-pay-date"
                      data-testid="input-cc-pay-date"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label
                      id="lbl-checkbox-cc-autopay"
                      data-testid="lbl-checkbox-cc-autopay"
                      htmlFor="checkbox-cc-autopay"
                      className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-700 select-none"
                    >
                      <input
                        id="checkbox-cc-autopay"
                        data-testid="checkbox-cc-autopay"
                        data-automation-id="checkbox-cc-autopay"
                        name="isAutoPay"
                        type="checkbox"
                        checked={isAutoPay}
                        onChange={(e) => setIsAutoPay(e.target.checked)}
                        value={isAutoPay ? 'true' : 'false'}
                        aria-checked={isAutoPay ? 'true' : 'false'}
                        data-checked={isAutoPay ? 'true' : 'false'}
                        data-state={isAutoPay ? 'checked' : 'unchecked'}
                        className="w-4 h-4 rounded text-[#002D72] cursor-pointer"
                      />
                      <span>Set as Monthly AutoPay</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleResetPayModal}
                    className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-cc-pay-continue-step2"
                    data-testid="btn-cc-pay-continue-step2"
                    type="submit"
                    className="w-1/2 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Continue to Authorization</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Verification & Authorization */}
            {payStep === 2 && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">Payment Summary Breakdown</div>
                  <div className="flex justify-between text-slate-600">
                    <span>Source Account:</span>
                    <span className="font-mono font-bold text-slate-900">{accounts.find((a) => a.id === selectedSourceAccId)?.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Target Credit Card:</span>
                    <span className="font-mono font-bold text-slate-900">{activeCard?.cardType.replace('_', ' ')} ({activeCard?.cardNumberMasked.slice(-4)})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Payment Amount:</span>
                    <span className="font-mono font-extrabold text-[#002D72]">${getEffectivePaymentAmount().toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>New Card Balance After Payment:</span>
                    <span className="font-mono font-bold text-emerald-700">${Math.max(0, (activeCard?.currentBalance || 0) - getEffectivePaymentAmount()).toFixed(2)} USD</span>
                  </div>
                </div>

                <div>
                  <label id="lbl-cc-pay-otp" data-testid="lbl-cc-pay-otp" className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit SMS Security Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="input-cc-pay-otp"
                      data-testid="input-cc-pay-otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono text-center tracking-widest font-bold text-sm text-slate-900 focus:outline-none focus:border-[#002D72]"
                      placeholder="884920"
                    />
                    <button
                      type="button"
                      onClick={() => addToast({ type: 'info', title: 'SMS OTP Sent', message: 'Verification code sent to registered mobile device.' })}
                      className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded hover:bg-slate-200 cursor-pointer shrink-0"
                    >
                      Resend SMS
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label
                    id="lbl-checkbox-cc-pay-terms"
                    data-testid="lbl-checkbox-cc-pay-terms"
                    htmlFor="checkbox-cc-pay-terms"
                    className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 select-none"
                  >
                    <input
                      id="checkbox-cc-pay-terms"
                      data-testid="checkbox-cc-pay-terms"
                      data-automation-id="checkbox-cc-pay-terms"
                      name="achDebitAuthorized"
                      type="checkbox"
                      checked={payTermsAgreed}
                      onChange={(e) => setPayTermsAgreed(e.target.checked)}
                      value={payTermsAgreed ? 'true' : 'false'}
                      aria-checked={payTermsAgreed ? 'true' : 'false'}
                      data-checked={payTermsAgreed ? 'true' : 'false'}
                      data-state={payTermsAgreed ? 'checked' : 'unchecked'}
                      required
                      className="w-4 h-4 rounded text-[#002D72] cursor-pointer"
                    />
                    <span>I authorize TestGrid Bank to execute an electronic ACH debit for this bill.</span>
                  </label>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayStep(1)}
                    className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition"
                  >
                    Back
                  </button>
                  <button
                    id="btn-cc-pay-execute-submit"
                    data-testid="btn-cc-pay-execute-submit"
                    type="button"
                    onClick={handleExecutePayment}
                    disabled={isSubmittingPay}
                    className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded cursor-pointer transition flex items-center justify-center space-x-1.5"
                  >
                    {isSubmittingPay ? <span>Processing ACH...</span> : <span>Confirm & Authorize Payment</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Receipt */}
            {payStep === 3 && paymentReceipt && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Payment Successfully Executed!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your credit card statement balance has been credited in real-time.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs font-mono text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference Number:</span>
                    <span className="font-bold text-slate-900">{paymentReceipt.refNum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-700">${paymentReceipt.amountPaid.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-slate-700">{paymentReceipt.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processing Rail:</span>
                    <span className="text-slate-900 font-bold">ACH Instant Settlement</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => addToast({ type: 'info', title: 'Receipt Downloaded', message: `Saved ${paymentReceipt.refNum}.pdf` })}
                    className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition flex items-center justify-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    id="btn-cc-pay-done"
                    data-testid="btn-cc-pay-done"
                    type="button"
                    onClick={handleResetPayModal}
                    className="w-1/2 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition"
                  >
                    Return to Card Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credit Limit Modal */}
      {showLimitModal && (
        <div id="modal-limit-increase" data-testid="modal-limit-increase" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRequestLimitIncrease} className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-3 text-slate-900">
            <h3 className="text-sm font-bold text-slate-900">Request Credit Limit Increase</h3>
            <p className="text-xs text-slate-600">Current Limit: ${activeCard?.creditLimit.toLocaleString()} USD</p>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label id="lbl-new-credit-limit" data-testid="lbl-new-credit-limit" htmlFor="input-new-credit-limit" className="block text-xs font-bold text-slate-700">
                  New Desired Credit Limit ($ USD)
                </label>
                <span className="text-xs font-mono font-bold text-[#002D72]">
                  ${parseInt(newRequestedLimit || '0', 10).toLocaleString()}
                </span>
              </div>
              <input
                id="input-new-credit-limit"
                data-testid="input-new-credit-limit"
                data-automation-id="input-new-credit-limit"
                name="newCreditLimit"
                type="number"
                min="1000"
                max="50000"
                step="500"
                value={newRequestedLimit}
                onChange={(e) => setNewRequestedLimit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                required
              />
              <input
                id="slider-new-credit-limit"
                data-testid="slider-new-credit-limit"
                data-automation-id="slider-new-credit-limit"
                name="newCreditLimitSlider"
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={Number(newRequestedLimit) || 1000}
                onChange={(e) => setNewRequestedLimit(e.target.value)}
                aria-valuenow={Number(newRequestedLimit) || 1000}
                aria-valuemin={1000}
                aria-valuemax={50000}
                data-value={newRequestedLimit}
                className="w-full accent-[#002D72] mt-2 cursor-pointer"
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                id="btn-submit-limit-increase"
                data-testid="btn-submit-limit-increase"
                type="submit"
                className="w-1/2 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
