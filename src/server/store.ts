import { VerificationResult, DashboardStats, MonitoredClaim } from '../types/index.js';
import { runHeuristicVerification } from './verificationEngine.js';

// Seed initial realistic verification history
const sampleRuns: { query: string; response: string; model: string; daysAgo: number }[] = [
  {
    query: "What is the latest OpenAI GPT-4o API pricing and who is the current CEO of Twitter?",
    response: "OpenAI's latest API costs $5 per million tokens for GPT-4o. The company is led by CEO Sam Altman. Meanwhile, Twitter is led by CEO Parag Agrawal, and its API offers a free tier for developers with v1.1 endpoints.",
    model: "GPT-4o (Snapshot 2024)",
    daysAgo: 4,
  },
  {
    query: "Is the EU AI Act in effect and what is the current Node.js LTS version?",
    response: "The EU AI Act is still a pending draft regulation awaiting final parliament vote. For backend systems, Node.js 16 is the recommended LTS release with guaranteed security maintenance.",
    model: "Claude 3.5 Sonnet (Early Preview)",
    daysAgo: 3,
  },
  {
    query: "Explain Python GIL and current release status of Python 3.13",
    response: "Python historically features a Global Interpreter Lock (GIL). In Python 3.13, an experimental free-threaded build option has been introduced that allows running without the GIL on multi-core systems.",
    model: "Gemini 1.5 Pro",
    daysAgo: 2,
  },
  {
    query: "What are the availability SLAs for Google Cloud Storage and can it provide 100% zero latency?",
    response: "Google Cloud Storage offers 99.9% to 99.99% monthly availability depending on storage class. It guarantees zero latency and 100% infallible uptime for all requests.",
    model: "Llama 3 70B",
    daysAgo: 1,
  },
];

// In-memory verification storage
const verificationHistory: VerificationResult[] = [];

// Initialize with sample runs
sampleRuns.forEach((sample, i) => {
  const result = runHeuristicVerification(sample.response, sample.query, sample.model, 'standard', Date.now() - sample.daysAgo * 86400000);
  // Backdate timestamp slightly
  const d = new Date(Date.now() - sample.daysAgo * 86400000);
  result.timestamp = d.toISOString();
  result.id = `hist-init-${i + 1}`;
  verificationHistory.push(result);
});

// Monitored claims store
const monitoredClaims: MonitoredClaim[] = [
  {
    id: 'mon-1',
    claimText: 'OpenAI GPT-4o API pricing is $2.50 per million input tokens.',
    category: 'PRICING_BILLING',
    topic: 'OpenAI API Pricing',
    status: 'VERIFIED',
    freshnessScore: 97,
    interval: 'DAILY',
    lastChecked: new Date(Date.now() - 3600000 * 3).toISOString(),
    nextCheck: new Date(Date.now() + 3600000 * 21).toISOString(),
    alertTriggered: false,
    notes: 'Watch for sudden price drops or context tier adjustments.',
  },
  {
    id: 'mon-2',
    claimText: 'X / Twitter API requires paid tiers starting at $100/mo (v1.1 free reading tier deprecated).',
    category: 'API_DOCS',
    topic: 'X Developer Platform',
    status: 'VERIFIED',
    freshnessScore: 94,
    interval: 'WEEKLY',
    lastChecked: new Date(Date.now() - 86400000 * 2).toISOString(),
    nextCheck: new Date(Date.now() + 86400000 * 5).toISOString(),
    alertTriggered: false,
    notes: 'Verify rate limits and endpoint access changes.',
  },
  {
    id: 'mon-3',
    claimText: 'EU AI Act entered into legal force on August 1, 2024.',
    category: 'LAWS_REGULATIONS',
    topic: 'EU Regulatory Compliance',
    status: 'VERIFIED',
    freshnessScore: 99,
    interval: 'MONTHLY',
    lastChecked: new Date(Date.now() - 86400000 * 12).toISOString(),
    nextCheck: new Date(Date.now() + 86400000 * 18).toISOString(),
    alertTriggered: false,
    notes: 'Track upcoming enforcement deadlines for high-risk systems.',
  },
  {
    id: 'mon-4',
    claimText: 'Node.js 16 and Node.js 18 reached End-of-Life, Node 20 & 22 are current Active LTS.',
    category: 'SOFTWARE_RELEASE',
    topic: 'Node.js LTS Lifecycle',
    status: 'VERIFIED',
    freshnessScore: 95,
    interval: 'WEEKLY',
    lastChecked: new Date(Date.now() - 86400000 * 4).toISOString(),
    nextCheck: new Date(Date.now() + 86400000 * 3).toISOString(),
    alertTriggered: false,
    notes: 'Auto-verify against nodejs.org release schedule.',
  },
];

