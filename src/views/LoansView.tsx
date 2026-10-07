import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import { Landmark, Calculator, Upload, CheckCircle2, Clock, XCircle, FileText, ChevronRight } from 'lucide-react';
import { LoanApplication } from '../types';

export const LoansView: React.FC = () => {
  const { loans, accounts, submitLoanApplication, currentUser, updateLoanStatus, advanceLoanStage, disburseLoan, addToast } = useBank();

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(25000);
  const [calcTermMonths, setCalcTermMonths] = useState<number>(36);
  const [calcInterestRate, setCalcInterestRate] = useState<number>(6.5);

  // Application Form State
  const [loanType, setLoanType] = useState<LoanApplication['loanType']>('PERSONAL');
  const [reqAmount, setReqAmount] = useState<string>('25000');
  const [termMonths, setTermMonths] = useState<string>('36');
  const [purpose, setPurpose] = useState<string>('Home renovation and energy efficiency upgrade');
  const [annualIncome, setAnnualIncome] = useState<string>('145000');
  const [empStatus, setEmpStatus] = useState<string>('W2_FULLTIME');
  const [creditCheckAgreed, setCreditCheckAgreed] = useState<boolean>(true);
  const [autopayAgreed, setAutopayAgreed] = useState<boolean>(true);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string; uploadedAt: string }[]>([
    { name: 'W2_Tax_Return_2025.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: new Date().toISOString().split('T')[0] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate Monthly EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEmi = (principal: number, yearsOrMonths: number, ratePercent: number) => {
    const monthlyRate = ratePercent / 100 / 12;
    if (monthlyRate === 0) return principal / yearsOrMonths;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, yearsOrMonths)) / (Math.pow(1 + monthlyRate, yearsOrMonths) - 1);
    return isNaN(emi) ? 0 : emi;
  };

  const currentEmi = calculateEmi(calcAmount, calcTermMonths, calcInterestRate);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          type: file.type || 'document/pdf',
          uploadedAt: new Date().toISOString().split('T')[0],
        },
      ]);
      addToast({ type: 'info', title: 'Document Uploaded', message: `Uploaded ${file.name} to loan verification store.` });
    }
  };

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const amt = parseFloat(reqAmount);
    const term = parseInt(termMonths, 10);
    const emi = calculateEmi(amt, term, 6.5);

    try {
      await submitLoanApplication({
        loanType,
        requestedAmount: amt,
        termMonths: term,
        estimatedInterestRate: 6.5,
        monthlyPayment: emi,
        purpose,
        annualIncome: parseFloat(annualIncome),
        documents: uploadedFiles,
      });
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="loans-view-container" data-testid="loans-view-container" className="space-y-4">
      {/* Header */}
      <div>
        <h1 id="heading-loans-title" data-testid="heading-loans-title" className="text-xl font-bold text-slate-900 tracking-tight">
          Enterprise Loan & Credit Origination Center
        </h1>
        <p id="subheading-loans" data-testid="subheading-loans" className="text-xs text-slate-500 mt-0.5">
          Simulate personal, home mortgage, car, and commercial loan applications with document verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Loan Application & Calculator (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* EMI Calculator Card */}
          <div id="widget-loan-calculator" data-testid="widget-loan-calculator" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-[#002D72] font-bold text-xs">
              <Calculator className="w-4 h-4" />
              <span>Interactive Loan EMI & Interest Calculator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label id="lbl-calc-amount" data-testid="lbl-calc-amount" htmlFor="input-loan-amount" className="block text-[11px] font-bold text-slate-600">
                    Loan Principal ($ USD)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">${calcAmount.toLocaleString()}</span>
                </div>
                <input
                  id="input-loan-amount"
                  data-testid="input-loan-amount"
                  data-automation-id="input-loan-amount"
                  name="loanAmount"
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                />
                <input
                  id="slider-loan-amount"
                  data-testid="slider-loan-amount"
                  data-automation-id="slider-loan-amount"
                  name="loanAmountSlider"
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  aria-valuenow={calcAmount}
                  aria-valuemin={1000}
                  aria-valuemax={100000}
                  data-value={String(calcAmount)}
                  className="w-full accent-[#002D72] mt-1.5 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label id="lbl-calc-term" data-testid="lbl-calc-term" htmlFor="input-loan-term" className="block text-[11px] font-bold text-slate-600">
                    Term Length (Months)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">{calcTermMonths} mos</span>
                </div>
                <select
                  id="input-loan-term"
                  data-testid="input-loan-term"
                  data-automation-id="input-loan-term"
                  name="loanTerm"
                  value={calcTermMonths}
                  data-value={String(calcTermMonths)}
                  data-selected={String(calcTermMonths)}
                  onChange={(e) => setCalcTermMonths(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                >
                  <option id="opt-term-12" value={12}>12 Months (1 Year)</option>
                  <option id="opt-term-24" value={24}>24 Months (2 Years)</option>
                  <option id="opt-term-36" value={36}>36 Months (3 Years)</option>
                  <option id="opt-term-60" value={60}>60 Months (5 Years)</option>
                  <option id="opt-term-120" value={120}>120 Months (10 Years)</option>
                  <option id="opt-term-360" value={360}>360 Months (30 Years)</option>
                </select>
                <input
                  id="slider-loan-term"
                  data-testid="slider-loan-term"
                  data-automation-id="slider-loan-term"
                  name="loanTermSlider"
                  type="range"
                  min="12"
                  max="360"
                  step="12"
                  value={calcTermMonths}
                  onChange={(e) => setCalcTermMonths(Number(e.target.value))}
                  aria-valuenow={calcTermMonths}
                  aria-valuemin={12}
                  aria-valuemax={360}
                  data-value={String(calcTermMonths)}
                  className="w-full accent-[#002D72] mt-1.5 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label id="lbl-calc-rate" data-testid="lbl-calc-rate" htmlFor="input-interest-rate" className="block text-[11px] font-bold text-slate-600">
                    Interest Rate (% APY)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">{calcInterestRate}%</span>
                </div>
                <input
                  id="input-interest-rate"
                  data-testid="input-interest-rate"
                  data-automation-id="input-interest-rate"
                  name="interestRate"
                  type="number"
                  step="0.1"
                  value={calcInterestRate}
                  onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                />
                <input
                  id="slider-interest-rate"
                  data-testid="slider-interest-rate"
                  data-automation-id="slider-interest-rate"
                  name="interestRateSlider"
                  type="range"
                  min="1.0"
                  max="25.0"
                  step="0.1"
                  value={calcInterestRate}
                  onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                  aria-valuenow={calcInterestRate}
                  aria-valuemin={1.0}
                  aria-valuemax={25.0}
                  data-value={String(calcInterestRate)}
                  className="w-full accent-[#002D72] mt-1.5 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-600 uppercase font-bold block">Estimated Monthly Payment (EMI)</span>
                <span id="calculator-monthly-emi-result" data-testid="calculator-monthly-emi-result" className="text-xl font-extrabold font-mono text-emerald-800">
                  ${currentEmi.toFixed(2)} / mo
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-700 font-mono">
                <div>Total Interest: ${(currentEmi * calcTermMonths - calcAmount).toFixed(2)}</div>
                <div>Total Payable: ${(currentEmi * calcTermMonths).toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* New Application Form */}
          <div id="form-loan-origination" data-testid="form-loan-origination" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <Landmark className="w-4 h-4 text-[#002D72]" />
              <span>Apply for TestGrid Demo Bank Financing</span>
            </h3>

            <form onSubmit={handleLoanSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loan Product Type</label>
                  <select
                    id="select-loan-product-type"
                    data-testid="select-loan-product-type"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  >
                    <option value="PERSONAL">Personal Financing Loan</option>
                    <option value="HOME">Home Mortgage Loan</option>
                    <option value="AUTO">Automobile Vehicle Loan</option>
                    <option value="BUSINESS">Commercial Business Capital</option>
                    <option value="EDUCATION">Education Higher Ed Loan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requested Capital Amount ($)</label>
                  <input
                    id="input-req-loan-amount"
                    data-testid="input-req-loan-amount"
                    type="number"
                    value={reqAmount}
                    onChange={(e) => setReqAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>
              </div>

              {/* Employment Status Radio Buttons */}
              <div>
                <label id="lbl-employment-status" data-testid="lbl-employment-status" className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Employment Classification
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    id="lbl-radio-emp-w2"
                    data-testid="lbl-radio-emp-w2"
                    htmlFor="radio-emp-w2"
                    className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                  >
                    <input
                      id="radio-emp-w2"
                      data-testid="radio-emp-w2"
                      data-automation-id="radio-emp-w2"
                      type="radio"
                      name="empStatus"
                      value="W2_FULLTIME"
                      checked={empStatus === 'W2_FULLTIME'}
                      onChange={(e) => setEmpStatus(e.target.value)}
                      aria-checked={empStatus === 'W2_FULLTIME' ? 'true' : 'false'}
                      data-checked={empStatus === 'W2_FULLTIME' ? 'true' : 'false'}
                      className="text-[#002D72]"
                    />
                    <span className="font-medium text-slate-800">W-2 Full Time</span>
                  </label>

                  <label
                    id="lbl-radio-emp-1099"
                    data-testid="lbl-radio-emp-1099"
                    htmlFor="radio-emp-1099"
                    className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                  >
                    <input
                      id="radio-emp-1099"
                      data-testid="radio-emp-1099"
                      data-automation-id="radio-emp-1099"
                      type="radio"
                      name="empStatus"
                      value="1099_SELF"
                      checked={empStatus === '1099_SELF'}
                      onChange={(e) => setEmpStatus(e.target.value)}
                      aria-checked={empStatus === '1099_SELF' ? 'true' : 'false'}
                      data-checked={empStatus === '1099_SELF' ? 'true' : 'false'}
                      className="text-[#002D72]"
                    />
                    <span className="font-medium text-slate-800">1099 Contractor</span>
                  </label>

                  <label
                    id="lbl-radio-emp-retired"
                    data-testid="lbl-radio-emp-retired"
                    htmlFor="radio-emp-retired"
                    className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                  >
                    <input
                      id="radio-emp-retired"
                      data-testid="radio-emp-retired"
                      data-automation-id="radio-emp-retired"
                      type="radio"
                      name="empStatus"
                      value="RETIRED"
                      checked={empStatus === 'RETIRED'}
                      onChange={(e) => setEmpStatus(e.target.value)}
                      aria-checked={empStatus === 'RETIRED' ? 'true' : 'false'}
                      data-checked={empStatus === 'RETIRED' ? 'true' : 'false'}
                      className="text-[#002D72]"
                    />
                    <span className="font-medium text-slate-800">Retired / Other</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual Gross Income ($)</label>
                  <input
                    id="input-annual-income"
                    data-testid="input-annual-income"
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requested Term (Months)</label>
                  <input
                    id="input-req-loan-term"
                    data-testid="input-req-loan-term"
                    type="number"
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose of Loan</label>
                <input
                  id="input-loan-purpose"
                  data-testid="input-loan-purpose"
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>

              {/* Document Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Required Proof of Income Documents (W2 / Tax Return)
                </label>
                <div id="dropzone-document-upload" data-testid="dropzone-document-upload" className="p-3 border-2 border-dashed border-slate-300 hover:border-[#002D72] bg-slate-50 rounded text-center cursor-pointer transition">
                  <Upload className="w-5 h-5 text-[#002D72] mx-auto mb-1" />
                  <p className="text-xs text-slate-800 font-bold">Click or Drag PDF/PNG proof documents to upload</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Automated OCR verification active</p>
                  <input
                    id="input-file-document-upload"
                    data-testid="input-file-document-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files List */}
                <div className="mt-2 space-y-1">
                  {uploadedFiles.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-100 rounded border border-slate-200 text-xs text-slate-800 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#002D72]" />
                        <span>{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{doc.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Truth-in-Lending Disclosure iFrame & Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label id="lbl-loan-disclosure" data-testid="lbl-loan-disclosure" className="block text-[11px] font-bold text-slate-600">
                  Truth in Lending Act (TILA) & Credit Authorization Disclosure:
                </label>
                <iframe
                  id="iframe-loan-disclosure-terms"
                  data-testid="iframe-loan-disclosure-terms"
                  name="iframe-loan-disclosure-terms"
                  title="Truth in Lending Disclosure"
                  srcDoc={`<!DOCTYPE html><html><body style="font-family:sans-serif;font-size:11px;color:#334155;margin:0;padding:8px;background:#f8fafc;"><strong>TestGrid Demo Bank TILA Disclosures:</strong> Federal law requires full disclosure of loan interest rates, finance charges, and total loan payback amounts. By submitting this application, you authorize TestGrid Demo Bank to perform a hard credit inquiry with Equifax, Experian, or TransUnion. Late payments or default may be reported to consumer reporting agencies.</body></html>`}
                  className="w-full h-20 border border-slate-300 rounded bg-slate-50"
                />

                <div className="space-y-1 pt-1">
                  <label
                    id="lbl-checkbox-loan-credit-check"
                    data-testid="lbl-checkbox-loan-credit-check"
                    htmlFor="checkbox-loan-credit-check"
                    className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-800 select-none"
                  >
                    <input
                      id="checkbox-loan-credit-check"
                      data-testid="checkbox-loan-credit-check"
                      data-automation-id="checkbox-loan-credit-check"
                      name="creditCheckAuthorized"
                      type="checkbox"
                      checked={creditCheckAgreed}
                      onChange={(e) => setCreditCheckAgreed(e.target.checked)}
                      value={creditCheckAgreed ? 'true' : 'false'}
                      aria-checked={creditCheckAgreed ? 'true' : 'false'}
                      data-checked={creditCheckAgreed ? 'true' : 'false'}
                      data-state={creditCheckAgreed ? 'checked' : 'unchecked'}
                      required
                      className="w-4 h-4 rounded text-[#002D72] focus:ring-0 cursor-pointer"
                    />
                    <span>I authorize TestGrid Demo Bank to obtain my credit bureau history report.</span>
                  </label>

                  <label
                    id="lbl-checkbox-loan-autopay"
                    data-testid="lbl-checkbox-loan-autopay"
                    htmlFor="checkbox-loan-autopay"
                    className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-800 select-none"
                  >
                    <input
                      id="checkbox-loan-autopay"
                      data-testid="checkbox-loan-autopay"
                      data-automation-id="checkbox-loan-autopay"
                      name="autoPayOptIn"
                      type="checkbox"
                      checked={autopayAgreed}
                      onChange={(e) => setAutopayAgreed(e.target.checked)}
                      value={autopayAgreed ? 'true' : 'false'}
                      aria-checked={autopayAgreed ? 'true' : 'false'}
                      data-checked={autopayAgreed ? 'true' : 'false'}
                      data-state={autopayAgreed ? 'checked' : 'unchecked'}
                      className="w-4 h-4 rounded text-[#002D72] focus:ring-0 cursor-pointer"
                    />
                    <span>Opt-in for automatic monthly ACH repayment (0.25% APR Discount applied).</span>
                  </label>
                </div>
              </div>

              <button
                id="btn-submit-loan-app"
                data-testid="btn-submit-loan-app"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition cursor-pointer shadow-sm"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Financing Application for Underwriting'}
              </button>
            </form>
          </div>
        </div>

        {/* Loan Application Status Tracker Sidebar (1 Col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Submitted Applications Tracker ({loans.length})</span>
          </h3>

          <div className="space-y-2.5">
            {loans.map((app) => (
              <div
                key={app.id}
                id={`loan-status-card-${app.id}`}
                data-testid={`loan-status-card-${app.id}`}
                className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-[#002D72] uppercase">{app.loanType} LOAN</span>
                  <span
                    id={`loan-badge-${app.id}`}
                    data-testid={`loan-badge-${app.id}`}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : app.status === 'REJECTED'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 font-mono">${app.requestedAmount.toLocaleString()} USD</div>
                <div className="text-[10px] text-slate-500">
                  Applied: {app.appliedDate} • {app.termMonths} Months
                </div>

                {app.reviewerNotes && (
                  <p className="text-[11px] text-slate-800 p-2 bg-slate-50 rounded border border-slate-200 leading-tight">
                    <span className="font-bold text-[#002D72]">Underwriter:</span> {app.reviewerNotes}
                  </p>
                )}

                {/* Loan Processing Pipeline Stage Controls */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold">
                    <span>Workflow Stage:</span>
                    <span className="text-[#002D72] uppercase font-extrabold">{app.stage || app.status}</span>
                  </div>

                  {/* Advance Stage Buttons for Loan Officers & Admins */}
                  {(currentUser.role === 'LOAN_OFFICER' || currentUser.role === 'ADMIN' || currentUser.role === 'CUSTOMER') && (
                    <div className="space-y-1.5 pt-1">
                      {(!app.stage || app.stage === 'APPLICATION_RECEIVED') && (
                        <button
                          id={`btn-ocr-verify-${app.id}`}
                          data-testid={`btn-ocr-verify-${app.id}`}
                          onClick={() => {
                            advanceLoanStage(app.id, 'DOCUMENT_OCR_VERIFIED', 'OCR extracted W2 income $145,000 matches application.');
                          }}
                          className="w-full py-1 bg-blue-50 hover:bg-blue-100 text-[#002D72] border border-blue-300 font-bold text-[10px] rounded cursor-pointer transition flex items-center justify-center space-x-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>1. Run Document OCR Verification</span>
                        </button>
                      )}

                      {app.stage === 'DOCUMENT_OCR_VERIFIED' && (
                        <button
                          id={`btn-credit-check-${app.id}`}
                          data-testid={`btn-credit-check-${app.id}`}
                          onClick={() => {
                            advanceLoanStage(app.id, 'CREDIT_SCORE_CHECKED', 'Bureau pull confirmed FICO credit score 785.');
                          }}
                          className="w-full py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold text-[10px] rounded cursor-pointer transition flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-indigo-700" />
                          <span>2. Perform Credit & Risk Scoring</span>
                        </button>
                      )}

                      {app.stage === 'CREDIT_SCORE_CHECKED' && (
                        <button
                          id={`btn-underwrite-${app.id}`}
                          data-testid={`btn-underwrite-${app.id}`}
                          onClick={() => {
                            advanceLoanStage(app.id, 'UNDERWRITING_APPROVED', 'Underwriter approved loan term and rate.');
                          }}
                          className="w-full py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded cursor-pointer transition flex items-center justify-center space-x-1"
                        >
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>3. Underwriting Committee Approval</span>
                        </button>
                      )}

                      {(app.stage === 'UNDERWRITING_APPROVED' || app.status === 'APPROVED') && app.status !== 'DISBURSED' && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded space-y-1.5">
                          <span className="text-[10px] font-bold text-emerald-900 block">4. Disburse Loan Funds into Account</span>
                          <select
                            id={`select-disburse-account-${app.id}`}
                            data-testid={`select-disburse-account-${app.id}`}
                            defaultValue={accounts[0]?.id}
                            onChange={(e) => {
                              const targetId = e.target.value;
                              void disburseLoan(app.id, targetId);
                            }}
                            className="w-full bg-white border border-emerald-300 rounded p-1 text-[10px] font-bold text-slate-800"
                          >
                            <option value="">Select Account for Disbursal...</option>
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name} (${acc.balance.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {app.status === 'DISBURSED' && (
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200 text-center flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Disbursed to Checking Account</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Loan Officer Controls (if user is LOAN_OFFICER or ADMIN) */}
                {(currentUser.role === 'LOAN_OFFICER' || currentUser.role === 'ADMIN') && app.status === 'UNDER_REVIEW' && (
                  <div className="flex space-x-2 pt-1">
                    <button
                      id={`btn-approve-loan-${app.id}`}
                      data-testid={`btn-approve-loan-${app.id}`}
                      onClick={() => updateLoanStatus(app.id, 'APPROVED', 'Approved by Senior Underwriter.')}
                      className="w-1/2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded cursor-pointer transition"
                    >
                      Approve
                    </button>
                    <button
                      id={`btn-reject-loan-${app.id}`}
                      data-testid={`btn-reject-loan-${app.id}`}
                      onClick={() => updateLoanStatus(app.id, 'REJECTED', 'DTI ratio exceeded guidelines.')}
                      className="w-1/2 py-1 bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] rounded cursor-pointer transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
