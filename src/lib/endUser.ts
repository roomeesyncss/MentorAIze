import api from "./api";

export const endUserApi = {
  // POST /api/end-users/register
  register: (data: { email: string; password: string; full_name: string; share_token: string }) =>
    api.post("/api/end-users/register", data),

  // POST /api/end-users/login
  login: (data: { email: string; password: string; share_token: string }) =>
    api.post("/api/end-users/login", data),

  // POST /api/end-users/google-signin
  googleSignIn: (data: { id_token: string; share_token: string }) =>
    api.post("/api/end-users/google-signin", data),

  // GET /api/end-users/me
  getMe: () => api.get("/api/end-users/me"),

  // PUT /api/end-users/me
  updateProfile: (data: { full_name?: string; email?: string; current_password?: string; new_password?: string }) =>
    api.put("/api/end-users/me", data),

  // GET /api/end-users/conversations
  getConversations: () => api.get("/api/end-users/conversations"),

  // GET /api/end-users/conversations/{uuid}
  getConversationMessages: (uuid: string) =>
    api.get(`/api/end-users/conversations/${uuid}`),

  // GET /api/end-users/analytics
  getAnalytics: () => api.get("/api/end-users/analytics"),
};
