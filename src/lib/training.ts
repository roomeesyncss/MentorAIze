import api from "./api";

export const feedbackApi = {
  // POST /api/chat/messages/{message_id}/feedback
  sendFeedback: (messageId: number | string, rating: "thumbs_up" | "thumbs_down", comment?: string) =>
    api.post(`/api/chat/messages/${messageId}/feedback`, { rating, comment }),
};

export const trainingApi = {
  // POST /api/training/ask - Ask AI a question in training mode
  ask: (question: string) =>
    api.post("/api/training/ask", { question }),

  // POST /api/training/approve - Approve AI response or provide corrected answer
  approve: (data: { training_id: string; approved: boolean; corrected_answer?: string }) =>
    api.post("/api/training/approve", data),

  // GET /api/training/history - Get all Q&A pairs
  getHistory: () => api.get("/api/training/history"),

  // PUT /api/training/{qa_id}?question=&approved_answer= (query params per spec)
  editQA: (qaId: number, data: { question?: string; approved_answer?: string }) =>
    api.put(`/api/training/${qaId}`, null, { params: data }),

  // DELETE /api/training/{qa_id}
  deleteQA: (qaId: number) => api.delete(`/api/training/${qaId}`),

  // PUT /api/messages/{message_id}/edit
  editMessage: (messageId: number, data: { new_content: string; save_as_training?: boolean }) =>
    api.put(`/api/messages/${messageId}/edit`, data),

  // DELETE /api/conversations/{conversation_uuid}
  deleteConversation: (uuid: string) =>
    api.delete(`/api/conversations/${uuid}`),

  // POST /api/training/suggestions/generate
  generateSuggestions: () => api.post("/api/training/suggestions/generate"),

  // GET /api/training/suggestions
  getSuggestions: (params?: { status?: "pending" | "approved" | "skipped" }) =>
    api.get("/api/training/suggestions", { params }),

  // POST /api/training/suggestions/{id}/approve
  approveSuggestion: (id: number | string, editedAnswer?: string) =>
    api.post(`/api/training/suggestions/${id}/approve`, { edited_answer: editedAnswer }),

  // POST /api/training/suggestions/{id}/skip
  skipSuggestion: (id: number | string) =>
    api.post(`/api/training/suggestions/${id}/skip`),
};
