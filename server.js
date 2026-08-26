const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ------------------------------------
// HEALTH CHECK
// ------------------------------------

app.get("/", (req, res) => {
  res.json({
    status: "SafetyAI Backend Running",
  });
});

// ------------------------------------
// AI CHAT
// ------------------------------------

app.post("/api/chat", (req, res) => {
  const message = String(
    req.body.message || ""
  ).trim();

  console.log("USER MESSAGE:", message);

  if (!message) {
    return res.status(400).json({
      reply:
        "Please describe the safety problem.",
      riskLevel: "LOW",
      riskScore: 0,
    });
  }

  const text = message.toLowerCase();

  let reply = "";
  let riskLevel = "LOW";
  let riskScore = 10;

  // ------------------------------------
  // GREETING
  // ------------------------------------

  if (
    text === "hi" ||
    text === "hello" ||
    text.includes("hello safety")
  ) {
    reply =
      "Hello! 👋 I am SafetyAI. Please describe the unsafe act, unsafe condition, near miss, machine problem, leak, fire hazard, or injury risk you observed.";

    riskLevel = "LOW";
    riskScore = 5;
  }

  // ------------------------------------
  // FIRE
  // ------------------------------------

  else if (
    text.includes("fire") ||
    text.includes("smoke") ||
    text.includes("flame")
  ) {
    reply =
      "⚠️ FIRE HAZARD DETECTED. Move to a safe area and follow your approved emergency procedure. Warn nearby personnel and contact the authorized emergency response team. Do not continue operating affected equipment if site procedures require isolation.";

    riskLevel = "CRITICAL";
    riskScore = 95;
  }

  // ------------------------------------
  // GAS
  // ------------------------------------

  else if (
    text.includes("gas") ||
    text.includes("gas leak") ||
    text.includes("gas smell")
  ) {
    reply =
      "⚠️ POSSIBLE GAS HAZARD DETECTED. Do not create ignition sources. Move away from the affected area and follow approved site emergency procedures. Please tell me the exact location and whether the leak is near operating equipment.";

    riskLevel = "CRITICAL";
    riskScore = 92;
  }

  // ------------------------------------
  // MACHINE
  // ------------------------------------

  else if (
    text.includes("machine") ||
    text.includes("motor") ||
    text.includes("pump") ||
    text.includes("equipment") ||
    text.includes("compressor")
  ) {
    reply =
      "⚠️ MACHINE SAFETY RISK DETECTED. Please describe the abnormal condition, machine name, and location. If there is immediate danger, follow your site's authorized equipment isolation and lockout procedures and notify the responsible supervisor.";

    riskLevel = "HIGH";
    riskScore = 80;
  }

  // ------------------------------------
  // INJURY
  // ------------------------------------

  else if (
    text.includes("injury") ||
    text.includes("injured") ||
    text.includes("bleeding") ||
    text.includes("unconscious")
  ) {
    reply =
      "⚠️ POSSIBLE SERIOUS INJURY. Follow your site's emergency response procedure and contact authorized emergency personnel. Do not move an injured person unless there is an immediate danger and trained responders direct otherwise. Tell me what happened and where.";

    riskLevel = "HIGH";
    riskScore = 90;
  }

  // ------------------------------------
  // FALL
  // ------------------------------------

  else if (
    text.includes("fall") ||
    text.includes("slip") ||
    text.includes("trip") ||
    text.includes("height")
  ) {
    reply =
      "⚠️ FALL HAZARD DETECTED. Secure the area and follow approved site safety procedures. Please tell me the height involved, location, surface condition, and whether anyone has been injured.";

    riskLevel = "HIGH";
    riskScore = 75;
  }

  // ------------------------------------
  // OIL / CHEMICAL LEAK
  // ------------------------------------

  else if (
    text.includes("oil leak") ||
    text.includes("spill") ||
    text.includes("chemical leak") ||
    text.includes("leak")
  ) {
    reply =
      "⚠️ LEAK OR SPILL REPORTED. Please identify the substance, location, approximate quantity, and whether it is close to ignition sources, drains, or operating equipment.";

    riskLevel = "MEDIUM";
    riskScore = 65;
  }

  // ------------------------------------
  // ELECTRICAL
  // ------------------------------------

  else if (
    text.includes("electric") ||
    text.includes("electrical") ||
    text.includes("wire") ||
    text.includes("shock")
  ) {
    reply =
      "⚠️ ELECTRICAL HAZARD DETECTED. Keep unauthorized persons away and follow your site's approved electrical isolation procedures. Do not touch exposed conductors. Please provide the equipment and location.";

    riskLevel = "HIGH";
    riskScore = 85;
  }

  // ------------------------------------
  // GENERAL MESSAGE
  // ------------------------------------

  else {
    reply =
      `I received your report: "${message}". To analyze the SIF risk better, please tell me: 1. Where did this happen? 2. What equipment or activity was involved? 3. What unsafe condition did you observe? 4. Is anyone in immediate danger?`;

    riskLevel = "LOW";
    riskScore = 25;
  }

  console.log("AI RESPONSE:", reply);

  res.json({
    reply: reply,
    riskLevel: riskLevel,
    riskScore: riskScore,
  });
});

// ------------------------------------
// START SERVER
// ------------------------------------

const PORT = 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("===============================");
  console.log("SAFETYAI BACKEND STARTED");
  console.log("===============================");
  console.log(`Backend: http://localhost:${PORT}`);
  console.log("");
});
