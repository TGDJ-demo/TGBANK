import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import { Receipt, CheckCircle, Calendar, Zap, Wifi, Shield, Droplet, Flame, Phone } from 'lucide-react';

export const BillPayView: React.FC = () => {
  const { bills, accounts, payBill } = useBank();
  const [selectedBillId, setSelectedBillId] = useState(bills[0]?.id || 'bill_001');
  const [payFromAccountId, setPayFromAccountId] = useState(accounts[0]?.id || 'acc_chk_101');
  const [customAmount, setCustomAmount] = useState('');
  const [payTiming, setPayTiming] = useState<'IMMEDIATE' | 'DUE_DATE' | 'AUTOPAY'>('IMMEDIATE');
  const [sendEmailReceipt, setSendEmailReceipt] = useState<boolean>(true);
  const [sendSmsReminder, setSendSmsReminder] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedBill = bills.find((b) => b.id === selectedBillId) || bills[0];

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    const amtToPay = customAmount ? parseFloat(customAmount) : selectedBill.amountDue;
    setIsProcessing(true);
    await payBill(selectedBill.id, payFromAccountId, amtToPay);
    setIsProcessing(false);
    setCustomAmount('');
  };

  const getBillerIcon = (category: string) => {
    switch (category) {
      case 'Electricity':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Internet':
        return <Wifi className="w-5 h-5 text-blue-400" />;
      case 'Insurance':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'Water':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'Gas':
        return <Flame className="w-5 h-5 text-red-400" />;
      default:
        return <Receipt className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div id="billpay-view-container" data-testid="billpay-view-container" className="space-y-4">
      {/* Header */}
      <div>
        <h1 id="heading-billpay-title" data-testid="heading-billpay-title" className="text-xl font-bold text-slate-900 tracking-tight">
          Utility & Corporate Bill Pay Center
        </h1>
        <p id="subheading-billpay" data-testid="subheading-billpay" className="text-xs text-slate-500 mt-0.5">
          Pay electric, water, internet, insurance, and municipal billers directly with instant electronic receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Billers List (1 Col) */}
        <div className="space-y-2.5">
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            Active Payees & Bills ({bills.length})
          </label>
          {bills.map((bill) => {
            const isSelected = bill.id === selectedBillId;
            return (
              <div
                key={bill.id}
                id={`biller-card-${bill.id}`}
                data-testid={`biller-card-${bill.id}`}
                onClick={() => {
                  setSelectedBillId(bill.id);
                  setCustomAmount(bill.amountDue.toString());
                }}
                className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-100 border-[#002D72] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-200">{getBillerIcon(bill.billerCategory)}</div>
                  <div>
                    <h4 id={`biller-name-${bill.id}`} data-testid={`biller-name-${bill.id}`} className="text-xs font-bold text-slate-900">
                      {bill.billerName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">Account: {bill.accountNumber}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div id={`biller-amount-${bill.id}`} data-testid={`biller-amount-${bill.id}`} className="text-xs font-bold font-mono text-slate-900">
                    ${bill.amountDue.toFixed(2)}
                  </div>
                  <span
                    id={`biller-status-${bill.id}`}
                    data-testid={`biller-status-${bill.id}`}
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      bill.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : bill.status === 'AUTOPAY_SCHEDULED'
                        ? 'bg-blue-50 text-[#002D72] border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {bill.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bill Payment Execution Form (2 Cols) */}
        {selectedBill && (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">{getBillerIcon(selectedBill.billerCategory)}</div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#002D72] uppercase tracking-wider">{selectedBill.billerCategory} Biller</span>
                  <h2 id="selected-biller-title" data-testid="selected-biller-title" className="text-base font-bold text-slate-900">
                    {selectedBill.billerName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">Consumer Account: {selectedBill.accountNumber}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500">Due Date</p>
                <p id="selected-bill-duedate" data-testid="selected-bill-duedate" className="text-xs font-bold text-amber-800 font-mono">
                  {selectedBill.dueDate}
                </p>
              </div>
            </div>

            <form id="form-pay-bill" data-testid="form-pay-bill" onSubmit={handlePayBill} className="space-y-3">
              <div>
                <label id="lbl-billpay-account" data-testid="lbl-billpay-account" htmlFor="select-billpay-account" className="block text-xs font-bold text-slate-700 mb-1">
                  Pay From Account
                </label>
                <select
                  id="select-billpay-account"
                  data-testid="select-billpay-account"
                  name="payAccount"
                  value={payFromAccountId}
                  onChange={(e) => setPayFromAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#002D72]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Available: ${acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (****{acc.accountNumber.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Timing Radio Selection */}
              <div>
                <label id="lbl-bill-pay-option" data-testid="lbl-bill-pay-option" className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Processing Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    id="lbl-radio-pay-immediate"
                    data-testid="lbl-radio-pay-immediate"
                    htmlFor="radio-pay-immediate"
                    className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                  >
                    <input
                      id="radio-pay-immediate"
                      data-testid="radio-pay-immediate"
                      data-automation-id="radio-pay-immediate"
                      type="radio"
                      name="bill-pay-timing"
                      value="IMMEDIATE"
                      checked={payTiming === 'IMMEDIATE'}
                      onChange={() => setPayTiming('IMMEDIATE')}
                      aria-checked={payTiming === 'IMMEDIATE' ? 'true' : 'false'}
                      data-checked={payTiming === 'IMMEDIATE' ? 'true' : 'false'}
                      className="text-[#002D72] cursor-pointer"
                    />
                    <span className="font-medium text-slate-800">Immediate ACH</span>
                  </label>

                  <label
                    id="lbl-radio-pay-scheduled"
                    data-testid="lbl-radio-pay-scheduled"
                    htmlFor="radio-pay-scheduled"
                    className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                  >
                    <input
                      id="radio-pay-scheduled"
                      data-testid="radio-pay-scheduled"
                      data-automation-id="radio-pay-scheduled"
                      type="radio"
                      name="bill-pay-timing"
                      value="DUE_DATE"
                      checked={payTiming === 'DUE_DATE'}
                      onChange={() => setPayTiming('DUE_DATE')}
                      aria-checked={payTiming === 'DUE_DATE' ? 'true' : 'false'}
                      data-checked={payTiming === 'DUE_DATE' ? 'true' : 'false'}
                      className="text-[#002D72] cursor-pointer"
                    />
                    <span className="font-medium text-slate-800">On Due Date</span>
                  </label>

                  <label
                    id="lbl-radio-pay-autopay"
                    data-testid="lbl-radio-pay-autopay"
                    htmlFor="radio-pay-autopay"
                    className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                  >
                    <input
                      id="radio-pay-autopay"
                      data-testid="radio-pay-autopay"
                      data-automation-id="radio-pay-autopay"
                      type="radio"
                      name="bill-pay-timing"
                      value="AUTOPAY"
                      checked={payTiming === 'AUTOPAY'}
                      onChange={() => setPayTiming('AUTOPAY')}
                      aria-checked={payTiming === 'AUTOPAY' ? 'true' : 'false'}
                      data-checked={payTiming === 'AUTOPAY' ? 'true' : 'false'}
                      className="text-[#002D72] cursor-pointer"
                    />
                    <span className="font-medium text-slate-800">AutoPay Monthly</span>
                  </label>
                </div>
              </div>

              <div>
                <label id="lbl-bill-amount" data-testid="lbl-bill-amount" htmlFor="input-bill-amount" className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount ($ USD)
                </label>
                <input
                  id="input-bill-amount"
                  data-testid="input-bill-amount"
                  data-automation-id="input-bill-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={customAmount || selectedBill.amountDue}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
                <input
                  id="slider-bill-amount"
                  data-testid="slider-bill-amount"
                  data-automation-id="slider-bill-amount"
                  name="amountSlider"
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={parseFloat(customAmount || String(selectedBill.amountDue)) || 50}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  aria-valuenow={parseFloat(customAmount || String(selectedBill.amountDue)) || 50}
                  aria-valuemin={5}
                  aria-valuemax={1000}
                  data-value={String(parseFloat(customAmount || String(selectedBill.amountDue)) || 50)}
                  className="w-full accent-[#002D72] mt-2 cursor-pointer"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Last Payment Date:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBill.lastPaymentDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-600">Last Payment Amount:</span>
                  <span className="font-mono font-bold text-slate-900">${selectedBill.lastPaymentAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Electronic Check Authorization iFrame & Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label id="lbl-bill-disclosure" data-testid="lbl-bill-disclosure" className="block text-[11px] font-bold text-slate-600">
                  Electronic Check 21 & ACH Authorization Disclosure:
                </label>
                <iframe
                  id="iframe-bill-echeck-authorization"
                  data-testid="iframe-bill-echeck-authorization"
                  name="iframe-bill-echeck-authorization"
                  title="ACH Electronic Check Authorization"
                  srcDoc={`<!DOCTYPE html><html><body style="font-family:sans-serif;font-size:11px;color:#334155;margin:0;padding:8px;background:#f8fafc;"><strong>Electronic Check Payment Terms:</strong> By clicking Submit Payment, you authorize TestGrid Demo Bank to convert your transaction into an electronic fund transfer (EFT) or paper draft drawn on your selected deposit account. Funds may be withdrawn from your account as early as the same day.</body></html>`}
                  className="w-full h-16 border border-slate-300 rounded bg-slate-50"
                />

                <div className="space-y-1 pt-1">
                  <label
                    id="lbl-checkbox-send-receipt-email"
                    data-testid="lbl-checkbox-send-receipt-email"
                    htmlFor="checkbox-send-receipt-email"
                    className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-800 select-none"
                  >
                    <input
                      id="checkbox-send-receipt-email"
                      data-testid="checkbox-send-receipt-email"
                      data-automation-id="checkbox-send-receipt-email"
                      name="emailReceipt"
                      type="checkbox"
                      checked={sendEmailReceipt}
                      onChange={(e) => setSendEmailReceipt(e.target.checked)}
                      value={sendEmailReceipt ? 'true' : 'false'}
                      aria-checked={sendEmailReceipt ? 'true' : 'false'}
                      data-checked={sendEmailReceipt ? 'true' : 'false'}
                      data-state={sendEmailReceipt ? 'checked' : 'unchecked'}
                      className="w-4 h-4 rounded text-[#002D72] focus:ring-0 cursor-pointer"
                    />
                    <span>Email electronic payment confirmation receipt to account holder.</span>
                  </label>

                  <label
                    id="lbl-checkbox-bill-due-reminder"
                    data-testid="lbl-checkbox-bill-due-reminder"
                    htmlFor="checkbox-bill-due-reminder"
                    className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-800 select-none"
                  >
                    <input
                      id="checkbox-bill-due-reminder"
                      data-testid="checkbox-bill-due-reminder"
                      data-automation-id="checkbox-bill-due-reminder"
                      name="smsReminder"
                      type="checkbox"
                      checked={sendSmsReminder}
                      onChange={(e) => setSendSmsReminder(e.target.checked)}
                      value={sendSmsReminder ? 'true' : 'false'}
                      aria-checked={sendSmsReminder ? 'true' : 'false'}
                      data-checked={sendSmsReminder ? 'true' : 'false'}
                      data-state={sendSmsReminder ? 'checked' : 'unchecked'}
                      className="w-4 h-4 rounded text-[#002D72] focus:ring-0 cursor-pointer"
                    />
                    <span>Send SMS alert 3 days prior to next bill due date.</span>
                  </label>
                </div>
              </div>

              <button
                id="btn-pay-bill-submit"
                data-testid="btn-pay-bill-submit"
                type="submit"
                disabled={isProcessing || selectedBill.status === 'PAID'}
                className={`w-full py-2.5 rounded font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
                  selectedBill.status === 'PAID'
                    ? 'bg-slate-100 text-slate-400 border border-slate-300 cursor-not-allowed'
                    : 'bg-[#002D72] hover:bg-blue-900 text-white'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>
                  {selectedBill.status === 'PAID'
                    ? 'Bill Paid In Full'
                    : isProcessing
                    ? 'Processing Payment...'
                    : `Submit Payment ($${(customAmount ? parseFloat(customAmount) : selectedBill.amountDue).toFixed(2)})`}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
