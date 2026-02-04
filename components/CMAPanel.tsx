
import React from 'react';
import { Lead, Comp } from '../types';
import { computeMedian } from '../utils/insights';
import { formatDateDisplay, getZillowLink } from '../utils/formatters';

interface CMAPanelProps {
  lead: Lead;
}

const CMAPanel: React.FC<CMAPanelProps> = ({ lead }) => {
  const allCompsFromZip = lead.cma?.comps || [];
  const subjectZip = lead.townZips && lead.townZips[0];
  const subjectOrigPrice = lead.originalListPrice || 0;
  
  // FALLBACK LOGIC: Use originalListPrice if finalListPrice is 0
  const subjectFinalAsk = lead.finalListPrice || subjectOrigPrice;
  
  // Identify if searched property is in Texas (TX)
  const isTexasLead = lead.address.split(',').some(part => part.trim().toUpperCase() === 'TX') || 
                      lead.address.toUpperCase().includes(', TX ');

  // Standard filtering range is 5%
  const filterPercentage = 0.05;
  const minPrice = subjectOrigPrice * (1 - filterPercentage);
  const maxPrice = subjectOrigPrice * (1 + filterPercentage);

  // Apply filtering logic: 
  // If TX lead, we return all same-zip comps without price filtering.
  // If not TX lead, we filter by +/- 5%.
  const priceFilteredComps = allCompsFromZip.filter(c => {
    const compZip = c.zip ? String(c.zip).padStart(5, '0') : '';
    const isSameZip = !subjectZip || compZip === subjectZip;
    
    if (isTexasLead) {
      return isSameZip;
    }
    
    const withinPriceRange = c.soldPrice >= minPrice && c.soldPrice <= maxPrice;
    return withinPriceRange && isSameZip;
  });

  // Logic to determine UI labels: For TX leads we consider it "not using price filter" to reflect that we're showing everything.
  const isUsingPriceFilter = !isTexasLead && priceFilteredComps.length > 0;
  const displayedComps = priceFilteredComps.length > 0 ? priceFilteredComps : allCompsFromZip;
  
  // Sort comps by sold date (latest first)
  const sortedComps = [...displayedComps].sort((a, b) => {
    const dateA = new Date(a.soldDate).getTime();
    const dateB = new Date(b.soldDate).getTime();
    return dateB - dateA;
  });
  
  // Calculate Metrics based on the list being displayed
  const prices = displayedComps.map(c => c.soldPrice || 0);
  const medianPrice = computeMedian(prices);
  
  const priceDelta = subjectFinalAsk - medianPrice;
  const priceDeltaPct = medianPrice > 0 ? ((priceDelta / medianPrice) * 100).toFixed(1) : '0';

  const street = lead.address.split(',')[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject Final Ask</p>
          <p className="text-2xl font-black text-slate-900">${(subjectFinalAsk).toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {isTexasLead ? 'ZIP Median (Unfiltered)' : isUsingPriceFilter ? 'Comp Median Price' : 'ZIP Code Median Price'}
          </p>
          <p className="text-2xl font-black text-slate-900">${(medianPrice || 0).toLocaleString()}</p>
          <p className="text-[10px] font-bold text-blue-600 mt-1">
            Based on {displayedComps.length} {isTexasLead ? 'total local' : (isUsingPriceFilter ? 'price-matched' : 'total local')} sales
          </p>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm ${priceDelta > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${priceDelta > 0 ? 'text-red-500' : 'text-green-600'}`}>
            Variance vs Median
          </p>
          <p className={`text-2xl font-black ${priceDelta > 0 ? 'text-red-600' : 'text-green-700'}`}>
            {priceDelta > 0 ? '+' : ''}{priceDeltaPct}%
          </p>
          <p className={`text-[10px] font-bold mt-1 ${priceDelta > 0 ? 'text-red-400' : 'text-green-500'}`}>
            ${Math.abs(priceDelta).toLocaleString()} {priceDelta > 0 ? 'Above' : 'Below'} Median
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Comparable Sales (Sold)</h3>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              {isTexasLead 
                ? "Showing all sold properties in this ZIP code (Price range filtering disabled for TX)" 
                : isUsingPriceFilter 
                  ? `Filtered for +/- ${(filterPercentage * 100).toFixed(0)}% of Subject Orig List ($${subjectOrigPrice.toLocaleString()})`
                  : `Showing all local sales (No close price matches found for +/- ${(filterPercentage * 100).toFixed(0)}% tier)`}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">Last 12 Months</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded">ZIP: {subjectZip}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Address</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Beds/Baths</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Sold Date</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Sold Price</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedComps.length > 0 ? sortedComps.map((comp, idx) => {
                // Formatting according to the requested pattern: Street, City, State ZIP
                const stateAndZip = `${comp.state || ''} ${comp.zip || subjectZip || ''}`.trim();
                const addressParts = [comp.address, comp.city, stateAndZip].filter(Boolean);
                const fullFormattedAddress = addressParts.join(', ').replace(/\s+/g, ' ').trim();
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <a 
                        href={getZillowLink(fullFormattedAddress)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline transition-all"
                      >
                        {fullFormattedAddress}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{comp.beds}bd / {comp.baths}ba</td>
                    <td className="px-6 py-4 text-slate-500">{formatDateDisplay(comp.soldDate)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${(comp.soldPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-xs">{comp.listAgentName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{comp.listAgentPhone}</div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No properties found in ZIP {subjectZip} for the last 12 months.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 bottom-0 w-2 bg-blue-600"></div>
        <div className="p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-[0.15em]">CMA Summary & Strategic Gap</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Comparative Market Intelligence</p>
            </div>
          </div>
          
          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 md:p-8">
            <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
              Based on an analysis of <span className="text-slate-900 font-extrabold underline decoration-blue-200 decoration-4 underline-offset-4">{displayedComps.length} sales</span> within the immediate ZIP code, the subject property at <a href={lead.zillowLink} target="_blank" rel="noopener noreferrer" className="font-extrabold text-slate-900 hover:text-blue-600 hover:underline transition-all">{street}</a> shows a <span className={`font-extrabold ${priceDelta > 0 ? 'text-red-600' : 'text-emerald-600'} bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm`}>{Math.abs(Number(priceDeltaPct))}% price variance</span> relative to the local {isTexasLead ? 'market' : (isUsingPriceFilter ? 'comparable' : 'market')} median. 
              {priceDelta > 0 ? (
                <> The property's final list price of <span className="font-bold text-slate-900">${(subjectFinalAsk).toLocaleString()}</span> was positioned <span className="font-bold text-red-600">${Math.abs(priceDelta).toLocaleString()} above</span> the neighborhood sold median of <span className="font-bold text-slate-900">${(medianPrice || 0).toLocaleString()}</span>. This premium placement likely created a "value friction" point for local buyers who were benchmarking against similar results nearby.</>
              ) : (
                <> Interestingly, despite being priced <span className="font-bold text-emerald-600">${Math.abs(priceDelta).toLocaleString()} below</span> the neighborhood sold median for this tier, the property did not find a buyer. This suggests that the <span className="font-bold text-slate-900 italic">"Strategic Gap"</span> may not have been price alone, but perhaps a deficiency in digital positioning, condition-to-value ratio, or the specific timing of the listing cycle.</>
              )}
              {" "}By narrowing this gap and aligning the next listing strategy with current local results, there is a clear opportunity to re-capture market interest and trigger high-intent buyer activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Market Aligned
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200">
              Data Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMAPanel;
