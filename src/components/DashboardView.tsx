import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { DashboardStats, VerificationResult, VerificationStatus } from '../types/index.js';
import { fetchDashboardStats, fetchVerificationHistory } from '../lib/api.js';

interface DashboardViewProps {
  onSelectVerification: (result: VerificationResult) => void;
  onNavigateToWorkspace: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectVerification,
  onNavigateToWorkspace,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [statsData, historyData] = await Promise.all([
          fetchDashboardStats(),
          fetchVerificationHistory(),
        ]);
        setStats(statsData);
        setHistory(historyData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredHistory = history.filter(item => {
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'STALE' && item.statusSummary.stale === 0) return false;
      if (selectedStatus === 'VERIFIED' && (item.statusSummary.stale > 0 || item.statusSummary.conflicting > 0)) return false;
      if (selectedStatus === 'CONFLICTING' && item.statusSummary.conflicting === 0) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        (item.originalQuery && item.originalQuery.toLowerCase().includes(q)) ||
        item.originalResponse.toLowerCase().includes(q) ||
        item.modelName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-emerald-700 bg-emerald-50/50 border-emerald-200';
    if (score >= 50) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 text-center text-xs text-neutral-600">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent mb-2" />
        <p>Loading real-time verification analytics...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Freshness & Verification Dashboard
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Computed live from recorded LLM claim verification runs and continuous audit sweeps.
          </p>
        </div>

        <button
          onClick={onNavigateToWorkspace}
          className="flex items-center space-x-1.5 rounded-md bg-emerald-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <span>Run New Verification</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Overview Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Metric 1 */}
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-2xs">
            <div className="text-[11px] font-mono uppercase text-neutral-600">Claims Analyzed</div>
            <div className="mt-1 text-2xl font-bold font-mono text-neutral-900">
              {stats.totalAnalyzedClaims}
            </div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Total atomic claims</div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-2xs">
            <div className="text-[11px] font-mono uppercase text-emerald-800">Verified Accurate</div>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-800">
              {stats.verifiedClaims}
            </div>
            <div className="text-[10px] text-neutral-600 mt-0.5">
              {stats.totalAnalyzedClaims > 0
                ? Math.round((stats.verifiedClaims / stats.totalAnalyzedClaims) * 100)
                : 0}
              % pass rate
            </div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-2xs">
            <div className="text-[11px] font-mono uppercase text-red-700">Outdated / Stale</div>
            <div className="mt-1 text-2xl font-bold font-mono text-red-700">
              {stats.staleClaims}
            </div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Deprecations & price drift</div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-2xs">
            <div className="text-[11px] font-mono uppercase text-red-700">Conflicting</div>
            <div className="mt-1 text-2xl font-bold font-mono text-red-700">
              {stats.conflictingClaims}
            </div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Contradicts official SLAs</div>
          </div>

          {/* Metric 5 */}
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-2xs">
            <div className="text-[11px] font-mono uppercase text-amber-800">Needs Review</div>
            <div className="mt-1 text-2xl font-bold font-mono text-amber-800">
              {stats.needsReviewClaims}
            </div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Unverifiable or partial</div>
          </div>

          {/* Metric 6 */}
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-2xs">
            <div className="text-[11px] font-mono uppercase text-neutral-600">Avg Freshness</div>
            <div className="mt-1 text-2xl font-bold font-mono text-neutral-900">
              {stats.averageFreshnessScore}
              <span className="text-xs text-neutral-600 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-neutral-600 mt-0.5">Confidence: {stats.averageConfidenceScore}%</div>
          </div>
        </div>
      )}

      {/* Visualizations Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Claims by Category */}
          <div className="lg:col-span-6 rounded-md border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                  Claims by Category & Freshness
                </h3>
                <p className="text-[11px] text-neutral-600">Distribution of extracted topics</p>
              </div>
              <span className="text-[11px] font-mono text-neutral-600">Bar Chart</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.categoryDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderColor: '#262626',
                      color: '#ffffff',
                      fontSize: '11px',
                      borderRadius: '4px',
                    }}
                  />
                  <Bar dataKey="total" fill="#0f172a" name="Total Claims" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="staleCount" fill="#dc2626" name="Stale Claims" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Freshness Trend */}
          <div className="lg:col-span-6 rounded-md border border-neutral-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-800">
                  Verification Freshness Trend
                </h3>
                <p className="text-[11px] text-neutral-600">Daily average score progression</p>
              </div>
              <span className="text-[11px] font-mono text-neutral-600">Area Chart</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderColor: '#262626',
                      color: '#ffffff',
                      fontSize: '11px',
                      borderRadius: '4px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="freshness"
                    stroke="#059669"
                    fill="#ecfdf5"
                    strokeWidth={2}
                    name="Avg Freshness"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Verifications Table */}
      <div className="rounded-md border border-neutral-200 bg-white shadow-2xs">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Recent Verification Activity</h2>
            <p className="text-xs text-neutral-600">Audit logs of all analyzed LLM outputs</p>
          </div>

          {/* Filter & Search */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-neutral-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search audit runs..."
                className="rounded border border-neutral-200 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-400"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="STALE">Has Stale Claims</option>
              <option value="VERIFIED">100% Verified</option>
              <option value="CONFLICTING">Has Conflicts</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-mono">
              <tr>
                <th className="py-2.5 px-4 font-medium">Response ID</th>
                <th className="py-2.5 px-4 font-medium">Original Query / Topic</th>
                <th className="py-2.5 px-4 font-medium">Model</th>
                <th className="py-2.5 px-4 font-medium">Claims Detected</th>
                <th className="py-2.5 px-4 font-medium">Freshness Score</th>
                <th className="py-2.5 px-4 font-medium">Status Breakdown</th>
                <th className="py-2.5 px-4 font-medium">Last Checked</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-600">
                    No verification records match your filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-700">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-neutral-900">
                      {item.originalQuery || item.originalResponse.slice(0, 50) + '...'}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                      {item.modelName}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.claims.length} claims
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${getScoreBadge(
                          item.overallFreshnessScore
                        )}`}
                      >
                        {item.overallFreshnessScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                        {item.statusSummary.verified > 0 && (
                          <span className="text-emerald-800">{item.statusSummary.verified}v</span>
                        )}
                        {item.statusSummary.stale > 0 && (
                          <span className="text-red-700 font-semibold">{item.statusSummary.stale}s</span>
                        )}
                        {item.statusSummary.conflicting > 0 && (
                          <span className="text-red-700">{item.statusSummary.conflicting}c</span>
                        )}
                        {item.statusSummary.needsReview > 0 && (
                          <span className="text-amber-800">{item.statusSummary.needsReview}r</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-[11px]">
                      {new Date(item.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectVerification(item)}
                        className="inline-flex items-center space-x-1 text-emerald-800 hover:text-emerald-700 font-medium text-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
