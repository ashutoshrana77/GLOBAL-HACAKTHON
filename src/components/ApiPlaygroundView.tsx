import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Database,
} from 'lucide-react';

export const ApiPlaygroundView: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        response:
          "OpenAI's latest API costs $5 per million tokens for GPT-4o. The company is led by CEO Sam Altman.",
        original_query: 'What is the current pricing of GPT-4o?',
        model_name: 'gpt-4o',
        verification_depth: 'deep',
      },
      null,
      2
    )
  );

  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    setApiResponse(null);
    setResponseStatus(null);
    const start = Date.now();

    try {
      const parsed = JSON.parse(requestBody);
      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      setResponseStatus(res.status);
      const data = await res.json();
      setLatencyMs(Date.now() - start);
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setLatencyMs(Date.now() - start);
      setApiResponse(JSON.stringify({ error: err.message || 'Execution failed' }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  const getCodeSnippet = () => {
    switch (selectedLanguage) {
      case 'curl':
        return `curl -X POST https://your-domain.run.app/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.replace(/\n/g, '\n  ')}'`;
      case 'typescript':
        return `import fetch from 'node-fetch';

async function verifyAIResponse() {
  const response = await fetch('https://your-domain.run.app/api/v1/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(${requestBody})
  });

  const auditReport = await response.json();
  console.log("Overall Freshness:", auditReport.overallFreshnessScore);
  console.log("Corrected Text:", auditReport.correctedResponse);
}

verifyAIResponse();`;
      case 'python':
        return `import requests

payload = ${requestBody.replace(/true/g, 'True').replace(/false/g, 'False')}

response = requests.post(
    "https://your-domain.run.app/api/v1/verify",
    json=payload,
    headers={"Content-Type": "application/json"}
)

data = response.json()
print("Freshness Score:", data["overallFreshnessScore"])
print("Corrected Response:", data["correctedResponse"])`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Developer API & Interactive Playground
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Embed FreshCheck verification directly into your agent, RAG pipelines, or proxy middleware.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-neutral-600">
          <span className="h-2 w-2 rounded-full bg-emerald-800"></span>
          <span>REST API v1 Active</span>
        </div>
      </div>

      {/* API Reference summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="rounded-md border border-neutral-200 bg-white p-3.5 shadow-2xs">
          <div className="font-mono text-[11px] font-semibold text-emerald-800 uppercase">Endpoint</div>
          <div className="font-mono text-neutral-900 font-semibold mt-1">POST /api/v1/verify</div>
          <p className="text-neutral-600 mt-1 text-[11px]">
            Primary inspection route that decomposes responses into atomic factual statements and tests against live sources.
          </p>
        </div>

        <div className="rounded-md border border-neutral-200 bg-white p-3.5 shadow-2xs">
          <div className="font-mono text-[11px] font-semibold text-neutral-700 uppercase">Payload Parameters</div>
          <div className="text-neutral-900 font-medium mt-1">response, query, model, depth</div>
          <p className="text-neutral-600 mt-1 text-[11px]">
            Accepts plain text AI generation, optional prompt context, and verification depth (standard, deep, fast).
          </p>
        </div>

        <div className="rounded-md border border-neutral-200 bg-white p-3.5 shadow-2xs">
          <div className="font-mono text-[11px] font-semibold text-neutral-700 uppercase">Rate Limits & Security</div>
          <div className="text-neutral-900 font-medium mt-1">SSRF & Injection Hardened</div>
          <p className="text-neutral-600 mt-1 text-[11px]">
            Web source retrieval is treated as untrusted evidence. Prompt injection attempts are strictly sanitized.
          </p>
        </div>
      </div>

      {/* Interactive Playground Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Configuration */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-md border border-neutral-200 bg-white shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 flex items-center space-x-1.5">
                <span className="rounded bg-emerald-800 text-white font-mono text-[10px] px-1.5 py-0.5">POST</span>
                <span className="font-mono text-neutral-700">/api/v1/verify</span>
              </span>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center space-x-1.5 rounded bg-emerald-800 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs"
              >
                {isExecuting ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3">
              <label className="text-[11px] font-mono uppercase text-neutral-600 block mb-1.5">
                JSON Request Body
              </label>
              <textarea
                rows={12}
                value={requestBody}
                onChange={e => setRequestBody(e.target.value)}
                className="w-full rounded border border-neutral-200 p-3 font-mono text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-400 bg-neutral-50/40 leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Code Snippet Viewer */}
          <div className="rounded-md border border-neutral-200 bg-white shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="h-3.5 w-3.5 text-neutral-500" />
                <div className="flex space-x-1">
                  {(['curl', 'typescript', 'python'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 text-[11px] text-neutral-600 hover:text-neutral-900"
              >
                {copiedCode ? <Check className="h-3 w-3 text-emerald-800" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="p-3 bg-neutral-900 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed">
              <pre>{getCodeSnippet()}</pre>
            </div>
          </div>
        </div>

        {/* Right: Response Inspector */}
        <div className="lg:col-span-6">
          <div className="rounded-md border border-neutral-200 bg-white shadow-2xs overflow-hidden h-full flex flex-col">
            <div className="p-3 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-neutral-800">API Response</span>
                {responseStatus && (
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.2 rounded border ${
                      responseStatus === 200
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              {latencyMs !== null && (
                <span className="text-[11px] font-mono text-neutral-600">
                  {latencyMs}ms
                </span>
              )}
            </div>

            <div className="p-3 font-mono text-xs text-neutral-800 bg-neutral-50/20 flex-1 overflow-auto max-h-[560px]">
              {apiResponse ? (
                <pre className="whitespace-pre-wrap leading-relaxed">{apiResponse}</pre>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-neutral-600 text-xs text-center p-6">
                  <Terminal className="h-8 w-8 stroke-[1.5] mb-2 text-neutral-600" />
                  <p className="font-semibold text-neutral-700">No Request Sent Yet</p>
                  <p className="mt-1 text-[11px] text-neutral-600 max-w-xs">
                    Click "Send Request" to test the verification pipeline against the backend API.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
