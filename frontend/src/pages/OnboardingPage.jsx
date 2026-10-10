import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { useApp } from "../context/useApp";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser, showToast } = useApp();

  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(user?.targetRole || "Frontend Developer");
  const [selectedExperience, setSelectedExperience] = useState(user?.experience || "1–2 years");
  const [selectedGoals, setSelectedGoals] = useState(
    user?.goals || ["Career growth", "Skill mastery"]
  );

  const steps = [
    {
      title: "What is your target role?",
      subtitle: "We will benchmark your resume against the industry requirements for this specific role.",
      options: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Analyst / Scientist",
        "DevOps / Cloud Engineer",
        "UI/UX Designer",
      ],
      value: selectedRole,
      onSelect: setSelectedRole,
    },
    {
      title: "What is your experience level?",
      subtitle: "This helps us calibrate ATS keyword expectations and seniority benchmarks.",
      options: ["Student / Recent Grad", "Fresher / Entry-Level", "1–2 years", "3–5 years", "5+ years"],
      value: selectedExperience,
      onSelect: setSelectedExperience,
    },
    {
      title: "What are your primary career goals?",
      subtitle: "Select all that apply to tailor your personalized learning roadmap.",
      options: [
        "Pass ATS filters",
        "Close technical skill gaps",
        "Prepare for tech interviews",
        "Land a higher-paying job",
        "Transition to a new stack",
        "Polish project descriptions",
      ],
      multi: true,
      value: selectedGoals,
      onSelect: setSelectedGoals,
    },
  ];

  const currentStep = steps[step];

  const toggleGoal = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      // Save all to user profile
      updateUser({
        target_role: selectedRole,
        targetRole: selectedRole,
        experience_level: selectedExperience,
        experience: selectedExperience,
        goals: selectedGoals,
      });
      showToast("Profile configured! Welcome to your Smart Skill Gap dashboard.");
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div>
            <span>Step {step + 1} of {steps.length}</span>
            <h1>{currentStep.title}</h1>
            <p className="muted-text" style={{ marginTop: 6, fontSize: "0.95rem" }}>
              {currentStep.subtitle}
            </p>
          </div>
          <div className="progress-dots">
            {steps.map((_, idx) => (
              <span key={idx} className={idx === step ? "active" : ""} />
            ))}
          </div>
        </div>

        <div className="option-grid">
          {currentStep.options.map((option) => {
            const isSelected = currentStep.multi
              ? selectedGoals.includes(option)
              : currentStep.value === option;
            return (
              <button
                key={option}
                type="button"
                className={isSelected ? "option-pill active" : "option-pill"}
                onClick={() =>
                  currentStep.multi ? toggleGoal(option) : currentStep.onSelect(option)
                }
              >
                <span>{option}</span>
                {isSelected && <CheckCircle2 size={18} style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>

        <div className="onboarding-actions">
          <button
            className="secondary-btn"
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            style={{ visibility: step === 0 ? "hidden" : "visible" }}
          >
            Back
          </button>
          <button className="primary-btn" type="button" onClick={handleNext}>
            {step === steps.length - 1 ? (
              <>
                Finish Setup &amp; Open Dashboard <Sparkles size={16} />
              </>
            ) : (
              <>
                Continue <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
