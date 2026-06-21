import api from "./api";

export const chatbotApi = {
  create: (data: { name: string; tone_description?: string; expertise_areas?: string; response_style?: string }) =>
    api.post("/api/chatbots", data),

  getMine: () => api.get("/api/chatbots/my-chatbot"),

  update: (data: { name?: string; tone_description?: string; expertise_areas?: string; response_style?: string }) =>
    api.put("/api/chatbots/my-chatbot", data),

  updateShare: (shareEnabled: boolean) =>
    api.put("/api/chatbots/my-chatbot/share", { share_enabled: shareEnabled }),

  delete: () => api.delete("/api/chatbots/my-chatbot"),
};
