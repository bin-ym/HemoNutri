import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const Chatbot = ({ isOpen: initialOpen = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your nutrition assistant. How can I help you today?", sender: 'bot' },
  ]);
  const [userInput, setUserInput] = useState('');

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const newMessages = [...messages, { text: userInput, sender: 'user' }];
    setMessages(newMessages);
    setUserInput('');

    const botResponse = getBotResponse(userInput.toLowerCase());
    setTimeout(() => {
      setMessages((prev) => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 500);
  };

  const getBotResponse = (input) => {
    const now = new Date();
    const hour = now.getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    // Helper to check if input contains any keyword
    const containsKeyword = (keyword) => input.includes(keyword);

    // Greeting responses
    if (containsKeyword('hello') || containsKeyword('hi') || containsKeyword('hey')) {
      return `${timeGreeting}! How can I assist you with your nutrition today?`;
    }

    // Food logs
    if (containsKeyword('food log') || containsKeyword('logs') || containsKeyword('food')) {
      return 'You can view your food logs by clicking "View All Logs" on your dashboard. Want to log a new meal?';
    }

    // Meal plans
    if (containsKeyword('meal plan') || containsKeyword('plans') || containsKeyword('menu')) {
      return 'Check your meal plans under the "Meal Plans" section! Need help with a specific diet?';
    }

    // Goals
    if (containsKeyword('goal') || containsKeyword('target')) {
      return 'Goal setting is coming soon. For now, I can help you with food logs or meal plans. What would you like to do?';
    }

    // Messages
    if (containsKeyword('message') || containsKeyword('chat') || containsKeyword('inbox')) {
      return 'You can view your messages by clicking "View Messages" on your dashboard. Want to send a message to your provider?';
    }

    // Nutritional advice
    if (containsKeyword('what should i eat') || containsKeyword('diet') || containsKeyword('food advice')) {
      return 'For a balanced diet, include a variety of fruits, vegetables, lean proteins, and whole grains. Avoid processed foods high in sugar or sodium. Would you like tips for a specific meal?';
    }

    if (containsKeyword('breakfast')) {
      return 'For breakfast, try oatmeal with berries and a handful of nuts. It’s rich in fiber and healthy fats! Want ideas for lunch?';
    }

    if (containsKeyword('lunch')) {
      return 'A good lunch option is a grilled chicken salad with lots of greens, avocado, and a light vinaigrette. Need a dinner suggestion?';
    }

    if (containsKeyword('dinner')) {
      return 'For dinner, consider baked salmon with quinoa and steamed broccoli. It’s packed with omega-3s and nutrients! Want a snack idea?';
    }

    if (containsKeyword('snack')) {
      return 'A healthy snack could be Greek yogurt with a drizzle of honey and some almonds. Need more ideas?';
    }

    // Hydration advice
    if (containsKeyword('water') || containsKeyword('hydration') || containsKeyword('drink')) {
      return 'Aim to drink at least 8 glasses of water a day (about 2 liters). If you’re active, you might need more! Have you logged your water intake today?';
    }

    // Help
    if (containsKeyword('help') || containsKeyword('what can you do')) {
      return 'I can help with food logs, meal plans, messages, or give nutritional advice. Try asking about "food logs," "meal plans," or "what should I eat?"';
    }

    // Navigation suggestions
    if (containsKeyword('dashboard') || containsKeyword('home')) {
      return 'You’re already on your dashboard! From here, you can access Food Logs, Messages, or set Goals (coming soon). What would you like to explore?';
    }

    // Fallback for unrecognized input
    return 'Sorry, I didn’t quite understand that. I can help with food logs, meal plans, messages, or nutritional advice. What would you like to talk about?';
  };

  return (
    <div className="fixed z-50 bottom-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 text-white bg-teal-600 rounded-full shadow-lg hover:bg-teal-700 focus:outline-none"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="p-4 mt-2 bg-white border border-teal-200 rounded-lg shadow-xl w-80 h-96 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-teal-600">Nutrition Chatbot</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="h-64 p-2 mb-4 overflow-y-auto rounded bg-teal-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === 'user' ? 'bg-teal-200' : 'bg-white'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;