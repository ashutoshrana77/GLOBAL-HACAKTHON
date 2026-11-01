import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Download,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  BookmarkPlus,
  Info,
} from 'lucide-react';
import { VerificationResult, ClaimAnalysis, VerificationStatus } from '../types/index.js';
import { verifyResponse, addMonitoredClaimApi } from '../lib/api.js';

interface AnalysisWorkspaceProps {
  initialResult?: VerificationResult | null;
  onSaveToWatchlist?: (claim: ClaimAnalysis) => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'OpenAI API & Twitter CEO',
    query: 'What is the current pricing for OpenAI GPT-4o and who is the current CEO of Twitter?',
    response:
      "OpenAI's latest API costs $5 per million tokens for GPT-4o. The company is led by CEO Sam Altman. Meanwhile, Twitter operates under CEO Parag Agrawal, and its API offers a free tier for developers using v1.1 endpoints with up to 500,000 tweets per month.",
    model: 'GPT-4o (Snapshot 2024)',
  },
  {
    name: 'EU AI Act & Node.js LTS',
    query: 'What is the regulatory status of the EU AI Act and what Node.js version is currently LTS?',
    response:
      'The EU AI Act is still a pending legislative draft bill that has not yet entered into force. For enterprise applications, Node.js 16 is the recommended Active LTS version providing full security maintenance.',
    model: 'Claude 3.5 Sonnet (Early Preview)',
  },
  {
    name: 'Cloud SLA & Zero Latency Claim',
    query: 'Does Google Cloud Storage guarantee 100% uptime with zero latency?',
    response:
      'Google Cloud Storage provides high durability object storage. It guarantees 100% infallible uptime and zero latency across all geographic multi-regions without any rate limits.',
    model: 'Llama 3 70B',
  },
  {
    name: 'Python 3.13 Experimental GIL',
    query: 'Can Python run without the GIL in 3.13?',
    response:
      'In Python 3.13, an experimental free-threaded build option has been introduced that allows disabling the Global Interpreter Lock (GIL) to execute multi-threaded Python code in parallel.',
    model: 'Gemini 1.5 Pro',
  },
];

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  initialResult,
  onSaveToWatchlist,
}) => {
  const [responseInput, setResponseInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [modelName, setModelName] = useState('GPT-4o');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'fast'>('standard');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<VerificationResult | null>(initialResult || null);
  const [activeTab, setActiveTab] = useState<'claims' | 'diff' | 'report'>('claims');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [claimSearch, setClaimSearch] = useState<string>('');
  const [expandedClaimIds, setExpandedClaimIds] = useState<Set<string>>(new Set());
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [savedClaimIds, setSavedClaimIds] = useState<Set<string>>(new Set());

  // If initialResult provided from dashboard, load it
  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
      setResponseInput(initialResult.originalResponse);
      setQueryInput(initialResult.originalQuery || '');
      setModelName(initialResult.modelName || 'Custom Model');
      // Auto expand any stale or conflicting claims
      const initialExpanded = new Set<string>();
      initialResult.claims.forEach(c => {
        if (c.status === 'STALE' || c.status === 'CONFLICTING') {
          initialExpanded.add(c.id);
        }
      });
      setExpandedClaimIds(initialExpanded);
    }
  }, [initialResult]);

  const handleApplyPreset = (template: typeof PRESET_TEMPLATES[0]) => {
    setQueryInput(template.query);
    setResponseInput(template.response);
    setModelName(template.model);
    setError(null);
  };

  const handleRunVerification = async () => {
    if (!responseInput.trim()) {
      setError('Please provide an AI response to verify.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep('Extracting atomic factual claims...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Profiling temporal decay & freshness lifespans...');
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Querying live sources & Google search grounding...');
    }, 1400);

    const stepTimer3 = setTimeout(() => {
      setLoadingStep('Comparing claims with current reality & scoring freshness...');
    }, 2400);

    try {
      const res = await verifyResponse(responseInput, queryInput, modelName, depth);
      setResult(res);

      // Auto expand stale / conflicting claims for quick inspection
      const expanded = new Set<string>();
      res.claims.forEach(c => {
        if (c.status === 'STALE' || c.status === 'CONFLICTING') {
          expanded.add(c.id);
        }
      });
      // If none stale, expand the first one
      if (expanded.size === 0 && res.claims.length > 0) {
        expanded.add(res.claims[0].id);
      }
      setExpandedClaimIds(expanded);
    } catch (err: any) {
      setError(err.message || 'Failed to complete verification.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const toggleClaimExpansion = (id: string) => {
    const next = new Set(expandedClaimIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedClaimIds(next);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const handleSaveToWatchlist = async (claim: ClaimAnalysis) => {
    try {
      await addMonitoredClaimApi({
        claimText: claim.claimText,
        category: claim.category,
        topic: claim.categoryLabel,
        interval: claim.monitoringInterval,
        notes: `Extracted from response: ${claim.latestVerifiedFact.slice(0, 100)}`,
      });
      setSavedClaimIds(prev => new Set(prev).add(claim.id));
      if (onSaveToWatchlist) onSaveToWatchlist(claim);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freshcheck-report-${result.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter claims
  const filteredClaims = result
    ? result.claims.filter(claim => {
        if (statusFilter !== 'ALL' && claim.status !== statusFilter) return false;
        if (claimSearch.trim()) {
          const q = claimSearch.toLowerCase();
          return (
            claim.claimText.toLowerCase().includes(q) ||
            claim.latestVerifiedFact.toLowerCase().includes(q) ||
            claim.categoryLabel.toLowerCase().includes(q)
          );
        }
        return true;
      })
    : [];

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 stroke-[2]" />
            <span>VERIFIED</span>
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 border border-red-200">
            <XCircle className="h-3 w-3 stroke-[2]" />
            <span>STALE</span>
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 border border-red-200">
            <AlertTriangle className="h-3 w-3 stroke-[2]" />
            <span>CONFLICTING</span>
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
            <AlertTriangle className="h-3 w-3 stroke-[2]" />
            <span>NEEDS REVIEW</span>
          </span>
        );
      case 'TIMELESS':
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 border border-neutral-200">
            <CheckCircle2 className="h-3 w-3 stroke-[2]" />
            <span>TIMELESS</span>
          </span>
        );
      case 'UNVERIFIABLE':
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-600 border border-neutral-200">
            <HelpCircle className="h-3 w-3 stroke-[2]" />
            <span>UNVERIFIABLE</span>
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-800';
    if (score >= 75) return 'text-emerald-700';
    if (score >= 50) return 'text-amber-800';
    return 'text-red-700';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      {/* Workspace header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 mb-6 gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Response Verification Workspace
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Extract factual claims, detect temporal decay, and verify against live web documentation.
          </p>
        </div>

        {/* Preset scenario loader */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-neutral-600 hidden md:inline">Sample Cases:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map(p => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className="rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                title={p.query}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Input Editor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                LLM Response to Verify <span className="text-red-500">*</span>
              </label>
              <button
                onClick={() => {
                  setResponseInput('');
                  setQueryInput('');
                  setResult(null);
                }}
                className="text-[11px] text-neutral-600 hover:text-neutral-700 flex items-center space-x-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>

            <textarea
              value={responseInput}
              onChange={e => setResponseInput(e.target.value)}
              placeholder="Paste any AI-generated answer here (pricing quotes, API specs, corporate leadership, regulations)..."
              rows={8}
              className="w-full rounded border border-neutral-200 p-3 text-xs text-neutral-900 placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-hidden font-mono leading-relaxed resize-y"
            />

            {/* Optional Original Query */}
            <div className="mt-3">
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Original User Prompt / Query (Optional)
              </label>
              <input
                type="text"
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                placeholder="e.g. What is the current pricing for GPT-4o?"
                className="w-full rounded border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-600 focus:border-neutral-400 focus:outline-hidden"
              />
            </div>

            {/* Model & Verification Settings */}
            <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 text-xs">
              <div>
                <label className="text-neutral-600 block mb-1">Source Model</label>
                <select
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs text-neutral-800 focus:border-neutral-400 focus:outline-hidden"
                >
                  <option value="GPT-4o">GPT-4o</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  <option value="Llama 3 70B">Llama 3 70B</option>
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                  <option value="Mistral Large">Mistral Large</option>
                  <option value="Custom Agent Pipeline">Custom Agent Pipeline</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-600 block mb-1">Verification Depth</label>
                <select
                  value={depth}
                  onChange={e => setDepth(e.target.value as any)}
                  className="w-full rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs text-neutral-800 focus:border-neutral-400 focus:outline-hidden"
                >
                  <option value="standard">Standard (Live Search Grounding)</option>
                  <option value="deep">Deep (Multi-Source Verification)</option>
                  <option value="fast">Fast (Heuristic & Cached Baseline)</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 stroke-[2]" />
                <span>{error}</span>
              </div>
            )}

            {/* Run Button */}
            <div className="mt-4">
              <button
                onClick={handleRunVerification}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 rounded-md bg-emerald-800 py-2.5 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{loadingStep || 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Freshness Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="rounded-md border border-neutral-200 bg-neutral-50/70 p-3.5 text-xs text-neutral-600 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-medium text-neutral-800">
              <Info className="h-3.5 w-3.5 text-neutral-600" />
              <span>How FreshCheck evaluates claims</span>
            </div>
            <p className="leading-relaxed">
              Every factual sentence is extracted and scored against live official documentation.
              Pricing and API specs receive daily/weekly checks, while static historical facts are classified as timeless.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Verification Results & Extracted Claims */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-4">
              {/* Overall Score Card */}
              <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-neutral-600">Overall Freshness Score</div>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className={`text-3xl font-bold font-mono ${getScoreColor(result.overallFreshnessScore)}`}>
                        {result.overallFreshnessScore}
                      </span>
                      <span className="text-xs text-neutral-600 font-mono">/ 100</span>
                      <span className="text-xs font-medium ml-2 px-2 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-neutral-700">
                        {result.overallFreshnessScore >= 90
                          ? 'Fresh & Strongly Verified'
                          : result.overallFreshnessScore >= 75
                          ? 'Mostly Fresh'
                          : result.overallFreshnessScore >= 50
                          ? 'Needs Attention'
                          : 'Stale / Outdated Claims Detected'}
                      </span>
                    </div>
                  </div>

                  {/* Confidence & Timing */}
                  <div className="text-right sm:border-l sm:border-neutral-200 sm:pl-4">
                    <div className="text-[11px] font-mono uppercase text-neutral-600">Verification Confidence</div>
                    <div className="text-sm font-semibold text-neutral-800 font-mono mt-0.5">
                      {result.overallConfidenceScore}%
                    </div>
                    <div className="text-[11px] text-neutral-600 font-mono">
                      Latency: {result.latencyMs}ms
                    </div>
                  </div>
                </div>

                {/* Status Breakdown Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                  <div className="rounded border border-neutral-200 bg-neutral-50 p-2 text-center">
                    <div className="text-[11px] text-neutral-600">Verified</div>
                    <div className="text-sm font-bold text-emerald-800 font-mono">
                      {result.statusSummary.verified + result.statusSummary.timeless}
                    </div>
                  </div>
                  <div className="rounded border border-neutral-200 bg-neutral-50 p-2 text-center">
                    <div className="text-[11px] text-neutral-600">Outdated / Stale</div>
                    <div className="text-sm font-bold text-red-700 font-mono">
                      {result.statusSummary.stale}
                    </div>
                  </div>
                  <div className="rounded border border-neutral-200 bg-neutral-50 p-2 text-center">
                    <div className="text-[11px] text-neutral-600">Conflicting</div>
                    <div className="text-sm font-bold text-red-700 font-mono">
                      {result.statusSummary.conflicting}
                    </div>
                  </div>
                  <div className="rounded border border-neutral-200 bg-neutral-50 p-2 text-center">
                    <div className="text-[11px] text-neutral-600">Needs Review</div>
                    <div className="text-sm font-bold text-amber-800 font-mono">
                      {result.statusSummary.needsReview + result.statusSummary.unverifiable}
                    </div>
                  </div>
                </div>

                {/* Summary text */}
                <div className="mt-3 text-xs text-neutral-600 border-t border-neutral-100 pt-2.5">
                  <span className="font-medium text-neutral-800">Audit Finding:</span> {result.reportSummary}
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-neutral-200">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('claims')}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === 'claims'
                        ? 'border-emerald-700 text-neutral-900 font-semibold'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Extracted Claims ({result.claims.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('diff')}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === 'diff'
                        ? 'border-emerald-700 text-neutral-900 font-semibold'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Response Comparison (Diff)
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === 'report'
                        ? 'border-emerald-700 text-neutral-900 font-semibold'
                        : 'border-transparent text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Full Audit Report
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportJson}
                    className="flex items-center space-x-1 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded px-2 py-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: EXTRACTED CLAIMS LIST */}
              {activeTab === 'claims' && (
                <div className="space-y-3">
                  {/* Filter and search bar */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-neutral-600" />
                      <input
                        type="text"
                        value={claimSearch}
                        onChange={e => setClaimSearch(e.target.value)}
                        placeholder="Search claims or evidence..."
                        className="w-full rounded border border-neutral-200 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-400"
                      />
                    </div>

                    <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      {['ALL', 'STALE', 'CONFLICTING', 'VERIFIED'].map(st => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`rounded px-2.5 py-1 text-xs font-mono transition-colors ${
                            statusFilter === st
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Claims List */}
                  {filteredClaims.length === 0 ? (
                    <div className="rounded border border-neutral-200 bg-neutral-50 p-8 text-center text-xs text-neutral-600">
                      No claims match the selected filter.
                    </div>
                  ) : (
                    filteredClaims.map((claim, idx) => {
                      const isExpanded = expandedClaimIds.has(claim.id);
                      const isSaved = savedClaimIds.has(claim.id);

                      return (
                        <div
                          key={claim.id}
                          className="rounded-md border border-neutral-200 bg-white transition-all shadow-2xs"
                        >
                          {/* Claim Header Bar */}
                          <div
                            onClick={() => toggleClaimExpansion(claim.id)}
                            className="p-3 cursor-pointer hover:bg-neutral-50/70 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-[11px] text-neutral-600">#{idx + 1}</span>
                                {getStatusBadge(claim.status)}
                                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600">
                                  {claim.categoryLabel}
                                </span>
                                <span className="text-[11px] font-mono text-neutral-600">
                                  Interval: {claim.monitoringInterval}
                                </span>
                              </div>

                              <p className="text-xs font-medium text-neutral-900 leading-snug">
                                {claim.claimText}
                              </p>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0">
                              <div className="text-right">
                                <div className="text-[10px] uppercase font-mono text-neutral-600">Freshness</div>
                                <div className={`text-xs font-bold font-mono ${getScoreColor(claim.freshnessScore)}`}>
                                  {claim.freshnessScore}/100
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-neutral-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-neutral-600" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Evidence & Details */}
                          {isExpanded && (
                            <div className="border-t border-neutral-100 p-3.5 bg-neutral-50/50 space-y-3 text-xs">
                              {/* Verified Truth vs Discrepancy */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded border border-neutral-200 bg-white p-3">
                                  <div className="text-[11px] font-mono uppercase text-neutral-600 mb-1">
                                    Latest Verified Reality
                                  </div>
                                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                                    {claim.latestVerifiedFact}
                                  </p>
                                </div>

                                <div className="rounded border border-neutral-200 bg-white p-3">
                                  <div className="text-[11px] font-mono uppercase text-neutral-600 mb-1">
                                    Discrepancy / Action
                                  </div>
                                  <p className="text-xs text-neutral-700 leading-relaxed">
                                    {claim.discrepancyDetected || 'Information aligns with current live sources.'}
                                  </p>
                                  <p className="text-[11px] text-neutral-600 mt-1.5 font-medium">
                                    Recommendation: {claim.recommendedAction}
                                  </p>
                                </div>
                              </div>

                              {/* Live Evidence Sources */}
                              <div>
                                <div className="text-[11px] font-mono uppercase text-neutral-600 mb-1.5">
                                  Live Evidence & Source Citations
                                </div>
                                <div className="space-y-1.5">
                                  {claim.evidence && claim.evidence.length > 0 ? (
                                    claim.evidence.map(ev => (
                                      <div
                                        key={ev.id}
                                        className="flex items-center justify-between rounded border border-neutral-200 bg-white p-2 text-xs"
                                      >
                                        <div className="flex items-center space-x-2 truncate mr-2">
                                          <span className="rounded bg-neutral-100 px-1 py-0.5 text-[10px] font-mono text-neutral-600">
                                            {ev.reliability}
                                          </span>
                                          <span className="font-medium text-neutral-800 truncate">{ev.title}</span>
                                          <span className="text-[11px] text-neutral-600 font-mono">({ev.domain})</span>
                                        </div>

                                        <a
                                          href={ev.url}
                                          target="_blank"
                                          rel="noreferrer noopener"
                                          className="shrink-0 flex items-center space-x-1 text-emerald-800 hover:text-emerald-700 font-mono text-[11px]"
                                        >
                                          <span>Open Source</span>
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-neutral-600 italic">No direct external link captured.</div>
                                  )}
                                </div>
                              </div>

                              {/* Footer Action: Add to Continuous Watch */}
                              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80">
                                <span className="text-[11px] text-neutral-600 font-mono">
                                  Decay cadence: {claim.intervalDescription}
                                </span>
                                <button
                                  onClick={() => handleSaveToWatchlist(claim)}
                                  disabled={isSaved}
                                  className="flex items-center space-x-1 text-xs text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded px-2.5 py-1 bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50"
                                >
                                  {isSaved ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-800" />
                                      <span>Saved to Watchlist</span>
                                    </>
                                  ) : (
                                    <>
                                      <BookmarkPlus className="h-3.5 w-3.5 text-neutral-500" />
                                      <span>Watch this Claim</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: RESPONSE COMPARISON (DIFF) */}
              {activeTab === 'diff' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original */}
                    <div className="rounded-md border border-neutral-200 bg-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase text-neutral-600">
                          Original AI Response
                        </span>
                        <span className="text-[11px] text-neutral-600">Unverified</span>
                      </div>
                      <div className="p-3 rounded bg-neutral-50 border border-neutral-200 font-mono text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap">
                        {result.originalResponse}
                      </div>
                    </div>

                    {/* Corrected */}
                    <div className="rounded-md border border-neutral-200 bg-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono uppercase text-emerald-800 font-semibold">
                          Verified & Corrected Response
                        </span>
                        <button
                          onClick={() => handleCopy(result.correctedResponse)}
                          className="flex items-center space-x-1 text-xs text-neutral-600 hover:text-neutral-900"
                        >
                          {copiedResponse ? <Check className="h-3 w-3 text-emerald-800" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-3 rounded bg-emerald-50/40 border border-emerald-200 font-mono text-xs text-neutral-900 leading-relaxed whitespace-pre-wrap">
                        {result.correctedResponse}
                      </div>
                    </div>
                  </div>

                  {/* Clarification notes */}
                  <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
                    <p>
                      <strong>Factual provenance guarantee:</strong> Stale claims have been replaced with
                      verified current facts and tagged with numeric citation markers matching the live evidence
                      records. No speculative facts were synthesized.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT REPORT */}
              {activeTab === 'report' && (
                <div className="rounded-md border border-neutral-200 bg-white p-4 space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <div>
                      <span className="font-semibold text-neutral-900">VERIFICATION AUDIT LOG</span>
                      <div className="text-[11px] text-neutral-600">ID: {result.id}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                      className="flex items-center space-x-1 rounded border border-neutral-200 px-2.5 py-1 text-neutral-700 hover:bg-neutral-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Full JSON Audit</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-neutral-700 leading-relaxed">
                    <p>
                      <strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}
                    </p>
                    <p>
                      <strong>Engine Model:</strong> Gemini 3.8 Flash (Grounding Mode)
                    </p>
                    <p>
                      <strong>Verification Depth:</strong> {result.verificationDepth}
                    </p>
                    <p>
                      <strong>Overall Freshness:</strong> {result.overallFreshnessScore} / 100
                    </p>
                    <p>
                      <strong>Claims Analyzed:</strong> {result.claims.length} total (
                      {result.statusSummary.verified} verified, {result.statusSummary.stale} stale,{' '}
                      {result.statusSummary.conflicting} conflicting, {result.statusSummary.needsReview} needs review)
                    </p>
                  </div>

                  <div className="border-t border-neutral-200 pt-3">
                    <div className="text-neutral-800 font-semibold mb-2">Extracted Claims Breakdown:</div>
                    <div className="space-y-2">
                      {result.claims.map((c, i) => (
                        <div key={c.id} className="p-2 rounded bg-neutral-50 border border-neutral-200">
                          <div>
                            [{i + 1}] [{c.status}] ({c.categoryLabel}): "{c.claimText}"
                          </div>
                          {c.discrepancyDetected && (
                            <div className="text-red-700 mt-1">
                              &gt;&gt; Discrepancy: {c.discrepancyDetected}
                            </div>
                          )}
                          <div className="text-emerald-800 mt-0.5">
                            &gt;&gt; Verified Truth: {c.latestVerifiedFact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state when no analysis run yet */
            <div className="h-full min-h-[420px] rounded-md border border-neutral-200 bg-neutral-50/50 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-10 w-10 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 mb-3">
                <Search className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">Verification Engine Ready</h3>
              <p className="mt-1 text-xs text-neutral-600 max-w-sm leading-relaxed">
                Paste an AI-generated answer or click one of the preset sample scenarios on the top right to verify
                factual freshness.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleApplyPreset(PRESET_TEMPLATES[0])}
                  className="rounded border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Load OpenAI Pricing Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
