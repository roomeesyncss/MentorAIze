import api from "./api";

export const leadsApi = {
  // GET /api/leads/config
  getConfig: () => api.get("/api/leads/config"),

  // PUT /api/leads/config
  updateConfig: (data: {
    enabled: boolean;
    ask_after_messages: number;
    collect_name: boolean;
    collect_email: boolean;
    collect_phone: boolean;
    form_title?: string;
    form_description?: string;
  }) => api.put("/api/leads/config", data),

  // GET /api/leads
  getLeads: (params?: { page?: number; per_page?: number }) =>
    api.get("/api/leads", { params }),

  // GET /api/leads/export — returns CSV blob
  exportLeads: () =>
    api.get("/api/leads/export", { responseType: "blob" }),
};
