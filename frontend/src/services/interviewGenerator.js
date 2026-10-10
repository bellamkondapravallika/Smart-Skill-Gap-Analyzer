/**
 * Generates dynamic interview preparation questions based on candidate's detected skills,
 * projects, and identified skill gaps.
 */

export function generateDynamicInterviewQuestions(detectedSkills, skillGaps = [], _targetRole = "Software Engineer") {
  const technicalSkills = detectedSkills?.technical || ["JavaScript", "React"];
  const softSkills = detectedSkills?.soft || ["Problem Solving", "Communication"];
  const questions = [];
  let idCount = 1;

  // 1. Technical questions targeting candidate's DETECTED skills
  technicalSkills.slice(0, 3).forEach((skill) => {
    const q = getTechnicalQuestionForSkill(skill);
    if (q) {
      questions.push({
        id: `q-${idCount++}`,
        category: "Technical",
        difficulty: q.difficulty,
        skill: skill,
        isGapFocus: false,
        question: q.question,
        whyRecruitersAsk: q.why,
        approach: q.approach,
        sampleAnswer: q.sampleAnswer,
        keyPoints: q.keyPoints,
      });
    }
  });

  // 2. Skill-Gap focused questions targeting MISSING skills
  skillGaps.slice(0, 2).forEach((gap) => {
    const q = getGapQuestionForSkill(gap.skill);
    if (q) {
      questions.push({
        id: `q-${idCount++}`,
        category: "Skill-Gap Focus",
        difficulty: "Medium",
        skill: gap.skill,
        isGapFocus: true,
        question: q.question,
        whyRecruitersAsk: `Hiring managers test whether you understand the foundations of ${gap.skill} even if your formal resume experience with it is limited.`,
        approach: `Acknowledge your current learning stage, explain your understanding of why ${gap.skill} is used, and connect it with related technologies you already know well.`,
        sampleAnswer: q.sampleAnswer,
        keyPoints: q.keyPoints,
      });
    }
  });

  // 3. Project-based question based on candidate's top skill
  const topSkill = technicalSkills[0] || "Frontend Architecture";
  questions.push({
    id: `q-${idCount++}`,
    category: "Project-Based",
    difficulty: "Medium",
    skill: `${topSkill} Architecture`,
    isGapFocus: false,
    question: `Walk me through a complex application you built using ${topSkill}. What was the most difficult architectural decision or bug you encountered, and how did you resolve it?`,
    whyRecruitersAsk: "Evaluates end-to-end technical problem solving, debugging methodologies, and practical ownership.",
    approach: "Use the STAR method: Situation, Task, Action, and Result. Highlight architectural trade-offs and metrics.",
    sampleAnswer: `In my recent project, I designed the core state architecture using ${topSkill}. We encountered significant performance degradation when rendering large datasets. I diagnosed the bottleneck using profiler tools and resolved it by memoizing expensive operations, implementing virtualization, and cleaning up async effect subscriptions. This reduced CPU usage by 40% and improved interaction responsiveness.`,
    keyPoints: [
      "Clearly define the problem and technical constraints",
      "Explain the exact tools you used to diagnose the issue",
      "Discuss alternatives considered and why you selected the solution",
      "Conclude with a quantifiable result or measurable metric",
    ],
  });

  // 4. Behavioral question
  const topSoftSkill = softSkills[0] || "Collaboration";
  questions.push({
    id: `q-${idCount++}`,
    category: "Behavioral",
    difficulty: "Medium",
    skill: topSoftSkill,
    isGapFocus: false,
    question: "Describe a situation where a project deadline or requirement changed unexpectedly. How did you handle the reprioritization with your team?",
    whyRecruitersAsk: "Hiring managers look for resilience, transparent communication, and pragmatic focus when priorities shift under pressure.",
    approach: "Demonstrate composure, clear communication with stakeholders, proactive trade-off evaluation, and team alignment.",
    sampleAnswer: "When our product requirements shifted two weeks before launch, I immediately scheduled a sync with our engineering lead and designer. We broke down the new requirements into 'must-haves' and 'stretch goals'. By transparently communicating technical dependencies and adjusting our sprint backlog, we shipped the core functionality on time without accumulating architectural debt.",
    keyPoints: [
      "Focus on active communication and empathy rather than frustration",
      "Show how you broke down complex problems into manageable items",
      "Highlight collaboration with cross-functional stakeholders",
    ],
  });

  return questions;
}

