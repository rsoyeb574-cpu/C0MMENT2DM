import { AISuggestionResult } from '../types';

/**
 * Generates tailored trigger keywords, public reply drafts, private DM copy,
 * call-to-action, and qualification questions based on the user's campaign offer.
 */
export async function generateCampaignSuggestions(offerText: string): Promise<AISuggestionResult> {
  const cleanOffer = offerText.trim();
  const lower = cleanOffer.toLowerCase();

  // Try server endpoint if available
  try {
    const res = await fetch('/api/ai-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offer: cleanOffer }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.keywords) && data.dmMessage) {
        return data as AISuggestionResult;
      }
    }
  } catch {
    // Graceful fallback to client-side heuristic engine
  }

  // Domain-specific heuristic copy engine based on the offer context
  if (lower.includes('course') || lower.includes('class') || lower.includes('learn') || lower.includes('mastery') || lower.includes('cohort')) {
    return {
      keywords: ['COURSE', 'LEARN', 'SYLLABUS', 'COHORT', 'PRO'],
      publicReplies: [
        'Sent course syllabus and early bird discount to your DMs! 🎓📥',
        'Check your direct messages! Curriculum breakdown just landed 🚀',
        'DM sent! Everything you need to enroll is in your inbox 🙌',
      ],
      dmMessage:
        'Hey {{username}}! 🎓 Super thrilled you want to master this skill.\n\nHere is the full syllabus, live schedule, and your early bird pass:\n{{link}}\n\nCohort seats are strictly limited, let me know if you have any questions!',
      callToAction: 'View Course Curriculum & Enroll',
      qualificationQuestions: [
        'What is your current skill level (Beginner or Intermediate)?',
        'Are you looking to learn for personal projects or for clients?',
      ],
    };
  }

  if (lower.includes('discount') || lower.includes('coupon') || lower.includes('sale') || lower.includes('deal') || lower.includes('offer') || lower.includes('off')) {
    return {
      keywords: ['DEAL', 'SAVE', 'DISCOUNT', 'COUPON', 'FLASH'],
      publicReplies: [
        'Sent you the 50% discount coupon in your direct messages! 🏷️',
        'Check your DMs! Special promo code is waiting for you 🎁',
        'Code dispatched to your inbox! Happy shopping ✨',
      ],
      dmMessage:
        'Woohoo {{username}}! 🏷️ Thanks for checking out our flash sale.\n\nUse code VIP50 at checkout for the discounted rate:\n{{link}}\n\nThis coupon code expires in 24 hours!',
      callToAction: 'Claim Flash Sale Discount',
      qualificationQuestions: [
        'Which item or bundle were you planning to grab?',
      ],
    };
  }

  if (lower.includes('book') || lower.includes('call') || lower.includes('consult') || lower.includes('meeting') || lower.includes('strategy') || lower.includes('audit')) {
    return {
      keywords: ['CALL', 'BOOK', 'AUDIT', 'MEETING', 'STRATEGY'],
      publicReplies: [
        'Calendar link sent to your DMs! Choose a slot that works 📅🚀',
        'Sent the private booking link to your direct messages! 📥',
        'Check your inbox! Let us audit your business together 🤝',
      ],
      dmMessage:
        'Hey {{username}}! 📅 Lets connect 1-on-1 and audit your current setup.\n\nPick a convenient 20-minute slot directly on my calendar:\n{{link}}\n\nLooking forward to speaking with you!',
      callToAction: 'Schedule Free Strategy Call',
      qualificationQuestions: [
        'What is your current monthly revenue or budget?',
        'What is your primary roadblock right now?',
      ],
    };
  }

  if (lower.includes('webinar') || lower.includes('live') || lower.includes('workshop') || lower.includes('masterclass')) {
    return {
      keywords: ['WEBINAR', 'LIVE', 'SEAT', 'WORKSHOP', 'REGISTER'],
      publicReplies: [
        'Your VIP webinar pass is waiting in your DMs! See you live 🎙️',
        'Sent your direct Zoom registration link to your messages! 📥',
        'Check your DMs! Webinar seat confirmed 🚀',
      ],
      dmMessage:
        'Hey {{username}}! 🎙️ Your seat has been reserved for our live training workshop.\n\nConfirm your registration & get the direct room link here:\n{{link}}\n\nLive Q&A and recording replay included for all attendees!',
      callToAction: 'Reserve Free Webinar Seat',
      qualificationQuestions: [
        'Will you be joining live or watching the recording replay?',
      ],
    };
  }

  if (lower.includes('price') || lower.includes('quote') || lower.includes('cost') || lower.includes('rates') || lower.includes('hire') || lower.includes('service')) {
    return {
      keywords: ['PRICE', 'QUOTE', 'RATES', 'COST', 'SERVICE'],
      publicReplies: [
        'Full pricing guide & commercial rates sent to your DMs! 💼',
        'Check your direct messages for our transparent packages breakdown 📥',
        'Sent! Project tiers and intake questionnaire are in your inbox 🙌',
      ],
      dmMessage:
        'Hey {{username}}! 💼 Thanks for inquiring about our services and commercial rates.\n\nHere is our transparent package breakdown and deliverables document:\n{{link}}\n\nFeel free to reply right here once you take a look!',
      callToAction: 'View Transparent Pricing Packages',
      qualificationQuestions: [
        'What is your estimated project timeline and launch goal?',
        'Do you have an existing design or brand brief ready?',
      ],
    };
  }

  if (lower.includes('affiliate') || lower.includes('gear') || lower.includes('setup') || lower.includes('link') || lower.includes('recommend') || lower.includes('outfit')) {
    return {
      keywords: ['GEAR', 'LINKS', 'SHOP', 'OUTFIT', 'SETUP'],
      publicReplies: [
        'Sent the exact links with creator discounts to your DMs! ✨',
        'Check your direct messages! Studio setup breakdown inside 📥',
        'Dispatched to your inbox! Discount code automatically applied 🛍️',
      ],
      dmMessage:
        'Hey {{username}}! ✨ Found the exact items you noticed in the reel:\n\n{{link}}\n\nAll creator partner discounts are auto-applied at checkout for you. Enjoy!',
      callToAction: 'Shop Vetted Recommendations',
      qualificationQuestions: [
        'Are you looking for desk ergonomics or camera gear?',
      ],
    };
  }

  if (lower.includes('launch') || lower.includes('waitlist') || lower.includes('early') || lower.includes('vip')) {
    return {
      keywords: ['LAUNCH', 'VIP', 'EARLY', 'ACCESS', 'WAITLIST'],
      publicReplies: [
        'You are on the VIP list! Private early access sent to your DMs 🚀',
        'Check your inbox! Early bird invite code dispatched 📥',
        'Sent! Welcome to the insider launch group 🙌',
      ],
      dmMessage:
        'Hey {{username}}! 🚀 You have secured early access for our upcoming launch.\n\nClaim your VIP reservation & unlock early pricing here:\n{{link}}\n\nSpots are limited to the first 100 supporters!',
      callToAction: 'Unlock VIP Launch Access',
      qualificationQuestions: [
        'Which feature or tier are you most eager to get first?',
      ],
    };
  }

  // Default: Ebook / Lead Magnet / Resource Blueprint
  const mainWord = cleanOffer
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .join(' ')
    .toUpperCase() || 'GUIDE';

  return {
    keywords: [mainWord.split(' ')[0] || 'GUIDE', 'PDF', 'BLUEPRINT', 'SEND', 'ACCESS'],
    publicReplies: [
      'Sent you a DM! Check your inbox for the download link 🚀',
      'Just dropped the resource into your direct messages! 📥',
      'DM sent! Let me know once you go through the breakdown 🙌',
    ],
    dmMessage: `Hey {{username}}! 🙌 Here is the ${cleanOffer || 'resource'} you requested:\n\n{{link}}\n\nInside you'll find the full breakdown + tactical steps. Hope it helps!`,
    callToAction: `Download ${cleanOffer.slice(0, 28) || 'Resource'}`,
    qualificationQuestions: [
      'What is your primary goal for this week?',
    ],
  };
}
