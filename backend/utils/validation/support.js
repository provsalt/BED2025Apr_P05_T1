import { z } from 'zod/v4';
import { moderateContent } from '../../services/openai/openaiService.js';

// Define allowed roles - only user and assistant to prevent privilege escalation
const allowedRoles = ['user', 'assistant'];

// Define allowed contexts
const allowedContexts = ['general', 'medical', 'nutrition', 'transport', 'community', 'chat'];

/**
 * Sanitize and normalize content to prevent injection attacks
 * @param {string} content - Raw content to sanitize
 * @returns {string} - Sanitized content
 */
function sanitizeContent(content) {
  if (typeof content !== 'string') return '';
  
  // Normalize unicode and remove zero-width characters
  let cleaned = content.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Remove excessive whitespace and normalize line breaks
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove potential instruction markers and role prefixes
  cleaned = cleaned.replace(/^(system|assistant|human|user)\s*:?\s*/i, '');
  
  // Remove common instruction tokens
  cleaned = cleaned.replace(/\[(INST|\/INST)\]/gi, '');
  cleaned = cleaned.replace(/<\|.*?\|>/g, '');
  cleaned = cleaned.replace(/<\/?system>/gi, '');
  
  // Remove or replace potential injection keywords (make them harmless)
  const injectionTerms = [
    'ignore previous', 'ignore all previous', 'forget everything', 'forget all',
    'new instructions', 'new system', 'override', 'disregard', 'nevermind',
    'actually', 'instead', 'however', 'but really', 'in reality'
  ];
  
  injectionTerms.forEach(term => {
    const regex = new RegExp(term.replace(/\s+/g, '\\s+'), 'gi');
    cleaned = cleaned.replace(regex, term.replace(/\s/g, '_'));
  });
  
  return cleaned;
}

const safeContent = z.string()
  .min(1, "Message content cannot be empty")
  .max(2000, "Message content too long")
  .transform(sanitizeContent)
  .refine(
    async (content) => {
      // Use OpenAI moderation API for free safety check
      try {
        const moderation = await moderateContent(content);
        return moderation.safe;
      } catch (error) {
        console.error('Moderation check failed:', error);
        return false;
      }
    },
    "Content flagged by safety moderation"
  );

const conversationMessage = z.object({
  role: z.enum(allowedRoles, {
    errorMap: () => ({ message: "Role must be 'user' or 'assistant'" })
  }),
  content: safeContent
});

/**
 * Validate conversation structure and content
 * @param {Array} messages - Array of conversation messages
 * @returns {boolean} - Whether conversation appears safe
 */
function isConversationSafe(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  
  if (messages[messages.length - 1].role !== 'user') return false;
  
  let userMessages = 0;
  let assistantMessages = 0;
  
  for (const msg of messages) {
    if (msg.role === 'user') userMessages++;
    if (msg.role === 'assistant') assistantMessages++;
  }
  // do not allow more than 2 user messages in a row
  return !(userMessages === 0 || userMessages > assistantMessages + 2);
}

// Support chat request schema with enhanced validation
export const supportChatSchema = z.object({
  conversation: z.array(conversationMessage)
    .min(1, "Conversation must contain at least one message")
    .max(20, "Conversation too long - maximum 20 messages") // Reduced for security
    .refine(isConversationSafe, "Conversation structure appears unsafe"),
  
  context: z.enum(allowedContexts).default('general')
});