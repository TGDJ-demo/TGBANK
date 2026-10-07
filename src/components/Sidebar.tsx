import React from 'react';
import { useBank } from '../context/BankContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Send,
  Receipt,
  Landmark,
  CreditCard,
  TrendingUp,
  UserCheck,
  HelpCircle,
  ShieldAlert,
  Code,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeView?: string;
  setActiveView?: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeView: propActiveView, setActiveView: propSetActiveView }) => {
  const { currentUser, featureFlags, activeView: contextActiveView, setActiveView: contextSetActiveView, logout } = useBank();
  const activeView = propActiveView ?? contextActiveView;
  const setActiveView = propSetActiveView ?? contextSetActiveView;
  const hasA11yDefects = featureFlags.accessibilityDefects;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, testId: 'nav-item-dashboard' },
    { id: 'accounts', label: 'Accounts & Balances', icon: Wallet, testId: 'nav-item-accounts' },
    { id: 'transactions', label: 'Transactions Ledger', icon: ArrowLeftRight, testId: 'nav-item-transactions' },
    { id: 'transfers', label: 'Money Transfer', icon: Send, testId: 'nav-item-transfers' },
    { id: 'billpay', label: 'Bill Payments', icon: Receipt, testId: 'nav-item-billpay' },
    { id: 'loans', label: 'Loan Center', icon: Landmark, testId: 'nav-item-loans' },
    { id: 'cards', label: 'Credit Cards', icon: CreditCard, testId: 'nav-item-cards' },
    { id: 'investments', label: 'Investments', icon: TrendingUp, testId: 'nav-item-investments' },
    { id: 'profile', label: 'Profile & KYC', icon: UserCheck, testId: 'nav-item-profile' },
    { id: 'support', label: 'Support & Help', icon: HelpCircle, testId: 'nav-item-support' },
    { id: 'admin', label: 'Admin & Chaos Portal', icon: ShieldAlert, testId: 'nav-item-admin', highlight: true },
    { id: 'swagger', label: 'REST APIs / Swagger', icon: Code, testId: 'nav-item-swagger' },
  ];

  return (
    <aside
      id="sidebar-navigation-panel"
      data-testid="sidebar-navigation-panel"
      className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col justify-between p-3 shrink-0 text-slate-700 min-h-[calc(100vh-3.5rem)]"
    >
      <div className="space-y-4">
        {/* User Card */}
        <div
          id="sidebar-user-summary-card"
          data-testid="sidebar-user-summary-card"
          className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center space-x-2.5"
        >
          <img
            id="sidebar-user-avatar"
            data-testid="sidebar-user-avatar"
            src={currentUser.avatarUrl}
            alt={hasA11yDefects ? '' : currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-[#002D72]/30"
          />
          <div className="overflow-hidden">
            <p id="sidebar-user-display-name" data-testid="sidebar-user-display-name" className="text-xs font-bold text-slate-900 truncate">
              {currentUser.name}
            </p>
            <p id="sidebar-user-display-email" data-testid="sidebar-user-display-email" className="text-[10px] text-slate-500 truncate">
              {currentUser.email}
            </p>
            <span
              id="sidebar-user-kyc-badge"
              data-testid="sidebar-user-kyc-badge"
              className="inline-block mt-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9px] font-bold"
            >
              KYC {currentUser.kycStatus}
            </span>
          </div>
        </div>

        {/* Navigation Group */}
        <nav id="sidebar-nav-menu" data-testid="sidebar-nav-menu" className="space-y-0.5">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Banking Modules
          </div>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                data-testid={item.testId}
                name={`nav-${item.id}`}
                aria-label={hasA11yDefects ? undefined : `Navigate to ${item.label}`}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded text-xs transition cursor-pointer ${
                  isActive
                    ? 'bg-[#002D72] text-white font-bold shadow-sm'
                    : item.highlight
                    ? 'text-amber-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-300/60 font-semibold'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900 font-medium'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Sign Out */}
      <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-2">
        <button
          id="btn-sidebar-logout"
          data-testid="btn-sidebar-logout"
          data-automation-id="btn-sidebar-logout"
          name="logout"
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-700" />
          <span>Sign Out / Lock Session</span>
        </button>

        <div className="space-y-0.5">
          <div id="footer-routing-info" data-testid="footer-routing-info">
            Routing: <span className="font-mono text-slate-700 font-bold">121000358</span>
          </div>
          <div id="footer-environment-info" data-testid="footer-environment-info">
            Env: <span className="text-emerald-700 font-mono font-bold">SELENIUM_TEST_RIG_v3.2</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
