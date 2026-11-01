import { VerificationResult, DashboardStats, MonitoredClaim } from '../types/index.js';

export async function verifyResponse(
  response: string,
  originalQuery?: string,
  modelName: string = 'Custom Model',
  depth: 'standard' | 'deep' | 'fast' = 'standard'
): Promise<VerificationResult> {
  const res = await fetch('/api/v1/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      response,
      original_query: originalQuery,
      model_name: modelName,
      verification_depth: depth,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Verification failed: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchVerificationHistory(): Promise<VerificationResult[]> {
  const res = await fetch('/api/v1/history');
  if (!res.ok) throw new Error('Failed to fetch verification history');
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/v1/stats');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchMonitoredClaims(): Promise<MonitoredClaim[]> {
  const res = await fetch('/api/v1/monitored');
  if (!res.ok) throw new Error('Failed to fetch monitored claims');
  return res.json();
}

export async function addMonitoredClaimApi(claim: {
  claimText: string;
  category: string;
  topic: string;
  interval: string;
  notes?: string;
}): Promise<MonitoredClaim> {
  const res = await fetch('/api/v1/monitored', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claim),
  });
  if (!res.ok) throw new Error('Failed to create monitored claim');
  return res.json();
}

export async function deleteMonitoredClaimApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/v1/monitored/${id}`, { method: 'DELETE' });
  return res.ok;
}
