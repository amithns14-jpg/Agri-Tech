import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { chatbotService } from '../services/chatbot.service.js';
import { ChatMessageSchema } from '../validators/advisory.validator.js';

const router = Router();

// ==========================================
// POST /api/v1/chat
// ==========================================
router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const { conversation_id, message, language } = ChatMessageSchema.parse(req.body);

    const result = await chatbotService.processUserMessage(userId, message, conversation_id, language, userToken);

    res.json({
      success: true,
      message: 'Assistant response generated',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// GET /api/v1/chat/conversations
// ==========================================
router.get('/conversations', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;

    const conversations = await chatbotService.getConversations(userId, userToken);

    res.json({
      success: true,
      message: 'Conversations retrieved',
      data: conversations
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// GET /api/v1/chat/conversations/:id
// ==========================================
router.get('/conversations/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const conversationId = req.params.id;

    const messages = await chatbotService.getMessages(userId, conversationId, userToken);

    res.json({
      success: true,
      message: 'Messages retrieved',
      data: messages
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DELETE /api/v1/chat/conversations/:id
// ==========================================
router.delete('/conversations/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userToken = req.user!.token;
    const conversationId = req.params.id;

    await chatbotService.deleteConversation(userId, conversationId, userToken);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
