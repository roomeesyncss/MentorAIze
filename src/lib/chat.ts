import api from "./api";

export const chatApi = {
  sendMessage: (data: { message: string; conversation_uuid?: string }) =>
    api.post("/api/chat/message", data),

  // GET /api/chat/conversations → list of conversations
  getConversations: () => api.get("/api/chat/conversations"),

  // GET /api/chat/conversations/{uuid} → messages in that conversation
  getConversation: (uuid: string) => api.get(`/api/chat/conversations/${uuid}`),

  deleteConversation: (uuid: string) => api.delete(`/api/chat/conversations/${uuid}`),

  // Shared chat (no auth required)
  sendSharedMessage: (shareToken: string, data: { message: string; conversation_uuid?: string }) =>
    api.post(`/api/chat/shared/${shareToken}`, data),
};
