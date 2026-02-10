
import { supabase, supabaseKey } from "../lib/supabase";
import { Lead, Confidence, AgentPerformance, TopAgent, Comp, ZipTopAgent, PreviousAgentPerformance } from "../types";
import sampleLead from "../sampleLead";
import { getZillowLink } from "../utils/formatters";

/**
 * ULTRA-HIGH PERFORMANCE SEARCH
 * Optimized for 10,000,000+ rows using PostgREST.
 */
export const searchSupabaseAddresses = async (query: string) => {
  const cleanQuery = query?.trim();
  if (!cleanQuery || cleanQuery.length < 3) return [];

  const rawParts = cleanQuery.split(',').map(p => p.trim()).filter(p => p.length > 0);
  if (rawParts.length === 0) return [];

  const parts = [...rawParts];
  if (parts.length === 3) {
    const lastPart = parts[2];
    const subParts = lastPart.split(/\s+/);
    if (subParts.length > 1) {
      const potentialZip = subParts[subParts.length - 1];
      if (/^\d+$/.test(potentialZip)) {
        const zip = subParts.pop();
        parts[2] = subParts.join(' '); 
        parts[3] = zip; 
      }
    }
  }

  if (parts[3] && /^\d+$/.test(parts[3])) {
    parts[3] = parts[3].padStart(5, '0');
  }

  try {
    let rpcQuery = supabase
      .from('calling_personalization_expired_data')
      .select('street_address, city, state, zip_code, orig_list_price, list_price, dom, expire_date, property_type, bed, bath, year_built, list_agent_email, list_agent_phone, list_agent_name');

    if (parts[0]) rpcQuery = rpcQuery.ilike('street_address', `${parts[0]}%`);
    if (parts[1]) rpcQuery = rpcQuery.ilike('city', `${parts[1]}%`);
    if (parts[2]) rpcQuery = rpcQuery.ilike('state', `${parts[2]}%`);
    if (parts[3]) rpcQuery = rpcQuery.ilike('zip_code', `${parts[3]}%`);

    const { data, error } = await rpcQuery.limit(10);
    if (error) return [];
    if (!data || data.length === 0) return [];

    return data.map(row => ({
      display: `${row.street_address || ''}, ${row.city || ''}, ${row.state || ''} ${row.zip_code || ''}`.replace(/\s+/g, ' ').trim(),
      street: row.street_address || 'Unknown',
      city: row.city || '',
      state: row.state || '',
      zip: row.zip_code || '',
      fullData: row
    }));
  } catch (err) {
    return [];
  }
};

/**
 * FETCH CMA COMPS
 * Basic retrieval of sold data for comparative analysis.
 */
export const fetchCmaComps = async (zipCode: string, origListPrice: number) => {
  if (!zipCode || !origListPrice) return [];
  const normalizedZip = zipCode.toString().padStart(5, '0');
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('email_listing_service_mlsoldsolddata')
      .select('address, street_address, city, state, zip_code, bed, bath, close_date, current_price, orig_list_price, list_agent_name, list_agent_phone')
      .eq('zip_code', normalizedZip)
      .gte('close_date', oneYearAgoStr)
      .limit(100); 

    if (error || !data) return [];

    return data.map(row => ({
      address: row.address || row.street_address || 'Unknown Address',
      city: row.city || '',
      state: row.state || '',
      beds: Number(row.bed) || 0,
      baths: Number(row.bath) || 0,
      sqft: 0, 
      lotSqft: 0,
      yearBuilt: 0,
      soldDate: row.close_date || "N/A",
      soldPrice: Number(row.current_price) || 0,
      distanceMiles: 0,
      zip: row.zip_code ? row.zip_code.toString().padStart(5, '0') : normalizedZip,
      listAgentName: row.list_agent_name || '',
      listAgentPhone: row.list_agent_phone || ''
    }));
  } catch (err) {
    return [];
  }
};

/**
 * FETCH TOP AGENTS VIA EDGE FUNCTION
 * 
 * New endpoint: top_agents_v_m
 * Authentication: None required.
 */
