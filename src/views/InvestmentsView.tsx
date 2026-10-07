import React, { useState, useMemo } from 'react';
import { useBank } from '../context/BankContext';
import { TrendingUp, ArrowUpRight, ArrowDownRight, PieChart, DollarSign, Sliders, CheckCircle2, ShoppingCart, RefreshCw, X } from 'lucide-react';

export const InvestmentsView: React.FC = () => {
  const { investments, addToast } = useBank();

  // Filter & Strategy Controls
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('ALL');
  const [riskTolerance, setRiskTolerance] = useState<number>(7);
  const [targetEquityPct, setTargetEquityPct] = useState<number>(75);
  const [autoRebalance, setAutoRebalance] = useState<boolean>(true);
  const [dividendReinvestment, setDividendReinvestment] = useState<boolean>(true);

  // Trade Modal State
  const [showTradeModal, setShowTradeModal] = useState<boolean>(false);
  const [tradeSymbol, setTradeSymbol] = useState<string>(investments[0]?.symbol || 'VTI');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [tradeAgreement, setTradeAgreement] = useState<boolean>(true);
  const [isExecutingTrade, setIsExecutingTrade] = useState<boolean>(false);

  const selectedSecurity = investments.find((i) => i.symbol === tradeSymbol) || investments[0];
  const estimatedOrderCost = (selectedSecurity?.currentPrice || 100) * tradeShares;

  const filteredInvestments = useMemo(() => {
    if (selectedAssetClass === 'ALL') return investments;
    return investments.filter((i) => i.type === selectedAssetClass);
  }, [investments, selectedAssetClass]);

  const totalValue = investments.reduce((sum, i) => sum + i.totalValue, 0);
  const totalGain = investments.reduce((sum, i) => sum + i.unrealizedGainLoss, 0);

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeAgreement) {
      addToast({ type: 'error', title: 'Terms Required', message: 'Please acknowledge the order execution disclaimer.' });
      return;
    }
    setIsExecutingTrade(true);
    setTimeout(() => {
      setIsExecutingTrade(false);
      setShowTradeModal(false);
      addToast({
        type: 'success',
        title: 'Order Executed Successfully',
        message: `Purchased ${tradeShares} shares of ${tradeSymbol} for $${estimatedOrderCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD.`,
      });
    }, 600);
  };

  return (
    <div id="investments-view-container" data-testid="investments-view-container" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 id="heading-investments-title" data-testid="heading-investments-title" className="text-xl font-bold text-slate-900 tracking-tight">
            Wealth & Investment Portfolio
          </h1>
          <p id="subheading-investments" data-testid="subheading-investments" className="text-xs text-slate-500 mt-0.5">
            Monitor ETF, Equities, Mutual Funds, and IRA retirement holdings with automated trade execution.
          </p>
        </div>

        <button
          id="btn-open-trade-modal"
          data-testid="btn-open-trade-modal"
          data-automation-id="btn-open-trade-modal"
          onClick={() => setShowTradeModal(true)}
          className="px-4 py-2 bg-[#002D72] hover:bg-blue-900 text-white rounded text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-sm shrink-0"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Execute Trade Order</span>
        </button>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div id="card-portfolio-total" data-testid="card-portfolio-total" className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Portfolio Value</span>
          <div id="val-portfolio-total-value" data-testid="val-portfolio-total-value" className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div id="card-portfolio-gain" data-testid="card-portfolio-gain" className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Unrealized Gain</span>
          <div id="val-portfolio-unrealized-gain" data-testid="val-portfolio-unrealized-gain" className="text-xl font-extrabold text-emerald-800 font-mono mt-1 flex items-center space-x-1">
            <ArrowUpRight className="w-5 h-5 text-emerald-700" />
            <span>+${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div id="card-portfolio-return" data-testid="card-portfolio-return" className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total All-Time Return</span>
          <div id="val-portfolio-return-pct" data-testid="val-portfolio-return-pct" className="text-xl font-extrabold text-emerald-800 font-mono mt-1">
            +19.45%
          </div>
        </div>
      </div>

      {/* Automation Strategy & Controls Bar: Dropdowns, Sliders, Checkboxes */}
      <div id="panel-investment-controls" data-testid="panel-investment-controls" className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
          <Sliders className="w-4 h-4 text-[#002D72]" />
          <span>Portfolio Strategy & Automated Allocation Controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Dropdown: Asset Class */}
          <div>
            <label id="lbl-investment-asset-class" data-testid="lbl-investment-asset-class" htmlFor="select-investment-asset-class" className="block text-[11px] font-bold text-slate-600 mb-1">
              Filter Asset Class (Dropdown):
            </label>
            <select
              id="select-investment-asset-class"
              data-testid="select-investment-asset-class"
              data-automation-id="select-investment-asset-class"
              name="assetClassFilter"
              value={selectedAssetClass}
              data-value={selectedAssetClass}
              data-selected={selectedAssetClass}
              onChange={(e) => setSelectedAssetClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#002D72] cursor-pointer"
            >
              <option id="opt-asset-all" value="ALL">All Asset Classes</option>
              <option id="opt-asset-etf" value="ETF">ETF (Exchange Traded Fund)</option>
              <option id="opt-asset-mutual" value="MUTUAL_FUND">Mutual Fund</option>
              <option id="opt-asset-stock" value="STOCK">Equities / Stock</option>
              <option id="opt-asset-bond" value="BOND">Fixed Income / Bonds</option>
            </select>
          </div>

          {/* Slider 1: Risk Tolerance */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label id="lbl-risk-tolerance" data-testid="lbl-risk-tolerance" htmlFor="slider-risk-tolerance" className="font-bold text-slate-700">
                Risk Tolerance Level (1 - 10):
              </label>
              <span id="val-risk-tolerance" data-testid="val-risk-tolerance" className="font-mono font-bold text-[#002D72]">
                {riskTolerance} / 10
              </span>
            </div>
            <input
              id="slider-risk-tolerance"
              data-testid="slider-risk-tolerance"
              data-automation-id="slider-risk-tolerance"
              name="riskToleranceSlider"
              type="range"
              min="1"
              max="10"
              step="1"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(Number(e.target.value))}
              aria-valuenow={riskTolerance}
              aria-valuemin={1}
              aria-valuemax={10}
              data-value={String(riskTolerance)}
              className="w-full accent-[#002D72] cursor-pointer"
            />
          </div>

          {/* Slider 2: Target Equity Allocation */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label id="lbl-allocation-target" data-testid="lbl-allocation-target" htmlFor="slider-allocation-target" className="font-bold text-slate-700">
                Target Equity Weight (%):
              </label>
              <span id="val-allocation-target" data-testid="val-allocation-target" className="font-mono font-bold text-[#002D72]">
                {targetEquityPct}%
              </span>
            </div>
            <input
              id="slider-allocation-target"
              data-testid="slider-allocation-target"
              data-automation-id="slider-allocation-target"
              name="allocationTargetSlider"
              type="range"
              min="10"
              max="100"
              step="5"
              value={targetEquityPct}
              onChange={(e) => setTargetEquityPct(Number(e.target.value))}
              aria-valuenow={targetEquityPct}
              aria-valuemin={10}
              aria-valuemax={100}
              data-value={String(targetEquityPct)}
              className="w-full accent-[#002D72] cursor-pointer"
            />
          </div>
        </div>

        {/* Checkbox Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-slate-200 text-xs">
          <label
            id="lbl-checkbox-auto-rebalance"
            data-testid="lbl-checkbox-auto-rebalance"
            htmlFor="checkbox-auto-rebalance"
            className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer select-none"
          >
            <input
              id="checkbox-auto-rebalance"
              data-testid="checkbox-auto-rebalance"
              data-automation-id="checkbox-auto-rebalance"
              name="autoRebalance"
              type="checkbox"
              checked={autoRebalance}
              onChange={(e) => setAutoRebalance(e.target.checked)}
              value={autoRebalance ? 'true' : 'false'}
              aria-checked={autoRebalance ? 'true' : 'false'}
              data-checked={autoRebalance ? 'true' : 'false'}
              data-state={autoRebalance ? 'checked' : 'unchecked'}
              className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
            />
            <span>Enable Automated Quarterly Portfolio Rebalancing</span>
          </label>

          <label
            id="lbl-checkbox-dividend-reinvestment"
            data-testid="lbl-checkbox-dividend-reinvestment"
            htmlFor="checkbox-dividend-reinvestment"
            className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer select-none"
          >
            <input
              id="checkbox-dividend-reinvestment"
              data-testid="checkbox-dividend-reinvestment"
              data-automation-id="checkbox-dividend-reinvestment"
              name="dividendReinvestment"
              type="checkbox"
              checked={dividendReinvestment}
              onChange={(e) => setDividendReinvestment(e.target.checked)}
              value={dividendReinvestment ? 'true' : 'false'}
              aria-checked={dividendReinvestment ? 'true' : 'false'}
              data-checked={dividendReinvestment ? 'true' : 'false'}
              data-state={dividendReinvestment ? 'checked' : 'unchecked'}
              className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
            />
            <span>Automatic Dividend Reinvestment Plan (DRIP)</span>
          </label>
        </div>
      </div>

      {/* Holdings Table */}
      <div id="table-investments-container" data-testid="table-investments-container" className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Asset Holdings & Securities ({filteredInvestments.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table id="table-investments" data-testid="table-investments" className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Asset / Symbol</th>
                <th className="p-3">Asset Class</th>
                <th className="p-3">Shares Held</th>
                <th className="p-3 font-mono">Avg Cost</th>
                <th className="p-3 font-mono">Market Price</th>
                <th className="p-3 font-mono">Total Value</th>
                <th className="p-3 font-mono text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvestments.map((asset) => (
                <tr key={asset.id} id={`holding-row-${asset.id}`} data-testid={`holding-row-${asset.id}`} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div id={`holding-symbol-${asset.id}`} data-testid={`holding-symbol-${asset.id}`} className="font-mono font-bold text-slate-900 text-xs">
                      {asset.symbol}
                    </div>
                    <div className="text-[11px] text-slate-500">{asset.name}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold">
                      {asset.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">{asset.shares}</td>
                  <td className="p-3 font-mono text-slate-700">${asset.avgCost.toFixed(2)}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">${asset.currentPrice.toFixed(2)}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">${asset.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-mono font-bold text-right text-emerald-800">
                    +${asset.unrealizedGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Execution Modal */}
      {showTradeModal && (
        <div id="modal-trade-order" data-testid="modal-trade-order" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleExecuteTrade} className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 shadow-xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <ShoppingCart className="w-4 h-4 text-[#002D72]" />
                <span>Execute Securities Trade Order</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTradeModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Security Dropdown */}
            <div>
              <label id="lbl-trade-symbol" data-testid="lbl-trade-symbol" htmlFor="select-trade-symbol" className="block text-xs font-bold text-slate-700 mb-1">
                Select Security (Dropdown):
              </label>
              <select
                id="select-trade-symbol"
                data-testid="select-trade-symbol"
                data-automation-id="select-trade-symbol"
                name="tradeSymbol"
                value={tradeSymbol}
                data-value={tradeSymbol}
                data-selected={tradeSymbol}
                onChange={(e) => setTradeSymbol(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#002D72] cursor-pointer"
              >
                {investments.map((inv) => (
                  <option key={inv.id} id={`opt-trade-${inv.symbol}`} value={inv.symbol}>
                    {inv.symbol} — {inv.name} (${inv.currentPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Radio Buttons: Order Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Execution Type (Radio Buttons):</label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  id="lbl-radio-order-market"
                  data-testid="lbl-radio-order-market"
                  htmlFor="radio-order-market"
                  className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                >
                  <input
                    id="radio-order-market"
                    data-testid="radio-order-market"
                    data-automation-id="radio-order-market"
                    type="radio"
                    name="orderType"
                    value="MARKET"
                    checked={orderType === 'MARKET'}
                    onChange={() => setOrderType('MARKET')}
                    aria-checked={orderType === 'MARKET' ? 'true' : 'false'}
                    data-checked={orderType === 'MARKET' ? 'true' : 'false'}
                    className="text-[#002D72] cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Market Order</span>
                </label>

                <label
                  id="lbl-radio-order-limit"
                  data-testid="lbl-radio-order-limit"
                  htmlFor="radio-order-limit"
                  className="p-2 bg-slate-50 border border-slate-300 rounded cursor-pointer flex items-center space-x-2 text-xs hover:bg-slate-100"
                >
                  <input
                    id="radio-order-limit"
                    data-testid="radio-order-limit"
                    data-automation-id="radio-order-limit"
                    type="radio"
                    name="orderType"
                    value="LIMIT"
                    checked={orderType === 'LIMIT'}
                    onChange={() => setOrderType('LIMIT')}
                    aria-checked={orderType === 'LIMIT' ? 'true' : 'false'}
                    data-checked={orderType === 'LIMIT' ? 'true' : 'false'}
                    className="text-[#002D72] cursor-pointer"
                  />
                  <span className="font-bold text-slate-800">Limit Order</span>
                </label>
              </div>
            </div>

            {/* Slider & Input: Quantity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label id="lbl-trade-shares" data-testid="lbl-trade-shares" htmlFor="input-trade-shares" className="block text-xs font-bold text-slate-700">
                  Number of Shares to Trade:
                </label>
                <span id="val-trade-shares-est" data-testid="val-trade-shares-est" className="text-xs font-mono font-bold text-[#002D72]">
                  Est. ${estimatedOrderCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
              <input
                id="input-trade-shares"
                data-testid="input-trade-shares"
                data-automation-id="input-trade-shares"
                name="tradeShares"
                type="number"
                min="1"
                max="500"
                value={tradeShares}
                onChange={(e) => setTradeShares(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-[#002D72]"
                required
              />
              <input
                id="slider-trade-shares"
                data-testid="slider-trade-shares"
                data-automation-id="slider-trade-shares"
                name="tradeSharesSlider"
                type="range"
                min="1"
                max="250"
                step="1"
                value={tradeShares}
                onChange={(e) => setTradeShares(Number(e.target.value))}
                aria-valuenow={tradeShares}
                aria-valuemin={1}
                aria-valuemax={250}
                data-value={String(tradeShares)}
                className="w-full accent-[#002D72] mt-2 cursor-pointer"
              />
            </div>

            {/* Checkbox: Agreement */}
            <div>
              <label
                id="lbl-checkbox-trade-disclaimer"
                data-testid="lbl-checkbox-trade-disclaimer"
                htmlFor="checkbox-trade-disclaimer"
                className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-800 select-none"
              >
                <input
                  id="checkbox-trade-disclaimer"
                  data-testid="checkbox-trade-disclaimer"
                  data-automation-id="checkbox-trade-disclaimer"
                  name="tradeAgreement"
                  type="checkbox"
                  checked={tradeAgreement}
                  onChange={(e) => setTradeAgreement(e.target.checked)}
                  value={tradeAgreement ? 'true' : 'false'}
                  aria-checked={tradeAgreement ? 'true' : 'false'}
                  data-checked={tradeAgreement ? 'true' : 'false'}
                  data-state={tradeAgreement ? 'checked' : 'unchecked'}
                  required
                  className="w-4 h-4 rounded text-[#002D72] border-slate-300 focus:ring-0 cursor-pointer"
                />
                <span>I authorize TestGrid Wealth to execute this trade order.</span>
              </label>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTradeModal(false)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                id="btn-submit-trade-order"
                data-testid="btn-submit-trade-order"
                data-automation-id="btn-submit-trade-order"
                type="submit"
                disabled={isExecutingTrade}
                className="w-1/2 py-2 bg-[#002D72] hover:bg-blue-900 text-white font-bold text-xs rounded cursor-pointer transition"
              >
                {isExecutingTrade ? 'Transmitting Order...' : 'Submit Trade Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