function getTechnicalQuestionForSkill(skill) {
  const s = skill.toLowerCase();

  if (s.includes("react")) {
    return {
      difficulty: "Medium",
      question: "How does React's Reconciliation and Virtual DOM algorithm work under the hood? When does React re-render a component, and how do you prevent unnecessary re-renders?",
      why: "Tests deep understanding of React's execution model and rendering performance.",
      approach: "Explain fiber reconciliation, state/prop changes triggering render cascades, and memoization techniques.",
      sampleAnswer: "React maintains a virtual DOM tree in memory. When state or props change, React creates a new virtual DOM tree and performs a diffing algorithm (reconciliation) to compute minimal DOM mutations. Re-renders occur when a component's state updates or its parent re-renders. We prevent wasteful re-renders by lifting state appropriately, using React.memo for pure components, and wrapping functions/computations in useCallback and useMemo.",
      keyPoints: ["Virtual DOM diffing", "State & prop changes triggering re-renders", "React.memo, useCallback, useMemo", "Avoiding premature optimization"],
    };
  }

  if (s.includes("python")) {
    return {
      difficulty: "Medium",
      question: "Explain the Global Interpreter Lock (GIL) in Python. How does it affect multithreaded applications, and how do you achieve true concurrency or parallelism?",
      why: "Determines whether you understand Python's internal memory management and scaling limits.",
      approach: "Explain GIL's mutex mechanism, difference between CPU-bound vs I/O-bound tasks, and multiprocessing/asyncio solutions.",
      sampleAnswer: "The GIL is a mutex that prevents multiple native threads from executing Python bytecodes simultaneously. For I/O-bound tasks (like web requests or database queries), standard multithreading or asyncio is effective because threads release the GIL while waiting. For CPU-bound operations, we use multiprocessing to spawn separate processes with independent memory spaces, or offload computations to C-extensions like NumPy.",
      keyPoints: ["GIL mutex preventing concurrent bytecode execution", "I/O bound vs CPU bound tasks", "multiprocessing module vs threading", "asyncio event loop"],
    };
  }

  if (s.includes("fastapi")) {
    return {
      difficulty: "Medium",
      question: "What makes FastAPI so performant compared to traditional frameworks like Django or Flask? How does it leverage Python type hints and Pydantic?",
      why: "Tests knowledge of modern asynchronous Python web architecture.",
      approach: "Highlight ASGI, Starlette, Uvicorn, async/await, and automatic schema validation via Pydantic.",
      sampleAnswer: "FastAPI is built on Starlette and Pydantic, running on the ASGI standard via Uvicorn. By utilizing async/await natively, it handles concurrent I/O without blocking worker threads. FastAPI uses standard Python type annotations to automatically parse request payloads, validate data via Pydantic, generate OpenAPI/Swagger documentation, and serialize JSON responses with high throughput.",
      keyPoints: ["ASGI vs WSGI", "Pydantic data validation", "Async event loop non-blocking I/O", "Automatic OpenAPI documentation"],
    };
  }

  if (s.includes("node") || s.includes("express")) {
    return {
      difficulty: "Medium",
      question: "Explain the Node.js Event Loop phases and how Node handles asynchronous I/O with a single execution thread.",
      why: "Tests core architectural knowledge of Node.js runtime fundamentals.",
      approach: "Describe libuv, single threaded call stack, worker thread pool, and event loop phases.",
      sampleAnswer: "Node.js runs Javascript on a single thread using V8 and the libuv library. Asynchronous operations (file system, network calls) are offloaded to OS kernel threads or the libuv thread pool. When complete, their callbacks enter the event loop phases (Timers, Pending I/O, Poll, Check, Close). This enables high concurrent throughput without the memory overhead of multi-threaded thread contention.",
      keyPoints: ["Single-threaded JavaScript call stack", "libuv thread pool for blocking I/O", "Microtasks (process.nextTick, Promises) priority", "Event loop phases"],
    };
  }

  if (s.includes("sql") || s.includes("postgres")) {
    return {
      difficulty: "Hard",
      question: "How do database indexes work in relational databases like PostgreSQL? What are the performance trade-offs of adding multiple indexes to a high-write table?",
      why: "Evaluates database tuning, storage engine knowledge, and scalability.",
      approach: "Explain B-Tree structures, index lookups vs sequential scans, and write overhead during INSERT/UPDATE operations.",
      sampleAnswer: "PostgreSQL defaults to B-Tree indexes, which allow logarithmic O(log N) lookup time by storing sorted pointers to disk blocks. While indexes dramatically speed up SELECT and JOIN queries with WHERE clauses, each INSERT, UPDATE, or DELETE requires the database to update the index trees as well, increasing disk I/O and locking overhead. Therefore, indexes should be chosen judiciously on frequently queried columns.",
      keyPoints: ["B-Tree data structures", "Sequential table scans vs index seeks", "Write amplification on INSERT/UPDATE", "EXPLAIN ANALYZE for query plans"],
    };
  }

  if (s.includes("machine learning") || s.includes("tensorflow") || s.includes("pytorch")) {
    return {
      difficulty: "Hard",
      question: "Explain how you detect and prevent overfitting in deep learning models. What regularization techniques do you recommend?",
      why: "Checks model evaluation, generalization, and practical training experience.",
      approach: "Discuss validation loss divergence, Dropout, L1/L2 regularization, data augmentation, and early stopping.",
      sampleAnswer: "Overfitting occurs when a model memorizes training noise rather than general patterns, indicated by decreasing training loss but diverging validation loss. To mitigate overfitting, we implement: (1) Dropout layers to prevent co-adaptation of neurons; (2) L2 Weight Decay to penalize large weights; (3) Data augmentation to expand training variety; (4) Early stopping callbacks to halt training when validation metric plateaus.",
      keyPoints: ["Training vs Validation loss divergence", "Dropout and L1/L2 regularization", "Early stopping and learning rate scheduling", "Data augmentation"],
    };
  }

  // Default technical question
  return {
    difficulty: "Medium",
    question: `What are the core design patterns and best practices you follow when developing production code with ${skill}?`,
    why: `Assesses architectural maturity and code quality standards with ${skill}.`,
    approach: `Discuss maintainability, separation of concerns, error handling, and testing strategies for ${skill}.`,
    sampleAnswer: `When working with ${skill}, I prioritize modularity, clear separation of concerns, and defensive error handling. I ensure code is decoupled so components or services can be tested independently with automated test suites.`,
    keyPoints: ["Separation of concerns", "Error handling and edge cases", "Automated testing", "Documentation and readability"],
  };
}

