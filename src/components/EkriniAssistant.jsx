// components/EkriniAssistant.jsx
import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import axios from 'axios';

const EkriniAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: "Bonjour! Je suis l'assistant virtuel d'Ekrini.tn. Je peux vous aider avec les locations d'équipements, les paiements, les réservations et plus encore. Comment puis-je vous aider aujourd'hui?",
          sender: 'bot'
        }
      ]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call DeepSeek API (hidden from user)
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat',
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Vous êtes un assistant virtuel pour Ekrini.tn, une plateforme de location d'équipements. 
              Répondez en français de manière professionnelle et utile. 
              Informations sur Ekrini:
              - Services: Location d'équipements, gestion des réservations, paiements sécurisés
              - Acteurs: Clients, Bailleurs, Partenaires, Administrateurs
              - Fonctionnalités: Paiement sécurisé, gestion des locations, système de réservation
              Ne mentionnez jamais que vous utilisez DeepSeek.`
            },
            {
              role: "user",
              content: inputValue
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`
          }
        }
      );

      const botResponse = {
        id: messages.length + 2,
        text: response.data.choices[0].message.content,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error calling AI API:", error);
      const errorResponse = {
        id: messages.length + 2,
        text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer ou contacter notre support à support@ekrini.tn",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 transform transition-all duration-300">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Assistant Ekrini</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Fermer l'assistant"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs p-3 rounded-lg ${message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Message input"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              disabled={isTyping || inputValue.trim() === ''}
              aria-label="Envoyer le message"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Ouvrir l'assistant"
        >
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default EkriniAssistant;