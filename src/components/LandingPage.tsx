import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Search,
  Clock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Terminal,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onStartAnalysis: () => void;
  onExploreDashboard: () => void;
  onOpenApi: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onExploreDashboard,
  onOpenApi,
}) => {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Hero Section */}
      <section className="border-b border-neutral-200 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Subtle status tag */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-800"></span>
            <span>Independent Verification Layer for Production LLMs</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-950 max-w-4xl mx-auto leading-[1.12]">
            Is your AI answer <br className="hidden sm:inline" />
            <span className="text-emerald-800">still accurate?</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Verify every claim against live sources. Detect outdated pricing, deprecated APIs,
            and superseded regulations before they reach your users.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartAnalysis}
              className="flex items-center space-x-2 rounded-md bg-emerald-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <span>Analyze a Response</span>
              <ArrowRight className="h-4 w-4 stroke-[2]" />
            </button>
            <button
              onClick={onExploreDashboard}
              className="rounded-md border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Explore Live Dashboard
            </button>
          </div>

          <p className="mt-4 text-xs text-neutral-600 font-mono">
            Ground truth verified against live web documentation • Not just citation counting
          </p>

          {/* Realistic Product Interface Preview */}
          <div className="mt-14 rounded-lg border border-neutral-200 bg-neutral-50 p-3 sm:p-4 text-left shadow-xs">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300"></span>
                <span className="text-xs font-mono text-neutral-600 ml-2">freshcheck-audit-report-10294.json</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="rounded bg-neutral-200/70 px-2 py-0.5 text-[11px] font-mono text-neutral-700">
                  Model: GPT-4o snapshot
                </span>
                <span className="rounded bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium">
                  Freshness: 42/100 (Outdated Detected)
                </span>
              </div>
            </div>

            {/* Split preview content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Original with highlighted stale elements */}
              <div className="lg:col-span-5 rounded border border-neutral-200 bg-white p-4">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-2">
                  Original LLM Response
                </div>
                <div className="text-xs text-neutral-800 leading-relaxed font-mono space-y-2">
                  <p>
                    OpenAI's latest API costs{' '}
                    <span className="bg-red-50 text-red-700 border-b border-red-300 font-medium px-0.5">
                      $5.00 per million tokens
                    </span>{' '}
                    for GPT-4o. The company is led by CEO Sam Altman.
                  </p>
                  <p>
                    Meanwhile, Twitter operates under{' '}
                    <span className="bg-red-50 text-red-700 border-b border-red-300 font-medium px-0.5">
                      CEO Parag Agrawal
                    </span>
                    , offering a{' '}
                    <span className="bg-amber-50 text-amber-800 border-b border-amber-300 font-medium px-0.5">
                      free tier for v1.1 endpoints
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Right: Extracted Claims & Ground Truth */}
              <div className="lg:col-span-7 space-y-2">
                {/* Claim 1 */}
                <div className="rounded border border-neutral-200 bg-white p-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="inline-flex items-center space-x-1 font-medium text-red-700">
                      <XCircle className="h-3.5 w-3.5 stroke-[2]" />
                      <span>STALE CLAIM #1 — Pricing & Billing</span>
                    </span>
                    <span className="font-mono text-[11px] text-neutral-600">Freshness: 12/100</span>
                  </div>
                  <div className="text-xs text-neutral-700">
                    <span className="font-medium text-neutral-900">Claim:</span> API costs $5.00/1M tokens.
                  </div>
                  <div className="mt-1 text-xs text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-100">
                    <span className="font-medium">Current Reality:</span> OpenAI reduced GPT-4o input pricing to $2.50 per million input tokens ($10.00/1M output).
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-600">
                    <span className="font-mono">Source: openai.com/api/pricing (Official)</span>
                    <span className="text-neutral-600 font-mono">Interval: Daily check</span>
                  </div>
                </div>

                {/* Claim 2 */}
                <div className="rounded border border-neutral-200 bg-white p-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="inline-flex items-center space-x-1 font-medium text-red-700">
                      <XCircle className="h-3.5 w-3.5 stroke-[2]" />
                      <span>STALE CLAIM #2 — Corporate Leadership</span>
                    </span>
                    <span className="font-mono text-[11px] text-neutral-600">Freshness: 0/100</span>
                  </div>
                  <div className="text-xs text-neutral-700">
                    <span className="font-medium text-neutral-900">Claim:</span> Twitter is led by CEO Parag Agrawal.
                  </div>
                  <div className="mt-1 text-xs text-emerald-800 bg-emerald-50/70 p-1.5 rounded border border-emerald-100">
                    <span className="font-medium">Current Reality:</span> Linda Yaccarino has served as CEO of X Corp (formerly Twitter) since June 2023.
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-600">
                    <span className="font-mono">Source: about.x.com/en/who-we-are (Official)</span>
                    <span className="text-neutral-600 font-mono">Interval: Monthly check</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="border-b border-neutral-200 py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/40">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-semibold">
              Pipeline Architecture
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              How FreshCheck audits every claim
            </p>
            <p className="mt-3 text-sm text-neutral-600">
              Unlike simplistic citation scrapers, FreshCheck tests whether the factual statement itself
              corresponds to reality today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-900 mb-4 font-mono text-xs font-semibold">
                01
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Atomic Claim Extraction</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Deconstructs multi-paragraph LLM responses into isolated, testable factual propositions.
                Isolates numbers, dates, version strings, policy titles, and executive names.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-900 mb-4 font-mono text-xs font-semibold">
                02
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Temporal Sensitivity Profiling</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Assigns variable freshness decay rates. API pricing is evaluated on daily schedules,
                software releases weekly, regulations monthly, and historical constants annually.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-900 mb-4 font-mono text-xs font-semibold">
                03
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Live Source Grounding</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Retrieves live primary source documentation, official developer changelogs, and government
                gazettes. Validates actual text content rather than relying on stale training weights.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-900 mb-4 font-mono text-xs font-semibold">
                04
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Discrepancy & Scoring Engine</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Calculates transparent 0–100 Freshness Scores based on source authority, evidence agreement,
                and recency. Segregates freshness from verification confidence.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-900 mb-4 font-mono text-xs font-semibold">
                05
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Corrected Response Synthesis</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Generates a corrected response with verifiable citation markers [1], [2]. Never silently replaces
                uncertain claims with fabricated facts.
              </p>
            </div>

            {/* Step 6 */}
            <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-xs">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-900 mb-4 font-mono text-xs font-semibold">
                06
              </div>
              <h3 className="text-base font-semibold text-neutral-900">Continuous Drift Watch</h3>
              <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                Save mission-critical facts into persistent monitoring queues. Automatic periodic sweeps alert
                your engineering team the moment a claim decays or changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Stale Information Matrix */}
      <section className="border-b border-neutral-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-xl mb-12">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-600">Vulnerability Matrix</h2>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              Why static LLMs give convincing outdated answers
            </p>
            <p className="mt-2 text-xs text-neutral-600">
              Large language models produce fluent answers based on snapshot dates. Here is how fresh data drifts:
            </p>
          </div>

          <div className="overflow-x-auto rounded border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Domain / Category</th>
                  <th className="py-3 px-4 font-medium">Common Outdated AI Claim</th>
                  <th className="py-3 px-4 font-medium">Verified Current Truth</th>
                  <th className="py-3 px-4 font-medium">Freshness Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                <tr>
                  <td className="py-3.5 px-4 font-medium">AI Model Pricing</td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono">GPT-4o costs $5.00 / 1M tokens</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Reduced to $2.50 / 1M input tokens</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-red-50 text-red-700 px-2 py-0.5 font-mono text-[11px]">
                      HIGH (Bi-monthly drift)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Developer APIs</td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono">Twitter API v1.1 free reading tier</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">v1.1 terminated; paid tiers start at $100/mo</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-red-50 text-red-700 px-2 py-0.5 font-mono text-[11px]">
                      CRITICAL (Breaks code)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Regulatory Policy</td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono">EU AI Act is a proposed draft bill</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Entered into law on Aug 1, 2024</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-amber-50 text-amber-800 px-2 py-0.5 font-mono text-[11px]">
                      HIGH (Legal exposure)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Runtime Environments</td>
                  <td className="py-3.5 px-4 text-neutral-600 font-mono">Node.js 16 is recommended Active LTS</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Node 16/18 EOL; Node 20 & 22 are Active LTS</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-amber-50 text-amber-800 px-2 py-0.5 font-mono text-[11px]">
                      MEDIUM (Security risk)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 bg-neutral-50/30">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-semibold">
                Developer Integration
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                A single API call to verify any LLM output
              </h2>
              <p className="mt-3 text-xs text-neutral-600 leading-relaxed">
                Add FreshCheck into your RAG pipelines, agent workflows, or customer-facing chat interfaces
                before final streaming delivery.
              </p>

              <div className="mt-6 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-neutral-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-800 stroke-[2]" />
                  <span>Sub-second heuristic pre-filtering</span>
                </div>
                <div className="flex items-center space-x-2 text-neutral-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-800 stroke-[2]" />
                  <span>Real-time Google search live grounding</span>
                </div>
                <div className="flex items-center space-x-2 text-neutral-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-800 stroke-[2]" />
                  <span>Strict JSON response schema with source URLs</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={onOpenApi}
                  className="inline-flex items-center space-x-2 text-xs font-medium text-emerald-800 hover:text-emerald-700 underline underline-offset-4"
                >
                  <span>Open Interactive API Playground</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-md border border-neutral-200 bg-neutral-900 text-neutral-100 p-4 font-mono text-xs shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-neutral-600">
                  <span>POST /api/v1/verify</span>
                  <span className="text-[11px]">curl</span>
                </div>
                <pre className="text-neutral-300 overflow-x-auto leading-relaxed">
{`curl -X POST https://api.freshcheck.ai/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "response": "OpenAI GPT-4o costs $5/1M tokens.",
    "original_query": "What are current GPT-4o prices?",
    "model_name": "gpt-4o",
    "verification_depth": "deep"
  }'`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 bg-white text-xs text-neutral-600">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-800" />
            <span className="font-semibold text-neutral-900">FreshCheck AI</span>
            <span>— The Trust and Freshness Layer for Generative AI</span>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={onStartAnalysis} className="hover:text-neutral-900">
              Workspace
            </button>
            <button onClick={onExploreDashboard} className="hover:text-neutral-900">
              Dashboard
            </button>
            <button onClick={onOpenApi} className="hover:text-neutral-900">
              API Documentation
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
