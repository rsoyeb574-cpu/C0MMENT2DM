import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  testConnection,
  getExistingTables,
  getSafeDatabaseMeta,
  isDatabaseConfigured,
} from './database/db';
import { runMigration } from './database/migrate';
import {
  dbGetCampaigns,
  dbSaveCampaign,
  dbDeleteCampaign,
  dbGetTemplates,
  dbSaveTemplate,
  dbGetLeads,
  dbSaveLead,
  dbUpdateLeadStatus,
  dbDeleteLead,
  dbRecordLinkClick,
  dbUpsertUser,
  dbGetUserByEmail,
  dbUpsertInstagramAccount,
} from './database/queries';
import {
  getSetupStatus,
} from './services/setupStatusService';
import {
  getBusinessLoginUrl,
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  getInstagramUserProfile,
} from './services/instagramService';
import { encryptToken } from './services/cryptoService';
import {
  handleWebhookChallenge,
  handleWebhookEvent,
} from './webhooks/instagramWebhook';

const app = express();

// Body parser with rawBody preservation for Meta HMAC webhook signature validation
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Security headers & CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// --------------------------------------------------------------------------
// 1. Health & Database Status Endpoints
// --------------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

/**
 * Returns safe PostgreSQL database telemetry.
 * NEVER returns or logs passwords or raw connection strings.
 */
app.get('/api/db/status', async (_req: Request, res: Response) => {
  const meta = getSafeDatabaseMeta();
  const conn = await testConnection();
  const tables = await getExistingTables();

  res.json({
    configured: meta.configured,
    connected: conn.connected,
    host: meta.host,
    database: meta.database,
    ssl: meta.ssl,
    latencyMs: conn.latencyMs,
    tables,
    mode: meta.configured && conn.connected ? 'postgresql' : 'demo_memory',
    error: conn.error,
  });
});

/**
 * Executes database migrations to create all required tables
 */
app.post('/api/db/migrate', async (_req: Request, res: Response) => {
  const result = await runMigration();
  res.status(result.success ? 200 : 400).json(result);
});

// --------------------------------------------------------------------------
// 2. Authentication (PostgreSQL + Demo Fallback)
// --------------------------------------------------------------------------
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password required' });
    return;
  }

  const existing = await dbGetUserByEmail(email);
  if (existing) {
    res.status(409).json({ success: false, error: 'User with this email already exists' });
    return;
  }

  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  const created = await dbUpsertUser({
    id,
    name: name || email.split('@')[0],
    email,
    passwordHash,
    plan: 'Pro',
  });

  res.json({
    success: true,
    user: {
      id: created ? created.id : id,
      name: created ? created.name : name,
      email,
      plan: 'Pro',
      createdAt: new Date().toISOString(),
    },
  });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password required' });
    return;
  }

  const user = await dbGetUserByEmail(email);
  if (user) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (user.password_hash === hash || user.password_hash === password) {
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan || 'Pro',
          createdAt: user.created_at,
        },
      });
      return;
    }
  }

  // Demo account fallback if DB not yet migrated or using demo credentials
  if (email === 'demo@comment2dm.com' && password === 'demo123456') {
    res.json({
      success: true,
      user: {
        id: 'user_demo_01',
        name: 'Creator Studio',
        email: 'demo@comment2dm.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        plan: 'Pro',
        createdAt: '2026-03-01',
      },
    });
    return;
  }

  res.status(401).json({ success: false, error: 'Invalid email or password' });
});

// --------------------------------------------------------------------------
// 3. Instagram Setup, OAuth & Webhooks
// --------------------------------------------------------------------------
app.get('/api/setup/status', (_req: Request, res: Response) => {
  const status = getSetupStatus();
  res.json(status);
});

app.get('/api/auth/instagram/url', (req: Request, res: Response) => {
  const state = (req.query.state as string) || crypto.randomBytes(16).toString('hex');
  const url = getBusinessLoginUrl(state);
  res.json({ url, state });
});

