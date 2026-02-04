
export interface NearbyTransaction {
  address: string;
  soldDate: string;
  soldPrice: number;
  distanceMiles: number;
  agentName: string;
  brokerage?: string;
  status?: string;
}

export interface PreviousAgentPerformance {
  performance: {
    avg_dom_agent: number;
    avg_dom_zip: number;
    price_reduction_pct_agent: number;
    price_reduction_pct_zip: number;
    agent_txn_12mo_zip: number;
    agent_txn_12mo_total: number;
  };
  nearby_activity: Array<{
    address: string;
    sold_date: string;
    sold_price: number;
  }>;
}

export interface AgentPerformance {
  name: string;
  brokerage: string;
  zipTransactionsLast12Mo: number;
  totalTransactionsLast12Mo: number;
  overAskCount: number;
  underAskCount: number;
  avgDomAgent: number;
  avgDomZip: number;
  priceReductionPctAgent: number;
  priceReductionPctZip: number;
  listToSaleRatio?: number;
  zillowRating?: number;
  zillowReviewCount?: number;
  yearsExperience?: number;
  languages?: string[];
  nearbyTransactions?: NearbyTransaction[];
  zillowProfileUrl?: string;
  closestTransactions: {
    address: string;
    soldDate: string;
    soldPrice: number;
    distanceMiles: number;
  }[];
  recentSimilarSales?: {
    address: string;
    soldDate: string;
    soldPrice: number;
    distanceMiles: number;
    beds: number;
    baths: number;
    sqft: number;
  }[];
}

export interface ZipTopAgent {
  agent_name: string;
  agent_phone: string;
  agent_email: string;
  zip_code: string;
  sell_transactions_last_1yr: number;
  sell_transactions_last_3yr: number;
  seller_transactions_last_1yr_zipcode: number;
  seller_transactions_last_3yr_zipcode: number;
  avg_property_price_seller: number;
  median_dom_last_3yr_seller: number;
  top_producer: boolean;
  fast_seller: boolean;
}

export interface TopAgent {
  name: string;
  brokerage: string;
  townZipsTxLast12Mo: number;
  avgDom: number;
  listToSaleRatio: number;
  overAskPct: number;
  zipTransactionsLast12Mo: number;
  totalTransactionsLast12Mo: number;
  zillowRating?: number;
  zillowReviewCount?: number;
  yearsExperience?: number;
  languages?: string[];
}

export interface Comp {
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  soldDate: string;
  soldPrice: number;
  town?: string;
  city?: string;
  state?: string;
  zip?: string;
  highSchool?: string;
  distanceMiles?: number;
  listAgentName?: string;
  listAgentPhone?: string;
}

export interface MarketMetrics {
  medianSoldPrice: number;
  medianSoldPriceYoY: number;
  medianDom: number;
  inventoryActive: number;
  priceReductionsPct: number;
  listToSaleRatio: number;
  soldLast12Mo?: number;
  similarSoldLast12Mo?: number;
  similarDefinition?: string;
  bestMonthToSell?: string;
  bestMonthConfidence?: 'High' | 'Medium' | 'Low';
  bestMonthSampleSize?: number;
  bestMonthEvidenceCount?: number;
  lastUpdated?: string;
  closedSalesByMonth?: { month: string; count: number }[];
  medianDomByMonth?: { month: string; medianDom: number }[];
  trends?: {
    months: string[];
    saleToListRatio?: number[];
    medianDom?: number[];
    closedCount?: number[];
    monthly?: Array<{
      month: string;
      closedCount?: number;
      medianDom?: number;
    }>;
  };
  compare?: {
    marketSoldMedian?: number;
    marketActiveMedian?: number;
    avgSoldDom?: number;
    subjectListPrice?: number;
    subjectDom?: number;
    subjectPricePerSqft?: number;
    zipAvgPricePerSqft?: number;
  };
  zipIntel?: {
    zip?: string;
    appreciation3yrPct?: number;
    soldOverAskPct?: number;
    avgPriceDrops?: number;
    soldNearListPct?: number;
    totalExpired3yr?: number;
  };
  seasonalDemand?: {
    months: string[];
    demandIndex: number[];
    peakMonth?: string;
    listedMonth?: string;
    insight?: string;
  };
  pricePerSqftTrend?: {
    years: string[];
    zipAvg: number[];
    subject?: number[];
  };
  compsActivity?: {
    recentSalesCount?: number;
    activeListingsCount?: number;
    rows: {
      status: "Sold" | "Active" | "Expired";
      address: string;
      price: number;
      sqft?: number;
      pricePerSqft?: number;
      dom?: number;
      lat?: number;
      lng?: number;
    }[];
  };
}

export interface PriceCutEvent {
  date: string;
  newPrice: number;
}

export interface ListingAttempt {
  attemptId: string;
  listDate: string;
  endDate: string;
  status: string;
  daysOnMarket: number;
  originalListPrice: number;
  finalListPrice: number;
  priceReductionsCount: number;
  totalPriceReductionPct: number;
  priceCutEvents?: PriceCutEvent[];
}

export interface Lead {
  address: string;
  status: string;
  listDate: string;
  expiredDate: string;
  daysOnMarket: number;
  originalListPrice: number;
  finalListPrice: number;
  priceReductionsCount: number;
  totalPriceReductionPct: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft: number; 
  lotYard: string;
  yearBuilt: number;
  propertyType: string;
  zillowLink: string;
  townZips: string[];
  school?: { 
    highSchool: string;
    district: string;
  };
  agent: AgentPerformance;
  listAgentName?: string;
  listAgentEmail?: string;
  listAgentPhone?: string;
  topAgents: TopAgent[];
  cma: {
    comps: Comp[];
  };
  market: MarketMetrics;
  listingHistory?: {
    currentAttempt?: ListingAttempt;
    attemptsLast3Years: ListingAttempt[];
    summary: {
      attemptsCountLast3Years: number;
      totalDomLast3Years: number;
      avgDomPerAttempt: number;
      totalPriceReductionsLast3Years: number;
      maxPriceReductionPctSingleAttempt: number;
    };
  };
  ownership?: {
    purchaseDate: string;
    purchasePrice: number;
    sellerTenureYears: number;
  };
  occupancyStatus?: string;
  equityPct?: number;
  seller?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
}

export enum Confidence {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}
