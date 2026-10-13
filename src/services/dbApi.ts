/**
 * Client API for PostgreSQL Backend (Neon Serverless)
 * Safely communicates with backend routes without ever touching or exposing DATABASE_URL
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

export async function fetchDbStatus(): Promise<DbStatusResponse> {
  try {
    const res = await fetch('/api/db/status');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as DbStatusResponse;
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
  try {
    const res = await fetch('/api/db/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return (await res.json()) as MigrationApiResponse;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Migration request failed',
      database: 'unknown',
      host: 'unknown',
      migratedTables: [],
      missingTables: [],
      durationMs: 0,
    };
  }
}

export async function apiSaveCampaign(campaign: any, userId?: string) {
  try {
    const res = await fetch(`/api/campaigns${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDeleteCampaign(id: string) {
  try {
    const res = await fetch(`/api/campaigns/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiSaveLead(lead: any, userId?: string) {
  try {
    const res = await fetch(`/api/leads${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiUpdateLeadStatus(id: string, status: string, notes?: string) {
  try {
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDeleteLead(id: string) {
  try {
    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch {
    return null;
  }
}
