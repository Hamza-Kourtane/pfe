import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AIChatbot.css";

function AIChatbot() {
  const navigate = useNavigate();

  // Opens and closes the chatbot
  const [isOpen, setIsOpen] = useState(false);

  // Stores all chat messages
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello 👋 Tell me what you're feeling and I can recommend a doctor.",
      doctors: []
    }
  ]);

  // Stores what the user is typing
  const [input, setInput] = useState("");

  // Loading state while waiting for reply
  const [isLoading, setIsLoading] = useState(false);

  // Auto-scroll to the latest message
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Takes the user to the doctor list page filtered by specialty
  const handleDoctorClick = (doctor) => {
    const specialty = doctor.specialty || "";
    navigate(`/doctorlist?specialist=${encodeURIComponent(specialty)}`);
  };

  // Runs when the Send button is clicked
  const sendMessage = async () => {

    // Don't send empty messages
    if (input.trim() === "") return;

    // Save the user's message before clearing the input
    const userMessage = input;

    // Show the user's message immediately
    setMessages(current => [
      ...current,
      { sender: "user", text: userMessage, doctors: [] }
    ]);

    // Clear the input
    setInput("");

    // Show loading indicator
    setIsLoading(true);

    try {

      // Send the message to backend
      const response = await fetch("http://localhost:5000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      // Add AI's reply to the chat
      setMessages(current => [
        ...current,
        {
          sender: "ai",
          text: data.reply || "Sorry, I couldn't answer right now.",
          doctors: data.doctors || []
        }
      ]);

    } catch (error) {

      console.error(error);

      setMessages(current => [
        ...current,
        {
          sender: "ai",
          text: "Sorry, I couldn't answer right now.",
          doctors: []
        }
      ]);

    } finally {
      setIsLoading(false);
    }

  };

  return (
    <>
      {/* Floating chat button */}
      <button
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <span>🤖 Doctori AI</span>
            <button className="chat-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-body">

            {messages.map((message, index) => (
              <div key={index}>

                {/* Message bubble */}
                <div
                  className={
                    message.sender === "ai"
                      ? "ai-message"
                      : "user-message"
                  }
                >
                  {message.text}
                </div>

                {/* Doctor cards shown below AI messages */}
                {message.sender === "ai" && message.doctors && message.doctors.length > 0 && (
                  <div className="doctor-recommendations">
                    <p className="recommend-title">Here are doctors you can book:</p>
                    {message.doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="recommend-doctor-card"
                        onClick={() => handleDoctorClick(doc)}
                      >
                        <div className="rec-avatar">
                          {doc.name ? doc.name.charAt(0).toUpperCase() : "D"}
                        </div>
                        <div className="rec-info">
                          <p className="rec-name">Dr. {doc.name}</p>
                          <p className="rec-spec">{doc.specialty}</p>
                          <p className="rec-loc">{doc.location || "Location not set"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}

            {/* Loading dots */}
            {isLoading && (
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={chatEndRef} />

          </div>

          {/* Input */}
          <div className="chat-footer">

            <input
              type="text"
              placeholder="Type your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage} disabled={isLoading}>
              Send
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default AIChatbot;
