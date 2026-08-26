import React, { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:5000/api/chat";

const LANGUAGES = {
  English: "en-IN",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Malayalam: "ml-IN",
  Kannada: "kn-IN",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: "Hello! I am your SIF Safety AI Assistant. You can type or use the microphone to describe a safety problem.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [language, setLanguage] = useState("English");
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  // AI SPEAK FUNCTION
  const speakText = (text) => {
    if (!voiceEnabled) return;

    if (!("speechSynthesis" in window)) {
      console.log("Speech synthesis is not supported");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = LANGUAGES[language] || "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // STOP AI VOICE
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // START VOICE RECOGNITION
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = LANGUAGES[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setInput((oldText) => {
        if (oldText.trim()) {
          return oldText + " " + transcript;
        }

        return transcript;
      });
    };

    recognition.onerror = (event) => {
      console.log("Voice recognition error:", event.error);

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access."
        );
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    const cleanMessage = input.trim();

    if (!cleanMessage || loading) return;

    stopSpeaking();

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: cleanMessage,
    };

    setMessages((oldMessages) => [...oldMessages, userMessage]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: cleanMessage,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend connection failed");
      }

      const data = await response.json();

      const aiReply =
        data.reply ||
        data.message ||
        data.response ||
        "I understood your safety report. Please provide the location, machine or equipment involved, and whether anyone is in immediate danger.";

      const aiMessage = {
        id: Date.now() + 1,
        role: "ai",
        text: aiReply,
      };

      setMessages((oldMessages) => [...oldMessages, aiMessage]);

      setTimeout(() => {
        speakText(aiReply);
      }, 200);
    } catch (error) {
      console.error(error);

      const fallbackReply =
        "I could not connect to the AI server. Please check that the backend is running on port 5000.";

      const errorMessage = {
        id: Date.now() + 2,
        role: "ai",
        text: fallbackReply,
      };

      setMessages((oldMessages) => [...oldMessages, errorMessage]);

      speakText(fallbackReply);
    } finally {
      setLoading(false);
    }
  };

  // PRESS ENTER TO SEND
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // RESET CHAT
  const resetChat = () => {
    stopSpeaking();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(error);
      }
    }

    setMessages([
      {
        id: Date.now(),
        role: "ai",
        text: "Chat has been reset. I am ready to help you report a safety hazard. You can type or use the microphone.",
      },
    ]);

    setInput("");
    setListening(false);
  };

  // HANDLE LANGUAGE CHANGE
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;

    setLanguage(newLanguage);

    stopSpeaking();
  };

  return (
    <>
      {/* FLOATING CHAT BUTTON */}

      {!isOpen && (
        <button
          className="ai-chat-button"
          onClick={() => setIsOpen(true)}
          title="Open AI Safety Chat"
        >
          🤖 AI SAFETY CHAT
        </button>
      )}

      {/* CHAT WINDOW */}

      {isOpen && (
        <div className="sif-chat-window">
          {/* HEADER */}

          <div className="sif-chat-header">
            <div className="chat-title">
              <div className="chat-icon">🤖</div>

              <div>
                <h3>SIF Safety AI</h3>

                <span>
                  {listening
                    ? "🎤 Listening..."
                    : loading
                    ? "🤖 AI is thinking..."
                    : "● AI Assistant Online"}
                </span>
              </div>
            </div>

            <div className="chat-header-buttons">
              <button
                onClick={resetChat}
                title="Reset Chat"
                className="header-icon-button"
              >
                🔄
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
                className="header-icon-button"
              >
                ⚙️
              </button>

              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                title="Close"
                className="header-icon-button close-button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SETTINGS */}

          {showSettings && (
            <div className="chat-settings">
              <div className="setting-row">
                <label>🌐 Language</label>

                <select
                  value={language}
                  onChange={handleLanguageChange}
                >
                  {Object.keys(LANGUAGES).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="setting-row">
                <label>🔊 AI Voice Reply</label>

                <button
                  className={
                    voiceEnabled
                      ? "voice-toggle active"
                      : "voice-toggle"
                  }
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);

                    if (voiceEnabled) {
                      stopSpeaking();
                    }
                  }}
                >
                  {voiceEnabled ? "ON" : "OFF"}
                </button>
              </div>

              <button
                className="stop-voice-button"
                onClick={stopSpeaking}
              >
                🔇 Stop AI Voice
              </button>

              <button
                className="reset-chat-button"
                onClick={resetChat}
              >
                🗑️ Reset Conversation
              </button>
            </div>
          )}

          {/* MESSAGES */}

          <div className="sif-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "message-row user-row"
                    : "message-row ai-row"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "chat-message user-message"
                      : "chat-message ai-message"
                  }
                >
                  <div className="message-label">
                    {message.role === "user" ? "YOU" : "AI"}
                  </div>

                  <div className="message-text">
                    {message.text}
                  </div>

                  {message.role === "ai" && (
                    <button
                      className="speak-message-button"
                      onClick={() => speakText(message.text)}
                      title="Speak this message"
                    >
                      🔊
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row ai-row">
                <div className="chat-message ai-message">
                  <div className="message-label">AI</div>

                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <div className="chat-input-area">
            <button
              className={
                listening
                  ? "microphone-button listening"
                  : "microphone-button"
              }
              onClick={startListening}
              title="Speak"
            >
              {listening ? "⏹" : "🎤"}
            </button>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                listening
                  ? "Listening... speak now"
                  : "Describe the safety problem..."
              }
              rows="1"
              disabled={loading}
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          <div className="voice-help">
            🎤 Click microphone → speak → your voice becomes text → click Send
          </div>
        </div>
      )}
    </>
  );
}
