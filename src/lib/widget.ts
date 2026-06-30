import api from "./api";

export const widgetApi = {
  getConfig: () => api.get("/api/chatbots/my-chatbot/widget"),
  updateConfig: (data: {
    primary_color?: string;
    position?: string;
    welcome_message?: string;
    placeholder_text?: string;
    show_branding?: boolean;
  }) => api.put("/api/chatbots/my-chatbot/widget", data),

  getQuickReplies: () => api.get("/api/chatbots/my-chatbot/quick-replies"),
  addQuickReply: (data: { text: string }) =>
    api.post("/api/chatbots/my-chatbot/quick-replies", data),
  deleteQuickReply: (id: number) =>
    api.delete(`/api/chatbots/my-chatbot/quick-replies/${id}`),

  getBusinessHours: () => api.get("/api/chatbots/my-chatbot/business-hours"),
  updateBusinessHours: (data: object) =>
    api.put("/api/chatbots/my-chatbot/business-hours", data),

  getNotifications: () => api.get("/api/chatbots/my-chatbot/notifications"),
  updateNotifications: (data: {
    notify_on_new_lead?: boolean;
    notify_on_missed_question?: boolean;
    notification_email?: string;
  }) => api.put("/api/chatbots/my-chatbot/notifications", data),
};
