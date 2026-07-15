import { useState } from 'react';
import api from '@services/api';
import type { ChatMessage } from '@types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem('chatSessionId')
  );

  const sendMessage = async (message: string) => {
    try {
      setLoading(true);
      
      // Thêm tin nhắn user vào UI
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Gửi lên server
      const response = await api.post('/chat/message', {
        sessionId,
        message
      });

      const { sessionId: newSessionId, response: botResponse } = response.data.data;
      
      // Lưu sessionId
      if (!sessionId) {
        setSessionId(newSessionId);
        localStorage.setItem('chatSessionId', newSessionId);
      }

      // Thêm tin nhắn bot vào UI
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      return botResponse;
    } catch (err: any) {
      console.error('Chat error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await api.get(`/chat/history?sessionId=${sessionId}`);
      const history = response.data.data;
      setMessages(history);
    } catch (err) {
      console.error('Load history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('chatSessionId');
    setSessionId(null);
  };

  return {
    messages,
    loading,
    sessionId,
    sendMessage,
    loadHistory,
    clearMessages
  };
};