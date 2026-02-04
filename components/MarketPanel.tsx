
import React from 'react';
import { Lead } from '../types';

interface MarketPanelProps {
  lead: Lead;
}

const MarketPanel: React.FC<MarketPanelProps> = ({ lead }) => {
  const { market } = lead;
  const town = lead.address.split(',')[1]?.trim();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8 pb-12">
      {/* 1. Market Health KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MarketKpi 
          label="Median Sold Price" 
          value={`$${market.medianSoldPrice.toLocaleString()}`} 
          sub={`${market.medianSoldPriceYoY >= 0 ? '+' : ''}${market.medianSoldPriceYoY}% YoY`}
          isPositive={market.medianSoldPriceYoY >= 0}
        />
        <MarketKpi 
          label="Active Inventory" 
          value={market.inventoryActive} 
          sub="Current listings" 
        />
        <MarketKpi 
          label="Median DOM" 
          value={`${market.medianDom}d`} 
          sub="Zip Code Average" 
        />
        <MarketKpi 
          label="List-to-Sale Ratio" 
          value={`${(market.listToSaleRatio * 100).toFixed(0)}%`} 
          sub="Closing Strength"
          isPositive={market.listToSaleRatio >= 1}
        />
      </div>

      {/* 2. Timing & Strategy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-6">
            <div className="inline-block px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Strategic Timing</div>
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              {market.bestMonthToSell ? `Wait for ${market.bestMonthToSell}, or list now?` : 'Market Timing Analysis'}
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-xl">
              Historically, buyer concentration in {town} peaks during the spring/fall windows. Listing during high-liquidity months maximizes the probability of multiple offers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Peak Demand Month</p>
                <p className="text-xl font-black text-white">{market.bestMonthToSell || 'N/A'}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Data Confidence</p>
                <p className="text-xl font-black text-blue-400">{market.bestMonthConfidence || 'Medium'}</p>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Liquidity Insight</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              With {market.inventoryActive} active listings and a {market.medianDom} day median DOM, {town} is currently a <span className="font-bold text-blue-600">{market.inventoryActive < 50 ? 'Tight Seller' : 'Balanced'}</span> market.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100 mt-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Reduction Frequency</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{market.priceReductionsPct}%</p>
            <p className="text-[10px] text-slate-400 font-bold">Of active listings have cut price</p>
          </div>
        </div>
      </div>

      {/* 3. Trends Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Monthly Performance (12mo)</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Liquidity Trends</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Month</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Closed Sales</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Median DOM</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Market Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {market.closedSalesByMonth?.map((item, idx) => {
                const domItem = market.medianDomByMonth?.find(d => d.month === item.month);
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.month}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{item.count} units</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{domItem?.medianDom || '--'} days</td>
                    <td className="px-6 py-4">
                      {domItem && domItem.medianDom < market.medianDom ? (
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-tighter">Fast Moving</span>
                      ) : (
                        <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded uppercase tracking-tighter">Steady</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MarketKpi: React.FC<{ label: string; value: string | number; sub: string; isPositive?: boolean }> = ({ label, value, sub, isPositive }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-slate-900">{value}</p>
    <p className={`text-[10px] font-bold uppercase mt-0.5 ${isPositive === true ? 'text-green-600' : isPositive === false ? 'text-red-600' : 'text-slate-500'}`}>
      {sub}
    </p>
  </div>
);

export default MarketPanel;
