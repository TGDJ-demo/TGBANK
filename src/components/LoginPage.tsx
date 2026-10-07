import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import {
  Building2,
  Lock,
  User,
  KeyRound,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Fingerprint,
  X,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DEMO_PERSONAS } from '../mockData';

export const LoginPage: React.FC = () => {
  const { login, addToast } = useBank();

  // Form input states
  const [username, setUsername] = useState('john.doe');
  const [password, setPassword] = useState('demo123');
  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>('customer');

  // Selenium-compatible Checkbox states (explicit boolean)
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [captchaChecked, setCaptchaChecked] = useState<boolean>(true);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(true);
  const [requireMfa, setRequireMfa] = useState<boolean>(false);

  // Flow states
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');

  // Demo Credentials Info Modal state
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Available demo credentials list
  const credentialList = [
    {
      key: 'customer',
      role: 'Retail Banking Customer',
      name: 'John Doe',
      username: 'john.doe',
      password: 'demo123',
      otp: '123456',
      badge: 'Retail',
      description: 'Standard checking & savings accounts, transfers, card management, bill pay, personal loan.',
    },
    {
      key: 'premiumCustomer',
      role: 'Private Wealth / Premium',
      name: 'Victoria Sterling',
      username: 'victoria.sterling',
      password: 'demo123',
      otp: '123456',
      badge: 'VIP Wealth',
      description: 'High net-worth portfolio, investment assets, platinum line of credit, premium rewards.',
    },
    {
      key: 'businessCustomer',
      role: 'Commercial Business Client',
      name: 'Acme Technologies Inc.',
      username: 'acme.corp',
      password: 'demo123',
      otp: '123456',
      badge: 'Corporate',
      description: 'Treasury operations, payroll disbursements, commercial lines of credit, high-value wires.',
    },
    {
      key: 'loanOfficer',
      role: 'Senior Loan Underwriter',
      name: 'Robert Smith',
      username: 'officer.smith',
      password: 'demo123',
      otp: '123456',
      badge: 'Underwriting',
      description: 'Loan origination review, stage advances, credit analysis, disbursement authority.',
    },
    {
      key: 'bankAdmin',
      role: 'System Administrator',
      name: 'Sanjay G',
      username: 'admin.wtb',
      password: 'demo123',
      otp: '123456',
      badge: 'Super Admin',
      description: 'Operations reserve ($200,456,745.00), Chaos engine control, API latency & error simulators, audit log stream.',
    },
    {
      key: 'supportExec',
      role: 'Customer Support Lead',
      name: 'David Miller',
      username: 'support.agent',
      password: 'demo123',
      otp: '123456',
      badge: 'Support Lead',
      description: 'Client inquiry triage, fraud dispute investigations, live support ticketing.',
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: `Copied "${text}" for automation testing.`,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAutofill = (cred: typeof credentialList[0]) => {
    setUsername(cred.username);
    setPassword(cred.password);
    setSelectedPersonaKey(cred.key);
    setCaptchaChecked(true);
    setTermsAgreed(true);
    setErrorMessage('');
    setShowCredentialsModal(false);
    addToast({
      type: 'success',
      title: 'Credentials Auto-Filled',
      message: `Loaded credentials for ${cred.name} (${cred.role}).`,
    });
  };

  const handlePersonaSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    setSelectedPersonaKey(key);
    const found = credentialList.find((c) => c.key === key);
    if (found) {
      setUsername(found.username);
      setPassword(found.password);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please provide both username and password.');
      return;
    }

    if (!captchaChecked) {
      setErrorMessage('Please confirm the reCAPTCHA verification checkbox.');
      return;
    }

    if (!termsAgreed) {
      setErrorMessage('Please accept the Security Policy & Terms of Service checkbox.');
      return;
    }

    // Match credentials
    const validCred = credentialList.find(
      (c) => c.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!validCred && password !== 'demo123') {
      setErrorMessage('Invalid credentials. Check the "i" button for valid demo usernames and passwords.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (requireMfa) {
        setShowOtpStep(true);
      } else {
        completeLogin(validCred ? validCred.key : 'customer');
      }
    }, 450);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456' && otpCode !== '000000') {
      setErrorMessage('Invalid OTP code. Please enter 123456 for the demo environment.');
      return;
    }

    const validCred = credentialList.find(
      (c) => c.username.toLowerCase() === username.trim().toLowerCase()
    );
    completeLogin(validCred ? validCred.key : selectedPersonaKey);
  };

  const completeLogin = (personaKey: string) => {
    login(personaKey);
  };

  const handleBiometricLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      completeLogin(selectedPersonaKey || 'customer');
    }, 400);
  };

  return (
    <div
      id="login-page-container"
      data-testid="login-page-container"
      data-automation-id="login-page-container"
      className="min-h-screen bg-gradient-to-br from-[#001D4A] via-[#002D72] to-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8"
    >
      {/* Top Navbar Brand */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <div
            id="login-brand-logo"
            data-testid="login-brand-logo"
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-md backdrop-blur-xs"
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span
              id="login-brand-name"
              data-testid="login-brand-name"
              className="text-xl font-bold tracking-tight text-white block leading-tight font-sans"
            >
              TESTGRID BANK
            </span>
            <span
              id="login-brand-subtitle"
              data-testid="login-brand-subtitle"
              className="text-[11px] text-blue-200 tracking-wide font-medium"
            >
              Core Banking Automation & Selenium Testing Rig
            </span>
          </div>
        </div>

        {/* Demo Credentials Info Button ("i") */}
        <button
          id="btn-demo-credentials-info"
          data-testid="btn-demo-credentials-info"
          data-automation-id="btn-demo-credentials-info"
          type="button"
          onClick={() => setShowCredentialsModal(true)}
          className="flex items-center space-x-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer border border-amber-300 animate-pulse hover:animate-none"
          title="Click to view all demo credentials and quick-fill logins"
          aria-label="View Demo User Credentials"
        >
          <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-300 flex items-center justify-center font-extrabold text-xs">
            i
          </div>
          <span className="font-extrabold tracking-wide">Demo Credentials</span>
        </button>
      </div>

      {/* Main Login Card Canvas */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div
          id="login-card"
          data-testid="login-card"
          data-automation-id="login-card"
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        >
          {/* Card Header */}
          <div className="bg-[#002D72] p-6 text-center text-white border-b border-[#001D4A] relative">
            <h1
              id="login-heading-title"
              data-testid="login-heading-title"
              className="text-xl font-bold tracking-tight text-white"
            >
              Sign In to Online Banking
            </h1>
            <p
              id="login-heading-subtitle"
              data-testid="login-heading-subtitle"
              className="text-xs text-blue-200 mt-1"
            >
              Enter credentials or pick a demo persona below
            </p>

            {/* Quick "i" icon button inside header for extra visibility */}
            <button
              id="btn-header-info-icon"
              data-testid="btn-header-info-icon"
              type="button"
              onClick={() => setShowCredentialsModal(true)}
              className="absolute right-4 top-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-blue-100 hover:text-white transition cursor-pointer"
              title="Show credentials list"
              aria-label="Demo Credentials Info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Quick Persona Dropdown Selector for Selenium automation */}
            <div>
              <label
                id="lbl-persona-select"
                data-testid="lbl-persona-select"
                htmlFor="select-login-persona"
                className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1"
              >
                Quick Select Persona (Selenium Dropdown):
              </label>
              <select
                id="select-login-persona"
                data-testid="select-login-persona"
                data-automation-id="select-login-persona"
                name="demoPersona"
                value={selectedPersonaKey}
                data-value={selectedPersonaKey}
                data-selected={selectedPersonaKey}
                onChange={handlePersonaSelectChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#002D72] focus:bg-white cursor-pointer"
              >
                {credentialList.map((cred) => (
                  <option
                    key={cred.key}
                    id={`opt-persona-${cred.key}`}
                    data-testid={`opt-persona-${cred.key}`}
                    value={cred.key}
                  >
                    {cred.name} ({cred.role}) — {cred.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div
                id="text-login-error-message"
                data-testid="text-login-error-message"
                data-automation-id="text-login-error-message"
                className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-xs flex items-center space-x-2"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {!showOtpStep ? (
              /* Step 1: Standard Username & Password Form */
              <form
                id="form-login"
                data-testid="form-login"
                data-automation-id="form-login"
                onSubmit={handleFormSubmit}
                className="space-y-3.5"
              >
                {/* Username Input */}
                <div>
                  <label
                    id="lbl-username"
                    data-testid="lbl-username"
                    htmlFor="login-username-input"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Online Banking Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="login-username-input"
                      data-testid="login-username-input"
                      data-automation-id="login-username-input"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. john.doe"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#002D72] focus:bg-white font-medium"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    id="lbl-password"
                    data-testid="lbl-password"
                    htmlFor="login-password-input"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="login-password-input"
                      data-testid="login-password-input"
                      data-automation-id="login-password-input"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="demo123"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#002D72] focus:bg-white font-medium"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Automation Checkboxes Section with explicit checked, aria-checked, data-checked, value */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  {/* Remember Me Checkbox */}
                  <label
                    id="lbl-login-remember"
                    data-testid="lbl-login-remember"
                    htmlFor="login-remember-checkbox"
                    className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer font-medium select-none"
                  >
                    <input
                      id="login-remember-checkbox"
                      data-testid="login-remember-checkbox"
                      data-automation-id="login-remember-checkbox"
                      name="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      value={rememberMe ? 'true' : 'false'}
                      aria-checked={rememberMe ? 'true' : 'false'}
                      data-checked={rememberMe ? 'true' : 'false'}
                      data-state={rememberMe ? 'checked' : 'unchecked'}
                      className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                    />
                    <span>Remember User Device on this Browser</span>
                  </label>

                  {/* Mock reCAPTCHA Checkbox */}
                  <div
                    id="box-mock-captcha"
                    data-testid="box-mock-captcha"
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <label
                      id="lbl-mock-captcha"
                      data-testid="lbl-mock-captcha"
                      htmlFor="checkbox-mock-captcha"
                      className="flex items-center space-x-2.5 text-xs text-slate-800 cursor-pointer font-medium select-none"
                    >
                      <input
                        id="checkbox-mock-captcha"
                        data-testid="checkbox-mock-captcha"
                        data-automation-id="checkbox-mock-captcha"
                        name="captcha"
                        type="checkbox"
                        checked={captchaChecked}
                        onChange={(e) => setCaptchaChecked(e.target.checked)}
                        value={captchaChecked ? 'true' : 'false'}
                        aria-checked={captchaChecked ? 'true' : 'false'}
                        data-checked={captchaChecked ? 'true' : 'false'}
                        data-state={captchaChecked ? 'checked' : 'unchecked'}
                        className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                      />
                      <span>I am not a robot (Mock reCAPTCHA v2)</span>
                    </label>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>

                  {/* Security Terms Agreement Checkbox */}
                  <label
                    id="lbl-terms-agreed"
                    data-testid="lbl-terms-agreed"
                    htmlFor="checkbox-terms-agreed"
                    className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer font-medium select-none"
                  >
                    <input
                      id="checkbox-terms-agreed"
                      data-testid="checkbox-terms-agreed"
                      data-automation-id="checkbox-terms-agreed"
                      name="termsAgreed"
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      value={termsAgreed ? 'true' : 'false'}
                      aria-checked={termsAgreed ? 'true' : 'false'}
                      data-checked={termsAgreed ? 'true' : 'false'}
                      data-state={termsAgreed ? 'checked' : 'unchecked'}
                      className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                    />
                    <span>Accept Security Policy & Terms of Service</span>
                  </label>

                  {/* Require MFA Checkbox (for testing multi-step automation flows) */}
                  <label
                    id="lbl-require-mfa"
                    data-testid="lbl-require-mfa"
                    htmlFor="checkbox-require-mfa"
                    className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer font-medium select-none"
                  >
                    <input
                      id="checkbox-require-mfa"
                      data-testid="checkbox-require-mfa"
                      data-automation-id="checkbox-require-mfa"
                      name="requireMfa"
                      type="checkbox"
                      checked={requireMfa}
                      onChange={(e) => setRequireMfa(e.target.checked)}
                      value={requireMfa ? 'true' : 'false'}
                      aria-checked={requireMfa ? 'true' : 'false'}
                      data-checked={requireMfa ? 'true' : 'false'}
                      data-state={requireMfa ? 'checked' : 'unchecked'}
                      className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                    />
                    <span>Require 2-Factor OTP Challenge Step</span>
                  </label>
                </div>

                {/* Form Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    id="btn-login-submit"
                    data-testid="btn-login-submit"
                    data-automation-id="btn-login-submit"
                    name="submitLogin"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>Sign In To Secure Account</span>
                  </button>

                  <button
                    id="btn-biometric-login"
                    data-testid="btn-biometric-login"
                    data-automation-id="btn-biometric-login"
                    type="button"
                    onClick={handleBiometricLogin}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition border border-slate-300 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4 text-[#002D72]" />
                    <span>Instant Biometric Sign In (Passkey)</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: OTP Verification Screen */
              <form
                id="form-otp-verification"
                data-testid="form-otp-verification"
                data-automation-id="form-otp-verification"
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <KeyRound className="w-8 h-8 text-[#002D72] mx-auto mb-2" />
                  <h3
                    id="otp-heading-title"
                    data-testid="otp-heading-title"
                    className="text-sm font-bold text-[#002D72]"
                  >
                    Two-Factor Authentication Required
                  </h3>
                  <p
                    id="otp-heading-instruction"
                    data-testid="otp-heading-instruction"
                    className="text-xs text-slate-600 mt-1"
                  >
                    Enter the 6-digit passcode sent to your registered device.
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1.5 font-mono font-bold bg-amber-100/70 p-1 rounded border border-amber-200">
                    Test OTP Passcode: 123456
                  </p>
                </div>

                <div>
                  <label
                    id="lbl-otp-code"
                    data-testid="lbl-otp-code"
                    htmlFor="input-otp-code"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Enter 6-Digit One-Time Passcode
                  </label>
                  <input
                    id="input-otp-code"
                    data-testid="input-otp-code"
                    data-automation-id="input-otp-code"
                    name="otp"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-center text-xl tracking-widest font-mono text-slate-900 focus:outline-none focus:border-[#002D72] font-bold"
                    required
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    id="btn-otp-back"
                    data-testid="btn-otp-back"
                    data-automation-id="btn-otp-back"
                    type="button"
                    onClick={() => setShowOtpStep(false)}
                    className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg border border-slate-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="btn-otp-verify"
                    data-testid="btn-otp-verify"
                    data-automation-id="btn-otp-verify"
                    type="submit"
                    className="w-2/3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-sm"
                  >
                    Verify & Go to Dashboard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-blue-200/70 py-2">
        <p>
          TestGrid Bank Demo Platform • Designed for Selenium, Playwright, Appium & Cypress Automated Testing
        </p>
      </div>

      {/* Demo Credentials Modal (Opened via the "i" button) */}
      {showCredentialsModal && (
        <div
          id="modal-demo-credentials"
          data-testid="modal-demo-credentials"
          data-automation-id="modal-demo-credentials"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            id="modal-demo-credentials-card"
            data-testid="modal-demo-credentials-card"
            className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900 my-auto"
          >
            {/* Modal Header */}
            <div className="bg-[#002D72] p-4 sm:p-5 text-white flex items-center justify-between border-b border-[#001D4A]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                  i
                </div>
                <div>
                  <h2
                    id="heading-credentials-modal"
                    data-testid="heading-credentials-modal"
                    className="text-base font-bold text-white tracking-tight"
                  >
                    Demo User Credentials & Personas
                  </h2>
                  <p className="text-xs text-blue-200">
                    Use any of the valid credentials below for Selenium tests or manual validation.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-credentials-modal"
                data-testid="btn-close-credentials-modal"
                data-automation-id="btn-close-credentials-modal"
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="p-1 text-blue-200 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
                aria-label="Close Demo Credentials Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: Table of Personas & Quick Action Buttons */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-700 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-[#002D72] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#002D72]">Selenium Testing Tip:</span> All users share default password{' '}
                  <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-300 text-slate-900">
                    demo123
                  </code>{' '}
                  and MFA passcode{' '}
                  <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-300 text-slate-900">
                    123456
                  </code>
                  . Click <strong className="text-emerald-700">Auto-fill & Use</strong> on any card to populate the login form immediately!
                </div>
              </div>

              {/* Grid of Credentials */}
              <div
                id="grid-demo-credentials-list"
                data-testid="grid-demo-credentials-list"
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {credentialList.map((cred) => (
                  <div
                    key={cred.key}
                    id={`card-cred-${cred.key}`}
                    data-testid={`card-cred-${cred.key}`}
                    data-automation-id={`card-cred-${cred.key}`}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-[#002D72] hover:bg-blue-50/30 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          id={`badge-role-${cred.key}`}
                          data-testid={`badge-role-${cred.key}`}
                          className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-[#002D72] rounded border border-blue-200"
                        >
                          {cred.badge}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">{cred.role}</span>
                      </div>

                      <h4
                        id={`text-cred-name-${cred.key}`}
                        data-testid={`text-cred-name-${cred.key}`}
                        className="text-xs font-bold text-slate-900 mt-2"
                      >
                        {cred.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                        {cred.description}
                      </p>

                      {/* Credentials Box */}
                      <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200 font-mono text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">Username:</span>
                          <div className="flex items-center space-x-1">
                            <span
                              id={`val-username-${cred.key}`}
                              data-testid={`val-username-${cred.key}`}
                              className="font-bold text-slate-900 font-mono"
                            >
                              {cred.username}
                            </span>
                            <button
                              id={`btn-copy-username-${cred.key}`}
                              data-testid={`btn-copy-username-${cred.key}`}
                              type="button"
                              onClick={() => handleCopy(cred.username, `user-${cred.key}`)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy username"
                            >
                              {copiedKey === `user-${cred.key}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">Password:</span>
                          <div className="flex items-center space-x-1">
                            <span
                              id={`val-password-${cred.key}`}
                              data-testid={`val-password-${cred.key}`}
                              className="font-bold text-slate-900 font-mono"
                            >
                              {cred.password}
                            </span>
                            <button
                              id={`btn-copy-password-${cred.key}`}
                              data-testid={`btn-copy-password-${cred.key}`}
                              type="button"
                              onClick={() => handleCopy(cred.password, `pass-${cred.key}`)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy password"
                            >
                              {copiedKey === `pass-${cred.key}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`btn-autofill-${cred.key}`}
                      data-testid={`btn-autofill-${cred.key}`}
                      data-automation-id={`btn-autofill-${cred.key}`}
                      type="button"
                      onClick={() => handleAutofill(cred)}
                      className="w-full py-1.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Auto-fill & Use {cred.name.split(' ')[0]}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                id="btn-footer-close-credentials"
                data-testid="btn-footer-close-credentials"
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg cursor-pointer transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
