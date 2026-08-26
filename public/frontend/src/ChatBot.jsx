import React, { useEffect, useRef, useState } from "react";
import "./ChatBot.css";

export default function ChatBot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am SafetyAI. Tell me about any unsafe act, unsafe condition, near miss, machine problem, fire, gas leak, injury risk, or emergency.",
    },
  ]);

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // -----------------------------
  // SPEAK AI RESPONSE
  // -----------------------------
  function speakText(text) {
    if (!voiceEnabled) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 1;
      speech.pitch = 1;
      speech.lang = "en-US";

      window.speechSynthesis.speak(speech);
    }
  }

  // -----------------------------
  // SAFETY AI ANALYSIS
  // -----------------------------
  function analyzeSafety(text) {
    const message = text.toLowerCase();

    // CRITICAL
    if (
      message.includes("fire") ||
      message.includes("explosion") ||
      message.includes("blast") ||
      message.includes("fatal") ||
      message.includes("death") ||
      message.includes("unconscious")
    ) {
      return {
        level: "CRITICAL",
        score: 95,
        response:
          "CRITICAL RISK DETECTED. Stop work immediately. Keep people away from the danger area. Follow your approved emergency procedures and contact the designated site emergency team or responsible supervisor immediately. Do not restart affected equipment until authorized inspection and corrective actions are complete.",
      };
    }

    // GAS LEAK
    if (
      message.includes("gas leak") ||
      message.includes("gas") ||
      message.includes("leak") ||
      message.includes("smell")
    ) {
      return {
        level: "HIGH",
        score: 85,
        response:
          "HIGH RISK: Possible gas or leak hazard detected. Avoid ignition sources, do not operate equipment unless safe to do so, move people according to site procedures, isolate the area if authorized, and notify the emergency response team and supervisor.",
      };
    }

    // MACHINE
    if (
      message.includes("machine") ||
      message.includes("equipment") ||
      message.includes("motor") ||
      message.includes("pump") ||
      message.includes("compressor") ||
      message.includes("vibration")
    ) {
      return {
        level: "HIGH",
        score: 75,
        response:
          "HIGH RISK MACHINE CONDITION DETECTED. Do not bypass guards or safety systems. If the condition indicates imminent danger, stop or isolate the equipment only according to your approved lockout and site procedures. Notify maintenance and the responsible supervisor. The machine should not return to service until inspection, corrective action, and authorized release are complete.",
      };
    }

    // ELECTRICAL
    if (
      message.includes("electric") ||
      message.includes("electrical") ||
      message.includes("shock") ||
      message.includes("wire") ||
      message.includes("spark")
    ) {
      return {
        level: "HIGH",
        score: 80,
        response:
          "HIGH ELECTRICAL RISK DETECTED. Keep unauthorized people away, do not touch exposed conductors, and follow approved electrical isolation procedures. Notify a qualified electrical technician and the responsible supervisor.",
      };
    }

    // FALL
    if (
      message.includes("fall") ||
      message.includes("height") ||
      message.includes("ladder") ||
      message.includes("scaffold")
    ) {
      return {
        level: "HIGH",
        score: 70,
        response:
          "HIGH FALL RISK DETECTED. Stop the unsafe activity, secure the area, inspect fall protection and access equipment, and continue only when the hazard has been corrected and approved under site procedures.",
      };
    }

    // CHEMICAL
    if (
      message.includes("chemical") ||
      message.includes("acid") ||
      message.includes("chemical spill") ||
      message.includes("toxic")
    ) {
      return {
        level: "HIGH",
        score: 82,
        response:
          "HIGH CHEMICAL HAZARD DETECTED. Keep people away from the affected area, use the correct site emergency and spill response procedures, check the applicable safety information, and notify trained responders.",
      };
    }

    // INJURY
    if (
      message.includes("injury") ||
      message.includes("hurt") ||
      message.includes("bleeding") ||
      message.includes("accident")
    ) {
      return {
        level: "HIGH",
        score: 78,
        response:
          "POTENTIAL SERIOUS INJURY RISK DETECTED. Make the area safe if you can do so without creating additional danger. Follow your site's emergency and medical response procedures and notify the responsible supervisor.",
      };
    }

    // NEAR MISS
    if (
      message.includes("near miss") ||
      message.includes("almost") ||
      message.includes("nearly")
    ) {
      return {
        level: "MEDIUM",
        score: 55,
        response:
          "NEAR-MISS EVENT DETECTED. Record what happened, identify the energy source or unsafe condition, preserve relevant evidence where appropriate, and report it for investigation before the same condition causes an injury.",
      };
    }

    // PPE
    if (
      message.includes("ppe") ||
      message.includes("helmet") ||
      message.includes("gloves") ||
      message.includes("safety shoes")
    ) {
      return {
        level: "MEDIUM",
        score: 45,
        response:
          "PPE SAFETY ISSUE DETECTED. Check the required personal protective equipment for this task and area. Do not continue the task without the PPE required by the approved site procedure.",
      };
    }

    // DEFAULT
    return {
      level: "LOW",
      score: 20,
      response:
        "I analyzed your message. Please give me more details about what happened, where it happened, what machine or equipment is involved, what unsafe condition you observed, and whether anyone is currently in immediate danger.",
    };
  }

  // -----------------------------
  // SEND MESSAGE
  // -----------------------------
  function sendMessage() {
    const text = input.trim();

    if (!text) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: text,
    };

    // ADD USER MESSAGE
    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setInput("");

    // AI RESPONSE AFTER SHORT DELAY
    setTimeout(() => {
      const analysis = analyzeSafety(text);

      const aiText =
        `SafetyAI Analysis\n\n` +
        `Risk Level: ${analysis.level}\n` +
        `Risk Score: ${analysis.score}/100\n\n` +
        `${analysis.response}`;

      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiText,
        risk: analysis.level,
      };

      // IMPORTANT: ADD NEW MESSAGE
      // DO NOT REPLACE OLD MESSAGES
      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);

      speakText(aiText);
    }, 500);
  }

  // -----------------------------
  // ENTER KEY
  // -----------------------------
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  // -----------------------------
  // VOICE TO TEXT
  // -----------------------------
  function startVoiceRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;

      setInput((previousText) => {
        if (previousText) {
          return previousText + " " + voiceText;
        }

        return voiceText;
      });
    };

    recognitionRef.current = recognition;

    recognition.start();
  }

  // -----------------------------
  // RESET CHAT
  // -----------------------------
  function resetChat() {
    window.speechSynthesis.cancel();

    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: "Chat reset successfully. Please tell me about the safety issue you want to analyze.",
      },
    ]);
  }

  return (
    <>
      {/* FLOATING BUTTON */}

      <button
        className="ai-chat-button"
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>

      {/* CHAT WINDOW */}

      {open && (
        <div className="ai-chat-window">

          {/* HEADER */}

          <div className="ai-chat-header">

            <div>
              <h3>🤖 SafetyAI Assistant</h3>

              <p>
                <span className="online-dot"></span>
                AI Safety Analysis Online
              </p>
            </div>

            <div className="header-buttons">

              <button
                onClick={() =>
                  setShowSettings(!showSettings)
                }
              >
                ⚙️
              </button>

              <button
                onClick={resetChat}
              >
                🔄
              </button>

              <button
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

            </div>

          </div>

          {/* SETTINGS */}

          {showSettings && (
            <div className="settings-panel">

              <label>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(event) =>
                    setVoiceEnabled(event.target.checked)
                  }
                />

                Enable AI Voice
              </label>

              <button
                className="reset-button"
                onClick={resetChat}
              >
                Reset Conversation
              </button>

            </div>
          )}

          {/* QUICK BUTTONS */}

          <div className="quick-actions">

            <button
              onClick={() =>
                setInput("There is a gas leak near the machine")
              }
            >
              Gas Leak
            </button>

            <button
              onClick={() =>
                setInput("There is a fire risk in the work area")
              }
            >
              Fire
            </button>

            <button
              onClick={() =>
                setInput("The machine has dangerous vibration")
              }
            >
              Machine
            </button>

            <button
              onClick={() =>
                setInput("A worker had a near miss")
              }
            >
              Near Miss
            </button>

          </div>

          {/* MESSAGES */}

          <div className="ai-messages">

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.sender === "user"
                    ? "message user-message"
                    : "message ai-message"
                }
              >

                <strong>
                  {message.sender === "user"
                    ? "YOU"
                    : "SAFETYAI"}
                </strong>

                <p>
                  {message.text}
                </p>

              </div>
            ))}

            <div ref={messagesEndRef}></div>

          </div>

          {/* INPUT */}

          <div className="ai-input-area">

            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Describe a safety issue..."
            />

            <button
              className={
                listening
                  ? "voice-button listening"
                  : "voice-button"
              }
              onClick={startVoiceRecognition}
            >
              🎤
            </button>

            <button
              className="send-button"
              onClick={sendMessage}
            >
              Send
            </button>

          </div>

        </div>
      )}
    </>
  );
}