function getGapQuestionForSkill(skill) {
  const s = skill.toLowerCase();

  if (s.includes("typescript")) {
    return {
      question: "What is the difference between an `interface` and a `type` alias in TypeScript? When would you use one over the other?",
      sampleAnswer: "Both can describe object shapes and contracts. `interface` supports declaration merging (extending interfaces across files or libraries) and is typically preferred for public API contracts and object shapes. `type` aliases can represent union types, primitives, tuples, and mapped types. In modern TypeScript, both are largely interchangeable for objects, but `type` is required for complex utility unions.",
      keyPoints: ["Declaration merging in interfaces", "Union and primitive types in type aliases", "Type safety benefits", "Codebase convention"],
    };
  }

  if (s.includes("docker")) {
    return {
      question: "What is the difference between a Docker Image and a Docker Container? Why is containerization preferred over traditional virtual machines?",
      sampleAnswer: "A Docker Image is an immutable, read-only template with application code and dependencies. A Container is a running, stateful instance of that image. Unlike Virtual Machines that run a full guest operating system on a hypervisor, Docker containers share the host OS kernel and isolate processes via namespaces and cgroups, making them dramatically lighter and faster to boot.",
      keyPoints: ["Images as blueprints vs Containers as running instances", "Kernel sharing vs guest OS emulation", "Resource efficiency and fast boot times"],
    };
  }

  if (s.includes("testing") || s.includes("jest")) {
    return {
      question: "What is the difference between Unit Testing, Integration Testing, and End-to-End Testing? How do you balance the testing pyramid?",
      sampleAnswer: "Unit tests verify isolated functions or components in pure isolation. Integration tests verify that multiple modules or services interact properly together (e.g. component + API layer). End-to-End tests simulate the entire user journey through the browser against a live backend. The testing pyramid recommends having many fast unit/integration tests and a smaller, focused set of critical E2E flows.",
      keyPoints: ["Testing pyramid balance", "Isolation in unit tests", "Confidence in integration tests", "Execution speed trade-offs"],
    };
  }

  return {
    question: `Explain the fundamental problem that ${skill} solves in modern software development.`,
    sampleAnswer: `${skill} was created to address scalability, developer velocity, and maintainability. It simplifies workflows by providing standardized tooling and predictable architectures.`,
    keyPoints: ["Core problem solved", "Industry adoption rationale", "Comparison with alternatives"],
  };
}

