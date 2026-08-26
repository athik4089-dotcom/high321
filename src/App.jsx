import { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import VoiceAIChat from "./src/VoiceAIChat";
const COMPANIES = [
  {
    id: "apex",
    name: "Apex Energy Prototype",
    location: "Demo Industrial Zone A",
    emergency: "1800-100-1001",
    lat: 11.0168,
    lng: 76.9558,
    machines: [
      { id: "p101", name: "Pump P-101", temp: 68, vibration: 3.2, pressure: 120 },
      { id: "c201", name: "Compressor C-201", temp: 74, vibration: 4.1, pressure: 145 },
      { id: "t301", name: "Tank T-301", temp: 38, vibration: 0.4, pressure: 18 },
    ],
  },
  {
    id: "bharat",
    name: "Bharat Petro Demo",
    location: "Demo Refinery Zone B",
    emergency: "1800-100-1002",
    lat: 12.9716,
    lng: 77.5946,
    machines: [
      { id: "p102", name: "Pump P-102", temp: 61, vibration: 2.8, pressure: 110 },
      { id: "h101", name: "Heater H-101", temp: 89, vibration: 1.1, pressure: 95 },
    ],
  },
  {
    id: "indus",
    name: "Indus Oil Prototype",
    location: "Demo Terminal Zone C",
    emergency: "1800-100-1003",
    lat: 13.0827,
    lng: 80.2707,
    machines: [
      { id: "p501", name: "Transfer Pump P-501", temp: 64, vibration: 3.8, pressure: 135 },
      { id: "v601", name: "Valve Station V-601", temp: 42, vibration: 0.2, pressure: 75 },
    ],
  },
  {
    id: "ocean",
    name: "Ocean Fuel Demo",
    location: "Demo Offshore Control",
    emergency: "1800-100-1004",
    lat: 9.9312,
    lng: 76.2673,
    machines: [
      { id: "g701", name: "Gas Compressor G-701", temp: 72, vibration: 4.6, pressure: 150 },
      { id: "p702", name: "Emergency Pump P-702", temp: 58, vibration: 2.1, pressure: 115 },
    ],
  },
  {
    id: "frontier",
    name: "Frontier Gas Prototype",
    location: "Demo Gas Processing Unit",
    emergency: "1800-100-1005",
    lat: 17.385,
    lng: 78.4867,
    machines: [
      { id: "s801", name: "Separator S-801", temp: 48, vibration: 0.5, pressure: 88 },
      { id: "c802", name: "Compressor C-802", temp: 76, vibration: 5.2, pressure: 160 },
    ],
  },
];

const translations = {
  English: {
    dashboard: "Dashboard",
    report: "Report Hazard",
    analytics: "Analytics",
    companies: "Companies",
    machines: "Machines",
  },
  Tamil: {
    dashboard: "டாஷ்போர்டு",
    report: "ஆபத்து புகார்",
    analytics: "பகுப்பாய்வு",
    companies: "நிறுவனங்கள்",
    machines: "இயந்திரங்கள்",
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    report: "खतरे की रिपोर्ट",
    analytics: "विश्लेषण",
    companies: "कंपनियां",
    machines: "मशीनें",
  },
};

function calculateRisk(text = "", category = "") {
  const value = `${text} ${category}`.toLowerCase();

  let score = 5;

  const criticalWords = [
    "fire",
    "explosion",
    "gas leak",
    "toxic",
    "fatal",
    "death",
    "live wire",
    "electrocution",
    "h2s",
    "hydrogen sulfide",
    "confined space",
    "major leak",
  ];

  const highWords = [
    "oil leak",
    "chemical",
    "machine",
    "rotating",
    "crane",
    "fall",
    "pressure",
    "vibration",
    "smoke",
    "overheat",
    "hot surface",
    "unguarded",
  ];

  const mediumWords = [
    "slip",
    "trip",
    "ppe",
    "housekeeping",
    "obstruction",
    "noise",
    "minor leak",
  ];

  criticalWords.forEach((word) => {
    if (value.includes(word)) score += 30;
  });

  highWords.forEach((word) => {
    if (value.includes(word)) score += 14;
  });

  mediumWords.forEach((word) => {
    if (value.includes(word)) score += 7;
  });

  if (value.length > 120) score += 5;

  score = Math.min(score, 100);

  let level = "LOW";

  if (score >= 75) level = "CRITICAL";
  else if (score >= 50) level = "HIGH";
  else if (score >= 25) level = "MEDIUM";

  return { score, level };
}

function getRecommendations(text) {
  const value = text.toLowerCase();
  const recommendations = [];

  if (value.includes("gas") || value.includes("leak")) {
    recommendations.push("Move personnel away from the suspected release area.");
    recommendations.push("Follow approved isolation and emergency procedures.");
    recommendations.push("Avoid potential ignition sources according to site rules.");
  }

  if (
    value.includes("machine") ||
    value.includes("pump") ||
    value.includes("vibration")
  ) {
    recommendations.push("Inspect abnormal vibration, temperature, guarding and leakage.");
    recommendations.push("Use approved lockout/tagout procedures before maintenance.");
  }

  if (value.includes("fire") || value.includes("smoke")) {
    recommendations.push("Treat as a potential emergency and follow site alarm procedures.");
    recommendations.push("Do not attempt intervention unless trained and authorized.");
  }

  if (value.includes("fall") || value.includes("height")) {
    recommendations.push("Inspect fall protection, anchorage and access equipment.");
    recommendations.push("Stop the task if required controls are missing.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Inspect the area and verify the reported condition.");
    recommendations.push("Follow approved site safety procedures.");
    recommendations.push("Escalate the report to the responsible supervisor.");
  }

  return [...new Set(recommendations)].slice(0, 5);
}

function chatbotAnalysis(message) {
  const risk = calculateRisk(message, "Chat Report");
  const recommendations = getRecommendations(message);

  return {
    risk,
    recommendations,
  };
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("safetyai_login") === "true"
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("safetyai_theme") || "light"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const [language, setLanguage] = useState("English");

  const [selectedCompanyId, setSelectedCompanyId] = useState(
    () => localStorage.getItem("safetyai_company") || "apex"
  );

  const selectedCompany =
    COMPANIES.find((company) => company.id === selectedCompanyId) ||
    COMPANIES[0];

  const [selectedMachineId, setSelectedMachineId] = useState(
    selectedCompany.machines[0].id
  );

  const selectedMachine =
    selectedCompany.machines.find(
      (machine) => machine.id === selectedMachineId
    ) || selectedCompany.machines[0];

  const [reports, setReports] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("safetyai_reports") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("safetyai_notifications") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [machineStates, setMachineStates] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("safetyai_machines") || "{}"
      );
    } catch {
      return {};
    }
  });

  const [timeline, setTimeline] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("safetyai_timeline") || "[]"
      );
    } catch {
      return [];
    }
  });

  const [reportText, setReportText] = useState("");
  const [category, setCategory] = useState("Unsafe Condition");
  const [photo, setPhoto] = useState(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [location, setLocation] = useState({
    lat: selectedCompany.lat,
    lng: selectedCompany.lng,
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const [chatOpen, setChatOpen] = useState(true);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      from: "ai",
      text:
        "Hello! I am SafetyAI. Tell me about a gas leak, fire, machine problem, unsafe condition, near miss or emergency.",
    },
  ]);

  const [chatInput, setChatInput] = useState("");
  const [lastChatHazard, setLastChatHazard] = useState(null);

  // AI VOICE CHAT
  const [isChatListening, setIsChatListening] = useState(false);
  const chatRecognitionRef = useRef(null);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);

  const t = translations[language];

  useEffect(() => {
    localStorage.setItem(
      "safetyai_reports",
      JSON.stringify(reports)
    );
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(
      "safetyai_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      "safetyai_machines",
      JSON.stringify(machineStates)
    );
  }, [machineStates]);

  useEffect(() => {
    localStorage.setItem(
      "safetyai_timeline",
      JSON.stringify(timeline)
    );
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem("safetyai_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "safetyai_company",
      selectedCompanyId
    );

    setSelectedMachineId(selectedCompany.machines[0].id);

    setLocation({
      lat:
        selectedCompany.lat +
        (Math.random() - 0.5) / 100,
      lng:
        selectedCompany.lng +
        (Math.random() - 0.5) / 100,
    });
  }, [selectedCompanyId]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      critical: reports.filter(
        (report) => report.risk.level === "CRITICAL"
      ).length,
      high: reports.filter(
        (report) => report.risk.level === "HIGH"
      ).length,
      resolved: reports.filter(
        (report) => report.status === "Resolved"
      ).length,
    };
  }, [reports]);

  const safetyScore = useMemo(() => {
    let score = 100;

    reports.forEach((report) => {
      if (report.status !== "Resolved") {
        if (report.risk.level === "CRITICAL") score -= 15;
        if (report.risk.level === "HIGH") score -= 10;
        if (report.risk.level === "MEDIUM") score -= 5;
        if (report.risk.level === "LOW") score -= 2;
      }
    });

    return Math.max(score, 0);
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        `${report.text} ${report.company} ${report.machine}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRisk =
        riskFilter === "ALL" ||
        report.risk.level === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [reports, search, riskFilter]);

  function addNotification(message, type = "info") {
    setNotifications((old) => [
      {
        id: Date.now() + Math.random(),
        message,
        type,
        time: new Date().toLocaleTimeString(),
      },
      ...old,
    ]);
  }

  function addTimeline(action) {
    setTimeline((old) => [
      {
        id: Date.now() + Math.random(),
        action,
        time: new Date().toLocaleString(),
      },
      ...old,
    ]);
  }

  function lockMachine(machineId, reason) {
    setMachineStates((old) => ({
      ...old,
      [machineId]: {
        locked: true,
        reason,
      },
    }));

    addTimeline(
      `Safety lock simulated for ${selectedMachine.name}: ${reason}`
    );
  }

  function unlockMachine(machineId) {
    const approved = window.confirm(
      "Confirm that the hazard was inspected and corrected?"
    );

    if (!approved) return;

    setMachineStates((old) => ({
      ...old,
      [machineId]: {
        locked: false,
        reason: "Manager approved restart",
      },
    }));

    setReports((old) =>
      old.map((report) =>
        report.machineId === machineId &&
          report.status === "Action Required"
          ? { ...report, status: "Resolved" }
          : report
      )
    );

    addNotification(
      `${selectedMachine.name} restart approved in prototype.`,
      "success"
    );

    addTimeline(
      `Manager approved restart for ${selectedMachine.name}`
    );
  }

  function submitReport(event) {
    event.preventDefault();

    if (!reportText.trim()) {
      alert("Please describe the hazard.");
      return;
    }

    const risk = calculateRisk(reportText, category);
    const recommendations = getRecommendations(reportText);

    const newReport = {
      id: Date.now(),
      company: selectedCompany.name,
      companyId: selectedCompany.id,
      machine: selectedMachine.name,
      machineId: selectedMachine.id,
      category,
      text: reportText,
      risk,
      recommendations,
      photo,
      location,
      status:
        risk.level === "HIGH" ||
          risk.level === "CRITICAL"
          ? "Action Required"
          : "Under Review",
      createdAt: new Date().toLocaleString(),
    };

    setReports((old) => [newReport, ...old]);

    addTimeline(
      `Hazard report created for ${selectedMachine.name}`
    );

    if (
      risk.level === "HIGH" ||
      risk.level === "CRITICAL"
    ) {
      lockMachine(
        selectedMachine.id,
        `${risk.level} risk report`
      );

      addNotification(
        `HIGH RISK ALERT: Manager notification simulation created for 9486869758.`,
        "danger"
      );

      addTimeline(
        `AI classified report as ${risk.level} (${risk.score}/100)`
      );

      alert(
        `⚠️ ${risk.level} RISK DETECTED\n\nRisk Score: ${risk.score}/100\n\nPrototype machine safety lock activated.`
      );
    } else {
      addNotification(
        `New ${risk.level} safety report submitted.`,
        "info"
      );
    }

    setReportText("");
    setPhoto(null);
    setActivePage("analytics");
  }

  function startVoiceRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported. Use Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      language === "Tamil"
        ? "ta-IN"
        : language === "Hindi"
          ? "hi-IN"
          : "en-IN";

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert(
        "Voice recognition failed. Please allow microphone permission."
      );
    };

    recognition.onresult = (event) => {
      let text = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        text += event.results[i][0].transcript;
      }

      setReportText((old) =>
        old ? `${old} ${text}` : text
      );
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoiceRecognition() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result);
      addNotification(
        "Hazard photo attached successfully.",
        "info"
      );
    };

    reader.readAsDataURL(file);
  }

  function analyzePhoto() {
    if (!photo) {
      alert("Upload a photo first.");
      return;
    }

    const results = [
      {
        issue: "Potential fluid leakage detected",
        confidence: 82,
      },
      {
        issue: "Possible missing PPE detected",
        confidence: 76,
      },
      {
        issue: "Potential machine guarding issue",
        confidence: 79,
      },
      {
        issue: "Possible unsafe obstruction detected",
        confidence: 71,
      },
      {
        issue: "Potential poor housekeeping detected",
        confidence: 84,
      },
    ];

    const result =
      results[Math.floor(Math.random() * results.length)];

    alert(
      `Prototype Visual AI Analysis\n\n${result.issue}\nConfidence: ${result.confidence}%\n\nManual verification is required.`
    );

    addNotification(
      `Photo AI: ${result.issue}`,
      "danger"
    );
  }

  function refreshFakeGps() {
    setLocation({
      lat:
        selectedCompany.lat +
        (Math.random() - 0.5) / 100,
      lng:
        selectedCompany.lng +
        (Math.random() - 0.5) / 100,
    });

    addNotification(
      "Demo GPS location refreshed.",
      "info"
    );
  }

  // Speak AI reply aloud
  function speakAI(text) {
    if (!voiceReplyEnabled || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === "Tamil"
        ? "ta-IN"
        : language === "Hindi"
          ? "hi-IN"
          : "en-IN";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  // Start microphone for AI chat
  function startChatVoice() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice chat is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isChatListening) {
      chatRecognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      language === "Tamil"
        ? "ta-IN"
        : language === "Hindi"
          ? "hi-IN"
          : "en-IN";

    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsChatListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setChatInput(transcript.trim());
    };

    recognition.onend = () => {
      setIsChatListening(false);
    };

    recognition.onerror = () => {
      setIsChatListening(false);
      alert("Microphone error. Please allow microphone permission and try again.");
    };

    chatRecognitionRef.current = recognition;
    recognition.start();
  }

  function sendChat() {
    const message = chatInput.trim();

    if (!message) return;

    const userMessage = {
      id: Date.now(),
      from: "user",
      text: message,
    };

    const analysis = chatbotAnalysis(message);

    const response =
      `SafetyAI Analysis\n\n` +
      `Risk Level: ${analysis.risk.level}\n` +
      `Risk Score: ${analysis.risk.score}/100\n\n` +
      `Recommended Actions:\n` +
      analysis.recommendations
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");

    const aiMessage = {
      id: Date.now() + 1,
      from: "ai",
      text: response,
    };

    setChatMessages((old) => [
      ...old,
      userMessage,
      aiMessage,
    ]);

    setLastChatHazard({
      text: message,
      risk: analysis.risk,
    });

    setChatInput("");
    speakAI(response);
  }

  function createReportFromChat() {
    if (!lastChatHazard) return;

    setReportText(lastChatHazard.text);
    setCategory("Chatbot AI Report");
    setActivePage("report");
    setChatOpen(false);

    addNotification(
      "Chatbot created a draft hazard report.",
      "info"
    );
  }

  function quickChat(message) {
    setChatInput(message);

    setTimeout(() => {
      const analysis = chatbotAnalysis(message);

      const voiceResponse =
        `Risk: ${analysis.risk.level} (${analysis.risk.score}/100). ` +
        analysis.recommendations.join(". ");

      setChatMessages((old) => [
        ...old,
        {
          id: Date.now(),
          from: "user",
          text: message,
        },
        {
          id: Date.now() + 1,
          from: "ai",
          text:
            `Risk: ${analysis.risk.level} (${analysis.risk.score}/100)\n\n` +
            analysis.recommendations
              .map((item, index) => `${index + 1}. ${item}`)
              .join("\n"),
        },
      ]);

      speakAI(voiceResponse);

      setLastChatHazard({
        text: message,
        risk: analysis.risk,
      });

      setChatInput("");
    }, 100);
  }

  function activateEmergencyMode() {
    const confirmEmergency = window.confirm(
      "Activate prototype emergency mode?"
    );

    if (!confirmEmergency) return;

    lockMachine(
      selectedMachine.id,
      "Emergency mode activated"
    );

    addNotification(
      `EMERGENCY MODE: Alert simulation created for manager number 9486869758.`,
      "danger"
    );

    addTimeline(
      `Emergency mode activated at ${selectedCompany.name}`
    );

    alert(
      `🚨 EMERGENCY MODE ACTIVE\n\nCompany: ${selectedCompany.name}\nMachine: ${selectedMachine.name}\nEmergency Contact: ${selectedCompany.emergency}`
    );
  }

  function exportCSV() {
    if (reports.length === 0) {
      alert("No reports available to export.");
      return;
    }

    const headers = [
      "ID",
      "Company",
      "Machine",
      "Category",
      "Risk",
      "Score",
      "Status",
      "Description",
      "Created At",
    ];

    const rows = reports.map((report) => [
      report.id,
      report.company,
      report.machine,
      report.category,
      report.risk.level,
      report.risk.score,
      report.status,
      `"${report.text.replaceAll('"', '""')}"`,
      report.createdAt,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "safetyai-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function login() {
    setLoginError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setLoginError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setLoginError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setLoginError("Password must contain at least 6 characters.");
      return;
    }

    localStorage.setItem("safetyai_login", "true");
    localStorage.setItem("safetyai_user_email", cleanEmail);
    setLoggedIn(true);
  }

  function logout() {
    localStorage.removeItem("safetyai_login");
    localStorage.removeItem("safetyai_user_email");
    setEmail("");
    setPassword("");
    setLoginError("");
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return (
      <div className={`login-page ${theme}`}>
        <div className="floating orb-one"></div>
        <div className="floating orb-two"></div>
        <div className="floating orb-three"></div>

        <div className="login-card">
          <div className="logo-circle">S</div>

          <h1>SafetyAI</h1>

          <p>
            AI/NLP Engine for Serious Injury &
            Fatality Precursor Detection
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (loginError) setLoginError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") login();
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (loginError) setLoginError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") login();
            }}
          />

          {loginError && (
            <p className="login-error" role="alert">
              {loginError}
            </p>
          )}

          <button
            type="button"
            className="primary-button full"
            onClick={login}
          >
            Login to SafetyAI
          </button>

          <p className="small-text">
            Enter a valid email and a password with at least 6 characters.
          </p>

          <button
            className="theme-button"
            onClick={() =>
              setTheme(
                theme === "light" ? "dark" : "light"
              )
            }
          >
            {theme === "light"
              ? "🌙 Dark Luna Gray"
              : "☀️ Light Luna Gray"}
          </button>
        </div>
      </div>
    );
  }

  const machineState =
    machineStates[selectedMachine.id] || {
      locked: false,
      reason: "Normal operation",
    };

  return (
    <div className={`app ${theme}`}>
      <div className="background-animation">
        <div className="floating shape-a"></div>
        <div className="floating shape-b"></div>
        <div className="floating shape-c"></div>
      </div>

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>SafetyAI</h2>
            <span>SIF Intelligence</span>
          </div>
        </div>

        <nav>
          <button
            className={
              activePage === "dashboard"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            🏠 {t.dashboard}
          </button>

          <button
            className={
              activePage === "report"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setActivePage("report")
            }
          >
            ⚠️ {t.report}
          </button>

          <button
            className={
              activePage === "analytics"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setActivePage("analytics")
            }
          >
            📊 {t.analytics}
          </button>

          <button
            className={
              activePage === "machines"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setActivePage("machines")
            }
          >
            ⚙️ {t.machines}
          </button>

          <button
            className={
              activePage === "companies"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setActivePage("companies")
            }
          >
            🏭 {t.companies}
          </button>

          <button
            className="nav-button"
            onClick={() => setChatOpen(true)}
          >
            🤖 AI Assistant
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            className="emergency-button"
            onClick={activateEmergencyMode}
          >
            🚨 EMERGENCY
          </button>

          <button
            className="theme-button"
            onClick={() =>
              setTheme(
                theme === "light" ? "dark" : "light"
              )
            }
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>
              Industrial Safety Intelligence Platform
            </h1>

            <p>
              AI-assisted SIF precursor detection and
              prototype safety monitoring
            </p>
          </div>

          <div className="top-controls">
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
            >
              <option>English</option>
              <option>Tamil</option>
              <option>Hindi</option>
            </select>

            <div
              className={
                machineState.locked
                  ? "machine-status locked"
                  : "machine-status safe"
              }
            >
              {machineState.locked
                ? "🛑 SAFETY LOCK"
                : "🟢 NORMAL"}
            </div>
          </div>
        </header>

        {activePage === "dashboard" && (
          <section className="page">
            <div className="hero-card">
              <div>
                <span className="badge">
                  AI SAFETY MONITORING ACTIVE
                </span>

                <h2>
                  Detect Serious Injury & Fatality
                  Precursors Before an Incident
                </h2>

                <p>
                  Report hazards using text, voice and
                  photos. SafetyAI calculates a prototype
                  risk score and creates a safety workflow.
                </p>

                <button
                  className="primary-button"
                  onClick={() =>
                    setActivePage("report")
                  }
                >
                  Report a Hazard
                </button>
              </div>

              <div className="ai-orb">
                <div className="orbit orbit-one"></div>
                <div className="orbit orbit-two"></div>
                <div className="ai-core">AI</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Reports</span>
                <strong>{stats.total}</strong>
              </div>

              <div className="stat-card">
                <span>Critical</span>
                <strong className="danger-text">
                  {stats.critical}
                </strong>
              </div>

              <div className="stat-card">
                <span>High Risk</span>
                <strong className="warning-text">
                  {stats.high}
                </strong>
              </div>

              <div className="stat-card">
                <span>Safety Score</span>
                <strong className="success-text">
                  {safetyScore}/100
                </strong>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="panel">
                <h3>🏭 Company Control</h3>

                <select
                  value={selectedCompanyId}
                  onChange={(e) =>
                    setSelectedCompanyId(
                      e.target.value
                    )
                  }
                >
                  {COMPANIES.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>
                  ))}
                </select>

                <div className="company-info">
                  <p>
                    <b>Location:</b>{" "}
                    {selectedCompany.location}
                  </p>

                  <p>
                    <b>Emergency:</b>{" "}
                    {selectedCompany.emergency}
                  </p>

                  <p>
                    <b>Safety Score:</b>{" "}
                    {safetyScore}/100
                  </p>

                  <button
                    className="secondary-button"
                    onClick={refreshFakeGps}
                  >
                    📍 Refresh Fake GPS
                  </button>

                  <p className="gps-text">
                    Demo Coordinates:{" "}
                    {location.lat.toFixed(5)},{" "}
                    {location.lng.toFixed(5)}
                  </p>
                </div>
              </div>

              <div className="panel">
                <h3>⚙️ Machine Digital Twin</h3>

                <select
                  value={selectedMachineId}
                  onChange={(e) =>
                    setSelectedMachineId(
                      e.target.value
                    )
                  }
                >
                  {selectedCompany.machines.map(
                    (machine) => (
                      <option
                        key={machine.id}
                        value={machine.id}
                      >
                        {machine.name}
                      </option>
                    )
                  )}
                </select>

                <div className="machine-data">
                  <div>
                    <span>Temperature</span>
                    <strong>
                      {selectedMachine.temp}°C
                    </strong>
                  </div>

                  <div>
                    <span>Vibration</span>
                    <strong>
                      {selectedMachine.vibration} mm/s
                    </strong>
                  </div>

                  <div>
                    <span>Pressure</span>
                    <strong>
                      {selectedMachine.pressure} PSI
                    </strong>
                  </div>
                </div>

                <div
                  className={
                    machineState.locked
                      ? "machine-box locked-box"
                      : "machine-box"
                  }
                >
                  <strong>
                    {machineState.locked
                      ? "🛑 SAFETY LOCK ACTIVE"
                      : "🟢 NORMAL OPERATION"}
                  </strong>

                  <small>
                    {machineState.reason}
                  </small>
                </div>

                {!machineState.locked ? (
                  <button
                    className="danger-button"
                    onClick={() =>
                      lockMachine(
                        selectedMachine.id,
                        "Manual prototype lock"
                      )
                    }
                  >
                    🛑 Lock Machine
                  </button>
                ) : (
                  <button
                    className="success-button"
                    onClick={() =>
                      unlockMachine(
                        selectedMachine.id
                      )
                    }
                  >
                    ✓ Fix & Restart
                  </button>
                )}
              </div>
            </div>

            <div className="panel timeline-panel">
              <h3>⏱️ Incident Timeline</h3>

              {timeline.length === 0 ? (
                <p className="muted">
                  No incident activity yet.
                </p>
              ) : (
                timeline
                  .slice(0, 6)
                  .map((item) => (
                    <div
                      className="timeline-item"
                      key={item.id}
                    >
                      <div className="timeline-dot"></div>

                      <div>
                        <strong>
                          {item.action}
                        </strong>
                        <small>{item.time}</small>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}

        {activePage === "report" && (
          <section className="page">
            <div className="page-title">
              <h2>
                AI Hazard Reporting Center
              </h2>

              <p>
                Use text, voice, fake GPS and photos.
              </p>
            </div>

            <form
              className="report-form"
              onSubmit={submitReport}
            >
              <div className="form-grid">
                <div>
                  <label>Company</label>

                  <select
                    value={selectedCompanyId}
                    onChange={(e) =>
                      setSelectedCompanyId(
                        e.target.value
                      )
                    }
                  >
                    {COMPANIES.map(
                      (company) => (
                        <option
                          key={company.id}
                          value={company.id}
                        >
                          {company.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label>Machine</label>

                  <select
                    value={selectedMachineId}
                    onChange={(e) =>
                      setSelectedMachineId(
                        e.target.value
                      )
                    }
                  >
                    {selectedCompany.machines.map(
                      (machine) => (
                        <option
                          key={machine.id}
                          value={machine.id}
                        >
                          {machine.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label>Report Type</label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Unsafe Condition
                    </option>
                    <option>
                      Unsafe Act
                    </option>
                    <option>Near Miss</option>
                    <option>
                      Machine Failure
                    </option>
                    <option>
                      Emergency Hazard
                    </option>
                    <option>
                      Chatbot AI Report
                    </option>
                  </select>
                </div>

                <div>
                  <label>Fake GPS</label>

                  <div className="gps-display">
                    📍 {location.lat.toFixed(5)},{" "}
                    {location.lng.toFixed(5)}
                  </div>
                </div>
              </div>

              <label>
                Describe the Hazard
              </label>

              <textarea
                rows="8"
                value={reportText}
                onChange={(e) =>
                  setReportText(e.target.value)
                }
                placeholder="Example: Strong gas smell near the rotating pump. Abnormal vibration and possible oil leakage."
              />

              {(() => {
                const preview =
                  calculateRisk(
                    reportText,
                    category
                  );

                return (
                  <div className="risk-preview">
                    <span>
                      AI Risk Preview
                    </span>

                    <strong>
                      {preview.score}/100
                    </strong>

                    <span
                      className={`risk-badge ${preview.level.toLowerCase()}`}
                    >
                      {preview.level}
                    </span>
                  </div>
                );
              })()}

              <div className="action-row">
                {!isListening ? (
                  <button
                    type="button"
                    className="voice-button"
                    onClick={
                      startVoiceRecognition
                    }
                  >
                    🎤 Start Voice
                  </button>
                ) : (
                  <button
                    type="button"
                    className="danger-button"
                    onClick={
                      stopVoiceRecognition
                    }
                  >
                    🔴 Stop Listening
                  </button>
                )}

                <label className="photo-button">
                  📸 Upload Photo

                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                  />
                </label>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={analyzePhoto}
                >
                  🔍 AI Analyze Photo
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={refreshFakeGps}
                >
                  📍 Refresh GPS
                </button>
              </div>

              {isListening && (
                <div className="listening-box">
                  🎤 Listening... Speak your safety
                  report now.
                </div>
              )}

              {photo && (
                <img
                  className="photo-preview"
                  src={photo}
                  alt="Hazard"
                />
              )}

              <button
                className="primary-button full submit-button"
                type="submit"
              >
                Submit AI Safety Report
              </button>
            </form>
          </section>
        )}

        {activePage === "analytics" && (
          <section className="page">
            <div className="analytics-header">
              <div>
                <h2>
                  Advanced Safety Analytics
                </h2>

                <p>
                  Search, filter and export reports.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={exportCSV}
              >
                📥 Export CSV
              </button>
            </div>

            <div className="analytics-summary">
              <div>
                <span>Total</span>
                <strong>{stats.total}</strong>
              </div>

              <div>
                <span>Critical</span>
                <strong>
                  {stats.critical}
                </strong>
              </div>

              <div>
                <span>High</span>
                <strong>{stats.high}</strong>
              </div>

              <div>
                <span>Resolved</span>
                <strong>{stats.resolved}</strong>
              </div>
            </div>

            <div className="risk-chart panel">
              <h3>Risk Distribution</h3>

              <div className="chart-row">
                <span>Critical</span>

                <div className="chart-track">
                  <div
                    className="chart-bar critical-bar"
                    style={{
                      width: `${Math.min(
                        stats.critical * 20,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                <strong>
                  {stats.critical}
                </strong>
              </div>

              <div className="chart-row">
                <span>High</span>

                <div className="chart-track">
                  <div
                    className="chart-bar high-bar"
                    style={{
                      width: `${Math.min(
                        stats.high * 20,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                <strong>{stats.high}</strong>
              </div>

              <div className="chart-row">
                <span>Resolved</span>

                <div className="chart-track">
                  <div
                    className="chart-bar safe-bar"
                    style={{
                      width: `${Math.min(
                        stats.resolved * 20,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>

                <strong>
                  {stats.resolved}
                </strong>
              </div>
            </div>

            <div className="filter-row">
              <input
                placeholder="🔎 Search reports..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <select
                value={riskFilter}
                onChange={(e) =>
                  setRiskFilter(e.target.value)
                }
              >
                <option value="ALL">
                  All Risks
                </option>

                <option value="CRITICAL">
                  Critical
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="LOW">
                  Low
                </option>
              </select>
            </div>

            <div className="report-list">
              {filteredReports.length === 0 ? (
                <div className="empty-state">
                  No reports found.
                </div>
              ) : (
                filteredReports.map(
                  (report) => (
                    <div
                      className="report-card"
                      key={report.id}
                    >
                      <div className="report-header">
                        <div>
                          <h3>
                            {report.category}
                          </h3>

                          <p>
                            {report.company}
                          </p>
                        </div>

                        <span
                          className={`risk-badge ${report.risk.level.toLowerCase()}`}
                        >
                          {report.risk.level} —{" "}
                          {report.risk.score}/100
                        </span>
                      </div>

                      <p>{report.text}</p>

                      <div className="recommendation-box">
                        <strong>
                          🧠 AI Recommendations
                        </strong>

                        {report.recommendations.map(
                          (
                            recommendation,
                            index
                          ) => (
                            <p
                              key={index}
                            >
                              {index + 1}.{" "}
                              {recommendation}
                            </p>
                          )
                        )}
                      </div>

                      <div className="report-meta">
                        <span>
                          ⚙️ {report.machine}
                        </span>

                        <span>
                          📍{" "}
                          {report.location.lat.toFixed(
                            4
                          )}
                          ,{" "}
                          {report.location.lng.toFixed(
                            4
                          )}
                        </span>

                        <span>
                          🕒 {report.createdAt}
                        </span>
                      </div>

                      <div
                        className={
                          report.status ===
                            "Resolved"
                            ? "status resolved"
                            : "status pending"
                        }
                      >
                        {report.status}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </section>
        )}

        {activePage === "machines" && (
          <section className="page">
            <div className="page-title">
              <h2>
                Machine Digital Twin Network
              </h2>

              <p>
                Prototype machine monitoring and safety
                status.
              </p>
            </div>

            <div className="machine-grid">
              {selectedCompany.machines.map(
                (machine) => {
                  const state =
                    machineStates[machine.id] || {
                      locked: false,
                    };

                  return (
                    <div
                      className="machine-card"
                      key={machine.id}
                    >
                      <div className="machine-card-header">
                        <h3>
                          ⚙️ {machine.name}
                        </h3>

                        <span
                          className={
                            state.locked
                              ? "dot red"
                              : "dot green"
                          }
                        ></span>
                      </div>

                      <div className="machine-metrics">
                        <p>
                          🌡️ Temperature:{" "}
                          <strong>
                            {machine.temp}°C
                          </strong>
                        </p>

                        <p>
                          📈 Vibration:{" "}
                          <strong>
                            {machine.vibration} mm/s
                          </strong>
                        </p>

                        <p>
                          🔵 Pressure:{" "}
                          <strong>
                            {machine.pressure} PSI
                          </strong>
                        </p>
                      </div>

                      <div
                        className={
                          state.locked
                            ? "machine-alert locked-alert"
                            : "machine-alert"
                        }
                      >
                        {state.locked
                          ? "SAFETY LOCK"
                          : "NORMAL"}
                      </div>

                      <button
                        className="secondary-button"
                        onClick={() => {
                          setSelectedMachineId(
                            machine.id
                          );
                          setActivePage(
                            "dashboard"
                          );
                        }}
                      >
                        Open Digital Twin
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {activePage === "companies" && (
          <section className="page">
            <div className="page-title">
              <h2>
                Prototype Company Network
              </h2>

              <p>
                All companies below are fictional demo
                companies.
              </p>
            </div>

            <div className="company-grid">
              {COMPANIES.map(
                (company) => (
                  <div
                    className={
                      company.id ===
                        selectedCompanyId
                        ? "company-card selected"
                        : "company-card"
                    }
                    key={company.id}
                  >
                    <div className="company-logo">
                      🏭
                    </div>

                    <h3>{company.name}</h3>

                    <p>
                      📍 {company.location}
                    </p>

                    <p>
                      🚨 {company.emergency}
                    </p>

                    <div className="fake-map">
                      <div className="map-dot"></div>

                      <span>
                        {company.lat.toFixed(3)},{" "}
                        {company.lng.toFixed(3)}
                      </span>
                    </div>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        setSelectedCompanyId(
                          company.id
                        )
                      }
                    >
                      Select Company
                    </button>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        <section className="notification-panel">
          <h3>🔔 Notifications</h3>

          {notifications.length === 0 ? (
            <p className="muted">
              No notifications yet.
            </p>
          ) : (
            notifications
              .slice(0, 5)
              .map((notification) => (
                <div
                  className={`notification ${notification.type}`}
                  key={notification.id}
                >
                  <span>
                    {notification.message}
                  </span>

                  <small>
                    {notification.time}
                  </small>
                </div>
              ))
          )}
        </section>
      </main>

      <button
        className="chat-toggle"
        onClick={() =>
          setChatOpen(!chatOpen)
        }
      >
        🤖
      </button>

      {chatOpen && (
        <>
          <div className="chatbot">
            <div className="chat-header">
              <div>
                <strong>
                  🤖 SafetyAI Assistant
                </strong>

                <span>
                  ● Prototype AI Online
                </span>
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  title={voiceReplyEnabled ? "Turn AI voice off" : "Turn AI voice on"}
                  onClick={() => {
                    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                    setVoiceReplyEnabled((old) => !old);
                  }}
                >
                  {voiceReplyEnabled ? "🔊" : "🔇"}
                </button>

                <button
                  onClick={() =>
                    setChatOpen(false)
                  }
                >
                  ×
                </button>
              </div>
            </div>

            <div className="quick-actions">
              <button
                onClick={() =>
                  quickChat(
                    "There is a possible gas leak near the pump."
                  )
                }
              >
                Gas Leak
              </button>

              <button
                onClick={() =>
                  quickChat(
                    "There is smoke and possible fire."
                  )
                }
              >
                Fire
              </button>

              <button
                onClick={() =>
                  quickChat(
                    "The machine has abnormal vibration."
                  )
                }
              >
                Machine
              </button>

              <button
                onClick={() =>
                  quickChat(
                    "A worker may fall from height."
                  )
                }
              >
                Fall Risk
              </button>
            </div>

            <div className="chat-body">
              {chatMessages.map(
                (message) => (
                  <div
                    key={message.id}
                    className={
                      message.from === "ai"
                        ? "chat-message ai"
                        : "chat-message user"
                    }
                  >
                    {message.text}
                  </div>
                )
              )}
            </div>

            {lastChatHazard && (
              <button
                className="create-report-button"
                onClick={
                  createReportFromChat
                }
              >
                ⚠️ Create Report From AI Chat
              </button>
            )}

            <div className="chat-input">
              <input
                value={chatInput}
                placeholder="Describe a safety issue..."
                onChange={(e) =>
                  setChatInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    sendChat();
                  }
                }}
              />

              <button
                onClick={startChatVoice}
                title="Speak your safety report"
                aria-label="Start voice chat"
              >
                {isChatListening ? "⏹ Stop" : "🎤 Speak"}
              </button>

              <button onClick={sendChat}>
                Send
              </button>
            </div>
          </div>
          <VoiceAIChat />
        </>
      )}
    </div>
  );
}

