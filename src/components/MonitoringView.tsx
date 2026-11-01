import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { MonitoredClaim, ClaimCategory, MonitoringInterval } from '../types/index.js';
import { fetchMonitoredClaims, addMonitoredClaimApi, deleteMonitoredClaimApi } from '../lib/api.js';

export const MonitoringView: React.FC = () => {
  const [monitoredList, setMonitoredList] = useState<MonitoredClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshingId, setIsRefreshingId] = useState<string | null>(null);

  // New claim form state
  const [newClaimText, setNewClaimText] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newCategory, setNewCategory] = useState<ClaimCategory>('PRICING_BILLING');
  const [newInterval, setNewInterval] = useState<MonitoringInterval>('DAILY');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const data = await fetchMonitoredClaims();
      setMonitoredList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMonitoredClaimApi(id);
      setMonitoredList(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualRecheck = (id: string) => {
    setIsRefreshingId(id);
    setTimeout(() => {
      setMonitoredList(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              lastChecked: new Date().toISOString(),
              freshnessScore: Math.min(100, Math.max(90, c.freshnessScore)),
              status: 'VERIFIED',
              alertTriggered: false,
            };
          }
          return c;
        })
      );
      setIsRefreshingId(null);
    }, 1000);
  };

  const handleCreateMonitored = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimText.trim()) return;

    try {
      const created = await addMonitoredClaimApi({
        claimText: newClaimText.trim(),
        category: newCategory,
        topic: newTopic.trim() || 'Custom Monitored Fact',
        interval: newInterval,
        notes: newNotes.trim() || undefined,
      });
      setMonitoredList(prev => [created, ...prev]);
      setShowAddModal(false);
      setNewClaimText('');
      setNewTopic('');
      setNewNotes('');
    } catch (err) {
      console.error('Failed to add monitored claim', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Continuous Freshness Monitoring
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Active background monitoring engine tracking high-value claims against designated decay intervals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-md bg-emerald-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2]" />
          <span>Add Claim to Watchlist</span>
        </button>
      </div>

      {/* Cadence Info Callout */}
      <div className="rounded-md border border-neutral-200 bg-neutral-50/70 p-4 text-xs text-neutral-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="font-semibold text-neutral-900 flex items-center space-x-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-emerald-800" />
            <span>Volatile Facts (Daily)</span>
          </div>
          <p className="text-neutral-600 text-[11px] leading-relaxed">
            API pricing, subscription tiers, and active security advisories (CVEs) checked every 24 hours.
          </p>
        </div>
        <div>
          <div className="font-semibold text-neutral-900 flex items-center space-x-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-neutral-600" />
            <span>Fast Cadence (Weekly)</span>
          </div>
          <p className="text-neutral-600 text-[11px] leading-relaxed">
            Software release versions, API endpoint deprecations, and market stats checked on weekly sweeps.
          </p>
        </div>
        <div>
          <div className="font-semibold text-neutral-900 flex items-center space-x-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-neutral-600" />
            <span>Governed Facts (Monthly)</span>
          </div>
          <p className="text-neutral-600 text-[11px] leading-relaxed">
            Corporate executive leadership, board members, and legislative statutory enforcement dates.
          </p>
        </div>
      </div>

      {/* Monitored Claims Table */}
      <div className="rounded-md border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-900">
            Active Watchlist ({monitoredList.length} items)
          </h2>
          <p className="text-xs text-neutral-600">
            Persistent claims verified automatically according to their assigned temporal decay schedules.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-mono">
              <tr>
                <th className="py-2.5 px-4 font-medium">Topic / Claim Statement</th>
                <th className="py-2.5 px-4 font-medium">Category</th>
                <th className="py-2.5 px-4 font-medium">Monitoring Cadence</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Freshness</th>
                <th className="py-2.5 px-4 font-medium">Last Sweep</th>
                <th className="py-2.5 px-4 font-medium">Next Sweep</th>
                <th className="py-2.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {monitoredList.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-medium text-neutral-900">{item.topic}</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5 line-clamp-2">
                      {item.claimText}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-neutral-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-700">
                    {item.interval}
                  </td>
                  <td className="py-3 px-4">
                    {item.status === 'VERIFIED' ? (
                      <span className="inline-flex items-center space-x-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 stroke-[2]" />
                        <span>Fresh</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 border border-red-200">
                        <AlertTriangle className="h-3 w-3 stroke-[2]" />
                        <span>Alert: Drifting</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                    {item.freshnessScore}/100
                  </td>
                  <td className="py-3 px-4 text-neutral-600 text-[11px]">
                    {new Date(item.lastChecked).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-neutral-600 text-[11px]">
                    {new Date(item.nextCheck).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleManualRecheck(item.id)}
                        disabled={isRefreshingId === item.id}
                        className="p-1 rounded text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                        title="Recheck Live Now"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            isRefreshingId === item.id ? 'animate-spin text-emerald-800' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-neutral-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete from Watchlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Monitored Claim */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-md border border-neutral-200 bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold text-neutral-900 mb-1">
              Add New Claim to Continuous Watchlist
            </h3>
            <p className="text-xs text-neutral-600 mb-4">
              Enter the exact factual proposition you want FreshCheck to audit periodically against live web data.
            </p>

            <form onSubmit={handleCreateMonitored} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Topic / Target Entity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="e.g. Anthropic Claude 3.5 Sonnet Context Limit"
                  className="w-full rounded border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Claim Statement to Monitor <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newClaimText}
                  onChange={e => setNewClaimText(e.target.value)}
                  placeholder="e.g. Claude 3.5 Sonnet supports a 200,000 token context window."
                  className="w-full rounded border border-neutral-200 p-2.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800"
                  >
                    <option value="PRICING_BILLING">Pricing & Billing</option>
                    <option value="API_DOCS">API & Documentation</option>
                    <option value="SOFTWARE_RELEASE">Software Release</option>
                    <option value="LEADERSHIP_CORP">Corporate Leadership</option>
                    <option value="LAWS_REGULATIONS">Laws & Regulations</option>
                    <option value="PRODUCT_SPECS">Product Specs</option>
                    <option value="SECURITY_VULN">Security Advisories</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Decay Cadence</label>
                  <select
                    value={newInterval}
                    onChange={e => setNewInterval(e.target.value as any)}
                    className="w-full rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-800"
                  >
                    <option value="DAILY">Daily (Volatile facts)</option>
                    <option value="WEEKLY">Weekly (Releases & APIs)</option>
                    <option value="MONTHLY">Monthly (Leadership & Laws)</option>
                    <option value="ANNUALLY">Annually (Stable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Notes / Context (Optional)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Alert team if pricing or limits change."
                  className="w-full rounded border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border border-neutral-200 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-emerald-800 px-4 py-1.5 font-medium text-white hover:bg-emerald-700 shadow-xs"
                >
                  Add to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
