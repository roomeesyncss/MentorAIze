import api from "./api";

export const knowledgeApi = {
  // Documents
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getDocuments: () => api.get("/api/documents"),
  deleteDocument: (uuid: string) => api.delete(`/api/documents/${uuid}`),

  // Training Notes
  createNote: (data: { title: string; content: string }) =>
    api.post("/api/training-notes", data),
  getNotes: () => api.get("/api/training-notes"),
  updateNote: (uuid: string, data: { title?: string; content?: string }) =>
    api.put(`/api/training-notes/${uuid}`, data),
  deleteNote: (uuid: string) => api.delete(`/api/training-notes/${uuid}`),

  // Transcripts
  createTranscript: (data: { title: string; video_url: string }) =>
    api.post("/api/transcripts", data),
  getTranscripts: () => api.get("/api/transcripts"),
  deleteTranscript: (uuid: string) => api.delete(`/api/transcripts/${uuid}`),

  // Website sources
  addWebsite: (data: { url: string; title?: string }) =>
    api.post("/api/website-sources", data),
  getWebsites: () => api.get("/api/website-sources"),
  deleteWebsite: (uuid: string) => api.delete(`/api/website-sources/${uuid}`),

  // Audio sources
  uploadAudio: (file: File, title: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    return api.post("/api/audio-sources", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAudioSources: () => api.get("/api/audio-sources"),
  deleteAudio: (uuid: string) => api.delete(`/api/audio-sources/${uuid}`),

  // Sitemap
  crawlSitemap: (data: { url: string; title?: string; max_pages?: number }) =>
    api.post("/api/sitemap-sources", data),
  getSitemaps: () => api.get("/api/sitemap-sources"),
  deleteSitemap: (uuid: string) => api.delete(`/api/sitemap-sources/${uuid}`),
};
