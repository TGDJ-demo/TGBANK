import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import { UserCheck, ShieldCheck, Upload, Save, CheckCircle2, Lock, FileCheck } from 'lucide-react';

export const CustomerProfileView: React.FC = () => {
  const { currentUser, addToast } = useBank();

  const [street, setStreet] = useState(currentUser.address.street);
  const [city, setCity] = useState(currentUser.address.city);
  const [state, setState] = useState(currentUser.address.state);
  const [zipCode, setZipCode] = useState(currentUser.address.zipCode);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [mfaEnabled, setMfaEnabled] = useState(currentUser.mfaEnabled);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [paperlessEnabled, setPaperlessEnabled] = useState<boolean>(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(15);
  const [language, setLanguage] = useState<string>('en-US');
  const [timezone, setTimezone] = useState<string>('America/Los_Angeles');
  const [mfaMethod, setMfaMethod] = useState<'SMS' | 'AUTHENTICATOR' | 'SECURITY_KEY'>('SMS');
  const [isSaving, setIsSaving] = useState(false);

  const [kycDocs, setKycDocs] = useState<{ name: string; date: string; status: string }[]>([
    { name: 'Passport_Scan_Valid.pdf', date: '2025-11-10', status: 'VERIFIED' },
    { name: 'Proof_Of_Address_Utility.pdf', date: '2026-01-15', status: 'VERIFIED' },
  ]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Personal contact & residence details saved.',
      });
    }, 500);
  };

  const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setKycDocs((prev) => [
        ...prev,
        {
          name: files[0].name,
          date: new Date().toISOString().split('T')[0],
          status: 'PENDING_REVIEW',
        },
      ]);
      addToast({
        type: 'info',
        title: 'KYC Document Received',
        message: 'Document submitted for compliance review.',
      });
    }
  };

  return (
    <div id="profile-view-container" data-testid="profile-view-container" className="space-y-4">
      {/* Header */}
      <div>
        <h1 id="heading-profile-title" data-testid="heading-profile-title" className="text-xl font-bold text-slate-900 tracking-tight">
          Customer Profile & Identity KYC Portal
        </h1>
        <p id="subheading-profile" data-testid="subheading-profile" className="text-xs text-slate-500 mt-0.5">
          Maintain residential address, contact details, identity verification documents, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contact Info Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-3.5 pb-3 border-b border-slate-200">
            <img
              id="img-profile-avatar-large"
              data-testid="img-profile-avatar-large"
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-14 h-14 rounded-lg object-cover border-2 border-[#002D72] shadow-sm"
            />
            <div>
              <h2 id="text-profile-full-name" data-testid="text-profile-full-name" className="text-base font-bold text-slate-900">
                {currentUser.name}
              </h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span id="badge-profile-role" data-testid="badge-profile-role" className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-[#002D72] rounded border border-blue-200">
                  {currentUser.role}
                </span>
                <span id="badge-kyc-status" data-testid="badge-kyc-status" className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  KYC {currentUser.kycStatus}
                </span>
              </div>
            </div>
          </div>

          <form id="form-customer-profile" data-testid="form-customer-profile" onSubmit={handleProfileSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  id="input-profile-email"
                  data-testid="input-profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  id="input-profile-phone"
                  data-testid="input-profile-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
              <input
                id="input-street-address"
                data-testid="input-street-address"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  id="input-city"
                  data-testid="input-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  id="input-state"
                  data-testid="input-state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Postal Zip Code</label>
                <input
                  id="input-zipcode"
                  data-testid="input-zipcode"
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#002D72]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label id="lbl-profile-language" data-testid="lbl-profile-language" htmlFor="select-profile-language" className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Language & Locale (Dropdown)
                </label>
                <select
                  id="select-profile-language"
                  data-testid="select-profile-language"
                  data-automation-id="select-profile-language"
                  name="language"
                  value={language}
                  data-value={language}
                  data-selected={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#002D72] cursor-pointer"
                >
                  <option id="opt-lang-en" value="en-US">English (United States)</option>
                  <option id="opt-lang-es" value="es-US">Español (Estados Unidos)</option>
                  <option id="opt-lang-fr" value="fr-CA">Français (Canada)</option>
                  <option id="opt-lang-de" value="de-DE">Deutsch (Deutschland)</option>
                  <option id="opt-lang-zh" value="zh-CN">Simplified Chinese (中文)</option>
                </select>
              </div>

              <div>
                <label id="lbl-profile-timezone" data-testid="lbl-profile-timezone" htmlFor="select-profile-timezone" className="block text-xs font-bold text-slate-700 mb-1">
                  Account Timezone (Dropdown)
                </label>
                <select
                  id="select-profile-timezone"
                  data-testid="select-profile-timezone"
                  data-automation-id="select-profile-timezone"
                  name="timezone"
                  value={timezone}
                  data-value={timezone}
                  data-selected={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#002D72] cursor-pointer"
                >
                  <option id="opt-tz-pst" value="America/Los_Angeles">Pacific Time (US & Canada - UTC-8)</option>
                  <option id="opt-tz-mst" value="America/Denver">Mountain Time (US & Canada - UTC-7)</option>
                  <option id="opt-tz-cst" value="America/Chicago">Central Time (US & Canada - UTC-6)</option>
                  <option id="opt-tz-est" value="America/New_York">Eastern Time (US & Canada - UTC-5)</option>
                  <option id="opt-tz-gmt" value="Europe/London">London / UTC GMT</option>
                </select>
              </div>
            </div>

            <button
              id="btn-save-profile"
              data-testid="btn-save-profile"
              data-automation-id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* KYC Document Upload & Security (1 Col) */}
        <div className="space-y-4">
          {/* KYC Upload Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Identity KYC Verification Documents</span>
            </h3>

            <div id="dropzone-kyc-upload" data-testid="dropzone-kyc-upload" className="p-3 border-2 border-dashed border-slate-300 hover:border-[#002D72] bg-slate-50 rounded text-center cursor-pointer transition">
              <Upload className="w-5 h-5 text-[#002D72] mx-auto mb-1" />
              <p className="text-xs text-slate-800 font-bold">Upload Government Photo ID / Passport</p>
              <input id="input-kyc-upload" data-testid="input-kyc-upload" type="file" onChange={handleKycUpload} className="hidden" />
            </div>

            <div className="space-y-1.5">
              {kycDocs.map((doc, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between font-mono">
                  <div className="truncate pr-2">
                    <p className="text-slate-900 font-bold truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500">{doc.date}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* MFA & Security Preferences */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-[#002D72]" />
              <span>Multi-Factor Authentication & Security</span>
            </h3>

            {/* MFA Switch */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Require 2FA OTP</span>
                <span className="text-[10px] text-slate-500">SMS challenge on every sign-in</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="checkbox-mfa-toggle"
                  data-testid="checkbox-mfa-toggle"
                  data-automation-id="checkbox-mfa-toggle"
                  name="mfaEnabled"
                  type="checkbox"
                  role="switch"
                  checked={mfaEnabled}
                  onChange={(e) => setMfaEnabled(e.target.checked)}
                  value={mfaEnabled ? 'true' : 'false'}
                  aria-checked={mfaEnabled ? 'true' : 'false'}
                  data-checked={mfaEnabled ? 'true' : 'false'}
                  data-state={mfaEnabled ? 'checked' : 'unchecked'}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-0 cursor-pointer"
                />
                <button
                  id="switch-mfa-toggle"
                  data-testid="switch-mfa-toggle"
                  data-automation-id="switch-mfa-toggle"
                  role="switch"
                  aria-checked={mfaEnabled ? 'true' : 'false'}
                  data-checked={mfaEnabled ? 'true' : 'false'}
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer border ${
                    mfaEnabled ? 'bg-emerald-700 border-emerald-800 text-white' : 'bg-slate-200 border-slate-300 text-slate-800'
                  }`}
                >
                  {mfaEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication Delivery Method Radio Buttons */}
            {mfaEnabled && (
              <div id="section-mfa-channels" data-testid="section-mfa-channels" className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Primary 2FA Authentication Channel (Radio Buttons):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    id="lbl-radio-mfa-sms"
                    data-testid="lbl-radio-mfa-sms"
                    htmlFor="radio-mfa-sms"
                    className="p-1.5 bg-white border border-slate-200 rounded cursor-pointer flex items-center space-x-1.5 text-xs hover:bg-slate-50"
                  >
                    <input
                      id="radio-mfa-sms"
                      data-testid="radio-mfa-sms"
                      data-automation-id="radio-mfa-sms"
                      type="radio"
                      name="mfaMethod"
                      value="SMS"
                      checked={mfaMethod === 'SMS'}
                      onChange={() => setMfaMethod('SMS')}
                      aria-checked={mfaMethod === 'SMS' ? 'true' : 'false'}
                      data-checked={mfaMethod === 'SMS' ? 'true' : 'false'}
                      className="text-[#002D72] cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">SMS OTP</span>
                  </label>

                  <label
                    id="lbl-radio-mfa-authenticator"
                    data-testid="lbl-radio-mfa-authenticator"
                    htmlFor="radio-mfa-authenticator"
                    className="p-1.5 bg-white border border-slate-200 rounded cursor-pointer flex items-center space-x-1.5 text-xs hover:bg-slate-50"
                  >
                    <input
                      id="radio-mfa-authenticator"
                      data-testid="radio-mfa-authenticator"
                      data-automation-id="radio-mfa-authenticator"
                      type="radio"
                      name="mfaMethod"
                      value="AUTHENTICATOR"
                      checked={mfaMethod === 'AUTHENTICATOR'}
                      onChange={() => setMfaMethod('AUTHENTICATOR')}
                      aria-checked={mfaMethod === 'AUTHENTICATOR' ? 'true' : 'false'}
                      data-checked={mfaMethod === 'AUTHENTICATOR' ? 'true' : 'false'}
                      className="text-[#002D72] cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">Auth App</span>
                  </label>

                  <label
                    id="lbl-radio-mfa-security-key"
                    data-testid="lbl-radio-mfa-security-key"
                    htmlFor="radio-mfa-security-key"
                    className="p-1.5 bg-white border border-slate-200 rounded cursor-pointer flex items-center space-x-1.5 text-xs hover:bg-slate-50"
                  >
                    <input
                      id="radio-mfa-security-key"
                      data-testid="radio-mfa-security-key"
                      data-automation-id="radio-mfa-security-key"
                      type="radio"
                      name="mfaMethod"
                      value="SECURITY_KEY"
                      checked={mfaMethod === 'SECURITY_KEY'}
                      onChange={() => setMfaMethod('SECURITY_KEY')}
                      aria-checked={mfaMethod === 'SECURITY_KEY' ? 'true' : 'false'}
                      data-checked={mfaMethod === 'SECURITY_KEY' ? 'true' : 'false'}
                      className="text-[#002D72] cursor-pointer"
                    />
                    <span className="font-bold text-slate-800">FIDO2 Key</span>
                  </label>
                </div>
              </div>
            )}

            {/* Session Timeout Slider */}
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label id="lbl-session-timeout" data-testid="lbl-session-timeout" htmlFor="slider-session-timeout" className="font-bold text-slate-700">
                  Auto-Logout Timeout
                </label>
                <span id="val-session-timeout" data-testid="val-session-timeout" className="font-mono font-bold text-[#002D72]">
                  {sessionTimeoutMinutes} min
                </span>
              </div>
              <input
                id="slider-session-timeout"
                data-testid="slider-session-timeout"
                data-automation-id="slider-session-timeout"
                name="sessionTimeout"
                type="range"
                min="5"
                max="60"
                step="5"
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                aria-valuenow={sessionTimeoutMinutes}
                aria-valuemin={5}
                aria-valuemax={60}
                data-value={String(sessionTimeoutMinutes)}
                className="w-full accent-[#002D72] cursor-pointer"
              />
            </div>

            {/* Preferences Checkboxes */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                Notification Preferences
              </span>

              <label
                id="lbl-pref-email"
                data-testid="lbl-pref-email"
                htmlFor="checkbox-pref-email"
                className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium select-none"
              >
                <input
                  id="checkbox-pref-email"
                  data-testid="checkbox-pref-email"
                  data-automation-id="checkbox-pref-email"
                  name="emailAlerts"
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  value={emailAlerts ? 'true' : 'false'}
                  aria-checked={emailAlerts ? 'true' : 'false'}
                  data-checked={emailAlerts ? 'true' : 'false'}
                  data-state={emailAlerts ? 'checked' : 'unchecked'}
                  className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span>Email Account Activity Alerts</span>
              </label>

              <label
                id="lbl-pref-sms"
                data-testid="lbl-pref-sms"
                htmlFor="checkbox-pref-sms"
                className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium select-none"
              >
                <input
                  id="checkbox-pref-sms"
                  data-testid="checkbox-pref-sms"
                  data-automation-id="checkbox-pref-sms"
                  name="smsAlerts"
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  value={smsAlerts ? 'true' : 'false'}
                  aria-checked={smsAlerts ? 'true' : 'false'}
                  data-checked={smsAlerts ? 'true' : 'false'}
                  data-state={smsAlerts ? 'checked' : 'unchecked'}
                  className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span>Instant SMS Fraud Warnings</span>
              </label>

              <label
                id="lbl-pref-paperless"
                data-testid="lbl-pref-paperless"
                htmlFor="checkbox-pref-paperless"
                className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer font-medium select-none"
              >
                <input
                  id="checkbox-pref-paperless"
                  data-testid="checkbox-pref-paperless"
                  data-automation-id="checkbox-pref-paperless"
                  name="paperlessStatements"
                  type="checkbox"
                  checked={paperlessEnabled}
                  onChange={(e) => setPaperlessEnabled(e.target.checked)}
                  value={paperlessEnabled ? 'true' : 'false'}
                  aria-checked={paperlessEnabled ? 'true' : 'false'}
                  data-checked={paperlessEnabled ? 'true' : 'false'}
                  data-state={paperlessEnabled ? 'checked' : 'unchecked'}
                  className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span>Paperless Electronic Tax Forms (1099-INT)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
