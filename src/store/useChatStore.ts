import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearHistory: () => void;
}

const INITIAL_MSG: ChatMessage = {
  id: 'welcome-msg',
  text: 'Xin chào! Tôi là trợ lý AI của ShopAI. Tôi có thể giúp gì cho bạn hôm nay?',
  isBot: true,
  timestamp: Date.now(),
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [INITIAL_MSG],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearHistory: () => set({ messages: [INITIAL_MSG] }),
    }),
    {
      name: 'shopai-chat-history', // Tên key lưu trong ổ cứng
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);