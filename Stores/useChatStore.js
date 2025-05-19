import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  sendMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
}));

export default useChatStore;