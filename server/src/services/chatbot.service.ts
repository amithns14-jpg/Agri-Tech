import { v4 as uuidv4 } from 'uuid';
import { geminiService } from './gemini.service.js';
import { getAuthenticatedSupabaseClient, localDb } from '../utils/supabase.js';
import { env } from '../config/env.js';
import { ChatbotResponseResult } from '../types/index.js';

export class ChatbotService {
  async processUserMessage(
    userId: string,
    message: string,
    conversationId?: string,
    language: string = 'en',
    userToken?: string
  ): Promise<{ conversationId: string; response: ChatbotResponseResult }> {
    let convId = conversationId;
    let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // 1. Get or create conversation
    if (!convId) {
      convId = uuidv4();
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      const convRecord = {
        id: convId,
        user_id: userId,
        title,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (env.isSupabaseConfigured && userToken) {
        const client = getAuthenticatedSupabaseClient(userToken);
        if (client) {
          try {
            await client.from('chat_conversations').insert(convRecord);
          } catch (err) {
            console.error('[ChatbotService] Failed to create Supabase conversation:', err);
          }
        }
      }
      localDb.insert('chat_conversations', convRecord);
    } else {
      // Retrieve prior messages
      if (env.isSupabaseConfigured && userToken) {
        const client = getAuthenticatedSupabaseClient(userToken);
        if (client) {
          try {
            const { data } = await client
              .from('chat_messages')
              .select('role, content')
              .eq('conversation_id', convId)
              .order('created_at', { ascending: true })
              .limit(10);
            if (data) history = data as any;
          } catch (err) {
            console.error('[ChatbotService] Failed to load messages:', err);
          }
        }
      } else {
        const msgs = localDb.find('chat_messages', m => m.conversation_id === convId);
        history = msgs.map(m => ({ role: m.role, content: m.content }));
      }
    }

    // 2. Save user message
    const userMsgId = uuidv4();
    const userMsg = {
      id: userMsgId,
      conversation_id: convId,
      user_id: userId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          await client.from('chat_messages').insert(userMsg);
        } catch (err) {
          console.error('[ChatbotService] Failed to save user message:', err);
        }
      }
    }
    localDb.insert('chat_messages', userMsg);

    // 3. Generate response with Gemini
    const botResponse = await geminiService.generateAgriculturalChatResponse(history, message, language);

    // 4. Save assistant response
    const botMsgId = uuidv4();
    const botMsg = {
      id: botMsgId,
      conversation_id: convId,
      user_id: userId,
      role: 'assistant',
      content: botResponse.answer,
      created_at: new Date().toISOString()
    };

    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        try {
          await client.from('chat_messages').insert(botMsg);
        } catch (err) {
          console.error('[ChatbotService] Failed to save assistant message:', err);
        }
      }
    }
    localDb.insert('chat_messages', botMsg);

    return {
      conversationId: convId,
      response: botResponse
    };
  }

  async getConversations(userId: string, userToken?: string) {
    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client
          .from('chat_conversations')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        if (!error && data) return data;
      }
    }
    return localDb.find('chat_conversations', c => c.user_id === userId);
  }

  async getMessages(userId: string, conversationId: string, userToken?: string) {
    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        const { data, error } = await client
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (!error && data) return data;
      }
    }
    return localDb.find('chat_messages', m => m.conversation_id === conversationId);
  }

  async deleteConversation(userId: string, conversationId: string, userToken?: string) {
    if (env.isSupabaseConfigured && userToken) {
      const client = getAuthenticatedSupabaseClient(userToken);
      if (client) {
        await client.from('chat_conversations').delete().eq('id', conversationId).eq('user_id', userId);
      }
    }
    localDb.delete('chat_conversations', conversationId);
    // Delete associated messages
    const msgs = localDb.find('chat_messages', m => m.conversation_id === conversationId);
    for (const m of msgs) {
      localDb.delete('chat_messages', m.id);
    }
    return true;
  }
}

export const chatbotService = new ChatbotService();