export const fetchTopAgentsByZip = async (
  zip_code: string, 
  expired_list_agent_name?: string, 
  expired_list_agent_phone?: string
): Promise<ZipTopAgent[]> => {
  if (!zip_code) return [];
  
  try {
    // 🌐 Call unauthenticated Edge Function
    const res = await fetch(
      "https://vdxdmhtkvxhssuhdxkaw.supabase.co/functions/v1/top_agents_v_m",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          zip_code,
          limit: 3,
          offset: 0,
          expired_list_agent_phone: expired_list_agent_phone || null,
          expired_list_agent_name: expired_list_agent_name || null,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Edge Function Response Error [${res.status}]:`, errorText);
      throw new Error(`Edge Function error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    // The response structure contains an "agents" array which is UI compatible
    return (data.agents as ZipTopAgent[]) || [];
  } catch (err: any) {
    console.error("Top Agents Fetch Error:", err);
    throw err;
  }
};

/**
 * FETCH PREVIOUS AGENT PERFORMANCE
 * Calls Supabase RPC: get_previous_agent_performance
 */
export const fetchPreviousAgentPerformance = async (email: string, phone: string, zip: string): Promise<PreviousAgentPerformance | null> => {
  if (!email || !phone || !zip) return null;

  const p_agent_email = email.trim().toLowerCase();
  const p_agent_phone = phone.trim();
  const p_zip = zip.toString().padStart(5, '0');

  try {
    const { data, error } = await supabase.rpc('get_previous_agent_performance', {
      p_agent_email,
      p_agent_phone,
      p_zip
    });

    if (error) {
      console.error("[RPC Error]", error.message);
      return null;
    }

    let rpcRoot = null;
    if (Array.isArray(data) && data.length > 0) {
      rpcRoot = data[0]?.get_previous_agent_performance || data[0];
    } else if (data && typeof data === 'object') {
      rpcRoot = (data as any).get_previous_agent_performance || data;
    }

    if (!rpcRoot || (!rpcRoot.performance && !rpcRoot.nearby_activity)) {
      return null;
    }

    return rpcRoot as PreviousAgentPerformance;
  } catch (err) {
    console.error("Failed to fetch agent performance:", err);
    return null;
  }
};

export const getDefaultLead = (): Lead => transformToLead(sampleLead);

export const transformDbToLead = (row: any): Lead => {
  const origPrice = Number(row.orig_list_price) || 0;
  const listPrice = Number(row.list_price) || 0;
  const dom = Number(row.dom) || 0;
  const priceReduction = origPrice > listPrice ? origPrice - listPrice : 0;
  const priceReductionPct = origPrice > 0 ? (priceReduction / origPrice) * 100 : 0;
  const fullAddress = `${row.street_address || ''}, ${row.city || ''}, ${row.state || ''} ${row.zip_code || ''}`.replace(/\s+/g, ' ').trim();

  return {
    address: fullAddress,
    status: "Expired",
    listDate: "N/A", 
    expiredDate: row.expire_date || "N/A",
    daysOnMarket: dom,
    originalListPrice: origPrice,
    finalListPrice: listPrice,
    priceReductionsCount: priceReduction > 0 ? 1 : 0,
    totalPriceReductionPct: Number(priceReductionPct.toFixed(1)),
    beds: Number(row.bed) || 0,
    baths: Number(row.bath) || 0,
    sqft: 0, 
    lotSqft: 0,
    lotYard: "N/A",
    yearBuilt: Number(row.year_built) || 0,
    propertyType: row.property_type || "Single Family",
    zillowLink: getZillowLink(fullAddress),
    townZips: row.zip_code ? [row.zip_code.toString().padStart(5, '0')] : [],
    agent: sampleLead.agent as any,
    listAgentName: row.list_agent_name || "",
    listAgentEmail: row.list_agent_email || "",
    listAgentPhone: row.list_agent_phone || "",
    topAgents: sampleLead.topAgents as any,
    cma: { comps: [] }, 
    market: {
      ...sampleLead.market,
      medianSoldPriceYoY: (sampleLead.market as any).medianSoldPriceYoYPct || 0
    } as any,
    ownership: {
      purchaseDate: "N/A",
      purchasePrice: 0,
      sellerTenureYears: 0
    }
  } as Lead;
};

export const transformToLead = (source: any): Lead => {
    if (!source) return transformDbToLead({});
    if (source.street_address !== undefined) return transformDbToLead(source);
    const listing = source.listing || {};
    const home = source.home || {};
    const fullAddress = source.address || "Unknown Address";

    return {
        address: fullAddress,
        status: listing.status || "N/A",
        listDate: listing.listDate || "N/A",
        expiredDate: listing.expiredDate || "N/A",
        daysOnMarket: listing.daysOnMarket || 0,
        originalListPrice: listing.originalListPrice || 0,
        finalListPrice: listing.finalListPrice || 0,
        priceReductionsCount: listing.priceReductionsCount || 0,
        totalPriceReductionPct: listing.totalPriceReductionPct || 0,
        beds: home.beds || 0,
        baths: home.baths || 0,
        sqft: home.sqft || 0,
        lotSqft: home.lotSqft || 0,
        lotYard: home.lotSqft ? `${(home.lotSqft / 43560).toFixed(2)} Acres` : "N/A",
        yearBuilt: home.yearBuilt || 0,
        propertyType: home.propertyType || "Single Family",
        zillowLink: getZillowLink(fullAddress),
        townZips: source.townZips || [],
        agent: source.agent as any,
        listAgentName: source.listAgentName || "",
        listAgentEmail: source.listAgentEmail || "",
        listAgentPhone: source.listAgentPhone || "",
        topAgents: source.topAgents as any,
        cma: source.cma as any,
        market: {
            ...(source.market || {}),
            medianSoldPriceYoY: (source.market as any)?.medianSoldPriceYoYPct || 0
        } as any,
        ownership: source.ownership,
        seller: source.seller
    } as Lead;
};
