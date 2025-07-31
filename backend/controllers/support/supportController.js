import { generateAIResponse } from '../../services/openai/aiSupportService.js';
import { executeAITool } from '../../services/openai/toolExecutionService.js';

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
export const chatWithAI = async (req, res) => {
  const { conversation, context } = req.body;

  try {
    const toolExecutor = async (functionName, parameters) => {
      return await executeAITool(functionName, parameters, req.user);
    };

    // Generate AI response with validated conversation and tool execution capabilities
    const result = await generateAIResponse(conversation, context, toolExecutor);

    res.status(200).json(result);

  } catch (error) {
    console.error("AI Support error:", error);
    res.status(500).json({ message: "Failed to get AI response" });
  }
};