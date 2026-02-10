
import React, { useEffect, useState } from 'react';
import { Lead, ZipTopAgent, PreviousAgentPerformance } from '../types';
import { formatDateDisplay, getZillowLink } from '../utils/formatters';
import { fetchTopAgentsByZip, fetchPreviousAgentPerformance } from '../data/dataProvider';
import { GoogleGenAI, Type } from "@google/genai";

interface AgentPanelProps {
  lead: Lead;
}

const AgentPanel: React.FC<AgentPanelProps> = ({ lead }) => {
  const [zipTopAgents, setZipTopAgents] = useState<ZipTopAgent[]>([]);
  const [prevPerformance, setPrevPerformance] = useState<PreviousAgentPerformance | null>(null);
  const [isLoadingTop, setIsLoadingTop] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [topLoadError, setTopLoadError] = useState<string | null>(null);
  const [prevLoadError, setPrevLoadError] = useState<string | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Agent Insights State
  const [agentInsights, setAgentInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsStatus, setInsightsStatus] = useState<string | null>(null);

  const loadTopAgents = async () => {
    if (lead.townZips && lead.townZips[0]) {
      setIsLoadingTop(true);
      setTopLoadError(null);
      try {
        const results = await fetchTopAgentsByZip(
          lead.townZips[0],
          lead.listAgentName,
          lead.listAgentPhone
        );
        setZipTopAgents(results);
      } catch (err: any) {
        console.error("Failed to load zip top agents:", err);
        setTopLoadError("Local rankings calculation timed out.");
      } finally {
        setIsLoadingTop(false);
      }
    }
  };

  const loadPrevPerformance = async () => {
    const email = lead.listAgentEmail;
    const phone = lead.listAgentPhone;
    const zip = lead.townZips && lead.townZips[0];

    if (!email || !phone || !zip) {
      setPrevPerformance(null);
      return;
    }

    setIsLoadingPrev(true);
    setPrevLoadError(null);
    
    try {
      const result = await fetchPreviousAgentPerformance(email, phone, zip);
      setPrevPerformance(result);
    } catch (err: any) {
      console.error("Failed to load previous agent performance:", err);
      setPrevLoadError("Analysis temporarily unavailable.");
    } finally {
      setIsLoadingPrev(false);
    }
  };

  // Generate Agent Insights via Gemini or Fallback
  const generateAgentInsights = async () => {
    if (!prevPerformance || zipTopAgents.length === 0) return;

    setIsLoadingInsights(true);
    setInsightsStatus(null);

    // Code-based Fallback Logic
    const generateFallback = () => {
      const insights = [];
      const perf = prevPerformance.performance;
      const topAgent = zipTopAgents[0];

      // Insight 1: DOM Analysis
      if (perf.avg_dom_agent > perf.avg_dom_zip) {
        insights.push(`The previous agent's average DOM of ${Math.round(perf.avg_dom_agent)} days is ${Math.round((perf.avg_dom_agent/perf.avg_dom_zip - 1) * 100)}% slower than the ZIP median.`);
      } else {
        insights.push(`The listing agent maintains a competitive speed profile in this ZIP, suggesting the expiry was likely due to specific property friction rather than general pace.`);
      }

      // Insight 2: Pricing Strategy
      if (perf.price_reduction_pct_agent > perf.price_reduction_pct_zip) {
        insights.push(`High price adjustment frequency (${Math.round(perf.price_reduction_pct_agent)}%) indicates a consistent pattern of initial overvaluation in ${lead.townZips[0]}.`);
      } else {
        insights.push(`The previous agent's pricing adjustments align with market norms, pointing toward a need for better digital presentation or buyer outreach.`);
      }

      // Insight 3: Competitive Benchmark
      if (topAgent) {
        insights.push(`Local market leaders like ${topAgent.agent_name} close properties in this area with a median DOM of ${topAgent.median_dom_last_3yr_seller} days—nearly ${Math.abs(Math.round(perf.avg_dom_agent - topAgent.median_dom_last_3yr_seller))} days faster than the current experience.`);
      }

      return insights;
    };

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a real estate performance analyst. Generate 3 professional insights comparing the listing agent's performance to the ZIP code leaders.
      
      Agent Name: ${lead.listAgentName || 'Unknown'}
      Agent Stats: Avg DOM: ${prevPerformance.performance.avg_dom_agent}, Market DOM: ${prevPerformance.performance.avg_dom_zip}, Price Reductions: ${prevPerformance.performance.price_reduction_pct_agent}%.
      Local Leaders: ${zipTopAgents.slice(0, 2).map(a => `${a.agent_name} (DOM: ${a.median_dom_last_3yr_seller})`).join(', ')}.
      Property: ${lead.address} (${lead.propertyType}).
      
      Strict Requirements:
      - Strictly 3 concise sentences.
      - Focused on data-driven performance deltas.
      - Return JSON format: {"insights": ["string", "string", "string"]}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["insights"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setAgentInsights(data.insights || generateFallback());
    } catch (error: any) {
      console.error("[Agent Insights AI Error]", error);
      setAgentInsights(generateFallback());
      setInsightsStatus("Providing data-derived performance summary.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    setShowAllActivity(false);
    loadTopAgents();
    loadPrevPerformance();
  }, [lead.townZips, lead.listAgentEmail, lead.listAgentPhone, lead.listAgentName]);

  // Trigger insights once data is available
  useEffect(() => {
    if (prevPerformance && zipTopAgents.length > 0) {
      generateAgentInsights();
    }
  }, [prevPerformance, zipTopAgents]);

  const sortedActivity = prevPerformance?.nearby_activity 
    ? [...prevPerformance.nearby_activity].sort((a, b) => new Date(b.sold_date).getTime() - new Date(a.sold_date).getTime())
    : [];

  const displayedActivity = showAllActivity ? sortedActivity : sortedActivity.slice(0, 10);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8 pb-16">
      
      {/* 0. Agent Insights AI Section (Replaces the global one for this tab) */}
      {(isLoadingInsights || agentInsights.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 p-1.5 rounded-lg">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-[13px] uppercase tracking-wide">Agent Insights</h3>
            </div>
            {insightsStatus && (
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{insightsStatus}</span>
            )}
            {isLoadingInsights && (
              <span className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 uppercase animate-pulse">
                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                Analyzing Agent Data...
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoadingInsights ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <span className="shrink-0 w-1 h-12 bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                  </div>
                </div>
              ))
            ) : (
              agentInsights.map((insight, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <span className="shrink-0 w-1 h-auto bg-indigo-500 rounded-full transition-all group-hover:scale-y-110" />
                  <p className="text-[13px] text-slate-600 leading-relaxed font-semibold">{insight}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 1. Previous Agent Performance Summary Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              {lead.listAgentName ? (
                <>
                  Previous Agent Performance Summary: <span className="text-blue-600">{lead.listAgentName}</span>
                </>
              ) : (
                'Previous Agent Performance Summary'
              )}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Benchmarked against ZIP Code {lead.townZips[0]}</p>
          </div>
        </div>

        {isLoadingPrev ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Scanning Listing Agent History...</p>
          </div>
        ) : prevLoadError ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-10 text-center">
            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[13px] font-bold text-slate-500">{prevLoadError}</p>
          </div>
        ) : prevPerformance && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Avg Days on Market</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-900">{Math.round(prevPerformance.performance.avg_dom_agent)}d</p>
                  <p className="text-xs font-bold text-slate-400">vs {Math.round(prevPerformance.performance.avg_dom_zip)}d ZIP Avg</p>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${prevPerformance.performance.avg_dom_agent <= prevPerformance.performance.avg_dom_zip ? 'bg-emerald-500' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, (prevPerformance.performance.avg_dom_agent / (prevPerformance.performance.avg_dom_zip || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Price Reduction Frequency</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-900">{Math.round(prevPerformance.performance.price_reduction_pct_agent)}%</p>
                  <p className="text-xs font-bold text-slate-400">vs {Math.round(prevPerformance.performance.price_reduction_pct_zip)}% ZIP Avg</p>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${prevPerformance.performance.price_reduction_pct_agent <= prevPerformance.performance.price_reduction_pct_zip ? 'bg-emerald-500' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, (prevPerformance.performance.price_reduction_pct_agent / (prevPerformance.performance.price_reduction_pct_zip || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">ZIP Transactions (12mo)</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-blue-600">{prevPerformance.performance.agent_txn_12mo_zip}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tight">Verified local listings closed</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">12 Month Transactions</p>
                <p className="text-3xl font-black text-slate-900">{prevPerformance.performance.agent_txn_12mo_total}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tight">Total transactions (All ZIPs)</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest ml-1">Previous Agent Last 12 Months Activity</h4>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[9px] tracking-[0.2em]">Address</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[9px] tracking-[0.2em]">Sold Date</th>
                        <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[9px] tracking-[0.2em] text-right">Sold Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {displayedActivity.length > 0 ? (
                        displayedActivity.map((activity, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              <a href={getZillowLink(activity.address)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-all">
                                {activity.address}
                              </a>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{formatDateDisplay(activity.sold_date)}</td>
                            <td className="px-6 py-4 font-bold text-slate-900 text-right">${(activity.sold_price || 0).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">No recent activity found for this agent in this ZIP.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {!showAllActivity && sortedActivity.length > 10 && (
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                    <button 
                      onClick={() => setShowAllActivity(true)}
                      className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-[0.2em] transition-all"
                    >
                      Load {sortedActivity.length - 10} More Properties
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Performing Agents Section */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-md overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Nextburb Partner Shortlist</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Top 3 Performing Agents</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {topLoadError && (
              <button 
                onClick={() => loadTopAgents()}
                className="text-[10px] font-black text-blue-600 hover:text-blue-700 underline uppercase tracking-widest"
              >
                Retry Search
              </button>
            )}
            <span className="inline-flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 self-start sm:self-center">
              Verified local experts in {lead.townZips[0]}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 font-extrabold text-slate-500 uppercase text-[9px] tracking-[0.2em]">Agent Identity</th>
                <th className="px-8 py-5 font-extrabold text-slate-500 uppercase text-[9px] tracking-[0.2em] text-center">{lead.townZips[0]} Transactions</th>
                <th className="px-8 py-5 font-extrabold text-slate-500 uppercase text-[9px] tracking-[0.2em] text-center">Transactions (1Y/3Y)</th>
                <th className="px-8 py-5 font-extrabold text-slate-500 uppercase text-[9px] tracking-[0.2em] text-right">Avg Sold Price</th>
                <th className="px-8 py-5 font-extrabold text-slate-500 uppercase text-[9px] tracking-[0.2em] text-center">Median DOM</th>
                <th className="px-8 py-5 font-extrabold text-slate-500 uppercase text-[9px] tracking-[0.2em] text-right">Market Stats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingTop ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ranking Local Leaders...</span>
                    </div>
                  </td>
                </tr>
              ) : topLoadError ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                      <div className="bg-red-50 p-3 rounded-full mb-2">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-bold text-slate-600">{topLoadError}</span>
                      <button 
                        onClick={() => loadTopAgents()}
                        className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                      >
                        Retry Search
                      </button>
                    </div>
                  </td>
                </tr>
              ) : zipTopAgents.length > 0 ? zipTopAgents.map((ta, idx) => (
                <tr key={idx} className={`hover:bg-blue-50/30 transition-colors group ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                  <td className="px-8 py-7">
                    <div className="font-black text-slate-900 text-[15px] tracking-tight">{ta.agent_name}</div>
                    <div className="mt-1.5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <svg className="w-3 h-3 opacity-40" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                        <span className="text-[11px] font-bold">{ta.agent_phone || 'Contact Private'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <svg className="w-3 h-3 opacity-40" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                        <span className="text-[11px] font-medium truncate max-w-[180px]">{ta.agent_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <div className="font-black text-blue-600 text-lg leading-none">
                      {ta.seller_transactions_last_1yr_zipcode || 0} <span className="text-slate-300 text-sm font-bold mx-0.5">/</span> {ta.seller_transactions_last_3yr_zipcode || 0}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      {lead.townZips[0]} transactions (1yr / 3yr)
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <div className="font-black text-slate-900 text-lg leading-none">{ta.sell_transactions_last_1yr} <span className="text-slate-300 text-sm font-bold mx-0.5">/</span> {ta.sell_transactions_last_3yr}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Closed Sales last 1Y / 3Y</div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="font-black text-slate-900 text-lg leading-none">${(ta.avg_property_price_seller || 0).toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Average Closing Result</div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <div className={`font-black text-lg leading-none ${ta.median_dom_last_3yr_seller < 20 ? 'text-green-600' : 'text-slate-900'}`}>
                      {ta.median_dom_last_3yr_seller} <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Typical Seller Cycle</div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col items-end gap-2">
                      {ta.top_producer && (
                        <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded shadow-md shadow-blue-100 uppercase tracking-widest">
                          Top Producer
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic font-medium">No partner agents currently listed for this ZIP code.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentPanel;
