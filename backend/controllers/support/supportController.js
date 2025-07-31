import { generateAIResponse } from '../../services/openai/aiSupportService.js';
import { executeAITool } from '../../services/openai/toolExecutionService.js';
import { ErrorFactory } from '../../utils/AppError.js';

/**
 * @openapi
 * /api/support/chat:
 *   post:
 *     tags:
 *       - Support
 *     summary: Chat with AI support agent that can perform app tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversation:
 *                 type: array
 *                 description: Full conversation array including the current user message
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *               context:
 *                 type: string
 *                 description: Optional context about the application area
 *                 enum: [general, medical, nutrition, transport, community, chat]
 *     responses:
 *       200:
 *         description: AI response with possible tool execution results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: AI agent's natural language response
 *                 toolsUsed:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       function:
 *                         type: string
 *                       result:
 *                         type: object
 *       400:
 *         description: Conversation array is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const chatWithAI = async (req, res, next) => {
  const { conversation, context } = req.body;

  try {
    const toolExecutor = async (functionName, parameters) => {
      return await executeAITool(functionName, parameters, req.user || null);
    };

    // Generate AI response with validated conversation and tool execution capabilities
    const result = await generateAIResponse(conversation, context, toolExecutor);

    res.status(200).json(result);

  } catch (error) {
    if (error.name === 'AppError') {
      return next(error);
    }
    
    // Handle OpenAI API errors
    if (error.status === 401) {
      return next(ErrorFactory.external("OpenAI", "Invalid API key", "AI service unavailable"));
    }
    
    if (error.status === 429) {
      return next(ErrorFactory.rateLimited("AI service rate limit exceeded"));
    }
    
    if (error.status >= 400 && error.status < 500) {
      return next(ErrorFactory.external("OpenAI", error.message, "Invalid request to AI service"));
    }
    
    if (error.status >= 500) {
      return next(ErrorFactory.external("OpenAI", error.message, "AI service temporarily unavailable"));
    }

    // Generic error fallback
    return next(ErrorFactory.external("AI Support", error.message, "Failed to get AI response"));
  }
};