/**
 * Structured local evaluator for mock interview answers
 */
export function evaluateMockAnswer(questionObj, candidateAnswer) {
  const cleanAns = (candidateAnswer || "").trim();
  const words = cleanAns.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lowerAns = cleanAns.toLowerCase();

  if (wordCount < 10) {
    return {
      score: 30,
      readiness: "Needs Significant Elaboration",
      feedback: "Your answer is too brief to demonstrate technical depth or clear understanding to an interviewer.",
      strengths: ["Answer was submitted."],
      missingPoints: [
        "Detailed architectural context or technical specifics",
        "Concrete examples or measurable outcomes",
        "Addressing key points: " + (questionObj?.keyPoints || ["Core concepts"]).join(", ")
      ],
      improvement: "Expand on your thought process. Use the STAR framework (Situation, Task, Action, Result) to provide a complete answer of 3-5 sentences."
    };
  }

  const keyPoints = questionObj?.keyPoints || [];
  const coveredPoints = [];
  const missingPoints = [];

  keyPoints.forEach((kp) => {
    const kpWords = kp.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const hasWord = kpWords.some((w) => lowerAns.includes(w));
    if (hasWord) {
      coveredPoints.push(kp);
    } else {
      missingPoints.push(kp);
    }
  });

  let baseScore = 50;
  if (wordCount >= 50) baseScore += 20;
  else if (wordCount >= 25) baseScore += 12;
  else baseScore += 6;

  if (keyPoints.length > 0) {
    const ratio = coveredPoints.length / keyPoints.length;
    baseScore += Math.round(ratio * 30);
  }

  const finalScore = Math.min(96, Math.max(35, baseScore));

  const strengths = [];
  if (wordCount >= 35) strengths.push("Provided a structured and detailed explanation.");
  if (coveredPoints.length > 0) strengths.push(`Effectively addressed: ${coveredPoints[0]}`);
  if (/(\b\d+%\b|\bimproved\b|\breduced\b|\bmetric\b|\bscaled\b|\blatency\b)/i.test(lowerAns)) {
    strengths.push("Included clear impact indicators or quantitative metrics.");
  }
  if (strengths.length === 0) strengths.push("Addressed the central theme of the question.");

  if (missingPoints.length === 0) {
    missingPoints.push("Consider concluding with forward-looking architectural trade-offs or lessons learned.");
  }

  return {
    score: finalScore,
    readiness: finalScore >= 80 ? "Interview Ready" : finalScore >= 60 ? "Developing Competency" : "Needs Practice",
    feedback: `Your response demonstrated good foundational awareness (scored ${finalScore}/100). Focus on reinforcing concrete details and metrics.`,
    strengths,
    missingPoints,
    improvement: `To elevate your score further, explicitly articulate: '${missingPoints[0]}'.`
  };
}
