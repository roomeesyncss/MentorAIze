import api from "./api";

export const analyticsApi = {
  getCreatorOverview: () => api.get("/api/analytics/creator/overview"),
  getUsageOverTime: (days?: number) =>
    api.get("/api/analytics/creator/usage-over-time", { params: { days } }),
  getTopUsers: (limit?: number) =>
    api.get("/api/analytics/creator/top-users", { params: { limit } }),
  getConversationsDetail: (limit?: number) =>
    api.get("/api/analytics/creator/conversations-detail", { params: { limit } }),
  getEngagementMetrics: () => api.get("/api/analytics/creator/engagement-metrics"),
  getFeedbackSummary: () => api.get("/api/analytics/feedback-summary"),
  getMissedQuestions: (params?: { limit?: number }) =>
    api.get("/api/analytics/missed-questions", { params }),
  getQuality: () => api.get("/api/analytics/quality"),
};
