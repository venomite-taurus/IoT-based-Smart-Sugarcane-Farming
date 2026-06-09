import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Smart Sugarcane Assistant. Ask me about ideal parameters for cultivation in India.", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');

    // Process bot response
    setTimeout(() => {
      const response = generateResponse(userMessage.toLowerCase());
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 600);
  };

  const generateResponse = (msg) => {
    if (msg.includes('temperature')) {
      return "The ideal temperature for sugarcane cultivation in India is generally between 20°C and 35°C. During active growth, warm conditions are needed, while ripening requires cooler temperatures around 12°C to 14°C.";
    } else if (msg.includes('humidity')) {
      return "Sugarcane prefers high relative humidity (70% to 85%) during its vegetative growth phase. However, during the ripening phase, lower humidity (50% to 55%) is ideal to facilitate sugar accumulation.";
    } else if (msg.includes('soil') || msg.includes('moisture')) {
      return "Soil moisture should ideally be maintained between 60% and 80% of field capacity. Consistent moisture is crucial during the growing phase, but a relatively dry period is desirable during ripening to improve sucrose content. Proper drainage is essential to avoid waterlogging.";
    } else if (msg.includes('parameter') || msg.includes('ideal')) {
      return "For sugarcane in India, ideal parameters are: Temperature: 20-35°C, Humidity: 70-85% (growth), Soil Moisture: 60-80%. Which specific parameter would you like to know more about?";
    } else {
      return "I can help with ideal parameters for sugarcane! Ask me about temperature, humidity, or soil moisture.";
    }
  };

  return (
    <div className="chatbot-wrapper">
      <button 
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </button>

      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div>
            <h4>Sugarcane Assistant</h4>
            <span className="status-dot"></span> Online
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask about temperature, humidity..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
