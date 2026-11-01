import React, { useState } from 'react';
import {
  X,
  Chrome,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestInWorkspace: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  isOpen,
  onClose,
  onTestInWorkspace,
}) => {
  const [activeHover, setActiveHover] = useState<'stalePrice' | 'staleCEO' | null>('stalePrice');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-md border border-neutral-200 bg-white shadow-xl overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-neutral-200 bg-white text-emerald-800">
              <Chrome className="h-4 w-4 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900 text-sm">FreshCheck Browser Companion</h2>
              <p className="text-[11px] text-neutral-600">
                Verify factual freshness directly on ChatGPT, Claude, and Perplexity web UIs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-600 hover:text-neutral-700 rounded hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Extension Interactive Simulation */}
        <div className="p-5 space-y-4">
          <div className="rounded border border-neutral-200 bg-neutral-100/60 p-3">
            <div className="text-[11px] font-mono text-neutral-600 mb-2 flex items-center justify-between">
              <span>Interactive In-Browser Simulation: Chat.OpenAI.com</span>
              <span className="text-emerald-800 font-medium">FreshCheck Active</span>
            </div>

            {/* Simulated Chat Interface */}
            <div className="rounded border border-neutral-200 bg-white p-3.5 space-y-2 text-xs leading-relaxed text-neutral-800 font-sans shadow-2xs">
              <div className="text-[11px] font-semibold text-neutral-600 font-mono">Assistant:</div>
              <p>
                Sure, here is the information:{' '}
                <span
                  onMouseEnter={() => setActiveHover('stalePrice')}
                  className="bg-red-50 border-b-2 border-red-500 cursor-pointer font-medium px-1 py-0.5 rounded text-red-900 inline-flex items-center space-x-1"
                >
                  <span>OpenAI GPT-4o costs $5.00 per million tokens</span>
                  <span className="text-[10px] bg-red-100 text-red-700 font-mono px-1 rounded">
                    Stale (12/100)
                  </span>
                </span>
                . In addition,{' '}
                <span
                  onMouseEnter={() => setActiveHover('staleCEO')}
                  className="bg-red-50 border-b-2 border-red-500 cursor-pointer font-medium px-1 py-0.5 rounded text-red-900 inline-flex items-center space-x-1"
                >
                  <span>Twitter is headed by CEO Parag Agrawal</span>
                  <span className="text-[10px] bg-red-100 text-red-700 font-mono px-1 rounded">
                    Stale (0/100)
                  </span>
                </span>
                .
              </p>

              {/* Hover popup simulation */}
              {activeHover === 'stalePrice' && (
                <div className="mt-3 rounded border border-neutral-200 bg-neutral-900 text-neutral-100 p-3 shadow-md animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-red-400 font-semibold">OUTDATED PRICING DETECTED</span>
                    <span className="text-neutral-600">FreshCheck Engine</span>
                  </div>
                  <p className="text-xs text-neutral-200">
                    <strong>Current Fact:</strong> OpenAI reduced GPT-4o input pricing to{' '}
                    <span className="text-emerald-400 font-bold">$2.50 / 1M input tokens</span> ($10.00 output).
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-600 font-mono pt-1.5 border-t border-neutral-800">
                    <span>Source: openai.com/api/pricing (Official)</span>
                    <span className="text-emerald-400">98% confidence</span>
                  </div>
                </div>
              )}

              {activeHover === 'staleCEO' && (
                <div className="mt-3 rounded border border-neutral-200 bg-neutral-900 text-neutral-100 p-3 shadow-md animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-red-400 font-semibold">OUTDATED LEADERSHIP DETECTED</span>
                    <span className="text-neutral-600">FreshCheck Engine</span>
                  </div>
                  <p className="text-xs text-neutral-200">
                    <strong>Current Fact:</strong> Linda Yaccarino is CEO of X Corp (formerly Twitter) since June 2023.
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-600 font-mono pt-1.5 border-t border-neutral-800">
                    <span>Source: about.x.com/en/who-we-are (Official)</span>
                    <span className="text-emerald-400">99% confidence</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-neutral-600 leading-relaxed text-xs">
            <p>
              The companion extension parses AI chat screens locally in real-time, sending individual statements
              to your FreshCheck backend to highlight outdated facts without storing your chat conversations.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-600 font-mono">
            Compatible with Chromium, Firefox, & Safari
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded border border-neutral-200 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onTestInWorkspace();
              }}
              className="rounded bg-emerald-800 px-3.5 py-1.5 font-medium text-white hover:bg-emerald-700 shadow-xs"
            >
              Test Verification in Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
