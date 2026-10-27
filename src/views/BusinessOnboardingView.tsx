import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Fingerprint,
  Landmark,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useBank } from '../context/BankContext';
import { MockDocumentUpload } from '../components/MockDocumentUpload';

type ApplicationStatus = 'Draft' | 'Pending verification' | 'Returned' | 'Approved' | 'Rejected' | 'Account opened' | 'CBS exception';
type CaseTab = 'Applications' | 'Reports' | 'Audit trail';
type PartyRole = 'Director' | 'Partner' | 'Authorized signatory' | 'Beneficial owner';

interface UploadedDocument {
  name: string;
  category: string;
  size: string;
}

interface RelatedParty {
  name: string;
  role: PartyRole;
  ownership: string;
  biometricStatus: 'NOT_VERIFIED' | 'VERIFIED_MOCK';
  biometricReference?: string;
  identityDocuments: UploadedDocument[];
}

interface OnboardingApplication {
  reference: string;
  entityName: string;
  entityType: 'Company' | 'LLP';
  registrationNumber: string;
  product: string;
  branch: string;
  status: ApplicationStatus;
  maker: string;
  makerId: string;
  updatedAt: string;
  createdAt?: number;
  completedAt?: number;
  documents: UploadedDocument[];
  incorporationDate?: string;
  pan?: string;
  registeredAddress?: string;
  businessActivity?: string;
  customerCategory?: string;
  parties?: RelatedParty[];
  consentAt?: string;
  accountNumber?: string;
  cbsMessage?: string;
  returnReason?: string;
}

interface AuditEvent {
  reference: string;
  action: string;
  actor: string;
  time: string;
  detail: string;
}

const initialApplications: OnboardingApplication[] = [
  {
    reference: 'BOB-2026-04182', entityName: 'Northstar Renewables Private Limited', entityType: 'Company',
    registrationNumber: 'U40106MH2021PTC367821', product: 'Business Current Account', branch: 'Alibag, Mumbai',
    status: 'Pending verification', maker: 'Priya Nair', makerId: 'employee-104', updatedAt: '27 Oct 2026, 10:42', createdAt: Date.parse('2026-10-27T08:15:00+05:30'),
    documents: [{ name: 'Certificate of incorporation.pdf', category: 'Incorporation certificate', size: '1.8 MB' }, { name: 'Board resolution.pdf', category: 'Board resolution', size: '940 KB' }],
  },
  {
    reference: 'BOB-2026-04179', entityName: 'Cedar & Finch Logistics LLP', entityType: 'LLP',
    registrationNumber: 'AAY-4281', product: 'Business Current Account', branch: 'Bengaluru MG Road',
    status: 'Returned', maker: 'Arjun Mehta', makerId: 'employee-103', updatedAt: '27 Oct 2026, 09:16', createdAt: Date.parse('2026-10-26T15:10:00+05:30'),
    documents: [{ name: 'LLP agreement.pdf', category: 'LLP agreement', size: '2.1 MB' }], returnReason: 'Upload a current address proof for the registered office.',
  },
  {
    reference: 'BOB-2026-04161', entityName: 'Meridian Health Systems Limited', entityType: 'Company',
    registrationNumber: 'U85110KA2018PLC110482', product: 'Business Current Account', branch: 'Bengaluru MG Road',
    status: 'CBS exception', maker: 'Priya Nair', makerId: 'employee-104', updatedAt: '26 Oct 2026, 16:28', createdAt: Date.parse('2026-10-26T11:10:00+05:30'),
    documents: [{ name: 'Incorporation-certificate.pdf', category: 'Incorporation certificate', size: '1.2 MB' }], cbsMessage: 'CBS customer master timed out. Retry is available.',
  },
  {
    reference: 'BOB-2026-04128', entityName: 'Asterline Components LLP', entityType: 'LLP',
    registrationNumber: 'AAY-3917', product: 'Business Current Account', branch: 'Viman Nagar, Pune',
    status: 'Account opened', maker: 'Arjun Mehta', makerId: 'employee-103', updatedAt: '26 Oct 2026, 13:04', createdAt: Date.parse('2026-10-26T09:20:00+05:30'), completedAt: Date.parse('2026-10-26T13:04:00+05:30'), accountNumber: '620104007318',
    documents: [{ name: 'Asterline-LLP-agreement.pdf', category: 'LLP agreement', size: '1.6 MB' }],
  },
];

const initialAuditEvents: AuditEvent[] = [
  { reference: 'BOB-2026-04182', action: 'Submitted for verification', actor: 'Priya Nair', time: '27 Oct 2026, 10:42', detail: 'Application submitted with 2 documents.' },
  { reference: 'BOB-2026-04179', action: 'Returned to maker', actor: 'Sanjay G', time: '27 Oct 2026, 09:16', detail: 'Registered office address proof required.' },
  { reference: 'BOB-2026-04161', action: 'CBS account creation exception', actor: 'System', time: '26 Oct 2026, 16:28', detail: 'CBS customer master timed out.' },
  { reference: 'BOB-2026-04128', action: 'Account opened', actor: 'System', time: '26 Oct 2026, 13:04', detail: 'CBS account 620104007318 created.' },
];

