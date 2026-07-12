import { useState } from "react";
import "./AIChatbot.css";

function AIChatbot() {

  // Opens and closes the chatbot
  const [isOpen, setIsOpen] = useState(false);

  // Stores all chat messages
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello 👋 Tell me what you're feeling."
    }
  ]);

  // Stores what the user is typing
  const [input, setInput] = useState("");

  // Runs when the Send button is clicked
  // Runs when the Send button is clicked
const sendMessage = async () => {

  // Don't send empty messages
  if (input.trim() === "") return;

  // Save the user's message before clearing the input
  const userMessage = input;

  // Show the user's message immediately
  setMessages(currentMessages => [
    ...currentMessages,
    {
      sender: "user",
      text: userMessage
    }
  ]);

  // Clear the input
  setInput("");

  try {

    // Send the message to your backend
    const response = await fetch("http://localhost:5000/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage
      })
    });

    // Convert the backend response to JSON
    const data = await response.json();

    // Add Gemini's reply to the chat
    setMessages(currentMessages => [
      ...currentMessages,
      {
        sender: "ai",
        text: data.reply || data.error || "Sorry, I couldn't answer right now."
      }
    ]);

  } catch (error) {

    console.error(error);

    // If something goes wrong
    setMessages(currentMessages => [
      ...currentMessages,
      {
        sender: "ai",
        text: "Sorry, I couldn't answer right now."
      }
    ]);

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
            Doctori AI
          </div>

          {/* Messages */}
          <div className="chat-body">

            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === "ai"
                    ? "ai-message"
                    : "user-message"
                }
              >
                {message.text}
              </div>
            ))}

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

            <button onClick={sendMessage}>
              Send
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default AIChatbot;