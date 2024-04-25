import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_API_KEY;
const systemMessageEN = {
  "role": "system", "content": "Reply disrespectfully"
}

const systemMessageKR = {
  "role": "system", "content": "불친절 하게 답해"
}

function App() {
  const [language, setLanguage] = useState("kr")
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "내가 그만 찾아오라고 했자나!",
      sentTime: "just now",
      sender: "ChatGPT",  
      direction: "incoming"
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);
    setIsTyping(true);
    await processMessage(newMessages);
  };

  async function processMessage(chatMessages) {
    const userMessage = chatMessages[chatMessages.length - 1].message;
  
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        ( language === "en" ? systemMessageEN : systemMessageKR ),
        { role: "user", content: userMessage }
      ]
    };
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data: " + response.statusText);
      }
  
      const responseData = await response.json();
      const assistantMessage = responseData.choices[0].message.content;
  
      setMessages(prevMessages => [
        ...prevMessages,
        { message: assistantMessage, sender: "ChatGPT", direction: "incoming", sentTime: "just now" }
      ]);
      setIsTyping(false);
    } catch (error) {
      setIsTyping(false);
    }
  }

  return (
    <div className="App">
      <div className="chatbox-container">
        <MainContainer className='border-radius'>
          <ChatContainer className="chat-top-btm">       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={
                isTyping ? 
                  language === "en" ? 
                  <TypingIndicator content="ChatGPT is typing" /> : 
                  <TypingIndicator content="귀찮지만 글 작성중" />
                : null}
            >
              { messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message}/>
              })}
            </MessageList>
            { language === "en" ? 
              <MessageInput placeholder="Type message here" onSend={handleSend} /> :
              <MessageInput placeholder="메세지 작성" onSend={handleSend} />
            }     
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App