const steps = ['Entity details', 'People & ownership', 'Documents & consent', 'Review & submit'];
const statusStyles: Record<ApplicationStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  'Pending verification': 'bg-amber-50 text-amber-800 border-amber-200',
  Returned: 'bg-orange-50 text-orange-800 border-orange-200',
  Approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-800 border-rose-200',
  'Account opened': 'bg-teal-50 text-teal-800 border-teal-200',
  'CBS exception': 'bg-red-50 text-red-800 border-red-200',
};

const newReference = () => `BOB-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

export const BusinessOnboardingView: React.FC = () => {
  const { currentUser, addToast } = useBank();
  const canAccess = ['ADMIN', 'LOAN_OFFICER'].includes(currentUser.role);
  const canReview = ['ADMIN', 'LOAN_OFFICER'].includes(currentUser.role);
  const [applications, setApplications] = useState(initialApplications);
  const [events, setEvents] = useState(initialAuditEvents);
  const [tab, setTab] = useState<CaseTab>('Applications');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingReference, setEditingReference] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState(newReference);
  const [entityType, setEntityType] = useState<'Company' | 'LLP'>('Company');
  const [legalName, setLegalName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [incorporationDate, setIncorporationDate] = useState('');
  const [pan, setPan] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [businessActivity, setBusinessActivity] = useState('');
  const [customerCategory, setCustomerCategory] = useState<'New to bank' | 'Existing customer'>('New to bank');
  const [product, setProduct] = useState('Business Current Account');
  const [branch, setBranch] = useState('Alibag, Mumbai');
  const [parties, setParties] = useState<RelatedParty[]>([{ name: '', role: 'Director', ownership: '', biometricStatus: 'NOT_VERIFIED', identityDocuments: [] }]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [consent, setConsent] = useState(false);
  const [checksRun, setChecksRun] = useState(false);
  const [checksPassed, setChecksPassed] = useState(false);

  const selectedApplication = applications.find((application) => application.reference === selectedReference) || null;
  const filteredApplications = useMemo(() => applications.filter((application) => {
    const matchesSearch = `${application.reference} ${application.entityName} ${application.registrationNumber}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (statusFilter === 'All statuses' || application.status === statusFilter);
  }), [applications, search, statusFilter]);
  const completedApplications = applications.filter((application) => application.completedAt && application.createdAt);
  const averageTurnaroundHours = completedApplications.length
    ? completedApplications.reduce((total, application) => total + ((application.completedAt || 0) - (application.createdAt || 0)), 0) / completedApplications.length / 3600000
    : null;
  const oldestPendingHours = applications
    .filter((application) => ['Pending verification', 'CBS exception'].includes(application.status) && application.createdAt)
    .reduce((oldest, application) => Math.max(oldest, (Date.now() - (application.createdAt || Date.now())) / 3600000), 0);

  const addEvent = (applicationReference: string, action: string, detail: string) => {
    setEvents((current) => [{
      reference: applicationReference,
      action,
      actor: currentUser.name,
      time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      detail,
    }, ...current]);
  };

  const resetForm = () => {
    setStep(0);
    setEditingReference(null);
    setReference(newReference());
    setEntityType('Company');
    setLegalName('');
    setRegistrationNumber('');
    setIncorporationDate('');
    setPan('');
    setRegisteredAddress('');
    setBusinessActivity('');
    setCustomerCategory('New to bank');
    setProduct('Business Current Account');
    setBranch('Alibag, Mumbai');
    setParties([{ name: '', role: 'Director', ownership: '', biometricStatus: 'NOT_VERIFIED', identityDocuments: [] }]);
    setDocuments([]);
    setConsent(false);
    setChecksRun(false);
    setChecksPassed(false);
  };

  const createDraft = () => {
    const application: OnboardingApplication = {
      reference, entityName: legalName.trim() || 'Untitled business application', entityType, registrationNumber,
      product, branch, status: 'Draft', maker: currentUser.name, makerId: currentUser.id,
      updatedAt: new Date().toLocaleString('en-IN'), createdAt: Date.now(), documents, incorporationDate, pan, registeredAddress,
      businessActivity, customerCategory, parties, consentAt: consent ? new Date().toISOString() : undefined,
    };
    setApplications((current) => [application, ...current]);
    addEvent(reference, 'Draft saved', 'Application saved for later completion.');
    setSelectedReference(reference);
    setCreating(false);
    addToast({ type: 'success', title: 'Draft saved', message: `${reference} is available in the application queue.` });
  };

  const runValidation = () => {
    const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());
    const registrationDuplicate = applications.some((application) => application.reference !== editingReference && application.registrationNumber.toLowerCase() === registrationNumber.trim().toLowerCase());
    const partiesValid = parties.length > 0 && parties.every((party) => party.name.trim() && party.biometricStatus === 'VERIFIED_MOCK' && party.identityDocuments.length > 0);
    const pass = Boolean(legalName.trim() && registrationNumber.trim() && registeredAddress.trim() && businessActivity.trim() && panValid && !registrationDuplicate && partiesValid && documents.length > 0 && consent);
    setChecksRun(true);
    setChecksPassed(pass);
    addEvent(reference, pass ? 'Validation checks passed' : 'Validation checks failed', pass ? 'Required fields, duplicate search, documents and consent passed demo checks.' : 'One or more required fields, duplicate search, documents or consent need attention.');
    if (registrationDuplicate) {
      addToast({ type: 'warning', title: 'Possible duplicate', message: 'A customer record with this registration number already exists in the demo queue.' });
    } else if (pass) {
      addToast({ type: 'success', title: 'Validations complete', message: 'Required fields and demo compliance checks passed.' });
    } else {
      addToast({ type: 'warning', title: 'Validation needs attention', message: 'Complete required fields, add a document and capture consent before submitting.' });
    }
  };

  const submitApplication = () => {
    const application: OnboardingApplication = {
      reference, entityName: legalName.trim(), entityType, registrationNumber: registrationNumber.trim(),
      product, branch, status: 'Pending verification', maker: currentUser.name, makerId: currentUser.id,
      updatedAt: new Date().toLocaleString('en-IN'), createdAt: editingReference ? applications.find((item) => item.reference === editingReference)?.createdAt || Date.now() : Date.now(), documents, incorporationDate, pan: pan.trim().toUpperCase(),
      registeredAddress, businessActivity, customerCategory, parties, consentAt: new Date().toISOString(),
    };
    if (editingReference) {
      setApplications((current) => current.map((item) => item.reference === editingReference ? { ...application, maker: item.maker, makerId: item.makerId } : item));
      addEvent(reference, 'Corrected and resubmitted', `${documents.length} document(s) attached; customer consent retained.`);
    } else {
      setApplications((current) => [application, ...current]);
      addEvent(reference, 'Submitted for verification', `${documents.length} document(s) attached; customer consent recorded.`);
    }
    setSelectedReference(reference);
    setCreating(false);
    setEditingReference(null);
    setTab('Applications');
    addToast({ type: 'success', title: editingReference ? 'Application resubmitted' : 'Application submitted', message: `${reference} is now pending independent verification.` });
  };

  const updateApplication = (applicationReference: string, patch: Partial<OnboardingApplication>, action: string, detail: string) => {
    setApplications((current) => current.map((application) => application.reference === applicationReference
      ? { ...application, ...patch, updatedAt: new Date().toLocaleString('en-IN') }
      : application));
    addEvent(applicationReference, action, detail);
  };

  const approveApplication = (application: OnboardingApplication) => {
    if (application.makerId === currentUser.id) {
      addToast({ type: 'error', title: 'Maker-checker control', message: 'You cannot approve an application you created.' });
      return;
    }
    const accountNumber = `62${String(Date.now()).slice(-10)}`;
    updateApplication(application.reference, { status: 'Account opened', accountNumber, completedAt: Date.now(), cbsMessage: 'Customer and account records created.' }, 'Approved and account opened', `CBS demo response: account ${accountNumber} created.`);
    addToast({ type: 'success', title: 'Account opened', message: `Demo account ${accountNumber} created for ${application.entityName}.` });
  };

  const startCorrection = (application: OnboardingApplication) => {
    setReference(application.reference);
    setEditingReference(application.reference);
    setEntityType(application.entityType);
    setLegalName(application.entityName);
    setRegistrationNumber(application.registrationNumber);
    setIncorporationDate(application.incorporationDate || '');
    setPan(application.pan || '');
    setRegisteredAddress(application.registeredAddress || '');
    setBusinessActivity(application.businessActivity || '');
    setCustomerCategory((application.customerCategory as 'New to bank' | 'Existing customer') || 'New to bank');
    setProduct(application.product);
    setBranch(application.branch);
    setParties(application.parties?.length ? application.parties : [{ name: '', role: 'Director', ownership: '', biometricStatus: 'NOT_VERIFIED', identityDocuments: [] }]);
    setDocuments(application.documents);
    setConsent(Boolean(application.consentAt));
    setStep(3);
    setChecksRun(false);
    setChecksPassed(false);
    setCreating(true);
    setSelectedReference(null);
  };

  const handleUpload = (files: File[]) => {
    const added = files.map((file): UploadedDocument => ({
      name: file.name,
      category: file.name.toLowerCase().includes('pan') ? 'PAN' : file.name.toLowerCase().includes('address') ? 'Address proof' : 'Supporting document',
      size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setDocuments((current) => [...current, ...added]);
  };

  const handlePartyDocuments = (index: number, files: File[]) => {
    const added = files.map((file): UploadedDocument => ({
      name: file.name,
      category: 'Person identity evidence',
      size: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setParties((current) => current.map((party, partyIndex) => partyIndex === index
      ? { ...party, identityDocuments: [...party.identityDocuments, ...added] }
      : party));
  };

  const runMockBiometricCheck = (index: number) => {
    const party = parties[index];
    if (!party.name.trim()) {
      addToast({ type: 'warning', title: 'Name required', message: 'Enter the person’s legal name before running mock biometric verification.' });
      return;
    }
    const biometricReference = `BIO-DEMO-${String(Date.now()).slice(-6)}`;
    setParties((current) => current.map((person, partyIndex) => partyIndex === index
      ? { ...person, biometricStatus: 'VERIFIED_MOCK', biometricReference }
      : person));
    addEvent(reference, 'Mock biometric verification', `${party.name} marked as mock verified (${biometricReference}).`);
    addToast({ type: 'success', title: 'Mock biometric check complete', message: `${party.name} is marked verified for demonstration only.` });
  };

  const exportReport = () => {
    const headers = ['Reference', 'Entity', 'Entity type', 'Registration number', 'Product', 'Branch', 'Status', 'Maker', 'Created', 'Updated', 'Account number', 'Exception'];
    const rows = applications.map((application) => [
      application.reference, application.entityName, application.entityType, application.registrationNumber,
      application.product, application.branch, application.status, application.maker,
      application.createdAt ? new Date(application.createdAt).toISOString() : '', application.updatedAt,
      application.accountNumber || '', application.cbsMessage || application.returnReason || '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-account-onboarding-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', title: 'Report exported', message: `${applications.length} application records exported.` });
  };

  if (!canAccess) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm" data-testid="business-onboarding-access-denied">
        <ShieldCheck className="mx-auto h-9 w-9 text-slate-400" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Staff access required</h1>
        <p className="mt-2 text-sm text-slate-600">Business onboarding is available to bank operations, support and review roles. Switch to a staff demo persona to preview this workspace.</p>
      </section>
    );
  }

  return (
    <div className="business-onboarding-theme mx-auto max-w-7xl space-y-5" data-testid="business-onboarding-view">
      <header id="business-onboarding-hero" className="flex flex-wrap items-center justify-between gap-5 px-5 py-5 text-white sm:px-7 sm:py-6">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-100"><BriefcaseBusiness className="h-4 w-4" /> Business banking operations</div>
          <h1 className="text-2xl font-semibold text-white sm:text-[1.8rem]">Business account opening</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-blue-100">Limited liability entities · Application intake, verification and account creation</p>
        </div>
        <button onClick={() => { resetForm(); setCreating(true); setSelectedReference(null); }} className="relative z-10 inline-flex items-center gap-2 border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20"><Plus className="h-4 w-4" /> New application</button>
      </header>

      <div className="flex items-start gap-3 border border-teal-200 bg-teal-50/80 px-4 py-3 text-xs leading-relaxed text-teal-950"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Demonstration environment.</strong> Identity, sanctions and AML checks, authentication, audit storage and CBS account creation are simulated in this browser preview. No bank systems are connected.</p></div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'In verification', value: applications.filter((application) => application.status === 'Pending verification').length, icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
          { label: 'Returned to maker', value: applications.filter((application) => application.status === 'Returned').length, icon: RotateCw, tone: 'text-orange-700 bg-orange-50' },
          { label: 'Accounts opened', value: applications.filter((application) => application.status === 'Account opened').length, icon: Landmark, tone: 'text-teal-800 bg-teal-50' },
          { label: 'CBS exceptions', value: applications.filter((application) => application.status === 'CBS exception').length, icon: AlertCircle, tone: 'text-rose-700 bg-rose-50' },
        ].map((metric) => <div key={metric.label} className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3 shadow-sm"><div><p className="text-xs text-slate-500">{metric.label}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{metric.value}</p></div><span className={`grid h-9 w-9 place-items-center ${metric.tone}`}><metric.icon className="h-4 w-4" /></span></div>)}
      </div>

      <div className="border-b border-slate-200"><nav className="flex gap-6" aria-label="Business onboarding views">{(['Applications', 'Reports', 'Audit trail'] as CaseTab[]).map((item) => <button key={item} onClick={() => { setTab(item); setSelectedReference(null); }} className={`border-b-2 px-0.5 pb-3 text-sm font-medium ${tab === item ? 'border-teal-700 text-teal-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`} aria-current={tab === item ? 'page' : undefined}>{item}</button>)}</nav></div>

      {creating ? (
        <section className="border border-slate-200 bg-white shadow-sm" data-testid="business-application-wizard">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><div className="flex items-center gap-3"><button aria-label="Close application" onClick={() => setCreating(false)} className="grid h-8 w-8 place-items-center border border-slate-200 text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button><div><h2 className="text-sm font-semibold text-slate-950">{editingReference ? 'Correct application' : 'New business application'}</h2><p className="mt-0.5 font-mono text-xs text-slate-500">{reference}</p></div></div><span className="text-xs text-slate-500">Drafts stay in this browser session</span></div>
          <div className="grid md:grid-cols-[220px_1fr]">
            <ol className="space-y-1 border-b border-slate-200 bg-slate-50 p-4 md:border-b-0 md:border-r">{steps.map((label, index) => <li key={label}><button onClick={() => index < step && setStep(index)} disabled={index > step} className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs ${step === index ? 'bg-white font-semibold text-teal-900 shadow-sm' : index < step ? 'text-slate-700' : 'text-slate-400'}`}><span className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] ${step === index ? 'border-teal-700 bg-teal-700 text-white' : index < step ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-300'}`}>{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>{label}</button></li>)}</ol>
            <div className="min-w-0 p-5 sm:p-7">
              {step === 0 && <div className="max-w-3xl space-y-5"><div><h3 className="text-lg font-semibold text-slate-950">Entity and product</h3><p className="mt-1 text-sm text-slate-500">Enter registration details as shown on the entity's official records.</p></div><div className="grid gap-4 sm:grid-cols-2">
                <Field label="Entity type"><select value={entityType} onChange={(event) => setEntityType(event.target.value as 'Company' | 'LLP')}><option>Company</option><option>LLP</option></select></Field>
                <Field label="Customer category"><select value={customerCategory} onChange={(event) => setCustomerCategory(event.target.value as 'New to bank' | 'Existing customer')}><option>New to bank</option><option>Existing customer</option></select></Field>
                <Field label="Legal entity name" required><input value={legalName} onChange={(event) => setLegalName(event.target.value)} placeholder="As registered with the authority" /></Field>
                <Field label={entityType === 'Company' ? 'Company registration number' : 'LLP identification number'} required><input value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} placeholder="Registration / LLPIN" /></Field>
                <Field label="Date of incorporation"><input type="date" value={incorporationDate} onChange={(event) => setIncorporationDate(event.target.value)} /></Field>
                <Field label="Entity PAN" required><input value={pan} onChange={(event) => setPan(event.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} /></Field>
                <Field label="Registered office address" required><input value={registeredAddress} onChange={(event) => setRegisteredAddress(event.target.value)} placeholder="Address, city, state and PIN" /></Field>
                <Field label="Business activity" required><input value={businessActivity} onChange={(event) => setBusinessActivity(event.target.value)} placeholder="Primary activity / industry" /></Field>
                <Field label="Account product"><select value={product} onChange={(event) => setProduct(event.target.value)}><option>Business Current Account</option><option>Business Current Account Plus</option></select></Field>
                <Field label="Servicing branch"><select value={branch} onChange={(event) => setBranch(event.target.value)}><option>Alibag, Mumbai</option><option>Bengaluru MG Road</option><option>Viman nagar,Pune</option><option>Delhi Connaught Place</option></select></Field>
              </div>{customerCategory === 'Existing customer' && <div className="flex gap-2 border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs text-sky-950"><Search className="h-4 w-4 shrink-0" />Customer search will use the registration number during validation. No CBS lookup is connected in this preview.</div>}</div>}

              {step === 1 && (
                <div className="max-w-3xl space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">People and beneficial ownership</h3>
                      <p className="mt-1 text-sm text-slate-500">Record directors, partners, signatories and beneficial owners.</p>
                    </div>
                    <button onClick={() => setParties((current) => [...current, { name: '', role: 'Beneficial owner', ownership: '', biometricStatus: 'NOT_VERIFIED', identityDocuments: [] }])} className="inline-flex items-center gap-1.5 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Plus className="h-3.5 w-3.5" /> Add person
                    </button>
                  </div>
                  <div className="space-y-3">
                    {parties.map((party, index) => (
                      <div key={index} className="border border-slate-200 p-4">
                        <div className="related-party-row grid gap-3 sm:grid-cols-[1.3fr_1fr_0.7fr_auto] sm:items-end">
                          <Field label="Full legal name"><input value={party.name} onChange={(event) => setParties((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} placeholder="Name as on identity document" /></Field>
                          <Field label="Relationship"><select value={party.role} onChange={(event) => setParties((current) => current.map((item, i) => i === index ? { ...item, role: event.target.value as PartyRole } : item))}><option>Director</option><option>Partner</option><option>Authorized signatory</option><option>Beneficial owner</option></select></Field>
                          <Field label="Ownership %"><input type="number" min="0" max="100" value={party.ownership} onChange={(event) => setParties((current) => current.map((item, i) => i === index ? { ...item, ownership: event.target.value } : item))} placeholder="Optional" /></Field>
                          <button disabled={parties.length === 1} aria-label={`Remove person ${index + 1}`} onClick={() => setParties((current) => current.filter((_, i) => i !== index))} className="mb-0.5 grid h-9 w-9 place-items-center text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-slate-800">Biometric identity check</p>
                                <p className="mt-0.5 text-[10px] text-slate-500">Demo only. No camera or biometric data is accessed.</p>
                              </div>
                              <button type="button" disabled={!party.name.trim()} onClick={() => runMockBiometricCheck(index)} className="border border-slate-300 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
                                {party.biometricStatus === 'VERIFIED_MOCK' ? 'Run again' : 'Run mock check'}
                              </button>
                            </div>
                            <div className={`flex items-center justify-between gap-2 px-3 py-2 text-[10px] ${party.biometricStatus === 'VERIFIED_MOCK' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
                              <span>{party.biometricStatus === 'VERIFIED_MOCK' ? 'Mock verified' : 'Not verified'}</span>
                              {party.biometricReference && <span className="font-mono">{party.biometricReference}</span>}
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-semibold text-slate-800">Identity verification evidence</p>
                            <MockDocumentUpload inputId={`business-party-${index}-identity-upload`} prompt="Choose identity files or scan" detail="PDF, JPG or PNG · multiple files accepted" onFilesAdded={(files) => handlePartyDocuments(index, files)} />
                            {party.identityDocuments.length > 0 && <ul className="mt-2 space-y-1">{party.identityDocuments.map((document, documentIndex) => <li key={`${document.name}-${documentIndex}`} className="flex items-center gap-2 text-[10px] text-slate-600"><FileText className="h-3.5 w-3.5 shrink-0 text-teal-700" /><span className="min-w-0 truncate">{document.name}</span><span className="ml-auto shrink-0">{document.size}</span></li>)}</ul>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-600"><Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-teal-800" />Complete the bank-approved identity verification steps for every related person. The biometric action here only records a mock result.</div>
                </div>
              )}

              {step === 2 && (
                <div className="max-w-3xl space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">Documents and consent</h3>
                    <p className="mt-1 text-sm text-slate-500">Attach readable supporting records and capture the customer authorization.</p>
                  </div>
                  <MockDocumentUpload inputId="business-entity-document-upload" prompt="Choose files to upload or scan from device" detail="PDF, JPG or PNG · multiple documents accepted" onFilesAdded={handleUpload} />
                  {documents.length > 0 ? <div className="divide-y divide-slate-200 border border-slate-200">{documents.map((document, index) => <div key={`${document.name}-${index}`} className="flex items-center gap-3 px-4 py-3"><FileText className="h-4 w-4 shrink-0 text-teal-800" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{document.name}</p><p className="text-[11px] text-slate-500">{document.category} · {document.size}</p></div><button aria-label={`Remove ${document.name}`} onClick={() => setDocuments((current) => current.filter((_, i) => i !== index))} className="grid h-8 w-8 place-items-center text-slate-500 hover:text-rose-700"><X className="h-4 w-4" /></button></div>)}</div> : <p className="text-xs text-slate-500">No documents attached yet.</p>}
                  <label className="flex items-start gap-3 border border-slate-200 px-4 py-4"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4" /><span className="text-xs leading-relaxed text-slate-700">I confirm that the authorized signatory has reviewed the application, provided the declarations and consents required for account opening, and authorized the bank to conduct prescribed verification and screening. <strong>Consent evidence is captured for this demo at submission time.</strong></span></label>
                </div>
              )}

              {step === 3 && <div className="max-w-3xl space-y-5"><div><h3 className="text-lg font-semibold text-slate-950">Review and validation</h3><p className="mt-1 text-sm text-slate-500">Run required-field, duplicate and document checks before submitting for independent review.</p></div><div className="grid gap-3 sm:grid-cols-2"><Summary label="Entity" value={legalName || 'Not provided'} /><Summary label="Registration" value={registrationNumber || 'Not provided'} /><Summary label="PAN / incorporation" value={`${pan || 'Not provided'} · ${incorporationDate || 'Date not provided'}`} /><Summary label="Product / branch" value={`${product} · ${branch}`} /><Summary label="Registered office" value={registeredAddress || 'Not provided'} /><Summary label="Business activity" value={businessActivity || 'Not provided'} /><Summary label="People / documents" value={`${parties.filter((party) => party.name.trim()).length} person(s) · ${documents.length} document(s)`} /></div><div className="space-y-2 border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><div><h4 className="text-sm font-semibold text-slate-900">Validation checklist</h4><p className="mt-1 text-xs text-slate-500">Demo-only checks; production requires bank-approved integrations.</p></div><button onClick={runValidation} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ClipboardCheck className="h-4 w-4" /> Run checks</button></div>{checksRun && <div className="mt-3 space-y-2">{[
                ['Mandatory entity details', Boolean(legalName.trim() && registrationNumber.trim() && registeredAddress.trim() && businessActivity.trim())],
                ['Related-party names', parties.length > 0 && parties.every((party) => party.name.trim())],
                ['Mock biometric checks', parties.length > 0 && parties.every((party) => party.biometricStatus === 'VERIFIED_MOCK')],
                ['Person identity evidence', parties.length > 0 && parties.every((party) => party.identityDocuments.length > 0)],
                ['PAN format', /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())],
                ['Duplicate customer search', !applications.some((application) => application.registrationNumber.toLowerCase() === registrationNumber.trim().toLowerCase())],
                ['Document completeness', documents.length > 0], ['Customer consent', consent], ['KYC, AML, sanctions and PEP screening', true],
              ].map(([label, passed]) => <div key={String(label)} className="flex items-center gap-2 text-xs"><span className={passed ? 'text-emerald-700' : 'text-rose-700'}>{passed ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}</span><span className="text-slate-700">{label}</span><span className={`ml-auto font-semibold ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>{passed ? 'Passed' : 'Action required'}</span></div>)}</div>}</div><div className="flex items-start gap-2 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-950"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Submitting routes this application to a different authorized checker. The maker cannot approve their own submission.</div></div>}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4"><button onClick={() => step === 0 ? createDraft() : setStep((current) => Math.max(0, current - 1))} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">{step === 0 ? <FileText className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}{step === 0 ? 'Save draft' : 'Back'}</button>{step < 3 ? <button onClick={() => setStep((current) => current + 1)} className="inline-flex items-center gap-2 bg-[#126b68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0f5956]">Continue <ArrowRight className="h-4 w-4" /></button> : editingReference ? <div className="flex gap-2"><button onClick={runValidation} className="border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Run checks</button><button disabled={!checksPassed} onClick={submitApplication} className="inline-flex items-center gap-2 bg-[#126b68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0f5956] disabled:cursor-not-allowed disabled:bg-slate-300">Resubmit <ChevronRight className="h-4 w-4" /></button></div> : <button disabled={!checksPassed} onClick={submitApplication} className="inline-flex items-center gap-2 bg-[#126b68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0f5956] disabled:cursor-not-allowed disabled:bg-slate-300">Submit application <ChevronRight className="h-4 w-4" /></button>}</div>
            </div>
          </div>
        </section>
      ) : tab === 'Applications' ? (
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 p-4 sm:items-center"><div><h2 className="text-sm font-semibold text-slate-950">Application queue</h2><p className="mt-1 text-xs text-slate-500">{filteredApplications.length} records · Select an application to review</p></div><div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto"><label className="relative min-w-0 sm:w-52"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" /><input aria-label="Search applications" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or reference" className="h-9 w-full border border-slate-300 pl-8 pr-2 text-xs" /></label><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 w-full border border-slate-300 px-2 text-xs sm:w-auto"><option>All statuses</option>{(['Pending verification', 'Returned', 'Approved', 'Rejected', 'Account opened', 'CBS exception', 'Draft'] as ApplicationStatus[]).map((status) => <option key={status}>{status}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[690px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3 font-semibold">Entity / reference</th><th className="px-4 py-3 font-semibold">Product / branch</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Last updated</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{filteredApplications.map((application) => <tr key={application.reference} onClick={() => setSelectedReference(application.reference)} className={`cursor-pointer hover:bg-teal-50/40 ${selectedReference === application.reference ? 'bg-teal-50/60' : ''}`}><td className="px-4 py-3"><p className="max-w-[260px] truncate text-xs font-semibold text-slate-900">{application.entityName}</p><p className="mt-1 font-mono text-[10px] text-slate-500">{application.reference} · {application.entityType}</p></td><td className="px-4 py-3"><p className="text-xs text-slate-700">{application.product}</p><p className="mt-1 text-[10px] text-slate-500">{application.branch}</p></td><td className="px-4 py-3"><span className={`inline-flex border px-2 py-1 text-[10px] font-semibold ${statusStyles[application.status]}`}>{application.status}</span></td><td className="px-4 py-3 text-[11px] text-slate-600">{application.updatedAt}</td><td className="px-4 py-3"><ChevronRight className="h-4 w-4 text-slate-400" /></td></tr>)}</tbody></table></div>{filteredApplications.length === 0 && <div className="px-4 py-12 text-center text-sm text-slate-500">No applications match these filters.</div>}</section>

          <aside className="border border-slate-200 bg-white shadow-sm">{selectedApplication ? <><div className="border-b border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] text-slate-500">{selectedApplication.reference}</p><h2 className="mt-1 text-base font-semibold leading-snug text-slate-950">{selectedApplication.entityName}</h2></div><button aria-label="Close application details" onClick={() => setSelectedReference(null)} className="grid h-8 w-8 shrink-0 place-items-center text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><span className={`mt-3 inline-flex border px-2 py-1 text-[10px] font-semibold ${statusStyles[selectedApplication.status]}`}>{selectedApplication.status}</span></div><div className="space-y-4 p-4"><div className="grid grid-cols-2 gap-3"><Summary label="Entity type" value={selectedApplication.entityType} /><Summary label="Registration" value={selectedApplication.registrationNumber || 'Not provided'} /><Summary label="Product" value={selectedApplication.product} /><Summary label="Branch" value={selectedApplication.branch} /><Summary label="PAN / incorporation" value={`${selectedApplication.pan || 'Not provided'} · ${selectedApplication.incorporationDate || 'N/A'}`} /><Summary label="Customer category" value={selectedApplication.customerCategory || 'Not provided'} /></div><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Submitted by</p><p className="text-xs text-slate-800">{selectedApplication.maker}</p></div>{selectedApplication.parties?.length ? <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Related parties</p><ul className="space-y-1">{selectedApplication.parties.map((party, index) => <li key={index} className="text-xs text-slate-700">{party.name || 'Unnamed'} · {party.role}{party.ownership ? ` · ${party.ownership}%` : ''}</li>)}</ul></div> : null}<div><div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Documents</p><span className="text-[10px] text-slate-500">{selectedApplication.documents.length}</span></div>{selectedApplication.documents.length ? <ul className="space-y-2">{selectedApplication.documents.map((document, index) => <li key={`${document.name}-${index}`} className="flex items-center gap-2 text-xs text-slate-700"><FileCheck2 className="h-4 w-4 shrink-0 text-teal-700" /><span className="min-w-0 truncate">{document.name}</span></li>)}</ul> : <p className="text-xs text-slate-500">No documents attached.</p>}</div>{selectedApplication.returnReason && <div className="border-l-2 border-orange-500 bg-orange-50 px-3 py-2 text-xs text-orange-950"><strong>Returned:</strong> {selectedApplication.returnReason}</div>}{selectedApplication.cbsMessage && <div className="border-l-2 border-rose-500 bg-rose-50 px-3 py-2 text-xs text-rose-950">{selectedApplication.cbsMessage}</div>}{selectedApplication.accountNumber && <div className="border border-emerald-200 bg-emerald-50 p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">CBS account number</p><p className="mt-1 font-mono text-lg font-semibold text-emerald-950">{selectedApplication.accountNumber}</p></div>}
            {['Returned', 'Draft'].includes(selectedApplication.status) && selectedApplication.makerId === currentUser.id && <button onClick={() => startCorrection(selectedApplication)} className="w-full border border-teal-700 px-3 py-2.5 text-xs font-semibold text-teal-800 hover:bg-teal-50">{selectedApplication.status === 'Draft' ? 'Continue draft' : 'Correct and resubmit'}</button>}
            {canReview && selectedApplication.status === 'Pending verification' && <div className="space-y-2 border-t border-slate-200 pt-4"><p className="text-xs font-semibold text-slate-800">Checker decision</p>{selectedApplication.makerId === currentUser.id ? <p className="flex gap-2 text-xs leading-relaxed text-rose-800"><CircleAlert className="h-4 w-4 shrink-0" />You created this application and cannot approve it.</p> : <><button onClick={() => approveApplication(selectedApplication)} className="flex w-full items-center justify-center gap-2 bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-800"><CheckCircle2 className="h-4 w-4" /> Approve & create CBS account</button><button onClick={() => { const reason = 'Additional verification or document required.'; updateApplication(selectedApplication.reference, { status: 'Returned', returnReason: reason }, 'Returned to maker', reason); addToast({ type: 'info', title: 'Returned to maker', message: 'The application can be corrected and resubmitted.' }); }} className="w-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Return for correction</button><button onClick={() => { updateApplication(selectedApplication.reference, { status: 'Rejected' }, 'Application rejected', 'Checker rejected the application.'); addToast({ type: 'warning', title: 'Application rejected', message: `${selectedApplication.reference} marked rejected.` }); }} className="w-full px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Reject application</button></>}</div>}
            {canReview && selectedApplication.status === 'CBS exception' && <button onClick={() => { const accountNumber = `62${String(Date.now()).slice(-10)}`; updateApplication(selectedApplication.reference, { status: 'Account opened', accountNumber, completedAt: Date.now(), cbsMessage: 'CBS retry succeeded.' }, 'CBS retry succeeded', `CBS demo response: account ${accountNumber} created after retry.`); addToast({ type: 'success', title: 'CBS retry succeeded', message: `Demo account ${accountNumber} created.` }); }} className="flex w-full items-center justify-center gap-2 border border-teal-700 px-3 py-2.5 text-xs font-semibold text-teal-800 hover:bg-teal-50"><RotateCw className="h-4 w-4" /> Retry CBS creation</button>}</div></> : <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><FileText className="h-8 w-8 text-slate-300" /><h2 className="mt-3 text-sm font-semibold text-slate-800">Application details</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Select a case in the queue to review its information, documents and available actions.</p></div>}</aside>
        </div>
      ) : tab === 'Reports' ? (
        <section className="border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4"><div><h2 className="text-sm font-semibold text-slate-950">Management information</h2><p className="mt-1 text-xs text-slate-500">Application volume, pending cases, outcomes and exception tracking.</p></div><button onClick={exportReport} className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> Export CSV</button></div><div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">{(['Pending verification', 'Returned', 'Rejected', 'CBS exception', 'Account opened', 'Draft'] as ApplicationStatus[]).map((status) => <div key={status} className="border border-slate-200 p-4"><p className="text-xs text-slate-500">{status}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-slate-950">{applications.filter((application) => application.status === status).length}</p><p className="mt-2 text-[10px] text-slate-500">{applications.length ? `${Math.round(applications.filter((application) => application.status === status).length / applications.length * 100)}% of current queue` : '0% of current queue'}</p></div>)}</div><div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-3"><div><p className="text-xs text-slate-500">Total application volume</p><p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">{applications.length}</p></div><div><p className="text-xs text-slate-500">Average completed turnaround</p><p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">{averageTurnaroundHours === null ? 'No completed cases' : `${averageTurnaroundHours.toFixed(1)} hours`}</p></div><div><p className="text-xs text-slate-500">Oldest pending / exception</p><p className="mt-1 text-lg font-semibold tabular-nums text-slate-950">{oldestPendingHours ? `${oldestPendingHours.toFixed(1)} hours` : 'None'}</p></div></div><p className="px-4 pb-4 text-[10px] text-slate-500">Report data is held in this browser session; production reporting requires a connected reporting store.</p></section>
      ) : (
        <section className="border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-4"><h2 className="text-sm font-semibold text-slate-950">Application audit trail</h2><p className="mt-1 text-xs text-slate-500">User actions, decisions and simulated integration outcomes in this browser session.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Application</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Detail</th></tr></thead><tbody className="divide-y divide-slate-100">{events.map((event, index) => <tr key={`${event.reference}-${index}`}><td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{event.time}</td><td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-slate-700">{event.reference}</td><td className="px-4 py-3 text-xs font-semibold text-slate-800">{event.action}</td><td className="px-4 py-3 text-xs text-slate-600">{event.actor}</td><td className="px-4 py-3 text-xs text-slate-600">{event.detail}</td></tr>)}</tbody></table></div></section>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <label className="block min-w-0 text-xs font-semibold text-slate-700">{label}{required && <span className="ml-1 text-rose-700">*</span>}<div className="mt-1.5 font-normal">{children}</div></label>
);

const Summary: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0 border border-slate-200 px-3 py-2.5"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 break-words text-xs font-medium text-slate-900">{value}</p></div>
);