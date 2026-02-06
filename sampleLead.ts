
const sampleLead = {
  address: "123 Maple St, Lexington, MA 02420",
  town: "Lexington",
  townZips: ["02420", "02421"],
  listing: {
    status: "Expired",
    daysOnMarket: 63,
    expiredDate: "2025-12-10",
    listDate: "2025-10-08",
    finalListPrice: 1199000,
    originalListPrice: 1299000,
    priceReductionsCount: 2,
    totalPriceReductionPct: 7.7,
    zillowUrl: "https://www.zillow.com/"
  },
  listingHistory: {
    currentAttempt: {
      attemptId: "A3",
      listDate: "2025-10-08",
      endDate: "2025-12-10",
      status: "Expired",
      daysOnMarket: 63,
      originalListPrice: 1299000,
      finalListPrice: 1199000,
      priceReductionsCount: 2,
      totalPriceReductionPct: 7.7,
      priceCutEvents: [
        { date: "2025-11-01", newPrice: 1249000 },
        { date: "2025-11-20", newPrice: 1199000 }
      ]
    },
    attemptsLast3Years: [
      {
        attemptId: "A1",
        listDate: "2023-09-15",
        endDate: "2023-11-20",
        status: "Withdrawn",
        daysOnMarket: 66,
        originalListPrice: 1149000,
        finalListPrice: 1125000,
        priceReductionsCount: 1,
        totalPriceReductionPct: 2.1
      },
      {
        attemptId: "A2",
        listDate: "2024-06-05",
        endDate: "2024-08-01",
        status: "Expired",
        daysOnMarket: 57,
        originalListPrice: 1249000,
        finalListPrice: 1225000,
        priceReductionsCount: 1,
        totalPriceReductionPct: 1.9
      },
      {
        attemptId: "A3",
        listDate: "2025-10-08",
        endDate: "2025-12-10",
        status: "Expired",
        daysOnMarket: 63,
        originalListPrice: 1299000,
        finalListPrice: 1199000,
        priceReductionsCount: 2,
        totalPriceReductionPct: 7.7
      }
    ],
    summary: {
      attemptsCountLast3Years: 3,
      totalDomLast3Years: 186,
      avgDomPerAttempt: 62,
      totalPriceReductionsLast3Years: 4,
      maxPriceReductionPctSingleAttempt: 7.7
    }
  },
  ownership: {
    purchaseDate: "2016-05-18",
    purchasePrice: 785000,
    sellerTenureYears: 9.6
  },
  home: {
    beds: 4,
    baths: 3,
    sqft: 2450,
    lotSqft: 9100,
    yearBuilt: 1978,
    occupancyStatus: "Owner Occupied",
    equityPct: 32,
    propertyType: "Single Family"
  },
  school: {
    highSchool: "Lexington High School",
    district: "Lexington Public Schools"
  },
  seller: {
    firstName: "Priya",
    lastName: "S.",
    phone: "+1-617-555-0199",
    email: "priya@example.com"
  },
  agent: {
    name: "Jordan Lee",
    brokerage: "Example Realty",
    zipTransactionsLast12Mo: 12,
    totalTransactionsLast12Mo: 34,
    overAskCount: 7,
    underAskCount: 5,
    avgDomAgent: 24,
    avgDomZip: 18,
    priceReductionPctAgent: 38,
    priceReductionPctZip: 22,
    listToSaleRatio: 0.97,
    zillowRating: 4.2,
    zillowReviewCount: 15,
    yearsExperience: 8,
    languages: ["English"],
    zillowProfileUrl: "https://www.zillow.com/profile/jordan-lee",
    nearbyTransactions: [
      { address: "42 Meriam St", soldDate: "2025-01-15", soldPrice: 1350000, distanceMiles: 0.2, agentName: "Sarah Miller", brokerage: "Coldwell Banker" },
      { address: "88 Hancock St", soldDate: "2024-11-20", soldPrice: 1125000, distanceMiles: 0.4, agentName: "James Wilson", brokerage: "RE/MAX" },
      { address: "15 Grant St", soldDate: "2024-12-05", soldPrice: 1480000, distanceMiles: 0.7, agentName: "Linda Chen", brokerage: "Gibson Sotheby's" },
      { address: "202 Bedford St", soldDate: "2025-02-10", soldPrice: 995000, distanceMiles: 1.1, agentName: "Robert Taylor", brokerage: "William Raveis" },
      { address: "55 Woburn St", soldDate: "2024-10-18", soldPrice: 1260000, distanceMiles: 1.5, agentName: "Emily Davis", brokerage: "Compass" },
      { address: "12 Waltham St", soldDate: "2024-09-30", soldPrice: 1550000, distanceMiles: 2.3, agentName: "Michael Brown", brokerage: "Coldwell Banker" },
      { address: "333 Lowell St", soldDate: "2024-08-12", soldPrice: 1100000, distanceMiles: 2.8, agentName: "Jessica White", brokerage: "RE/MAX" },
      { address: "45 Massachusetts Ave", soldDate: "2024-07-25", soldPrice: 1725000, distanceMiles: 3.2, agentName: "David Clark", brokerage: "Gibson Sotheby's" },
      { address: "99 Concord Ave", soldDate: "2024-06-15", soldPrice: 1390000, distanceMiles: 4.1, agentName: "Karen Moore", brokerage: "Compass" },
      { address: "10 Oak Rd", soldDate: "2025-01-05", soldPrice: 1210000, distanceMiles: 4.8, agentName: "Christopher Hall", brokerage: "William Raveis" }
    ],
    nearbyTransactionsAllAgentsLast12Mo: [
      { address: "10 Hillside Ave", soldDate: "2025-01-10", soldPrice: 1450000, distanceMiles: 0.3, agentName: "Alice Peterson", beds: 4, baths: 3, sqft: 2800 },
      { address: "59 Forest St", soldDate: "2024-12-22", soldPrice: 1285000, distanceMiles: 0.6, agentName: "Bob Sullivan", beds: 3, baths: 2.5, sqft: 2100 },
      { address: "22 Partridge Ln", soldDate: "2025-02-01", soldPrice: 1950000, distanceMiles: 0.9, agentName: "Charlie Zhang", beds: 5, baths: 4, sqft: 3800 },
      { address: "105 Worthen Rd", soldDate: "2024-11-15", soldPrice: 1150000, distanceMiles: 1.1, agentName: "Diana Ross", beds: 3, baths: 2, sqft: 1950 },
      { address: "44 Emerson Rd", soldDate: "2024-10-30", soldPrice: 1320000, distanceMiles: 1.4, agentName: "Edward Norton", beds: 4, baths: 3, sqft: 2450 },
      { address: "12 Marrett Rd", soldDate: "2025-01-20", soldPrice: 980000, distanceMiles: 1.8, agentName: "Fiona Apple", beds: 2, baths: 2, sqft: 1400 },
      { address: "89 Cliffe Ave", soldDate: "2024-09-12", soldPrice: 1675000, distanceMiles: 2.2, agentName: "George Lucas", beds: 4, baths: 3.5, sqft: 3100 },
      { address: "200 Spring St", soldDate: "2024-08-05", soldPrice: 1420000, distanceMiles: 2.7, agentName: "Hannah Abbott", beds: 4, baths: 3, sqft: 2750 },
      { address: "15 Slocum Rd", soldDate: "2024-12-08", soldPrice: 1590000, distanceMiles: 3.1, agentName: "Ian Wright", beds: 4, baths: 3, sqft: 2900 },
      { address: "67 Middle St", soldDate: "2024-07-19", soldPrice: 1100000, distanceMiles: 3.5, agentName: "Jenny Slate", beds: 3, baths: 2, sqft: 1850 }
    ],
    closestTransactions: [
      { address: "10 Oak Rd", soldDate: "2025-11-22", soldPrice: 1210000, distanceMiles: 0.8, beds: 4, baths: 3, sqft: 2400 },
      { address: "55 Pine Ln", soldDate: "2025-10-05", soldPrice: 1175000, distanceMiles: 1.2, beds: 4, baths: 2.5, sqft: 2500 },
      { address: "14 Spruce St", soldDate: "2025-08-15", soldPrice: 950000, distanceMiles: 1.5, beds: 3, baths: 2, sqft: 1800 },
      { address: "220 Concord Rd", soldDate: "2025-12-01", soldPrice: 2100000, distanceMiles: 1.9, beds: 5, baths: 4.5, sqft: 4200 },
      { address: "88 Main Ave", soldDate: "2025-05-12", soldPrice: 850000, distanceMiles: 2.1, beds: 2, baths: 1, sqft: 1100 },
      { address: "5 Apple Way", soldDate: "2025-01-20", soldPrice: 1300000, distanceMiles: 2.5, beds: 4, baths: 3, sqft: 2800 },
      { address: "77 High St", soldDate: "2025-07-30", soldPrice: 1050000, distanceMiles: 3.2, beds: 3, baths: 2, sqft: 2100 }
    ],
    recentSimilarSales: [
      {
        address: "10 Oak Rd",
        soldDate: "2025-11-22",
        soldPrice: 1210000,
        distanceMiles: 1.2,
        beds: 4,
        baths: 3,
        sqft: 2400
      },
      {
        address: "55 Pine Ln",
        soldDate: "2025-10-05",
        soldPrice: 1175000,
        distanceMiles: 2.8,
        beds: 4,
        baths: 3,
        sqft: 2500
      }
    ]
  },
  topAgents: [
    { 
      name: "Ava Patel", 
      brokerage: "Nextburb Partner", 
      townZipsTxLast12Mo: 28, 
      avgDom: 14, 
      listToSaleRatio: 1.03, 
      overAskPct: 52, 
      zipTransactionsLast12Mo: 20, 
      totalTransactionsLast12Mo: 45,
      zillowRating: 4.9,
      zillowReviewCount: 142,
      yearsExperience: 15,
      languages: ["English", "Hindi"],
      zillowProfileUrl: "https://www.zillow.com/profile/ava-patel"
    },
    { 
      name: "Mason Kim", 
      brokerage: "Nextburb Partner", 
      townZipsTxLast12Mo: 21, 
      avgDom: 16, 
      listToSaleRatio: 1.01, 
      overAskPct: 41, 
      zipTransactionsLast12Mo: 17, 
      totalTransactionsLast12Mo: 36,
      zillowRating: 4.8,
      zillowReviewCount: 89,
      yearsExperience: 12,
      languages: ["English", "Korean"],
      zillowProfileUrl: "https://www.zillow.com/profile/mason-kim"
    },
    { 
      name: "Sofia Chen", 
      brokerage: "Nextburb Partner", 
      townZipsTxLast12Mo: 18, 
      avgDom: 19, 
      listToSaleRatio: 1.0, 
      overAskPct: 33, 
      zipTransactionsLast12Mo: 14, 
      totalTransactionsLast12Mo: 31,
      zillowRating: 4.7,
      zillowReviewCount: 64,
      yearsExperience: 10,
      languages: ["English", "Mandarin"],
      zillowProfileUrl: "https://www.zillow.com/profile/sofia-chen"
    }
  ],
  cma: {
    comps: [
      { address: "12 Cedar St", beds: 4, baths: 3, sqft: 2380, lotSqft: 8800, yearBuilt: 1980, soldDate: "2025-11-01", soldPrice: 1225000, town: "Lexington", zip: "02420", highSchool: "Lexington High School", distanceMiles: 0.4 },
      { address: "88 Birch Ave", beds: 4, baths: 2, sqft: 2510, lotSqft: 9400, yearBuilt: 1975, soldDate: "2025-11-12", soldPrice: 1180000, town: "Lexington", zip: "02421", highSchool: "Lexington High School", distanceMiles: 1.2 },
      { address: "7 Spruce Way", beds: 5, baths: 3, sqft: 2700, lotSqft: 10000, yearBuilt: 1988, soldDate: "2025-09-20", soldPrice: 1295000, town: "Lexington", zip: "02420", highSchool: "Lexington High School", distanceMiles: 0.8 },
      { address: "44 Walnut St", beds: 4, baths: 3, sqft: 2400, lotSqft: 9000, yearBuilt: 1980, soldDate: "2025-10-05", soldPrice: 1210000, town: "Lexington", zip: "02420", highSchool: "Lexington High School", distanceMiles: 0.5 },
      { address: "22 Grove St", beds: 4, baths: 3, sqft: 2505, lotSqft: 9200, yearBuilt: 1982, soldDate: "2025-10-18", soldPrice: 1240000, town: "Lexington", zip: "02420", highSchool: "Lexington High School", distanceMiles: 0.7 },
      { address: "101 Main Rd", beds: 3, baths: 2, sqft: 2100, lotSqft: 8000, yearBuilt: 1970, soldDate: "2025-08-15", soldPrice: 1050000, town: "Lexington", zip: "02421", highSchool: "Lexington High School", distanceMiles: 1.5 },
      { address: "15 Valley Ln", beds: 4, baths: 3, sqft: 2600, lotSqft: 9500, yearBuilt: 1985, soldDate: "2025-11-20", soldPrice: 1350000, town: "Lexington", zip: "02420", highSchool: "Lexington High School", distanceMiles: 0.9 },
      { address: "99 Hillside Ter", beds: 4, baths: 2.5, sqft: 2480, lotSqft: 9150, yearBuilt: 1979, soldDate: "2025-12-05", soldPrice: 1205000, town: "Lexington", zip: "02420", highSchool: "Lexington High School", distanceMiles: 0.3 }
    ]
  },
  market: {
    medianSoldPrice: 1205000,
    medianSoldPriceYoYPct: 4.1,
    medianDom: 19,
    inventoryActive: 47,
    priceReductionsPct: 28,
    listToSaleRatio: 1.01,
    bestMonthToSell: "October",
    bestMonthEvidenceCount: 8,
    bestMonthConfidence: "Medium",
    bestMonthSampleSize: 8,
    lastUpdated: "Mock data",
    closedSalesByMonth: [
      { month: "Jan", count: 12 },
      { month: "Feb", count: 9 },
      { month: "Mar", count: 15 },
      { month: "Apr", count: 22 },
      { month: "May", count: 28 },
      { month: "Jun", count: 31 },
      { month: "Jul", count: 27 },
      { month: "Aug", count: 19 },
      { month: "Sep", count: 14 },
      { month: "Oct", count: 11 },
      { month: "Nov", count: 10 },
      { month: "Dec", count: 8 }
    ],
    medianDomByMonth: [
      { month: "Jan", medianDom: 42 },
      { month: "Feb", medianDom: 38 },
      { month: "Mar", medianDom: 28 },
      { month: "Apr", medianDom: 21 },
      { month: "May", medianDom: 15 },
      { month: "Jun", medianDom: 14 },
      { month: "Jul", medianDom: 16 },
      { month: "Aug", medianDom: 19 },
      { month: "Sep", medianDom: 22 },
      { month: "Oct", medianDom: 25 },
      { month: "Nov", medianDom: 29 },
      { month: "Dec", medianDom: 35 }
    ],
    trends: {
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      closedCount: [12, 9, 15, 22, 28, 31, 27, 19, 14, 11, 10, 8],
      medianDom: [42, 38, 28, 21, 15, 14, 16, 19, 22, 25, 29, 35],
      monthly: [
        { month: "Jan", closedCount: 12, medianDom: 42 },
        { month: "Feb", closedCount: 9, medianDom: 38 },
        { month: "Mar", closedCount: 15, medianDom: 28 },
        { month: "Apr", closedCount: 22, medianDom: 21 },
        { month: "May", closedCount: 28, medianDom: 15 },
        { month: "Jun", closedCount: 31, medianDom: 14 },
        { month: "Jul", closedCount: 27, medianDom: 16 },
        { month: "Aug", closedCount: 19, medianDom: 19 },
        { month: "Sep", closedCount: 14, medianDom: 22 },
        { month: "Oct", closedCount: 11, medianDom: 25 },
        { month: "Nov", closedCount: 10, medianDom: 29 },
        { month: "Dec", closedCount: 8, medianDom: 35 }
      ]
    }
  }
} as const;

export default sampleLead;