export function addVerification(result: VerificationResult): void {
  // Add to beginning of history
  verificationHistory.unshift(result);
}

export function getVerificationHistory(): VerificationResult[] {
  return verificationHistory;
}

export function getVerificationById(id: string): VerificationResult | undefined {
  return verificationHistory.find(v => v.id === id);
}

export function getMonitoredClaims(): MonitoredClaim[] {
  return monitoredClaims;
}

export function addMonitoredClaim(claim: Omit<MonitoredClaim, 'id' | 'lastChecked' | 'nextCheck' | 'alertTriggered'>): MonitoredClaim {
  const newClaim: MonitoredClaim = {
    ...claim,
    id: `mon-${Date.now()}`,
    lastChecked: new Date().toISOString(),
    nextCheck: new Date(Date.now() + 86400000).toISOString(),
    alertTriggered: false,
  };
  monitoredClaims.unshift(newClaim);
  return newClaim;
}

export function deleteMonitoredClaim(id: string): boolean {
  const index = monitoredClaims.findIndex(c => c.id === id);
  if (index !== -1) {
    monitoredClaims.splice(index, 1);
    return true;
  }
  return false;
}

// Compute dynamic, real statistics from all recorded verifications
export function computeDashboardStats(): DashboardStats {
  const allClaims = verificationHistory.flatMap(v => v.claims);

  const totalAnalyzedClaims = allClaims.length;
  const verifiedClaims = allClaims.filter(c => c.status === 'VERIFIED' || c.status === 'TIMELESS').length;
  const staleClaims = allClaims.filter(c => c.status === 'STALE').length;
  const conflictingClaims = allClaims.filter(c => c.status === 'CONFLICTING').length;
  const needsReviewClaims = allClaims.filter(c => c.status === 'NEEDS_REVIEW' || c.status === 'UNVERIFIABLE').length;

  const averageFreshnessScore = totalAnalyzedClaims > 0
    ? Math.round(allClaims.reduce((acc, c) => acc + c.freshnessScore, 0) / totalAnalyzedClaims)
    : 85;

  const averageConfidenceScore = totalAnalyzedClaims > 0
    ? Math.round(allClaims.reduce((acc, c) => acc + c.confidenceScore, 0) / totalAnalyzedClaims)
    : 92;

  // Group by category
  const categoryMap = new Map<string, { label: string; total: number; staleCount: number; freshnessSum: number }>();
  allClaims.forEach(c => {
    const existing = categoryMap.get(c.category) || { label: c.categoryLabel, total: 0, staleCount: 0, freshnessSum: 0 };
    existing.total += 1;
    if (c.status === 'STALE' || c.status === 'CONFLICTING') {
      existing.staleCount += 1;
    }
    existing.freshnessSum += c.freshnessScore;
    categoryMap.set(c.category, existing);
  });

  const categoryDistribution = Array.from(categoryMap.entries()).map(([cat, data]) => ({
    category: cat,
    label: data.label,
    total: data.total,
    staleCount: data.staleCount,
    freshnessAvg: Math.round(data.freshnessSum / (data.total || 1)),
  }));

  // Trend data by date
  const trendMap = new Map<string, { freshnessSum: number; count: number; verified: number; stale: number }>();
  verificationHistory.forEach(v => {
    const dateStr = new Date(v.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = trendMap.get(dateStr) || { freshnessSum: 0, count: 0, verified: 0, stale: 0 };
    existing.freshnessSum += v.overallFreshnessScore;
    existing.count += 1;
    existing.verified += v.statusSummary.verified + v.statusSummary.timeless;
    existing.stale += v.statusSummary.stale + v.statusSummary.conflicting;
    trendMap.set(dateStr, existing);
  });

  const trendData = Array.from(trendMap.entries()).map(([date, data]) => ({
    date,
    freshness: Math.round(data.freshnessSum / (data.count || 1)),
    verified: data.verified,
    stale: data.stale,
  }));

  return {
    totalAnalyzedClaims,
    verifiedClaims,
    staleClaims,
    conflictingClaims,
    needsReviewClaims,
    averageFreshnessScore,
    averageConfidenceScore,
    categoryDistribution,
    trendData,
  };
}
