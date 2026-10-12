import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  getInstagramConfig,
  sendPrivateReply,
  SEVEN_DAYS_MS,
} from '../services/instagramService';

export interface CommentWebhookPayload {
  object: string;
  entry: Array<{
    id: string; // Instagram Account ID
    time: number;
    changes: Array<{
      field: string;
      value: {
        id: string; // Comment ID
        text: string; // Comment text
        from?: {
          id: string;
          username: string;
        };
        media?: {
          id: string;
        };
        created_time?: number; // Unix timestamp
        parent_id?: string;
      };
    }>;
  }>;
}

/**
 * Verifies webhook subscription challenge from Meta (GET /api/webhooks/instagram)
 */
export function handleWebhookChallenge(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const { verifyToken } = getInstagramConfig();

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Webhook] Verified challenge from Meta Instagram webhook subscription.');
    res.status(200).send(challenge);
  } else {
    console.warn('[Webhook] Failed challenge verification. Received token does not match.');
    res.status(403).json({ error: 'Verification token mismatch' });
  }
}

/**
 * Validates Meta X-Hub-Signature-256 header using SHA256 HMAC
 */
export function verifyMetaSignature(
  rawBody: string | Buffer,
  signatureHeader?: string,
  appSecret?: string
): boolean {
  if (!signatureHeader || !appSecret) return true; // In development/demo, allow if no secret set

  try {
    const [algo, signature] = signatureHeader.split('=');
    if (algo !== 'sha256' || !signature) return false;

    const hmac = crypto.createHmac('sha256', appSecret);
    const digest = hmac.update(rawBody).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(digest, 'hex'));
  } catch (err) {
    console.error('[Webhook Signature Error]', err);
    return false;
  }
}

/**
 * Processes incoming Instagram Webhook events (POST /api/webhooks/instagram)
 */
export async function handleWebhookEvent(req: Request, res: Response): Promise<void> {
  const { appSecret } = getInstagramConfig();
  const signature = req.headers['x-hub-signature-256'] as string | undefined;

  // Verify HMAC signature if app secret is configured
  if (appSecret && signature) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const isValid = verifyMetaSignature(rawBody, signature, appSecret);
    if (!isValid) {
      console.warn('[Webhook] Invalid X-Hub-Signature-256 received.');
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }
  }

  const payload = req.body as CommentWebhookPayload;

  if (payload.object !== 'instagram') {
    res.status(200).json({ received: true, ignored: 'Not an instagram object' });
    return;
  }

  const results: Array<{
    commentId: string;
    username: string;
    status: string;
    detail: string;
  }> = [];

  for (const entry of payload.entry || []) {
    const igUserId = entry.id;

    for (const change of entry.changes || []) {
      // Specifically handle the "comments" webhook field topic
      if (change.field === 'comments' && change.value) {
        const comment = change.value;
        const commentId = comment.id;
        const commentText = comment.text || '';
        const commenterUsername = comment.from?.username || 'follower';
        const commentCreatedTime = comment.created_time
          ? comment.created_time * 1000
          : Date.now();

        // Check 7-day rule
        const isExpired = Date.now() - commentCreatedTime > SEVEN_DAYS_MS;
        if (isExpired) {
          results.push({
            commentId,
            username: commenterUsername,
            status: 'skipped',
            detail: 'Comment is older than 7 days. Private reply window closed.',
          });
          continue;
        }

        console.log(
          `[Webhook] Processing comment on IG ${igUserId} from @${commenterUsername}: "${commentText}" (ID: ${commentId})`
        );

        // Simulated or Live Private Reply dispatch
        const replyResult = await sendPrivateReply({
          igUserId,
          commentId,
          commentTimestamp: commentCreatedTime,
          messageText: `Hey @${commenterUsername}! 🙌 Thanks for your comment. Here is your link: https://gumroad.com/l/free-guide`,
          forceDemo: process.env.NODE_ENV !== 'production' && !process.env.INSTAGRAM_ACCESS_TOKEN,
        });

        results.push({
          commentId,
          username: commenterUsername,
          status: replyResult.success
            ? replyResult.mode === 'demo'
              ? 'Demo mode'
              : 'Sent successfully'
            : 'Failed',
          detail: replyResult.detail,
        });
      }
    }
  }

  // Acknowledge Meta webhook quickly (HTTP 200 within 20s required by Meta)
  res.status(200).json({
    success: true,
    processed: results.length,
    events: results,
  });
}
