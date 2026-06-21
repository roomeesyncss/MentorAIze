import api from "./api";

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),

  googleSignIn: (idToken: string) =>
    api.post("/api/auth/google-signin", { id_token: idToken }),

  logout: () => api.post("/api/auth/logout"),

  getMe: () => api.get("/api/auth/me"),

  updateProfile: (data: { full_name?: string; email?: string; current_password?: string; new_password?: string }) =>
    api.put("/api/auth/me", data),
};
