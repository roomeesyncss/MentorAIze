import api from "./api";

export const orgApi = {
  create: (data: { name: string; slug: string }) =>
    api.post("/api/organizations", data),

  getMyOrgs: () => api.get("/api/organizations/my-orgs"),

  getOrg: (id: number) => api.get(`/api/organizations/${id}`),

  inviteMember: (orgId: number, data: { email: string; role: string }) =>
    api.post(`/api/organizations/${orgId}/invite`, data),

  acceptInvite: (token: string) =>
    api.post("/api/organizations/join", { invite_token: token }),

  removeMember: (orgId: number, userId: number) =>
    api.delete(`/api/organizations/${orgId}/members/${userId}`),

  changeMemberRole: (orgId: number, userId: number, role: string) =>
    api.put(`/api/organizations/${orgId}/members/${userId}/role`, null, {
      params: { role },
    }),

  getOrgChatbot: (orgId: number) =>
    api.get(`/api/organizations/${orgId}/chatbot`),
};
