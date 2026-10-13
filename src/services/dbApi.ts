/**
 * Client API for PostgreSQL Backend (Neon Serverless)
 * Securely uses session cookies (httpOnly) - never sends userId.
 * Propagates real database error messages without exposing credentials.
 */

export interface DbStatusResponse {
  configured: boolean;
  connected: boolean;
  host: string;
  database: string;
  ssl: boolean;
  latencyMs?: number;
  tables: string[];
  mode: 'postgresql' | 'demo_memory';
  error?: string;
}

export interface MigrationApiResponse {
  success: boolean;
  message: string;
  database: string;
  host: string;
  migratedTables: string[];
  missingTables: string[];
  durationMs: number;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // Ensures session_token cookie is always sent
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as any).status = res.status;
    throw err;
  }

  return data as T;
}

// --------------------------------------------------------------------------
// 1. Database Status & Migration
// --------------------------------------------------------------------------

export async function fetchDbStatus(): Promise<DbStatusResponse> {
  try {
    return await request<DbStatusResponse>('/api/db/status');
  } catch (err: any) {
    return {
      configured: false,
      connected: false,
      host: 'local-demo',
      database: 'memory',
      ssl: false,
      tables: [],
      mode: 'demo_memory',
      error: err.message || 'Unable to connect to backend',
    };
  }
}

export async function triggerDbMigration(): Promise<MigrationApiResponse> {
  return await request<MigrationApiResponse>('/api/db/migrate', {
    method: 'POST',
  });
}

// --------------------------------------------------------------------------
// 2. Authentication (PostgreSQL Session Cookie)
// --------------------------------------------------------------------------

export async function apiSignup(name: string, email: string, password: string) {
  return await request<{ success: boolean; user: any }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogin(email: string, password: string) {
  return await request<{ success: boolean; user: any }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout() {
  return await request<{ success: boolean }>('/api/auth/logout', {
    method: 'POST',
  });
}

export async function apiGetMe() {
  return await request<{ success: boolean; user: any }>('/api/auth/me');
}

// --------------------------------------------------------------------------
// 3. Campaigns (PostgreSQL)
// --------------------------------------------------------------------------

export async function apiGetCampaigns() {
  return await request<{ success: boolean; campaigns: any[] }>('/api/campaigns');
}

export async function apiSaveCampaign(campaign: any) {
  return await request<{ success: boolean; campaign: any }>('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaign),
  });
}

export async function apiUpdateCampaignStatus(id: string, status: string) {
  return await request<{ success: boolean; campaign: any }>(`/api/campaigns/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiDeleteCampaign(id: string) {
  return await request<{ success: boolean; id: string }>(`/api/campaigns/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------
// 4. Message Templates (PostgreSQL)
// --------------------------------------------------------------------------

export async function apiGetTemplates() {
  return await request<{ success: boolean; templates: any[] }>('/api/templates');
}

export async function apiSaveTemplate(template: any) {
  return await request<{ success: boolean; template: any }>('/api/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
}

export async function apiDeleteTemplate(id: string) {
  return await request<{ success: boolean; id: string }>(`/api/templates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------
// 5. CRM Leads (PostgreSQL)
// --------------------------------------------------------------------------

export async function apiGetLeads() {
  return await request<{ success: boolean; leads: any[] }>('/api/leads');
}

export async function apiSaveLead(lead: any) {
  return await request<{ success: boolean; lead: any }>('/api/leads', {
    method: 'POST',
    body: JSON.stringify(lead),
  });
}

export async function apiUpdateLeadStatus(id: string, status: string, notes?: string) {
  return await request<{ success: boolean; lead: any }>(`/api/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}

export async function apiDeleteLead(id: string) {
  return await request<{ success: boolean; id: string }>(`/api/leads/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------
// 6. Comment Events & DM Events (PostgreSQL)
// --------------------------------------------------------------------------

export async function apiGetCommentEvents() {
  return await request<{ success: boolean; events: any[] }>('/api/events/comments');
}

export async function apiRecordCommentEvent(event: any) {
  return await request<{ success: boolean; event: any }>('/api/events/comments', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export async function apiGetDmEvents() {
  return await request<{ success: boolean; events: any[] }>('/api/events/dms');
}

export async function apiRecordDmEvent(dm: any) {
  return await request<{ success: boolean; event: any }>('/api/events/dms', {
    method: 'POST',
    body: JSON.stringify(dm),
  });
}

// --------------------------------------------------------------------------
// 7. Link Clicks & Usage Records (PostgreSQL)
// --------------------------------------------------------------------------

export async function apiGetLinkClicks() {
  return await request<{ success: boolean; clicks: any[] }>('/api/clicks');
}

export async function apiRecordLinkClick(click: any) {
  return await request<{ success: boolean; click: any }>('/api/clicks', {
    method: 'POST',
    body: JSON.stringify(click),
  });
}

export async function apiGetUsageRecords(period?: string) {
  const url = period ? `/api/usage?period=${encodeURIComponent(period)}` : '/api/usage';
  return await request<{ success: boolean; records: any[] }>(url);
}

export async function apiRecordUsage(usage: any) {
  return await request<{ success: boolean; usage: any }>('/api/usage', {
    method: 'POST',
    body: JSON.stringify(usage),
  });
}
