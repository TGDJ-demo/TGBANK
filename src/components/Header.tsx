import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import {
  Building2,
  Bell,
  Shield,
  User,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
  Database,
  Menu,
} from 'lucide-react';
import { DEMO_PERSONAS } from '../mockData';

export const Header: React.FC<{ onToggleSidebar?: () => void; onOpenTestDataModal?: () => void }> = ({ onToggleSidebar, onOpenTestDataModal }) => {
  const { currentUser, switchPersona, currentPersonaKey, notifications, markAllNotificationsRead, featureFlags, setActiveView, logout } = useBank();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Accessibility Chaos flag effect modifier
  const hasA11yDefects = featureFlags.accessibilityDefects;

  return (
    <header
      id="header-navigation-bar"
      data-testid="header-navigation-bar"
      className="bg-[#002D72] border-b border-[#001D4A] text-white sticky top-0 z-40 shadow-md"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {onToggleSidebar && (
            <button
              id="btn-mobile-sidebar-toggle"
              data-testid="btn-mobile-sidebar-toggle"
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition cursor-pointer"
              aria-label="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            id="brand-logo-container"
            data-testid="brand-logo-container"
            className="w-9 h-9 bg-white/15 rounded flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/25 transition"
            onClick={() => setActiveView('dashboard')}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="cursor-pointer flex items-center space-x-2" onClick={() => setActiveView('dashboard')}>
            <span
              id="brand-title-text"
              data-testid="brand-title-text"
              className="text-lg font-bold tracking-tight text-white font-sans"
            >
              TESTGRID BANK
            </span>
            <span
              id="brand-subtitle-badge"
              data-testid="brand-subtitle-badge"
              className="text-[10px] font-bold px-2 py-0.5 bg-blue-900/80 text-blue-100 rounded border border-blue-400/30 uppercase tracking-wider"
            >
              Demo Platform
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Chaos Defects Warning Indicator */}
          {(featureFlags.accessibilityDefects ||
            featureFlags.apiLatencyMs > 0 ||
            featureFlags.randomApiFailures ||
            featureFlags.visualBugs) && (
            <button
              id="btn-chaos-status-indicator"
              data-testid="btn-chaos-status-indicator"
              onClick={() => setActiveView('admin')}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-200 border border-amber-400/40 rounded text-xs font-semibold hover:bg-amber-500/30 transition cursor-pointer"
              title="Click to manage active chaos test flags"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>
                Chaos Active
                {featureFlags.apiLatencyMs > 0 ? ` (${featureFlags.apiLatencyMs}ms Latency)` : ''}
              </span>
            </button>
          )}

          {/* Custom Test Data Injector Button */}
          {onOpenTestDataModal && (
            <button
              id="btn-header-test-data"
              data-testid="btn-header-test-data"
              name="test-data-injector"
              aria-label={hasA11yDefects ? undefined : 'Open Test Data Injector'}
              onClick={onOpenTestDataModal}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 rounded text-xs font-bold transition cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Inject Test Data</span>
            </button>
          )}

          {/* Quick API Explorer / Swagger Link */}
          <button
            id="btn-header-swagger-link"
            data-testid="btn-header-swagger-link"
            name="swagger-quick-link"
            aria-label={hasA11yDefects ? undefined : 'Open OpenAPI Swagger API Explorer'}
            onClick={() => setActiveView('swagger')}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded text-xs font-medium transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline">REST APIs</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="btn-header-notifications-bell"
              data-testid="btn-header-notifications-bell"
              name="notifications-toggle"
              aria-label={hasA11yDefects ? undefined : 'View Notifications'}
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span
                  id="badge-unread-notifications-count"
                  data-testid="badge-unread-notifications-count"
                  className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#002D72]"
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotificationsMenu && (
              <div
                id="dropdown-notifications-menu"
                data-testid="dropdown-notifications-menu"
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-slate-800"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Alerts</span>
                  {unreadCount > 0 && (
                    <button
                      id="btn-mark-all-notifications-read"
                      data-testid="btn-mark-all-notifications-read"
                      onClick={() => {
                        markAllNotificationsRead();
                        setShowNotificationsMenu(false);
                      }}
                      className="text-xs text-[#002D72] hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      id={`notification-item-${notif.id}`}
                      data-testid={`notification-item-${notif.id}`}
                      className={`p-2 rounded border text-xs ${
                        notif.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-blue-50/70 border-blue-100 text-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#002D72]">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-600 text-[11px] leading-snug">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Persona Switcher & Profile Dropdown */}
          <div className="relative">
            <button
              id="btn-header-persona-selector"
              data-testid="btn-header-persona-selector"
              name="persona-selector-dropdown"
              aria-label={hasA11yDefects ? undefined : 'Switch Demo User Persona'}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 hover:bg-white/10 rounded transition border border-white/20 cursor-pointer"
            >
              <img
                id="img-user-avatar-thumbnail"
                data-testid="img-user-avatar-thumbnail"
                src={currentUser.avatarUrl}
                alt={hasA11yDefects ? '' : currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-white/50"
              />
              <div className="text-left hidden sm:block">
                <div id="text-user-name" data-testid="text-user-name" className="text-xs font-bold leading-tight text-white">
                  {currentUser.name}
                </div>
                <div id="text-user-role" data-testid="text-user-role" className="text-[10px] text-blue-200">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {/* Persona Switcher Menu */}
            {showUserMenu && (
              <div
                id="dropdown-persona-menu"
                data-testid="dropdown-persona-menu"
                className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-slate-800"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                  Select Demo Testing Persona
                </div>
                <div className="space-y-1">
                  {Object.entries(DEMO_PERSONAS).map(([key, persona]) => (
                    <button
                      key={key}
                      id={`btn-select-persona-${key}`}
                      data-testid={`btn-select-persona-${key}`}
                      name={`select-persona-${key}`}
                      onClick={() => {
                        switchPersona(key);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded text-left text-xs transition cursor-pointer ${
                        currentPersonaKey === key ? 'bg-[#002D72] text-white font-semibold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <img src={persona.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <div className="font-bold">{persona.name}</div>
                          <div className="text-[10px] opacity-80">{persona.role}</div>
                        </div>
                      </div>
                      {currentPersonaKey === key && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-200 mt-3 pt-2 space-y-1">
                  <button
                    id="btn-user-profile-settings"
                    data-testid="btn-user-profile-settings"
                    onClick={() => {
                      setActiveView('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Customer Profile & KYC</span>
                  </button>
                  <button
                    id="btn-user-logout"
                    data-testid="btn-user-logout"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 p-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
