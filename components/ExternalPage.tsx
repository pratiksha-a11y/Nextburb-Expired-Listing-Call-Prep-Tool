import React from 'react';
import { Lead } from '../types';
import { formatDateDisplay, getZillowLink } from '../utils/formatters';

interface ExternalPageProps {
  lead: Lead;
}

const externalImages = {
  hero: { src: "", alt: "Nextburb market insights" },
  proof: { src: "", alt: "Market proof points" },
  bestMonth: { src: "", alt: "Seasonality insights" },
  testimonial: { src: "", alt: "Customer success" },
  cta: { src: "", alt: "Nextburb consultation" },
};

const ImageBlock: React.FC<{ src: string; alt: string; label?: string; className?: string }> = ({ src, alt, label, className = "" }) => {
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`rounded-2xl border border-slate-200 shadow-sm object-cover ${className}`} 
      />
    );
  }
  return (
    <div className={`rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label || "Image Placeholder"}</p>
    </div>
  );
};

const ExternalPage: React.FC<ExternalPageProps> = ({ lead }) => {
  const street = lead.address.split(',')[0];
  const town = lead.address.split(',')[1]?.trim();

  const kpis = [
    { label: "Median Sold Price", value: `$${lead.market.medianSoldPrice.toLocaleString()}`, sub: `${lead.market.medianSoldPriceYoY >= 0 ? '+' : ''}${lead.market.medianSoldPriceYoY}% YoY` },
    { label: "Median Days on Market", value: `${lead.market.medianDom}d`, sub: "Time to find a buyer" },
    { label: "Inventory Level", value: lead.market.inventoryActive, sub: "Active local listings" },
    { label: "Sale-to-List Ratio", value: `${(lead.market.listToSaleRatio * 100).toFixed(0)}%`, sub: "Closing price vs ask" },
    { label: "Price Reductions", value: `${lead.market.priceReductionsPct}%`, sub: "Market-wide frequency" }
  ];

  const recentSales = [...lead.cma.comps].sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime()).slice(0, 8);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16 pb-24 max-w-6xl mx-auto">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 px-4">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Data-Backed Market Report
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
            Your Housing Market Report
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
            Buyers are active in {town}. This report summarizes recent sold transactions, current inventory, and listing outcomes to help position <a href={lead.zillowLink} target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-all">{street}</a> for a successful result.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-sm">
              Get a free pricing consultation
            </button>
          </div>
        </div>
        <ImageBlock src={externalImages.hero.src} alt={externalImages.hero.alt} label="Hero: Market Visualization" className="h-[400px] w-full" />
      </section>

      <section className="space-y-8 px-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Local Market Dynamics</h2>
          <p className="text-slate-500 text-sm">A summary of {town} performance over the last 12 months.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase">{kpi.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recent Evidence</h2>
            <p className="text-xs font-bold text-slate-400">Sold Comps • Last 12 Months</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Address</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Sold date</th>
                    <th className="p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Sold price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentSales.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">
                        <a href={getZillowLink(tx.address)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-all">
                          {tx.address.split(',')[0]}
                        </a>
                      </td>
                      <td className="p-4 text-slate-500">{formatDateDisplay(tx.soldDate)}</td>
                      <td className="p-4 font-bold text-slate-900">${tx.soldPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 rounded-[40px] p-12 md:p-20 mx-4 text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-blue-200">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Ready for a better selling experience?</h2>
          <p className="text-lg opacity-90 leading-relaxed">
            Stop guessing about your home's value. Get the data-backed roadmap to a successful closing in {town}.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <button className="w-full md:w-auto bg-white text-blue-600 hover:bg-slate-50 font-black px-10 py-5 rounded-2xl shadow-xl transition-all">
              Request a free Pricing Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExternalPage;
