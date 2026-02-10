
import React, { useState, useEffect, useRef } from 'react';
import { getDefaultLead, searchSupabaseAddresses, transformDbToLead, fetchCmaComps } from './data/dataProvider';
import { supabase } from './lib/supabase';
import { Lead, Confidence } from './types';
import SummaryPanel from './components/SummaryPanel';
import KeyTalkingPointsPanel from './components/KeyTalkingPointsPanel';
import CallScriptPanel from './components/CallScriptPanel';
import AgentPanel from './components/AgentPanel';
import CMAPanel from './components/CMAPanel';
import ExternalPage from './components/ExternalPage';
import { formatDateDisplay } from './utils/formatters';

interface Suggestion {
  display: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  fullData?: any;
}

const App: React.FC = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [outreachMode, setOutreachMode] = useState<'script' | 'preview'>('script');
  const [view, setView] = useState<'welcome' | 'dashboard'>('welcome');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const welcomeSearchRef = useRef<HTMLDivElement>(null);

  const LOGO_PNG = "https://www.nextburb.com/static/images/logo.png";

  const handleLogoClick = () => {
    if (view === 'welcome') {
      window.location.reload();
    } else {
      setView('welcome');
      setSearch('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (welcomeSearchRef.current && !welcomeSearchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const term = search.trim();
    
    if (!term || term.length < 3 || (lead && term === lead.address.trim())) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHasError(false);
      return;
    }

    const termParts = term.split(',').map(p => p.trim());
    const isExactMatch = lead && termParts[0] === lead.address.split(',')[0].trim();
    if (isExactMatch) return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setHasError(false);
      try {
        const results = await searchSupabaseAddresses(term);
        setSuggestions(results);
        setSelectedIndex(0);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Search failed:", err);
        setHasError(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, lead]);

  const handleSelection = async (s: Suggestion) => {
    if (!s) return;
    setSearch(s.display);
    setShowSuggestions(false);
    if (s.fullData) {
      const initialLead = transformDbToLead(s.fullData);
      setLead(initialLead);
      setActiveTab('Home');
      setView('dashboard');

      try {
        const comps = await fetchCmaComps(initialLead.townZips[0], initialLead.originalListPrice);
        if (comps && comps.length > 0) {
          setLead(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              cma: { comps }
            };
          });
        }
      } catch (err) {
        console.error("Failed to load CMA data:", err);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const addressParam = params.get('address');
    
    const performDeepLinkSearch = async (query: string) => {
      setIsSearching(true);
      try {
        const results = await searchSupabaseAddresses(query);
        if (results && results.length > 0) {
          handleSelection(results[0]);
        }
      } catch (err) {
        console.error("Deep link search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const initDeepLink = async () => {
      if (idParam) {
        setIsSearching(true);
        try {
          let query = supabase
            .from('calling_personalization_expired_data')
            .select('street_address, city, state, zip_code');
          
          const isOE = idParam.endsWith('OE');
          const isDE = idParam.endsWith('DE');

          if (isOE || isDE) {
            const tableIdPortion = idParam.slice(0, -2);
            const resolvedType = isOE ? 'old_expired' : 'daily_expired';
            query = query.eq('table_id', tableIdPortion).eq('expired_type', resolvedType);
          } else {
            query = query.eq('id', idParam);
          }

          const { data, error } = await query.maybeSingle();
          
          if (data && !error) {
            const resolvedAddress = `${data.street_address || ''}, ${data.city || ''}, ${data.state || ''} ${data.zip_code || ''}`.replace(/\s+/g, ' ').trim();
            if (resolvedAddress.length >= 3) {
              await performDeepLinkSearch(resolvedAddress);
            }
          }
        } catch (err) {
          console.error("Error resolving ID deep link:", err);
        } finally {
          setIsSearching(false);
        }
      } else if (addressParam) {
        const decodedAddress = decodeURIComponent(addressParam).trim();
        if (decodedAddress.length >= 3) {
          await performDeepLinkSearch(decodedAddress);
        }
      }
    };

    initDeepLink();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || (suggestions.length === 0 && !isSearching)) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) handleSelection(suggestions[selectedIndex]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const renderSearchBar = (containerRef: React.RefObject<HTMLDivElement | null>, inputClass: string) => (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group">
        <input 
          className={inputClass} 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          onFocus={() => { if (search.length >= 3) setShowSuggestions(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Enter an address (e.g. 8188 Lone Oak...)" 
          autoComplete="off"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
             <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {showSuggestions && (suggestions.length > 0 || isSearching || hasError || search.trim().length >= 3) && (
        <div className="absolute top-[110%] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[120] animate-in fade-in zoom-in-95 duration-200">
          {isSearching && suggestions.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              <p className="animate-pulse uppercase font-bold tracking-widest text-[11px] text-blue-600 italic">Scanning 1M+ Records...</p>
            </div>
          )}
          {suggestions.map((s, idx) => (
            <button 
              key={idx} 
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelection(s); }}
              className={`w-full text-left px-5 py-4 text-sm transition-colors border-b border-slate-50 last:border-b-0 ${selectedIndex === idx ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <span className="font-semibold">{s.display}</span>
            </button>
          ))}
          {!isSearching && suggestions.length === 0 && !hasError && search.trim().length >= 3 && (
             <div className="px-5 py-10 text-center space-y-4">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="font-semibold text-slate-600 text-sm mb-1 text-center">No matches found.</p>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 text-center">Search Strategy:</p>
                <ul className="text-left mt-3 space-y-2 max-w-xs mx-auto">
                  <li className="text-[11px] font-medium text-slate-500 flex gap-2">
                    <span className="text-blue-500 font-bold">1.</span>
                    <span>Start with <strong>House Number</strong> (e.g., "8188").</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden">
        <header className="w-full pt-8 pb-4 md:pt-10 md:pb-6 px-6 md:px-12 lg:absolute lg:top-0 lg:left-0 lg:w-auto z-[150]">
          <div className="flex flex-col items-center lg:items-start space-y-1 md:space-y-2">
            <button 
              onClick={handleLogoClick} 
              className="hover:opacity-80 transition-opacity focus:outline-none shrink-0 cursor-pointer"
              aria-label="Reload application"
            >
              <img 
                src={LOGO_PNG} 
                alt="Nextburb Logo" 
                className="h-10 md:h-12 lg:h-14 w-auto object-contain transition-all duration-300" 
              />
            </button>
            <p className="text-[7px] md:text-[8px] font-bold text-blue-600/70 uppercase tracking-[0.3em] text-center lg:text-left">
              Data-Driven Real Estate Intelligence
            </p>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto space-y-12 lg:pt-32">
          <div className="space-y-10 w-full flex flex-col items-center">
            <div className="relative animate-in zoom-in fade-in duration-700">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full shadow-2xl shadow-slate-200/50 flex items-center justify-center border border-slate-100/50 group hover:scale-105 transition-transform duration-500">
                <svg className="w-10 h-10 md:w-14 md:h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-ping" style={{ animationDuration: '4s' }}></div>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl font-medium text-slate-500 max-w-3xl mx-auto leading-relaxed animate-in fade-in duration-700 fill-mode-both ease-out">
              Analyze expired listings. Get AI-driven insights and data-backed call scripts to turn expired leads into your next listing.
            </p>
          </div>

          <div className="w-full max-w-2xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500 fill-mode-both">
            {renderSearchBar(welcomeSearchRef, "w-full pl-12 pr-12 py-6 bg-white border-2 border-slate-200 rounded-[2rem] focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-900 font-semibold text-lg placeholder:text-slate-400 shadow-2xl shadow-slate-200/50")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-8 animate-in fade-in duration-1000 delay-700 fill-mode-both">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm">01</div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Search & Identify</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Enter any address from your target expired list to access deep market data and ownership history.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm">02</div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Nextburb AI</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Our Nextburb AI generates 3 tailored talking points to help you sound like the local expert immediately.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm">03</div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs">Data-Backed Scripts</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-medium">Access performance-tested call scripts that pivot based on the seller's specific market metrics and friction points.</p>
            </div>
          </div>
          
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.3em] pt-8 animate-pulse">
            Start typing an address to begin
          </p>
        </main>
      </div>
    );
  }

  if (!lead) return null;

  const expiredDateValue = new Date(lead.expiredDate);
  const isValidDate = !isNaN(expiredDateValue.getTime());
  const daysSinceExpiredValue = isValidDate 
    ? Math.floor((new Date().getTime() - expiredDateValue.getTime()) / (1000 * 3600 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-[100] bg-white border-b border-slate-200 shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={handleLogoClick} 
              className="shrink-0 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
              aria-label="Back to welcome screen"
            >
              <img src={LOGO_PNG} alt="Nextburb Logo" className="h-7 md:h-8 w-auto object-contain" />
            </button>
            <div className="flex-1 max-w-md">
              {renderSearchBar(searchRef, "w-full pl-10 pr-12 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-slate-900 font-semibold text-sm placeholder:text-slate-400")}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <span className="bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-red-100 uppercase tracking-wide">Expired</span>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 uppercase tracking-wide">{Math.abs(daysSinceExpiredValue)}d Since</span>
            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 uppercase tracking-wide">{(lead.daysOnMarket || 0)}d DOM</span>
            <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-blue-100 uppercase tracking-wide">${(lead.finalListPrice || 0).toLocaleString()} Final</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <a href={lead.zillowLink} target="_blank" rel="noopener noreferrer" className="group block w-fit">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                {lead.address.split(',')[0]}
              </h1>
            </a>
            <a href={lead.zillowLink} target="_blank" rel="noopener noreferrer" className="group block w-fit">
              <p className="text-sm font-medium text-slate-500 group-hover:text-blue-500 transition-colors">{lead.address}</p>
            </a>
          </div>

          <div className="pt-2">
            <a 
              href={`https://data.nextburb.com/agent/agent-match/#/agent/agent-match/Find_Agents?zip=${lead.townZips[0] || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-[0.1em] rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View Top Agents for {lead.address.split(',')[0]}
            </a>
          </div>
        </div>

        <nav className="flex gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {['Home', 'Agent', 'CMA', 'Outreach'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-6 py-4 text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab !== 'Outreach' && activeTab !== 'Agent' && <KeyTalkingPointsPanel lead={lead} />}

        <div className="min-h-[500px]">
          {activeTab === 'Home' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8 pb-12">
              <SummaryPanel 
                title="Property" 
                confidence={Confidence.HIGH} 
                bullets={[
                  `${lead.propertyType || 'Single Family'} • ${lead.beds || 0}bd/${lead.baths || 0}ba`, 
                  `Pricing: $${(lead.originalListPrice || 0).toLocaleString()} → $${(lead.finalListPrice || 0).toLocaleString()} (${lead.totalPriceReductionPct || 0}% cut)`, 
                  `Timeline: Expired after ${lead.daysOnMarket || 0} days on market.`
                ]} 
                badge={`Status: Expired`} 
                onCopy={() => {}} 
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Structural Details">
                  <DetailItem label="Property Type" value={lead.propertyType || 'Single Family'} />
                  <DetailItem label="Year Built" value={lead.yearBuilt || 0} />
                  <DetailItem label="Beds / Baths" value={`${lead.beds || 0} / ${lead.baths || 0}`} />
                  <DetailItem label="Lot Size" value={lead.lotYard || 'N/A'} />
                  <a href={lead.zillowLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-bold mt-2 flex items-center gap-1">
                    View on Zillow 
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </Card>
                <Card title="Pricing Summary">
                  <DetailItem label="Original List" value={`$${(lead.originalListPrice || 0).toLocaleString()}`} />
                  <DetailItem label="Final List" value={`$${(lead.finalListPrice || 0).toLocaleString()}`} highlight />
                  <DetailItem label="Total Price Cut" value={`${lead.totalPriceReductionPct || 0}%`} highlight />
                </Card>
                <Card title="Timeline">
                  <DetailItem label="Expired Date" value={formatDateDisplay(lead.expiredDate)} highlight />
                  <DetailItem label="Days on Market" value={`${(lead.daysOnMarket || 0)} days`} highlight />
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'Agent' && <AgentPanel lead={lead} />}
          {activeTab === 'CMA' && <CMAPanel lead={lead} />}
          {activeTab === 'Outreach' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
                <div className="flex gap-1 flex-1">
                  <button 
                    onClick={() => setOutreachMode('script')}
                    className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${outreachMode === 'script' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    Internal Call Script
                  </button>
                  <button 
                    onClick={() => setOutreachMode('preview')}
                    className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${outreachMode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    Seller Page Preview
                  </button>
                </div>
              </div>

              {outreachMode === 'script' ? (
                <CallScriptPanel lead={lead} />
              ) : (
                <div className="bg-white rounded-[2.5rem] border-[10px] border-slate-200 shadow-2xl overflow-hidden max-h-[850px] overflow-y-auto no-scrollbar relative group">
                  <div className="absolute top-0 left-0 right-0 bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between sticky z-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="bg-white px-5 py-1.5 rounded-full text-[11px] font-bold text-slate-400 border border-slate-200">
                      nextburb.com/reports/{lead.address.replace(/\s+/g, '-').replace(/,/g, '').toLowerCase()}
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`https://nextburb.com/reports/${lead.address.replace(/\s+/g, '-').replace(/,/g, '').toLowerCase()}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-200"
                    >
                      Copy Link
                    </button>
                  </div>
                  <div className="p-10 bg-white">
                    <ExternalPage lead={lead} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">{title}</h3></div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const DetailItem: React.FC<{ label: string; value: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-slate-500 font-semibold leading-tight">{label}</span>
    <span className={`font-bold ml-4 text-right ${highlight ? 'text-blue-600 text-sm' : 'text-slate-900'}`}>{value}</span>
  </div>
);

export default App;