app.get('/api/auth/instagram/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const error = req.query.error_description || req.query.error;

  if (error) {
    res.status(400).send(`<h3>Instagram Authorization Failed</h3><p>${error}</p>`);
    return;
  }

  if (!code) {
    res.status(400).send('<h3>Missing authorization code from Meta</h3>');
    return;
  }

  try {
    const shortLived = await exchangeCodeForShortLivedToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.accessToken);
    const profile = await getInstagramUserProfile(longLived.accessToken);

    // Encrypt token via AES-256-GCM
    const encryptedToken = encryptToken(longLived.accessToken);

    // Store in PostgreSQL instagram_accounts
    await dbUpsertInstagramAccount({
      id: profile.id,
      igUserId: profile.id,
      username: profile.username,
      name: profile.name,
      profilePictureUrl: profile.profilePictureUrl,
      encryptedAccessToken: encryptedToken,
      tokenExpiresAt: longLived.expiresAt,
    });

    res.send(`
      <html>
        <body style="font-family: system-ui, sans-serif; background: #0b0f19; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="background: #151c2e; padding: 2rem; border-radius: 12px; border: 1px solid #7c3aed; text-align: center; max-width: 400px;">
            <h2 style="color: #a855f7; margin-bottom: 0.5rem;">Instagram Connected!</h2>
            <p>Account <strong>@${profile.username}</strong> has been successfully authenticated and token encrypted server-side.</p>
            <p style="color: #94a3b8; font-size: 0.875rem;">You may now close this window.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'INSTAGRAM_CONNECTED', username: '${profile.username}' }, '*');
                window.close();
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`<h3>Failed to complete Instagram OAuth</h3><p>${err.message}</p>`);
  }
});

// Webhook subscription & challenge
app.get('/api/webhooks/instagram', handleWebhookChallenge);
app.post('/api/webhooks/instagram', handleWebhookEvent);

// --------------------------------------------------------------------------
// 4. Campaigns CRUD (PostgreSQL)
// --------------------------------------------------------------------------
app.get('/api/campaigns', async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const list = await dbGetCampaigns(userId);
  res.json({ success: true, campaigns: list });
});

app.post('/api/campaigns', async (req: Request, res: Response) => {
  const campaign = req.body;
  const userId = req.query.userId as string | undefined;
  const saved = await dbSaveCampaign(campaign, userId);
  res.json({ success: true, campaign: saved || campaign });
});

app.delete('/api/campaigns/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await dbDeleteCampaign(id);
  res.json({ success: true, id });
});

// --------------------------------------------------------------------------
// 5. Message Templates CRUD (PostgreSQL)
// --------------------------------------------------------------------------
app.get('/api/templates', async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const list = await dbGetTemplates(userId);
  res.json({ success: true, templates: list });
});

app.post('/api/templates', async (req: Request, res: Response) => {
  const template = req.body;
  const userId = req.query.userId as string | undefined;
  const saved = await dbSaveTemplate(template, userId);
  res.json({ success: true, template: saved || template });
});

// --------------------------------------------------------------------------
// 6. CRM Leads (PostgreSQL)
// --------------------------------------------------------------------------
app.get('/api/leads', async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const leads = await dbGetLeads(userId);
  res.json({ success: true, leads });
});

app.post('/api/leads', async (req: Request, res: Response) => {
  const lead = req.body;
  const userId = req.query.userId as string | undefined;
  const saved = await dbSaveLead(lead, userId);
  res.json({ success: true, lead: saved || lead });
});

app.patch('/api/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  await dbUpdateLeadStatus(id, status, notes);
  res.json({ success: true, id, status, notes });
});

app.delete('/api/leads/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await dbDeleteLead(id);
  res.json({ success: true, id });
});

// --------------------------------------------------------------------------
// 7. Tracked Redirects (Logged in PostgreSQL link_clicks)
// --------------------------------------------------------------------------
async function handleTrackedRedirect(req: Request, res: Response) {
  const code = req.params.code;
  const destination = (req.query.url as string) || 'https://gumroad.com/l/free-guide';
  const campaignId = (req.query.cid as string) || 'camp_guide_01';
  const leadId = req.query.lid as string | undefined;

  const referrer = req.headers.referer || req.headers.referrer || 'instagram_dm';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

  // Record link click in PostgreSQL
  await dbRecordLinkClick({
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    campaignId,
    redirectCode: code,
    destinationUrl: destination,
    leadId,
    referrer: String(referrer),
    userAgent: String(userAgent),
    ipHash,
  }).catch((err) => console.error('[DB Click Record Error]', err.message));

  // Redirect to destination
  res.redirect(302, destination);
}

app.get('/r/:code', handleTrackedRedirect);
app.get('/api/redirect/:code', handleTrackedRedirect);

// --------------------------------------------------------------------------
// 8. AI Campaign & Follow-up Assistant
// --------------------------------------------------------------------------
app.post('/api/ai-suggest', async (req: Request, res: Response) => {
  const { offer, prompt, type } = req.body;
  const offerClean = offer || 'Free PDF Guide';

  res.json({
    success: true,
    keywords: [offerClean.toUpperCase().replace(/\s+/g, '_'), 'GUIDE', 'SEND', 'DETAILS'],
    publicReplies: [
      `Just sent the details to your DMs! Check your inbox 🚀`,
      `Sent over to you! Let me know what you think 🙌`,
      `Check your DMs! It is waiting for you now ✨`,
    ],
    dmMessage: `Hey {{username}}! 🙌 Here is the ${offerClean} you requested: {{link}} Let me know if you have any questions!`,
    callToAction: `Click below to access your ${offerClean}`,
    qualificationQuestions: [
      `What is your main goal this quarter?`,
      `Are you currently working on this solo or with a team?`,
    ],
  });
});

export default app;
