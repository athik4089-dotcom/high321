import { useEffect, useRef, useState } from "react";

export default function VoiceAIChat() {
  // CHAT OPEN / CLOSE
  const [isOpen, setIsOpen] = useState(true);

  // CHAT MESSAGES
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I am your SafetyAI Voice Assistant. Describe a safety problem, near miss, machine risk, gas leak, fire hazard, or emergency.",
    },
  ]);

  // INPUT
  const [input, setInput] = useState("");

  // VOICE STATUS
  const [listening, setListening] = useState(false);

  // SETTINGS
  const [showSettings, setShowSettings] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // SPEECH RECOGNITION
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

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

      setInput((oldText) => {
        return oldText
          ? oldText + " " + voiceText
          : voiceText;
      });
    };

    recognitionRef.current = recognition;
  }, []);

  // AI RESPONSE
  function getAIResponse(text) {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("fire") ||
      lowerText.includes("smoke") ||
      lowerText.includes("explosion")
    ) {
      return "HIGH RISK: Possible fire or explosion hazard detected. Stop work if safe to do so. Isolate the area according to approved procedures, warn nearby personnel, and contact the responsible emergency team.";
    }

    if (
      lowerText.includes("gas") ||
      lowerText.includes("leak") ||
      lowerText.includes("chemical")
    ) {
      return "HIGH RISK: Possible gas or chemical leak detected. Avoid ignition sources, move people away from the affected area, follow approved site emergency procedures, and notify the safety manager immediately.";
    }

    if (
      lowerText.includes("machine") ||
      lowerText.includes("equipment") ||
      lowerText.includes("motor") ||
      lowerText.includes("pump")
    ) {
      return "MACHINE RISK DETECTED: Inspect the equipment before continued operation. If there is an immediate serious hazard, use the approved stop or isolation procedure and keep the machine out of service until an authorized inspection and repair is completed.";
    }

    if (
      lowerText.includes("injury") ||
      lowerText.includes("hurt") ||
      lowerText.includes("bleeding") ||
      lowerText.includes("person")
    ) {
      return "PERSONAL SAFETY RISK: Check whether anyone is in immediate danger. Follow your site's emergency and first-aid procedures and contact the responsible emergency personnel.";
    }

    if (
      lowerText.includes("near miss") ||
      lowerText.includes("almost")
    ) {
      return "NEAR-MISS DETECTED: Please record what happened, where it happened, which equipment was involved, and what could have caused a serious injury or fatality. The event should be reviewed for corrective actions.";
    }

    if (
      lowerText.includes("emergency") ||
      lowerText.includes("help")
    ) {
      return "EMERGENCY ALERT: If there is immediate danger, follow your approved emergency response procedure and contact your site's emergency contacts now. Do not rely only on this chat for emergency response.";
    }

    return `SafetyAI received your report: "${text}". I recommend checking the location, identifying the hazard, identifying affected equipment, assessing the potential severity, and notifying the responsible supervisor if the risk is significant.`;
  }

  // SPEAK TEXT
  function speakText(text) {
    if (!("speechSynthesis" in window)) {
      alert("Voice output is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  }

  // SEND MESSAGE
  function sendMessage() {
    const cleanText = input.trim();

    if (!cleanText) {
      return;
    }

    const userMessage = {
      role: "user",
      text: cleanText,
    };

    const aiResponseText = getAIResponse(cleanText);

    const aiMessage = {
      role: "ai",
      text: aiResponseText,
    };

    setMessages((oldMessages) => [
      ...oldMessages,
      userMessage,
      aiMessage,
    ]);

    setInput("");

    if (autoSpeak) {
      setTimeout(() => {
        speakText(aiResponseText);
      }, 300);
    }
  }

  // START MICROPHONE
  function startVoice() {
    if (!recognitionRef.current) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.log(error);
    }
  }

  // RESET CHAT
  function resetChat() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setMessages([
      {
        role: "ai",
        text: "Chat reset successfully. Please describe the new safety issue.",
      },
    ]);

    setInput("");
    setShowSettings(false);
  }

  // ENTER KEY
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  // CLOSE CHAT - SHOW SMALL BUTTON
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          right: "25px",
          bottom: "25px",
          background: "#0284c7",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "15px 22px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        🤖 AI Chat
      </button>
    );
  }

  // MAIN CHAT
  return (
    <div
      style={{
        position: "fixed",
        right: "25px",
        bottom: "25px",
        width: "420px",
        maxWidth: "90vw",
        height: "600px",
        maxHeight: "80vh",
        background: "#1f2937",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        zIndex: 9999,
        border: "1px solid #475569",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "18px",
          background: "#334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            🤖 SafetyAI Voice Assistant
          </div>

          <div
            style={{
              color: "#86efac",
              fontSize: "12px",
              marginTop: "4px",
            }}
          >
            ● AI Safety Analysis Online
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {/* SETTINGS BUTTON */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: "#475569",
              border: "none",
              color: "white",
              padding: "9px 11px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "17px",
            }}
            title="Settings"
          >
            ⚙️
          </button>

          {/* RESET BUTTON */}
          <button
            onClick={resetChat}
            style={{
              background: "#475569",
              border: "none",
              color: "white",
              padding: "9px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "#dc2626",
              border: "none",
              color: "white",
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "bold",
            }}
            title="Close Chat"
          >
            ×
          </button>
        </div>
      </div>

      {/* SETTINGS */}
      {showSettings && (
        <div
          style={{
            background: "#374151",
            color: "white",
            padding: "15px",
            borderBottom: "1px solid #475569",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            ⚙️ Voice Settings
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(event) =>
                setAutoSpeak(event.target.checked)
              }
            />

            Automatically speak AI responses
          </label>

          <button
            onClick={() => {
              if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            }}
            style={{
              marginTop: "12px",
              background: "#64748b",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "7px",
              cursor: "pointer",
            }}
          >
            🔇 Stop Voice
          </button>
        </div>
      )}

      {/* MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          background: "#111827",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent:
                message.role === "user"
                  ? "flex-end"
                  : "flex-start",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "14px",
                borderRadius: "15px",
                color: "white",
                lineHeight: "1.5",
                background:
                  message.role === "user"
                    ? "#0284c7"
                    : "#374151",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  opacity: 0.8,
                }}
              >
                {message.role === "user"
                  ? "YOU"
                  : "SAFETYAI"}
              </div>

              {message.text}

              {message.role === "ai" && (
                <button
                  onClick={() => speakText(message.text)}
                  style={{
                    display: "block",
                    marginTop: "10px",
                    background: "#475569",
                    border: "none",
                    color: "white",
                    padding: "7px 10px",
                    borderRadius: "7px",
                    cursor: "pointer",
                  }}
                >
                  🔊 Speak
                </button>
              )}
            </div>
          </div>
        ))}

        {listening && (
          <div
            style={{
              color: "#22c55e",
              textAlign: "center",
              padding: "10px",
            }}
          >
            🎤 Listening...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div
        style={{
          padding: "12px",
          background: "#1e293b",
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Describe a safety problem..."
          style={{
            flex: 1,
            padding: "13px",
            borderRadius: "10px",
            border: "1px solid #64748b",
            outline: "none",
            fontSize: "14px",
          }}
        />

        {/* MICROPHONE */}
        <button
          onClick={startVoice}
          style={{
            background: listening
              ? "#dc2626"
              : "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "0 14px",
            cursor: "pointer",
            fontSize: "18px",
          }}
          title="Voice Input"
        >
          🎤
        </button>

        {/* SEND */}
        <button
          onClick={sendMessage}
          style={{
            background: "#0284c7",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "0 16px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
