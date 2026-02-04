
import React, { useState, useMemo } from 'react';
import { Lead } from '../types';

interface CallScriptPanelProps {
  lead: Lead;
}

type Tone = 'Neutral' | 'Warm' | 'Direct';
type Length = '30s' | '60s';

interface FactPack {
  domDelta: number;
  priceCutPct: number;
  daysSinceExpired: number;
  compCount: number;
  compMedian: number;
  compRange: string;
  closestCompAddr: string;
  closestCompPrice: number;
  closestDelta: number;
  agentDomDelta: number;
  agentPriceCutDelta: number;
  agentOverAskPct: number;
  marketListToSale: number;
  marketInventory: number;
}

interface Hook {
  category: string;
  headline: string;
  fact: string;
  question: string;
  score: number;
}

const CallScriptPanel: React.FC<CallScriptPanelProps> = ({ lead }) => {
  const [tone, setTone] = useState<Tone>('Neutral');
  const [length, setLength] = useState<Length>('30s');
  const [copied, setCopied] = useState<string | null>(null);

  const factPack: FactPack = useMemo(() => {
    const prices = lead.cma.comps.map(c => c.soldPrice).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)] || 0;
    const closest = [...lead.cma.comps].sort((a, b) => {
      const scoreA = Math.abs(a.sqft - lead.sqft);
      const scoreB = Math.abs(b.sqft - lead.sqft);
      return scoreA - scoreB;
    })[0];

    return {
      domDelta: lead.daysOnMarket - lead.market.medianDom,
      priceCutPct: lead.totalPriceReductionPct,
      daysSinceExpired: Math.floor((new Date().getTime() - new Date(lead.expiredDate).getTime()) / (1000 * 3600 * 24)),
      compCount: lead.cma.comps.length,
      compMedian: median,
      compRange: prices.length ? `$${(prices[0] / 1000).toFixed(0)}k-$${(prices[prices.length - 1] / 1000).toFixed(0)}k` : 'N/A',
      closestCompAddr: closest?.address || 'N/A',
      closestCompPrice: closest?.soldPrice || 0,
      closestDelta: closest ? closest.soldPrice - lead.finalListPrice : 0,
      agentDomDelta: lead.agent.avgDomAgent - lead.agent.avgDomZip,
      agentPriceCutDelta: lead.agent.priceReductionPctAgent - lead.agent.priceReductionPctZip,
      agentOverAskPct: lead.agent.zipTransactionsLast12Mo > 0 ? (lead.agent.overAskCount / lead.agent.zipTransactionsLast12Mo) * 100 : 0,
      marketListToSale: lead.market.listToSaleRatio,
      marketInventory: lead.market.inventoryActive
    };
  }, [lead]);

  const scriptData = useMemo(() => {
    const isDirect = tone === 'Direct';
    const isWarm = tone === 'Warm';
    const isShort = length === '30s';

    // Opener
    let opener = `I'm calling about the property on ${lead.address.split(',')[0]}. I saw the listing recently reached its end date and wanted to see if you still have plans to sell.`;
    if (isDirect) opener = `I'm reaching out regarding ${lead.address.split(',')[0]}. Now that the listing is off-market, are you still interested in finding a buyer for the right price?`;
    if (isWarm) opener = `I was just looking at your home on ${lead.address.split(',')[0]} and noticed the listing agreement ended. It looks like a great property—are you still hoping to get it sold?`;

    // Hook Library
    const hookLibrary: Hook[] = [
      {
        category: "Pricing",
        headline: "Local Pricing Trends",
        fact: isShort 
          ? `Area homes are currently closing at ${factPack.marketListToSale.toFixed(0)}% of list price.`
          : `Market data shows local properties are closing at ${factPack.marketListToSale.toFixed(0)}% of list price, which is quite strong.`,
        question: "During your listing, what was the general feedback on the initial pricing strategy?",
        score: factPack.priceCutPct > 5 ? 90 : 40
      },
      {
        category: "Momentum",
        headline: "Market Momentum",
        fact: isShort
          ? `The neighborhood median time to sell is ${lead.market.medianDom} days.`
          : `Neighborhood statistics show a median of ${lead.market.medianDom} days to find a buyer right now.`,
        question: "Did the traffic you received during your ${lead.daysOnMarket} days on market meet your expectations?",
        score: factPack.domDelta > 14 ? 85 : 50
      },
      {
        category: "CMA",
        headline: "Recent Comparable Sale",
        fact: isShort
          ? `A similar property at ${factPack.closestCompAddr} recently closed for $${factPack.closestCompPrice.toLocaleString()}.`
          : `I noticed a similar property at ${factPack.closestCompAddr} recently closed for $${factPack.closestCompPrice.toLocaleString()}, which is a key data point for your street.`,
        question: "How did your previous valuation compare to these most recent local results?",
        score: Math.abs(factPack.closestDelta) < 50000 ? 95 : 60
      },
      {
        category: "Market",
        headline: "Active Inventory",
        fact: isShort
          ? `There are ${factPack.marketInventory} active listings competing for buyers in your area.`
          : `According to the latest reports, there are ${factPack.marketInventory} active listings currently competing for the attention of local buyers.`,
        question: "Did your previous strategy focus on how to stand out specifically against these active competitors?",
        score: 70
      },
      {
        category: "Agent",
        headline: "Listing Strategy",
        fact: isShort
          ? `The average sale in this zip code happens ${Math.abs(factPack.agentDomDelta)} days faster than your agent's current average.`
          : `Current records show a ${Math.abs(factPack.agentDomDelta)} day difference between the neighborhood median speed and the average timeline for your previous brokerage.`,
        question: "Were you looking for a more aggressive timeline to get the property moved?",
        score: factPack.agentDomDelta > 5 ? 80 : 30
      }
    ];

    const selectedHooks: Hook[] = [];
    const sortedHooks = [...hookLibrary].sort((a, b) => b.score - a.score);
    const usedCategories = new Set<string>();

    for (const h of sortedHooks) {
      if (selectedHooks.length < 3 && !usedCategories.has(h.category)) {
        selectedHooks.push(h);
        usedCategories.add(h.category);
      }
    }

    const pivots = {
      price: `“I recognize the final ask was $${lead.finalListPrice.toLocaleString()}, but with area homes selling at ${factPack.marketListToSale.toFixed(0)}% of list, it's worth reviewing if the digital positioning was reaching the right audience.”`,
      showings: `“If you had activity but no offers, it often points to a specific friction point. With ${factPack.marketInventory} other options nearby, buyers are being very selective about condition and presentation.”`,
      agent: `“It's common to choose based on relationship, but the data shows a ${factPack.agentDomDelta} day variance from the market speed. My goal is to show you how to bridge that gap.”`
    };

    return { opener, hooks: selectedHooks, pivots };
  }, [lead, tone, length, factPack]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateFullScriptText = () => {
    const { opener, hooks, pivots } = scriptData;
    let text = `Address: ${lead.address}\n\n`;
    text += `Opener: ${opener}\n\n`;
    text += `Hooks:\n`;
    hooks.forEach((h, i) => {
      text += `${i + 1}) ${h.fact}\n`;
      text += `Q: ${h.question}\n\n`;
    });
    text += `Pivots:\n`;
    text += `- If price: ${pivots.price}\n`;
    text += `- If no showings: ${pivots.showings}\n`;
    text += `- If agent: ${pivots.agent}`;
    return text;
  };

  const fullScriptText = generateFullScriptText();

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl overflow-hidden mb-6 border border-slate-800">
      <div className="bg-slate-800/50 px-8 py-5 flex flex-wrap items-center justify-between gap-6 border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </div>
          <h2 className="font-bold text-sm uppercase tracking-wider">Call Strategy Architect</h2>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tone</span>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/30">
              {(['Neutral', 'Warm', 'Direct'] as Tone[]).map(t => (
                <button 
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tone === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pace</span>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/30">
              {(['30s', '60s'] as Length[]).map(l => (
                <button 
                  key={l}
                  onClick={() => setLength(l)}
                  className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${length === l ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-8 lg:pb-0 lg:pr-10">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest">1. The Opener</h3>
            <button onClick={() => copyToClipboard(scriptData.opener, 'Opener')} className="text-[11px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-tight">Copy</button>
          </div>
          <p className="text-[14px] leading-relaxed text-slate-100 font-medium bg-slate-800/40 p-6 rounded-2xl border border-slate-700/30">
            "{scriptData.opener}"
          </p>
          <div className="pt-4">
            <button 
              onClick={() => copyToClipboard(fullScriptText, 'Script')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-[13px] transition-all shadow-xl shadow-blue-900/40 transform active:scale-[0.98]"
            >
              {copied === 'Script' ? '✓ Copied Full Script!' : 'Copy Entire Call Framework'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest">2. High-Impact Conversation Hooks</h3>
            <button onClick={() => copyToClipboard(scriptData.hooks.map((h, i) => `${i + 1}) ${h.fact}\nQ: ${h.question}`).join('\n\n'), 'Hooks')} className="text-[11px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-tight">Copy All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scriptData.hooks.map((hook, i) => (
              <div key={i} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 flex flex-col justify-between hover:border-slate-600/50 transition-colors">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">{hook.headline}</p>
                  <p className="text-[13px] text-slate-200 font-medium leading-relaxed">{hook.fact}</p>
                </div>
                <div className="border-t border-slate-700/50 pt-4 mt-5">
                  <span className="text-[11px] font-bold text-blue-500/80 uppercase block mb-1.5">Value Question</span>
                  <p className="text-[13px] text-white font-bold italic leading-relaxed">"{hook.question}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {length === '60s' && (
        <div className="px-8 pb-10 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-[11px] font-extrabold text-blue-500 uppercase tracking-widest mb-5">3. Objections & Pivots</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/20">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-3 tracking-widest">Price Point</span>
              <p className="text-[12px] text-slate-300 leading-relaxed font-medium italic">{scriptData.pivots.price}</p>
            </div>
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/20">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-3 tracking-widest">Traffic Flow</span>
              <p className="text-[12px] text-slate-300 leading-relaxed font-medium italic">{scriptData.pivots.showings}</p>
            </div>
            <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/20">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-3 tracking-widest">Brokerage Delta</span>
              <p className="text-[12px] text-slate-300 leading-relaxed font-medium italic">{scriptData.pivots.agent}</p>
            </div>
          </div>
        </div>
      )}

      {copied && copied !== 'Script' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-[9999] border border-blue-400">
          {copied} Copied to Clipboard
        </div>
      )}
    </div>
  );
};

export default CallScriptPanel;
