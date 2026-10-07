import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import { Building2, ShieldCheck, Fingerprint, Lock, User, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import { DEMO_PERSONAS } from '../mockData';

interface LoginModalProps {
  onLoginSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const { switchPersona, login, addToast, featureFlags } = useBank();
  const [username, setUsername] = useState('john.doe');
  const [password, setPassword] = useState('demo123');
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    if (password === 'invalid') {
      setErrorMessage('Invalid credentials. Please verify username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Trigger OTP step
      setShowOtpStep(true);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456' && otpCode !== '000000' && otpCode.length < 6) {
      setErrorMessage('Invalid 6-digit OTP code. Enter 123456 for demo test mode.');
      return;
    }

    // Match persona by username or default
    const foundPersona = Object.entries(DEMO_PERSONAS).find(
      ([_, persona]) => persona.username.toLowerCase() === username.toLowerCase()
    );

    const personaKey = foundPersona ? foundPersona[0] : 'customer';
    login(personaKey);

    addToast({
      type: 'success',
      title: 'Authentication Successful',
      message: `Logged in to TestGrid Bank Demo as ${DEMO_PERSONAS[personaKey]?.name || 'User'}.`,
    });

    if (onLoginSuccess) {
      onLoginSuccess();
    }
  };

  const handleQuickPersonaSelect = (key: string) => {
    const p = DEMO_PERSONAS[key];
    setUsername(p.username);
    setPassword('demo123');
    setCaptchaChecked(true);
    setErrorMessage('');
  };

  const handleBiometricLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const foundPersona = Object.entries(DEMO_PERSONAS).find(
        ([_, persona]) => persona.username.toLowerCase() === username.toLowerCase()
      );
      const personaKey = foundPersona ? foundPersona[0] : 'customer';
      login(personaKey);
      addToast({
        type: 'success',
        title: 'Biometric Login Verified',
        message: `Face ID / Touch ID passed for ${DEMO_PERSONAS[personaKey]?.name || 'User'}.`,
      });
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 800);
  };

  return (
    <div
      id="login-overlay-modal"
      data-testid="login-overlay-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="login-card-container"
        data-testid="login-card-container"
        className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden text-slate-900"
      >
        {/* Banner Header */}
        <div className="bg-[#002D72] p-6 text-center text-white border-b border-[#001D4A]">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-2 border border-white/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 id="login-heading-title" data-testid="login-heading-title" className="text-xl font-bold tracking-tight text-white">
            TESTGRID BANK DEMO
          </h1>
          <p id="login-heading-subtitle" data-testid="login-heading-subtitle" className="text-xs text-blue-200 mt-0.5">
            Enterprise Banking Platform for Live Testing & Automation
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Select Personas Bar */}
          <div>
            <label id="lbl-quick-personas" data-testid="lbl-quick-personas" className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Quick Select Test Persona:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(DEMO_PERSONAS).map(([key, persona]) => (
                <button
                  key={key}
                  id={`btn-persona-${key}`}
                  data-testid={`btn-persona-${key}`}
                  type="button"
                  onClick={() => handleQuickPersonaSelect(key)}
                  className={`p-2 rounded border text-left text-xs transition cursor-pointer flex items-center space-x-2 ${
                    username === persona.username
                      ? 'bg-blue-50 border-[#002D72] text-[#002D72] font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#002D72] shrink-0" />
                  <div className="truncate">
                    <div className="truncate font-bold">{persona.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-slate-500">{persona.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {!showOtpStep ? (
            /* Main Login Form */
            <form id="form-login" data-testid="form-login" onSubmit={handleFormSubmit} className="space-y-4">
              {errorMessage && (
                <div
                  id="text-login-error-message"
                  data-testid="text-login-error-message"
                  className="p-3 bg-red-50 border border-red-300 rounded text-red-800 text-xs flex items-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label id="lbl-username" data-testid="lbl-username" htmlFor="login-username-input" className="block text-xs font-bold text-slate-700 mb-1">
                  Online Banking Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="login-username-input"
                    data-testid="login-username-input"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#002D72] focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label id="lbl-password" data-testid="lbl-password" htmlFor="login-password-input" className="block text-xs font-bold text-slate-700 mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="login-password-input"
                    data-testid="login-password-input"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#002D72] focus:bg-white font-medium"
                    required
                  />
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="login-remember-checkbox"
                    data-testid="login-remember-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-100 border-slate-300 text-[#002D72] focus:ring-0"
                  />
                  <span className="text-slate-700 font-medium">Remember User</span>
                </label>
                <button
                  id="link-forgot-password"
                  data-testid="link-forgot-password"
                  type="button"
                  onClick={() => addToast({ type: 'info', title: 'Forgot Password', message: 'Demo password reset link dispatched to registered email.' })}
                  className="text-[#002D72] font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Mock CAPTCHA Toggle */}
              <div id="box-mock-captcha" data-testid="box-mock-captcha" className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    id="checkbox-mock-captcha"
                    data-testid="checkbox-mock-captcha"
                    type="checkbox"
                    checked={captchaChecked}
                    onChange={(e) => setCaptchaChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-[#002D72]"
                  />
                  <span>I am not a robot (Mock reCAPTCHA v2)</span>
                </label>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="btn-login-submit"
                  data-testid="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition shadow flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Sign In To Secure Account</span>
                </button>

                <button
                  id="btn-biometric-login"
                  data-testid="btn-biometric-login"
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded transition border border-slate-300 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-[#002D72]" />
                  <span>Use Biometric Authentication (Face ID / Passkey)</span>
                </button>
              </div>
            </form>
          ) : (
            /* OTP Verification Screen */
            <form id="form-otp-verification" data-testid="form-otp-verification" onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <KeyRound className="w-8 h-8 text-[#002D72] mx-auto mb-2" />
                <h3 id="otp-heading-title" data-testid="otp-heading-title" className="text-sm font-bold text-[#002D72]">
                  Multi-Factor Authentication Required
                </h3>
                <p id="otp-heading-instruction" data-testid="otp-heading-instruction" className="text-xs text-slate-600 mt-1">
                  We sent a 6-digit security code to your registered mobile device ending in **5678.
                </p>
                <p className="text-[10px] text-amber-800 mt-1 font-mono font-bold">Demo Test OTP Code: 123456</p>
              </div>

              {errorMessage && (
                <div id="text-otp-error-message" data-testid="text-otp-error-message" className="p-2.5 bg-red-50 text-red-800 text-xs border border-red-200 rounded">
                  {errorMessage}
                </div>
              )}

              <div>
                <label id="lbl-otp-code" data-testid="lbl-otp-code" htmlFor="input-otp-code" className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit One-Time Passcode
                </label>
                <input
                  id="input-otp-code"
                  data-testid="input-otp-code"
                  name="otp"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-center text-lg tracking-widest font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  id="btn-otp-back"
                  data-testid="btn-otp-back"
                  type="button"
                  onClick={() => setShowOtpStep(false)}
                  className="w-1/3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="btn-otp-verify"
                  data-testid="btn-otp-verify"
                  type="submit"
                  className="w-2/3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded transition cursor-pointer"
                >
                  Verify & Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
