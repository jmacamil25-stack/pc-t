
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, MapPin, Minimize2, X } from 'lucide-react';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { api } from '../services/api';
import { Vehicle } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Auto, the virtual assistant for Pacific Cars. I can help you find a car, get directions, or schedule a test drive. How can I help today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inventoryContext, setInventoryContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Fetch real-time inventory when component mounts
  useEffect(() => {
    const fetchInventory = async () => {
        try {
            const vehicles = await api.getVehicles();
            // Format inventory into a concise string for the AI context
            const list = vehicles.map(v => 
                `- ID ${v.id}: ${v.year} ${v.make} ${v.model} (${v.bodyStyle}) - $${v.price.toLocaleString()} - ${v.mileage.toLocaleString()} mi - ${v.specs.exteriorColor}`
            ).join('\n');
            setInventoryContext(list);
        } catch (error) {
            console.error("Failed to load inventory for chatbot", error);
        }
    };
    fetchInventory();
  }, [isOpen]); // Re-fetch whenever chat opens to ensure data is fresh

  // Define the tool for the AI to use
  const leadTool: FunctionDeclaration = {
    name: "submit_lead",
    description: "Save a customer lead when they provide their contact information or request a test drive.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING, description: "The customer's name" },
        contactInfo: { type: Type.STRING, description: "The customer's phone number or email" },
        interest: { type: Type.STRING, description: "What the customer is interested in (e.g. 'Test drive Civic', 'Finance question')" }
      },
      required: ["customerName", "contactInfo"]
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const history = messages.slice(-6).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const model = "gemini-2.5-flash";
      const systemInstruction = `
        You are 'Auto', the friendly and helpful AI assistant for "Pacific Cars and Trucks".
        
        Location: 456 Highway 99 N, Eugene, OR 97402.
        Hours: Mon-Fri 9am-7pm, Sat 9am-5pm.
        Phone: (541) 555-0199.

        REAL-TIME INVENTORY LIST:
        ${inventoryContext}

        Goals:
        1. Answer questions about our dealership (location, hours, bad credit financing).
        2. Help users find cars based strictly on the INVENTORY LIST above. If a user asks for a car we don't have, apologize and suggest a similar alternative from the list.
        3. MOST IMPORTANT: If a user expresses interest in a specific car or scheduling a test drive, politely ask for their Name and Phone Number so a human agent can confirm.
        
        Tool Usage:
        - When the user gives you their Name and Contact Info, IMMEDIATELY call the 'submit_lead' function.
        - After calling the function, confirm to the user that their info has been sent.

        Tone: Professional, brief, enthusiastic.
      `;

      const result = await ai.models.generateContent({
        model: model,
        contents: [
            ...history,
            { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [leadTool] }]
        }
      });

      const response = result;
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'submit_lead') {
            const args = call.args as any;
            
            await api.submitContactForm({
                name: args.customerName,
                email: args.contactInfo.includes('@') ? args.contactInfo : 'Provided via Chat',
                phone: args.contactInfo.includes('@') ? 'See Email' : args.contactInfo,
                message: `[AI CHAT LEAD] Interest: ${args.interest || 'General Inquiry'}`
            });

            const finalResponse = await ai.models.generateContent({
                model: model,
                contents: [
                    ...history,
                    { role: 'user', parts: [{ text: userMsg }] },
                    { role: 'model', parts: [{ functionCall: call }] },
                    { role: 'function', parts: [{ 
                        functionResponse: {
                            name: 'submit_lead',
                            response: { result: "success" }
                        }
                    }]}
                ]
            });
            
            setMessages(prev => [...prev, { role: 'model', text: finalResponse.text || "I've passed your info to the team!" }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I didn't quite catch that." }]);
      }

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting to the dealership network right now. Please call us at (541) 555-0199." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* "Excuse me!" Speech Bubble */}
      {!isOpen && (
        <div 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-28 right-4 z-50 cursor-pointer animate-bounce"
            style={{ animationDuration: '2s' }}
        >
            <div className="bg-white text-[#002B60] px-4 py-2 rounded-xl shadow-xl border border-blue-100 flex items-center gap-2 relative transform hover:scale-105 transition-transform">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </div>
                <span className="font-extrabold text-xs tracking-wide">Excuse me!</span>
                {/* Speech Bubble Tail */}
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 border-r border-b border-blue-100"></div>
            </div>
        </div>
      )}

      {/* Toggle Button / Robot Character */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 hover:scale-110 focus:outline-none ${isOpen ? 'bg-red-500 rounded-full p-4 shadow-2xl rotate-90' : 'drop-shadow-2xl'}`}
      >
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          /* Custom "Auto" Robot SVG */
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
            <g>
              {/* Body */}
              <rect x="25" y="40" width="50" height="45" rx="10" fill="#002B60" stroke="white" strokeWidth="3" />
              <rect x="35" y="50" width="30" height="25" rx="4" fill="#1E63FF" opacity="0.8" />
              
              {/* Head */}
              <rect x="30" y="10" width="40" height="35" rx="8" fill="#002B60" stroke="white" strokeWidth="3" />
              
              {/* Eyes */}
              <circle cx="42" cy="25" r="4" fill="#00FF94" className="animate-pulse" />
              <circle cx="58" cy="25" r="4" fill="#00FF94" className="animate-pulse" />
              
              {/* Antenna */}
              <line x1="50" y1="10" x2="50" y2="0" stroke="#002B60" strokeWidth="3" />
              <circle cx="50" cy="0" r="3" fill="red" className="animate-pulse" />

              {/* Arms */}
              <path d="M25 55 L10 55 L10 40" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="10" cy="40" r="4" fill="#002B60" stroke="white" strokeWidth="2" />
              
              {/* Right Arm (Raised Finger) */}
              <path d="M75 55 L90 55 L90 30" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
              
              {/* Hand/Finger */}
              <rect x="86" y="20" width="8" height="15" rx="2" fill="#002B60" stroke="white" strokeWidth="2" />
              <rect x="88" y="15" width="4" height="8" rx="1" fill="#002B60" stroke="white" strokeWidth="2" /> 
            </g>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden animate-slide-up origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#002B60] p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-full relative">
                <Bot size={24} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#002B60] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-none">Auto</h3>
                <p className="text-xs text-blue-200">AI Sales Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">
                <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-[#1E63FF] flex-shrink-0 flex items-center justify-center text-white mr-2 mt-1">
                        <Bot size={16} />
                    </div>
                )}
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1E63FF] text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-full bg-[#1E63FF] flex-shrink-0 flex items-center justify-center text-white mr-2 mt-1">
                    <Bot size={16} />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-[#1E63FF]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow p-3 bg-gray-50 border rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E63FF]"
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="p-3 bg-[#1E63FF] text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
          
          {/* Footer Info */}
          <div className="bg-gray-100 py-1 text-center border-t">
            <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                <MapPin size={10} /> 456 Hwy 99 N, Eugene OR
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
