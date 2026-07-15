import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2 } from 'lucide-react';
import { useChat } from '@hooks/useChat';

interface ChatBotProps {
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const { messages, loading, sendMessage, loadHistory } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'MOTO có những dịch vụ gì?',
    'Quy trình thuê xe tự lái trên MOTO như thế nào?',
    'Quy trình thuê xe có tài xế trên MOTO như thế nào?',
    'Tôi có xe nhàn rỗi, làm thế nào đăng kí cho thuê với MOTO?',
    'Làm thế nào khi cần hỗ trợ nhanh về dịch vụ?'
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <div>
            <h3 className="font-semibold">Chatbot Mia</h3>
            <p className="text-xs opacity-90">Online • Sẵn sàng hỗ trợ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hover:bg-blue-700 p-1 rounded transition">
            <Minimize2 size={20} />
          </button>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bot size={48} className="mx-auto mb-3 text-blue-400" />
            <p className="text-sm">Xin chào! Tôi là Mia, trợ lý của MOTO.</p>
            <p className="text-sm">Tôi có thể giúp gì cho bạn?</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="flex items-center gap-1 mb-1">
                    <Bot size={14} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">Mia</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{msg.message}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length < 2 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Câu hỏi gợi ý:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(q);
                  setTimeout(handleSend, 100);
                }}
                className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-full hover:bg-blue-50 hover:border-blue-300 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;