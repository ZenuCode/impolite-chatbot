import { useState } from "react";
import "./App.css";

function App() {
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      sender: "ChatGPT",
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);
    setIsTyping(true);
    await processMessage(newMessages);
  };

  const processMessage = async (userMessage) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + import.meta.env.VITE_API_KEY,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [...userMessage],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data: " + response.statusText);
      }

      const responseData = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: responseData.choices[0].message.content,
        },
      ]);
    } catch (error) {
      console.error("Error while fetching data:", error);
    }
  };

  return (
    <>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <h3>{message.sender}</h3>
            <p>{message.message}</p>
          </div>
        ))}
        {isTyping && <p>Bot is typing...</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.target.input.value;
          if (input.trim() !== "") {
            handleSend(input);
            e.target.reset();
          }
        }}
      >
        <input
          type="text"
          name="input"
          placeholder="Type your message..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping}>
          Send
        </button>
      </form>
    </>
  );
}

export default App;
