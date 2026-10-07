import React, { useState } from 'react';
import { useBank } from '../context/BankContext';
import { HelpCircle, MessageSquare, MapPin, Send, Plus, Paperclip, ChevronDown } from 'lucide-react';

export const SupportView: React.FC = () => {
  const { supportTickets, createSupportTicket, currentUser, addToast } = useBank();

  const [activeTab, setActiveTab] = useState<'TICKETS' | 'CHAT' | 'LOCATOR'>('TICKETS');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'ACCOUNT' | 'TRANSFER' | 'CARD' | 'LOAN' | 'SECURITY' | 'OTHER'>('TRANSFER');
  const [ticketPriority, setTicketPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [ticketUrgency, setTicketUrgency] = useState<number>(3);
  const [contactMethod, setContactMethod] = useState<'EMAIL' | 'SMS' | 'PHONE'>('EMAIL');
  const [attachAuditLog, setAttachAuditLog] = useState<boolean>(true);
  const [notifyEmailUpdates, setNotifyEmailUpdates] = useState<boolean>(true);
  const [ticketMsg, setTicketMsg] = useState('');

  // Live Chat state
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; isAgent: boolean; time: string }[]>([
    { sender: 'Western AI Assistant', text: 'Hello! I am your Western Trust AI Assistant. How can I help you today?', isAgent: true, time: '11:40 AM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Locator search
  const [locatorSearch, setLocatorSearch] = useState('San Francisco, CA');

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    createSupportTicket({
      subject: ticketSubject,
      category: ticketCategory,
      priority: 'MEDIUM',
      messages: [{ sender: currentUser.name, timestamp: new Date().toISOString(), message: ticketMsg, isAgent: false }],
    });
    setShowCreateTicketModal(false);
    setTicketSubject('');
    setTicketMsg('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: currentUser.name, text: userText, isAgent: false, time: nowTime }]);
    setChatInput('');

    setTimeout(() => {
      let botReply = "I've checked our database records. All your transfers and balances are fully synced.";
      if (userText.toLowerCase().includes('wire') || userText.toLowerCase().includes('limit')) {
        botReply = 'Our daily Fedwire limit is $100,000 for verified accounts. For higher amounts, please submit a support ticket.';
      } else if (userText.toLowerCase().includes('card') || userText.toLowerCase().includes('freeze')) {
        botReply = 'You can instantly freeze or unfreeze your card anytime in the Credit Cards tab.';
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'Western AI Assistant', text: botReply, isAgent: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 800);
  };

  return (
    <div id="support-view-container" data-testid="support-view-container" className="space-y-4">
      {/* Header */}
      <div>
        <h1 id="heading-support-title" data-testid="heading-support-title" className="text-xl font-bold text-slate-900 tracking-tight">
          Client Care & AI Support Center
        </h1>
        <p id="subheading-support" data-testid="subheading-support" className="text-xs text-slate-500 mt-0.5">
          Raise support tickets with attachments, chat live with our AI assistant, or locate nearby branches & ATMs.
        </p>
      </div>

      {/* Module Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          id="tab-support-tickets"
          data-testid="tab-support-tickets"
          onClick={() => setActiveTab('TICKETS')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
            activeTab === 'TICKETS'
              ? 'bg-[#002D72] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          Support Tickets ({supportTickets.length})
        </button>
        <button
          id="tab-support-chat"
          data-testid="tab-support-chat"
          onClick={() => setActiveTab('CHAT')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
            activeTab === 'CHAT'
              ? 'bg-[#002D72] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          Live AI Assistant Chat
        </button>
        <button
          id="tab-support-locator"
          data-testid="tab-support-locator"
          onClick={() => setActiveTab('LOCATOR')}
          className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
            activeTab === 'LOCATOR'
              ? 'bg-[#002D72] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          Branch & ATM Locator
        </button>
      </div>

      {/* Tab 1: Support Tickets */}
      {activeTab === 'TICKETS' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900">Active Case History</h3>
            <button
              id="btn-create-ticket"
              data-testid="btn-create-ticket"
              onClick={() => setShowCreateTicketModal(true)}
              className="px-3 py-1.5 bg-[#002D72] hover:bg-blue-900 text-white text-xs font-bold rounded transition flex items-center space-x-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise Support Ticket</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {supportTickets.map((tkt) => (
              <div key={tkt.id} id={`ticket-card-${tkt.id}`} data-testid={`ticket-card-${tkt.id}`} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#002D72] uppercase tracking-wider">Ticket #{tkt.id}</span>
                    <h4 className="text-xs font-bold text-slate-900">{tkt.subject}</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-[#002D72] rounded text-[10px] font-bold border border-blue-200">
                    {tkt.status}
                  </span>
                </div>

                <div className="space-y-1.5 border-t border-slate-200 pt-2.5">
                  {tkt.messages.map((m, idx) => (
                    <div key={idx} className={`p-2.5 rounded text-xs ${m.isAgent ? 'bg-slate-100 text-slate-800' : 'bg-blue-50 text-blue-950 border border-blue-200'}`}>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span className="font-bold">{m.sender}</span>
                        <span>{m.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="leading-relaxed">{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Live AI Support Chat */}
      {activeTab === 'CHAT' && (
        <div id="widget-live-chat" data-testid="widget-live-chat" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3 max-w-2xl mx-auto">
          <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-200">
            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-ping" />
            <div>
              <h3 className="text-xs font-bold text-slate-900">Western Trust AI Support Assistant</h3>
              <p className="text-[10px] text-slate-500">Powered by Gemini AI • Online 24/7</p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto p-1">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}>
                <div className={`p-2.5 rounded-lg max-w-sm text-xs ${msg.isAgent ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-[#002D72] text-white'}`}>
                  <p className="font-bold text-[10px] opacity-80 mb-0.5">{msg.sender}</p>
                  <p className="leading-normal">{msg.text}</p>
                  <p className="text-[9px] opacity-60 text-right mt-1 font-mono">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex space-x-2 pt-2 border-t border-slate-200">
            <input
              id="chat-input-message"
              data-testid="chat-input-message"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about your account, wires, or limits..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
            />
            <button
              id="btn-chat-send"
              data-testid="btn-chat-send"
              type="submit"
              className="px-3.5 py-1.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Branch & ATM Locator */}
      {activeTab === 'LOCATOR' && (
        <div id="widget-branch-locator" data-testid="widget-branch-locator" className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="input-branch-locator-search"
              data-testid="input-branch-locator-search"
              type="text"
              value={locatorSearch}
              onChange={(e) => setLocatorSearch(e.target.value)}
              placeholder="Enter City, Zip Code, or Address..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
            />
            <button
              id="btn-search-branches"
              data-testid="btn-search-branches"
              className="px-4 py-1.5 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition shadow-xs"
            >
              Find Locations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {[
              { name: 'Western Trust Main Plaza Branch & ATM', address: '100 Market St, San Francisco, CA 94105', dist: '0.4 miles', status: 'Open until 5:00 PM' },
              { name: 'Financial District Drive-Thru ATM', address: '450 Montgomery St, San Francisco, CA 94104', dist: '0.8 miles', status: '24/7 ATM Access' },
            ].map((loc, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-[#002D72] font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{loc.name}</span>
                </div>
                <p className="text-xs text-slate-600">{loc.address}</p>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Distance: {loc.dist}</span>
                  <span className="text-emerald-800 font-bold">{loc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showCreateTicketModal && (
        <div id="modal-create-ticket" data-testid="modal-create-ticket" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleTicketSubmit} className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-5 shadow-xl space-y-3 text-slate-900">
            <h3 className="text-sm font-bold text-slate-900">Raise New Support Ticket</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                id="input-ticket-subject"
                data-testid="input-ticket-subject"
                type="text"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Question regarding wire fee reversal"
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label id="lbl-ticket-category" data-testid="lbl-ticket-category" htmlFor="select-ticket-category" className="block text-xs font-bold text-slate-700 mb-1">
                  Category (Dropdown)
                </label>
                <select
                  id="select-ticket-category"
                  data-testid="select-ticket-category"
                  data-automation-id="select-ticket-category"
                  name="ticketCategory"
                  value={ticketCategory}
                  data-value={ticketCategory}
                  data-selected={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72] cursor-pointer"
                >
                  <option id="opt-cat-transfer" value="TRANSFER">Money Transfer / Wire</option>
                  <option id="opt-cat-account" value="ACCOUNT">Account Balance & Statements</option>
                  <option id="opt-cat-card" value="CARD">Credit / Debit Card Issue</option>
                  <option id="opt-cat-loan" value="LOAN">Loan Origination</option>
                  <option id="opt-cat-security" value="SECURITY">Security / Fraud Alert</option>
                </select>
              </div>

              <div>
                <label id="lbl-ticket-priority" data-testid="lbl-ticket-priority" htmlFor="select-ticket-priority" className="block text-xs font-bold text-slate-700 mb-1">
                  Priority SLA (Dropdown)
                </label>
                <select
                  id="select-ticket-priority"
                  data-testid="select-ticket-priority"
                  data-automation-id="select-ticket-priority"
                  name="ticketPriority"
                  value={ticketPriority}
                  data-value={ticketPriority}
                  data-selected={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72] cursor-pointer"
                >
                  <option id="opt-prio-low" value="LOW">Low (48 hr response)</option>
                  <option id="opt-prio-med" value="MEDIUM">Medium (24 hr response)</option>
                  <option id="opt-prio-high" value="HIGH">High (4 hr response)</option>
                  <option id="opt-prio-crit" value="CRITICAL">Critical / Fraud Incident (1 hr)</option>
                </select>
              </div>
            </div>

            {/* Urgency Level Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label id="lbl-ticket-urgency" data-testid="lbl-ticket-urgency" htmlFor="slider-ticket-urgency" className="block text-xs font-bold text-slate-700">
                  Case Severity / Urgency Rating (Slider: 1 - 5):
                </label>
                <span id="val-ticket-urgency" data-testid="val-ticket-urgency" className="text-xs font-mono font-bold text-[#002D72]">
                  Level {ticketUrgency} of 5
                </span>
              </div>
              <input
                id="slider-ticket-urgency"
                data-testid="slider-ticket-urgency"
                data-automation-id="slider-ticket-urgency"
                name="ticketUrgencySlider"
                type="range"
                min="1"
                max="5"
                step="1"
                value={ticketUrgency}
                onChange={(e) => setTicketUrgency(Number(e.target.value))}
                aria-valuenow={ticketUrgency}
                aria-valuemin={1}
                aria-valuemax={5}
                data-value={String(ticketUrgency)}
                className="w-full accent-[#002D72] cursor-pointer"
              />
            </div>

            {/* Preferred Contact Method Radio Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Contact Channel (Radio Buttons):</label>
              <div className="grid grid-cols-3 gap-2">
                <label
                  id="lbl-radio-contact-email"
                  data-testid="lbl-radio-contact-email"
                  htmlFor="radio-contact-email"
                  className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                >
                  <input
                    id="radio-contact-email"
                    data-testid="radio-contact-email"
                    data-automation-id="radio-contact-email"
                    type="radio"
                    name="contactMethod"
                    value="EMAIL"
                    checked={contactMethod === 'EMAIL'}
                    onChange={() => setContactMethod('EMAIL')}
                    aria-checked={contactMethod === 'EMAIL' ? 'true' : 'false'}
                    data-checked={contactMethod === 'EMAIL' ? 'true' : 'false'}
                    className="text-[#002D72] cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Email</span>
                </label>

                <label
                  id="lbl-radio-contact-sms"
                  data-testid="lbl-radio-contact-sms"
                  htmlFor="radio-contact-sms"
                  className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                >
                  <input
                    id="radio-contact-sms"
                    data-testid="radio-contact-sms"
                    data-automation-id="radio-contact-sms"
                    type="radio"
                    name="contactMethod"
                    value="SMS"
                    checked={contactMethod === 'SMS'}
                    onChange={() => setContactMethod('SMS')}
                    aria-checked={contactMethod === 'SMS' ? 'true' : 'false'}
                    data-checked={contactMethod === 'SMS' ? 'true' : 'false'}
                    className="text-[#002D72] cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">SMS Alert</span>
                </label>

                <label
                  id="lbl-radio-contact-phone"
                  data-testid="lbl-radio-contact-phone"
                  htmlFor="radio-contact-phone"
                  className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                >
                  <input
                    id="radio-contact-phone"
                    data-testid="radio-contact-phone"
                    data-automation-id="radio-contact-phone"
                    type="radio"
                    name="contactMethod"
                    value="PHONE"
                    checked={contactMethod === 'PHONE'}
                    onChange={() => setContactMethod('PHONE')}
                    aria-checked={contactMethod === 'PHONE' ? 'true' : 'false'}
                    data-checked={contactMethod === 'PHONE' ? 'true' : 'false'}
                    className="text-[#002D72] cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Direct Call</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
              <textarea
                id="textarea-ticket-message"
                data-testid="textarea-ticket-message"
                rows={3}
                value={ticketMsg}
                onChange={(e) => setTicketMsg(e.target.value)}
                placeholder="Describe your inquiry or issue..."
                className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#002D72]"
                required
              />
            </div>

            {/* Checkboxes in Support Modal */}
            <div className="space-y-1.5 pt-1">
              <label
                id="lbl-checkbox-attach-audit-log"
                data-testid="lbl-checkbox-attach-audit-log"
                htmlFor="checkbox-attach-audit-log"
                className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 select-none"
              >
                <input
                  id="checkbox-attach-audit-log"
                  data-testid="checkbox-attach-audit-log"
                  data-automation-id="checkbox-attach-audit-log"
                  name="attachAuditLog"
                  type="checkbox"
                  checked={attachAuditLog}
                  onChange={(e) => setAttachAuditLog(e.target.checked)}
                  value={attachAuditLog ? 'true' : 'false'}
                  aria-checked={attachAuditLog ? 'true' : 'false'}
                  data-checked={attachAuditLog ? 'true' : 'false'}
                  data-state={attachAuditLog ? 'checked' : 'unchecked'}
                  className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span>Attach recent system audit trail and session diagnostics</span>
              </label>

              <label
                id="lbl-checkbox-notify-email"
                data-testid="lbl-checkbox-notify-email"
                htmlFor="checkbox-notify-email"
                className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 select-none"
              >
                <input
                  id="checkbox-notify-email"
                  data-testid="checkbox-notify-email"
                  data-automation-id="checkbox-notify-email"
                  name="notifyEmailUpdates"
                  type="checkbox"
                  checked={notifyEmailUpdates}
                  onChange={(e) => setNotifyEmailUpdates(e.target.checked)}
                  value={notifyEmailUpdates ? 'true' : 'false'}
                  aria-checked={notifyEmailUpdates ? 'true' : 'false'}
                  data-checked={notifyEmailUpdates ? 'true' : 'false'}
                  data-state={notifyEmailUpdates ? 'checked' : 'unchecked'}
                  className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span>Send instantaneous email ticket resolution status updates</span>
              </label>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateTicketModal(false)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                id="btn-submit-ticket-form"
                data-testid="btn-submit-ticket-form"
                type="submit"
                className="w-1/2 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
