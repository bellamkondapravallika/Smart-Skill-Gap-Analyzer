import { useEffect, useState, useCallback } from "react";
import { AppContext } from "./AppContextDefinition";
import {
  authApi,
  resumeApi,
  jobApi,
  roadmapApi,
  interviewApi,
} from "../services/apiClient";
import { calculateJobMatch } from "../services/jobMatcher.js";
import { generateDynamicRoadmap } from "../services/roadmapGenerator.js";
import { generateDynamicInterviewQuestions } from "../services/interviewGenerator.js";

export function AppProvider({ children }) {
  // Persistent Auth Token
  const [token, setToken] = useState(() => {
    return localStorage.getItem("skillgap_token") || null;
  });

  // Authenticated User (null by default - NO DEFAULT USER)
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Resume Analysis (null by default - NO DUMMY DATA)
  const [analysis, setAnalysis] = useState(() => {
    try {
      const saved = localStorage.getItem("skillgap_analysis");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Target Job (null by default)
  const [targetJob, setTargetJobState] = useState(() => {
    try {
      const saved = localStorage.getItem("skillgap_target_job");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Learning Roadmap
  const [roadmap, setRoadmap] = useState([]);

  // Analysis History
  const [history, setHistory] = useState([]);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch current user and sync data on initial mount or token change
  useEffect(() => {
    async function initAuth() {
      if (!token) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const userData = await authApi.getMe();
        setUser(userData);

        // Fetch user's latest resume and history from backend
        try {
          const resumes = await resumeApi.getAll();
          const historyItems = resumes.map((r) => ({
            id: r.id,
            role: r.target_role || "Software Engineer",
            company: "Target Company",
            fileName: r.file_name,
            fileSize: r.file_size,
            date: new Date(r.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            resumeScore: r.overall_score || 0,
            atsScore: r.ats_score || 0,
            skillsFound: r.skills_count || 0,
          }));
          setHistory(historyItems);

          // Restore latest resume analysis if available
          const latest = await resumeApi.getLatest();
          if (latest) {
            setAnalysis(latest);
            if (latest.roadmap) setRoadmap(latest.roadmap);
            if (latest.target_job) setTargetJobState(latest.target_job);
          }
        } catch (fetchErr) {
          console.warn("Could not fetch remote resumes on init:", fetchErr);
        }
      } catch (err) {
        console.warn("Auth token invalid or expired:", err);
        localStorage.removeItem("skillgap_token");
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    initAuth();
  }, [token]);

  // Sync analysis to localStorage for offline persistence
  useEffect(() => {
    try {
      if (analysis) {
        localStorage.setItem("skillgap_analysis", JSON.stringify(analysis));
      } else {
        localStorage.removeItem("skillgap_analysis");
      }
    } catch (e) {
      console.error("Failed to save analysis to localStorage:", e);
    }
  }, [analysis]);

  // ==========================================
  // Auth Actions
  // ==========================================
  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("skillgap_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.full_name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password.";
      showToast(msg, "warning");
      return { success: false, error: msg };
    }
  };

  const completeOAuthLogin = useCallback(async (accessToken, provider) => {
    try {
      localStorage.setItem("skillgap_token", accessToken);
      const userData = await authApi.getMe();
      setToken(accessToken);
      setUser(userData);
      showToast(`Welcome, ${userData.full_name}!`);
      return { success: true };
    } catch {
      localStorage.removeItem("skillgap_token");
      const providerName =
        provider === "google" ? "Google" : provider === "github" ? "GitHub" : null;
      const msg = providerName
        ? `Unable to sign in with ${providerName}. Please try again.`
        : "Could not complete sign in. Please try again.";
      showToast(msg, "warning");
      return { success: false, error: msg };
    }
  }, [showToast]);

  const signup = async (fullName, email, password, confirmPassword) => {
    try {
      const data = await authApi.signup({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      });
      localStorage.setItem("skillgap_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast("Account created successfully!");
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not create account.";
      showToast(msg, "warning");
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("skillgap_token");
    localStorage.removeItem("skillgap_analysis");
    localStorage.removeItem("skillgap_target_job");
    setToken(null);
    setUser(null);
    setAnalysis(null);
    setTargetJobState(null);
    setRoadmap([]);
    setHistory([]);
    showToast("Signed out successfully.", "info");
  };

  const updateUser = async (updates) => {
    try {
      const updated = await authApi.updateProfile(updates);
      setUser(updated);
      showToast("Profile settings updated!");
    } catch {
      setUser((prev) => ({ ...prev, ...updates }));
      showToast("Profile saved locally");
    }
  };

  // ==========================================
  // Resume & Analysis Actions
  // ==========================================
  const saveAnalysis = (newAnalysis) => {
    setAnalysis(newAnalysis);

    if (newAnalysis.roadmap && newAnalysis.roadmap.length > 0) {
      setRoadmap(newAnalysis.roadmap);
    }
    if (newAnalysis.target_job) {
      setTargetJobState(newAnalysis.target_job);
    }

    const historyItem = {
      id: newAnalysis.id || `hist-${Date.now()}`,
      role: newAnalysis.target_role || user?.target_role || "Software Engineer",
      company: newAnalysis.target_job?.company || "Target Company",
      fileName: newAnalysis.file_name || "Uploaded_Resume.pdf",
      fileSize: newAnalysis.file_size || "1.2 MB",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      matchScore: newAnalysis.scores?.jobMatch || null,
      resumeScore: newAnalysis.scores?.overall || 0,
      atsScore: newAnalysis.scores?.ats || 0,
      skillsFound: newAnalysis.scores?.skillsCount || 0,
      gapsCount: newAnalysis.skill_gaps?.length || 0,
      fullAnalysisSnapshot: newAnalysis,
    };

    setHistory((prev) => [historyItem, ...prev.filter((h) => h.id !== historyItem.id)]);
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setRoadmap([]);
    setTargetJobState(null);
    showToast("Active resume analysis cleared", "info");
  };

  const setTargetJob = (jobData) => {
    setTargetJobState(jobData);
  };

  const clearTargetJob = () => {
    setTargetJobState(null);
    if (analysis) {
      setAnalysis((prev) => ({
        ...prev,
        target_job: null,
        targetJob: null,
        jobMatch: null,
        job_match: null,
        scores: {
          ...prev.scores,
          jobMatch: null,
        },
      }));
    }
    showToast("Target job removed", "info");
  };

  // ==========================================
  // Compare with Target Job Description
  // ==========================================
  const compareWithJobDescription = async (jdText, jobTitle, company, url = "") => {
    if (!analysis) {
      showToast("Please analyze a resume first before comparing with a job.", "warning");
      return null;
    }

    try {
      // 1. Try Backend Job Match endpoint if resume has a remote ID
      if (typeof analysis.id === "number") {
        const result = await jobApi.matchJob(analysis.id, jobTitle, company, jdText, url);

        const newTargetJob = {
          title: jobTitle,
          company: company || "Target Company",
          description: jdText,
          overallMatch: result.overall_match,
          skillMatch: result.skill_match,
          keywordMatch: result.keyword_match,
          experienceMatch: result.experience_match,
        };

        setTargetJobState(newTargetJob);

        const updatedAnalysis = {
          ...analysis,
          target_role: jobTitle,
          targetRole: jobTitle,
          scores: {
            ...analysis.scores,
            jobMatch: result.overall_match,
          },
          target_job: newTargetJob,
          targetJob: newTargetJob,
          job_match: result,
          jobMatch: {
            ...result,
            overallMatch: result.overall_match,
            skillMatch: result.skill_match,
            keywordMatch: result.keyword_match,
            experienceMatch: result.experience_match,
            matchedSkills: result.matched_skills,
            missingSkills: result.missing_skills,
            partialMatches: result.partial_matches,
            skillGaps: result.skill_gaps,
            strongEvidence: result.strong_evidence || [],
            weakEvidence: result.weak_evidence || [],
            youAlreadyHave: result.you_already_have || result.matched_skills || [],
          },
          skill_gaps: result.skill_gaps,
          roadmap: result.updated_roadmap || analysis.roadmap,
          interview_questions: result.updated_interview_questions || analysis.interview_questions,
          interviewQuestions: result.updated_interview_questions || analysis.interview_questions,
        };

        setAnalysis(updatedAnalysis);
        if (result.updated_roadmap) setRoadmap(result.updated_roadmap);
        return result;
      }
    } catch (err) {
      console.warn("Backend job match call failed, falling back to local engine:", err);
    }

    // Client-side fallback matching engine
    const matchResult = calculateJobMatch(
      analysis.detected_skills || analysis.detectedSkills,
      jdText,
      jobTitle || analysis.targetRole,
      company || "Target Company",
      analysis.sections || {}
    );

    if (!matchResult) return null;

    const newTargetJob = {
      title: jobTitle || analysis.targetRole,
      company: company || "Target Company",
      description: jdText,
      overallMatch: matchResult.overallMatch,
      keywordMatch: matchResult.keywordMatch,
      experienceMatch: matchResult.experienceMatch,
      analyzedAt: "Just now",
    };

    setTargetJobState(newTargetJob);

    const techSkills =
      analysis.detected_skills?.technical || analysis.detectedSkills?.technical || [];
    const updatedRoadmap = generateDynamicRoadmap(
      matchResult.skillGaps,
      techSkills,
      jobTitle
    );

    const updatedQuestions = generateDynamicInterviewQuestions(
      analysis.detected_skills || analysis.detectedSkills,
      matchResult.skillGaps,
      analysis.sections,
      jobTitle
    );

    const updatedAnalysis = {
      ...analysis,
      targetRole: jobTitle || analysis.targetRole,
      target_role: jobTitle || analysis.targetRole,
      scores: {
        ...analysis.scores,
        jobMatch: matchResult.overallMatch,
      },
      targetJob: newTargetJob,
      target_job: newTargetJob,
      jobMatch: matchResult,
      job_match: matchResult,
      skill_gaps: matchResult.skillGaps,
      skillGaps: matchResult.skillGaps,
      roadmap: updatedRoadmap,
      interviewQuestions: updatedQuestions,
      interview_questions: updatedQuestions,
    };

    setAnalysis(updatedAnalysis);
    setRoadmap(updatedRoadmap);

    return matchResult;
  };

  // ==========================================
  // Past Analysis & History Actions
  // ==========================================
  const loadPastAnalysis = async (historyId) => {
    try {
      if (typeof historyId === "number") {
        const fullData = await resumeApi.getById(historyId);
        setAnalysis(fullData);
        if (fullData.roadmap) setRoadmap(fullData.roadmap);
        if (fullData.target_job) setTargetJobState(fullData.target_job);
        showToast(`Loaded analysis for ${fullData.file_name}`);
        return;
      }
    } catch (e) {
      console.warn("Could not fetch remote resume record:", e);
    }

    const item = history.find((h) => h.id === historyId);
    if (!item) return;

    if (item.fullAnalysisSnapshot) {
      setAnalysis(item.fullAnalysisSnapshot);
      if (item.fullAnalysisSnapshot.roadmap) {
        setRoadmap(item.fullAnalysisSnapshot.roadmap);
      }
      if (item.fullAnalysisSnapshot.targetJob || item.fullAnalysisSnapshot.target_job) {
        setTargetJobState(item.fullAnalysisSnapshot.targetJob || item.fullAnalysisSnapshot.target_job);
      }
    }
    showToast(`Loaded analysis for ${item.fileName}`);
  };

  const deleteHistoryItem = async (historyId) => {
    try {
      if (typeof historyId === "number") {
        await resumeApi.deleteById(historyId);
      }
    } catch (e) {
      console.warn("Could not delete from backend:", e);
    }
    setHistory((prev) => prev.filter((item) => item.id !== historyId));
    showToast("Analysis record removed", "info");
  };

  const clearHistory = () => {
    setHistory([]);
    showToast("History cleared", "info");
  };

  // ==========================================
  // Roadmap Actions
  // ==========================================
  const addSkillToRoadmap = (skillName, priority = "HIGH PRIORITY") => {
    const activeRoadmap = roadmap.length > 0 ? roadmap : analysis?.roadmap || [];
    const alreadyExists = activeRoadmap.some(
      (week) =>
        week.milestones?.some((m) => m.title.toLowerCase().includes(skillName.toLowerCase())) ||
        week.focus.toLowerCase().includes(skillName.toLowerCase())
    );

    if (alreadyExists) {
      showToast(`'${skillName}' is already included in your roadmap!`, "info");
      return;
    }

    const newMilestone = {
      id: `m-custom-${Date.now()}`,
      title: `${skillName} mastery & hands-on practical application (${priority})`,
      done: false,
    };

    setRoadmap((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[0] = {
          ...updated[0],
          milestones: [...(updated[0].milestones || []), newMilestone],
        };
      } else {
        updated.push({
          id: "road-1",
          week: "Week 1",
          focus: `${skillName} Fundamentals`,
          outcome: `Master core principles and apply ${skillName} in practice.`,
          priority,
          estimatedHours: "8 hrs",
          completed: false,
          milestones: [newMilestone],
          resources: [],
        });
      }
      return updated;
    });

    showToast(`Added '${skillName}' to your Learning Roadmap!`, "success");
  };

  const removeRoadmapItem = (weekId) => {
    setRoadmap((prev) => prev.filter((w) => w.id !== weekId));
    showToast("Roadmap item removed", "info");
  };

  const reorderRoadmapItem = (index, direction) => {
    setRoadmap((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy.map((w, idx) => ({ ...w, week: `Week ${idx + 1}` }));
    });
    showToast("Roadmap order updated");
  };

  const addCustomRoadmapMilestone = ({ skill, why, targetLevel, estimatedEffort, task, objectives }) => {
    const newId = `road-custom-${Date.now()}`;
    const newWeek = {
      id: newId,
      week: `Week ${roadmap.length + 1}`,
      focus: `${skill} Mastery`,
      skillName: skill,
      outcome: why || `Master core principles and apply ${skill} in practical projects.`,
      targetLevel: targetLevel || "Production Proficient",
      currentLevel: "Beginner / Unverified",
      priority: "HIGH PRIORITY",
      estimatedHours: estimatedEffort || "8 hrs",
      practiceTask: task || `Build a hands-on project module implementing ${skill}.`,
      projectTask: task || `Build a hands-on project module implementing ${skill}.`,
      completed: false,
      milestones: (objectives && objectives.length > 0 ? objectives : [`Complete fundamentals of ${skill}`, `Build practical implementation task`]).map((obj, i) => ({
        id: `m-${newId}-${i}`,
        title: obj,
        done: false,
      })),
      resources: [
        { title: `Official ${skill} Documentation`, link: `https://www.google.com/search?q=${encodeURIComponent(skill)}+documentation` }
      ]
    };

    setRoadmap((prev) => [...prev, newWeek]);
    showToast(`Added '${skill}' milestone to roadmap!`);
  };

  const toggleMilestone = async (weekId, milestoneId) => {
    if (analysis && typeof analysis.id === "number") {
      try {
        await roadmapApi.toggleMilestone(analysis.id, weekId, milestoneId);
      } catch (e) {
        console.warn("Could not sync milestone toggle to backend:", e);
      }
    }

    setRoadmap((prev) =>
      prev.map((week) => {
        if (week.id !== weekId) return week;
        const updatedMilestones = week.milestones.map((m) =>
          m.id === milestoneId ? { ...m, done: !m.done } : m
        );
        const allDone = updatedMilestones.every((m) => m.done);
        return {
          ...week,
          milestones: updatedMilestones,
          completed: allDone,
        };
      })
    );
  };

  const toggleWeekComplete = (weekId) => {
    setRoadmap((prev) =>
      prev.map((week) => {
        if (week.id !== weekId) return week;
        const nextDone = !week.completed;
        return {
          ...week,
          completed: nextDone,
          milestones: (week.milestones || []).map((m) => ({ ...m, done: nextDone })),
        };
      })
    );
    showToast("Roadmap milestone progress updated!");
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(user && token),
        authLoading,
        login,
        completeOAuthLogin,
        signup,
        logout,
        updateUser,
        analysis,
        saveAnalysis,
        clearAnalysis,
        targetJob,
        setTargetJob,
        clearTargetJob,
        compareWithJobDescription,
        history,
        loadPastAnalysis,
        deleteHistoryItem,
        clearHistory,
        roadmap,
        setRoadmap,
        addSkillToRoadmap,
        removeRoadmapItem,
        reorderRoadmapItem,
        addCustomRoadmapMilestone,
        toggleMilestone,
        toggleWeekComplete,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
