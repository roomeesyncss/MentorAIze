import api from "./api";

export const adminApi = {
  // GET /api/admin/stats/overview - comprehensive platform stats
  getStatsOverview: () => api.get("/api/admin/stats/overview"),

  // GET /api/admin/dashboard?user_id= - dashboard for all or specific user
  getDashboardStats: (userId?: number) =>
    api.get("/api/admin/dashboard", { params: userId ? { user_id: userId } : undefined }),

  // GET /api/admin/users-list - flat list for dropdowns
  getUsersList: () => api.get("/api/admin/users-list"),

  // GET /api/admin/users?skip=&limit= - paginated user list
  getUsers: (skip?: number, limit?: number) =>
    api.get("/api/admin/users", { params: { skip, limit } }),

  // DELETE /api/admin/users/{user_id}
  deleteUser: (userId: number) => api.delete(`/api/admin/users/${userId}`),

  // GET /api/admin/recent-activity?user_id=&limit=
  getRecentActivity: (userId?: number, limit?: number) =>
    api.get("/api/admin/recent-activity", { params: { user_id: userId, limit } }),

  // GET /api/admin/analytics?user_id=
  getPlatformAnalytics: (userId?: number) =>
    api.get("/api/admin/analytics", { params: userId ? { user_id: userId } : undefined }),

  // POST /api/admin/login-as-user/{user_id}
  loginAsUser: (userId: number) => api.post(`/api/admin/login-as-user/${userId}`),
};
