import axios from "axios";

// Base API URL with fallback
const API_BASE_URL = "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Bearer token to all outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("skillgap_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiry handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and we had a token, remove it
      if (localStorage.getItem("skillgap_token")) {
        localStorage.removeItem("skillgap_token");
        // Optionally redirect or notify
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentication APIs
// ==========================================
export const authApi = {
  signup: async (userData) => {
    const res = await apiClient.post("/auth/signup", userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await apiClient.post("/auth/login", credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data;
  },
  updateProfile: async (updates) => {
    const res = await apiClient.put("/auth/profile", updates);
    return res.data;
  },
};

// ==========================================
// Resume APIs
// ==========================================
export const resumeApi = {
  uploadFile: async (file, targetRole = "Frontend Developer") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_role", targetRole);

    const res = await apiClient.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  uploadText: async (rawText, targetRole = "Frontend Developer") => {
    const formData = new FormData();
    formData.append("raw_text", rawText);
    formData.append("target_role", targetRole);

    const res = await apiClient.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  getLatest: async () => {
    const res = await apiClient.get("/resumes/latest");
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get("/resumes");
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/resumes/${id}`);
    return res.data;
  },
  deleteById: async (id) => {
    const res = await apiClient.delete(`/resumes/${id}`);
    return res.data;
  },
  improveBullet: async (bullet, contextTech = null) => {
    const res = await apiClient.post("/resume/improve-bullet", {
      bullet,
      context_tech: contextTech,
    });
    return res.data;
  },
  improveProject: async (title, description, techStack = null) => {
    const res = await apiClient.post("/resume/improve-project", {
      title,
      description,
      tech_stack: techStack,
    });
    return res.data;
  },
};

// ==========================================
// Target Job APIs
// ==========================================
export const jobApi = {
  matchJob: async (resumeId, jobTitle, company, description, url = "") => {
    const res = await apiClient.post("/jobs", {
      resume_id: resumeId,
      job_title: jobTitle,
      company,
      description,
      url,
    });
    return res.data;
  },
  getAll: async () => {
    const res = await apiClient.get("/jobs");
    return res.data;
  },
  deleteById: async (id) => {
    const res = await apiClient.delete(`/jobs/${id}`);
    return res.data;
  },
};

// ==========================================
// Skill Gap APIs
// ==========================================
export const skillGapApi = {
  getByResumeId: async (resumeId) => {
    const res = await apiClient.get(`/skill-gaps/${resumeId}`);
    return res.data;
  },
};

// ==========================================
// Learning Roadmap APIs
// ==========================================
export const roadmapApi = {
  getByResumeId: async (resumeId) => {
    const res = await apiClient.get(`/roadmap/${resumeId}`);
    return res.data;
  },
  toggleMilestone: async (resumeId, weekId, milestoneId) => {
    const res = await apiClient.put(`/roadmap/${resumeId}/toggle`, {
      week_id: weekId,
      milestone_id: milestoneId,
    });
    return res.data;
  },
};

// ==========================================
// Interview APIs
// ==========================================
export const interviewApi = {
  getPrepByResumeId: async (resumeId) => {
    const res = await apiClient.get(`/interview/${resumeId}`);
    return res.data;
  },
  evaluateAnswer: async (resumeId, questionData) => {
    const res = await apiClient.post(`/interview/${resumeId}/evaluate-answer`, questionData);
    return res.data;
  },
  saveMockSession: async (resumeId, sessionData) => {
    const res = await apiClient.post(`/interview/${resumeId}/mock`, sessionData);
    return res.data;
  },
};
