export type VerificationStatus =
  | 'VERIFIED'
  | 'STALE'
  | 'CONFLICTING'
  | 'UNVERIFIABLE'
  | 'NEEDS_REVIEW'
  | 'TIMELESS';

export type ClaimCategory =
  | 'PRICING_BILLING'
  | 'API_DOCS'
  | 'SOFTWARE_RELEASE'
  | 'LEADERSHIP_CORP'
  | 'LAWS_REGULATIONS'
  | 'PRODUCT_SPECS'
  | 'SECURITY_VULN'
  | 'MARKET_STATS'
  | 'TECH_DEVELOPMENT'
  | 'HISTORICAL_STABLE';

export type MonitoringInterval =
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'PER_RELEASE'
  | 'ANNUALLY';

export interface EvidenceSource {
  id: string;
  url: string;
  domain: string;
  title: string;
  snippet: string;
  publishedDate?: string;
  retrievedAt: string;
  reliability: 'OFFICIAL' | 'AUTHORITATIVE' | 'SECONDARY' | 'COMMUNITY' | 'UNVERIFIED';
  reliabilityScore: number; // 0-100
}

export interface ClaimAnalysis {
  id: string;
  claimText: string;
  category: ClaimCategory;
  categoryLabel: string;
  status: VerificationStatus;
  freshnessScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  monitoringInterval: MonitoringInterval;
  intervalDescription: string;
  originalCitation?: string;
  latestVerifiedFact: string;
  discrepancyDetected?: string;
  recommendedAction: string;
  evidence: EvidenceSource[];
  lastChecked: string;
}

export interface VerificationResult {
  id: string;
  timestamp: string;
  originalQuery?: string;
  originalResponse: string;
  modelName: string;
  verificationDepth: 'standard' | 'deep' | 'fast';
  overallFreshnessScore: number;
  overallConfidenceScore: number;
  claims: ClaimAnalysis[];
  correctedResponse: string;
  reportSummary: string;
  statusSummary: {
    verified: number;
    stale: number;
    conflicting: number;
    needsReview: number;
    unverifiable: number;
    timeless: number;
  };
  latencyMs: number;
}

export interface DashboardStats {
  totalAnalyzedClaims: number;
  verifiedClaims: number;
  staleClaims: number;
  conflictingClaims: number;
  needsReviewClaims: number;
  averageFreshnessScore: number;
  averageConfidenceScore: number;
  categoryDistribution: {
    category: string;
    label: string;
    total: number;
    staleCount: number;
    freshnessAvg: number;
  }[];
  trendData: {
    date: string;
    freshness: number;
    verified: number;
    stale: number;
  }[];
}

export interface MonitoredClaim {
  id: string;
  claimText: string;
  category: ClaimCategory;
  topic: string;
  status: VerificationStatus;
  freshnessScore: number;
  interval: MonitoringInterval;
  lastChecked: string;
  nextCheck: string;
  alertTriggered: boolean;
  notes?: string;
}
